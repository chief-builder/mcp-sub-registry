/**
 * Jest Global Setup
 * Prepares test environment before running tests
 */

import { PrismaClient } from '@prisma/client';

export default async function globalSetup() {
  console.log('🧪 Setting up test environment...');

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5435/mcp_registry_test';
  process.env.JWT_SECRET = 'test-jwt-secret';

  // Initialize test database
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Test database connected');

    // Create test schema if needed
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS public`;
    
    // Push schema to test database
    console.log('📋 Setting up test database schema...');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }

  console.log('✅ Test environment ready');
}