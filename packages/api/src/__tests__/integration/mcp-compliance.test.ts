/**
 * Integration Tests for MCP Registry v0.1 Compliance
 * Exercises the /v0.1 API against a real database.
 */

import request from 'supertest';
import app from '../../app';
import { testUtils } from '../setup';

const OFFICIAL = 'io.modelcontextprotocol.registry/official';

function buildServer(name: string, overrides: Record<string, any> = {}): Record<string, any> {
  return {
    $schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
    name,
    description: 'A compliant MCP server',
    version: '1.0.0',
    repository: { url: 'https://github.com/acme/server', source: 'github' },
    packages: [{
      registryType: 'npm',
      registryBaseUrl: 'https://registry.npmjs.org',
      identifier: '@acme/server',
      version: '1.0.0',
      transport: { type: 'stdio' },
    }],
    ...overrides,
  };
}

describe('MCP Registry v0.1 Compliance', () => {
  let auth: any;

  beforeEach(async () => {
    await testUtils.cleanup();
    auth = await testUtils.createTestAuth(); // admin-scoped key
  });

  afterEach(async () => {
    await testUtils.cleanup();
  });

  describe('Server listing', () => {
    it('returns the v0.1 list envelope with the official _meta block', async () => {
      await testUtils.createTestServer('', { name: 'com.acme/analytics' });
      await testUtils.createTestServer('', { name: 'com.acme/monitoring' });

      const res = await request(app).get('/v0.1/servers').expect(200);

      expect(res.body).toHaveProperty('servers');
      expect(res.body.metadata).toMatchObject({ count: 2 });
      expect(res.body.servers).toHaveLength(2);

      res.body.servers.forEach((s: any) => {
        expect(s).toHaveProperty('name');
        expect(s).toHaveProperty('version');
        const official = s._meta[OFFICIAL];
        expect(official.status).toMatch(/^(active|deprecated|deleted)$/);
        expect(typeof official.isLatest).toBe('boolean');
      });
    });

    it('paginates with an opaque cursor', async () => {
      for (let i = 1; i <= 75; i++) {
        await testUtils.createTestServer('', { name: `com.acme/server-${i.toString().padStart(2, '0')}` });
      }

      const page1 = await request(app).get('/v0.1/servers?limit=50').expect(200);
      expect(page1.body.servers).toHaveLength(50);
      expect(page1.body.metadata.count).toBe(75);
      expect(page1.body.metadata.nextCursor).toBeTruthy();

      const page2 = await request(app)
        .get(`/v0.1/servers?limit=50&cursor=${encodeURIComponent(page1.body.metadata.nextCursor)}`)
        .expect(200);
      expect(page2.body.servers).toHaveLength(25);
      expect(page2.body.metadata.nextCursor).toBeFalsy();

      // No overlap between pages.
      const ids = new Set([
        ...page1.body.servers.map((s: any) => `${s.name}@${s.version}`),
        ...page2.body.servers.map((s: any) => `${s.name}@${s.version}`),
      ]);
      expect(ids.size).toBe(75);
    });

    it('searches by name substring', async () => {
      await testUtils.createTestServer('', { name: 'com.acme/database-proxy' });
      await testUtils.createTestServer('', { name: 'com.acme/web-cache' });

      const res = await request(app).get('/v0.1/servers?search=database').expect(200);
      expect(res.body.servers).toHaveLength(1);
      expect(res.body.servers[0].name).toBe('com.acme/database-proxy');
    });
  });

  describe('Publishing', () => {
    it('publishes a valid server.json and echoes it back', async () => {
      const body = buildServer('io.github.acme/valid-server', {
        version: '2.1.0',
        title: 'Valid Server',
        websiteUrl: 'https://docs.acme.com/valid',
        remotes: [{ type: 'streamable-http', url: 'https://mcp.acme.com/valid' }],
      });

      const res = await request(app).post('/v0.1/publish').set(auth.headers).send(body).expect(201);

      expect(res.body.name).toBe(body.name);
      expect(res.body.version).toBe('2.1.0');
      expect(res.body.title).toBe('Valid Server');
      expect(res.body.repository).toEqual(body.repository);
      expect(res.body.packages).toEqual(body.packages);
      expect(res.body.remotes).toEqual(body.remotes);
      expect(res.body._meta[OFFICIAL]).toMatchObject({ status: 'active', isLatest: true });
    });

    it('rejects invalid server.json payloads', async () => {
      const invalid = [
        { description: 'no name', version: '1.0.0', remotes: [{ type: 'sse', url: 'https://x/y' }] },
        buildServer('not-namespaced'),                                  // bad name
        buildServer('io.github.acme/bad-repo', { repository: { url: 'https://x/y' } }), // repo missing source
        { ...buildServer('io.github.acme/bad-pkg'), packages: [{ identifier: 'x', version: '1.0.0' }] }, // pkg missing registryType/transport
        { name: 'io.github.acme/empty', description: 'no packages or remotes', version: '1.0.0' }, // neither packages nor remotes
      ];
      for (const body of invalid) {
        await request(app).post('/v0.1/publish').set(auth.headers).send(body).expect(400);
      }
    });

    it('preserves publisher _meta and adds the official block', async () => {
      const body = buildServer('io.github.acme/meta-server', {
        _meta: {
          'com.acme.enterprise': { owner: 'platform-team', tier: 1, tags: ['SOX', 'PCI'] },
        },
      });

      const res = await request(app).post('/v0.1/publish').set(auth.headers).send(body).expect(201);
      expect(res.body._meta['com.acme.enterprise']).toEqual(body._meta['com.acme.enterprise']);
      expect(res.body._meta[OFFICIAL]).toBeDefined();
    });
  });

  describe('Versioning and status', () => {
    it('tracks version history and moves isLatest to the newest version', async () => {
      const name = 'io.github.acme/versioned';
      await request(app).post('/v0.1/publish').set(auth.headers).send(buildServer(name, { version: '1.0.0' })).expect(201);
      await request(app).post('/v0.1/publish').set(auth.headers).send(buildServer(name, { version: '1.1.0' })).expect(201);

      const enc = encodeURIComponent(name);

      // List shows only the latest version.
      const list = await request(app).get('/v0.1/servers').expect(200);
      const listed = list.body.servers.filter((s: any) => s.name === name);
      expect(listed).toHaveLength(1);
      expect(listed[0].version).toBe('1.1.0');

      // Versions endpoint shows both, newest first.
      const versions = await request(app).get(`/v0.1/servers/${enc}/versions`).expect(200);
      expect(versions.body.servers.map((s: any) => s.version)).toEqual(['1.1.0', '1.0.0']);

      // "latest" resolves to 1.1.0.
      const latest = await request(app).get(`/v0.1/servers/${enc}/versions/latest`).expect(200);
      expect(latest.body.version).toBe('1.1.0');
      expect(latest.body._meta[OFFICIAL].isLatest).toBe(true);
    });

    it('deprecates a single version via PATCH status', async () => {
      const name = 'io.github.acme/deprecate-me';
      await request(app).post('/v0.1/publish').set(auth.headers).send(buildServer(name)).expect(201);
      const enc = encodeURIComponent(name);

      const res = await request(app)
        .patch(`/v0.1/servers/${enc}/versions/1.0.0/status`)
        .set(auth.headers)
        .send({ status: 'deprecated', statusMessage: 'use a newer version' })
        .expect(200);

      expect(res.body._meta[OFFICIAL].status).toBe('deprecated');
      expect(res.body._meta[OFFICIAL].statusMessage).toBe('use a newer version');
    });

    it('soft-deletes a version and hides it from the default list', async () => {
      const name = 'io.github.acme/delete-me';
      await request(app).post('/v0.1/publish').set(auth.headers).send(buildServer(name)).expect(201);
      const enc = encodeURIComponent(name);

      await request(app).delete(`/v0.1/servers/${enc}/versions/1.0.0`).set(auth.headers).expect(200);

      const list = await request(app).get('/v0.1/servers').expect(200);
      expect(list.body.servers.find((s: any) => s.name === name)).toBeUndefined();

      // ...but visible with include_deleted.
      const withDeleted = await request(app).get('/v0.1/servers?include_deleted=true').expect(200);
      expect(withDeleted.body.servers.find((s: any) => s.name === name)).toBeDefined();
    });
  });

  describe('Namespace ownership', () => {
    it('blocks publishing under an unowned namespace and allows it once claimed', async () => {
      const pubAuth = await testUtils.createTestAuth(['publish', 'read']); // non-admin credential

      // No namespace claim yet -> forbidden.
      await request(app)
        .post('/v0.1/publish')
        .set(pubAuth.headers)
        .send(buildServer('io.github.unowned/tool'))
        .expect(403);

      // Claim the namespace for the publisher, then publish succeeds.
      await testUtils.createNamespace('io.github.owned', pubAuth.user.id);
      await request(app)
        .post('/v0.1/publish')
        .set(pubAuth.headers)
        .send(buildServer('io.github.owned/tool'))
        .expect(201);
    });
  });

  describe('Health and metrics', () => {
    it('serves the v0.1 health endpoint', async () => {
      const res = await request(app).get('/v0.1/health').expect(200);
      expect(res.body).toMatchObject({ status: 'healthy' });
      expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
    });

    it('requires admin auth for metrics and reports server counts', async () => {
      await testUtils.createTestServer('');
      await testUtils.createTestServer('');

      // Unauthenticated -> rejected.
      await request(app).get('/metrics').expect(401);

      const res = await request(app).get('/metrics').set(auth.headers).expect(200);
      expect(res.headers['content-type']).toContain('text/plain');
      expect(res.text).toContain('# HELP mcp_registry_servers_total');
      expect(res.text).toContain('mcp_registry_servers_total 2');
    });
  });
});
