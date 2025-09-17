# 🏢 MCP Sub-Registry Enterprise Demo

## 🚀 Running the Demo

```bash
ADMIN_SETUP_KEY=your-admin-setup-key-for-production ./demo-httpie.sh
```

---

## 📋 Demo Output

```
╔═══════════════════════════════════════════════════════════════╗
║          MCP Sub-Registry Demo Script (HTTPie)                ║
╚═══════════════════════════════════════════════════════════════╝


## 🔧 Prerequisites Check

═══════════════════════════════════════════════════════════════
  Checking Prerequisites
═══════════════════════════════════════════════════════════════

✓ All prerequisites are installed
▶ Checking if server is running at http://localhost:3010
✓ Server is running
```

---

## Part 1: 🔐 Enterprise Admin Setup & Authentication

```
═══════════════════════════════════════════════════════════════
  Part 1: 🔐 Enterprise Admin Setup & Authentication
═══════════════════════════════════════════════════════════════

ℹ Setting up secure admin access for enterprise registry management
▶ Registering admin user

**HTTP Request:**
POST http://localhost:3010/api/v1/auth/register
Headers: x-admin-key: your-admin-setup-key-for-production

**HTTP Response:**
{"error":"Email or username already exists","code":"USER_EXISTS"}

ℹ Admin user already exists, continuing...

▶ Logging in as admin

**HTTP Request:**
POST http://localhost:3010/api/v1/auth/login

**HTTP Response:**
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZqb2p5dnowMDBiMm01bG9tczhlaHQ1IiwiZW1haWwiOiJkZW1vQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU3ODU2Nzc0LCJleHAiOjE3NTc4ODU1NzR9.R8eTlZIA1t5ogH39FFqByKbr9PdsgbmRQ3ijH5kLLMM","user":{"id":"cmfjojyvz000b2m5loms8eht5","email":"demo@example.com","username":"demoadmin","roles":["admin"],"is_active":true,"created_at":"2025-09-14T12:37:24.958Z"},"message":"For service-to-service authentication, use API keys instead of JWT tokens"}

✓ Login successful, token received

▶ Validating token with /me endpoint

**HTTP Request:**
GET http://localhost:3010/api/v1/auth/me
Headers: Authorization: Bearer [token]

GET /api/v1/auth/me HTTP/1.1
Accept: */*
Accept-Encoding: gzip, deflate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZqb2p5dnowMDBiMm01bG9tczhlaHQ1IiwiZW1haWwiOiJkZW1vQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU3ODU2Nzc0LCJleHAiOjE3NTc4ODU1NzR9.R8eTlZIA1t5ogH39FFqByKbr9PdsgbmRQ3ijH5kLLMM
Connection: keep-alive
Host: localhost:3010
User-Agent: HTTPie/3.2.4



**HTTP Response:**
HTTP/1.1 200 OK
Access-Control-Allow-Credentials: true
Connection: keep-alive
Content-Length: 159
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Content-Type: application/json; charset=utf-8
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Date: Sun, 14 Sep 2025 13:32:56 GMT
ETag: W/"9f-HqIN2+VVlPfC/yxisnUMh2uxgEA"
Keep-Alive: timeout=5
Origin-Agent-Cluster: ?1
RateLimit-Limit: 1000
RateLimit-Policy: 1000;w=900
RateLimit-Remaining: 997
RateLimit-Reset: 897
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
Vary: Origin, Accept-Encoding
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0

{
    "created_at": "2025-09-14T12:37:24.958Z",
    "email": "demo@example.com",
    "id": "cmfjojyvz000b2m5loms8eht5",
    "is_active": true,
    "roles": [
        "admin"
    ],
    "username": "demoadmin"
}

✓ Token validated successfully
```

---

## Part 2: 🔑 Role-Based API Key Management

