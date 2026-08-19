#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
    echo "Usage: $0 /absolute/path/to/backup" >&2
    exit 1
fi

BACKUP_DIR="$(cd -- "$1" && pwd)"
TEMP_CONTAINER="jong-poi-restore-check-$$"
MYSQL_IMAGE="${MYSQL_IMAGE:-mysql:8.0.45@sha256:4af1f8815716546f5b12410f7621f37f93db8dd11a184706ef59111930b8c2ff}"

cleanup() {
    docker rm -f -v "$TEMP_CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

required_files=(
    checksums.sha256
    database-counts.tsv
    database-name.txt
    database.sql.gz
)
for file in "${required_files[@]}"; do
    if [[ ! -f "$BACKUP_DIR/$file" ]]; then
        echo "Required file is missing: $BACKUP_DIR/$file" >&2
        exit 1
    fi
done

(
    cd "$BACKUP_DIR"
    sha256sum -c checksums.sha256
)
gzip -t "$BACKUP_DIR/database.sql.gz"

database_name="$(<"$BACKUP_DIR/database-name.txt")"
if [[ -z "$database_name" || "$database_name" =~ [^A-Za-z0-9_-] ]]; then
    echo "Invalid database name" >&2
    exit 1
fi

docker run -d \
    --name "$TEMP_CONTAINER" \
    --network none \
    --memory 512m \
    --memory-swap 1024m \
    -e MYSQL_ALLOW_EMPTY_PASSWORD=yes \
    "$MYSQL_IMAGE" \
    --performance-schema=OFF \
    --innodb-buffer-pool-size=64M \
    --key-buffer-size=8M \
    --table-open-cache=64 \
    --max-connections=20 \
    >/dev/null

initialized=no
for _ in $(seq 1 60); do
    if docker logs "$TEMP_CONTAINER" 2>&1 | grep -q "MySQL init process done"; then
        initialized=yes
        break
    fi
    sleep 2
done
test "$initialized" = yes

ready=no
for _ in $(seq 1 30); do
    if docker exec "$TEMP_CONTAINER" mysqladmin ping -uroot --silent >/dev/null 2>&1; then
        ready=yes
        break
    fi
    sleep 2
done
test "$ready" = yes

gzip -dc "$BACKUP_DIR/database.sql.gz" \
    | docker exec -i "$TEMP_CONTAINER" mysql -uroot

tables=0
total_rows=0
tab="$(printf '\t')"
while IFS="$tab" read -r table_name expected_rows; do
    if [[ "$table_name" =~ [^A-Za-z0-9_-] ]]; then
        echo "Invalid table name in count file" >&2
        exit 1
    fi

    check_status="$(docker exec \
        -e TARGET_DB="$database_name" \
        -e TARGET_TABLE="$table_name" \
        "$TEMP_CONTAINER" sh -lc \
        'mysql -N -uroot -e "CHECK TABLE $TARGET_DB.$TARGET_TABLE" | tail -n 1 | cut -f4')"
    test "$check_status" = OK

    actual_rows="$(docker exec \
        -e TARGET_DB="$database_name" \
        -e TARGET_TABLE="$table_name" \
        "$TEMP_CONTAINER" sh -lc \
        'mysql -N -uroot -e "SELECT COUNT(*) FROM $TARGET_DB.$TARGET_TABLE"')"

    if [[ "$actual_rows" != "$expected_rows" ]]; then
        printf 'Row count mismatch: table=%s expected=%s actual=%s\n' \
            "$table_name" "$expected_rows" "$actual_rows" >&2
        exit 1
    fi

    tables=$((tables + 1))
    total_rows=$((total_rows + actual_rows))
done < "$BACKUP_DIR/database-counts.tsv"

restored_tables="$(docker exec -e TARGET_DB="$database_name" \
    "$TEMP_CONTAINER" sh -lc \
    'mysql -N -uroot -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \"$TARGET_DB\" AND table_type = \"BASE TABLE\""')"
test "$restored_tables" = "$tables"

printf 'Restore check passed: tables=%s rows=%s\n' "$tables" "$total_rows"
