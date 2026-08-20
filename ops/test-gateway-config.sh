#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
GATEWAY_DIR="$REPO_DIR/deploy/gateway"
TEST_DIR="$(mktemp -d "${TMPDIR:-/tmp}/jong-poi-gateway-test.XXXXXX")"
CONTAINER_NAME="jong-poi-gateway-test-$$"
OFFICIAL_HOST="jong-poi.misoon.net"

assert_status() {
    local label="$1"
    local expected="$2"
    local actual="$3"

    if [[ "$actual" != "$expected" ]]; then
        printf '%s: expected HTTP status %s, got %s\n' "$label" "$expected" "$actual" >&2
        exit 1
    fi
}

cleanup() {
    docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
    rm -rf "$TEST_DIR"
}
trap cleanup EXIT INT TERM

install -d \
    "$TEST_DIR/letsencrypt/live/$OFFICIAL_HOST" \
    "$TEST_DIR/nginx/conf.d"
cp "$GATEWAY_DIR"/nginx/conf.d/*.conf "$TEST_DIR/nginx/conf.d/"
cp "$REPO_DIR/tests/Fixtures/gateway/other-app.conf" "$TEST_DIR/nginx/conf.d/other-app.conf"
openssl req \
    -x509 \
    -newkey rsa:2048 \
    -nodes \
    -days 1 \
    -subj "/CN=$OFFICIAL_HOST" \
    -keyout "$TEST_DIR/letsencrypt/live/$OFFICIAL_HOST/privkey.pem" \
    -out "$TEST_DIR/letsencrypt/live/$OFFICIAL_HOST/fullchain.pem" \
    >/dev/null 2>&1

gateway_image="$(docker compose -f "$GATEWAY_DIR/compose.yaml" config --images | head -n 1)"
test -n "$gateway_image"

docker run \
    --detach \
    --name "$CONTAINER_NAME" \
    --read-only \
    --tmpfs /var/cache/nginx:mode=0755,uid=101,gid=101 \
    --tmpfs /var/run:mode=0755,uid=101,gid=101 \
    --publish 127.0.0.1::80 \
    --publish 127.0.0.1::443 \
    --volume "$TEST_DIR/nginx/conf.d:/etc/nginx/conf.d:ro" \
    --volume "$GATEWAY_DIR/nginx/snippets:/etc/nginx/snippets:ro" \
    --volume "$TEST_DIR/letsencrypt:/etc/letsencrypt:ro" \
    "$gateway_image" \
    >/dev/null

docker exec "$CONTAINER_NAME" nginx -t >/dev/null

http_port="$(docker port "$CONTAINER_NAME" 80/tcp | sed -n '1s/.*://p')"
https_port="$(docker port "$CONTAINER_NAME" 443/tcp | sed -n '1s/.*://p')"
test -n "$http_port"
test -n "$https_port"

ready=no
for _ in $(seq 1 50); do
    readiness_status="$(
        curl \
            --silent \
            --noproxy '*' \
            --max-time 1 \
            --output /dev/null \
            --write-out '%{http_code}' \
            --header 'Host: other-app.example' \
            "http://127.0.0.1:$http_port/" \
            2>/dev/null || true
    )"
    if [[ "$readiness_status" = 204 ]]; then
        ready=yes
        break
    fi
    sleep 0.2
done
if [[ "$ready" != yes ]]; then
    echo 'gateway did not become ready' >&2
    exit 1
fi

headers="$TEST_DIR/official-http.headers"
normalized_headers="$TEST_DIR/official-http.normalized.headers"
curl \
    --silent \
    --show-error \
    --noproxy '*' \
    --dump-header "$headers" \
    --output /dev/null \
    --header "Host: $OFFICIAL_HOST" \
    "http://127.0.0.1:$http_port/test-path?check=1"
tr -d '\r' < "$headers" > "$normalized_headers"
if ! grep -Eq '^HTTP/[0-9.]+ 301 ' "$normalized_headers"; then
    echo 'official HTTP host did not return 301' >&2
    exit 1
fi
if ! grep -Fqx "Location: https://$OFFICIAL_HOST/test-path?check=1" "$normalized_headers"; then
    echo 'official HTTP redirect location was not fixed to the canonical host' >&2
    exit 1
fi

other_app_status="$(
    curl \
        --silent \
        --show-error \
        --noproxy '*' \
        --output /dev/null \
        --write-out '%{http_code}' \
        --header 'Host: other-app.example' \
        "http://127.0.0.1:$http_port/"
)"
assert_status 'additional app host' 204 "$other_app_status"

unknown_http_status="$(
    curl \
        --silent \
        --noproxy '*' \
        --max-time 5 \
        --output /dev/null \
        --write-out '%{http_code}' \
        --header 'Host: invalid.example' \
        "http://127.0.0.1:$http_port/" \
        2>/dev/null || true
)"
assert_status 'unknown HTTP host' 000 "$unknown_http_status"

direct_ip_status="$(
    curl \
        --silent \
        --noproxy '*' \
        --max-time 5 \
        --output /dev/null \
        --write-out '%{http_code}' \
        "http://127.0.0.1:$http_port/" \
        2>/dev/null || true
)"
assert_status 'direct IP request' 000 "$direct_ip_status"

unknown_https_host_status="$(
    curl \
        --silent \
        --insecure \
        --noproxy '*' \
        --max-time 5 \
        --output /dev/null \
        --write-out '%{http_code}' \
        --resolve "$OFFICIAL_HOST:$https_port:127.0.0.1" \
        --header 'Host: invalid.example' \
        "https://$OFFICIAL_HOST:$https_port/" \
        2>/dev/null || true
)"
assert_status 'unknown HTTPS host with known SNI' 000 "$unknown_https_host_status"

unknown_tls_status="$(
    curl \
        --silent \
        --insecure \
        --noproxy '*' \
        --max-time 5 \
        --output /dev/null \
        --write-out '%{http_code}' \
        --resolve "invalid.example:$https_port:127.0.0.1" \
        "https://invalid.example:$https_port/" \
        2>/dev/null || true
)"
assert_status 'unknown TLS SNI' 000 "$unknown_tls_status"

echo 'Gateway host handling check passed.'
