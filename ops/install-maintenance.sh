#!/usr/bin/env bash

set -euo pipefail

if [[ $EUID -ne 0 ]]; then
    echo 'Run this script as root.' >&2
    exit 64
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SYSTEMD_DIR="$SCRIPT_DIR/../deploy/systemd"

units=(
    jong-poi-backup.service
    jong-poi-backup.timer
    jong-poi-restore-check.service
    jong-poi-restore-check.timer
)

for unit in "${units[@]}"; do
    install -o root -g root -m 644 "$SYSTEMD_DIR/$unit" "/etc/systemd/system/$unit"
done

systemctl daemon-reload
systemctl enable --now jong-poi-backup.timer jong-poi-restore-check.timer
systemctl list-timers --all --no-pager jong-poi-backup.timer jong-poi-restore-check.timer
