# MCP Sub-Registry

An enterprise-oriented Model Context Protocol (MCP) sub-registry for publishing,
discovering, governing, and monitoring MCP servers inside an organization.

The project is a TypeScript monorepo with an Express API, PostgreSQL/Prisma data
layer, React administration UI, OpenAPI contract, demo scripts, and static
GitHub Pages documentation.

- Project site: https://chief-builder.github.io/mcp-sub-registry/
- Repository: https://github.com/chief-builder/mcp-sub-registry

## Why It Exists

Public MCP directories are useful for broad discovery. Enterprises also need a
controlled internal registry where teams can approve integrations, document
owners, attach package and transport metadata, track lifecycle status, and audit
who published what.

MCP Sub-Registry provides that internal control plane:

- MCP Registry API support for server discovery and publication workflows
- JWT authentication for users and API keys for services
- Role-aware administration for publishers and administrators
- PostgreSQL persistence with Prisma migrations
- Prometheus-style metrics and health endpoints
- React UI for browsing, publishing, and administration
- Demo scenarios for enterprise integrations and security review

## Repository Layout

```text
mcp-sub-registry/
├── packages/
│   ├── api/           # Express API, Prisma schema, tests
│   ├── ui/            # React + Vite frontend
│   └── shared/        # Shared TypeScript types and constants
├── docs/              # Documentation and GitHub Pages site
├── tools/             # Development and validation scripts
├── openapi.yaml       # Root OpenAPI contract
└── docker-compose.yml # Local PostgreSQL + service stack
```

## Quick Start

Prerequisites:

- Node.js 18+
- npm 9+
- Docker and Docker Compose
- HTTPie for the scripted demo

```bash
git clone https://github.com/chief-builder/mcp-sub-registry.git
cd mcp-sub-registry
npm install
cp .env.example .env
```

Generate real local secrets before running the API:

```bash
openssl rand -base64 48
```

Use the generated values for `JWT_SECRET` and `ADMIN_SETUP_KEY` in `.env`.

Start the local stack:

```bash
npm run docker:up
npm run db:migrate
npm run dev
```

Local services:

- API: http://localhost:3010
- UI: http://localhost:5173
- Swagger UI: http://localhost:3010/docs

## Common Commands

```bash
# Development
npm run dev              # Start API and UI
npm run dev:api          # Start API only
npm run dev:ui           # Start UI only

# Build and validation
npm run build            # Build API and UI
npm run type-check       # TypeScript validation for workspaces
npm run test             # Run workspace tests
npm run docs:check       # Validate static GitHub Pages files

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run local migrations
npm run db:studio        # Open Prisma Studio

# Docker
npm run docker:up        # Start local services
npm run docker:down      # Stop local services
```

## Demo Paths

The repository includes two demo layers:

- `docs/demo/` contains a command-line HTTPie walkthrough for authentication,
  API keys, server publishing, discovery, monitoring, and cleanup.
- `docs/index.html` is the GitHub Pages landing page for the project.

Run the scripted API demo after the API and database are available:

```bash
./docs/demo/demo-httpie.sh
```

## API Backend

`packages/api` provides the registry service:

- Express routes for registry, authentication, users, API keys, settings, and
  metrics
- Prisma schema and migrations for users, API keys, servers, namespaces, and
  audit events
- JWT and API-key authentication middleware
- Request validation for server publication and administrative operations
- Prometheus-compatible metrics and health checks

Key local endpoints:

- `GET /health`
- `GET /metrics`
- `GET /v0/servers`
- `POST /v0/servers`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/api-keys`

## Web UI

`packages/ui` provides the registry interface:

- Public server discovery and detail pages
- Multi-step server publication workflow
- API key management
- User and settings administration
- Generated OpenAPI client hooks
- Tailwind-based operational UI

## GitHub Pages

GitHub Pages is designed to publish from the repository's `main` branch and
`/docs` folder.

Important static entry points:

- `docs/index.html` - project landing page
- `docs/demo/` - scripted enterprise integration demo and walkthrough

Validate the Pages files before publishing:

```bash
npm run docs:check
```

## Security Notes

The API rejects placeholder production secrets. Set unique values for:

- `JWT_SECRET`
- `ADMIN_SETUP_KEY`

Additional controls include bcrypt password hashing, API key hashing, role-aware
authorization, rate limiting, security headers, audit logging, and explicit
metadata for secret remote headers.

## Documentation

- [Documentation index](docs/README.md)
- [API documentation](docs/api/README.md)
- [Architecture](docs/architecture/README.md)
- [Deployment](docs/deployment/README.md)
- [Demo walkthrough](docs/demo/README.md)
- [MCP Registry white paper](docs/MCP-Registry-White-Paper.md)

## Status

- MCP API version: v2025-07-09
- Implementation version: 1.0.0
- License: MIT
