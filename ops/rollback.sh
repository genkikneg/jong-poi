#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
default_deploy_dir="$SCRIPT_DIR/../deploy/jong-poi"
if [[ -f "$SCRIPT_DIR/../compose.yaml" ]]; then
    default_deploy_dir="$SCRIPT_DIR/.."
fi
DEPLOY_DIR="${DEPLOY_DIR:-$default_deploy_dir}"
previous_env="$DEPLOY_DIR/deploy.env.previous"

if [[ ! -f "$previous_env" ]]; then
    echo "Previous release file is missing: $previous_env" >&2
    exit 1
fi

app_image="$(sed -n 's|^APP_IMAGE=ghcr.io/genkikneg/jong-poi-app:\([0-9a-f]\{40\}\)$|\1|p' "$previous_env")"
web_image="$(sed -n 's|^WEB_IMAGE=ghcr.io/genkikneg/jong-poi-web:\([0-9a-f]\{40\}\)$|\1|p' "$previous_env")"

if [[ -z "$app_image" || "$app_image" != "$web_image" ]]; then
    echo "Previous app and web images must use the same 40-character commit SHA" >&2
    exit 1
fi

DEPLOY_DIR="$DEPLOY_DIR" "$SCRIPT_DIR/deploy.sh" "$app_image"
printf 'Application rollback completed: %s\n' "$app_image"
printf 'Database schema was not rolled back.\n'
