/**
 * Unit Tests for MCP v0 API Routes
 * Tests all endpoints for compliance with MCP Registry API v2025-07-09
 */

import request from 'supertest';
import app from '../../app';

// Mock the prisma module
jest.mock('../../db', () => ({
  prisma: {
    server: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    },
    auditLog: {
      create: jest.fn()
    },
    apiKey: {
      findUnique: jest.fn(),
      update: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    }
  }
}));

// Mock the auth middleware to bypass authentication for unit tests
jest.mock('../../middleware/auth', () => {
  const mockMiddleware = (req: any, res: any, next: any) => {
    // Add mock user context for tests that need it
    (req as any).user = {
      id: 'test-user-id',
      email: 'test@example.com',
      roles: ['admin'],
      auth_method: 'api_key'
    };
    (req as any).api_key = {
      id: 'test-api-key-id',
      name: 'Test API Key',
      scopes: ['read', 'write', 'publish'],
      user_id: 'test-user-id'
    };
    next();
  };
  
  return {
    authenticate: jest.fn(() => mockMiddleware),
    optionalAuth: jest.fn(() => mockMiddleware),
    requireAuth: jest.fn(() => mockMiddleware)
  };
});

import { prisma } from '../../db';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('MCP v0 API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /v0/servers', () => {
    it('should return servers with correct pagination structure', async () => {
      const mockServers = [
        {
          id: 'test-id-1',
          name: 'com.company.server1',
          description: 'Test server 1',
          status: 'stable',
          version: '1.0.0',
          repository: { type: 'git', url: 'https://github.com/test/server1' },
          packages: [{ registry: 'npm', identifier: '@company/server1', version: '1.0.0' }],
          remote: { transport: 'stdio', url: 'npx @company/server1' },
          metadata: {},
          created_at: new Date('2024-01-01T00:00:00Z'),
          updated_at: new Date('2024-01-01T00:00:00Z')
        }
      ];

      (mockPrisma.server.count as jest.Mock).mockResolvedValue(1);
      (mockPrisma.server.findMany as jest.Mock).mockResolvedValue(mockServers);

      const response = await request(app)
        .get('/v0/servers')
        .expect(200);

      expect(response.body).toMatchObject({
        servers: expect.arrayContaining([
          expect.objectContaining({
            id: 'test-id-1',
            name: 'com.company.server1',
            description: 'Test server 1',
            status: 'stable',
            version: '1.0.0',
            repository: { type: 'git', url: 'https://github.com/test/server1' },
            packages: [{ registry: 'npm', identifier: '@company/server1', version: '1.0.0' }],
            remote: { transport: 'stdio', url: 'npx @company/server1' },
            metadata: {}
          })
        ]),
        pagination: expect.objectContaining({
          total: 1,
          limit: 50,
          offset: 0,
          has_more: false
        })
      });
    });

    it('should handle pagination parameters correctly', async () => {
      (mockPrisma.server.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.server.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/v0/servers?limit=10&offset=20')
        .expect(200);

      expect(mockPrisma.server.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { created_at: 'desc' },
        take: 10,
        skip: 20
      });
    });

    it('should filter by status when provided', async () => {
      (mockPrisma.server.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.server.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/v0/servers?status=stable')
        .expect(200);

      expect(mockPrisma.server.findMany).toHaveBeenCalledWith({
        where: { status: 'stable' },
        orderBy: { created_at: 'desc' },
        take: 50,
        skip: 0
      });
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.server.count as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/v0/servers')
        .expect(500);

      expect(response.body).toMatchObject({
        error: 'Failed to fetch servers',
        code: 'INTERNAL_ERROR'
      });
    });
  });

  describe('GET /v0/servers/:id', () => {
    it('should return a specific server by ID', async () => {
      const mockServer = {
        id: 'test-id-1',
        name: 'com.company.server1',
        description: 'Test server 1',
        status: 'stable',
        version: '1.0.0',
        repository: { type: 'git', url: 'https://github.com/test/server1' },
        packages: [{ registry: 'npm', identifier: '@company/server1', version: '1.0.0' }],
        remote: { transport: 'stdio', url: 'npx @company/server1' },
        metadata: {},
        created_at: new Date('2024-01-01T00:00:00Z'),
        updated_at: new Date('2024-01-01T00:00:00Z')
      };

      (mockPrisma.server.findUnique as jest.Mock).mockResolvedValue(mockServer);

      const response = await request(app)
        .get('/v0/servers/test-id-1')
        .expect(200);

      expect(response.body).toMatchObject({
        id: 'test-id-1',
        name: 'com.company.server1',
        description: 'Test server 1',
        status: 'stable',
        version: '1.0.0'
      });
    });

    it('should return 404 for non-existent server', async () => {
      (mockPrisma.server.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/v0/servers/non-existent')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Server not found',
        code: 'NOT_FOUND'
      });
    });
  });

  describe('POST /v0/publish', () => {
    beforeEach(() => {
      (mockPrisma.auditLog.create as jest.Mock).mockResolvedValue({
        id: 'audit-id',
        action: 'CREATE',
        resource_type: 'server',
        resource_id: 'server-id',
        created_at: new Date()
      });
    });

    it('should create a new server with valid MCP schema', async () => {
      const newServer = {
        name: 'com.company.new-server',
        description: 'A new MCP server',
        status: 'experimental',
        version: '1.0.0',
        repository: {
          type: 'git',
          url: 'https://github.com/company/new-server'
        },
        packages: [{
          registry: 'npm',
          identifier: '@company/new-server',
          version: '1.0.0'
        }],
        remote: {
          transport: 'stdio',
          url: 'npx @company/new-server'
        },
        metadata: {
          'com.company.enterprise': {
            owner: 'engineering-team',
            tier: 2
          }
        }
      };

      const mockCreatedServer = { 
        id: 'new-server-id', 
        created_at: new Date(),
        updated_at: new Date(),
        ...newServer 
      };

      (mockPrisma.server.findUnique as jest.Mock).mockResolvedValue(null); // No existing server
      (mockPrisma.server.create as jest.Mock).mockResolvedValue(mockCreatedServer);

      const response = await request(app)
        .post('/v0/publish')
        .send(newServer)
        .expect(201);

      expect(response.body).toMatchObject({
        id: 'new-server-id',
        name: 'com.company.new-server',
        description: 'A new MCP server'
      });

      expect(mockPrisma.server.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'com.company.new-server'
        })
      });
    });

    it('should validate required fields', async () => {
      const invalidServer = {
        description: 'Missing required fields'
      };

      const response = await request(app)
        .post('/v0/publish')
        .send(invalidServer)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR'
      });
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.stringMatching(/required/i)
          })
        ])
      );
    });

    it('should validate name format (reverse DNS)', async () => {
      const invalidServer = {
        name: 'invalid_name_format',
        description: 'Test server',
        version: '1.0.0'
      };

      const response = await request(app)
        .post('/v0/publish')
        .send(invalidServer)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR'
      });
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.stringMatching(/reverse DNS/i)
          })
        ])
      );
    });

    it('should handle duplicate server names', async () => {
      const existingServer = {
        id: 'existing-id',
        name: 'com.company.existing-server',
        description: 'Existing server',
        version: '1.0.0'
      };
      
      // Mock findUnique to return an existing server (simulating duplicate)
      (mockPrisma.server.findUnique as jest.Mock).mockResolvedValue(existingServer);

      const newServer = {
        name: 'com.company.existing-server',
        description: 'Duplicate server',
        version: '1.0.0'
      };

      const response = await request(app)
        .post('/v0/publish')
        .send(newServer)
        .expect(409);

      expect(response.body).toMatchObject({
        error: 'Server name already exists',
        code: 'CONFLICT'
      });
    });
  });

  describe('GET /v0/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/v0/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        version: '0.1.0'
      });
    });
  });
});