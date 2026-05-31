# Multi-stage build for UI.
# NOTE: build context is the repository ROOT (see docker-compose.yml), so all
# COPY paths are repo-root-relative and never reach outside the context.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests for an install with a stable lockfile.
COPY package.json package-lock.json ./
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci

# Copy source.
COPY packages/shared/ ./packages/shared/
COPY packages/ui/ ./packages/ui/

# Build shared package first, then the UI.
WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/packages/ui
RUN npm run build

# Production stage with nginx, running as a non-root user.
FROM nginx:alpine AS production

# Copy built app and nginx config.
COPY --from=builder /app/packages/ui/dist /usr/share/nginx/html
COPY packages/ui/nginx.conf /etc/nginx/conf.d/default.conf

# Create a non-root user and grant it the paths nginx needs to write.
RUN addgroup -g 1001 -S nginxgroup \
    && adduser -S nginxuser -u 1001 -G nginxgroup \
    && touch /var/run/nginx.pid \
    && chown -R nginxuser:nginxgroup /var/run/nginx.pid /var/cache/nginx /usr/share/nginx/html /etc/nginx/conf.d

USER nginxuser

EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
