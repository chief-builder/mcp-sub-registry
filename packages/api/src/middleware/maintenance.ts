import { Response, NextFunction } from 'express';
import { prisma } from '../db';
import { logger } from '../utils/logger';
import { requestIsAdmin } from './auth';
import { DEFAULT_SETTINGS } from './validation';
import { AuthenticatedRequest } from '../types';

// Small cache so we don't hit the DB for the maintenance flag on every request.
const CACHE_TTL_MS = 15 * 1000;
let cached: { value: boolean; at: number } | null = null;

/** Test/admin hook to force a refresh on the next request (e.g. after a settings write). */
export function resetMaintenanceCache(): void {
  cached = null;
}

async function maintenanceEnabled(): Promise<boolean> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_TTL_MS) return cached.value;
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'maintenanceMode' } });
    const value = row ? Boolean(row.value) : Boolean(DEFAULT_SETTINGS.maintenanceMode);
    cached = { value, at: now };
    return value;
  } catch (error) {
    logger.warn('Failed to read maintenanceMode setting:', error);
    return cached?.value ?? false;
  }
}

// Paths that must remain reachable during maintenance (health, auth so admins
// can log in, and the admin-gated metrics endpoint).
function isExempt(path: string): boolean {
  return (
    path === '/health' ||
    path.startsWith('/v0.1/health') ||
    path.startsWith('/metrics') ||
    path.startsWith('/api/v1/auth')
  );
}

/**
 * When maintenanceMode is enabled, only admins may use the API; everyone else
 * receives 503. Off by default, so normal operation is unaffected.
 */
export function maintenanceGuard() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS' || isExempt(req.path)) return next();
    if (!(await maintenanceEnabled())) return next();
    if (await requestIsAdmin(req)) return next();
    return res.status(503).json({
      error: 'The registry is in maintenance mode. Please try again later.',
      code: 'MAINTENANCE_MODE',
    });
  };
}
