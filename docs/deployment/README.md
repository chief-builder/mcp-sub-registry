# Deployment Guide

This guide covers deploying the MCP Sub-Registry in various environments.

## Docker Deployment

### Prerequisites

- Docker and Docker Compose
- PostgreSQL database (or use Docker PostgreSQL)

### Quick Start

1. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

2. **Build and start services:**
```bash
# Build the application
npm run build

# Start with Docker Compose
docker-compose up -d
```

3. **Initialize the database:**
```bash
# Run database migrations
docker exec -it mcp-registry-api npm run db:migrate

# (Optional) Seed sample data
docker exec -it mcp-registry-api npm run db:seed
```

### Environment Configuration

Key environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mcp_registry"

# Authentication
JWT_SECRET="your-jwt-secret-key"
ADMIN_SETUP_KEY="your-admin-setup-key"

# Server
PORT=3010
NODE_ENV=production

# CORS (optional)
CORS_ORIGINS="https://your-frontend-domain.com"
```

## Production Considerations

### Security

- Use strong, unique secrets for JWT_SECRET and ADMIN_SETUP_KEY
- Configure CORS_ORIGINS for your frontend domain
- Enable HTTPS/TLS termination at load balancer level
- Use PostgreSQL with SSL connections
- Keep dependencies updated

### Monitoring

- The API exposes Prometheus metrics at `/metrics`
- Configure logging aggregation for application logs
- Set up health check monitoring for `/v0/health`

### Scaling

- The application is stateless and can be horizontally scaled
- Database connection pooling is configured automatically
- Consider using a Redis session store for multi-instance deployments

### Performance

- Enable gzip compression at reverse proxy level
- Configure database query optimization
- Use CDN for static frontend assets
- Implement database connection pooling

## Cloud Deployment

### AWS

1. Use ECS or EKS for container orchestration
2. RDS PostgreSQL for managed database
3. Application Load Balancer for traffic distribution
4. CloudWatch for monitoring and logging

### Google Cloud

1. Use Cloud Run or GKE for container deployment  
2. Cloud SQL for PostgreSQL hosting
3. Load Balancer for traffic management
4. Cloud Logging and Monitoring

### Azure

1. Container Instances or AKS for deployment
2. Azure Database for PostgreSQL
3. Application Gateway for load balancing
4. Azure Monitor for observability

## Development vs Production

### Development
```bash
npm run dev
```
- Hot reloading enabled
- Detailed error messages
- Development database

### Production
```bash
npm run build
npm run start
```
- Optimized builds
- Error logging only
- Production database with SSL