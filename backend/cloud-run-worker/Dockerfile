# ----------------------------------------------------------------------
# Stage 1: Build Environment
# ----------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /workspace

# Install native compilation dependencies for canvas and tesseract
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

# Copy monorepo manifests for optimal Docker layer caching
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY backend/cloud-run-worker/package.json ./backend/cloud-run-worker/

# Install dependencies across monorepo workspaces
RUN npm ci --include-workspace-root || npm install

# Copy source trees
COPY packages/shared ./packages/shared
COPY backend/cloud-run-worker ./backend/cloud-run-worker

# Build shared types/schemas first, then build the Cloud Run worker
RUN npm run build --workspace=@arcora/shared && \
    npm run build --workspace=@arcora/backend

# ----------------------------------------------------------------------
# Stage 2: Minimal Production Runtime
# ----------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Install runtime libraries only (no compiler toolchain)
RUN apk add --no-cache \
    cairo \
    pango \
    jpeg \
    giflib \
    librsvg \
    tesseract-ocr \
    curl

# Create unprivileged application user
RUN addgroup -S -g 1001 arcora && \
    adduser -S -u 1001 -G arcora arcora && \
    chown -R arcora:arcora /app

# Copy built node_modules and compilation artifacts from builder
COPY --from=builder --chown=arcora:arcora /workspace/node_modules ./node_modules
COPY --from=builder --chown=arcora:arcora /workspace/packages/shared ./packages/shared
COPY --from=builder --chown=arcora:arcora /workspace/backend/cloud-run-worker/dist ./dist
COPY --from=builder --chown=arcora:arcora /workspace/backend/cloud-run-worker/package.json ./package.json

USER arcora

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["node", "dist/index.js"]
