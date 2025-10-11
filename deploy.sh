#!/bin/bash

# Cleanoo.nl Deployment Script
echo "🚀 Starting Cleanoo.nl deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root - this is not recommended but will continue"
    # Don't exit, just warn
fi

# Update system packages
print_status "Updating system packages..."
if [ "$EUID" -eq 0 ]; then
    apt update && apt upgrade -y
else
    sudo apt update && sudo apt upgrade -y
fi

# Install required packages
print_status "Installing required packages..."
if [ "$EUID" -eq 0 ]; then
    apt install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban
else
    sudo apt install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban
fi

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

# Create application directory
print_status "Setting up application directory..."
sudo mkdir -p /var/www/cleanoo
sudo chown -R $USER:$USER /var/www/cleanoo
cd /var/www/cleanoo

# Copy application files (assuming you're running this from the project directory)
print_status "Copying application files..."
cp -r /Users/taysim/websites/bayata/web/* /var/www/cleanoo/

# Install dependencies
print_status "Installing dependencies..."
npm install --production

# Build the application
print_status "Building application..."
npm run build

# Create logs directory
mkdir -p logs

# Setup environment variables
print_status "Setting up environment variables..."
cat > .env.local << EOF
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://cleanoo.nl
NEXT_PUBLIC_API_URL=https://cleanoo.nl/api
ADMIN_EMAIL=admin@cleanoo.nl
ADMIN_PASSWORD=YourSecurePassword123!
JWT_SECRET=$(openssl rand -base64 32)
DATABASE_URL=./database.sqlite
EOF

# Setup Nginx
print_status "Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/cleanoo.nl
sudo ln -sf /etc/nginx/sites-available/cleanoo.nl /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Setup SSL with Let's Encrypt
print_status "Setting up SSL certificate..."
sudo certbot --nginx -d cleanoo.nl -d www.cleanoo.nl --non-interactive --agree-tos --email admin@cleanoo.nl

# Setup firewall
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Setup fail2ban
print_status "Configuring fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Start application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Restart Nginx
print_status "Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/cleanoo << EOF
/var/www/cleanoo/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reload cleanoo-app
    endscript
}
EOF

print_status "🎉 Deployment completed successfully!"
print_status "Your application is now running at: https://cleanoo.nl"
print_status "Admin panel: https://cleanoo.nl/admin"
print_status "Staff login: https://cleanoo.nl/staff/login"

print_warning "Don't forget to:"
print_warning "1. Change the admin password in .env.local"
print_warning "2. Update JWT_SECRET with a secure value"
print_warning "3. Test all functionality"
print_warning "4. Setup database backups"

echo ""
print_status "Useful commands:"
echo "  pm2 status          - Check application status"
echo "  pm2 logs cleanoo-app - View application logs"
echo "  pm2 restart cleanoo-app - Restart application"
echo "  sudo nginx -t       - Test Nginx configuration"
echo "  sudo systemctl status nginx - Check Nginx status"
