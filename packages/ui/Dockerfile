# Multi-stage build for UI
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files for workspaces
COPY ../../package.json ../../package-lock.json ./

# Copy packages
COPY package.json ./packages/ui/
COPY ../shared/package.json ./packages/shared/

# Install all dependencies
RUN npm ci

# Copy source code
COPY . ./packages/ui/
COPY ../shared/ ./packages/shared/

# Build shared package first
WORKDIR /app/packages/shared
RUN npm run build

# Build UI
WORKDIR /app/packages/ui
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS production

# Copy built app to nginx
COPY --from=builder /app/packages/ui/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginxgroup && \
    adduser -S nginxuser -u 1001 -G nginxgroup

EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5173/ || exit 1

CMD ["nginx", "-g", "daemon off;"]