# CoolWave Database Architecture & Administration Guide

This guide documents the database architecture, Prisma ORM setup, migration workflows, and production deployment on **Azure Database for PostgreSQL Flexible Server**.

---

## 1. Overview & Technology Stack

* **ORM**: [Prisma ORM](https://www.prisma.io/) v6.4.1 (`@prisma/client` + `prisma`)
* **Database Engine**: PostgreSQL 16+
* **Production Hosting**: Azure Database for PostgreSQL Flexible Server
* **Connection Pooling**: PgBouncer / Prisma client singleton with graceful disconnection handling
* **Data Policy**: **Zero Document Content Storage**. Only job metadata (IDs, MIME types, duration, byte counts, failure codes) is persisted. User document streams are never written to database rows.

---

## 2. Schema Architecture

The Prisma schema is defined in [`prisma/schema.prisma`](./prisma/schema.prisma):

| Model | Purpose | Key Fields |
| :--- | :--- | :--- |
| `User` | Authenticated users & role management | `id`, `email`, `passwordHash`, `name`, `role` (`USER`/`ADMIN`), `plan` (`free`/`pro`), `createdAt`, `lastLoginAt` |
| `Session` | Persistent browser sessions (via `cw_session` HTTP-only cookie) | `id`, `sessionToken`, `userId`, `expiresAt`, `createdAt` |
| `Subscription` | Stripe billing state mirror | `id`, `userId`, `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`, `status`, `plan`, `currentPeriodEnd` |
| `ConversionJob` | Ephemeral conversion metadata & audit | `id`, `userId`, `toolId`, `status` (`COMPLETED`/`FAILED`), `inputMime`, `outputMime`, `inputSize`, `durationMs`, `failureCode` |
| `UserUsage` | Daily quota usage tracking | `id`, `userId`, `dateKey`, `conversionsCount`, `ocrPagesCount` |
| `ToolConfiguration` | Runtime administrative overrides over static code registry | `id`, `toolSlug`, `enabled`, `hidden`, `isFeatured`, `isComingSoon`, `freeMaxFileSizeMB`, `proMaxFileSizeMB`, SEO overrides |
| `AdminSettings` | Global system settings & maintenance toggles | `id`, `key`, `value` (JSON string), `description`, `updatedAt` |
| `AuditLog` | Immutable record of administrative operations | `id`, `actorUserId`, `action`, `targetType`, `targetId`, `metadata`, `timestamp` |

---

## 3. Local Development (Docker Compose)

To start a local PostgreSQL 16 instance with automated persistence:

```bash
# Start local PostgreSQL and Redis containers
docker compose up -d postgres redis

# Check container health
docker compose ps
```

Connection string for local development:
```env
DATABASE_URL="postgresql://coolwave_user:coolwave_secure_pass@localhost:5432/coolwave_db?schema=public"
```

Apply migrations locally:
```bash
npm run db:migrate
```

---

## 4. Azure Database for PostgreSQL Flexible Server Setup

### Step 1: Provision Flexible Server
1. In the Azure Portal, create an **Azure Database for PostgreSQL Flexible Server**.
2. Select PostgreSQL version **16**.
3. Choose the Compute Tier (e.g. `Standard_B1ms` or `General Purpose D2ds_v5` depending on expected workload).
4. Configure administrator credentials (e.g. `cwadmin`).

### Step 2: Configure Networking & Firewall
> [!IMPORTANT]
> **Never open PostgreSQL to the entire internet (`0.0.0.0/0`)**.
1. Under **Networking**, enable **Public access (allowed IP addresses)** or configure a **Private Endpoint (VNet integration)**.
2. In the Firewall rules, add the exact static outbound IP of your application server / Azure Container App.
3. Check the box **"Allow public access from any Azure service within Azure to this server"** only if CoolWave is hosted inside the same Azure region.

### Step 3: Enforce SSL/TLS
1. Under **Server Parameters**, verify `require_secure_transport = ON` and `ssl_min_protocol_version = TLSv1.2`.
2. Append `?sslmode=require` to your connection string.

### Step 4: Obtain Connection String
Format:
```env
DATABASE_URL="postgresql://cwadmin:YOUR_AZURE_PASSWORD@coolwave-pg-server.postgres.database.azure.com:5432/coolwave?sslmode=require"
```

---

## 5. Migration Workflow

Migrations are version-controlled in [`prisma/migrations/`](./prisma/migrations/).

### Development (Creating new schema changes)
```bash
# Generate Prisma Client after schema changes
npm run db:generate

# Create and apply a new migration locally
npm run db:migrate
```

### Production Deployment (Azure)
In production CI/CD or deployment pipelines, run:
```bash
# Deploys all pending versioned migrations without interactive prompts
npm run db:deploy
```
*Never use `prisma db push` in production.*

---

## 6. Initial Administrator Setup

To promote or create your initial administrator account securely without default credentials:

```bash
# Method A: Interactive CLI prompt
npm run admin:create

# Method B: Pre-configured environment variables
ADMIN_INITIAL_EMAIL="admin@coolwave.cool" \
ADMIN_INITIAL_PASSWORD="YourSecurePassword2026!" \
npm run db:seed
```

---

## 7. Backups & Disaster Recovery

### Azure Automated Backups
* Azure Flexible Server performs automatic full backups daily, differential backups every 12 hours, and transaction log backups every 5 minutes.
* Retention can be set from 7 to 35 days in the Azure Portal.
* **Point-in-Time Restore (PITR)** is available directly from the Azure Portal.

### Manual Off-site Dumps
```bash
pg_dump "$DATABASE_URL" --format=custom --file=coolwave_backup_$(date +%Y%m%d).dump
```

### Restoring from Dump
```bash
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" coolwave_backup_YYYYMMDD.dump
```

---

## 8. Troubleshooting & Fallback Behavior

* **Graceful Degradation**: If `DATABASE_URL` is offline or not configured during local development, CoolWave starts in Fallback Mode. In-memory sessions are maintained, anonymous conversions continue functioning, and no unhandled crashes occur.
* **Connection Timeouts**: Prisma connection pools are configured with automatic retries and ping verification via `checkDatabaseHealth()`.
* **Health Check**: Test database connectivity live at `GET /api/health` or `GET /api/health/ready`.
