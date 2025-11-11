# Brag Doc Builder - Deployment Guide

## Overview
The Brag Doc Builder is a static React application that can be deployed to any web server that can serve HTML, CSS, and JavaScript files.

## Prerequisites
- Node.js 18+ and npm
- A web server (Nginx, Apache, Caddy, or cloud hosting)
- Domain name (optional but recommended)

---

## Quick Start (Local Development)

### 1. Install and Build
```bash
chmod +x setup.sh
./setup.sh
```

### 2. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000`

---

## Production Deployment Options

### Option 1: Traditional Web Server (Nginx, Apache)

#### Step 1: Build the Application
```bash
npm run build
```
This creates an optimized production build in the `dist/` folder.

#### Step 2: Upload to Your Server
```bash
# Using SCP
scp -r dist/* user@your-server.com:/var/www/brag-doc/

# Using rsync
rsync -avz dist/ user@your-server.com:/var/www/brag-doc/
```

#### Step 3: Configure Nginx
Create `/etc/nginx/sites-available/brag-doc`:

```nginx
server {
    listen 80;
    server_name bragdoc.yourdomain.com;
    
    root /var/www/brag-doc;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/brag-doc /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 4: Add SSL (Recommended)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d bragdoc.yourdomain.com
```

---

### Option 2: Apache Configuration

Create `/etc/apache2/sites-available/brag-doc.conf`:

```apache
<VirtualHost *:80>
    ServerName bragdoc.yourdomain.com
    DocumentRoot /var/www/brag-doc
    
    <Directory /var/www/brag-doc>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Handle React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Cache static assets
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>
</VirtualHost>
```

Enable:
```bash
sudo a2enmod rewrite
sudo a2ensite brag-doc
sudo systemctl reload apache2
```

---

### Option 3: Static Hosting Services

#### Netlify
1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
npm run build
netlify deploy --prod --dir=dist
```

Or connect your Git repository at https://netlify.com for automatic deployments.

#### Vercel
1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

#### Cloudflare Pages
1. Build locally:
```bash
npm run build
```

2. Upload `dist` folder via Cloudflare Pages dashboard
   - Build command: `npm run build`
   - Output directory: `dist`

#### AWS S3 + CloudFront
1. Build:
```bash
npm run build
```

2. Upload to S3:
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

3. Configure S3 bucket for static website hosting
4. Create CloudFront distribution pointing to S3 bucket

---

### Option 4: Docker Container

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:
```bash
docker build -t brag-doc-builder .
docker run -d -p 80:80 brag-doc-builder
```

---

## Environment Configuration

The app uses Claude's API directly from the browser. No backend server or API keys are needed in the application itself. Users interact with Claude through Anthropic's API using the browser's fetch API.

### Security Considerations

1. **HTTPS Required**: Always serve over HTTPS in production
2. **CORS**: No special CORS configuration needed as API calls go directly to Anthropic
3. **Privacy**: The app doesn't track or store user data server-side
4. **Rate Limiting**: Consider implementing rate limiting at the web server level if needed

---

## Performance Optimization

### 1. Enable Compression
Ensure gzip/brotli compression is enabled in your web server.

### 2. CDN (Optional)
Use a CDN like Cloudflare for better global performance:
- Set up Cloudflare in front of your server
- Enable caching for static assets
- Enable Brotli compression

### 3. Cache Headers
The build already includes content hashing. Set appropriate cache headers:
- HTML: `Cache-Control: no-cache`
- JS/CSS: `Cache-Control: max-age=31536000, immutable`

---

## Monitoring & Maintenance

### Health Check
Create a simple health check endpoint or monitor:
```bash
curl -I https://bragdoc.yourdomain.com
```

### Log Monitoring
Monitor web server logs for errors:
```bash
# Nginx
tail -f /var/log/nginx/error.log

# Apache
tail -f /var/log/apache2/error.log
```

### Updates
To update the application:
```bash
# Pull latest changes
git pull

# Rebuild
npm run build

# Deploy updated dist folder
# (method depends on your deployment choice)
```

---

## Troubleshooting

### Issue: Blank page after deployment
**Solution**: Check browser console for errors. Ensure all files in `dist/` were uploaded.

### Issue: 404 on refresh
**Solution**: Configure your web server to redirect all requests to `index.html` (see nginx/apache configs above).

### Issue: Assets not loading
**Solution**: Check that the base path in your deployment matches your configuration. The app expects to be served from the root path.

### Issue: CORS errors
**Solution**: This shouldn't happen as API calls go directly to Anthropic. If you see CORS errors, check browser extensions or network policies.

---

## Support

For issues or questions:
- GitHub: [Your Repo URL]
- Email: support@starfysh.net
- Website: https://starfysh.net

---

## License

[Your License Here]
