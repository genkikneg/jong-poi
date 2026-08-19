#!/usr/bin/env bash

set -euo pipefail

readonly APP_DEPLOY_DIR=/opt/apps/jong-poi
readonly DEPLOY_SCRIPT="$APP_DEPLOY_DIR/ops/deploy.sh"
readonly LOCK_FILE=/run/lock/jong-poi-deploy.lock

if [[ $# -ne 0 ]]; then
    echo 'This command does not accept arguments.' >&2
    exit 64
fi

IFS=' ' read -r action release_sha extra || true

if [[ "$action" != deploy || ! "$release_sha" =~ ^[0-9a-f]{40}$ || -n "${extra:-}" ]]; then
    echo 'Invalid deployment command.' >&2
    exit 64
fi

if [[ ! -x "$DEPLOY_SCRIPT" ]]; then
    echo "Deployment script is missing or not executable: $DEPLOY_SCRIPT" >&2
    exit 1
fi

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
    echo 'Another jong-poi deployment is already running.' >&2
    exit 75
fi

logger -t jong-poi-deploy "started release=$release_sha ssh_user=${SUDO_USER:-unknown}"

set +e
DEPLOY_DIR="$APP_DEPLOY_DIR" "$DEPLOY_SCRIPT" "$release_sha"
result=$?
set -e

if [[ $result -eq 0 ]]; then
    logger -t jong-poi-deploy "completed release=$release_sha ssh_user=${SUDO_USER:-unknown}"
else
    logger -t jong-poi-deploy "failed release=$release_sha exit=$result ssh_user=${SUDO_USER:-unknown}"
fi

exit "$result"
