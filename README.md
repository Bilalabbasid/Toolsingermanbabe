# CoolWave — Production-Grade Online File & Document SaaS

> **Domain**: [coolwave.cool](https://coolwave.cool)  
> **Target Market**: German-first (DE), European SaaS, expanding across Europe.  
> **Direct Competitors**: Sejda, iLovePDF, Smallpdf, PDF24, Convertio.

---

## 🌟 Production Architecture Highlights

1. **Dual-Pipeline Execution (Privacy First)**:
   - **100% In-Browser (Tier A)**: Image conversions, compression, PDF merge, split, rotate, watermark, page extract, and interactive PDF editing run directly on client hardware via HTML5 Canvas & WebAssembly (`pdf-lib`, `tesseract.js`). Zero server bandwidth or privacy risks.
   - **True PDF Redaction vs. Whiteout**: Strict cryptographic/raster separation. Visual whiteout is clearly marked as non-permanent, while True Redaction permanently deletes text streams and re-rasters pages.
2. **PostgreSQL Database & Prisma ORM**:
   - Production-ready for **Azure Database for PostgreSQL Flexible Server** with mandatory SSL (`?sslmode=require`).
   - Ephemeral metadata persistence only: **No private user files are permanently stored in the database**.
   - Graceful fallback: Starts and runs cleanly even if `DATABASE_URL` is temporarily offline.
3. **User Authentication & RBAC**:
   - Secure Argon2 / Bcrypt password hashing (cost factor 12).
   - Cryptographic sessions stored in PostgreSQL and delivered via HTTP-only cookies (`cw_session`).
   - User roles (`USER`, `ADMIN`) with strict server-side authorization guards.
4. **Stripe Billing Integration**:
   - Real Stripe checkout session and customer portal creation.
   - Webhook signature verification and live status synchronization (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`).
   - Graceful standby mode when Stripe keys are not yet configured.
5. **Comprehensive Administrator Panel**:
   - Live dashboard at `/de/admin` with tabs for Tools, Jobs, Users, Subscriptions, System Health, Settings, and immutable Audit Logs.
   - Centralized service merging static code definitions with live database overrides.
6. **Docker & Container Orchestration**:
   - Multi-stage `Dockerfile` with native dependencies (`poppler-utils`, `ghostscript`, `fonts-dejavu`, `p7zip-full`).
   - `docker-compose.yml` for local staging with PostgreSQL 16 and Redis.
   - Health and readiness endpoints at `/api/health` and `/api/health/ready`.
7. **Automated Vitest Test Runner**:
   - Fast, reliable test suite covering authentication, entitlements, Stripe fallback, admin guards, true redaction, and healthchecks.
   - Built-in guard preventing destructive test runs against production databases.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20.x or 22.x LTS
- npm 10+
- (Optional) Docker for local PostgreSQL

### 2. Install Dependencies & Generate Database Client
```bash
npm install
npm run db:generate
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials or leave blank to test with fallback mode
```

### 4. Run Automated Tests
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000/de](http://localhost:3000/de) in your browser.

---

## 💻 Available CLI Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server on port 3000 |
| `npm run build` | Compiles production standalone build |
| `npm run start` | Starts production server |
| `npm test` | Runs the full Vitest automated test suite |
| `npm run test:unit` | Runs unit tests |
| `npm run test:coverage` | Generates test coverage report |
| `npm run db:generate` | Generates the Prisma Client |
| `npm run db:migrate` | Runs database migrations (development) |
| `npm run db:deploy` | Deploys versioned migrations (production/Azure) |
| `npm run db:seed` | Seeds default admin settings and initial admin |
| `npm run admin:create` | Interactive CLI to securely create/promote an admin account |

---

## 📖 In-Depth Documentation

* [DATABASE.md](./DATABASE.md) — Schema, migrations, Azure PostgreSQL Flexible Server setup, SSL, and backups.
* [STRIPE_SETUP.md](./STRIPE_SETUP.md) — Step-by-step Stripe keys, webhook configuration, price IDs, and verification.
* [DEPLOYMENT.md](./DEPLOYMENT.md) — Production deployment on Azure Container Apps, Hostinger VPS, and Cloudflare.
* [TESTING.md](./TESTING.md) — Vitest test suites, coverage details, and end-to-end user verification flows.

---

## 📄 License & Intellectual Property
Proprietary software &copy; CoolWave.cool. All rights reserved.
