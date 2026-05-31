/**
 * End-to-End API Workflow Tests (MCP Registry v0.1)
 * Tests complete user journeys through the /v0.1 API.
 */

import request from 'supertest';
import app from '../../app';
import { testUtils } from '../setup';

const OFFICIAL = 'io.modelcontextprotocol.registry/official';

function buildServer(name: string, overrides: Record<string, any> = {}): Record<string, any> {
  return {
    name,
    description: 'Enterprise MCP server',
    version: '1.0.0',
    repository: { url: 'https://github.com/company/server', source: 'github' },
    packages: [{
      registryType: 'npm',
      registryBaseUrl: 'https://registry.npmjs.org',
      identifier: '@company/server',
      version: '1.0.0',
      transport: { type: 'stdio' },
    }],
    ...overrides,
  };
}

describe('End-to-End API Workflows (v0.1)', () => {
  let auth: any;

  beforeEach(async () => {
    await testUtils.cleanup();
    auth = await testUtils.createTestAuth(); // admin-scoped key
  });

  afterEach(async () => {
    await testUtils.cleanup();
  });

  describe('Server lifecycle', () => {
    it('handles publish → list → retrieve → versions → deprecate → delete', async () => {
      // 1. Empty registry.
      const empty = await request(app).get('/v0.1/servers').expect(200);
      expect(empty.body.servers).toHaveLength(0);
      expect(empty.body.metadata.count).toBe(0);

      // 2. Publish v1.0.0.
      const name = 'io.github.company/analytics-engine';
      const enc = encodeURIComponent(name);
      const publish1 = await request(app)
        .post('/v0.1/publish')
        .set(auth.headers)
        .send(buildServer(name, {
          version: '1.0.0',
          remotes: [{ type: 'streamable-http', url: 'https://mcp.company.com/analytics' }],
          _meta: { 'com.company.enterprise': { owner: 'data-team', tier: 1 } },
        }))
        .expect(201);
      expect(publish1.body.name).toBe(name);

      // 3. Appears in list (latest only).
      const afterFirst = await request(app).get('/v0.1/servers').expect(200);
      expect(afterFirst.body.servers).toHaveLength(1);
      expect(afterFirst.body.servers[0].name).toBe(name);

      // 4. Retrieve latest by name.
      const retrieve = await request(app).get(`/v0.1/servers/${enc}/versions/latest`).expect(200);
      expect(retrieve.body).toMatchObject({ name, version: '1.0.0' });
      expect(retrieve.body._meta['com.company.enterprise']).toEqual({ owner: 'data-team', tier: 1 });

      // 5. Publish v2.0.0 -> becomes latest.
      await request(app).post('/v0.1/publish').set(auth.headers).send(buildServer(name, { version: '2.0.0' })).expect(201);
      const versions = await request(app).get(`/v0.1/servers/${enc}/versions`).expect(200);
      expect(versions.body.servers.map((s: any) => s.version)).toEqual(['2.0.0', '1.0.0']);
      const latest = await request(app).get(`/v0.1/servers/${enc}/versions/latest`).expect(200);
      expect(latest.body.version).toBe('2.0.0');

      // 6. Deprecate the old version.
      const dep = await request(app)
        .patch(`/v0.1/servers/${enc}/versions/1.0.0/status`)
        .set(auth.headers)
        .send({ status: 'deprecated' })
        .expect(200);
      expect(dep.body._meta[OFFICIAL].status).toBe('deprecated');

      // 7. Delete a version (soft delete).
      await request(app).delete(`/v0.1/servers/${enc}/versions/1.0.0`).set(auth.headers).expect(200);

      // 8. Health stays green throughout.
      const health = await request(app).get('/v0.1/health').expect(200);
      expect(health.body.status).toBe('healthy');
    });
  });

  describe('Pagination workflow', () => {
    it('browses a large list page by page with cursors', async () => {
      for (let i = 1; i <= 60; i++) {
        await testUtils.createTestServer('', { name: `io.github.company/service-${i.toString().padStart(3, '0')}` });
      }

      const seen = new Set<string>();
      let cursor: string | undefined;
      let pages = 0;
      do {
        const url = cursor ? `/v0.1/servers?limit=25&cursor=${encodeURIComponent(cursor)}` : '/v0.1/servers?limit=25';
        const res = await request(app).get(url).expect(200);
        expect(res.body.metadata.count).toBe(60);
        res.body.servers.forEach((s: any) => seen.add(`${s.name}@${s.version}`));
        cursor = res.body.metadata.nextCursor;
        pages++;
        expect(pages).toBeLessThanOrEqual(5); // 60/25 -> 3 pages; guard against loops
      } while (cursor);

      expect(seen.size).toBe(60);
      expect(pages).toBe(3);
    });
  });

  describe('Error handling workflow', () => {
    it('handles not-found, validation, and conflict errors', async () => {
      // Unknown server.
      await request(app)
        .get('/v0.1/servers/io.github.company%2Fmissing/versions/latest')
        .expect(404)
        .expect((res) => expect(res.body).toMatchObject({ code: 'NOT_FOUND' }));

      // Validation failures.
      const invalid = [
        { description: 'no name', version: '1.0.0' },
        buildServer('invalid_name'),
        { ...buildServer('io.github.company/x'), version: 'not-semver' },
      ];
      for (const body of invalid) {
        await request(app).post('/v0.1/publish').set(auth.headers).send(body)
          .expect(400)
          .expect((res) => expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' }));
      }

      // Duplicate (name, version).
      const dup = buildServer('io.github.company/dup');
      await request(app).post('/v0.1/publish').set(auth.headers).send(dup).expect(201);
      await request(app).post('/v0.1/publish').set(auth.headers).send(dup)
        .expect(409)
        .expect((res) => expect(res.body).toMatchObject({ code: 'CONFLICT' }));
    });
  });

  describe('All-versions status workflow', () => {
    it('deprecates every version of a server at once', async () => {
      const name = 'io.github.company/bulk';
      const enc = encodeURIComponent(name);
      await request(app).post('/v0.1/publish').set(auth.headers).send(buildServer(name, { version: '1.0.0' })).expect(201);
      await request(app).post('/v0.1/publish').set(auth.headers).send(buildServer(name, { version: '1.1.0' })).expect(201);

      const res = await request(app)
        .patch(`/v0.1/servers/${enc}/status`)
        .set(auth.headers)
        .send({ status: 'deprecated', statusMessage: 'project retired' })
        .expect(200);

      expect(res.body.updatedCount).toBe(2);
      res.body.servers.forEach((s: any) => expect(s._meta[OFFICIAL].status).toBe('deprecated'));
    });
  });
});
