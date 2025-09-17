# Part 2: 🔑 Role-Based API Key Management

This section demonstrates creating and managing API keys for different enterprise team roles and use cases.

## Overview

API keys enable secure, programmatic access to the registry without requiring interactive login. Different teams need different levels of access:

- **Data Analysts**: Read-only access for discovery and evaluation
- **DevOps Teams**: Publisher access for deploying and managing servers
- **Automated Systems**: Service-to-service authentication

## Role-Based Access Model

### Data Analyst Keys (Read-Only)
**Use Cases**:
- Discover available connectors and their capabilities
- Evaluate integration options for projects
- Generate reports on available enterprise tools
- Browse registry without modification rights

**Permissions**:
- ✅ List servers (`GET /v0/servers`)
- ✅ Get server details (`GET /v0/servers/{id}`)
- ❌ Publish servers (`POST /v0/publish`)
- ❌ Manage API keys

### DevOps Publisher Keys (Read + Publish)
**Use Cases**:
- Publish new integration servers
- Update existing server metadata
- Deploy connectors in CI/CD pipelines
- Manage team-specific integrations

**Permissions**:
- ✅ All read operations
- ✅ Publish servers (`POST /v0/publish`)
- ❌ Admin operations (user management, etc.)

## Demo Walkthrough

### 1. Creating Data Analyst Key

```bash
POST /api/v1/api-keys/create
Authorization: Bearer [admin-jwt]
Content-Type: application/json

{
  "name": "Data Analyst - Discovery Key",
  "description": "Read-only access for data analysts to browse available connectors",
  "scopes": ["read"],
  "expires_in_days": 30
}
```

**Response Analysis**:
```json
{
  "id": "key-uuid",
  "name": "Data Analyst - Discovery Key", 
  "description": "Read-only access...",
  "scopes": ["read"],
  "expires_at": "2025-10-14T13:32:57.694Z",
  "created_at": "2025-09-14T13:32:57.695Z",
  "is_active": true,
  "key": "mcp_cfa056487b31567f...",
  "last_used": null
}
```

**Key Features**:
- **Prefix**: All API keys start with `mcp_` for easy identification
- **Expiration**: 30-day expiration for analyst keys (renewable)
- **Scopes**: Explicit permission model
- **Tracking**: `last_used` field for monitoring

### 2. Creating DevOps Publisher Key

```bash
POST /api/v1/api-keys/create
Authorization: Bearer [admin-jwt]
Content-Type: application/json

{
  "name": "DevOps Team - Publisher Key",
  "description": "Full access for DevOps team to publish and manage integration servers", 
  "scopes": ["read", "publish"],
  "expires_in_days": 90
}
```

**Response Analysis**:
```json
{
  "id": "key-uuid",
  "name": "DevOps Team - Publisher Key",
  "scopes": ["read", "publish"],
  "expires_at": "2025-12-13T14:32:58.863Z",
  "key": "mcp_528a56dd7806ec0d...",
  "expires_in_days": 90
}
```

**Key Features**:
- **Extended Expiration**: 90 days for operational stability
- **Publisher Scope**: Can create and update servers
- **Team Assignment**: Clear ownership and responsibility

### 3. API Key Management Operations

#### Listing All Keys
```bash
GET /api/v1/api-keys
Authorization: Bearer [admin-jwt]
```

**Response**: Paginated list of all API keys with metadata, usage tracking, and user associations.

#### Getting Specific Key Details
```bash
GET /api/v1/api-keys/{key-id}
Authorization: Bearer [admin-jwt]
```

**Response**: Detailed information about a specific key, including usage history.

#### Updating API Keys
```bash
PATCH /api/v1/api-keys/{key-id}
Authorization: Bearer [admin-jwt]
Content-Type: application/json

{
  "name": "Updated Demo Read Key",
  "description": "Updated description for demo"
}
```

**Supported Updates**:
- Name and description changes
- Activation/deactivation
- Expiration extension (admin only)

### 4. Testing API Key Authentication

```bash
GET /v0/servers
Authorization: ApiKey [api-key]
```

**Authentication Methods**:
- **JWT**: `Authorization: Bearer [token]` - For admin operations
- **API Key**: `Authorization: ApiKey [key]` - For service operations

## Enterprise Best Practices

### Key Lifecycle Management
- **Creation**: Admin-only operation with approval workflows
- **Rotation**: Regular key rotation (30-90 days)
- **Monitoring**: Track usage patterns and detect anomalies
- **Revocation**: Immediate deactivation when compromised

### Security Considerations
- **Storage**: Never log or display full API keys
- **Transmission**: Always use HTTPS
- **Scoping**: Principle of least privilege
- **Auditing**: All key operations are logged

### Operational Guidelines
- **Team Keys**: Assign keys to teams, not individuals
- **Environment Separation**: Different keys for dev/staging/prod
- **Automation**: Use keys in CI/CD pipelines, not human accounts
- **Documentation**: Maintain registry of key purposes and owners

## Rate Limiting

API keys are subject to rate limiting:
- **Default Limit**: 1000 requests per 15-minute window
- **Scope-Based**: Different limits for read vs. publish operations
- **Headers**: Real-time rate limit status in response headers

## Monitoring and Analytics

Track key usage through:
- **Last Used**: Timestamp of most recent request
- **Request Counts**: Total and recent usage statistics
- **Error Rates**: Failed authentication attempts
- **Scope Violations**: Attempted unauthorized operations

## Next Steps

With API keys configured, teams can now:
- Publish enterprise integration servers
- Automate registry operations
- Implement service-to-service authentication
- Build custom tooling and dashboards

---
[← Part 1: Authentication](part-1-authentication.md) | [Table of Contents](README.md) | [Part 3: Server Publishing →](part-3-server-publishing.md)