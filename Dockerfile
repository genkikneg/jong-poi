# --- 1) Frontend build (Vite) ---
FROM node:20-bookworm-slim AS frontend
WORKDIR /app

# package.json をコピー
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ソース全体をコピー
COPY . ./
RUN npm run build


# --- 2) Backend (Laravel) ---
FROM php:8.4-cli
ENV COMPOSER_ALLOW_SUPERUSER=1

RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libonig-dev libxml2-dev libcurl4-openssl-dev \
 && docker-php-ext-install \
    mbstring xml curl pdo pdo_mysql zip \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
COPY . /var/www/

# Vite出力物を上書きコピー
COPY --from=frontend /app/public/build /var/www/public/build

RUN composer install --no-interaction --prefer-dist --optimize-autoloader

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]