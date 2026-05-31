#!/usr/bin/env bash
set -e

# Install PHP and extensions
apt-get update && apt-get install -y php8.2 php8.2-cli php8.2-mbstring php8.2-xml \
    php8.2-zip php8.2-mysql php8.2-curl php8.2-gd php8.2-bcmath unzip curl

# Install Composer
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node dependencies and build assets
npm ci && npm run build

# Cache Laravel config
php artisan config:cache
php artisan route:cache
php artisan view:cache
