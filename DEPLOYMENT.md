# Brag Doc Builder - Deployment Guide

## Overview
The Brag Doc Builder is a static React application that can be deployed to any web server that can serve HTML, CSS, and JavaScript files.

## Prerequisites
- Node.js 18+ and npm
- A web server (Nginx, Apache, Caddy, or cloud hosting)
- Domain name (optional but recommended)

---

## Quick Start

### Step 1: Install and Build

```bash
# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

This will:
- Install all dependencies
- Build the production version
- Create a `dist` folder with your optimized app

### Step 2: Test Locally

```bash
npm run dev
```

Visit the URL shown in your terminal (typically `http://localhost:5173`).

Test all functionality:
1. Select a mode (General or Founder)
2. Choose a timeframe (Daily, Weekly, or Sprint)
3. Complete a conversation
4. Generate a brag doc entry
5. Test copy and download buttons
6. Toggle dark/light mode

Press `Ctrl+C` to stop the dev server when done.

### Step 3: Choose Your Deployment Method

See the deployment options below and select the one that best fits your needs.

---

## Production Deployment Options

### Option 1: Static Hosting Services (Easiest)

#### Netlify (Free)
1. Sign up at https://netlify.com
2. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify login
   ```
3. Deploy:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

Or connect your Git repository at https://netlify.com for automatic deployments.

#### Vercel (Free)
1. Sign up at https://vercel.com
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   vercel login
   ```
3. Deploy:
   ```bash
   vercel --prod
   ```

The Vercel deployment includes an optional serverless function that can proxy Claude API calls. See "API Proxy Configuration" section below.

#### Cloudflare Pages
1. Build locally:
   ```bash
   npm run build
   ```
2. Upload `dist` folder via Cloudflare Pages dashboard
   - Build command: `npm run build`
   - Output directory: `dist`

---

### Option 2: Traditional Web Server (Nginx, Apache)

#### Step 1: Build the Application
```bash
npm run build
```
This creates an optimized production build in the `dist/` folder.

#### Step 2: Upload to Your Server
```bash
# Using SCP
scp -r dist/* user@your-server.com:/var/www/brag-doc/

# Using rsync (recommended)
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
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d bragdoc.yourdomain.com
```

Done! Visit https://bragdoc.yourdomain.com

---

### Option 3: Apache Configuration

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

Add SSL:
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d bragdoc.yourdomain.com
```

---

### Option 4: AWS S3 + CloudFront

1. Build:
   ```bash
   npm run build
   ```

2. Upload to S3:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. Configure S3 bucket:
   - Enable static website hosting
   - Set index document to `index.html`
   - Set error document to `index.html` (for SPA routing)

4. Create CloudFront distribution:
   - Point origin to S3 bucket
   - Set default root object to `index.html`
   - Configure custom error responses: 404 → /index.html (200)

---

### Option 5: Docker Container

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

## API Proxy Configuration

By default, the app makes direct browser-to-API calls to Claude. However, a Vercel serverless function is available for proxying API calls if needed.

### When to Use the Proxy
- CORS restrictions in your environment
- Additional rate limiting or logging requirements
- API key management on server-side

### Vercel Proxy Setup
The proxy is included in the Vercel deployment. No additional configuration needed - API calls will be automatically routed through `/api/claude`.

### Direct API Calls (Default)
The app works out of the box with direct browser calls to `https://api.anthropic.com/v1/messages`. No backend server or API keys are needed in the application itself.

---

## Performance Optimization

### 1. Enable Compression
Ensure gzip/brotli compression is enabled in your web server (included in nginx config above).

### 2. Use a CDN (Optional)
Use a CDN like Cloudflare for better global performance:
- Sign up at https://cloudflare.com
- Point your domain to Cloudflare nameservers
- Enable caching for static assets
- Enable Brotli compression
- Use Cloudflare's free plan for basic optimization

### 3. Cache Headers
The build already includes content hashing. Recommended cache headers:
- HTML: `Cache-Control: no-cache`
- JS/CSS: `Cache-Control: max-age=31536000, immutable`
- Images: `Cache-Control: max-age=31536000, public`