```
═══════════════════════════════════════════════════════════════
  Part 2: 🔑 Role-Based API Key Management
═══════════════════════════════════════════════════════════════

ℹ Creating API keys for different enterprise team roles and use cases

▶ 👩‍💼 Creating Data Analyst Key (Read-Only Access)
ℹ Data analysts need read access to discover available connectors and their capabilities

**HTTP Request:**
POST http://localhost:3010/api/v1/api-keys/create

**HTTP Response:**
{"id":"cmfjqjefy001c2m5lzlwj1qtp","name":"Data Analyst - Discovery Key","description":"Read-only access for data analysts to browse available connectors","scopes":["read"],"expires_at":"2025-10-14T13:32:57.694Z","created_at":"2025-09-14T13:32:57.695Z","is_active":true,"key":"mcp_cfa056487b31567fc5d800edc4ad4eb9327e285d14bc108724ad1a041d41f0b0","last_used":null}

✓ ✅ Data Analyst key created - Can browse registry but not modify
ℹ 🔑 Key: mcp_cfa056487b31567f...



▶ 👨‍💻 Creating DevOps Team Key (Publisher Access)
ℹ DevOps engineers need to publish and update integration servers for their teams

**HTTP Response:**
{"id":"cmfjqjfcf001g2m5l8wdydxk5","name":"DevOps Team - Publisher Key","description":"Full access for DevOps team to publish and manage integration servers","scopes":["read","publish"],"expires_at":"2025-12-13T14:32:58.863Z","created_at":"2025-09-14T13:32:58.864Z","is_active":true,"key":"mcp_528a56dd7806ec0dfcefbe30b894aa6f5a90c192538665332fa0a1e4e1677b26","last_used":null}

✓ ✅ DevOps Publisher key created - Can publish enterprise connectors



▶ Listing all API keys

**HTTP Request:**
GET http://localhost:3010/api/v1/api-keys

GET /api/v1/api-keys HTTP/1.1
Accept: */*
Accept-Encoding: gzip, deflate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZqb2p5dnowMDBiMm01bG9tczhlaHQ1IiwiZW1haWwiOiJkZW1vQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU3ODU2Nzc0LCJleHAiOjE3NTc4ODU1NzR9.R8eTlZIA1t5ogH39FFqByKbr9PdsgbmRQ3ijH5kLLMM
Connection: keep-alive
Host: localhost:3010
User-Agent: HTTPie/3.2.4



**HTTP Response:**
HTTP/1.1 200 OK
Access-Control-Allow-Credentials: true
Connection: keep-alive
Content-Encoding: gzip
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Content-Type: application/json; charset=utf-8
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Date: Sun, 14 Sep 2025 13:33:00 GMT
ETag: W/"619-sVUdhQDhVJtaArJ8CuBZsTfeixQ"
Keep-Alive: timeout=5
Origin-Agent-Cluster: ?1
RateLimit-Limit: 1000
RateLimit-Policy: 1000;w=900
RateLimit-Remaining: 994
RateLimit-Reset: 894
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
Transfer-Encoding: chunked
Vary: Origin, Accept-Encoding
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0

{
    "api_keys": [
        {
            "created_at": "2025-09-14T13:32:58.864Z",
            "description": "Full access for DevOps team to publish and manage integration servers",
            "expires_at": "2025-12-13T14:32:58.863Z",
            "id": "cmfjqjfcf001g2m5l8wdydxk5",
            "is_active": true,
            "last_used": null,
            "name": "DevOps Team - Publisher Key",
            "scopes": [
                "read",
                "publish"
            ],
            "user": {
                "email": "demo@example.com",
                "id": "cmfjojyvz000b2m5loms8eht5",
                "username": "demoadmin"
            }
        },
        {
            "created_at": "2025-09-14T13:32:57.695Z",
            "description": "Read-only access for data analysts to browse available connectors",
            "expires_at": "2025-10-14T13:32:57.694Z",
            "id": "cmfjqjefy001c2m5lzlwj1qtp",
            "is_active": true,
            "last_used": null,
            "name": "Data Analyst - Discovery Key",
            "scopes": [
                "read"
            ],
            "user": {
                "email": "demo@example.com",
                "id": "cmfjojyvz000b2m5loms8eht5",
                "username": "demoadmin"
            }
        },
        {
            "created_at": "2025-09-14T12:37:30.076Z",
            "description": "Can publish servers",
            "expires_at": "2025-10-14T12:37:30.076Z",
            "id": "cmfjok2u4000h2m5lfwfrvbyk",
            "is_active": true,
            "last_used": "2025-09-14T12:37:39.316Z",
            "name": "Demo Publisher Key",
            "scopes": [
                "read",
                "publish"
            ],
            "user": {
                "email": "demo@example.com",
                "id": "cmfjojyvz000b2m5loms8eht5",
                "username": "demoadmin"
            }
        },
        {
            "created_at": "2025-09-14T12:37:28.915Z",
            "description": "Updated description for demo",
            "expires_at": "2025-09-21T12:37:28.914Z",
            "id": "cmfjok1xu000d2m5lwrctce5w",
            "is_active": true,
            "last_used": "2025-09-14T12:37:34.684Z",
            "name": "Updated Demo Read Key",
            "scopes": [
                "read"
            ],
            "user": {
                "email": "demo@example.com",
                "id": "cmfjojyvz000b2m5loms8eht5",
                "username": "demoadmin"
            }
        }
    ],
    "pagination": {
        "has_more": false,
        "limit": 50,
        "offset": 0,
        "total": 4
    }
}

▶ Getting details of specific API key

**HTTP Request:**
GET http://localhost:3010/api/v1/api-keys/cmfjqjefy001c2m5lzlwj1qtp

GET /api/v1/api-keys/cmfjqjefy001c2m5lzlwj1qtp HTTP/1.1
Accept: */*
Accept-Encoding: gzip, deflate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZqb2p5dnowMDBiMm01bG9tczhlaHQ1IiwiZW1haWwiOiJkZW1vQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU3ODU2Nzc0LCJleHAiOjE3NTc4ODU1NzR9.R8eTlZIA1t5ogH39FFqByKbr9PdsgbmRQ3ijH5kLLMM
Connection: keep-alive
Host: localhost:3010
User-Agent: HTTPie/3.2.4



**HTTP Response:**
HTTP/1.1 200 OK
Access-Control-Allow-Credentials: true
Connection: keep-alive
Content-Length: 378
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Content-Type: application/json; charset=utf-8
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Date: Sun, 14 Sep 2025 13:33:01 GMT
ETag: W/"17a-1qK4qrulawekxDKpG9C1R8Xh0+E"
Keep-Alive: timeout=5
Origin-Agent-Cluster: ?1
RateLimit-Limit: 1000
RateLimit-Policy: 1000;w=900
RateLimit-Remaining: 993
RateLimit-Reset: 892
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
Vary: Origin, Accept-Encoding
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0

{
    "created_at": "2025-09-14T13:32:57.695Z",
    "description": "Read-only access for data analysts to browse available connectors",
    "expires_at": "2025-10-14T13:32:57.694Z",
    "id": "cmfjqjefy001c2m5lzlwj1qtp",
    "is_active": true,
    "last_used": null,
    "name": "Data Analyst - Discovery Key",
    "scopes": [
        "read"
    ],
    "user": {
        "email": "demo@example.com",
        "id": "cmfjojyvz000b2m5loms8eht5",
        "username": "demoadmin"
    }
}

▶ Updating API key (rename)

**HTTP Request:**
PATCH http://localhost:3010/api/v1/api-keys/cmfjqjefy001c2m5lzlwj1qtp

PATCH /api/v1/api-keys/cmfjqjefy001c2m5lzlwj1qtp HTTP/1.1
Accept: application/json, */*;q=0.5
Accept-Encoding: gzip, deflate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWZqb2p5dnowMDBiMm01bG9tczhlaHQ1IiwiZW1haWwiOiJkZW1vQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzU3ODU2Nzc0LCJleHAiOjE3NTc4ODU1NzR9.R8eTlZIA1t5ogH39FFqByKbr9PdsgbmRQ3ijH5kLLMM
Connection: keep-alive
Content-Length: 80
Content-Type: application/json
Host: localhost:3010
User-Agent: HTTPie/3.2.4

{
    "description": "Updated description for demo",
    "name": "Updated Demo Read Key"
}

**HTTP Response:**
HTTP/1.1 200 OK
Access-Control-Allow-Credentials: true
Connection: keep-alive
Content-Length: 282
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Content-Type: application/json; charset=utf-8
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Date: Sun, 14 Sep 2025 13:33:02 GMT
ETag: W/"11a-ubReTQy0qqw3cZ1EIKLbuRymht8"
Keep-Alive: timeout=5
Origin-Agent-Cluster: ?1
RateLimit-Limit: 1000
RateLimit-Policy: 1000;w=900
RateLimit-Remaining: 992
RateLimit-Reset: 891
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
Vary: Origin, Accept-Encoding
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0

{
    "created_at": "2025-09-14T13:32:57.695Z",
    "description": "Updated description for demo",
    "expires_at": "2025-10-14T13:32:57.694Z",
    "id": "cmfjqjefy001c2m5lzlwj1qtp",
    "is_active": true,
    "last_used": null,
    "name": "Updated Demo Read Key",
    "scopes": [
        "read"
    ],
    "updated_at": "2025-09-14T13:33:02.358Z"
}


✓ API key updated successfully

▶ Testing API key authentication

**HTTP Request:**
GET http://localhost:3010/v0/servers
Headers: Authorization: ApiKey [key]

GET /v0/servers HTTP/1.1
Accept: */*
Accept-Encoding: gzip, deflate
Authorization: ApiKey mcp_cfa056487b31567fc5d800edc4ad4eb9327e285d14bc108724ad1a041d41f0b0
Connection: keep-alive
Host: localhost:3010
User-Agent: HTTPie/3.2.4



**HTTP Response:**
HTTP/1.1 200 OK
Access-Control-Allow-Credentials: true
Connection: keep-alive
Content-Encoding: gzip
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Content-Type: application/json; charset=utf-8
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Date: Sun, 14 Sep 2025 13:33:03 GMT
ETag: W/"51d-Jfy+7dRxBpbl9q5swp8iVEScg3o"
Keep-Alive: timeout=5
Origin-Agent-Cluster: ?1
RateLimit-Limit: 1000
RateLimit-Policy: 1000;w=900
RateLimit-Remaining: 991
RateLimit-Reset: 890
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
Transfer-Encoding: chunked
Vary: Origin, Accept-Encoding
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0

{
    "pagination": {
        "has_more": false,
        "limit": 50,
        "offset": 0,
        "total": 5
    },
    "servers": [
        {
            "description": "A production-ready stable MCP server for demo",
            "id": "cmfjok92o000s2m5l30yl658n",
            "metadata": {},
            "name": "com.example.demo-stable",
            "status": "stable",
            "version": "1.0.0"
        },
        {
            "description": "A beta MCP server with complete metadata for demo",
            "id": "cmfjok86d000p2m5l3hhbbzri",
            "metadata": {
                "com.example.category": "demo",
                "com.example.tags": [
                    "beta",
                    "testing"
                ]
            },
            "name": "com.example.demo-beta",
            "packages": [
                {
                    "identifier": "@example/mcp-demo-beta",
                    "registry": "npm",
                    "version": "0.9.0"
                }
            ],
            "remote": {
                "transport": "stdio"
            },
            "repository": {
                "type": "git",
                "url": "https://github.com/example/demo-beta"
            },
            "status": "beta",
            "version": "0.9.0"
        },
        {
            "description": "An experimental MCP server for demo purposes",
            "id": "cmfjok7a7000m2m5lfo31csyh",
            "metadata": {},
            "name": "com.example.demo-experimental",
            "status": "experimental",
            "version": "0.1.0"
        },
        {
            "description": "Enterprise analytics MCP server",
            "id": "cmfj4s4t800082m5l3r8gbsvs",
            "metadata": {},
            "name": "com.company.analytics-server",
            "status": "stable",
            "version": "2.1.0"
        },
        {
            "description": "A test MCP server for demonstration",
            "id": "cmfj4qdmx00052m5l22ryt6lo",
            "metadata": {},
            "name": "com.example.test-server",
            "repository": {
                "type": "git",
                "url": "https://github.com/example/test-server"
            },
            "status": "experimental",
            "version": "1.0.0"
        }
    ]
}

✓ API key authentication working
```

