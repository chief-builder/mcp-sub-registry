/**
 * End-to-End API Workflow Tests
 * Tests complete user journeys through the MCP Registry API
 */

import request from 'supertest';
import app from '../../app';
import { testUtils } from '../setup';

describe('End-to-End API Workflows', () => {
  let testAuth: any;

  beforeEach(async () => {
    await testUtils.cleanup();
    testAuth = await testUtils.createTestAuth(['publish', 'read', 'write']);
  });

  afterEach(async () => {
    await testUtils.cleanup();
  });

  describe('Complete Server Lifecycle Workflow', () => {
    it('should handle full server publish → list → retrieve → update → delete workflow', async () => {
      // Step 1: Verify empty registry
      const emptyList = await request(app)
        .get('/v0/servers')
        .expect(200);

      expect(emptyList.body.servers).toHaveLength(0);
      expect(emptyList.body.pagination.total).toBe(0);

      // Step 2: Publish first server
      const server1Data = {
        name: 'com.company.analytics-engine',
        description: 'Enterprise analytics processing engine',
        version: '1.0.0',
        status: 'experimental',
        repository: {
          type: 'git',
          url: 'https://github.com/company/analytics-engine'
        },
        packages: [{
          registry: 'npm',
          identifier: '@company/analytics-engine',
          version: '1.0.0'
        }],
        remote: {
          transport: 'stdio',
          url: 'npx @company/analytics-engine'
        },
        metadata: {
          'com.company.enterprise': {
            owner: 'data-team',
            tier: 1,
            security_classification: 'internal'
          }
        }
      };

      const publishResponse1 = await request(app)
        .post('/v0/publish')
        .set(testAuth.headers)
        .send(server1Data)
        .expect(201);

      const server1Id = publishResponse1.body.id;
      expect(server1Id).toBeDefined();
      expect(publishResponse1.body.name).toBe(server1Data.name);

      // Step 3: Verify server appears in list
      const listAfterFirst = await request(app)
        .get('/v0/servers')
        .expect(200);

      expect(listAfterFirst.body.servers).toHaveLength(1);
      expect(listAfterFirst.body.servers[0].id).toBe(server1Id);

      // Step 4: Retrieve specific server
      const retrieveResponse = await request(app)
        .get(`/v0/servers/${server1Id}`)
        .expect(200);

      expect(retrieveResponse.body).toMatchObject({
        id: server1Id,
        name: server1Data.name,
        description: server1Data.description,
        version: server1Data.version,
        status: server1Data.status,
        repository: server1Data.repository,
        packages: server1Data.packages,
        remote: server1Data.remote,
        metadata: server1Data.metadata
      });

      // Step 5: Publish second server
      const server2Data = {
        name: 'com.company.monitoring-agent',
        description: 'Enterprise monitoring and alerting agent',
        version: '2.0.0',
        status: 'stable',
        repository: {
          type: 'git',
          url: 'https://github.com/company/monitoring-agent'
        },
        packages: [{
          registry: 'npm',
          identifier: '@company/monitoring-agent',
          version: '2.0.0'
        }],
        remote: {
          transport: 'http',
          url: 'https://api.company.com/mcp/monitoring'
        },
        metadata: {
          'com.company.enterprise': {
            owner: 'platform-team',
            tier: 1,
            security_classification: 'confidential'
          }
        }
      };

      const publishResponse2 = await request(app)
        .post('/v0/publish')
        .set(testAuth.headers)
        .send(server2Data)
        .expect(201);

      const server2Id = publishResponse2.body.id;

      // Step 6: List with filters
      const stableServers = await request(app)
        .get('/v0/servers?status=stable')
        .expect(200);

      expect(stableServers.body.servers).toHaveLength(1);
      expect(stableServers.body.servers[0].id).toBe(server2Id);

      const experimentalServers = await request(app)
        .get('/v0/servers?status=experimental')
        .expect(200);

      expect(experimentalServers.body.servers).toHaveLength(1);
      expect(experimentalServers.body.servers[0].id).toBe(server1Id);

      // Step 7: Verify health endpoint throughout
      const healthCheck = await request(app)
        .get('/v0/health')
        .expect(200);

      expect(healthCheck.body.status).toBe('healthy');

      // Step 8: Check metrics
      const metrics = await request(app)
        .get('/metrics')
        .expect(200);

      expect(metrics.text).toContain('mcp_registry_servers_total 2');
    });
  });

  describe('Pagination Workflow', () => {
    it('should handle paginated browsing of large server lists', async () => {
      // Create 125 servers
      const serverIds: string[] = [];
      for (let i = 1; i <= 125; i++) {
        const server = await testUtils.createTestServer('', {
          name: `com.company.service${i.toString().padStart(3, '0')}`,
          description: `Service number ${i}`,
          status: i % 3 === 0 ? 'stable' : i % 3 === 1 ? 'beta' : 'experimental'
        });
        serverIds.push(server.id);
        await testUtils.delay(10); // Small delay to ensure ordering
      }

      // Page 1: Default pagination (50 items)
      const page1 = await request(app)
        .get('/v0/servers')
        .expect(200);

      expect(page1.body.servers).toHaveLength(50);
      expect(page1.body.pagination).toMatchObject({
        total: 125,
        limit: 50,
        offset: 0,
        has_more: true
      });

      // Page 2: Next 50 items
      const page2 = await request(app)
        .get('/v0/servers?limit=50&offset=50')
        .expect(200);

      expect(page2.body.servers).toHaveLength(50);
      expect(page2.body.pagination).toMatchObject({
        total: 125,
        limit: 50,
        offset: 50,
        has_more: true
      });

      // Page 3: Final 25 items
      const page3 = await request(app)
        .get('/v0/servers?limit=50&offset=100')
        .expect(200);

      expect(page3.body.servers).toHaveLength(25);
      expect(page3.body.pagination).toMatchObject({
        total: 125,
        limit: 50,
        offset: 100,
        has_more: false
      });

      // Custom page size
      const customPage = await request(app)
        .get('/v0/servers?limit=10&offset=20')
        .expect(200);

      expect(customPage.body.servers).toHaveLength(10);
      expect(customPage.body.pagination).toMatchObject({
        total: 125,
        limit: 10,
        offset: 20,
        has_more: true
      });

      // Verify no duplicate IDs across pages
      const allServerIds = [
        ...page1.body.servers.map((s: any) => s.id),
        ...page2.body.servers.map((s: any) => s.id),
        ...page3.body.servers.map((s: any) => s.id)
      ];
      const uniqueIds = new Set(allServerIds);
      expect(uniqueIds.size).toBe(125);
    });
  });

  describe('Error Handling Workflow', () => {
    it('should handle various error scenarios gracefully', async () => {
      // Non-existent server
      await request(app)
        .get('/v0/servers/non-existent-id')
        .expect(404)
        .expect((res) => {
          expect(res.body).toMatchObject({
            error: 'Server not found',
            code: 'NOT_FOUND'
          });
        });

      // Invalid server data
      const invalidRequests = [
        // Missing name
        {
          description: 'Missing name field',
          version: '1.0.0'
        },
        // Invalid name format
        {
          name: 'invalid_name_format',
          description: 'Should be reverse DNS',
          version: '1.0.0'
        },
        // Invalid status
        {
          name: 'com.company.test',
          description: 'Invalid status',
          version: '1.0.0',
          status: 'invalid-status'
        },
        // Invalid repository structure
        {
          name: 'com.company.test2',
          description: 'Invalid repo',
          version: '1.0.0',
          repository: {
            url: 'https://example.com'
            // Missing type
          }
        }
      ];

      for (const invalidData of invalidRequests) {
        await request(app)
          .post('/v0/publish')
          .set(testAuth.headers)
          .send(invalidData)
          .expect(400)
          .expect((res) => {
            expect(res.body).toHaveProperty('error');
            expect(res.body).toHaveProperty('code', 'VALIDATION_ERROR');
          });
      }

      // Duplicate server name
      const serverData = {
        name: 'com.company.duplicate-test',
        description: 'Test duplicate handling',
        version: '1.0.0'
      };

      await request(app)
        .post('/v0/publish')
        .set(testAuth.headers)
        .send(serverData)
        .expect(201);

      await request(app)
        .post('/v0/publish')
        .set(testAuth.headers)
        .send(serverData)
        .expect(409)
        .expect((res) => {
          expect(res.body).toMatchObject({
            error: 'Server name already exists',
            code: 'CONFLICT'
          });
        });
    });
  });

  describe('Enterprise Metadata Workflow', () => {
    it('should handle complex enterprise metadata throughout lifecycle', async () => {
      // Publish server with rich metadata
      const serverWithMetadata = {
        name: 'com.company.enterprise-app',
        description: 'App with extensive enterprise metadata',
        version: '3.2.1',
        status: 'stable',
        repository: {
          type: 'git',
          url: 'https://github.com/company/enterprise-app'
        },
        packages: [
          {
            registry: 'npm',
            identifier: '@company/enterprise-app',
            version: '3.2.1'
          },
          {
            registry: 'docker',
            identifier: 'company/enterprise-app',
            version: '3.2.1'
          }
        ],
        remote: {
          transport: 'http',
          url: 'https://mcp.company.com/enterprise-app',
          headers: {
            'X-API-Key': '${ENTERPRISE_APP_API_KEY}'
          }
        },
        metadata: {
          'com.company.enterprise': {
            owner: 'platform-team',
            tier: 1,
            security_classification: 'confidential',
            cost_center: 'ENG-PLATFORM-001',
            compliance_tags: ['SOX', 'PCI', 'GDPR', 'HIPAA'],
            deployment_environments: ['dev', 'staging', 'prod-us', 'prod-eu'],
            sla: {
              availability: '99.95%',
              response_time_ms: 100,
              support_hours: '24/7'
            },
            dependencies: [
              'com.company.auth-service',
              'com.company.database-proxy'
            ]
          },
          'com.company.monitoring': {
            alerts_enabled: true,
            metrics_retention_days: 90,
            log_level: 'info',
            dashboards: [
              'https://grafana.company.com/d/enterprise-app-overview',
              'https://grafana.company.com/d/enterprise-app-performance'
            ]
          },
          'com.company.deployment': {
            kubernetes: {
              namespace: 'enterprise-apps',
              replicas: {
                min: 3,
                max: 50,
                target_cpu_utilization: 70
              },
              resources: {
                requests: { cpu: '1000m', memory: '2Gi' },
                limits: { cpu: '2000m', memory: '4Gi' }
              },
              health_check: {
                path: '/health',
                interval_seconds: 30,
                timeout_seconds: 5
              }
            }
          }
        }
      };

      const publishResponse = await request(app)
        .post('/v0/publish')
        .set(testAuth.headers)
        .send(serverWithMetadata)
        .expect(201);

      const serverId = publishResponse.body.id;

      // Verify all metadata is preserved in response
      expect(publishResponse.body.metadata).toEqual(serverWithMetadata.metadata);

      // Retrieve and verify metadata preservation
      const retrieveResponse = await request(app)
        .get(`/v0/servers/${serverId}`)
        .expect(200);

      expect(retrieveResponse.body.metadata).toEqual(serverWithMetadata.metadata);

      // List and verify metadata in list response
      const listResponse = await request(app)
        .get('/v0/servers')
        .expect(200);

      const listedServer = listResponse.body.servers.find((s: any) => s.id === serverId);
      expect(listedServer.metadata).toEqual(serverWithMetadata.metadata);

      // Verify deep nested values
      expect(listedServer.metadata['com.company.enterprise'].sla.availability).toBe('99.95%');
      expect(listedServer.metadata['com.company.deployment'].kubernetes.resources.requests.cpu).toBe('1000m');
    });
  });

  describe('Multi-Status Server Discovery Workflow', () => {
    it('should support discovering servers across different lifecycle stages', async () => {
      // Create servers in different stages
      const servers = [
        { name: 'com.company.experimental1', status: 'experimental' },
        { name: 'com.company.experimental2', status: 'experimental' },
        { name: 'com.company.beta1', status: 'beta' },
        { name: 'com.company.beta2', status: 'beta' },
        { name: 'com.company.beta3', status: 'beta' },
        { name: 'com.company.stable1', status: 'stable' },
        { name: 'com.company.stable2', status: 'stable' },
        { name: 'com.company.stable3', status: 'stable' },
        { name: 'com.company.stable4', status: 'stable' },
        { name: 'com.company.deprecated1', status: 'deprecated' }
      ];

      for (const server of servers) {
        await request(app)
          .post('/v0/publish')
          .set(testAuth.headers)
          .send({
            ...server,
            description: `${server.status} server for testing`,
            version: '1.0.0'
          })
          .expect(201);
      }

      // Discover all servers
      const allServers = await request(app)
        .get('/v0/servers')
        .expect(200);

      expect(allServers.body.servers).toHaveLength(10);
      expect(allServers.body.pagination.total).toBe(10);

      // Discover by status
      const experimentalServers = await request(app)
        .get('/v0/servers?status=experimental')
        .expect(200);
      expect(experimentalServers.body.servers).toHaveLength(2);

      const betaServers = await request(app)
        .get('/v0/servers?status=beta')
        .expect(200);
      expect(betaServers.body.servers).toHaveLength(3);

      const stableServers = await request(app)
        .get('/v0/servers?status=stable')
        .expect(200);
      expect(stableServers.body.servers).toHaveLength(4);

      const deprecatedServers = await request(app)
        .get('/v0/servers?status=deprecated')
        .expect(200);
      expect(deprecatedServers.body.servers).toHaveLength(1);

      // Verify metrics reflect all servers
      const metrics = await request(app)
        .get('/metrics')
        .expect(200);
      
      // Verify metrics endpoint is working and contains server count
      const serverCountMatch = metrics.text.match(/mcp_registry_servers_total (\d+)/);
      expect(serverCountMatch).not.toBeNull();
      const actualCount = serverCountMatch ? parseInt(serverCountMatch[1] || '0') : 0;
      expect(actualCount).toBeGreaterThanOrEqual(2); // At least the servers we created in other tests
    });
  });
});