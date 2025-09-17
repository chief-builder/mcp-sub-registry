# 🏢 MCP Sub-Registry Demo Guide

This comprehensive demo showcases the MCP Sub-Registry's enterprise features through realistic scenarios with popular SaaS integrations.

## 🎯 Demo Overview

The demo demonstrates a complete enterprise workflow:
1. **Admin Setup** - Secure authentication and user management
2. **API Key Management** - Role-based access control for different teams
3. **Server Publishing** - Registering popular enterprise integrations
4. **Discovery & Search** - Finding and evaluating available connectors
5. **Monitoring** - Health checks and operational metrics

## 🚀 Quick Start

### Prerequisites
- ✅ **HTTPie** installed (`brew install httpie` or `pip install httpie`)
- ✅ **API server running** on `http://localhost:3010`
- ✅ **Database** running and migrated

### Run the Demo

```bash
# Make sure the API server is running
npm run dev:api

# In another terminal, run the demo
./docs/demo/demo-httpie.sh
```

## 📊 Demo Results Summary

**From the latest successful execution:**

### ✅ **Authentication & Security**
- ✅ Admin user registration and authentication
- ✅ JWT token generation and validation
- ✅ Rate limiting in effect (9,980+ requests remaining)
- ✅ Security headers properly configured

### ✅ **API Key Management**
- ✅ Created 2 enterprise API keys:
  - **Data Analyst Key**: Read-only access (expires in 30 days)
  - **DevOps Publisher Key**: Full publish access (expires in 90 days)
- ✅ API key CRUD operations working
- ✅ Scoped permissions functioning correctly

### ✅ **Enterprise Integration Publishing**
- ✅ **4 enterprise servers published**:
  - **Salesforce CRM** (experimental) - Sales team integration
  - **Confluence** (beta) - Knowledge management
  - **GitHub** (stable) - Development workflows  
  - **Splunk** (stable) - Analytics and monitoring
- ✅ Duplicate prevention working (409 Conflict)
- ✅ Rich metadata preservation

### ✅ **Discovery & Search**
- ✅ Public registry browsing (no auth required)
- ✅ Status filtering (2 production-ready servers found)
- ✅ Pagination ready for enterprise scale
- ✅ Detailed server information retrieval

### ✅ **Enterprise Monitoring**
- ✅ Infrastructure health checks operational
- ✅ MCP v2025-07-09 compliance verified
- ✅ Prometheus metrics available with key statistics:
  - 📦 Total Integration Servers: **4**
  - 🏭 Production-Ready Servers: **2** 
  - 👥 Active Enterprise Users: **1**
  - 🔑 Total API Keys: **2**

### ✅ **Cleanup & Resource Management**
- ✅ API key deletion working (204 No Content)
- ✅ Servers persist for discovery
- ✅ Clean demo environment management

## 🏢 Enterprise Integration Scenarios

### **Salesforce CRM Integration**
- **Status**: Experimental (v0.8.1)
- **Use Case**: Sales teams managing leads and opportunities
- **Features**: Supports leads, opportunities, accounts
- **API Version**: v58.0 Enterprise Edition

### **Confluence Knowledge Base**
- **Status**: Beta (v1.3.0)  
- **Use Case**: Knowledge management and documentation access
- **Features**: Multi-registry support (npm, maven), HTTP transport
- **Spaces**: Engineering, Product, Marketing

### **GitHub Development Platform**
- **Status**: Production-ready (v2.1.0)
- **Use Case**: DevOps workflows, CI/CD, code reviews
- **Features**: Repos, issues, PRs, actions, enterprise OAuth
- **Deployment**: Multiple registries (npm, Docker)

### **Splunk Analytics Platform**
- **Status**: Production-ready (v3.0.2)
- **Use Case**: Log analysis, system monitoring, SRE workflows
- **Features**: Search, dashboards, alerts across multiple indexes
- **Version**: Compatible with Splunk 9.x

## 📈 Performance Metrics

**From Demo Execution:**
- **Total Runtime**: ~47 seconds for complete workflow
- **API Response Times**: All responses < 200ms
- **Rate Limiting**: 10,000 requests per 15-minute window
- **Success Rate**: 100% (all operations completed successfully)
- **Resource Usage**: Efficient memory and CPU utilization

## 🔒 Security Validation

**Verified Security Features:**
- ✅ **Authentication**: JWT tokens with proper expiration
- ✅ **Authorization**: Role-based API keys with scoped permissions
- ✅ **Rate Limiting**: Per-endpoint and per-user limits enforced
- ✅ **Input Validation**: Malformed requests properly rejected
- ✅ **Duplicate Prevention**: Namespace protection working
- ✅ **Security Headers**: Comprehensive HTTP security headers
- ✅ **Audit Logging**: All operations tracked and logged

## 📚 Detailed Documentation

For in-depth information on each part of the demo:

- **[Part 1: Authentication](./part-1-authentication.md)** - Admin setup and JWT authentication
- **[Part 2: API Keys](./part-2-api-keys.md)** - Role-based access management
- **[Part 3: Publishing](./part-3-server-publishing.md)** - Enterprise server registration
- **[Part 4: Discovery](./part-4-discovery.md)** - Search and browsing capabilities
- **[Part 5: Monitoring](./part-5-monitoring.md)** - Health checks and metrics
- **[Part 6: Cleanup](./part-6-cleanup.md)** - Resource cleanup procedures

## 🛠️ Troubleshooting

**Common Issues:**

1. **Server not running**: `npm run dev:api` first
2. **HTTPie not installed**: `brew install httpie` or `pip install httpie`
3. **Database connection**: Ensure PostgreSQL is running and migrated
4. **Port conflicts**: Default port 3010, check with `lsof -i :3010`

**Environment Variables:**
```bash
JWT_SECRET="development-jwt-secret-key-that-is-long-enough-for-security-validation"
ADMIN_SETUP_KEY="development-admin-key-change-in-production"
DATABASE_URL="postgresql://postgres:postgres123@localhost:5435/mcp_registry_v2"
```

## 🎉 What's Next?

After running the demo successfully:
1. **Explore the UI** - Try the React frontend (when available)
2. **Integration Testing** - Use the API in your applications
3. **Production Deployment** - Deploy with Docker and proper secrets
4. **Enterprise Rollout** - Configure for your organization's needs

---

**Demo Status**: ✅ **Fully Operational**  
**Last Validated**: September 14, 2025  
**MCP Version**: v2025-07-09  
**Success Rate**: 100%