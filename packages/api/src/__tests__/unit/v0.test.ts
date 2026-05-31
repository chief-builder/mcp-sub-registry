/**
 * Unit Tests for MCP Registry v0.1 API Routes
 * Tests endpoint behavior against the MCP Registry API v0.1 / server.json 2025-12-11.
 */

import request from 'supertest';
import app from '../../app';

// Mock the prisma module
jest.mock('../../db', () => {
  const server = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
  };
  const prisma: any = {
    server,
    namespace: { findUnique: jest.fn() },
    auditLog: { create: jest.fn() },
    apiKey: { findUnique: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn() },
    // Run transaction callbacks against the same mock client.
    $transaction: jest.fn((cb: any) => cb(prisma)),
  };
  return { prisma };
});

// Mock the auth middleware: authenticated admin credential.
jest.mock('../../middleware/auth', () => {
  const mockMiddleware = (req: any, _res: any, next: any) => {
    req.user = { id: 'test-user-id', email: 'test@example.com', roles: ['admin'], auth_method: 'api_key' };
    req.api_key = { id: 'test-api-key-id', name: 'Test API Key', scopes: ['read', 'write', 'publish', 'admin'], user_id: 'test-user-id' };
    req.is_admin = true; // admin credential bypasses namespace ownership
    next();
  };
  return {
    authenticate: jest.fn(() => mockMiddleware),
    optionalAuth: jest.fn(() => mockMiddleware),
    requireAuth: jest.fn(() => mockMiddleware),
  };
});

import { prisma } from '../../db';

const mockPrisma = prisma as any;
const OFFICIAL = 'io.modelcontextprotocol.registry/official';

