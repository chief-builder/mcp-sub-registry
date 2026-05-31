/**
 * Jest Global Teardown
 * Cleans up test environment after all tests complete.
 */

import { PrismaClient } from '@prisma/client';

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');

  // Target the dedicated test database explicitly (never an ambient dev DB).
  const testUrl = 'postgresql://postgres:postgres123@localhost:5435/mcp_registry_test';
  const prisma = new PrismaClient({ datasources: { db: { url: testUrl } } });

  try {
    // FK-safe order: clear references before the rows they point at.
    await prisma.auditLog.deleteMany();
    await prisma.server.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.namespace.deleteMany();
    await prisma.setting.deleteMany();
    await prisma.user.deleteMany();

    await prisma.$disconnect();
    console.log('✅ Test cleanup completed');
  } catch (error) {
    console.error('❌ Test cleanup failed:', error);
    await prisma.$disconnect();
  }
}
