import { Router, Response } from 'express';
import Joi from 'joi';
import { prisma } from '../db';
import { logger } from '../utils/logger';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { AuthenticatedRequest, APIErrorResponse } from '../types';

const router = Router();

const namespaceCreateSchema = Joi.object({
  // The reverse-DNS namespace portion of a server name (no slash).
  name: Joi.string().pattern(/^[a-zA-Z0-9.-]+$/).max(190).required(),
  owner_id: Joi.string().optional(),
  authorized_users: Joi.array().items(Joi.string()).default([]),
});

// POST /api/v1/namespaces - claim a namespace (admin only).
router.post(
  '/',
  authenticate({ required: true, scopes: ['admin'], allowApiKey: false }),
  validateBody(namespaceCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, owner_id, authorized_users } = req.body as {
        name: string;
        owner_id?: string;
        authorized_users: string[];
      };

      const existing = await prisma.namespace.findUnique({ where: { name } });
      if (existing) {
        return res.status(409).json({ error: 'Namespace already exists', code: 'CONFLICT' });
      }

      const namespace = await prisma.namespace.create({
        data: {
          name,
          owner_id: owner_id || req.user!.id,
          authorized_users,
          verification_method: 'none',
          is_verified: true,
        },
      });

      res.status(201).json(namespace);
    } catch (error) {
      logger.error('Error creating namespace:', error);
      res.status(500).json({ error: 'Failed to create namespace', code: 'INTERNAL_ERROR' });
    }
  }
);

// GET /api/v1/namespaces - list namespaces (admin only).
router.get(
  '/',
  authenticate({ required: true, scopes: ['admin'], allowApiKey: false }),
  async (_req: AuthenticatedRequest, res: Response<any | APIErrorResponse>) => {
    try {
      const namespaces = await prisma.namespace.findMany({ orderBy: { created_at: 'desc' } });
      res.json({ namespaces });
    } catch (error) {
      logger.error('Error listing namespaces:', error);
      res.status(500).json({ error: 'Failed to list namespaces', code: 'INTERNAL_ERROR' });
    }
  }
);

export default router;