function makeRow(overrides: Record<string, any> = {}) {
  const now = new Date('2024-01-01T00:00:00Z');
  return {
    id: 'srv-1',
    name: 'io.github.test/server1',
    description: 'Test server 1',
    title: null,
    version: '1.0.0',
    website_url: null,
    schema_url: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
    repository: { url: 'https://github.com/test/server1', source: 'github' },
    packages: [{ registryType: 'npm', registryBaseUrl: 'https://registry.npmjs.org', identifier: '@test/server1', version: '1.0.0', transport: { type: 'stdio' } }],
    remotes: [],
    registry_status: 'active',
    status_message: null,
    is_latest: true,
    metadata: {},
    published_at: now,
    status_changed_at: now,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

describe('MCP Registry v0.1 API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // jest config has resetMocks:true, which wipes implementations set in the
    // jest.mock factory — re-establish the transaction passthrough each test.
    mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockPrisma));
  });

  describe('GET /v0.1/servers', () => {
    it('returns servers with cursor metadata and the official _meta block', async () => {
      mockPrisma.server.findMany.mockResolvedValue([makeRow()]);
      mockPrisma.server.count.mockResolvedValue(1);

      const res = await request(app).get('/v0.1/servers').expect(200);

      expect(res.body.metadata).toMatchObject({ count: 1 });
      expect(res.body.metadata.nextCursor).toBeUndefined();
      expect(res.body.servers).toHaveLength(1);
      const s = res.body.servers[0];
      expect(s.name).toBe('io.github.test/server1');
      expect(s._meta[OFFICIAL]).toMatchObject({ status: 'active', isLatest: true });
      expect(typeof s._meta[OFFICIAL].publishedAt).toBe('string');
    });

    it('defaults to latest, non-deleted servers', async () => {
      mockPrisma.server.findMany.mockResolvedValue([]);
      mockPrisma.server.count.mockResolvedValue(0);

      await request(app).get('/v0.1/servers').expect(200);

      const args = mockPrisma.server.findMany.mock.calls[0][0];
      expect(args.where).toMatchObject({ is_latest: true, registry_status: { not: 'deleted' } });
      expect(args.take).toBe(51); // limit 50 + 1 for has-more probe
    });

    it('emits a nextCursor when there are more results', async () => {
      // limit=1 -> handler requests take=2; returning 2 rows signals "more".
      mockPrisma.server.findMany.mockResolvedValue([makeRow({ id: 'a' }), makeRow({ id: 'b' })]);
      mockPrisma.server.count.mockResolvedValue(5);

      const res = await request(app).get('/v0.1/servers?limit=1').expect(200);
      expect(res.body.servers).toHaveLength(1);
      expect(res.body.metadata.nextCursor).toBeTruthy();
    });

    it('handles database errors gracefully', async () => {
      mockPrisma.server.findMany.mockRejectedValue(new Error('boom'));
      mockPrisma.server.count.mockRejectedValue(new Error('boom'));

      const res = await request(app).get('/v0.1/servers').expect(500);
      expect(res.body).toMatchObject({ error: 'Failed to fetch servers', code: 'INTERNAL_ERROR' });
    });
  });

  describe('GET /v0.1/servers/:serverName/versions/:version', () => {
    it('returns a specific version', async () => {
      mockPrisma.server.findFirst.mockResolvedValue(makeRow());
      const res = await request(app)
        .get('/v0.1/servers/io.github.test%2Fserver1/versions/1.0.0')
        .expect(200);
      expect(res.body.name).toBe('io.github.test/server1');
      expect(res.body._meta[OFFICIAL].status).toBe('active');
    });

    it('returns 404 when not found', async () => {
      mockPrisma.server.findFirst.mockResolvedValue(null);
      const res = await request(app)
        .get('/v0.1/servers/io.github.test%2Fmissing/versions/latest')
        .expect(404);
      expect(res.body).toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  describe('GET /v0.1/servers/:serverName/versions', () => {
    it('returns the version list', async () => {
      mockPrisma.server.findMany.mockResolvedValue([makeRow({ version: '1.1.0' }), makeRow({ version: '1.0.0', is_latest: false })]);
      const res = await request(app)
        .get('/v0.1/servers/io.github.test%2Fserver1/versions')
        .expect(200);
      expect(res.body.metadata.count).toBe(2);
      expect(res.body.servers.map((s: any) => s.version)).toEqual(['1.1.0', '1.0.0']);
    });

    it('returns 404 for an unknown server', async () => {
      mockPrisma.server.findMany.mockResolvedValue([]);
      await request(app).get('/v0.1/servers/io.github.test%2Fnope/versions').expect(404);
    });
  });

  describe('POST /v0.1/publish', () => {
    const validBody = {
      name: 'io.github.test/new-server',
      description: 'A new MCP server',
      version: '1.0.0',
      repository: { url: 'https://github.com/test/new-server', source: 'github' },
      packages: [{ registryType: 'npm', registryBaseUrl: 'https://registry.npmjs.org', identifier: '@test/new-server', version: '1.0.0', transport: { type: 'stdio' } }],
    };

    it('publishes a new version (201) with the official _meta block', async () => {
      mockPrisma.server.findUnique.mockResolvedValue(null); // no existing version
      mockPrisma.server.create.mockResolvedValue(makeRow({ id: 'new-1', name: validBody.name }));
      mockPrisma.server.findMany.mockResolvedValue([{ id: 'new-1', version: '1.0.0' }]); // recomputeLatest
      mockPrisma.server.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.server.update.mockResolvedValue({});
      mockPrisma.server.findUniqueOrThrow.mockResolvedValue(makeRow({ id: 'new-1', name: validBody.name }));
      mockPrisma.auditLog.create.mockResolvedValue({});

      const res = await request(app).post('/v0.1/publish').send(validBody).expect(201);
      expect(res.body.name).toBe(validBody.name);
      expect(res.body._meta[OFFICIAL].status).toBe('active');
    });

    it('rejects a duplicate (name, version) with 409', async () => {
      mockPrisma.server.findUnique.mockResolvedValue(makeRow());
      const res = await request(app).post('/v0.1/publish').send(validBody).expect(409);
      expect(res.body).toMatchObject({ code: 'CONFLICT' });
    });

    it('rejects an invalid name format with 400', async () => {
      const res = await request(app)
        .post('/v0.1/publish')
        .send({ ...validBody, name: 'not-a-namespaced-name' })
        .expect(400);
      expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'name' })])
      );
    });

    it('rejects a payload with neither packages nor remotes with 400', async () => {
      const { packages, ...noPackages } = validBody;
      const res = await request(app).post('/v0.1/publish').send(noPackages).expect(400);
      expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
    });
  });

  describe('GET /v0.1/health', () => {
    it('returns health status', async () => {
      const res = await request(app).get('/v0.1/health').expect(200);
      expect(res.body).toMatchObject({ status: 'healthy', version: '0.1.0' });
      expect(typeof res.body.timestamp).toBe('string');
    });
  });
});
