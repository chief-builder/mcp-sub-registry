# Architecture Documentation

This section contains detailed architecture documentation for the MCP Sub-Registry system.

## System Overview

The MCP Sub-Registry is built as a modern monorepo with clear separation between frontend, backend, and shared components.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │────│  Express API    │────│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│  Shared Types   │──────────────┘
                        │  & Utilities    │
                        └─────────────────┘
```

## Architecture Documents

### [Database Design](./db-design.md)
Comprehensive database schema documentation including:
- Entity relationship diagrams
- Table structures and relationships
- Indexing strategy
- Migration approach

### [Service Layer Design](./service-layer-design.md)  
Backend service architecture covering:
- Express.js middleware stack
- Authentication and authorization
- Rate limiting and security
- API endpoint organization
- Error handling patterns

## Key Architectural Decisions

### Monorepo Structure
- **Rationale**: Shared types, coordinated deployments, simplified development
- **Trade-offs**: Slightly more complex build process for better maintainability

### TypeScript Throughout
- **Rationale**: Type safety, better developer experience, reduced runtime errors
- **Implementation**: Strict mode enabled, shared types package

### Authentication Strategy
- **Dual approach**: JWT for users, API keys for services  
- **Rationale**: Different use cases require different authentication methods
- **Security**: Bcrypt hashing, configurable secrets, rate limiting

### Database Choice
- **PostgreSQL with Prisma ORM**
- **Rationale**: ACID compliance, JSON support, excellent TypeScript integration
- **Benefits**: Type-safe queries, automatic migrations, excellent tooling

### API Design
- **REST with OpenAPI specification**
- **Rationale**: Standard patterns, excellent tooling, client generation
- **Structure**: Versioned endpoints, consistent error handling, comprehensive documentation

## Technology Stack

### Backend (packages/api)
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Monitoring**: Prometheus metrics
- **Validation**: Zod schemas
- **Security**: Helmet, CORS, rate limiting

### Frontend (packages/ui)  
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **UI Components**: Headless UI + custom components
- **Forms**: React Hook Form with Zod validation

### Shared (packages/shared)
- **Types**: Common TypeScript interfaces
- **Constants**: Shared configuration and enums
- **Utilities**: Helper functions and validators

## Security Architecture

### Authentication Flow
1. User registration with optional admin setup key
2. JWT token generation and validation
3. API key generation for service authentication
4. Rate limiting per authentication method

### Data Protection
- Password hashing with bcrypt
- JWT secrets configurable via environment
- API keys with proper entropy
- Database connection encryption

### Input Validation
- Zod schemas for request validation
- TypeScript types for compile-time safety
- Sanitization of user inputs
- SQL injection protection via Prisma

## Performance Considerations

### Database Optimization
- Proper indexing on query fields
- Connection pooling via Prisma
- Query optimization for discovery endpoints

### Caching Strategy
- HTTP caching headers for static content
- In-memory caching for frequently accessed data
- CDN integration for frontend assets

### Scalability
- Stateless API design for horizontal scaling
- Database read replicas support
- Containerized deployment with Docker

## Development Workflow

### Local Development
```bash
npm install          # Install all dependencies
npm run dev         # Start all development servers
npm run test        # Run test suite
npm run lint        # Code quality checks
```

### Build Process
```bash
npm run build       # Build all packages
npm run type-check  # TypeScript validation
npm run generate:client  # Generate API client
```

### Deployment
- Docker containerization
- Environment-based configuration
- Database migration automation
- Health check endpoints for monitoring