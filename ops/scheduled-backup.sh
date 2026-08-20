#!/usr/bin/env bash

set -euo pipefail
umask 077

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/apps/jong-poi}"
BACKUP_ROOT="${BACKUP_ROOT:-$DEPLOY_DIR/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
LOCK_FILE="${LOCK_FILE:-/run/lock/jong-poi-deploy.lock}"

if [[ ! "$RETENTION_DAYS" =~ ^[0-9]+$ ]] || (( RETENTION_DAYS < 7 || RETENTION_DAYS > 365 )); then
    echo 'BACKUP_RETENTION_DAYS must be between 7 and 365.' >&2
    exit 64
fi

exec 9>"$LOCK_FILE"
if ! flock -w 1800 9; then
    echo 'Timed out waiting for the deployment lock.' >&2
    exit 75
fi

DEPLOY_DIR="$DEPLOY_DIR" BACKUP_ROOT="$BACKUP_ROOT" "$SCRIPT_DIR/backup.sh"

deleted=0
while IFS= read -r -d '' candidate; do
    backup_name="${candidate##*/}"
    if [[ ! "$backup_name" =~ ^[0-9]{8}_[0-9]{6}$ ]]; then
        continue
    fi

    rm -rf -- "$candidate"
    deleted=$((deleted + 1))
done < <(find "$BACKUP_ROOT" \
    -mindepth 1 \
    -maxdepth 1 \
    -type d \
    -mtime "+$RETENTION_DAYS" \
    -print0)

printf 'Backup retention completed: deleted=%s retention_days=%s\n' \
    "$deleted" "$RETENTION_DAYS"
