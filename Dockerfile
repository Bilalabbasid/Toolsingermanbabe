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
    ffmpeg \
    libreoffice-nogui \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    tesseract-ocr \
    tesseract-ocr-deu \
    tesseract-ocr-eng \
    fonts-dejavu-core \
    fonts-liberation \
    fonts-opensymbol \
    fonts-freefont-ttf \
    fonts-noto-core \
    librsvg2-bin \
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

# Set directories and permissions for temporary conversion workspace
RUN mkdir -p /app/public /app/.next /app/temp_uploads /app/.tmp /tmp/coolwave && \
    chown -R nextjs:nodejs /app /tmp/coolwave

# Copy necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV COOLWAVE_TEMP_DIR="/app/.tmp"

# Container healthcheck ensuring all external binaries and API readiness are online
HEALTHCHECK --interval=30s --timeout=8s --start-period=20s --retries=3 \
  CMD sh -c "command -v soffice >/dev/null && command -v gs >/dev/null && command -v ffmpeg >/dev/null && command -v pdftocairo >/dev/null && command -v 7z >/dev/null && command -v tesseract >/dev/null && curl -f http://localhost:3000/api/health/ready"

CMD ["node", "server.js"]
