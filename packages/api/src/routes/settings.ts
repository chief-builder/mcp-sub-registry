import { Router, Response } from 'express';
import { prisma } from '../db';
import { logger } from '../utils/logger';
import { authenticate } from '../middleware/auth';
import { validateBody, settingsUpdateSchema, DEFAULT_SETTINGS } from '../middleware/validation';
import { resetMaintenanceCache } from '../middleware/maintenance';
import { AuthenticatedRequest } from '../types';

const router = Router();

const adminOnly = authenticate({ required: true, scopes: ['admin'], allowApiKey: false });

// Merge stored overrides over the defaults so callers always get a full object.
async function loadSettings(): Promise<Record<string, any>> {
  const rows = await prisma.setting.findMany();
  const stored: Record<string, any> = {};
  for (const row of rows) stored[row.key] = row.value;
  return { ...DEFAULT_SETTINGS, ...stored };
}

// GET /api/v1/settings - current effective settings (admin only).
router.get('/', adminOnly, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    res.json({ settings: await loadSettings() });
  } catch (error) {
    logger.error('Error loading settings:', error);
    res.status(500).json({ error: 'Failed to load settings', code: 'INTERNAL_ERROR' });
  }
});

// PUT /api/v1/settings - upsert a partial set of settings (admin only).
router.put('/', adminOnly, validateBody(settingsUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body as Record<string, any>;
    const updatedBy = req.user?.id;

    await prisma.$transaction(
      Object.entries(updates).map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          create: { key, value, updated_by: updatedBy },
          update: { value, updated_by: updatedBy },
        })
      )
    );

    // Apply newly-saved enforcement settings immediately.
    resetMaintenanceCache();

    try {
      await prisma.auditLog.create({
        data: {
          action: 'update',
          resource_type: 'settings',
          resource_id: 'global',
          user_id: updatedBy,
          ip_address: req.ip,
          user_agent: req.get('User-Agent'),
          new_values: updates,
          metadata: { auth_method: req.user?.auth_method || 'unknown' },
        },
      });
    } catch (auditError) {
      logger.warn('Failed to create audit log for settings update:', auditError);
    }

    res.json({ settings: await loadSettings() });
  } catch (error) {
    logger.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings', code: 'INTERNAL_ERROR' });
  }
});

export default router;
