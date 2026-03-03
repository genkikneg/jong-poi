FROM php:8.4-cli

ENV COMPOSER_ALLOW_SUPERUSER=1

# 必要パッケージ + node追加
RUN apt-get update && apt-get install -y \
    git unzip curl libzip-dev libonig-dev libxml2-dev libcurl4-openssl-dev \
    nodejs npm \
 && docker-php-ext-install \
    mbstring xml curl pdo pdo_mysql zip \
 && rm -rf /var/lib/apt/lists/*

# composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

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
 && php artisan wayfinder:generate --with-form \
 && npm run build \
 && rm -f .env

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]