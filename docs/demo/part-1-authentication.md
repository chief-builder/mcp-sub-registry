# Part 1: 🔐 Enterprise Admin Setup & Authentication

This section demonstrates setting up secure admin access for enterprise registry management using JWT tokens.

## Overview

Enterprise registries require robust authentication mechanisms to ensure only authorized personnel can manage integrations and access controls. This demo shows:

- Admin user registration with setup keys
- JWT token-based authentication
- Token validation and verification
- Enterprise security best practices

## Demo Steps

### 1. Admin User Registration

**Purpose**: Create the initial admin user for registry management.

**Security Note**: In production, admin registration is typically restricted using setup keys or disabled after initial setup.

```bash
POST /api/v1/auth/register
Headers: x-admin-key: your-admin-setup-key-for-production
Content-Type: application/json

{
  "email": "demo@example.com",
  "username": "demoadmin", 
  "password": "DemoPass123!"
}
```

**Expected Outcomes**:
- ✅ New admin user created
- ⚠️ User already exists (demo continues)
- 🔒 Registration disabled (production security)

### 2. Admin Login & JWT Token Generation

**Purpose**: Authenticate admin user and obtain JWT token for subsequent API calls.

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "demo@example.com",
  "password": "DemoPass123!"
}
```

**Response Analysis**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "demo@example.com", 
    "username": "demoadmin",
    "roles": ["admin"],
    "is_active": true,
    "created_at": "2025-09-14T12:37:24.958Z"
  },
  "message": "For service-to-service authentication, use API keys instead of JWT tokens"
}
```

**Key Elements**:
- **JWT Token**: Used for admin dashboard and management operations
- **User Roles**: `["admin"]` grants full registry management access
- **Service Guidance**: Recommends API keys for automated systems

### 3. Token Validation

**Purpose**: Verify JWT token is valid and retrieve current user information.

```bash
GET /api/v1/auth/me
Authorization: Bearer [jwt-token]
```

**Response Analysis**:
```json
{
  "id": "uuid",
  "email": "demo@example.com",
  "username": "demoadmin", 
  "roles": ["admin"],
  "is_active": true,
  "created_at": "2025-09-14T12:37:24.958Z"
}
```

## Enterprise Security Considerations

### JWT Token Security
- **Expiration**: Tokens expire after 8 hours (configurable)
- **Signing**: HMAC-SHA256 with secure secret
- **Claims**: Include user ID, email, roles, and timestamps
- **Rotation**: Regular token refresh recommended

### Production Recommendations
- **Admin Registration**: Disable after initial setup
- **Setup Keys**: Use strong, unique keys and rotate regularly  
- **Multi-Factor**: Consider MFA for admin accounts
- **Audit Logging**: All admin actions are logged
- **Role Separation**: Use API keys for service accounts

### Rate Limiting
All authentication endpoints include rate limiting:
- **Limit**: 1000 requests per 15-minute window
- **Headers**: `RateLimit-*` headers show current status
- **Protection**: Prevents brute force attacks

## Security Headers

The registry implements comprehensive security headers:

```http
Content-Security-Policy: default-src 'self'...
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 0
```

## Next Steps

With admin authentication established, you can now:
- Create and manage API keys for different teams
- Configure role-based access controls
- Monitor authentication events in audit logs

---
[← Getting Started](getting-started.md) | [Table of Contents](README.md) | [Part 2: API Key Management →](part-2-api-keys.md)