# CoolWave Production Deployment & Operations Guide

This guide details the complete, production-ready deployment process for **CoolWave.cool**. It covers initial deployment on **Hostinger (KVM VPS / Cloud)**, architectural separation between web and worker tiers, realistic workload limits, and a step-by-step migration blueprint for scaling heavy operations onto dedicated cloud workers (Azure, Hetzner, AWS, Cloudflare).

---

## 1. System Architecture & Workload Separation

CoolWave is engineered with an asymmetric compute model to minimize infrastructure overhead:

```
+-----------------------------------------------------------------------------------+
|                                  USER BROWSER                                     |
|  95% of all operations (PDF Merge/Split/Compress, Image Tools, Dev Utilities)     |
|  execute directly on client CPU/GPU via WebAssembly, OffscreenCanvas & pdf-lib.   |
|  Server compute cost for these operations = €0.00                                 |
+-----------------------------------------+-----------------------------------------+
                                          |
                        HTTPS (Cloudflare CDN / Nginx)
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                       TIER 1: WEB APPLICATION (Hostinger)                         |
|  Next.js 16 App Router (Turbopack SSG / SSR)                                      |
|  - Serves 190+ programmatic SEO routes and UI shells                              |
|  - Validates API tokens and Stripe Pro subscriptions                              |
|  - Ephemeral file upload handler (< 15 min TTL)                                   |
|  - Zero-Copy streaming download endpoint (64 KB chunk buffers)                    |
+-----------------------------------------+-----------------------------------------+
                                          |
                     Job Queue (Internal / Redis)
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                   TIER 2: CONVERSION WORKERS (Separated Tier)                     |
|  Handles remaining 5% heavy operations:                                           |
|  - Multi-page OCR (Tesseract worker pool)                                         |
|  - Deep Office layout rendering (Node.js engine / LibreOffice)                   |
|  - Video/Audio transcoding (FFmpeg)                                               |
+-----------------------------------------------------------------------------------+
```

---

## 2. Realistic Hosting Capabilities & Limits

> [!CAUTION]
> **Shared Web Hosting Limitation Warning**:
> Standard Shared cPanel/hPanel hosting (e.g. Hostinger Single/Premium Shared) **cannot** safely run server-side OCR, multi-page Office rendering, or video transcoding. Shared hosting imposes strict CPU quota throttling (cgroups), low RAM limits (512 MB – 1 GB per cPanel account), and hard execution timeouts (30–60 seconds) that kill long-running Node processes.

### Minimum Recommended Production Hardware

| Tier | Environment | Specification | Safe Workload Capacity |
| :--- | :--- | :--- | :--- |
| **Minimum Production** | Hostinger KVM VPS 2 | 2 vCPU, 8 GB RAM, 100 GB NVMe | Up to 15,000 daily users; 1 concurrent media transcode, 1 concurrent OCR worker |
| **Recommended Production** | Hostinger KVM VPS 4 / Hetzner Cloud | 4 vCPU, 16 GB RAM, 200 GB NVMe | Up to 60,000 daily users; 2 media workers, 2 OCR workers, 6 general workers |
| **High Scale / Cloud** | Web on Hostinger/Cloudflare + Azure Container Worker | Web: 2 vCPU; Worker: 4–8 vCPU autoscale | Unlimited scale; web tier stays completely responsive during heavy batch jobs |

---

## 3. Step-by-Step Hostinger VPS Deployment

### Step 1: Server Provisioning & Base Packages
Connect to your Hostinger VPS via SSH (Ubuntu 22.04 or 24.04 LTS):

```bash
ssh root@<YOUR_HOSTINGER_VPS_IP>

# Update system packages
apt update && apt upgrade -y

# Install core utilities
apt install -y curl git ufw fail2ban certbot python3-certbot-nginx nginx
```

### Step 2: Install Node.js & Process Manager
Install Node.js 22 LTS via NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Verify versions
node -v   # Should output v22.x.x
npm -v    # Should output v10.x.x

# Install PM2 globally
npm install -g pm2
```

### Step 3: Install Server Conversion Tools (FFmpeg, LibreOffice, Tesseract)
For server-side fallbacks (video, office, multi-page OCR):

```bash
# Install FFmpeg for video/audio conversions
apt install -y ffmpeg

# Install Tesseract OCR & German/English language models
apt install -y tesseract-ocr tesseract-ocr-deu tesseract-ocr-eng

# Install Headless LibreOffice for deep docx/pptx rendering
apt install -y libreoffice-writer-nogpu libreoffice-calc-nogpu libreoffice-impress-nogpu --no-install-recommends
```

### Step 4: Configure Firewall (UFW)
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable
```

### Step 5: Clone Repository & Create Directories
```bash
# Create application root
mkdir -p /var/www/coolwave
cd /var/www/coolwave

# Clone your repository
git clone https://github.com/<YOUR_USER>/coolwave.git .

# Create persistent state directories
mkdir -p data/logs data/analytics .tmp/storage/uploads .tmp/storage/outputs

# Set proper permissions for web user
chown -R www-data:www-data /var/www/coolwave
chmod -R 775 /var/www/coolwave/data /var/www/coolwave/.tmp
```

