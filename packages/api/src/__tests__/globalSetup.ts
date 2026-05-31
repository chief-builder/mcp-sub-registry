/**
 * Jest Global Setup
 * Recreates a clean test database and applies the migration SQL before tests run.
 *
 * We execute the migration SQL directly (rather than `prisma migrate deploy`)
 * because the Prisma CLI resolves packages/api/.env from the schema path and
 * ignores the DATABASE_URL we pass — which would target the dev database.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function splitSqlStatements(sql: string): string[] {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--')) // drop comment-only lines
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default async function globalSetup() {
  console.log('🧪 Setting up test environment...');

  process.env.NODE_ENV = 'test';
  // Hardcode the test DB URL to match setup.ts and to avoid ever touching a
  // dev database via an ambient DATABASE_URL (e.g. from packages/api/.env).
  const testUrl = 'postgresql://postgres:postgres123@localhost:5435/mcp_registry_test';
  process.env.DATABASE_URL = testUrl;
  process.env.JWT_SECRET =
    process.env.JWT_SECRET ||
    'test-jwt-secret-key-that-is-long-enough-for-security-validation-requirements';
  process.env.ADMIN_SETUP_KEY =
    process.env.ADMIN_SETUP_KEY || 'test-admin-setup-key-for-testing-purposes-only';

  const dbName = new URL(testUrl).pathname.slice(1);
  const adminUrl = new URL(testUrl);
  adminUrl.pathname = '/postgres';

  // Drop and recreate the test database for a clean slate each run.
  const admin = new PrismaClient({ datasources: { db: { url: adminUrl.toString() } } });
  try {
    await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${dbName}" WITH (FORCE)`);
    await admin.$executeRawUnsafe(`CREATE DATABASE "${dbName}"`);
    console.log(`📋 Recreated test database "${dbName}"`);
  } finally {
    await admin.$disconnect();
  }

  // Apply each migration's SQL in lexical order against the test database.
  const migrationsDir = path.resolve(__dirname, '../../prisma/migrations');
  const migrations = fs
    .readdirSync(migrationsDir)
    .filter((d) => fs.existsSync(path.join(migrationsDir, d, 'migration.sql')))
    .sort();

  const db = new PrismaClient({ datasources: { db: { url: testUrl } } });
  try {
    for (const migration of migrations) {
      const sql = fs.readFileSync(path.join(migrationsDir, migration, 'migration.sql'), 'utf8');
      for (const statement of splitSqlStatements(sql)) {
        await db.$executeRawUnsafe(statement);
      }
    }
    console.log(`📋 Applied ${migrations.length} migration(s) to "${dbName}"`);
  } finally {
    await db.$disconnect();
  }

  console.log('✅ Test environment ready');
}