---

## Part 3: 🏢 Enterprise Integration Server Publishing

```
═══════════════════════════════════════════════════════════════
  Part 3: 🏢 Enterprise Integration Server Publishing
═══════════════════════════════════════════════════════════════

ℹ Demonstrating how enterprises register popular SaaS connectors and tools

▶ 📊 Publishing Salesforce CRM Integration (Experimental)
ℹ Sales teams use this to manage leads and opportunities

**HTTP Request:**
POST http://localhost:3010/v0/publish
Content-Type: application/json
Authorization: ApiKey [publisher-key]

{
  "name": "com.salesforce.mcp-crm",
  "description": "Manage leads, opportunities, and customer data in Salesforce CRM",
  "version": "0.8.1",
  "status": "experimental",
  "metadata": {
    "salesforce.edition": "enterprise",
    "salesforce.api": "v58.0",
    "salesforce.features": ["leads", "opportunities", "accounts"]
  }
}

**HTTP Response:**
{"id":"cmfjqjju0001l2m5llp7f3uiy","name":"com.salesforce.mcp-crm","description":"Manage leads, opportunities, and customer data in Salesforce CRM","status":"experimental","version":"0.8.1","metadata":{"salesforce.api":"v58.0","salesforce.edition":"enterprise","salesforce.features":["leads","opportunities","accounts"]}}

✓ ✅ Salesforce CRM server published - Ready for sales team integration

▶ 📚 Publishing Confluence Knowledge Base (Beta)
ℹ Knowledge management teams use this to access documentation and wikis

**HTTP Request:**
POST http://localhost:3010/v0/publish
Content-Type: application/json
Authorization: ApiKey [publisher-key]

{
  "name": "com.atlassian.confluence-mcp",
  "description": "Access Confluence spaces, pages, and search across enterprise knowledge base",
  "version": "1.3.0",
  "status": "beta",
  "repository": {
    "type": "git",
    "url": "https://github.com/atlassian/mcp-confluence"
  },
  "packages": [
    {
      "registry": "npm",
      "identifier": "@atlassian/confluence-mcp",
      "version": "1.3.0"
    },
    {
      "registry": "maven",
      "identifier": "com.atlassian:confluence-mcp",
      "version": "1.3.0"
    }
  ],
  "remote": {
    "transport": "http",
    "url": "https://your-domain.atlassian.net"
  },
  "metadata": {
    "atlassian.product": "confluence",
    "atlassian.scopes": ["read", "write"],
    "atlassian.spaces": ["engineering", "product", "marketing"]
  }
}

**HTTP Response:**
{"id":"cmfjqjli3001o2m5l5tjkt8lz","name":"com.atlassian.confluence-mcp","description":"Access Confluence spaces, pages, and search across enterprise knowledge base","status":"beta","version":"1.3.0","repository":{"url":"https://github.com/atlassian/mcp-confluence","type":"git"},"packages":[{"version":"1.3.0","registry":"npm","identifier":"@atlassian/confluence-mcp"},{"version":"1.3.0","registry":"maven","identifier":"com.atlassian:confluence-mcp"}],"remote":{"url":"https://your-domain.atlassian.net","transport":"http"},"metadata":{"atlassian.scopes":["read","write"],"atlassian.spaces":["engineering","product","marketing"],"atlassian.product":"confluence"}}

✓ ✅ Confluence server published - Ready for knowledge management workflows

▶ 🐙 Publishing GitHub Integration Server (Production-Ready)
ℹ DevOps teams use this for CI/CD, repository management, and code reviews

**HTTP Request:**
POST http://localhost:3010/v0/publish
Content-Type: application/json
Authorization: ApiKey [publisher-key]

{
  "name": "com.github.mcp-server",
  "description": "Connect to GitHub repositories, issues, pull requests, and actions",
  "version": "2.1.0",
  "status": "stable",
  "repository": {
    "type": "git",
    "url": "https://github.com/github/mcp-github"
  },
  "packages": [
    {
      "registry": "npm",
      "identifier": "@github/mcp-server",
      "version": "2.1.0"
    },
    {
      "registry": "docker",
      "identifier": "ghcr.io/github/mcp-server",
      "version": "2.1.0"
    }
  ],
  "remote": {
    "transport": "stdio"
  },
  "metadata": {
    "github.features": ["repos", "issues", "prs", "actions"],
    "github.auth": "oauth",
    "github.enterprise": true
  }
}

**HTTP Response:**
{"id":"cmfjqjn69001r2m5l0xf9mjt7","name":"com.github.mcp-server","description":"Connect to GitHub repositories, issues, pull requests, and actions","status":"stable","version":"2.1.0","repository":{"url":"https://github.com/github/mcp-github","type":"git"},"packages":[{"version":"2.1.0","registry":"npm","identifier":"@github/mcp-server"},{"version":"2.1.0","registry":"docker","identifier":"ghcr.io/github/mcp-server"}],"remote":{"transport":"stdio"},"metadata":{"github.auth":"oauth","github.features":["repos","issues","prs","actions"],"github.enterprise":true}}

✓ ✅ GitHub server published - Ready for enterprise development workflows

▶ 📈 Publishing Splunk Analytics Server (Production-Ready)
ℹ Data analysts and SREs use this for log analysis and system monitoring

**HTTP Request:**
POST http://localhost:3010/v0/publish
Content-Type: application/json
Authorization: ApiKey [publisher-key]

{
  "name": "com.splunk.mcp-connector",
  "description": "Query Splunk logs, create dashboards, and analyze system metrics",
  "version": "3.0.2",
  "status": "stable",
  "packages": [
    {
      "registry": "docker",
      "identifier": "splunk/mcp-connector",
      "version": "3.0.2"
    }
  ],
  "remote": {
    "transport": "https",
    "url": "https://your-splunk.company.com:8089"
  },
  "metadata": {
    "splunk.version": "9.x",
    "splunk.apps": ["search", "dashboards", "alerts"],
    "splunk.indexes": ["main", "security", "performance"]
  }
}

**HTTP Response:**
{"id":"cmfjqjou5001u2m5lvllbas4c","name":"com.splunk.mcp-connector","description":"Query Splunk logs, create dashboards, and analyze system metrics","status":"stable","version":"3.0.2","packages":[{"version":"3.0.2","registry":"docker","identifier":"splunk/mcp-connector"}],"remote":{"url":"https://your-splunk.company.com:8089","transport":"https"},"metadata":{"splunk.apps":["search","dashboards","alerts"],"splunk.indexes":["main","security","performance"],"splunk.version":"9.x"}}

✓ ✅ Splunk server published - Ready for enterprise analytics workflows

▶ 🔒 Demonstrating Duplicate Prevention (Enterprise Security)
ℹ Registry prevents duplicate registrations to avoid conflicts and security issues

**HTTP Request:**
POST http://localhost:3010/v0/publish (attempting duplicate GitHub server)

POST /v0/publish HTTP/1.1
Accept-Encoding: gzip, deflate
Connection: keep-alive
Content-Length: 123
User-Agent: HTTPie/3.2.4
Accept: application/json, */*;q=0.5
Content-Type: application/json
Authorization: ApiKey mcp_528a56dd7806ec0dfcefbe30b894aa6f5a90c192538665332fa0a1e4e1677b26
Host: localhost:3010

{"name": "com.github.mcp-server", "description": "Duplicate GitHub server attempt", "version": "2.2.0", "status": "stable"}

**HTTP Response:**
HTTP/1.1 409 Conflict
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Vary: Origin, Accept-Encoding
Access-Control-Allow-Credentials: true
RateLimit-Policy: 10;w=60
RateLimit-Limit: 10
RateLimit-Remaining: 5
RateLimit-Reset: 52
Content-Type: application/json; charset=utf-8
Content-Length: 56
ETag: W/"38-//4+97/Tmxdf4bDUevVovpCYaxs"
Date: Sun, 14 Sep 2025 13:33:13 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Server name already exists","code":"CONFLICT"}

✓ ✅ Registry Security: Duplicate server correctly rejected (409 Conflict)
ℹ This prevents namespace conflicts and ensures server uniqueness

ℹ 🎯 Enterprise Integration Summary:
ℹ    • Salesforce CRM - Sales team lead management
ℹ    • Confluence - Knowledge base and documentation
ℹ    • GitHub - Development workflows and CI/CD
ℹ    • Splunk - Analytics and system monitoring
```

