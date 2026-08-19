#!/usr/bin/env bash

set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
    echo "Run this script as root" >&2
    exit 1
fi

APP_DIR="${APP_DIR:-/opt/apps/jong-poi}"
GATEWAY_DIR="${GATEWAY_DIR:-/opt/gateway}"

install -d -m 750 "$APP_DIR" "$GATEWAY_DIR"
install -d -m 770 -o 33 -g 33 "$APP_DIR/storage"
install -d -m 755 -o 33 -g 33 "$APP_DIR/storage/public"
install -d -m 750 "$APP_DIR/database" "$APP_DIR/backups"

if ! docker network inspect proxy >/dev/null 2>&1; then
    docker network create proxy >/dev/null
fi

echo "Host directories and proxy network are ready."
