#!/bin/bash

# Nginx Deployment Script for Brag Doc Builder
# This script automates deployment to an Nginx server

set -e

echo "================================================"
echo "  Brag Doc Builder - Nginx Deployment"
echo "================================================"
echo ""

# Configuration - Edit these values
SERVER_USER="your-username"
SERVER_HOST="your-server.com"
SERVER_PATH="/var/www/brag-doc"
DOMAIN="bragdoc.yourdomain.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}No dist folder found. Building first...${NC}"
    npm run build
fi

echo "Deployment Configuration:"
echo "  Server: $SERVER_USER@$SERVER_HOST"
echo "  Path: $SERVER_PATH"
echo "  Domain: $DOMAIN"
echo ""
read -p "Is this correct? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Edit the configuration at the top of this script and try again."
    exit 1
fi

# Create directory on server if it doesn't exist
echo "Creating directory on server..."
ssh $SERVER_USER@$SERVER_HOST "sudo mkdir -p $SERVER_PATH && sudo chown $SERVER_USER:$SERVER_USER $SERVER_PATH"

# Upload files
echo "Uploading files..."
rsync -avz --delete dist/ $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

echo -e "${GREEN}✓ Files uploaded${NC}"
echo ""

# Create nginx config
echo "Creating Nginx configuration..."
cat > /tmp/brag-doc-nginx.conf << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    root $SERVER_PATH;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Upload nginx config
scp /tmp/brag-doc-nginx.conf $SERVER_USER@$SERVER_HOST:/tmp/

# Enable site on server
echo "Enabling site..."
ssh $SERVER_USER@$SERVER_HOST << 'ENDSSH'
sudo mv /tmp/brag-doc-nginx.conf /etc/nginx/sites-available/brag-doc
sudo ln -sf /etc/nginx/sites-available/brag-doc /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
ENDSSH

echo -e "${GREEN}✓ Nginx configured and reloaded${NC}"
echo ""
echo "================================================"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Visit: http://$DOMAIN"
echo "2. Set up SSL with: sudo certbot --nginx -d $DOMAIN"
echo ""
