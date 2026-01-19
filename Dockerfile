FROM php:8.4-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    supervisor \
    nginx \
    gnupg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Node.js (Latest LTS)
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install -y nodejs

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . .

# Install PHP dependencies
# Using --ignore-platform-reqs to avoid issues if local php version requirement is strict
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Install Node dependencies and Build
RUN npm ci
RUN npm run build:ssr

# Setup Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Setup Nginx
COPY .docker/nginx.conf /etc/nginx/sites-available/default

# Setup Supervisor
COPY .docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose port (Railway sets PORT env var, but Nginx is configured for 80 inside container)
EXPOSE 80

# Start Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
