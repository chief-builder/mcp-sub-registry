import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { prisma } from '../db';
import { logger } from '../utils/logger';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { publishRateLimit } from '../middleware/security';
import { validateBody, validateQuery, serverPublishSchema, paginationQuerySchema } from '../middleware/validation';
import { 
  AuthenticatedRequest,
  ServerPublishRequest,
  ServerResponse,
  ServerResponseResult,
  ServersListResponseResult,
  ServersQuery,
  TypedRequestWithQuery
} from '../types';

const router = Router();

// GET /v0/servers - List servers with MCP-compliant response format
router.get('/servers', 
  validateQuery(paginationQuerySchema.keys({ 
    status: Joi.string().valid('experimental', 'beta', 'stable', 'deprecated'),
    search: Joi.string().min(1).max(200)
  })), 
  optionalAuth(['read']), 
  async (req: TypedRequestWithQuery<any, ServersQuery> & AuthenticatedRequest, res: Response<ServersListResponseResult>) => {
  try {
    const {
      limit = '50',
      offset = '0',
      status,
      search
    } = req.query;

    // Parse pagination parameters
    const limitNum = Math.min(parseInt(limit as string) || 50, 100); // Max 100
    const offsetNum = parseInt(offset as string) || 0;

    // Build where clause for filtering
    const where: any = {};
    
    if (status) {
      where.status = status as string;
    }

    // Add search functionality
    if (search) {
      where.OR = [
        { 
          name: { 
            contains: search as string,
            mode: 'insensitive' 
          } 
        },
        { 
          description: { 
            contains: search as string,
            mode: 'insensitive' 
          } 
        }
      ];
    }

    // Get total count for pagination
    const total = await prisma.server.count({ where });

    // Get servers with pagination
    const servers = await prisma.server.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limitNum,
      skip: offsetNum
    });

    // Transform to MCP format
    const mcpServers: ServerResponse[] = servers.map(server => ({
      id: server.id,
      name: server.name,
      description: server.description,
      status: server.status,
      version: server.version,
      repository: server.repository as ServerResponse['repository'] || undefined,
      packages: server.packages.length > 0 ? server.packages as ServerResponse['packages'] : undefined,
      remote: server.remote as ServerResponse['remote'] || undefined,
      metadata: server.metadata as Record<string, any>
    }));

    const response = {
      servers: mcpServers,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        has_more: offsetNum + limitNum < total
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('Error listing servers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch servers',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /v0/servers/:id - Get specific server
router.get('/servers/:id', optionalAuth(['read']), async (req: AuthenticatedRequest, res: Response<ServerResponseResult>) => {
  try {
    const { id } = req.params;

    const server = await prisma.server.findUnique({
      where: { id }
    });
    
    if (!server) {
      return res.status(404).json({ 
        error: 'Server not found',
        code: 'NOT_FOUND'
      });
    }
    
    // Transform to MCP format
    const mcpServer: ServerResponse = {
      id: server.id,
      name: server.name,
      description: server.description,
      status: server.status,
      version: server.version,
      repository: server.repository as ServerResponse['repository'] || undefined,
      packages: server.packages.length > 0 ? server.packages as ServerResponse['packages'] : undefined,
      remote: server.remote as ServerResponse['remote'] || undefined,
      metadata: server.metadata as Record<string, any>
    };
    
    res.json(mcpServer);
  } catch (error) {
    logger.error('Error fetching server:', error);
    res.status(500).json({ 
      error: 'Failed to fetch server',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /v0/publish - Publish/update server
router.post('/publish', 
  publishRateLimit,
  validateBody(serverPublishSchema),
  requireAuth(['publish']), 
  async (req: AuthenticatedRequest & { body: ServerPublishRequest }, res: Response<ServerResponseResult>) => {
  try {
    const { 
      name, 
      description, 
      version, 
      status = 'experimental',
      repository,
      packages,
      remote,
      metadata
    } = req.body;

    // Validate required fields
    if (!name || !description || !version) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, description, version',
        code: 'VALIDATION_ERROR'
      });
    }

    // Validate name format (reverse DNS)
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(name)) {
      return res.status(400).json({ 
        error: 'Server name must follow reverse DNS format (e.g., com.company.server-name)',
        code: 'VALIDATION_ERROR'
      });
    }

    // Validate status
    const validStatuses = ['experimental', 'beta', 'stable', 'deprecated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Status must be one of: ${validStatuses.join(', ')}`,
        code: 'VALIDATION_ERROR'
      });
    }

    // Validate repository structure if provided
    if (repository && (!repository.type || !repository.url)) {
      return res.status(400).json({ 
        error: 'Repository must include both type and url fields',
        code: 'VALIDATION_ERROR'
      });
    }

    // Validate packages structure if provided
    if (packages && Array.isArray(packages)) {
      for (const pkg of packages) {
        if (!pkg.registry || !pkg.identifier) {
          return res.status(400).json({ 
            error: 'Each package must include registry and identifier fields',
            code: 'VALIDATION_ERROR'
          });
        }
      }
    }

    // Validate remote structure if provided
    if (remote && !remote.transport) {
      return res.status(400).json({ 
        error: 'Remote must include transport field',
        code: 'VALIDATION_ERROR'
      });
    }

    try {
      // Check if server already exists
      const existingServer = await prisma.server.findUnique({
        where: { name }
      });

      if (existingServer) {
        return res.status(409).json({ 
          error: 'Server name already exists',
          code: 'CONFLICT'
        });
      }

      // Create new server
      const server = await prisma.server.create({
        data: {
          name,
          description,
          version,
          status,
          repository: repository || undefined,
          packages: packages || [],
          remote: remote || undefined,
          metadata: metadata || {}
        }
      });

      // Log the action
      try {
        await prisma.auditLog.create({
          data: {
            action: 'CREATE',
            resource_type: 'server',
            resource_id: server.id,
            user_id: req.user?.id,
            api_key_id: req.api_key?.id,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            new_values: {
              name: server.name,
              version: server.version,
              status: server.status
            },
            metadata: {
              auth_method: req.user?.auth_method || 'unknown',
              authenticated_user: req.user?.email
            }
          }
        });
      } catch (auditError) {
        logger.warn('Failed to create audit log:', auditError);
      }

      // Return MCP format
      const mcpServer: ServerResponse = {
        id: server.id,
        name: server.name,
        description: server.description,
        status: server.status,
        version: server.version,
        repository: server.repository as ServerResponse['repository'] || undefined,
        packages: server.packages.length > 0 ? server.packages as ServerResponse['packages'] : undefined,
        remote: server.remote as ServerResponse['remote'] || undefined,
        metadata: server.metadata as Record<string, any>
      };
      
      res.status(201).json(mcpServer);
    } catch (dbError: any) {
      throw dbError;
    }
  } catch (error) {
    logger.error('Error publishing server:', error);
    res.status(500).json({ 
      error: 'Failed to publish server',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /v0/health - Health check
router.get('/health', async (req: Request, res: Response) => {
  try {
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0'
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

export default router;