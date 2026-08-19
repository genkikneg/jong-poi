#!/usr/bin/env bash

set -euo pipefail
umask 077

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
default_deploy_dir="$SCRIPT_DIR/../deploy/jong-poi"
if [[ -f "$SCRIPT_DIR/../compose.yaml" ]]; then
    default_deploy_dir="$SCRIPT_DIR/.."
fi
DEPLOY_DIR="${DEPLOY_DIR:-$default_deploy_dir}"
BACKUP_ROOT="${BACKUP_ROOT:-$DEPLOY_DIR/backups}"
STAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="$BACKUP_ROOT/$STAMP"

required_files=(.env db.env deploy.env compose.yaml)
for file in "${required_files[@]}"; do
    if [[ ! -f "$DEPLOY_DIR/$file" ]]; then
        echo "Required file is missing: $DEPLOY_DIR/$file" >&2
        exit 1
    fi
done

compose=(
    docker compose
    --project-directory "$DEPLOY_DIR"
    --file "$DEPLOY_DIR/compose.yaml"
    --env-file "$DEPLOY_DIR/.env"
    --env-file "$DEPLOY_DIR/db.env"
    --env-file "$DEPLOY_DIR/deploy.env"
)

"${compose[@]}" config --quiet
install -d -m 700 "$BACKUP_ROOT" "$BACKUP_DIR"

database_name="$("${compose[@]}" exec -T app printenv DB_DATABASE)"
if [[ -z "$database_name" || "$database_name" =~ [^A-Za-z0-9_-] ]]; then
    echo "Invalid database name" >&2
    exit 1
fi
printf '%s\n' "$database_name" > "$BACKUP_DIR/database-name.txt"

partial_dump="$BACKUP_DIR/database.sql.gz.part"
"${compose[@]}" exec -T -e TARGET_DB="$database_name" db sh -lc \
    'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --quick --routines --triggers --events --hex-blob --no-tablespaces --databases "$TARGET_DB" 2>/dev/null' \
    | gzip -9 > "$partial_dump"
test -s "$partial_dump"
mv "$partial_dump" "$BACKUP_DIR/database.sql.gz"

tar -C "$DEPLOY_DIR" -czf "$BACKUP_DIR/storage.tar.gz" storage
tar -C "$DEPLOY_DIR" -czf "$BACKUP_DIR/configuration.tar.gz" \
    .env db.env deploy.env compose.yaml

table_list="$("${compose[@]}" exec -T -e TARGET_DB="$database_name" db sh -lc \
    'mysql -N -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SELECT table_name FROM information_schema.tables WHERE table_schema = \"$TARGET_DB\" AND table_type = \"BASE TABLE\" ORDER BY table_name" 2>/dev/null')"

: > "$BACKUP_DIR/database-counts.tsv"
for table_name in $table_list; do
    if [[ "$table_name" =~ [^A-Za-z0-9_-] ]]; then
        echo "Invalid table name" >&2
        exit 1
    fi

    row_count="$("${compose[@]}" exec -T \
        -e TARGET_DB="$database_name" \
        -e TARGET_TABLE="$table_name" \
        db sh -lc \
        'mysql -N -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SELECT COUNT(*) FROM $TARGET_DB.$TARGET_TABLE" 2>/dev/null')"
    printf '%s\t%s\n' "$table_name" "$row_count" >> "$BACKUP_DIR/database-counts.tsv"
done

{
    printf 'created_at=%s\n' "$(date --iso-8601=seconds)"
    printf 'hostname=%s\n' "$(hostname)"
    "${compose[@]}" images
    "${compose[@]}" ps
} > "$BACKUP_DIR/runtime-info.txt"

find "$BACKUP_DIR" -maxdepth 1 -type f -printf '%f\t%s bytes\n' \
    | sort > "$BACKUP_DIR/manifest.txt"

(
    cd "$BACKUP_DIR"
    sha256sum \
        configuration.tar.gz \
        database-counts.tsv \
        database-name.txt \
        database.sql.gz \
        manifest.txt \
        runtime-info.txt \
        storage.tar.gz \
        > checksums.sha256
)

chmod 600 "$BACKUP_DIR"/*
printf 'Backup created: %s\n' "$BACKUP_DIR"