### Step 6: Configure Environment Variables
Create the production environment file:

```bash
cp .env.example .env.production
nano .env.production
```

Configure the following essential variables:

```env
APP_ENV="production"
NODE_ENV="production"
PORT=3000
NEXT_PUBLIC_SITE_URL="https://coolwave.cool"

# Cryptographic secrets
DOWNLOAD_SIGNING_SECRET="<GENERATE_RANDOM_64_CHAR_HEX>"
CRON_SECRET="<GENERATE_RANDOM_32_CHAR_STRING>"

# Worker Concurrency (Keep conservative on 2-4 vCPU Hostinger VPS)
SERVER_CONCURRENCY=4
MAX_MEDIA_CONCURRENCY=1
MAX_OCR_CONCURRENCY=1
MAX_QUEUE_CAPACITY=100
PM2_INSTANCES=2

# Ephemeral File Lifecycle
TEMP_FILE_RETENTION_MINUTES=15
CLEANUP_INTERVAL_MINUTES=5
AUTO_DELETE_ON_DOWNLOAD=true
```

To generate secure cryptographic keys:
```bash
node -e "console.log('DOWNLOAD_SIGNING_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('CRON_SECRET=' + require('crypto').randomBytes(16).toString('hex'))"
```

### Step 7: Install Dependencies & Build
```bash
# Install exact dependencies
npm ci

# Build optimized production bundle
npm run build
```
Verify that the output finishes with `✓ Generating static pages (190/190)`.

