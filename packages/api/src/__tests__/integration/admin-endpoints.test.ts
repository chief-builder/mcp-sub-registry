/**
 * Integration Tests for admin user-management and settings endpoints.
 */

import request from 'supertest';
import app from '../../app';
import { testUtils } from '../setup';

describe('Admin user & settings endpoints', () => {
  let admin: any;

  beforeEach(async () => {
    await testUtils.cleanup();
    admin = await testUtils.createJwtAuth(['admin']);
  });

  afterEach(async () => {
    await testUtils.cleanup();
  });

  describe('Authorization', () => {
    it('rejects unauthenticated and non-admin callers', async () => {
      await request(app).get('/api/v1/users').expect(401);
      await request(app).get('/api/v1/settings').expect(401);

      const reader = await testUtils.createJwtAuth(['reader']);
      await request(app).get('/api/v1/users').set(reader.headers).expect(403);
      await request(app).put('/api/v1/settings').set(reader.headers).send({ siteName: 'x' }).expect(403);

      // API-key credentials are not accepted on these JWT-only routes.
      const keyAuth = await testUtils.createTestAuth(['admin']);
      await request(app).get('/api/v1/users').set(keyAuth.headers).expect(401);
    });
  });

  describe('Users CRUD', () => {
    it('creates, fetches, and lists users with published counts', async () => {
      const create = await request(app)
        .post('/api/v1/users')
        .set(admin.headers)
        .send({ email: 'pub@example.com', username: 'publisher1', roles: ['publisher'], password: 'Passw0rd!' })
        .expect(201);
      const userId = create.body.id;
      expect(create.body.roles).toEqual(['publisher']);
      expect(create.body.servers_published).toBe(0);
      expect(create.body).not.toHaveProperty('password_hash');

      // Record two published servers in the audit trail for this user.
      await testUtils.createTestServer('');
      const { prisma }: any = require('../../db');
      await prisma.auditLog.create({ data: { action: 'publish', resource_type: 'server', resource_id: 's1', user_id: userId } });
      await prisma.auditLog.create({ data: { action: 'publish', resource_type: 'server', resource_id: 's2', user_id: userId } });

      const get = await request(app).get(`/api/v1/users/${userId}`).set(admin.headers).expect(200);
      expect(get.body.servers_published).toBe(2);

      const list = await request(app).get('/api/v1/users?role=publisher').set(admin.headers).expect(200);
      expect(list.body.users).toHaveLength(1);
      expect(list.body.users[0].id).toBe(userId);
      expect(list.body.pagination.total).toBe(1);
    });

    it('rejects duplicates and invalid input', async () => {
      await request(app).post('/api/v1/users').set(admin.headers)
        .send({ email: 'dup@example.com', username: 'dupuser' }).expect(201);
      await request(app).post('/api/v1/users').set(admin.headers)
        .send({ email: 'dup@example.com', username: 'dupuser2' }).expect(409);
      await request(app).post('/api/v1/users').set(admin.headers)
        .send({ email: 'not-an-email', username: 'x' }).expect(400);
    });

    it('updates roles/status and protects the last admin', async () => {
      // admin is currently the only admin -> cannot demote.
      await request(app)
        .patch(`/api/v1/users/${admin.user.id}`)
        .set(admin.headers)
        .send({ roles: ['reader'] })
        .expect(409)
        .expect((res) => expect(res.body).toMatchObject({ code: 'LAST_ADMIN' }));

      // Add a second admin, then demotion is allowed.
      const second = await request(app).post('/api/v1/users').set(admin.headers)
        .send({ email: 'admin2@example.com', username: 'admin2', roles: ['admin'] }).expect(201);

      const patched = await request(app)
        .patch(`/api/v1/users/${second.body.id}`)
        .set(admin.headers)
        .send({ is_active: false })
        .expect(200);
      expect(patched.body.is_active).toBe(false);
    });

    it('deletes users with guards', async () => {
      // Cannot delete self.
      await request(app).delete(`/api/v1/users/${admin.user.id}`).set(admin.headers).expect(409);

      // Cannot delete a namespace owner.
      const owner = await testUtils.createTestUser({ roles: ['publisher'] });
      await testUtils.createNamespace('io.github.owner', owner.id);
      await request(app).delete(`/api/v1/users/${owner.id}`).set(admin.headers)
        .expect(409)
        .expect((res) => expect(res.body).toMatchObject({ code: 'NAMESPACE_OWNER' }));

      // A plain user deletes cleanly.
      const victim = await testUtils.createTestUser({ roles: ['reader'] });
      await request(app).delete(`/api/v1/users/${victim.id}`).set(admin.headers).expect(204);
      await request(app).get(`/api/v1/users/${victim.id}`).set(admin.headers).expect(404);
    });
  });

  describe('Settings', () => {
    it('returns defaults, persists updates, and validates', async () => {
      const defaults = await request(app).get('/api/v1/settings').set(admin.headers).expect(200);
      expect(defaults.body.settings.siteName).toBe('MCP Registry');
      expect(defaults.body.settings.maxLoginAttempts).toBe(5);

      const updated = await request(app)
        .put('/api/v1/settings')
        .set(admin.headers)
        .send({ siteName: 'Acme Registry', maxLoginAttempts: 3, maintenanceMode: true, bogusKey: 'ignored' })
        .expect(200);
      expect(updated.body.settings.siteName).toBe('Acme Registry');
      expect(updated.body.settings.maxLoginAttempts).toBe(3);
      expect(updated.body.settings.maintenanceMode).toBe(true);
      expect(updated.body.settings).not.toHaveProperty('bogusKey'); // unknown key stripped

      // Persisted across requests.
      const reread = await request(app).get('/api/v1/settings').set(admin.headers).expect(200);
      expect(reread.body.settings.siteName).toBe('Acme Registry');

      // Type validation.
      await request(app).put('/api/v1/settings').set(admin.headers).send({ maxLoginAttempts: 999 }).expect(400);
      await request(app).put('/api/v1/settings').set(admin.headers).send({ adminNotificationEmail: 'nope' }).expect(400);
      // Empty update rejected.
      await request(app).put('/api/v1/settings').set(admin.headers).send({}).expect(400);
    });
  });

  describe('Maintenance mode enforcement', () => {
    it('blocks non-admins (503) when enabled, lets admins and health through, and lifts on disable', async () => {
      // Off by default: public listing works.
      await request(app).get('/v0.1/servers').expect(200);

      // Enable maintenance.
      await request(app).put('/api/v1/settings').set(admin.headers).send({ maintenanceMode: true }).expect(200);

      // Public/non-admin requests are now blocked.
      await request(app).get('/v0.1/servers').expect(503)
        .expect((res) => expect(res.body).toMatchObject({ code: 'MAINTENANCE_MODE' }));
      const reader = await testUtils.createJwtAuth(['reader']);
      await request(app).get('/v0.1/servers').set(reader.headers).expect(503);

      // Admins and health remain available.
      await request(app).get('/v0.1/servers').set(admin.headers).expect(200);
      await request(app).get('/v0.1/health').expect(200);

      // Disable maintenance -> public access restored.
      await request(app).put('/api/v1/settings').set(admin.headers).send({ maintenanceMode: false }).expect(200);
      await request(app).get('/v0.1/servers').expect(200);
    });
  });
});