---

## Part 4: 🔍 Enterprise Integration Discovery & Search

```
═══════════════════════════════════════════════════════════════
  Part 4: 🔍 Enterprise Integration Discovery & Search
═══════════════════════════════════════════════════════════════

ℹ Demonstrating how teams discover and evaluate available enterprise connectors

▶ 🌐 Public Registry Discovery (No Authentication Required)
ℹ Any team member can browse the registry to see available enterprise integrations

**HTTP Request:**
GET http://localhost:3010/v0/servers

GET /v0/servers HTTP/1.1
Accept-Encoding: gzip, deflate
Accept: */*
Connection: keep-alive
User-Agent: HTTPie/3.2.4
Host: localhost:3010



**HTTP Response:**
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Vary: Origin, Accept-Encoding
Access-Control-Allow-Credentials: true
RateLimit-Policy: 1000;w=900
RateLimit-Limit: 1000
RateLimit-Remaining: 985
RateLimit-Reset: 879
Content-Type: application/json; charset=utf-8
ETag: W/"d13-6P8EzglEmqcj4OloUFZY/MO6z4E"
Content-Encoding: gzip
Date: Sun, 14 Sep 2025 13:33:14 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"servers":[{"id":"cmfjqjou5001u2m5lvllbas4c","name":"com.splunk.mcp-connector","description":"Query Splunk logs, create dashboards, and analyze system metrics","status":"stable","version":"3.0.2","packages":[{"version":"3.0.2","registry":"docker","identifier":"splunk/mcp-connector"}],"remote":{"url":"https://your-splunk.company.com:8089","transport":"https"},"metadata":{"splunk.apps":["search","dashboards","alerts"],"splunk.indexes":["main","security","performance"],"splunk.version":"9.x"}},{"id":"cmfjqjn69001r2m5l0xf9mjt7","name":"com.github.mcp-server","description":"Connect to GitHub repositories, issues, pull requests, and actions","status":"stable","version":"2.1.0","repository":{"url":"https://github.com/github/mcp-github","type":"git"},"packages":[{"version":"2.1.0","registry":"npm","identifier":"@github/mcp-server"},{"version":"2.1.0","registry":"docker","identifier":"ghcr.io/github/mcp-server"}],"remote":{"transport":"stdio"},"metadata":{"github.auth":"oauth","github.features":["repos","issues","prs","actions"],"github.enterprise":true}},{"id":"cmfjqjli3001o2m5l5tjkt8lz","name":"com.atlassian.confluence-mcp","description":"Access Confluence spaces, pages, and search across enterprise knowledge base","status":"beta","version":"1.3.0","repository":{"url":"https://github.com/atlassian/mcp-confluence","type":"git"},"packages":[{"version":"1.3.0","registry":"npm","identifier":"@atlassian/confluence-mcp"},{"version":"1.3.0","registry":"maven","identifier":"com.atlassian:confluence-mcp"}],"remote":{"url":"https://your-domain.atlassian.net","transport":"http"},"metadata":{"atlassian.scopes":["read","write"],"atlassian.spaces":["engineering","product","marketing"],"atlassian.product":"confluence"}},{"id":"cmfjqjju0001l2m5llp7f3uiy","name":"com.salesforce.mcp-crm","description":"Manage leads, opportunities, and customer data in Salesforce CRM","status":"experimental","version":"0.8.1","metadata":{"salesforce.api":"v58.0","salesforce.edition":"enterprise","salesforce.features":["leads","opportunities","accounts"]}},{"id":"cmfjok92o000s2m5l30yl658n","name":"com.example.demo-stable","description":"A production-ready stable MCP server for demo","status":"stable","version":"1.0.0","metadata":{}},{"id":"cmfjok86d000p2m5l3hhbbzri","name":"com.example.demo-beta","description":"A beta MCP server with complete metadata for demo","status":"beta","version":"0.9.0","repository":{"url":"https://github.com/example/demo-beta","type":"git"},"packages":[{"version":"0.9.0","registry":"npm","identifier":"@example/mcp-demo-beta"}],"remote":{"transport":"stdio"},"metadata":{"com.example.tags":["beta","testing"],"com.example.category":"demo"}},{"id":"cmfjok7a7000m2m5l3hhbbzri","name":"com.example.demo-experimental","description":"An experimental MCP server for demo purposes","status":"experimental","version":"0.1.0","metadata":{}},{"id":"cmfj4s4t800082m5l3r8gbsvs","name":"com.company.analytics-server","description":"Enterprise analytics MCP server","status":"stable","version":"2.1.0","metadata":{}},{"id":"cmfj4qdmx00052m5l22ryt6lo","name":"com.example.test-server","description":"A test MCP server for demonstration","status":"experimental","version":"1.0.0","repository":{"url":"https://github.com/example/test-server","type":"git"},"metadata":{}}],"pagination":{"total":9,"limit":50,"offset":0,"has_more":false}}

✅ Registry contains 9 enterprise integration servers

▶ 🏭 Finding Production-Ready Integrations (stable status)
ℹ DevOps teams typically filter for stable servers ready for production deployment

**HTTP Request:**
GET http://localhost:3010/v0/servers?status=stable

GET /v0/servers?status=stable HTTP/1.1
Accept-Encoding: gzip, deflate
Accept: */*
Connection: keep-alive
User-Agent: HTTPie/3.2.4
Host: localhost:3010



**HTTP Response:**
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Vary: Origin, Accept-Encoding
Access-Control-Allow-Credentials: true
RateLimit-Policy: 1000;w=900
RateLimit-Limit: 1000
RateLimit-Remaining: 984
RateLimit-Reset: 877
Content-Type: application/json; charset=utf-8
ETag: W/"5c8-/7uvXWR6uAawkei9y5A8jQp916c"
Content-Encoding: gzip
Date: Sun, 14 Sep 2025 13:33:16 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"servers":[{"id":"cmfjqjou5001u2m5lvllbas4c","name":"com.splunk.mcp-connector","description":"Query Splunk logs, create dashboards, and analyze system metrics","status":"stable","version":"3.0.2","packages":[{"version":"3.0.2","registry":"docker","identifier":"splunk/mcp-connector"}],"remote":{"url":"https://your-splunk.company.com:8089","transport":"https"},"metadata":{"splunk.apps":["search","dashboards","alerts"],"splunk.indexes":["main","security","performance"],"splunk.version":"9.x"}},{"id":"cmfjqjn69001r2m5l0xf9mjt7","name":"com.github.mcp-server","description":"Connect to GitHub repositories, issues, pull requests, and actions","status":"stable","version":"2.1.0","repository":{"url":"https://github.com/github/mcp-github","type":"git"},"packages":[{"version":"2.1.0","registry":"npm","identifier":"@github/mcp-server"},{"version":"2.1.0","registry":"docker","identifier":"ghcr.io/github/mcp-server"}],"remote":{"transport":"stdio"},"metadata":{"github.auth":"oauth","github.features":["repos","issues","prs","actions"],"github.enterprise":true}},{"id":"cmfjok92o000s2m5l30yl658n","name":"com.example.demo-stable","description":"A production-ready stable MCP server for demo","status":"stable","version":"1.0.0","metadata":{}},{"id":"cmfj4s4t800082m5l3r8gbsvs","name":"com.company.analytics-server","description":"Enterprise analytics MCP server","status":"stable","version":"2.1.0","metadata":{}}],"pagination":{"total":4,"limit":50,"offset":0,"has_more":false}}

✅ Found 4 production-ready servers (GitHub, Splunk, and others)

▶ 📄 Paginated Browse (Enterprise Scale)
ℹ Large enterprises may have hundreds of connectors - pagination keeps responses manageable

**HTTP Request:**
GET http://localhost:3010/v0/servers?limit=2

GET /v0/servers?limit=2 HTTP/1.1
Accept-Encoding: gzip, deflate
Accept: */*
Connection: keep-alive
User-Agent: HTTPie/3.2.4
Host: localhost:3010



**HTTP Response:**
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Vary: Origin, Accept-Encoding
Access-Control-Allow-Credentials: true
RateLimit-Policy: 1000;w=900
RateLimit-Limit: 1000
RateLimit-Remaining: 983
RateLimit-Reset: 875
Content-Type: application/json; charset=utf-8
ETag: W/"467-a9VAVcFP8N3RxRibcnj2viwDX8A"
Content-Encoding: gzip
Date: Sun, 14 Sep 2025 13:33:18 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"servers":[{"id":"cmfjqjou5001u2m5lvllbas4c","name":"com.splunk.mcp-connector","description":"Query Splunk logs, create dashboards, and analyze system metrics","status":"stable","version":"3.0.2","packages":[{"version":"3.0.2","registry":"docker","identifier":"splunk/mcp-connector"}],"remote":{"url":"https://your-splunk.company.com:8089","transport":"https"},"metadata":{"splunk.apps":["search","dashboards","alerts"],"splunk.indexes":["main","security","performance"],"splunk.version":"9.x"}},{"id":"cmfjqjn69001r2m5l0xf9mjt7","name":"com.github.mcp-server","description":"Connect to GitHub repositories, issues, pull requests, and actions","status":"stable","version":"2.1.0","repository":{"url":"https://github.com/github/mcp-github","type":"git"},"packages":[{"version":"2.1.0","registry":"npm","identifier":"@github/mcp-server"},{"version":"2.1.0","registry":"docker","identifier":"ghcr.io/github/mcp-server"}],"remote":{"transport":"stdio"},"metadata":{"github.auth":"oauth","github.features":["repos","issues","prs","actions"],"github.enterprise":true}}],"pagination":{"total":9,"limit":2,"offset":0,"has_more":true}}

ℹ Pagination working - Registry ready for enterprise scale

▶ 📋 Detailed Integration Information (Confluence Server)
ℹ Teams need detailed metadata to understand integration capabilities and requirements

**HTTP Request:**
GET http://localhost:3010/v0/servers/cmfjqjli3001o2m5l5tjkt8lz

GET /v0/servers/cmfjqjli3001o2m5l5tjkt8lz HTTP/1.1
Accept-Encoding: gzip, deflate
Accept: */*
Connection: keep-alive
User-Agent: HTTPie/3.2.4
Host: localhost:3010



**HTTP Response:**
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Vary: Origin, Accept-Encoding
Access-Control-Allow-Credentials: true
RateLimit-Policy: 1000;w=900
RateLimit-Limit: 1000
RateLimit-Remaining: 982
RateLimit-Reset: 873
Content-Type: application/json; charset=utf-8
Content-Length: 664
ETag: W/"298-Hf+L1rVLA7OWwPp4jruKCGYIU3M"
Date: Sun, 14 Sep 2025 13:33:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":"cmfjqjli3001o2m5l5tjkt8lz","name":"com.atlassian.confluence-mcp","description":"Access Confluence spaces, pages, and search across enterprise knowledge base","status":"beta","version":"1.3.0","repository":{"url":"https://github.com/atlassian/mcp-confluence","type":"git"},"packages":[{"version":"1.3.0","registry":"npm","identifier":"@atlassian/confluence-mcp"},{"version":"1.3.0","registry":"maven","identifier":"com.atlassian:confluence-mcp"}],"remote":{"url":"https://your-domain.atlassian.net","transport":"http"},"metadata":{"atlassian.scopes":["read","write"],"atlassian.spaces":["engineering","product","marketing"],"atlassian.product":"confluence"}}

✓ ✅ Full server details available - includes metadata, packages, and connection info
ℹ Knowledge management teams can now evaluate Confluence integration capabilities
ℹ 🎯 Discovery Use Cases Summary:
ℹ    • Public browsing - No auth required for discovery
ℹ    • Status filtering - Find production-ready vs experimental
ℹ    • Pagination - Handle enterprise-scale connector catalogs
ℹ    • Detailed metadata - Evaluate integration capabilities
```

