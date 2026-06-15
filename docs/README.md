# MCP Sub-Registry Documentation

This monorepo contains MCP Sub-Registry, a service for publishing,
discovering, governing, and monitoring Model Context Protocol (MCP) servers.

## Repository Structure

```
mcp-sub-registry/
├── packages/
│   ├── api/           # Backend Express.js API
│   ├── ui/            # React frontend application  
│   └── shared/        # Shared types and utilities
├── docs/              # Documentation
├── tools/             # Development tools and scripts
└── docker/            # Docker configurations
```

## GitHub Pages

The repository's GitHub Pages site is published from the `main` branch and the
`/docs` folder.

- [Project landing page](./index.html)
- [Demo walkthrough](./demo/)

Run the static page validator from the repository root before publishing:

```bash
npm run docs:check
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Documentation Sections

- [**API Documentation**](./api/) - OpenAPI specifications and endpoint details
- [**Architecture**](./architecture/) - System design and database schema
- [**Demo**](./demo/) - Interactive demo with sample data and walkthroughs
- [**Deployment**](./deployment/) - Production deployment guides and configurations

## Key Features

- **MCP Server Registry** - Publish, discover, and manage MCP servers
- **Dual Authentication** - JWT tokens for users, API keys for services
- **Production Ready** - Docker deployment, metrics, rate limiting
- **Modern UI** - React + TypeScript with OpenAPI-generated client
- **Comprehensive Testing** - Full API test suite and demo scenarios

## Architecture

The system follows a modern monorepo architecture:

- **Backend API** (`packages/api/`) - Express.js with TypeScript, Prisma ORM, PostgreSQL
- **Frontend UI** (`packages/ui/`) - React + Vite with Tailwind CSS  
- **Shared Package** (`packages/shared/`) - Common types, constants, and utilities

## Development

Each package has its own development server and can be run independently:

```bash
# Backend only
cd packages/api && npm run dev

# Frontend only  
cd packages/ui && npm run dev

# Both (from root)
npm run dev
```

## Contributing

1. Follow the existing code patterns and TypeScript strict mode
2. Add tests for new features
3. Update documentation for API changes
4. Run lint and type checks before committing

## Support

For questions or issues, please refer to the detailed documentation in each section or create an issue in the repository.
