import { Router, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../db';
import { logger } from '../utils/logger';
import { authenticate } from '../middleware/auth';
import { 
  AuthenticatedRequest,
  ApiKeyCreateRequest,
  ApiKeyCreateResponseResult,
  ApiKeyResponseResult,
  ApiKeyListResponseResult,
  ApiKeysQuery,
  TypedRequestWithQuery
} from '../types';

const router = Router();

function generateApiKey(): { key: string; hash: string } {
  const key = `mcp_${crypto.randomBytes(32).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  return { key, hash };
}

router.post('/create', authenticate({ required: true, scopes: ['admin'] }), async (req: AuthenticatedRequest & { body: ApiKeyCreateRequest }, res: Response<ApiKeyCreateResponseResult>) => {
  try {
    const {
      name,
      description,
      scopes = ['read'],
      expires_in_days
    } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'API key name is required',
        code: 'VALIDATION_ERROR'
      });
    }

    const validScopes = ['read', 'write', 'publish', 'admin'];
    const invalidScopes = scopes.filter((scope: string) => !validScopes.includes(scope));
    if (invalidScopes.length > 0) {
      return res.status(400).json({
        error: `Invalid scopes: ${invalidScopes.join(', ')}. Valid scopes: ${validScopes.join(', ')}`,
        code: 'VALIDATION_ERROR'
      });
    }

    const { key, hash } = generateApiKey();
    
    let expires_at: Date | null = null;
    if (expires_in_days && expires_in_days > 0) {
      expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + expires_in_days);
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        key_hash: hash,
        name,
        description: description || null,
        user_id: req.user!.id,
        scopes,
        expires_at
      },
      select: {
        id: true,
        name: true,
        description: true,
        scopes: true,
        expires_at: true,
        created_at: true,
        is_active: true
      }
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          resource_type: 'api_key',
          resource_id: apiKey.id,
          user_id: req.user!.id,
          new_values: {
            name: apiKey.name,
            scopes: apiKey.scopes
          },
          metadata: {
            request_ip: req.ip,
            user_agent: req.get('User-Agent')
          }
        }
      });
    } catch (auditError) {
      logger.warn('Failed to create audit log for API key creation:', auditError);
    }

    res.status(201).json({
      ...apiKey,
      key,
      last_used: null
    });

  } catch (error) {
    logger.error('Error creating API key:', error);
    res.status(500).json({
      error: 'Failed to create API key',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.get('/', authenticate({ required: true, scopes: ['admin'] }), async (req: TypedRequestWithQuery<any, ApiKeysQuery> & AuthenticatedRequest, res: Response<ApiKeyListResponseResult>) => {
  try {
    const {
      limit = '50',
      offset = '0',
      user_id
    } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 50, 100);
    const offsetNum = parseInt(offset as string) || 0;

    const where: any = {};
    
    if (user_id && req.user!.roles.includes('admin')) {
      where.user_id = user_id as string;
    } else {
      where.user_id = req.user!.id;
    }

    const total = await prisma.apiKey.count({ where });

    const apiKeys = await prisma.apiKey.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        scopes: true,
        is_active: true,
        expires_at: true,
        last_used: true,
        created_at: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: limitNum,
      skip: offsetNum
    });

    res.json({
      api_keys: apiKeys,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        has_more: offsetNum + limitNum < total
      }
    });

  } catch (error) {
    logger.error('Error listing API keys:', error);
    res.status(500).json({
      error: 'Failed to list API keys',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.get('/:id', authenticate({ required: true }), async (req: AuthenticatedRequest, res: Response<ApiKeyResponseResult>) => {
  try {
    const { id } = req.params;

    const where: any = { id };
    if (!req.user!.roles.includes('admin')) {
      where.user_id = req.user!.id;
    }

    const apiKey = await prisma.apiKey.findUnique({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        scopes: true,
        is_active: true,
        expires_at: true,
        last_used: true,
        created_at: true,
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        }
      }
    });

    if (!apiKey) {
      return res.status(404).json({
        error: 'API key not found',
        code: 'NOT_FOUND'
      });
    }

    res.json(apiKey);

  } catch (error) {
    logger.error('Error fetching API key:', error);
    res.status(500).json({
      error: 'Failed to fetch API key',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.patch('/:id', authenticate({ required: true }), async (req: AuthenticatedRequest, res: Response<ApiKeyResponseResult>) => {
  try {
    const { id } = req.params;
    const { name, description, is_active }: { name?: string; description?: string; is_active?: boolean } = req.body;

    const where: any = { id };
    if (!req.user!.roles.includes('admin')) {
      where.user_id = req.user!.id;
    }

    const existingKey = await prisma.apiKey.findUnique({ where });
    if (!existingKey) {
      return res.status(404).json({
        error: 'API key not found',
        code: 'NOT_FOUND'
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;

    const updatedKey = await prisma.apiKey.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        scopes: true,
        is_active: true,
        expires_at: true,
        last_used: true,
        created_at: true,
        updated_at: true
      }
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          resource_type: 'api_key',
          resource_id: req.params.id!,
          user_id: req.user!.id,
          old_values: {
            name: existingKey.name,
            description: existingKey.description,
            is_active: existingKey.is_active
          },
          new_values: updateData,
          metadata: {
            request_ip: req.ip,
            user_agent: req.get('User-Agent')
          }
        }
      });
    } catch (auditError) {
      logger.warn('Failed to create audit log for API key update:', auditError);
    }

    res.json(updatedKey);

  } catch (error) {
    logger.error('Error updating API key:', error);
    res.status(500).json({
      error: 'Failed to update API key',
      code: 'INTERNAL_ERROR'
    });
  }
});

router.delete('/:id', authenticate({ required: true }), async (req: AuthenticatedRequest, res: Response<{ message: string } | { error: string; code: string }>) => {
  try {
    const { id } = req.params;

    const where: any = { id };
    if (!req.user!.roles.includes('admin')) {
      where.user_id = req.user!.id;
    }

    const existingKey = await prisma.apiKey.findUnique({ where });
    if (!existingKey) {
      return res.status(404).json({
        error: 'API key not found',
        code: 'NOT_FOUND'
      });
    }

    await prisma.apiKey.delete({ where: { id } });

    try {
      await prisma.auditLog.create({
        data: {
          action: 'DELETE',
          resource_type: 'api_key',
          resource_id: req.params.id!,
          user_id: req.user!.id,
          old_values: {
            name: existingKey.name,
            scopes: existingKey.scopes
          },
          metadata: {
            request_ip: req.ip,
            user_agent: req.get('User-Agent')
          }
        }
      });
    } catch (auditError) {
      logger.warn('Failed to create audit log for API key deletion:', auditError);
    }

    res.status(204).send();

  } catch (error) {
    logger.error('Error deleting API key:', error);
    res.status(500).json({
      error: 'Failed to delete API key',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;