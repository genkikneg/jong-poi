#!/bin/sh

set -eu

if [ ! -f .env ]; then
    cp .env.example .env
fi

if [ ! -f vendor/autoload.php ] || [ ! -f vendor/laravel/reverb/src/ReverbServiceProvider.php ]; then
    composer install --no-interaction --prefer-dist
else
    composer dump-autoload --no-interaction --optimize
fi

# The source tree is bind-mounted in local development. Clear any config cache
# created outside the container so Docker-provided environment variables win.
php artisan config:clear

mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache

if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force
fi

php artisan migrate --force

exec "$@"
