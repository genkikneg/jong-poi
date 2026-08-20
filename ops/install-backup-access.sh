#!/usr/bin/env bash

set -euo pipefail

readonly BACKUP_USER=backup-export
readonly DISPATCH_COMMAND=/usr/local/bin/jong-poi-backup-dispatch
readonly ROOT_COMMAND=/usr/local/sbin/jong-poi-backup-root
readonly SUDOERS_FILE=/etc/sudoers.d/jong-poi-backup-export

if [[ $EUID -ne 0 || $# -ne 1 ]]; then
    echo "Usage: sudo $0 <backup-public-key-file>" >&2
    exit 64
fi

public_key_file="$1"
if [[ ! -f "$public_key_file" ]]; then
    echo "Public key file not found: $public_key_file" >&2
    exit 1
fi

read -r key_type key_body key_comment < "$public_key_file"
if [[ "$key_type" != ssh-ed25519 || ! "$key_body" =~ ^[A-Za-z0-9+/=]+$ ]]; then
    echo 'A valid ssh-ed25519 public key is required.' >&2
    exit 1
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
install -o root -g root -m 755 "$SCRIPT_DIR/backup-ssh-dispatch.sh" "$DISPATCH_COMMAND"
install -o root -g root -m 755 "$SCRIPT_DIR/backup-root-command.sh" "$ROOT_COMMAND"

if ! id "$BACKUP_USER" >/dev/null 2>&1; then
    useradd --create-home --shell /bin/bash "$BACKUP_USER"
fi
passwd --lock "$BACKUP_USER" >/dev/null

backup_groups="$(id -nG "$BACKUP_USER")"
if grep -Eq '(^| )(sudo|docker)( |$)' <<< "$backup_groups"; then
    echo "Refusing to continue: $BACKUP_USER must not belong to sudo or docker." >&2
    exit 1
fi

backup_home="$(getent passwd "$BACKUP_USER" | cut -d: -f6)"
install -d -o "$BACKUP_USER" -g "$BACKUP_USER" -m 700 "$backup_home/.ssh"

authorized_keys="$(mktemp "$backup_home/.ssh/authorized_keys.XXXXXX")"
sudoers_candidate="$(mktemp /etc/sudoers.d/jong-poi-backup-export.XXXXXX)"
cleanup() {
    rm -f "$authorized_keys" "$sudoers_candidate"
}
trap cleanup EXIT

printf 'restrict,command="%s" %s %s %s\n' \
    "$DISPATCH_COMMAND" "$key_type" "$key_body" "${key_comment:-github-actions-jong-poi-backup}" \
    > "$authorized_keys"
chown "$BACKUP_USER:$BACKUP_USER" "$authorized_keys"
chmod 600 "$authorized_keys"
mv "$authorized_keys" "$backup_home/.ssh/authorized_keys"

printf '%s ALL=(root) NOPASSWD: %s\n' "$BACKUP_USER" "$ROOT_COMMAND" \
    > "$sudoers_candidate"
chmod 440 "$sudoers_candidate"
visudo -cf "$sudoers_candidate" >/dev/null
mv "$sudoers_candidate" "$SUDOERS_FILE"
trap - EXIT

printf 'Restricted backup export access installed for user: %s\n' "$BACKUP_USER"