---

## Part 5: 📊 Enterprise Monitoring & Operations

```
═══════════════════════════════════════════════════════════════
  Part 5: 📊 Enterprise Monitoring & Operations
═══════════════════════════════════════════════════════════════

ℹ Enterprise operations teams monitor registry health and usage patterns

▶ 🏥 Infrastructure Health Check
ℹ Load balancers and monitoring systems check this endpoint for registry availability

**HTTP Request:**
GET http://localhost:3010/health

GET /health HTTP/1.1
Accept-Encoding: gzip, deflate
Accept: */*
Connection: keep-alive
User-Agent: HTTPie/3.2.4
Host: localhost:3010



**HTTP Response:**
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Vary: Origin, Accept-Encoding
Access-Control-Allow-Credentials: true
Content-Type: application/json; charset=utf-8
Content-Length: 54
ETag: W/"36-S1Ux80qeCyms6NUl6mM8GqMNUGw"
Date: Sun, 14 Sep 2025 13:33:23 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"status":"ok","timestamp":"2025-09-14T13:33:23.127Z"}

✓ ✅ Registry infrastructure healthy - Ready for enterprise workloads

▶ 🔗 MCP Protocol Compliance Check
ℹ Validates registry follows Model Context Protocol v2025-07-09 specifications

**What This Test Does:**
• **Purpose**: Verifies that the registry correctly implements the MCP-specific health endpoint as defined in the official MCP Registry API specification
• **Key Differences from General Health Check**: 
  - Endpoint: `/v0/health` (MCP-specific) vs `/health` (general application health)
  - Specification Compliance: Must return specific fields required by MCP v2025-07-09
  - Version Information: Includes the registry implementation version for compatibility checks

**Why This Matters for Enterprise:**
• **Interoperability**: Ensures MCP clients can reliably connect and discover capabilities
• **Standards Compliance**: Validates the registry follows official MCP specifications  
• **Version Compatibility**: Allows clients to verify they're compatible with this registry version
• **Protocol Evolution**: Future MCP versions can check compatibility through this endpoint

**HTTP Request:**
GET http://localhost:3010/v0/health

GET /v0/health HTTP/1.1
Accept-Encoding: gzip, deflate
Accept: */*
Connection: keep-alive
User-Agent: HTTPie/3.2.4
Host: localhost:3010



**HTTP Response:**
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0
Vary: Origin, Accept-Encoding
Access-Control-Allow-Credentials: true
RateLimit-Policy: 1000;w=900
RateLimit-Limit: 1000
RateLimit-Remaining: 981
RateLimit-Reset: 869
Content-Type: application/json; charset=utf-8
Content-Length: 77
ETag: W/"4d-Ihqz5+Ny24Gxt1hfQYqgRrmmFKw"
Date: Sun, 14 Sep 2025 13:33:24 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"status":"healthy","timestamp":"2025-09-14T13:33:24.282Z","version":"0.1.0"}

**Response Analysis:**
• **status**: "healthy" ✅ Required MCP field - must be exactly "healthy"
• **timestamp**: "2025-09-14T13:33:24.282Z" ✅ ISO 8601 timestamp format
• **version**: "0.1.0" ✅ Registry implementation version for compatibility checks

**Technical Validation Points:**
• HTTP Status: Must return `200 OK` ✅
• Content-Type: Must be `application/json` ✅  
• Response Schema: Must include required MCP fields (`status`, `timestamp`, `version`) ✅
• Status Value: Must be exactly `"healthy"` (not `"ok"` like generic health checks) ✅

**Conformance Result**: This is a "conformance test" that proves the registry is a legitimate, compliant MCP implementation that will work correctly with standard MCP clients and tools across the ecosystem.

✓ ✅ MCP Protocol compliance verified - Registry follows industry standards

▶ 📈 Enterprise Analytics & Monitoring (Prometheus)
ℹ Operations teams use these metrics for dashboards, alerting, and capacity planning

**HTTP Request:**
GET http://localhost:3010/metrics

**HTTP Response:**
HTTP/1.1 200 OK
Access-Control-Allow-Credentials: true
Cache-Control: public, max-age=30
Connection: keep-alive
Content-Encoding: gzip
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Content-Type: text/plain; charset=utf-8; version=0.0.4
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Date: Sun, 14 Sep 2025 13:33:25 GMT
ETag: W/"950-BflcbirySBLsNTSq2c4qqIrB320"
Keep-Alive: timeout=5
Origin-Agent-Cluster: ?1
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
Transfer-Encoding: chunked
Vary: Origin, Accept-Encoding
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0


📊 Key Enterprise Metrics:
ℹ    📦 Total Integration Servers: 9 (Growing enterprise connector ecosystem)
ℹ    🏭 Production-Ready Servers: 4 (GitHub, Splunk ready for deployment)  
ℹ    👥 Active Enterprise Users: 2 (Teams actively managing integrations)
ℹ    🔑 Total API Keys: 5 (Role-based access for different teams)
... (additional metrics available for full observability)
✓ ✅ All enterprise monitoring systems operational
ℹ 🎯 Operations teams can now monitor registry health, usage patterns, and capacity
```