### Step 8: Configure PM2 Process Manager
Verify [`ecosystem.config.js`](file:///c:/Users/bilal.abbasi/Desktop/coolwave/ecosystem.config.js):

```javascript
module.exports = {
  apps: [
    {
      name: 'coolwave-web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: process.env.PM2_INSTANCES ? parseInt(process.env.PM2_INSTANCES, 10) : 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1200M',
      listen_timeout: 10000,
      kill_timeout: 5000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './data/logs/pm2-err.log',
      out_file: './data/logs/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
```

Launch and enable PM2 startup:
```bash
# Start cluster
pm2 start ecosystem.config.js

# Save process list & generate systemd startup script
pm2 save
pm2 startup systemd -u root --hp /root
```

---

## 4. Nginx Reverse Proxy & SSL Configuration

Create `/etc/nginx/sites-available/coolwave.cool`:

```nginx
# Upstream Next.js application cluster
upstream coolwave_cluster {
    server 127.0.0.1:3000;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name coolwave.cool www.coolwave.cool;
    return 301 https://coolwave.cool$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.coolwave.cool;
    return 301 https://coolwave.cool$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name coolwave.cool;

    # SSL Certificates (managed via Certbot)
    ssl_certificate /etc/letsencrypt/live/coolwave.cool/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/coolwave.cool/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # File upload limit (500 MB for Pro tier)
    client_max_body_size 520M;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Static Next.js Assets Cache (Immutable 1 Year)
    location /_next/static/ {
        alias /var/www/coolwave/.next/static/;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Public static assets
    location ~* \.(ico|png|jpg|jpeg|webp|svg|woff2|txt)$ {
        root /var/www/coolwave/public;
        expires 30d;
        access_log off;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Zero-Copy Streaming Downloads
    location ~ ^/api/v1/jobs/[^/]+/download {
        proxy_pass http://coolwave_cluster;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Disable buffering to stream chunks immediately to the user
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }

    # General Web Application Proxy
    location / {
        proxy_pass http://coolwave_cluster;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }
}
```

Enable Nginx config and provision SSL certificate:

```bash
ln -s /etc/nginx/sites-available/coolwave.cool /etc/nginx/sites-enabled/
nginx -t

# Obtain Let's Encrypt SSL
certbot --nginx -d coolwave.cool -d www.coolwave.cool

# Reload Nginx
systemctl reload nginx
```

---

## 5. Domain, DNS & Cloudflare CDN Setup

In your domain registrar (Hostinger DNS or Cloudflare):

| Type | Name | Value | Proxy Status | TTL |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `<YOUR_HOSTINGER_VPS_IP>` | **Proxied (Orange Cloud)** | Auto |
| **CNAME** | `www` | `coolwave.cool` | **Proxied (Orange Cloud)** | Auto |

### Cloudflare Caching Rules
1. **SSL/TLS Mode**: Set to **Full (Strict)**.
2. **Page Rules / Cache Rules**:
   - `coolwave.cool/_next/static/*`: **Cache Everything**, Edge Cache TTL: 1 Month.
   - `coolwave.cool/api/*`: **Bypass Cache** (Pass through to Hostinger).
   - `coolwave.cool/admin/*`: **Bypass Cache**.
3. **Brotli & Auto-Minify**: Enable Brotli compression under Speed > Optimization.

---

## 6. Automated Cleanup & Cron Setup

To enforce the zero unnecessary retention policy and wipe expired files:

### Option A: Systemd Timer (Recommended on Hostinger VPS)
Edit `/etc/cron.d/coolwave-cleanup`:

```cron
# Run local disk purge every 5 minutes
*/5 * * * * root find /var/www/coolwave/.tmp/storage/uploads -type f -mmin +15 -delete >/dev/null 2>&1
*/5 * * * * root find /var/www/coolwave/.tmp/storage/outputs -type f -mmin +15 -delete >/dev/null 2>&1

# Trigger Next.js queue reconciliation endpoint
*/5 * * * * root curl -s -X POST "http://127.0.0.1:3000/api/v1/jobs/cleanup" -H "Authorization: Bearer <YOUR_CRON_SECRET>" >/dev/null 2>&1
```

### Option B: Hostinger hPanel Web Cron
If using Hostinger Web Cron:
- **Type**: GET Request
- **URL**: `https://coolwave.cool/api/v1/jobs/cleanup?secret=<YOUR_CRON_SECRET>`
- **Schedule**: `*/5 * * * *` (Every 5 minutes)

---

## 7. Logging, Monitoring & Backup Strategy

### 1. Centralized Process Logging
PM2 automatically rotates application logs:

```bash
# Install PM2 logrotate module
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
```

### 2. Uptime & Health Monitoring
- Health endpoint: `https://coolwave.cool/api/v1/health`
- Setup a free ping check (every 1 minute) via **BetterStack** or **UptimeRobot** pointing to `/api/v1/health`.
- Configure alerts (Email / Discord / Telegram) on HTTP 5xx or latency > 2,000ms.

### 3. Automated Daily Backup Strategy
Create `/usr/local/bin/coolwave-backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/coolwave"
DATE=$(date +%Y-%m-%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

# Backup privacy analytics aggregates and config
tar -czf "$BACKUP_DIR/coolwave_data_$DATE.tar.gz" -C /var/www/coolwave data/analytics .env.production

# Keep last 14 days of backups
find "$BACKUP_DIR" -name "coolwave_data_*.tar.gz" -mtime +14 -delete
```

Make executable and add to crontab:
```bash
chmod +x /usr/local/bin/coolwave-backup.sh
echo "0 3 * * * root /usr/local/bin/coolwave-backup.sh" >> /etc/crontab
```

---

## 8. Migration Blueprint: Dedicated Cloud Worker Tier (Scale > 50,000 Users/Day)

When your organic SEO traffic scales significantly, multi-page OCR and heavy video processing should be offloaded from Hostinger to a dedicated autoscaling worker cluster.

### Architecture Comparison

```
Current (Single-Node VPS):
Hostinger VPS: [ Next.js Web + Local Queue + Local FFmpeg/Tesseract ]

Target Scale (Multi-Tier Cloud):
Hostinger / Cloudflare: [ Next.js Web (Port 3000) ]
        |
        | (Uploads direct to Cloudflare R2 object storage)
        v
Cloudflare R2 Bucket (Zero Egress Cost)
        ^
        | (Consumes jobs from Redis)
Dedicated Worker (Azure Container Apps / Hetzner Cloud VPS):
[ CoolWave Worker Pool: FFmpeg + LibreOffice + Tesseract ]
```

### Transition Steps:
1. **Object Storage**: Set `STORAGE_ENDPOINT` to Cloudflare R2 (compatible with S3 API) in `.env.production`. Clients upload directly with signed URLs, cutting bandwidth on Hostinger to zero.
2. **Queue**: Set `REDIS_URL` in `.env.production` (e.g. Upstash Redis or Hostinger Redis).
3. **Deploy Worker Container**: Run the isolated worker Docker image on an Azure Container App (consumption plan: scales to zero when idle) or a dedicated €8/month Hetzner Cloud VPS.
4. **Result**: The Hostinger web application never experiences CPU spikes or OOM crashes, maintaining 100% uptime for all website visitors and programmatic SEO pages.

---

## 9. Quick Verification Checklist

After deployment, run this validation sequence:

```bash
# 1. Check PM2 status
pm2 status

# 2. Check Nginx status
systemctl status nginx

# 3. Test HTTP health endpoint
curl -I https://coolwave.cool/api/v1/health

# 4. Test Cleanup endpoint
curl -s "https://coolwave.cool/api/v1/jobs/cleanup?secret=<YOUR_CRON_SECRET>"

# 5. Check Disk space & Temporary storage
df -h
du -sh /var/www/coolwave/.tmp/storage/*
```
commands 
# 1. SSH into Hostinger VPS
ssh root@<YOUR_VPS_IP>

# 2. Clone & install system binaries
apt update && apt install -y curl git ufw fail2ban certbot python3-certbot-nginx nginx ffmpeg tesseract-ocr tesseract-ocr-deu libreoffice-writer-nogpu
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs && npm install -g pm2

# 3. Setup CoolWave
cd /var/www && git clone <REPO_URL> coolwave && cd coolwave
cp .env.example .env.production && nano .env.production
npm ci && npm run build

# 4. Launch PM2 & Nginx
pm2 start ecosystem.config.js && pm2 save && pm2 startup
cp /var/www/coolwave/DEPLOYMENT.md /etc/nginx/sites-available/coolwave.cool # (Use Nginx block from DEPLOYMENT.md)
certbot --nginx -d coolwave.cool -d www.coolwave.cool
