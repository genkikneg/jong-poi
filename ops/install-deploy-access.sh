#!/usr/bin/env bash

set -euo pipefail

readonly DEPLOY_USER=deploy
readonly DISPATCH_COMMAND=/usr/local/bin/jong-poi-deploy-dispatch
readonly ROOT_COMMAND=/usr/local/sbin/jong-poi-deploy-root
readonly SUDOERS_FILE=/etc/sudoers.d/jong-poi-deploy

if [[ $EUID -ne 0 || $# -ne 1 ]]; then
    echo "Usage: sudo $0 <deploy-public-key-file>" >&2
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
install -o root -g root -m 755 "$SCRIPT_DIR/deploy-ssh-dispatch.sh" "$DISPATCH_COMMAND"
install -o root -g root -m 755 "$SCRIPT_DIR/deploy-root-command.sh" "$ROOT_COMMAND"

if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
    useradd --create-home --shell /bin/bash "$DEPLOY_USER"
fi
passwd --lock "$DEPLOY_USER" >/dev/null

deploy_groups="$(id -nG "$DEPLOY_USER")"
if grep -Eq '(^| )(sudo|docker)( |$)' <<< "$deploy_groups"; then
    echo "Refusing to continue: $DEPLOY_USER must not belong to sudo or docker." >&2
    exit 1
fi

deploy_home="$(getent passwd "$DEPLOY_USER" | cut -d: -f6)"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 700 "$deploy_home/.ssh"

authorized_keys="$(mktemp "$deploy_home/.ssh/authorized_keys.XXXXXX")"
sudoers_candidate="$(mktemp /etc/sudoers.d/jong-poi-deploy.XXXXXX)"
cleanup() {
    rm -f "$authorized_keys" "$sudoers_candidate"
}
trap cleanup EXIT

printf 'restrict,command="%s" %s %s %s\n' \
    "$DISPATCH_COMMAND" "$key_type" "$key_body" "${key_comment:-github-actions-jong-poi}" \
    > "$authorized_keys"
chown "$DEPLOY_USER:$DEPLOY_USER" "$authorized_keys"
chmod 600 "$authorized_keys"
mv "$authorized_keys" "$deploy_home/.ssh/authorized_keys"

printf '%s ALL=(root) NOPASSWD: %s\n' "$DEPLOY_USER" "$ROOT_COMMAND" > "$sudoers_candidate"
chmod 440 "$sudoers_candidate"
visudo -cf "$sudoers_candidate" >/dev/null
mv "$sudoers_candidate" "$SUDOERS_FILE"
trap - EXIT

printf 'Restricted deployment access installed for user: %s\n' "$DEPLOY_USER"
