# Hostinger Deployment Guide — CoolWave.cool

This document provides complete production deployment instructions for running **CoolWave.cool** on Hostinger (Hostinger VPS, Hostinger Cloud, or Hostinger Web Hosting with Node.js support).

---

## 1. Hosting Architecture Overview

CoolWave utilizes a **Dual Execution Architecture**:
- **Client-Side (Tier A)**: 90% of conversions (PDF merge, split, compress, rotate, edit, image convert/compress, OCR) happen entirely inside the user's browser via WebAssembly & HTML5 Canvas. This means your Hostinger server consumes near-zero CPU/RAM for these heavy tasks!
- **Server-Side (Tier B)**: Next.js App Router handles SSG/SSR for programmatic SEO landing pages, API routes, and lightweight document transformations.

---

## 2. Prerequisites on Hostinger

- **Node.js**: Version 18.x, 20.x, or 22.x+ LTS installed
- **Git**: Installed
- **PM2**: Recommended for Node.js process management (`npm install -g pm2`)
- **Web Server**: Nginx or Hostinger LiteSpeed reverse proxy

---

## 3. Step-by-Step Deployment on Hostinger VPS / Cloud

### Step 1: Clone Repository
```bash
cd /var/www
git clone <your-repo-url> coolwave
cd coolwave
```

### Step 2: Install Dependencies
```bash
npm ci --production=false
```

### Step 3: Configure Environment Variables
Create the `.env.production` file:
```bash
cp .env.example .env.production
nano .env.production
```

Ensure the following are set:
```env
NEXT_PUBLIC_SITE_URL="https://coolwave.cool"
NODE_ENV="production"
PORT=3000
DATABASE_URL="file:./prod.db"
```

### Step 4: Build the Next.js Production Bundle
```bash
npm run build
```
This generates the optimized static and server pages in `.next/`.

### Step 5: Start with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 4. Nginx Reverse Proxy & SSL Configuration

Create `/etc/nginx/sites-available/coolwave.cool`:
```nginx
server {
    listen 80;
    server_name coolwave.cool www.coolwave.cool;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name coolwave.cool www.coolwave.cool;

    ssl_certificate /etc/letsencrypt/live/coolwave.cool/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/coolwave.cool/privkey.pem;

    # High-Performance Compression & Headers
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    location /_next/static {
        alias /var/www/coolwave/.next/static;
        expires 365d;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/coolwave.cool /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Automatic File Deletion Cron Job

For any server-side temporary file storage, configure a Linux cron job to wipe files older than 15 minutes:
```bash
crontab -e
```
Add:
```cron
*/5 * * * * find /tmp/coolwave_uploads -type f -mmin +15 -delete
```

---

## 6. Migration Roadmap to Dedicated Cloud Workers

When daily traffic exceeds 50,000 conversions:
1. **Frontend & SEO Pages**: Remain on Hostinger / Cloudflare CDN.
2. **Heavy Workers**: Spin up an isolated Docker container with LibreOffice / Ghostscript / FFmpeg behind Redis / BullMQ.
3. Configure the worker URL in `.env`: `WORKER_SERVICE_URL="https://worker.coolwave.cool"`.