---

## Part 6: 🧹 Demo Environment Cleanup

```
═══════════════════════════════════════════════════════════════
  🧹 Demo Environment Cleanup (Optional)
═══════════════════════════════════════════════════════════════

ℹ In production, API keys would be managed through enterprise identity systems
Do you want to clean up demo resources? (y/N) y

▶ Deleting API key: cmfjqjefy001c2m5lzlwj1qtp

**HTTP Response:**
HTTP/1.1 204 No Content
Access-Control-Allow-Credentials: true
Connection: keep-alive
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Date: Sun, 14 Sep 2025 13:33:31 GMT
Keep-Alive: timeout=5
Origin-Agent-Cluster: ?1
RateLimit-Limit: 1000
RateLimit-Policy: 1000;w=900
RateLimit-Remaining: 980
RateLimit-Reset: 862
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
Vary: Origin
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0

▶ Deleting API key: cmfjqjfcf001g2m5l8wdydxk5

**HTTP Response:**
HTTP/1.1 204 No Content
Access-Control-Allow-Credentials: true
Connection: keep-alive
Content-Security-Policy: default-src 'self';style-src 'self' 'unsafe-inline';script-src 'self';img-src 'self' data: https:;base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Date: Sun, 14 Sep 2025 13:33:31 GMT
Keep-Alive: timeout=5
Origin-Agent-Cluster: ?1
RateLimit-Limit: 1000
RateLimit-Policy: 1000;w=900
RateLimit-Remaining: 979
RateLimit-Reset: 862
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=15552000; includeSubDomains
Vary: Origin
X-Content-Type-Options: nosniff
X-DNS-Prefetch-Control: off
X-Download-Options: noopen
X-Frame-Options: SAMEORIGIN
X-Permitted-Cross-Domain-Policies: none
X-XSS-Protection: 0

ℹ Note: Published servers remain in the database
ℹ Run ./cleanup.sh for complete cleanup including database reset
```

