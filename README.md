# MCP Sub-Registry

A production-ready Model Context Protocol (MCP) sub-registry with enterprise features, built as a modern monorepo with backend API and web UI.

## 🏗️ Architecture

This project is organized as a monorepo with three main packages:

```
mcp-sub-registry/
├── packages/
│   ├── api/           # Express.js backend API
│   ├── ui/            # React frontend application
│   └── shared/        # Common types and utilities
├── docs/              # Documentation
├── tools/             # Development scripts
└── docker-compose.yml # Local development setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- HTTPie (for testing)

### Setup

1. **Clone and install dependencies:**
```bash
git clone <repository>
cd mcp-sub-registry
npm install
```

2. **Set up development environment:**
```bash
./tools/scripts/dev-setup.sh
```

3. **Start the development environment:**
```bash
# Start database
npm run docker:up

# Run database migrations
npm run db:migrate

# Start both API and UI
npm run dev
```

4. **Access the applications:**
- **API**: http://localhost:3010
- **UI**: http://localhost:5173
- **API Docs**: http://localhost:3010/docs

## 🏗️ Development

### Development Commands

```bash
# Development
npm run dev              # Start both API and UI
npm run dev:api          # Start API only
npm run dev:ui           # Start UI only

# Building
npm run build            # Build all packages
npm run build:api        # Build API only
npm run build:ui         # Build UI only

# Testing
npm test                 # Run all tests
npm run test:api         # Run API tests
npm run test:ui          # Run UI tests

# Database
npm run db:migrate       # Run database migrations
npm run db:studio        # Open Prisma Studio

# Docker
npm run docker:up        # Start services
npm run docker:down      # Stop services
npm run docker:build     # Build containers

# Code Quality
npm run lint             # Lint all packages
npm run type-check       # TypeScript validation
npm run generate:client  # Generate API client

# End-to-End Testing
npm run test:e2e         # Run Playwright test suite
node tests/playwright/playwright-test-suite.js  # Run comprehensive test suite
```

### Docker Development
```bash
# Start all services with Docker
npm run docker:up

# Build containers
npm run docker:build

# Stop services
npm run docker:down
```

## 📋 Features

### 🔧 API Backend (`packages/api`)
- **MCP-Compliant**: Implements official MCP Registry API v2025-07-09
- **Enterprise Security**: JWT + API key authentication, rate limiting
- **Database**: PostgreSQL with Prisma ORM
- **Monitoring**: Health checks, Prometheus metrics
- **Testing**: Unit, integration, and e2e tests

### 🎨 Web Interface (`packages/ui`)
- **Modern React**: TypeScript, Vite, Tailwind CSS
- **Registry Browser**: Search, filter, discover MCP servers
- **Admin Dashboard**: User management, analytics, monitoring
- **Server Management**: Publish, edit, manage integration servers
- **Enterprise Features**: RBAC, audit logs, bulk operations
- **E2E Testing**: Comprehensive Playwright test suite

### 🔄 Shared Libraries (`packages/shared`)
- **Type Safety**: Shared TypeScript definitions
- **API Client**: Generated from OpenAPI specification
- **Utilities**: Common functions and constants
- **Validation**: Zod schemas for data validation

## 📚 Documentation

- **[API Documentation](docs/api/README.md)** - Backend API reference
- **[UI Documentation](docs/ui/README.md)** - Frontend development guide
- **[Deployment Guide](docs/deployment/README.md)** - Production deployment
- **[Demo Walkthrough](docs/demo/README.md)** - Interactive demonstration
- **[Test Documentation](tests/playwright/playwright-test-readme.md)** - E2E test suite
- **[MCP Registry White Paper](docs/MCP-Registry-White-Paper.md)** - Technical specification and implementation guide

## 🔐 Security

- **Authentication**: Dual JWT + API key system
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Configurable request throttling
- **Security Headers**: Comprehensive HTTP security headers
- **Audit Logging**: Complete activity tracking
- **Input Validation**: Schema-based request validation

## 📊 Monitoring & Operations

- **Health Checks**: Kubernetes-ready health endpoints
- **Metrics**: Prometheus-compatible metrics export
- **Logging**: Structured JSON logging
- **Database Monitoring**: Connection pooling and performance tracking
- **Error Tracking**: Comprehensive error handling and reporting

## 🚢 Deployment

### Development
```bash
npm run dev
```

### Production (Docker)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes
```bash
kubectl apply -f tools/k8s/
```

## 🏢 Enterprise Features

### Registry Management
- **Server Discovery**: Public catalog with advanced search
- **Publishing Workflow**: Managed server registration process
- **Version Control**: Semantic versioning and lifecycle management
- **Metadata Management**: Rich server metadata and tagging

### Team Collaboration
- **Role-Based Access**: Admin, publisher, and read-only roles
- **API Key Management**: Team-specific authentication tokens
- **Audit Trail**: Complete action history and compliance logging
- **Bulk Operations**: Efficient management of multiple servers

### Operations & Monitoring
- **Real-time Dashboards**: Usage analytics and system health
- **Alerting Integration**: PagerDuty, Slack, email notifications
- **Backup & Recovery**: Automated data protection
- **Scaling**: Horizontal scaling support

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- **TypeScript**: Strict type checking enabled
- **Testing**: Write tests for all new features
- **Linting**: Follow ESLint and Prettier configurations
- **Commits**: Use conventional commit messages
- **Documentation**: Update relevant documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **[API Documentation](http://localhost:3010/docs)** - Interactive API explorer
- **[GitHub Repository](https://github.com/company/mcp-sub-registry)**
- **[Issue Tracker](https://github.com/company/mcp-sub-registry/issues)**
- **[Wiki](https://github.com/company/mcp-sub-registry/wiki)**

---

**Status**: 🟢 Production Ready  
**MCP API Version**: v2025-07-09  
**Implementation Version**: 1.0.0