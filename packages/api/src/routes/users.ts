import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../db';
import { logger } from '../utils/logger';
import { config } from '../config';
import { authenticate } from '../middleware/auth';
import { validateBody, userCreateSchema, userUpdateSchema } from '../middleware/validation';
import { AuthenticatedRequest } from '../types';

const router = Router();

// All user-management routes are admin-only and JWT-only (no service keys).
const adminOnly = authenticate({ required: true, scopes: ['admin'], allowApiKey: false });

const userSelect = {
  id: true,
  email: true,
  username: true,
  roles: true,
  is_active: true,
  auth_provider: true,
  metadata: true,
  created_at: true,
  updated_at: true,
  last_login: true,
} as const;

async function publishedCounts(userIds: string[]): Promise<Record<string, number>> {
  if (userIds.length === 0) return {};
  // Distinct servers published per user, derived from the audit trail.
  const grouped = await prisma.auditLog.groupBy({
    by: ['user_id', 'resource_id'],
    where: { action: 'publish', resource_type: 'server', user_id: { in: userIds } },
  });
  const counts: Record<string, number> = {};
  for (const g of grouped) {
    if (g.user_id) counts[g.user_id] = (counts[g.user_id] || 0) + 1;
  }
  return counts;
}

async function writeAudit(req: AuthenticatedRequest, action: string, resourceId: string, oldValues: any, newValues: any) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        resource_type: 'user',
        resource_id: resourceId,
        user_id: req.user?.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        old_values: oldValues || undefined,
        new_values: newValues || undefined,
        metadata: { auth_method: req.user?.auth_method || 'unknown' },
      },
    });
  } catch (auditError) {
    logger.warn('Failed to create audit log for user action:', auditError);
  }
}

// GET /api/v1/users - list users with filters
router.get('/', adminOnly, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { limit = '50', offset = '0', search, role, is_active } = req.query as Record<string, string>;
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;

    const where: any = {};
    if (role) where.roles = { has: role };
    if (is_active === 'true' || is_active === 'false') where.is_active = is_active === 'true';
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, select: userSelect, orderBy: { created_at: 'desc' }, take: limitNum, skip: offsetNum }),
    ]);

    const counts = await publishedCounts(users.map((u) => u.id));
    const withCounts = users.map((u) => ({ ...u, servers_published: counts[u.id] || 0 }));

    res.json({
      users: withCounts,
      pagination: { total, limit: limitNum, offset: offsetNum, has_more: offsetNum + limitNum < total },
    });
  } catch (error) {
    logger.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/v1/users/:id - get a single user
router.get('/:id', adminOnly, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: userSelect });
    if (!user) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    const counts = await publishedCounts([user.id]);
    res.json({ ...user, servers_published: counts[user.id] || 0 });
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user', code: 'INTERNAL_ERROR' });
  }
});

// POST /api/v1/users - create a user
router.post('/', adminOnly, validateBody(userCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, username, password, roles, is_active, metadata } = req.body;

    const data: any = {
      email,
      username,
      roles,
      is_active,
      metadata: metadata || {},
    };
    if (password) {
      data.password_hash = await bcrypt.hash(password, config.security.bcryptRounds);
    }

    const user = await prisma.user.create({ data, select: userSelect });
    await writeAudit(req, 'create', user.id, null, { email, username, roles });
    res.status(201).json({ ...user, servers_published: 0 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Email or username already exists', code: 'CONFLICT' });
    }
    logger.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', code: 'INTERNAL_ERROR' });
  }
});

// PATCH /api/v1/users/:id - update a user
router.patch('/:id', adminOnly, validateBody(userUpdateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });

    const { email, username, password, roles, is_active, metadata } = req.body;

    // Guard: don't allow removing admin from / deactivating the last active admin.
    const demotingSelfOrLastAdmin =
      (roles && !roles.includes('admin') && existing.roles.includes('admin')) ||
      (is_active === false && existing.roles.includes('admin'));
    if (demotingSelfOrLastAdmin) {
      const otherActiveAdmins = await prisma.user.count({
        where: { roles: { has: 'admin' }, is_active: true, id: { not: id } },
      });
      if (otherActiveAdmins === 0) {
        return res.status(409).json({ error: 'Cannot demote or deactivate the last active admin', code: 'LAST_ADMIN' });
      }
    }

    const data: any = {};
    if (email !== undefined) data.email = email;
    if (username !== undefined) data.username = username;
    if (roles !== undefined) data.roles = roles;
    if (is_active !== undefined) data.is_active = is_active;
    if (metadata !== undefined) data.metadata = metadata;
    if (password) data.password_hash = await bcrypt.hash(password, config.security.bcryptRounds);

    const user = await prisma.user.update({ where: { id }, data, select: userSelect });
    await writeAudit(req, 'update', id, { roles: existing.roles, is_active: existing.is_active }, data);

    const counts = await publishedCounts([id]);
    res.json({ ...user, servers_published: counts[id] || 0 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Email or username already exists', code: 'CONFLICT' });
    }
    logger.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', code: 'INTERNAL_ERROR' });
  }
});

// DELETE /api/v1/users/:id - delete a user
router.delete('/:id', adminOnly, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    if (id === req.user?.id) {
      return res.status(409).json({ error: 'You cannot delete your own account', code: 'SELF_DELETE' });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });

    // Don't orphan namespaces (owner_id is required) — require reassignment first.
    const ownedNamespaces = await prisma.namespace.count({ where: { owner_id: id } });
    if (ownedNamespaces > 0) {
      return res.status(409).json({
        error: `User owns ${ownedNamespaces} namespace(s); reassign them before deleting`,
        code: 'NAMESPACE_OWNER',
      });
    }

    // Don't delete the last active admin.
    if (existing.roles.includes('admin') && existing.is_active) {
      const otherActiveAdmins = await prisma.user.count({
        where: { roles: { has: 'admin' }, is_active: true, id: { not: id } },
      });
      if (otherActiveAdmins === 0) {
        return res.status(409).json({ error: 'Cannot delete the last active admin', code: 'LAST_ADMIN' });
      }
    }

    await prisma.$transaction([
      // Preserve audit history but unlink the actor.
      prisma.auditLog.updateMany({ where: { user_id: id }, data: { user_id: null } }),
      prisma.apiKey.deleteMany({ where: { user_id: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    await writeAudit(req, 'delete', id, { email: existing.email, username: existing.username }, null);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', code: 'INTERNAL_ERROR' });
  }
});

export default router;
