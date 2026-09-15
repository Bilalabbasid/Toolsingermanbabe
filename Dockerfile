# syntax=docker/dockerfile:1
# -----------------------------------------------------------------------------
# CoolWave Multi-Stage Production Dockerfile
# Optimized for Next.js 16 Standalone Output & System Conversion Libraries
# -----------------------------------------------------------------------------

# 1. Base stage with system tools (Poppler, Ghostscript, native build tools)
FROM node:22-bookworm-slim AS base

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    poppler-utils \
    ghostscript \
    fonts-dejavu-core \
    fonts-liberation \
    p7zip-full \
    && rm -rf /var/lib/apt/lists/*

# 2. Dependencies stage
FROM base AS deps

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci --include=dev
RUN npx prisma generate

# 3. Builder stage
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# Build Next.js standalone
RUN npm run build

# 4. Production Runner stage
FROM base AS runner

WORKDIR /app

# Create unprivileged application user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

# Set directories and permissions
RUN mkdir -p /app/public /app/.next /app/temp_uploads && \
    chown -R nextjs:nodejs /app

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Container healthcheck using /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
