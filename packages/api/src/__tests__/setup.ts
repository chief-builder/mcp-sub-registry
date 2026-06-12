/**
 * Jest Test Setup
 * Configures test environment, database connections, and global utilities
 */

// Set test environment variables before importing anything else
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-that-is-long-enough-for-security-validation-requirements';
process.env.ADMIN_SETUP_KEY = 'test-admin-setup-key-for-testing-purposes-only';
process.env.DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5435/mcp_registry_test';

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { resetMaintenanceCache } from '../middleware/maintenance';

// Global test database instance
declare global {
  var __PRISMA__: PrismaClient;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5435/mcp_registry_test'
    }
  }
});

global.__PRISMA__ = prisma;

let nsCounter = 0;

// Test utilities
export const testUtils = {
  /**
   * Create a test user
   */
  createTestUser: async (overrides = {}) => {
    const userData = {
      email: `test-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`,
      username: `testuser${Date.now()}${Math.floor(Math.random() * 1e6)}`,
      roles: ['consumer'],
      is_active: true,
      ...overrides
    };

    return await prisma.user.create({ data: userData });
  },

  /**
   * Create a test API key for authentication
   */
  createTestApiKey: async (userId: string, scopes: string[] = ['publish', 'read', 'write', 'admin']) => {
    const key = `mcp_test_${crypto.randomBytes(16).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');

    const apiKey = await prisma.apiKey.create({
      data: {
        key_hash: keyHash,
        name: 'Test API Key',
        description: 'API key for testing',
        user_id: userId,
        scopes,
        is_active: true
      }
    });

    return { apiKey, key };
  },

  /**
   * Claim a namespace for a user (auto-verified, as for internal namespaces).
   */
  createNamespace: async (name: string, ownerId: string, authorizedUsers: string[] = []) => {
    return await prisma.namespace.create({
      data: {
        name,
        owner_id: ownerId,
        authorized_users: authorizedUsers,
        verification_method: 'none',
        is_verified: true
      }
    });
  },

  /**
   * Create a test user with an API key for authentication.
   * By default the key has the `admin` scope, which (per the v0.1 ACL model)
   * grants admin privileges to the credential and bypasses namespace ownership
   * — convenient for functional tests. Pass narrower scopes to exercise the
   * real authorization paths.
   */
  createTestAuth: async (scopes: string[] = ['publish', 'read', 'write', 'admin']) => {
    const user = await testUtils.createTestUser({ roles: ['admin'] });
    const { apiKey, key } = await testUtils.createTestApiKey(user.id, scopes);

    return {
      user,
      apiKey,
      key,
      headers: { 'Authorization': `ApiKey ${key}` }
    };
  },

  /**
   * Create a user and a signed JWT for it (for JWT-only routes).
   */
  createJwtAuth: async (roles: string[] = ['admin']) => {
    const user = await testUtils.createTestUser({ roles, is_active: true });
    const token = jwt.sign(
      { userId: user.id, email: user.email, roles },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h', algorithm: 'HS256' }
    );
    return { user, token, headers: { Authorization: `Bearer ${token}` } };
  },

  /**
   * Create a test MCP server directly in the DB (v0.1 server.json shape).
   */
  createTestServer: async (_ownerId: string, overrides: Record<string, any> = {}) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const serverData = {
      name: `com.company/test-server-${timestamp}-${random}`,
      description: 'Test MCP server for unit testing',
      version: '1.0.0',
      is_latest: true,
      registry_status: 'active',
      schema_url: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
      repository: { url: 'https://github.com/test/server', source: 'github' },
      packages: [{
        registryType: 'npm',
        registryBaseUrl: 'https://registry.npmjs.org',
        identifier: '@company/test-server',
        version: '1.0.0',
        transport: { type: 'stdio' }
      }],
      remotes: [],
      metadata: {
        'com.company.enterprise': { owner: 'test-team', tier: 2 }
      },
      ...overrides
    };

    return await prisma.server.create({ data: serverData });
  },

  /**
   * Clean up all test data. The test database is dedicated and recreated each
   * run, so we remove everything (not just `test-` rows) and in FK-safe order
   * so API-created users/settings never linger between tests.
   */
  cleanup: async () => {
    await prisma.auditLog.deleteMany({}); // drop actor references first
    await prisma.server.deleteMany({});
    await prisma.apiKey.deleteMany({});
    await prisma.namespace.deleteMany({}); // releases owner_id references
    await prisma.setting.deleteMany({});
    await prisma.user.deleteMany({});
    resetMaintenanceCache(); // settings just cleared — drop any cached flag
  },

  /**
   * Wait for async operations to complete
   */
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /** Unique namespace string for a test. */
  uniqueNamespace: () => `com.test${Date.now()}x${nsCounter++}`
};

// Add test utilities to global scope
declare global {
  var testUtils: {
    createTestUser: (overrides?: any) => Promise<any>;
    createTestApiKey: (userId: string, scopes?: string[]) => Promise<{ apiKey: any; key: string; }>;
    createNamespace: (name: string, ownerId: string, authorizedUsers?: string[]) => Promise<any>;
    createTestAuth: (scopes?: string[]) => Promise<{ user: any; apiKey: any; key: string; headers: { Authorization: string; }; }>;
    createJwtAuth: (roles?: string[]) => Promise<{ user: any; token: string; headers: { Authorization: string; }; }>;
    createTestServer: (ownerId: string, overrides?: any) => Promise<any>;
    cleanup: () => Promise<void>;
    delay: (ms: number) => Promise<unknown>;
    uniqueNamespace: () => string;
  };
}

global.testUtils = testUtils;
