#!/usr/bin/env bash

set -euo pipefail

readonly ROOT_RUNNER=/usr/local/sbin/jong-poi-deploy-root
readonly ORIGINAL_COMMAND="${SSH_ORIGINAL_COMMAND:-}"

if [[ "$ORIGINAL_COMMAND" =~ ^deploy\ ([0-9a-f]{40})$ ]]; then
    printf 'deploy %s\n' "${BASH_REMATCH[1]}" | sudo -n "$ROOT_RUNNER"
    exit $?
fi

printf 'Denied: only "deploy <40-character-commit-sha>" is allowed.\n' >&2
exit 64
