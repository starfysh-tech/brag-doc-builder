# Installation Checklist

Use this checklist to ensure proper setup and deployment of the Brag Doc Builder.

## Pre-Installation

- [ ] Node.js 18+ installed (`node -v`)
- [ ] npm installed (`npm -v`)
- [ ] Server access (if deploying to server)
- [ ] Domain name configured (optional)

## Local Setup

- [ ] Downloaded/cloned the repository
- [ ] Reviewed README.md
- [ ] Read QUICKSTART.md
- [ ] Made setup.sh executable (`chmod +x setup.sh`)
- [ ] Ran setup script (`./setup.sh`)
- [ ] Build completed successfully (dist/ folder created)
- [ ] Tested locally (`npm run dev`)
- [ ] Verified all features work in browser

## Pre-Deployment

- [ ] Updated branding/styling (if needed)
- [ ] Tested in multiple browsers
- [ ] Tested dark/light mode toggle
- [ ] Verified conversation flow
- [ ] Tested brag doc generation
- [ ] Tested copy and download functionality
- [ ] Tested URL sharing

## Deployment (Choose One)

### Option A: Nginx Server
- [ ] Edited deploy-nginx.sh with correct values
- [ ] Made deploy script executable (`chmod +x deploy-nginx.sh`)
- [ ] Ran deployment script (`./deploy-nginx.sh`)
- [ ] Verified files uploaded to server
- [ ] Nginx configured and running
- [ ] Site accessible via domain/IP
- [ ] SSL certificate installed (`sudo certbot --nginx -d domain.com`)
- [ ] Site accessible via HTTPS

### Option B: Static Hosting (Netlify/Vercel)
- [ ] Signed up for hosting platform
- [ ] Installed CLI tool
- [ ] Ran build command (`npm run build`)
- [ ] Deployed to platform
- [ ] Custom domain configured (if applicable)
- [ ] SSL automatically configured
- [ ] Site accessible

### Option C: Docker
- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Built image (`docker-compose build`)
- [ ] Started container (`docker-compose up -d`)
- [ ] Container running (`docker ps`)
- [ ] Site accessible on port 80

## Post-Deployment

- [ ] Site loads correctly
- [ ] No console errors in browser
- [ ] All features work:
  - [ ] Mode selection
  - [ ] Timeframe selection
  - [ ] Chat conversation
  - [ ] Brag doc generation
  - [ ] Copy button
  - [ ] Download button
  - [ ] Share URL button
  - [ ] Dark/light mode toggle
- [ ] Mobile responsive (test on phone)
- [ ] Performance is acceptable (< 2s load time)
- [ ] SSL certificate valid (if applicable)

## Security

- [ ] HTTPS enabled (if on custom server)
- [ ] Firewall configured (`sudo ufw status`)
- [ ] SSH keys set up (no password auth)
- [ ] Server packages updated (`sudo apt update && upgrade`)
- [ ] Regular backup plan in place

## Monitoring

- [ ] Set up uptime monitoring (optional)
- [ ] Configured log monitoring (optional)
- [ ] Documented update procedure
- [ ] Team members informed of new tool

## Documentation

- [ ] Updated README with your customizations
- [ ] Documented any custom configurations
- [ ] Added to internal documentation
- [ ] Created user guide (if needed)

## Maintenance Plan

- [ ] Scheduled regular updates
- [ ] Backup strategy defined
- [ ] Monitoring alerts configured (optional)
- [ ] Support contact information documented

---

## Quick Reference

### Common Commands

**Local Development:**
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

**Deployment:**
```bash
./deploy-nginx.sh    # Deploy to Nginx server
netlify deploy       # Deploy to Netlify
vercel --prod        # Deploy to Vercel
docker-compose up -d # Run with Docker
```

**Server Management:**
```bash
sudo systemctl status nginx    # Check Nginx status
sudo nginx -t                  # Test Nginx config
sudo systemctl reload nginx    # Reload Nginx
sudo tail -f /var/log/nginx/error.log  # View logs
```

---

**Status: [ ] Not Started  [ ] In Progress  [✓] Complete**

Last Updated: _______________
Deployed By: _______________
Deployed On: _______________
URL: _______________
