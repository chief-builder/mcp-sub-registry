# Multi-stage build for monorepo API.
# NOTE: base images use an active Node LTS (20). For supply-chain integrity,
# pin these to immutable sha256 digests via a controlled update process
# (e.g. Renovate/Dependabot) in your environment.
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy root package files for workspaces
COPY package.json package-lock.json ./

# Copy packages
COPY packages/api/package.json ./packages/api/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies
RUN npm ci

# Copy source code
COPY packages/api/src/ ./packages/api/src/
COPY packages/api/tsconfig.json ./packages/api/
COPY packages/api/prisma/schema.prisma ./packages/api/prisma/
COPY packages/shared/ ./packages/shared/

# Build shared package first
WORKDIR /app/packages/shared
RUN npm run build

# Build API
WORKDIR /app/packages/api
RUN npx prisma generate
RUN npx tsc

# Production stage
FROM node:20-alpine AS production

ENV NODE_ENV=production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/shared/package.json ./packages/shared/

# Install production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy built applications
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY packages/api/prisma/schema.prisma ./packages/api/prisma/schema.prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apiuser -u 1001
USER apiuser

EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3010/v0.1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

CMD ["node", "packages/api/dist/index.js"]