---

## 🎉 Demo Complete!

```
═══════════════════════════════════════════════════════════════
  🎉 Enterprise MCP Registry Demo Complete!
═══════════════════════════════════════════════════════════════

✓ ✅ All enterprise integration workflows demonstrated successfully

ℹ 🏢 What you've seen:
ℹ    • Enterprise SaaS connector publishing (Salesforce, GitHub, Confluence, Splunk)
ℹ    • Role-based API key management (Data Analysts, DevOps teams)
ℹ    • Public discovery and search capabilities
ℹ    • Production-ready monitoring and operations
ℹ    • Enterprise security controls (duplicate prevention, rate limiting)

ℹ 🚀 Ready for production deployment in your enterprise environment
ℹ Created resources:
ℹ   • API Keys: 2 (Data Analyst + DevOps Publisher keys)
ℹ   • Servers: 4 (Salesforce, Confluence, GitHub, Splunk)
```

---

## 📊 Demo Summary

This demo showcased a complete enterprise MCP registry implementation featuring:

### 🏢 **Enterprise Integration Servers Published**
- **Salesforce CRM** (`com.salesforce.mcp-crm`) - Sales team lead management
- **Confluence Knowledge Base** (`com.atlassian.confluence-mcp`) - Documentation workflows  
- **GitHub Integration** (`com.github.mcp-server`) - DevOps and CI/CD workflows
- **Splunk Analytics** (`com.splunk.mcp-connector`) - System monitoring and analytics

### 🔑 **Role-Based Access Control**
- **Data Analyst Keys** - Read-only access for connector discovery
- **DevOps Publisher Keys** - Full publishing rights for integration management
- **Admin Controls** - Centralized user and key management

### 🔍 **Enterprise Discovery Features**
- Public registry browsing (no authentication required)
- Production vs experimental filtering
- Pagination for enterprise-scale catalogs  
- Detailed metadata for integration evaluation

### 📈 **Operations & Monitoring**
- Prometheus metrics for enterprise dashboards
- Health check endpoints for load balancers
- MCP protocol compliance verification
- Complete audit trails for security compliance

### 🛡️ **Security Controls**
- Duplicate server prevention (409 conflicts)
- Rate limiting by endpoint type
- Scope-based API key permissions
- Enterprise authentication workflows

---

## 🧹 Cleanup

To clean up demo resources:

```bash
# Remove demo data from database
./cleanup-demo.sh

# Or force cleanup without prompts
./cleanup-demo.sh --force
```

---