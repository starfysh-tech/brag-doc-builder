# Quick Start Guide - Brag Doc Builder

This guide will walk you through setting up and deploying the Brag Doc Builder on your own server in about 10 minutes.

## 📋 What You'll Need

- A computer with Node.js 18+ installed
- A web server (Ubuntu/Debian server with Nginx recommended)
- SSH access to your server
- A domain name (optional, can use IP address)

---

## Step 1: Set Up Locally

### 1.1 Download the Files
You should have a folder with these files:
```
brag-doc-setup/
├── setup.sh
├── deploy-nginx.sh
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
└── public/
    └── favicon.svg
```

### 1.2 Install Node.js (if needed)
Check if Node.js is installed:
```bash
node -v
```

If not installed, download from: https://nodejs.org/ (version 18 or higher)

### 1.3 Run Setup Script
From the `brag-doc-setup` directory:
```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Install all dependencies
- Build the production version
- Create a `dist` folder with your app

### 1.4 Test Locally
```bash
npm run dev
```
Visit http://localhost:3000 to test the app.

Press `Ctrl+C` to stop the dev server.

---

## Step 2: Deploy to Your Server

Choose your deployment method:

### Option A: Automated Nginx Deployment (Recommended)

#### 2.1 Edit Configuration
Open `deploy-nginx.sh` and update these lines:
```bash
SERVER_USER="your-username"        # Your SSH username
SERVER_HOST="your-server.com"      # Your server IP or domain
SERVER_PATH="/var/www/brag-doc"    # Where to deploy
DOMAIN="bragdoc.yourdomain.com"    # Your domain
```

#### 2.2 Run Deployment Script
```bash
chmod +x deploy-nginx.sh
./deploy-nginx.sh
```

This will:
- Upload files to your server
- Configure Nginx
- Reload Nginx

#### 2.3 Add SSL (Recommended)
SSH into your server:
```bash
ssh your-username@your-server.com
```

Install Certbot and get SSL certificate:
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d bragdoc.yourdomain.com
```

Done! Visit https://bragdoc.yourdomain.com

---

### Option B: Manual Deployment

#### 2.1 Build the App
```bash
npm run build
```

#### 2.2 Upload to Server
```bash
# Using SCP
scp -r dist/* your-username@your-server.com:/var/www/brag-doc/

# Or using rsync
rsync -avz dist/ your-username@your-server.com:/var/www/brag-doc/
```

#### 2.3 Configure Nginx Manually
SSH into your server:
```bash
ssh your-username@your-server.com
```

Create nginx config:
```bash
sudo nano /etc/nginx/sites-available/brag-doc
```

Paste this configuration (update `server_name` with your domain):
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

#### 2.4 Add SSL
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d bragdoc.yourdomain.com
```

---

### Option C: Static Hosting (Easiest)

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

---

## Step 3: Verify Deployment

### 3.1 Check the Site
Visit your domain in a browser. You should see the Brag Doc Builder.

### 3.2 Test Functionality
1. Select a mode (General or Founder)
2. Choose a timeframe (Daily, Weekly, or Sprint)
3. Start a conversation
4. Generate a brag doc entry
5. Test copy and download buttons

### 3.3 Test Dark/Light Mode
Click the sun/moon icon in the top right to toggle themes.

---

## Troubleshooting

### Problem: "npm: command not found"
**Solution**: Install Node.js from https://nodejs.org/

### Problem: "Permission denied" when running scripts
**Solution**: Make scripts executable:
```bash
chmod +x setup.sh
chmod +x deploy-nginx.sh
```

### Problem: Blank page after deployment
**Solution**: 
1. Check browser console for errors (F12)
2. Verify all files uploaded: `ls -la /var/www/brag-doc/`
3. Check nginx error log: `sudo tail -f /var/log/nginx/error.log`

### Problem: 404 when refreshing page
**Solution**: Ensure nginx is configured to redirect to index.html (see nginx config above)

### Problem: Can't connect to server
**Solution**: 
1. Check firewall: `sudo ufw status`
2. Allow HTTP/HTTPS: `sudo ufw allow 'Nginx Full'`
3. Check nginx is running: `sudo systemctl status nginx`

---

## Updating the App

To deploy updates:

1. Pull latest changes or make modifications
2. Rebuild:
   ```bash
   npm run build
   ```
3. Re-run deployment:
   ```bash
   ./deploy-nginx.sh
   ```

---

## Performance Tips

### Enable Caching
Already configured in the nginx config above.

### Use a CDN
Add Cloudflare in front of your server:
1. Sign up at https://cloudflare.com
2. Point your domain to Cloudflare nameservers
3. Enable caching and compression in Cloudflare dashboard

### Monitor Performance
- Use Google Lighthouse (in Chrome DevTools)
- Check load times with `curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com`

---

## Security Checklist

- ✅ Use HTTPS (via Certbot)
- ✅ Keep server updated: `sudo apt update && sudo apt upgrade`
- ✅ Configure firewall: `sudo ufw enable`
- ✅ Use strong SSH keys (disable password auth)
- ✅ Regular backups of server

---

## Next Steps

- Customize the branding in `src/App.jsx`
- Update footer links to your company site
- Add your own domain
- Share with your team!

---

## Need Help?

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment options
- Visit https://starfysh.net for support
- Review server logs: `sudo tail -f /var/log/nginx/error.log`

---

**Congratulations! Your Brag Doc Builder is now live! 🎉**
