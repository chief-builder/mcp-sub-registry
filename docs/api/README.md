# API Documentation

The MCP Sub-Registry provides a comprehensive REST API for managing MCP server registrations and discovery.

## Overview

- **Base URL**: `http://localhost:3010` (development)
- **API Version**: v0
- **Authentication**: JWT tokens (users) or API Keys (services)
- **Content Type**: `application/json`

## Authentication

### User Authentication (JWT)
```bash
# Register user
POST /v0/auth/register

# Login user  
POST /v0/auth/login

# Use token in subsequent requests
Authorization: Bearer <jwt-token>
```

### Service Authentication (API Keys)
```bash
# Get API key after user login
GET /v0/admin/api-keys

# Use API key for publishing
Authorization: ApiKey <api-key>
```

## Core Endpoints

### Server Discovery
- `GET /v0/discover` - Search and filter MCP servers
- `GET /v0/discover/{name}` - Get specific server details
- `GET /v0/servers/{id}/manifest` - Download server manifest

### Server Management  
- `POST /v0/publish` - Publish new server version
- `PUT /v0/servers/{id}` - Update server metadata
- `DELETE /v0/servers/{id}` - Remove server from registry

### Administrative
- `GET /v0/admin/servers` - List all servers (admin only)
- `POST /v0/admin/api-keys` - Generate API keys
- `GET /v0/metrics` - Prometheus metrics
- `GET /v0/health` - Health check endpoint

## Request/Response Examples

### Publish Server
```bash
POST /v0/publish
Authorization: ApiKey abc123...
Content-Type: application/json

{
  "name": "com.example.mcp-server",
  "description": "Example MCP server",
  "version": "1.0.0",
  "status": "stable",
  "manifest": {
    "mcpVersion": "2025-07-09",
    "capabilities": {
      "resources": {},
      "tools": {}
    }
  },
  "metadata": {
    "author": "Example Corp",
    "license": "MIT",
    "repository": "https://github.com/example/mcp-server"
  }
}
```

### Search Servers
```bash
GET /v0/discover?status=stable&search=database&limit=10
```

```json
{
  "servers": [
    {
      "id": "uuid",
      "name": "com.example.database-mcp",
      "description": "Database integration server",
      "version": "2.1.0", 
      "status": "stable",
      "capabilities": ["resources", "tools"],
      "publishedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error description",
  "code": "ERROR_CODE", 
  "details": {}
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate names/versions)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

- **Discovery endpoints**: 100 requests/minute per IP
- **Publishing endpoints**: 10 requests/minute per API key
- **Administrative endpoints**: 50 requests/minute per user

## OpenAPI Specification

The complete API specification is available in OpenAPI 3.0 format:
- [openapi.json](./openapi.json) - Machine-readable specification
- Interactive docs available at `/docs` when server is running

## SDK Generation

TypeScript client SDK can be generated from the OpenAPI spec:

```bash
# Generate client (from project root)
npm run generate:client
```

The generated client provides type-safe methods for all API endpoints with TypeScript intellisense and validation.