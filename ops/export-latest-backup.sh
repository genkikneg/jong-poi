#!/usr/bin/env bash

set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/apps/jong-poi}"
BACKUP_ROOT="${BACKUP_ROOT:-$DEPLOY_DIR/backups}"
MAX_AGE_SECONDS="${BACKUP_MAX_AGE_SECONDS:-43200}"

if [[ ! "$MAX_AGE_SECONDS" =~ ^[0-9]+$ ]] || (( MAX_AGE_SECONDS < 3600 )); then
    echo 'BACKUP_MAX_AGE_SECONDS must be at least 3600.' >&2
    exit 64
fi

latest_backup=''
for candidate in "$BACKUP_ROOT"/*; do
    [[ -d "$candidate" ]] || continue
    backup_name="${candidate##*/}"
    [[ "$backup_name" =~ ^[0-9]{8}_[0-9]{6}$ ]] || continue

    if [[ -z "$latest_backup" || "$candidate" > "$latest_backup" ]]; then
        latest_backup="$candidate"
    fi
done

if [[ -z "$latest_backup" ]]; then
    echo "No scheduled backup found in: $BACKUP_ROOT" >&2
    exit 1
fi

backup_mtime="$(stat -c %Y "$latest_backup")"
backup_age=$(( $(date +%s) - backup_mtime ))
if (( backup_age < 0 || backup_age > MAX_AGE_SECONDS )); then
    printf 'Latest backup is too old: path=%s age_seconds=%s\n' \
        "$latest_backup" "$backup_age" >&2
    exit 1
fi

(
    cd "$latest_backup"
    sha256sum -c checksums.sha256 >&2
)

backup_name="${latest_backup##*/}"
tar -C "$BACKUP_ROOT" -czf - "$backup_name"
