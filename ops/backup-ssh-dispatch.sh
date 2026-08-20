#!/usr/bin/env bash

set -euo pipefail

readonly ROOT_RUNNER=/usr/local/sbin/jong-poi-backup-root
readonly ORIGINAL_COMMAND="${SSH_ORIGINAL_COMMAND:-}"

if [[ "$ORIGINAL_COMMAND" == 'backup-export' ]]; then
    printf 'backup-export\n' | sudo -n "$ROOT_RUNNER"
    exit $?
fi

printf 'Denied: only "backup-export" is allowed.\n' >&2
exit 64
