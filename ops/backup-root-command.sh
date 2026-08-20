#!/usr/bin/env bash

set -euo pipefail

readonly APP_DEPLOY_DIR=/opt/apps/jong-poi
readonly EXPORT_SCRIPT="$APP_DEPLOY_DIR/ops/export-latest-backup.sh"
readonly LOCK_FILE=/run/lock/jong-poi-deploy.lock

if [[ $# -ne 0 ]]; then
    echo 'This command does not accept arguments.' >&2
    exit 64
fi

IFS=' ' read -r action extra || true
if [[ "$action" != 'backup-export' || -n "${extra:-}" ]]; then
    echo 'Invalid backup command.' >&2
    exit 64
fi

if [[ ! -x "$EXPORT_SCRIPT" ]]; then
    echo "Backup export script is missing or not executable: $EXPORT_SCRIPT" >&2
    exit 1
fi

exec 9>"$LOCK_FILE"
if ! flock -w 1800 9; then
    echo 'Timed out waiting for the deployment lock.' >&2
    exit 75
fi

logger -t jong-poi-backup-export "started ssh_user=${SUDO_USER:-unknown}"

set +e
DEPLOY_DIR="$APP_DEPLOY_DIR" "$EXPORT_SCRIPT"
result=$?
set -e

if [[ $result -eq 0 ]]; then
    logger -t jong-poi-backup-export "completed ssh_user=${SUDO_USER:-unknown}"
else
    logger -t jong-poi-backup-export \
        "failed exit=$result ssh_user=${SUDO_USER:-unknown}"
fi

exit "$result"
