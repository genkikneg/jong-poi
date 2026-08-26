#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 || ! "$1" =~ ^[0-9a-f]{40}$ ]]; then
    echo "Usage: $0 <40-character-git-commit-sha>" >&2
    exit 1
fi

release_sha="$1"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
default_deploy_dir="$SCRIPT_DIR/../deploy/jong-poi"
if [[ -f "$SCRIPT_DIR/../compose.yaml" ]]; then
    default_deploy_dir="$SCRIPT_DIR/.."
fi
DEPLOY_DIR="${DEPLOY_DIR:-$default_deploy_dir}"

required_files=(.env db.env deploy.env compose.yaml)
for file in "${required_files[@]}"; do
    if [[ ! -f "$DEPLOY_DIR/$file" ]]; then
        echo "Required file is missing: $DEPLOY_DIR/$file" >&2
        exit 1
    fi
done

"$SCRIPT_DIR/validate-production-env.sh" "$DEPLOY_DIR/.env"

compose=(
    docker compose
    --project-directory "$DEPLOY_DIR"
    --file "$DEPLOY_DIR/compose.yaml"
    --env-file "$DEPLOY_DIR/.env"
    --env-file "$DEPLOY_DIR/db.env"
    --env-file "$DEPLOY_DIR/deploy.env"
)

DEPLOY_DIR="$DEPLOY_DIR" "$SCRIPT_DIR/backup.sh"
cp -p "$DEPLOY_DIR/deploy.env" "$DEPLOY_DIR/deploy.env.previous"

next_deploy_env="$(mktemp "$DEPLOY_DIR/deploy.env.XXXXXX")"
trap 'rm -f "$next_deploy_env"' EXIT
sed -E \
    -e "s|^APP_IMAGE=.*$|APP_IMAGE=ghcr.io/genkikneg/jong-poi-app:$release_sha|" \
    -e "s|^WEB_IMAGE=.*$|WEB_IMAGE=ghcr.io/genkikneg/jong-poi-web:$release_sha|" \
    "$DEPLOY_DIR/deploy.env" > "$next_deploy_env"
chmod 600 "$next_deploy_env"
mv "$next_deploy_env" "$DEPLOY_DIR/deploy.env"
trap - EXIT

compose=(
    docker compose
    --project-directory "$DEPLOY_DIR"
    --file "$DEPLOY_DIR/compose.yaml"
    --env-file "$DEPLOY_DIR/.env"
    --env-file "$DEPLOY_DIR/db.env"
    --env-file "$DEPLOY_DIR/deploy.env"
)

"${compose[@]}" config --quiet
"${compose[@]}" pull app queue jong-poi-web
"${compose[@]}" up -d db

database_ready=no
for _ in $(seq 1 60); do
    if "${compose[@]}" exec -T db sh -lc \
        'mysqladmin ping -h 127.0.0.1 -uroot -p"$MYSQL_ROOT_PASSWORD" --silent' \
        >/dev/null 2>&1; then
        database_ready=yes
        break
    fi
    sleep 2
done
test "$database_ready" = yes

"${compose[@]}" run --rm app php artisan migrate --force
"${compose[@]}" up -d app jong-poi-web

web_ready=no
for _ in $(seq 1 60); do
    if "${compose[@]}" exec -T jong-poi-web \
        wget -q --spider http://127.0.0.1:8080/up >/dev/null 2>&1; then
        web_ready=yes
        break
    fi
    sleep 2
done
test "$web_ready" = yes

public_ready=no
for _ in $(seq 1 30); do
    if curl --fail --silent --show-error --max-time 10 \
        "${HEALTHCHECK_URL:-https://jong-poi.misoon.net/up}" \
        >/dev/null 2>&1; then
        public_ready=yes
        break
    fi
    sleep 2
done
test "$public_ready" = yes

# A queue worker can need its full stop grace period to finish a job. Update it
# only after the public web path has recovered so that this wait does not extend
# application downtime.
"${compose[@]}" up -d queue scheduler
"${compose[@]}" up -d --remove-orphans

printf 'Deployment completed: %s\n' "$release_sha"
