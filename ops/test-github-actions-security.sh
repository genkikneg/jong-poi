#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKFLOW_DIR="$REPO_DIR/.github/workflows"
CI_WORKFLOW="$WORKFLOW_DIR/ci.yml"

if grep -ERq '^[[:space:]]+(pull_request_target|issue_comment|repository_dispatch):' "$WORKFLOW_DIR"; then
    echo 'A privileged or externally triggerable workflow event is not allowed.' >&2
    exit 1
fi

while IFS= read -r action; do
    if [[ "$action" == ./* ]]; then
        continue
    fi

    if [[ ! "$action" =~ @[0-9a-f]{40}$ ]]; then
        printf 'Action is not pinned to a full commit SHA: %s\n' "$action" >&2
        exit 1
    fi
done < <(sed -nE 's/^[[:space:]]*uses:[[:space:]]*([^[:space:]#]+).*/\1/p' "$WORKFLOW_DIR"/*.yml)

awk '
/^jobs:/ {
    in_jobs = 1
    next
}

in_jobs && /^  [a-zA-Z0-9_-]+:$/ {
    job = $1
    sub(/:$/, "", job)
}

/packages:[[:space:]]+write/ {
    write_count++
    if (job != "publish") {
        print "packages: write is only allowed in the main-only publish job." > "/dev/stderr"
        exit 1
    }
}

END {
    if (write_count != 1) {
        print "Exactly one packages: write permission is required." > "/dev/stderr"
        exit 1
    }
}
' "$CI_WORKFLOW"

grep -Fq "if: github.event_name == 'push' && github.ref == 'refs/heads/main'" "$CI_WORKFLOW"

printf 'GitHub Actions security checks passed.\n'
