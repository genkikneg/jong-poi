#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOY_DIR="$REPO_DIR/deploy/jong-poi"
TEST_DIR="$(mktemp -d "${TMPDIR:-/tmp}/jong-poi-container-security.XXXXXX")"

cleanup() {
    rm -rf "$TEST_DIR"
}
trap cleanup EXIT

cp "$DEPLOY_DIR/compose.yaml" "$TEST_DIR/compose.yaml"
cp "$DEPLOY_DIR/app.env.example" "$TEST_DIR/.env"
cp "$DEPLOY_DIR/db.env.example" "$TEST_DIR/db.env"
cp "$DEPLOY_DIR/deploy.env.example" "$TEST_DIR/deploy.env"

docker compose \
    --project-directory "$TEST_DIR" \
    --file "$TEST_DIR/compose.yaml" \
    --env-file "$TEST_DIR/.env" \
    --env-file "$TEST_DIR/db.env" \
    --env-file "$TEST_DIR/deploy.env" \
    config --format json > "$TEST_DIR/compose.json"

php -r '
$config = json_decode(file_get_contents($argv[1]), true, flags: JSON_THROW_ON_ERROR);

foreach (["app", "queue"] as $serviceName) {
    $service = $config["services"][$serviceName] ?? [];

    if (($service["user"] ?? null) !== "33:33") {
        fwrite(STDERR, sprintf("%s must run as UID:GID 33:33.\n", $serviceName));
        exit(1);
    }

    if (($service["read_only"] ?? false) !== true) {
        fwrite(STDERR, sprintf("%s must use a read-only root filesystem.\n", $serviceName));
        exit(1);
    }

    if (!in_array("no-new-privileges:true", $service["security_opt"] ?? [], true)) {
        fwrite(STDERR, sprintf("%s must prevent privilege escalation.\n", $serviceName));
        exit(1);
    }
}
' "$TEST_DIR/compose.json"

printf 'Production app containers have secure runtime settings.\n'