### 4. Monitor Performance
- Use Google Lighthouse (in Chrome DevTools, F12 → Lighthouse tab)
- Check Core Web Vitals in Google Search Console
- Monitor with tools like PageSpeed Insights

---

## Security Best Practices

### Essential Security Checklist

- ✅ **Use HTTPS**: Always serve over HTTPS in production (use Certbot for free SSL)
- ✅ **Keep Server Updated**: `sudo apt update && sudo apt upgrade` regularly
- ✅ **Configure Firewall**: Enable and configure UFW or similar
  ```bash
  sudo ufw enable
  sudo ufw allow 'Nginx Full'
  ```
- ✅ **Use Strong SSH Keys**: Disable password authentication, use SSH keys only
- ✅ **Regular Backups**: Backup your server configuration and data
- ✅ **Security Headers**: Add security headers in web server config (see below)

### Recommended Security Headers

Add to your nginx config (inside the `server` block):
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### Privacy Considerations

- The app doesn't track or store user data server-side
- Conversation state is stored in URL hash (client-side only)
- API calls go directly to Anthropic (or via proxy)
- See Anthropic's Privacy Policy for details on how Claude handles data
- No CORS configuration needed for direct API calls

---

## Monitoring & Maintenance

### Health Check
Monitor your deployment with simple health checks:
```bash
# Check HTTP response
curl -I https://bragdoc.yourdomain.com

# Check with timing
curl -w "@curl-format.txt" -o /dev/null -s https://bragdoc.yourdomain.com
```

### Log Monitoring
Monitor web server logs for errors:
```bash
# Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Apache
tail -f /var/log/apache2/error.log
tail -f /var/log/apache2/access.log
```

### Updating the Application
To deploy updates:
```bash
# Pull latest changes (if using git)
git pull

# Rebuild
npm run build

# Deploy updated dist folder
# (method depends on your deployment choice)
# For nginx/apache: rsync dist/ user@server:/var/www/brag-doc/
# For Netlify: netlify deploy --prod --dir=dist
# For Vercel: vercel --prod
```

---

## Troubleshooting

### Problem: npm: command not found
**Solution**: Install Node.js from https://nodejs.org/ (version 18 or higher)

### Problem: Permission denied when running scripts
**Solution**: Make scripts executable:
```bash
chmod +x setup.sh
```

### Problem: Blank page after deployment
**Solutions**:
1. Check browser console for errors (F12 → Console tab)
2. Verify all files uploaded: `ls -la /var/www/brag-doc/`
3. Check web server error logs:
   - Nginx: `sudo tail -f /var/log/nginx/error.log`
   - Apache: `sudo tail -f /var/log/apache2/error.log`
4. Ensure `index.html` exists in the root directory
5. Check file permissions: `sudo chmod -R 755 /var/www/brag-doc/`

### Problem: 404 when refreshing page
**Solution**: Configure your web server to redirect all requests to `index.html` (see nginx/apache configs above). This is required for Single Page Applications.

### Problem: Assets not loading
**Solutions**:
1. Check that the base path in your deployment matches your configuration
2. The app expects to be served from the root path (`/`)
3. Verify all files from `dist/` were uploaded
4. Check browser Network tab (F12 → Network) for failed requests

### Problem: Can't connect to server
**Solutions**:
1. Check firewall status: `sudo ufw status`
2. Allow HTTP/HTTPS if blocked: `sudo ufw allow 'Nginx Full'`
3. Check web server is running:
   - Nginx: `sudo systemctl status nginx`
   - Apache: `sudo systemctl status apache2`
4. Restart web server if needed:
   - Nginx: `sudo systemctl restart nginx`
   - Apache: `sudo systemctl restart apache2`

### Problem: CORS errors
**Solution**: This shouldn't happen with direct API calls to Anthropic. If you see CORS errors:
1. Check browser extensions (ad blockers, privacy tools)
2. Check network policies or corporate firewalls
3. Consider using the Vercel proxy option

### Problem: Build fails
**Solutions**:
1. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear npm cache: `npm cache clean --force`
3. Check Node.js version: `node -v` (should be 18+)
4. Check for syntax errors in source files

---

## Support

For issues or questions:
- GitHub: [Your Repo URL]
- Email: support@starfysh.net
- Website: https://starfysh.net

---

Made with ❤️ by Starfysh
