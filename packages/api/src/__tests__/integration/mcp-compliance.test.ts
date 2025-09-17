/**
 * Integration Tests for MCP Protocol Compliance
 * Tests full MCP Registry API v2025-07-09 compliance with real database
 */

import request from 'supertest';
import app from '../../app';
import { testUtils } from '../setup';

describe('MCP Protocol Compliance Integration Tests', () => {
  let testAuth: any;

  beforeEach(async () => {
    await testUtils.cleanup();
    testAuth = await testUtils.createTestAuth(['publish', 'read', 'write']);
  });

  afterEach(async () => {
    await testUtils.cleanup();
  });

  describe('MCP Registry API v2025-07-09 Compliance', () => {
    it('should follow exact API specification for server listing', async () => {
      // Create test servers
      const server1 = await testUtils.createTestServer('', {
        name: 'com.company.analytics',
        status: 'stable'
      });
      
      const server2 = await testUtils.createTestServer('', {
        name: 'com.company.monitoring',
        status: 'experimental'
      });

      const response = await request(app)
        .get('/v0/servers')
        .expect(200);

      // Verify response structure matches MCP spec
      expect(response.body).toHaveProperty('servers');
      expect(response.body).toHaveProperty('pagination');
      
      expect(response.body.servers).toHaveLength(2);
      
      // Verify each server has required MCP fields
      response.body.servers.forEach((server: any) => {
        expect(server).toHaveProperty('id');
        expect(server).toHaveProperty('name');
        expect(server).toHaveProperty('description');
        expect(server).toHaveProperty('version');
        expect(server).toHaveProperty('status');
        expect(server.status).toMatch(/^(experimental|beta|stable|deprecated)$/);
        
        // Optional fields that should be present if set
        if (server.repository) {
          expect(server.repository).toHaveProperty('type');
          expect(server.repository).toHaveProperty('url');
        }
        
        if (server.packages && server.packages.length > 0) {
          server.packages.forEach((pkg: any) => {
            expect(pkg).toHaveProperty('registry');
            expect(pkg).toHaveProperty('identifier');
          });
        }
        
        if (server.remote) {
          expect(server.remote).toHaveProperty('transport');
        }
      });

      // Verify pagination structure
      expect(response.body.pagination).toMatchObject({
        total: 2,
        limit: 50,
        offset: 0,
        has_more: false
      });
    });

    it('should handle cursor-based pagination correctly', async () => {
      // Create multiple test servers
      const servers: any[] = [];
      for (let i = 1; i <= 75; i++) {
        const server = await testUtils.createTestServer('', {
          name: `com.company.server${i.toString().padStart(2, '0')}`,
          description: `Test server ${i}`
        });
        servers.push(server);
      }

      // First page
      const page1 = await request(app)
        .get('/v0/servers?limit=50')
        .expect(200);

      expect(page1.body.servers).toHaveLength(50);
      expect(page1.body.pagination.has_more).toBe(true);
      expect(page1.body.pagination.total).toBe(75);

      // Second page
      const page2 = await request(app)
        .get('/v0/servers?limit=50&offset=50')
        .expect(200);

      expect(page2.body.servers).toHaveLength(25);
      expect(page2.body.pagination.has_more).toBe(false);
      expect(page2.body.pagination.total).toBe(75);
    });

    it('should validate MCP server schema on publish', async () => {
      const validServer = {
        name: 'com.company.valid-server',
        description: 'A fully compliant MCP server',
        version: '2.1.0',
        status: 'stable',
        repository: {
          type: 'git',
          url: 'https://github.com/company/valid-server'
        },
        packages: [{
          registry: 'npm',
          identifier: '@company/valid-server',
          version: '2.1.0'
        }],
        remote: {
          transport: 'stdio',
          url: 'npx @company/valid-server'
        },
        metadata: {
          'com.company.enterprise': {
            owner: 'platform-team',
            tier: 1,
            security_classification: 'internal',
            support_contact: 'platform@company.com'
          }
        }
      };

      const response = await request(app)
        .post('/v0/publish')
        .set(testAuth.headers)
        .send(validServer)
        .expect(201);

      // Verify response matches input
      expect(response.body.name).toBe(validServer.name);
      expect(response.body.description).toBe(validServer.description);
      expect(response.body.version).toBe(validServer.version);
      expect(response.body.status).toBe(validServer.status);
      expect(response.body.repository).toEqual(validServer.repository);
      expect(response.body.packages).toEqual(validServer.packages);
      expect(response.body.remote).toEqual(validServer.remote);
      expect(response.body.metadata).toEqual(validServer.metadata);
    });

    it('should reject invalid MCP server schemas', async () => {
      const invalidServers = [
        // Missing required name
        {
          description: 'Missing name',
          version: '1.0.0'
        },
        // Invalid status
        {
          name: 'com.company.invalid-status',
          description: 'Invalid status value',
          version: '1.0.0',
          status: 'invalid-status'
        },
        // Invalid repository structure
        {
          name: 'com.company.invalid-repo',
          description: 'Invalid repository',
          version: '1.0.0',
          repository: {
            url: 'https://github.com/test/repo'
            // Missing type
          }
        },
        // Invalid package structure
        {
          name: 'com.company.invalid-package',
          description: 'Invalid package',
          version: '1.0.0',
          packages: [{
            identifier: '@company/package'
            // Missing registry
          }]
        }
      ];

      for (const invalidServer of invalidServers) {
        await request(app)
          .post('/v0/publish')
          .set(testAuth.headers)
          .send(invalidServer)
          .expect(400);
      }
    });

    it('should handle server retrieval by ID correctly', async () => {
      const testServer = await testUtils.createTestServer('', {
        name: 'com.company.retrieve-test',
        metadata: {
          'com.company.enterprise': {
            owner: 'test-team',
            created_by: 'integration-test'
          }
        }
      });

      const response = await request(app)
        .get(`/v0/servers/${testServer.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testServer.id,
        name: 'com.company.retrieve-test',
        description: testServer.description,
        version: testServer.version,
        status: testServer.status,
        metadata: testServer.metadata
      });
    });

    it('should support status-based filtering', async () => {
      await testUtils.createTestServer('', {
        name: 'com.company.stable-server',
        status: 'stable'
      });
      
      await testUtils.createTestServer('', {
        name: 'com.company.experimental-server',
        status: 'experimental'
      });
      
      await testUtils.createTestServer('', {
        name: 'com.company.beta-server',
        status: 'beta'
      });

      // Filter by stable
      const stableResponse = await request(app)
        .get('/v0/servers?status=stable')
        .expect(200);

      expect(stableResponse.body.servers).toHaveLength(1);
      expect(stableResponse.body.servers[0].status).toBe('stable');

      // Filter by experimental
      const experimentalResponse = await request(app)
        .get('/v0/servers?status=experimental')
        .expect(200);

      expect(experimentalResponse.body.servers).toHaveLength(1);
      expect(experimentalResponse.body.servers[0].status).toBe('experimental');
    });

    it('should provide proper health endpoint', async () => {
      const response = await request(app)
        .get('/v0/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        version: expect.any(String)
      });

      // Verify timestamp is valid ISO string
      expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
    });

    it('should provide prometheus metrics endpoint', async () => {
      // Create some test servers
      await testUtils.createTestServer('');
      await testUtils.createTestServer('');
      await testUtils.createTestServer('');

      const response = await request(app)
        .get('/metrics')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text).toContain('mcp_registry_servers_total 3');
      expect(response.text).toContain('# HELP mcp_registry_servers_total');
      expect(response.text).toContain('# TYPE mcp_registry_servers_total counter');
    });
  });

  describe('Enterprise Metadata Compliance', () => {
    it('should preserve enterprise metadata fields', async () => {
      const serverWithMetadata = {
        name: 'com.company.enterprise-server',
        description: 'Server with enterprise metadata',
        version: '1.0.0',
        metadata: {
          'com.company.enterprise': {
            owner: 'platform-team',
            tier: 1,
            security_classification: 'confidential',
            support_contact: 'platform@company.com',
            cost_center: 'ENG-001',
            compliance_tags: ['SOX', 'PCI', 'GDPR'],
            deployment_env: ['staging', 'production']
          },
          'com.company.monitoring': {
            alerts_enabled: true,
            metrics_retention_days: 90,
            log_level: 'info'
          }
        }
      };

      const response = await request(app)
        .post('/v0/publish')
        .set(testAuth.headers)
        .send(serverWithMetadata)
        .expect(201);

      // Verify metadata is preserved exactly
      expect(response.body.metadata).toEqual(serverWithMetadata.metadata);

      // Verify retrieval preserves metadata
      const retrieveResponse = await request(app)
        .get(`/v0/servers/${response.body.id}`)
        .expect(200);

      expect(retrieveResponse.body.metadata).toEqual(serverWithMetadata.metadata);
    });

    it('should handle complex nested metadata structures', async () => {
      const complexMetadata = {
        'com.company.enterprise': {
          team_structure: {
            owner: 'platform-team',
            maintainers: ['alice@company.com', 'bob@company.com'],
            on_call: {
              primary: 'platform-oncall@company.com',
              escalation: ['platform-lead@company.com']
            }
          },
          deployment_config: {
            environments: {
              staging: {
                replicas: 2,
                resources: { cpu: '500m', memory: '1Gi' }
              },
              production: {
                replicas: 5,
                resources: { cpu: '1000m', memory: '2Gi' }
              }
            }
          }
        }
      };

      const response = await request(app)
        .post('/v0/publish')
        .set(testAuth.headers)
        .send({
          name: 'com.company.complex-metadata',
          description: 'Server with complex metadata',
          version: '1.0.0',
          metadata: complexMetadata
        })
        .expect(201);

      expect(response.body.metadata).toEqual(complexMetadata);
    });
  });
});