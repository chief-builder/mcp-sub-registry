# 🔧 MCP Sub-Registry API

The backend API service for the MCP Sub-Registry enterprise suite. Provides a MCP-compliant registry API with enterprise security, monitoring, and governance features.

## 🚀 Features

- **MCP-Compliant**: Implements official MCP Registry API v2025-07-09
- **Dual Authentication**: JWT tokens for admin access, API keys for service-to-service
- **Enterprise Security**: Rate limiting, security headers, input validation
- **PostgreSQL Database**: Prisma ORM with migrations and type safety  
- **Monitoring**: Health checks, Prometheus metrics, structured logging
- **Comprehensive Testing**: Unit, integration, and end-to-end test suites

## 📋 API Endpoints

### MCP Registry API (Public)
- `GET /v0/servers` - List all servers with pagination and filtering
- `GET /v0/servers/{id}` - Get specific server details
- `POST /v0/publish` - Publish a new server (requires API key)
- `GET /v0/health` - MCP protocol compliance health check

### Authentication API
- `POST /api/v1/auth/register` - Register admin user (restricted)
- `POST /api/v1/auth/login` - Admin login with JWT token
- `GET /api/v1/auth/me` - Get current user information

### API Key Management
- `POST /api/v1/api-keys/create` - Create new API key (admin only)
- `GET /api/v1/api-keys` - List user's API keys
- `GET /api/v1/api-keys/{id}` - Get API key details
- `PATCH /api/v1/api-keys/{id}` - Update API key
- `DELETE /api/v1/api-keys/{id}` - Delete API key

### System Endpoints
- `GET /health` - Application health check
- `GET /metrics` - Prometheus metrics

## 🛠 Development

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Quick Start
```bash
# Install dependencies (run from monorepo root)
npm install

# Set up database
npm run db:generate
npm run db:push

# Start development server
npm run dev:api
```

### Available Scripts
```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run all tests
npm run lint             # Lint code
npm run db:studio        # Open Prisma Studio
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the monorepo root:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mcp_registry"

# JWT Configuration
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="8h"

# Server Configuration
PORT=3010
NODE_ENV="development"

# Admin Setup Key (for initial user registration)
ADMIN_SETUP_KEY="your-admin-setup-key"

# Security
BCRYPT_ROUNDS=12
MAX_API_KEYS_PER_USER=10

# CORS (comma-separated origins)
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

### Database Schema
The API uses Prisma with PostgreSQL. Key models:
- **Server**: MCP server registry entries
- **User**: Admin users and authentication
- **ApiKey**: Service authentication tokens
- **AuditLog**: Activity tracking and compliance

## 🔐 Security

### Authentication
- **JWT Tokens**: For admin UI and management operations
- **API Keys**: For service-to-service authentication and publishing
- **Scoped Access**: Read-only and publisher permissions

### Security Features
- **Rate Limiting**: Configurable per-endpoint limits
- **Security Headers**: Comprehensive HTTP security headers
- **Input Validation**: Joi schema validation for all endpoints
- **Audit Logging**: Complete activity trail
- **Password Hashing**: bcrypt with configurable rounds

### Production Considerations
- Change default JWT secret and admin setup key
- Configure proper CORS origins
- Set up proper database credentials
- Enable TLS/HTTPS
- Configure rate limiting for your traffic patterns

## 📊 Monitoring

### Health Checks
- `GET /health` - Basic application health
- `GET /v0/health` - MCP protocol compliance check

### Metrics
Prometheus metrics available at `/metrics`:
- Request rates and response times
- Database connection pool status
- Custom business metrics (server counts, user activity)
- System metrics (memory, CPU usage)

### Logging
Structured JSON logging with configurable levels:
- Request/response logging
- Error tracking and stack traces
- Database query logging
- Security event logging

## 🧪 Testing

### Test Structure
```bash
src/__tests__/
├── unit/           # Unit tests for individual functions
├── integration/    # API integration tests
└── e2e/           # End-to-end workflow tests
```

### Running Tests
```bash
npm run test              # All tests
npm run test:unit         # Unit tests only  
npm run test:integration  # Integration tests
npm run test:e2e         # End-to-end tests
npm run test:coverage    # With coverage report
```

### Test Configuration
- **Jest** test runner with TypeScript support
- **Supertest** for API endpoint testing
- **Test database** isolation for integration tests
- **Coverage reporting** with threshold enforcement

## 🐳 Docker

### Build Image
```bash
npm run docker:build
```

### Run Container
```bash
npm run docker:run
```

### Production Deployment
```bash
docker build -t mcp-registry-api .
docker run -d -p 3010:3010 --env-file .env mcp-registry-api
```

## 📚 API Documentation

Interactive API documentation is available when running the server:
- **OpenAPI Spec**: Generated from the codebase
- **Swagger UI**: Interactive API explorer at `/docs`
- **Schema Validation**: Request/response validation

## 🔄 Development Workflow

1. **Make changes** to source code
2. **Run tests** to ensure functionality
3. **Update database schema** if needed (Prisma migrate)
4. **Generate API client** for frontend (if OpenAPI changed)
5. **Test integration** with UI package
6. **Update documentation** as needed

## 🚢 Deployment

### Production Environment
1. **Build the application**: `npm run build:prod`
2. **Run database migrations**: `npm run db:migrate:prod`
3. **Start the server**: `npm run start:prod`

### Environment-Specific Configuration
- **Development**: Hot reloading, detailed logging
- **Staging**: Production build, test data
- **Production**: Optimized build, security hardening

## 📈 Performance

### Optimization Features
- **Database connection pooling** via Prisma
- **Response compression** with gzip
- **Caching headers** for static content
- **Rate limiting** to prevent abuse
- **Database indexing** for query performance

### Scaling Considerations
- **Stateless design** for horizontal scaling
- **Database read replicas** support
- **Redis session store** (configurable)
- **Load balancer ready** health checks

---

For more information, see the [main documentation](../../docs/README.md) or [OpenAPI specification](../../openapi.yaml).