# CoolWave — Production-Grade Online File & Document SaaS

> **Domain**: [coolwave.cool](https://coolwave.cool)  
> **Target Market**: German-first (DE), European SaaS, expanding across Europe.  
> **Direct Competitors**: Sejda, iLovePDF, Smallpdf, PDF24, Convertio.

---

## 🌟 Production Architecture Highlights

1. **Dual-Pipeline Execution (Privacy First)**:
   - **100% In-Browser (Client-Side)**: Pure client operations (PDF Merge, Split, Rotate, Extract, Watermark, Header/Footer, Metadata, Image Resizing/Crop/Rotate/DPI, and Dev Utilities) execute directly on client hardware via HTML5 Canvas, Web Workers, and WebAssembly (`pdf-lib`). Zero server bandwidth or privacy risk.
   - **Encrypted Server Pipeline (15-Minute Auto-Purge)**: Heavy document rendering runs in isolated ephemeral server directories with automated cleanup (`fs.unlink` upon job completion and a background cron job removing files older than 15 minutes).
2. **Native Conversion & Rendering Engines**:
   - **LibreOffice Headless**: Layout-preserving conversion for DOCX, DOC, PPTX, PPT, XLSX, XLS, and ODT files with embedded graphics, tables, and custom styles.
   - **Poppler (`pdftocairo`)**: High-DPI vector SVG and raster rendering preventing blank or missing graphic layers.
   - **Ghostscript**: Genuine ISO 19005 PDF/A-1b/2b archiving and multi-tier PDF compression (`/screen`, `/ebook`, `/printer`).
   - **Tesseract OCR**: Pre-installed German (`deu`) and English (`eng`) models for scanned document extraction.
   - **Unicode Font Embedding**: Dynamic TrueType font embedding (`Liberation Sans`, `DejaVu Sans`, `Arial`) using `@pdf-lib/fontkit` for full German umlauts (`ä, ö, ü, ß`) and international character sets.
   - **RFC 4180 CSV Engine**: Strict CSV parsing preserving leading zeros (`00123`), multiline fields, quotes, and custom delimiters.
3. **Security, Entitlements & Billing**:
   - **Stripe Billing**: Protected checkout pipeline requiring authenticated accounts and active database persistence to prevent orphaned subscriptions.
   - **Transactional Webhooks**: Atomic subscription updates and idempotency logging in `prisma.$transaction`; returns retriable 503/500 on database downtime.
   - **Server-Authoritative Pro Validation**: Entitlements are validated server-side against database sessions and API keys, completely ignoring client headers or localStorage manipulation.
   - **Rate Limiter with Proxy Trust**: Spoof-proof IP resolution supporting `TRUSTED_CLIENT_IP_HEADER` and `TRUST_PROXY=true` to prevent rate limit bypasses.
   - **ReDoS Protection**: Worker-isolated regex execution with strict 500ms timeouts and input length bounds on fallback threads.
4. **PostgreSQL Database & Prisma ORM**:
   - Production-ready for **PostgreSQL 16** (e.g. Azure Database for PostgreSQL Flexible Server or Docker PostgreSQL) with mandatory SSL.
   - Ephemeral metadata persistence only: **No private user files are permanently stored in the database**.
   - Graceful fallback: Core client-side tools run cleanly even if the database is temporarily offline.
5. **Container Orchestration & Health Checks**:
   - Multi-stage `Dockerfile` with native CLI engines (`libreoffice-nogui`, `ghostscript`, `poppler-utils`, `tesseract-ocr`).
   - `docker-compose.yml` for local staging with PostgreSQL 16 and Redis.
   - Dual health endpoints: `/api/health` for basic process liveness and `/api/health/ready` for container readiness.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20.x or 22.x LTS
- npm 10+
- (Optional) Docker for local PostgreSQL and native conversion libraries

### 2. Install Dependencies & Generate Database Client
```bash
npm install
npm run db:generate
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials or run in local fallback mode
```

### 4. Run Quality Gates & Tests
```bash
# Run automated Vitest test suite (41 tests across 8 suites)
npm test

# Run TypeScript strict typecheck
npm run typecheck

# Run ESLint gate check
npm run lint
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000/de](http://localhost:3000/de) in your browser.

---

## 🚢 Production Deployment

### Option A: Docker / Docker Compose (Recommended)
The multi-stage `Dockerfile` installs all native conversion tools (`libreoffice`, `ghostscript`, `poppler`, `tesseract`).
```bash
# Build and start all services (App, PostgreSQL, Redis)
docker-compose up -d --build

# Verify deployment readiness
curl -f http://localhost:3000/api/health/ready
```

### Option B: VPS / Hostinger Deployment
For Hostinger KVM VPS or custom Linux instances:
1. Ensure Ubuntu 22.04/24.04 with Node.js 20+ and native libraries installed:
   ```bash
   sudo apt update && sudo apt install -y libreoffice-nogui ghostscript poppler-utils tesseract-ocr tesseract-ocr-deu fonts-dejavu-core
   ```
2. Deploy the application:
   ```bash
   npm ci
   npm run db:generate
   npm run db:deploy
   npm run build
   npm run start
   ```
   Refer to [DEPLOYMENT.md](./DEPLOYMENT.md) and [DEPLOYMENT_HOSTINGER.md](./DEPLOYMENT_HOSTINGER.md) for full Nginx and SSL setup.

---

## 💻 Available CLI Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server on port 3000 |
| `npm run build` | Compiles Next.js production standalone build |
| `npm run start` | Starts production Next.js server |
| `npm test` | Runs the full Vitest automated test suite |
| `npm run test:unit` | Runs unit tests |
| `npm run test:coverage` | Generates test coverage report |
| `npm run typecheck` | Runs strict TypeScript typecheck (`tsc --noEmit`) |
| `npm run lint` | Runs ESLint checks across `src` |
| `npm run db:generate` | Generates the Prisma Client |
| `npm run db:migrate` | Runs database migrations (development) |
| `npm run db:deploy` | Deploys versioned migrations (production) |
| `npm run db:seed` | Seeds default admin settings and initial admin |
| `npm run admin:create` | Interactive CLI to securely create/promote an admin account |

---

## 📖 In-Depth Documentation

* [DATABASE.md](./DATABASE.md) — Schema, migrations, PostgreSQL setup, SSL, and backups.
* [STRIPE_SETUP.md](./STRIPE_SETUP.md) — Stripe keys, webhook configuration, price IDs, and verification.
* [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment on Azure, Hostinger VPS, Docker, and Cloudflare.
* [DEPLOYMENT_HOSTINGER.md](./DEPLOYMENT_HOSTINGER.md) — Hostinger VPS setup, systemd, Nginx reverse proxy, and SSL.
* [TESTING.md](./TESTING.md) — Vitest test suites, coverage details, and end-to-end user verification flows.

---

## 📄 License & Intellectual Property
Proprietary software &copy; CoolWave.cool. All rights reserved.
