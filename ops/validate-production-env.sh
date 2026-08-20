#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 || ! -f "$1" ]]; then
    echo "Usage: $0 <production-app-env-file>" >&2
    exit 64
fi

readonly env_file="$1"

require_setting() {
    local key="$1"
    local expected="$2"
    local count
    local actual

    count="$(grep -Ec "^${key}=" "$env_file" || true)"
    if [[ "$count" -ne 1 ]]; then
        echo "Production setting must occur exactly once: $key" >&2
        return 1
    fi

    actual="$(sed -n "s/^${key}=//p" "$env_file")"
    if [[ "$actual" != "$expected" ]]; then
        echo "Production setting has an unsafe value: $key" >&2
        return 1
    fi
}

require_setting APP_ENV production
require_setting APP_DEBUG false
require_setting SESSION_SECURE_COOKIE true

printf 'Production environment security settings are valid.\n'
