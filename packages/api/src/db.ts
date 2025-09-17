import { PrismaClient } from '@prisma/client';
import { logger } from './utils/logger';

// Simple singleton pattern for Prisma client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

// Simple connection test
export async function connectDB() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
export async function disconnectDB() {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}