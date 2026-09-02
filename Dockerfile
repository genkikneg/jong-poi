FROM php:8.5.10-cli-bookworm@sha256:b80dfc7d2bc0fc97755620a0dfb3d5e8e9cbf70a2970ea2d5c9dc64154b31422

ENV COMPOSER_ALLOW_SUPERUSER=1

# PHP拡張のビルドに必要なパッケージ
RUN apt-get update && apt-get install -y \
    git unzip curl libzip-dev libonig-dev libxml2-dev libcurl4-openssl-dev \
 && docker-php-ext-install \
    mbstring xml curl pdo pdo_mysql zip \
 && rm -rf /var/lib/apt/lists/*

# composer
COPY --from=composer:2.8@sha256:5248900ab8b5f7f880c2d62180e40960cd87f60149ec9a1abfd62ac72a02577c /usr/bin/composer /usr/bin/composer

# Node.js
COPY --from=node:22-bookworm-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436 /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22-bookworm-slim@sha256:d649c27dae7ba0137b3cef5dd75baa422c08dc3d9e3fc0c23dfb172dc3cc6436 /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
 && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

WORKDIR /var/www
COPY . /var/www/

# PHP依存
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# フロント依存
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# フロントビルド（ここでphpも使える）
# ビルド中だけ artisan が動く最低限の .env を作る（イメージには残さない）
RUN if [ ! -f .env ]; then cp .env.example .env; fi \
 && php artisan key:generate --force \
 && mkdir -p storage/framework/views storage/framework/cache storage/framework/sessions bootstrap/cache \
 && chmod -R 777 storage bootstrap/cache \
 && php artisan wayfinder:generate --with-form \
 && npm run build \
 && rm -f .env

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
