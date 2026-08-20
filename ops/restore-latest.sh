#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/apps/jong-poi}"
BACKUP_ROOT="${BACKUP_ROOT:-$DEPLOY_DIR/backups}"
LOCK_FILE="${LOCK_FILE:-/run/lock/jong-poi-deploy.lock}"

exec 9>"$LOCK_FILE"
if ! flock -w 1800 9; then
    echo 'Timed out waiting for the deployment lock.' >&2
    exit 75
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

"$SCRIPT_DIR/restore-check.sh" "$latest_backup"
printf 'Latest backup restore verified: %s\n' "$latest_backup"
