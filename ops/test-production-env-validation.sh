#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
VALIDATOR="$SCRIPT_DIR/validate-production-env.sh"
SOURCE_ENV="$REPO_DIR/deploy/jong-poi/app.env.example"
TEST_DIR="$(mktemp -d "${TMPDIR:-/tmp}/jong-poi-production-env-test.XXXXXX")"

cleanup() {
    rm -rf "$TEST_DIR"
}
trap cleanup EXIT INT TERM

safe_env="$TEST_DIR/safe.env"
cp "$SOURCE_ENV" "$safe_env"
"$VALIDATOR" "$safe_env" >/dev/null

debug_env="$TEST_DIR/debug.env"
sed 's/^LOG_LEVEL=.*/LOG_LEVEL=debug/' "$SOURCE_ENV" > "$debug_env"
if "$VALIDATOR" "$debug_env" >/dev/null 2>&1; then
    echo 'Production validation accepted LOG_LEVEL=debug' >&2
    exit 1
fi

http_env="$TEST_DIR/http.env"
sed 's/^APP_FORCE_HTTPS=.*/APP_FORCE_HTTPS=false/' "$SOURCE_ENV" > "$http_env"
if "$VALIDATOR" "$http_env" >/dev/null 2>&1; then
    echo 'Production validation accepted APP_FORCE_HTTPS=false' >&2
    exit 1
fi

echo 'Production environment validation checks passed.'
