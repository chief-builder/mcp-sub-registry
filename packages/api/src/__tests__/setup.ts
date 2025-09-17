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

// Test utilities
export const testUtils = {
  /**
   * Create a test user
   */
  createTestUser: async (overrides = {}) => {
    const userData = {
      email: `test-${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      roles: ['consumer'],
      is_active: true,
      ...overrides
    };

    return await prisma.user.create({
      data: userData
    });
  },

  /**
   * Create a test API key for authentication
   */
  createTestApiKey: async (userId: string, scopes: string[] = ['publish', 'read', 'write']) => {
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
   * Create test user with API key for authentication
   */
  createTestAuth: async (scopes: string[] = ['publish', 'read', 'write']) => {
    const user = await testUtils.createTestUser({
      roles: ['admin']
    });
    
    const { apiKey, key } = await testUtils.createTestApiKey(user.id, scopes);
    
    return {
      user,
      apiKey,
      key,
      headers: {
        'Authorization': `ApiKey ${key}`
      }
    };
  },

  /**
   * Create a test MCP server
   */
  createTestServer: async (_ownerId: string, overrides = {}) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const serverData = {
      name: `com.company.test-server-${timestamp}-${random}`,
      description: 'Test MCP server for unit testing',
      status: 'experimental',
      version: '1.0.0',
      repository: {
        type: 'git',
        url: 'https://github.com/test/server'
      },
      packages: [{
        registry: 'npm',
        identifier: '@company/test-server',
        version: '1.0.0'
      }],
      remote: {
        transport: 'stdio',
        url: 'npx @company/test-server'
      },
      metadata: {
        'com.company.enterprise': {
          owner: 'test-team',
          tier: 2,
          security_classification: 'internal'
        }
      },
      ...overrides
    };

    return await prisma.server.create({
      data: serverData
    });
  },

  /**
   * Clean up test data
   */
  cleanup: async () => {
    // Clean up ALL servers (in test environment this is safer)
    await prisma.server.deleteMany({});
    
    // Clean up API keys
    await prisma.apiKey.deleteMany({});
    
    // Clean up users
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test-'
        }
      }
    });
    
    // Clean up audit logs
    await prisma.auditLog.deleteMany({});
  },

  /**
   * Wait for async operations to complete
   */
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

// Add test utilities to global scope
declare global {
  var testUtils: {
    createTestUser: (overrides?: any) => Promise<any>;
    createTestApiKey: (userId: string, scopes?: string[]) => Promise<{ apiKey: any; key: string; }>;
    createTestAuth: (scopes?: string[]) => Promise<{ user: any; apiKey: any; key: string; headers: { Authorization: string; }; }>;
    createTestServer: (ownerId: string, overrides?: any) => Promise<any>;
    cleanup: () => Promise<void>;
    delay: (ms: number) => Promise<unknown>;
  };
}

global.testUtils = testUtils;