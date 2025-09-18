# Model Context Protocol (MCP) Registry Specification
## Technical Guide for Private MCP Sub-Registry Implementation

### Version 1.0 | September 2025

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Introduction to Model Context Protocol](#introduction-to-model-context-protocol)
3. [Understanding MCP Registry Architecture](#understanding-mcp-registry-architecture)
4. [The MCP Registry Specification](#the-mcp-registry-specification)
5. [Security and Compliance](#security-and-compliance)
6. [Integration Patterns](#integration-patterns)
7. [User Interface Overview](#user-interface-overview)
8. [Best Practices](#best-practices)
9. [Conclusion](#conclusion)
10. [Technical Appendix](#technical-appendix)

---

## Executive Summary

The Model Context Protocol (MCP) provides a standardized interface for AI models to interact with external data sources and services. This document presents the MCP Registry specification v2025-07-09 and provides technical guidance for implementing private MCP sub-registries within enterprise environments.

### Key Points:

- **MCP Protocol**: Standardized communication between AI models and services
- **Registry Purpose**: Centralized discovery and management of MCP servers
- **Implementation**: RESTful API with OpenAPI 3.0.3 specification
- **Security**: Dual authentication system (JWT + API keys)
- **Reference Implementation**: Production-ready codebase available

---

## Introduction to Model Context Protocol

### What is MCP?

The Model Context Protocol (MCP) is an open standard that defines how AI models interact with external data sources, APIs, and services. Key features include:

1. **Standardized Interface**: Common API patterns for service interaction
2. **Service Discovery**: Dynamic discovery of available capabilities
3. **Authentication**: Built-in security mechanisms
4. **Versioning**: Semantic versioning for compatibility

### The Role of MCP Registries

MCP Registries address the challenges of managing multiple MCP servers:

- **Service Discovery**: Central catalog of available MCP servers
- **Version Management**: Track multiple versions of services
- **Access Control**: Manage who can access which services
- **Metadata Storage**: Store configuration and documentation

---

## Understanding MCP Registry Architecture

### Core Components

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          Enterprise Environment                            │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────┐         ┌──────────────────────────┐               │
│  │   AI Models     │  REST   │    MCP Registry API      │               │
│  │  ┌──────────┐  │  API    │  ┌────────────────────┐  │               │
│  │  │ Claude   │  │◄────────►│  │ Service Discovery  │  │               │
│  │  │ GPT-4    │  │  JWT/    │  │ Authentication     │  │               │
│  │  │ Custom   │  │  API Key │  │ Authorization      │  │               │
│  │  └──────────┘  │         │  │ Metadata Mgmt      │  │               │
│  └─────────────────┘         │  └────────────────────┘  │               │
│                              └─────────────┬────────────┘               │
│                                            │                             │
│                              ┌─────────────┴────────────┐               │
│                              │   PostgreSQL Database     │               │
│                              │  ┌────────────────────┐  │               │
│                              │  │ • Users & Auth     │  │               │
│                              │  │ • MCP Servers      │  │               │
│                              │  │ • API Keys         │  │               │
│                              │  │ • Audit Logs       │  │               │
│                              │  └────────────────────┘  │               │
│                              └──────────────────────────┘               │
│                                                                           │
│  ┌───────────────────── Registered MCP Servers ────────────────────────┐ │
│  │                                                                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │ │
│  │  │   GitHub    │  │ Confluence  │  │   Splunk    │                │ │
│  │  │ MCP Server  │  │ MCP Server  │  │ MCP Server  │                │ │
│  │  │             │  │             │  │             │                │ │
│  │  │ Repository  │  │    Wiki     │  │    Logs     │                │ │
│  │  │ Management  │  │   Access    │  │  Analytics  │                │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                │ │
│  │                                                                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │ │
│  │  │  Database   │  │    ERP      │  │   Custom    │                │ │
│  │  │ MCP Server  │  │ MCP Server  │  │ MCP Server  │                │ │
│  │  │             │  │             │  │             │                │ │
│  │  │ SQL Query   │  │  Business   │  │  Internal   │                │ │
│  │  │ Interface   │  │   Logic     │  │  Services   │                │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
```

### Registry Functions

1. **Service Discovery**
   - Catalog of available MCP servers
   - Search and filtering capabilities
   - Status tracking (stable, beta, experimental)

2. **Authentication & Authorization**
   - JWT tokens for administrative operations
   - API keys for service access
   - Role-based access control

3. **Metadata Management**
   - Service descriptions and documentation
   - Version information
   - Configuration parameters

4. **Monitoring**
   - Usage tracking
   - Basic health checks
   - Audit logging

---

## The MCP Registry Specification

### API Specification (v2025-07-09)

The MCP Registry API follows RESTful principles and is defined using OpenAPI 3.0.3.

#### Core Endpoints

##### Discovery Endpoint
```http
GET /v0
```
Returns registry metadata:
```json
{
  "mcpVersion": "2025-07-09",
  "serverUrl": "https://registry.example.com",
  "description": "MCP Registry"
}
```

##### List Servers
```http
GET /v0/servers
```
Query Parameters:
- `search` (string): Search by name or description
- `status` (string): Filter by status (stable|beta|experimental)
- `limit` (integer): Results per page (default: 20, max: 100)
- `offset` (integer): Pagination offset (default: 0)

Response:
```json
{
  "servers": [
    {
      "id": "uuid",
      "name": "com.example.service",
      "description": "Service description",
      "version": "1.0.0",
      "status": "stable",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "_meta": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

##### Get Server Details
```http
GET /v0/servers/{id}
```
Returns complete server information including optional metadata.

##### Publish Server
```http
POST /v0/servers
Authorization: Bearer {jwt_token}
```
Request body:
```json
{
  "name": "com.example.service",
  "description": "Service description",
  "version": "1.0.0",
  "status": "experimental",
  "repository": {
    "type": "git",
    "url": "https://github.com/example/service"
  },
  "packages": [{
    "registry": "npm",
    "name": "@example/service",
    "version": "1.0.0"
  }],
  "remote": {
    "transport": "https",
    "url": "https://api.example.com/mcp"
  }
}
```

##### Update Server
```http
PUT /v0/servers/{id}
Authorization: Bearer {jwt_token}
```

##### Delete Server
```http
DELETE /v0/servers/{id}
Authorization: Bearer {jwt_token}
```

### Data Models

#### MCP Server Model

```typescript
interface MCPServer {
  // Required fields
  id: string;
  name: string;              // Unique identifier using reverse domain notation
  description: string;       // Human-readable description
  version: string;          // Semantic version
  status: ServerStatus;     // stable | beta | experimental
  created_by: string;       // Publisher user ID
  created_at: string;       // ISO 8601 timestamp
  updated_at: string;       // ISO 8601 timestamp
  
  // Optional metadata
  repository?: Repository;   // Source code location
  packages?: Package[];     // Distribution packages
  remote?: RemoteConfig;    // Remote connection info
  tags?: string[];         // Categorization tags
}

enum ServerStatus {
  EXPERIMENTAL = "experimental",
  BETA = "beta", 
  STABLE = "stable"
}

interface Repository {
  type: "git" | "svn";
  url: string;
  branch?: string;
  tag?: string;
  commit?: string;
}

interface Package {
  registry: "npm" | "pypi" | "docker" | "maven";
  name: string;
  version: string;
}

interface RemoteConfig {
  transport: "stdio" | "http" | "https" | "ws" | "wss";
  url?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
}
```

### Authentication

The registry uses two authentication mechanisms:

#### 1. JWT Tokens (Administrative Operations)
Used for publishing, updating, and deleting servers:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Token payload includes:
- User ID
- Email
- Role (admin, publisher, user)
- Expiration time

#### 2. API Keys (Read Operations)
Used for discovering and accessing server information:
```http
X-API-Key: mcp_k_1234567890abcdef
```

API keys features:
- Prefixed with `mcp_k_` for identification
- Scoped permissions
- Usage tracking
- Optional expiration

### Error Responses

Standard error format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid server name format",
    "details": {
      "field": "name",
      "reason": "Must use reverse domain notation"
    }
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `CONFLICT`: Resource already exists
- `RATE_LIMITED`: Too many requests

---

## Security and Compliance

### Security Architecture

The MCP Registry implements a layered security approach:

#### 1. Transport Security
- TLS 1.2+ required for all connections
- Strong cipher suites only
- Certificate validation

#### 2. Authentication
- Dual authentication system (JWT + API keys)
- Password requirements:
  - Minimum 8 characters
  - Must include uppercase, lowercase, numbers
  - Bcrypt hashing (12 rounds)

#### 3. Authorization
- Role-based access control:
  - **Admin**: Full system access
  - **Publisher**: Can publish/manage own servers
  - **User**: Read-only access
- Resource-level permissions

#### 4. Rate Limiting
- Default: 100 requests per 15 minutes
- Configurable per API key
- Standard headers: `X-RateLimit-*`

#### 5. Input Validation
- Schema validation for all inputs
- SQL injection prevention via parameterized queries
- XSS protection through output encoding

### Audit Logging

All significant actions are logged:
```json
{
  "timestamp": "2024-09-17T10:30:00Z",
  "user_id": "user_123",
  "action": "SERVER_PUBLISHED",
  "resource": "server_456",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

### Security Headers

Required HTTP security headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

---

## Integration Patterns

### 1. Direct REST API Integration

Basic integration using standard HTTP clients:

```typescript
class MCPRegistryClient {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  async listServers(params?: {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ServerListResponse> {
    const url = new URL(`${this.baseUrl}/v0/servers`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'X-API-Key': this.apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Registry error: ${response.statusText}`);
    }

    return response.json();
  }

  async getServer(id: string): Promise<MCPServer> {
    const response = await fetch(
      `${this.baseUrl}/v0/servers/${id}`,
      {
        headers: {
          'X-API-Key': this.apiKey,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Server not found: ${id}`);
    }

    return response.json();
  }
}
```

### 2. Publishing Servers

Example of publishing a new MCP server:

```typescript
async function publishServer(
  registryUrl: string,
  token: string,
  server: PublishServerRequest
): Promise<MCPServer> {
  const response = await fetch(
    `${registryUrl}/v0/servers`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(server)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

// Usage
const newServer = await publishServer(
  'https://registry.example.com',
  jwtToken,
  {
    name: 'com.example.ai-service',
    description: 'AI service for data analysis',
    version: '1.0.0',
    status: 'experimental',
    repository: {
      type: 'git',
      url: 'https://github.com/example/ai-service'
    }
  }
);
```

### 3. Service Discovery Pattern

Implementing service discovery with caching:

```typescript
class ServiceDiscovery {
  private cache = new Map<string, MCPServer>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  
  constructor(
    private registry: MCPRegistryClient
  ) {}

  async findServer(name: string): Promise<MCPServer | null> {
    // Check cache first
    const cached = this.cache.get(name);
    if (cached) {
      return cached;
    }

    // Search registry
    const response = await this.registry.listServers({
      search: name,
      limit: 1
    });

    if (response.servers.length === 0) {
      return null;
    }

    const server = response.servers[0];
    this.cache.set(name, server);
    
    // Clear cache after expiry
    setTimeout(() => {
      this.cache.delete(name);
    }, this.cacheExpiry);

    return server;
  }
}
```

---

## User Interface Overview

The reference implementation includes a complete web-based administration interface built with React and TypeScript. The following screenshots demonstrate the key features:

### Login Interface

![Login Page](screenshots/01-login-page.png)

The login page provides secure authentication using email and password. The interface is responsive and includes proper form validation.

### Administrative Dashboard

![Admin Dashboard](screenshots/02-dashboard.png)

The main dashboard provides an overview of system metrics including:
- Total registered MCP servers
- Active user count  
- API usage statistics
- Quick action buttons
- Recent activity feed

### Server Discovery and Management

![Server Listing](screenshots/03-server-listing.png)

The server listing page enables:
- **Search and Filtering**: Find servers by name, description, or status
- **Status Indicators**: Visual indicators for stable, beta, and experimental servers
- **Pagination**: Efficient browsing of large server catalogs
- **Quick Actions**: Direct access to server details and management functions

### Server Publishing Workflow

The server publishing process consists of a guided multi-step workflow that ensures complete and accurate server registration:

#### Step 1: Basic Information

Initial form presentation:
![Basic Information Form](screenshots/publish-step1-basic-info.png)

Completed form with sample data:
![Basic Information Filled](screenshots/publish-step1-basic-info-filled.png)

The initial step captures essential server metadata:
- **Server Name**: Unique identifier using reverse domain notation (`com.demo.workflow-server`)
- **Version**: Semantic version number (`1.0.0`)
- **Description**: Detailed explanation of server functionality
- **Status**: Development stage (experimental, beta, stable)

#### Step 2: Repository Information
![Repository Information](screenshots/publish-step2-repository.png)

Optional repository details for source code access:
- **Repository Type**: Git, SVN, or other version control systems
- **URL**: Location of the source code repository
- **Branch/Tag**: Specific version references
- **Commit Hash**: Exact code snapshot identification

#### Step 3: Package Information
![Package Information](screenshots/publish-step3-packages.png)

Distribution package metadata for easy installation:
- **Package Registry**: npm, PyPI, Docker Hub, or Maven Central
- **Package Name**: Official package identifier
- **Version**: Package version corresponding to the server version
- **Multiple Packages**: Support for multi-language distributions

#### Step 4: Remote Configuration
![Remote Configuration](screenshots/publish-step4-remote.png)

Connection details for remotely accessible MCP servers:
- **Transport Protocol**: HTTP, HTTPS, WebSocket, or stdio
- **Endpoint URL**: Remote server connection address
- **Authentication**: Connection credentials and security parameters
- **Environment Variables**: Runtime configuration options

#### Step 5: Review and Publish
![Review and Publish](screenshots/publish-step5-review.png)

Final review stage with complete server configuration:
- **Configuration Summary**: All entered information displayed for verification
- **Validation**: Automatic checks for completeness and format compliance
- **Preview**: How the server will appear in the registry
- **Publish Action**: Final confirmation and submission

#### Step 6: Published Server
![Published Server](screenshots/publish-step6-success.png)

Confirmation page showing the successfully published server:
- **Server Details**: Complete published information
- **Registry URL**: Direct link to the server's registry entry
- **Integration Instructions**: How to use the newly published server
- **Management Options**: Edit, update, or unpublish controls

These interfaces demonstrate how the MCP Registry API can be consumed through a user-friendly web application, providing both technical users and administrators with the tools needed to manage their MCP server ecosystem effectively.

---

## Best Practices

### 1. Server Naming Conventions

Use reverse domain notation for unique, hierarchical names:
```
com.company.department.service-name
org.organization.project.component
```

Examples:
- `com.acme.sales.lead-enrichment`
- `org.hospital.radiology.image-analyzer`
- `edu.university.research.nlp-tool`

### 2. Versioning Strategy

Follow Semantic Versioning (SemVer) 2.0.0:
- **Major** (X.0.0): Breaking changes
- **Minor** (x.Y.0): New features, backward compatible
- **Patch** (x.y.Z): Bug fixes, backward compatible

### 3. Status Lifecycle

Recommended progression:
1. **experimental**: Initial development, may have breaking changes
2. **beta**: Feature complete, testing for stability
3. **stable**: Production ready, follows SemVer

### 4. Documentation Standards

Each MCP server should document:
- **Purpose**: Clear description of functionality
- **Authentication**: Required credentials and setup
- **Capabilities**: List of available operations
- **Examples**: Sample requests and responses
- **Limitations**: Rate limits, data restrictions

### 5. API Key Management

- Use descriptive names for API keys
- Implement key rotation policies
- Monitor key usage
- Set appropriate expiration dates
- Use separate keys for different environments

### 6. Error Handling

Implement robust error handling:
```typescript
try {
  const server = await registry.getServer(id);
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    // Handle missing server
  } else if (error.code === 'RATE_LIMITED') {
    // Implement backoff strategy
  } else {
    // Generic error handling
  }
}
```

### 7. Performance Optimization

- Implement client-side caching
- Use pagination for large result sets
- Batch requests when possible
- Monitor API response times

---

## Conclusion

The MCP Registry specification provides a foundation for managing Model Context Protocol servers in enterprise environments. By implementing a private registry, organizations can:

1. **Standardize** service discovery and management
2. **Control** access to MCP servers
3. **Track** usage and performance
4. **Maintain** version compatibility

The reference implementation demonstrates these concepts with a production-ready codebase that can be adapted to specific organizational needs.

### Getting Started

1. Review the complete API specification
2. Deploy the reference implementation
3. Configure authentication and security
4. Begin registering MCP servers
5. Integrate with AI applications

### Resources

- **Reference Implementation**: https://github.com/chief-builder/mcp-sub-registry
- **OpenAPI Specification**: Available in the reference implementation
- **MCP Protocol Documentation**: Refer to official MCP documentation

---

## Technical Appendix

### A. Complete OpenAPI Specification

The full OpenAPI 3.0.3 specification is available in the reference implementation at `/openapi.yaml`.

Key components:
- Complete endpoint definitions
- Request/response schemas
- Authentication requirements
- Error response formats

### B. Database Schema

Core database tables for PostgreSQL implementation:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'publisher', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MCP Servers table
CREATE TABLE mcp_servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    version VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('stable', 'beta', 'experimental')),
    repository JSONB,
    packages JSONB,
    remote JSONB,
    tags TEXT[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    prefix VARCHAR(20) NOT NULL,
    user_id UUID REFERENCES users(id),
    permissions JSONB DEFAULT '{"read": true}',
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_servers_name ON mcp_servers(name);
CREATE INDEX idx_servers_status ON mcp_servers(status);
CREATE INDEX idx_servers_created_by ON mcp_servers(created_by);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
```

### C. Environment Configuration

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mcp_registry

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1h

# API Configuration
PORT=3010
NODE_ENV=production

# Security
BCRYPT_ROUNDS=12
API_RATE_LIMIT=100
RATE_LIMIT_WINDOW_MS=900000

# Admin Setup
ADMIN_SETUP_KEY=your-admin-key-here
```

### D. Docker Deployment

Basic Docker Compose configuration:

```yaml
version: '3.8'

services:
  api:
    build: ./packages/api
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/mcp_registry
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3010:3010"
    depends_on:
      - db

  ui:
    build: ./packages/ui
    ports:
      - "80:80"
    depends_on:
      - api

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mcp_registry
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

---

*This document provides technical specification and implementation guidance for the MCP Registry. For the latest updates and community discussion, refer to the official MCP documentation and reference implementation.*

**Document Version**: 1.0  
**Last Updated**: September 2025  
**Specification Version**: MCP Registry API v2025-07-09