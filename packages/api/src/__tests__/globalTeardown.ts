/**
 * Jest Global Teardown
 * Cleans up test environment after all tests complete
 */

import { PrismaClient } from '@prisma/client';

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');

  const prisma = new PrismaClient();
  
  try {
    // Clean up all test data
    await prisma.server.deleteMany();
    await prisma.user.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.namespace.deleteMany();
    
    await prisma.$disconnect();
    console.log('✅ Test cleanup completed');
  } catch (error) {
    console.error('❌ Test cleanup failed:', error);
    await prisma.$disconnect();
  }
}