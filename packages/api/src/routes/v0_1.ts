import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { logger } from '../utils/logger';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { publishRateLimit } from '../middleware/security';
import {
  validateBody,
  validateQuery,
  serverPublishSchema,
  statusUpdateSchema,
  serverListQuerySchema,
} from '../middleware/validation';
import {
  SERVER_JSON_SCHEMA_URL,
  OFFICIAL_META_KEY,
  ServerResponse,
  ServerRegistryStatus,
} from '../types/mcp';
import {
  AuthenticatedRequest,
  ServerPublishRequest,
  StatusUpdateRequest,
  ServerResponseResult,
  ServersListResponseResult,
  AllVersionsStatusResponseResult,
  ServersQuery,
  TypedRequestWithQuery,
} from '../types';

const router = Router();

// --- helpers ---

/** Namespace is the reverse-DNS portion before the slash in a server name. */
function deriveNamespace(name: string): string | null {
  const idx = name.indexOf('/');
  return idx > 0 ? name.slice(0, idx) : null;
}

/** Opaque cursor: base64url(id). */
function encodeCursor(id: string): string {
  return Buffer.from(id, 'utf8').toString('base64url');
}
function decodeCursor(cursor: string): string | null {
  try {
    const v = Buffer.from(cursor, 'base64url').toString('utf8');
    return v || null;
  } catch {
    return null;
  }
}

/** Compare two semver strings; returns >0 if a>b, <0 if a<b, 0 if equal. */
function compareSemver(a: string, b: string): number {
  const parse = (v: string) => {
    const base = v.split('+')[0] ?? v;
    const [core = '0.0.0', pre = ''] = base.split('-');
    const nums = core.split('.').map((n) => parseInt(n, 10) || 0);
    return { nums, pre };
  };
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    const d = (pa.nums[i] || 0) - (pb.nums[i] || 0);
    if (d !== 0) return d;
  }
  // A version without a prerelease outranks one with a prerelease.
  if (!pa.pre && pb.pre) return 1;
  if (pa.pre && !pb.pre) return -1;
  if (pa.pre === pb.pre) return 0;
  return pa.pre > pb.pre ? 1 : -1;
}

/** Build a spec ServerResponse (ServerDetail + official _meta) from a DB row. */
function toServerResponse(row: any): ServerResponse {
  const publisherMeta =
    row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, any>)
      : {};

  return {
    $schema: row.schema_url || SERVER_JSON_SCHEMA_URL,
    name: row.name,
    description: row.description,
    title: row.title || undefined,
    version: row.version,
    websiteUrl: row.website_url || undefined,
    repository: row.repository || undefined,
    packages: Array.isArray(row.packages) && row.packages.length ? row.packages : undefined,
    remotes: Array.isArray(row.remotes) && row.remotes.length ? row.remotes : undefined,
    _meta: {
      ...publisherMeta,
      [OFFICIAL_META_KEY]: {
        status: row.registry_status as ServerRegistryStatus,
        statusMessage: row.status_message || undefined,
        publishedAt: row.published_at.toISOString(),
        updatedAt: row.updated_at.toISOString(),
        statusChangedAt: row.status_changed_at.toISOString(),
        isLatest: row.is_latest,
      },
    },
  };
}

/** Strip the registry-controlled official key from publisher-supplied _meta. */
function sanitizePublisherMeta(meta: Record<string, any> | undefined): Record<string, any> {
  if (!meta || typeof meta !== 'object') return {};
  const clone = { ...meta };
  delete clone[OFFICIAL_META_KEY];
  return clone;
}

/**
 * Recompute the is_latest flag for a server name: the highest semver among
 * non-deleted versions becomes latest. Must run inside a transaction client.
 */
async function recomputeLatest(tx: any, name: string): Promise<void> {
  // Prefer the highest non-deleted version; if every version is deleted, still
  // mark the newest one latest so the server can surface under include_deleted.
  let versions = await tx.server.findMany({
    where: { name, registry_status: { not: 'deleted' } },
    select: { id: true, version: true },
  });
  if (versions.length === 0) {
    versions = await tx.server.findMany({ where: { name }, select: { id: true, version: true } });
  }
  if (versions.length === 0) return;

  let latest = versions[0];
  for (const v of versions) {
    if (compareSemver(v.version, latest.version) > 0) latest = v;
  }
  await tx.server.updateMany({ where: { name }, data: { is_latest: false } });
  await tx.server.update({ where: { id: latest.id }, data: { is_latest: true } });
}

/**
 * Verify the caller owns (or is authorized for / is admin over) the namespace
 * implied by a server name. Returns null when authorized, otherwise an error.
 */
async function authorizeNamespace(
  req: AuthenticatedRequest,
  name: string
): Promise<{ status: number; error: string; code: string } | null> {
  const namespace = deriveNamespace(name);
  if (!namespace) {
    return { status: 400, error: 'Server name must include a namespace', code: 'VALIDATION_ERROR' };
  }

  if (req.is_admin) return null;

  const ns = await prisma.namespace.findUnique({ where: { name: namespace } });
  if (!ns || !ns.is_verified) {
    return {
      status: 403,
      error: `Namespace "${namespace}" is not registered or not verified. Ask an administrator to claim it.`,
      code: 'NAMESPACE_FORBIDDEN',
    };
  }

  const userId = req.user!.id;
  if (ns.owner_id === userId || ns.authorized_users.includes(userId)) return null;

  return {
    status: 403,
    error: `You are not authorized to publish under namespace "${namespace}"`,
    code: 'NAMESPACE_FORBIDDEN',
  };
}

async function writeAudit(req: AuthenticatedRequest, action: string, resourceId: string, values: any) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        resource_type: 'server',
        resource_id: resourceId,
        user_id: req.user?.id,
        api_key_id: req.api_key?.id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent'),
        new_values: values,
        metadata: { auth_method: req.user?.auth_method || 'unknown' },
      },
    });
  } catch (auditError) {
    logger.warn('Failed to create audit log:', auditError);
  }
}

// --- routes ---

// GET /v0.1/servers - cursor-paginated list of servers
router.get(
  '/servers',
  validateQuery(serverListQuerySchema),
  optionalAuth(['read']),
  async (req: TypedRequestWithQuery<any, ServersQuery> & AuthenticatedRequest, res: Response<ServersListResponseResult>) => {
    try {
      const { cursor, limit, search, updated_since, version, include_deleted } = req.query;

      const take = Math.min(parseInt(limit as string) || 50, 100);

      const where: any = {};
      if (include_deleted !== 'true') {
        where.registry_status = { not: 'deleted' };
      }
      // Default view is the latest version of each server unless a version is given.
      if (version && version !== 'latest') {
        where.version = version;
      } else {
        where.is_latest = true;
      }
      if (search) {
        where.name = { contains: search as string, mode: 'insensitive' };
      }
      if (updated_since) {
        where.updated_at = { gte: new Date(updated_since as string) };
      }

      const findArgs: any = {
        where,
        orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
        take: take + 1,
      };
      if (cursor) {
        const id = decodeCursor(cursor as string);
        if (id) {
          findArgs.cursor = { id };
          findArgs.skip = 1;
        }
      }

      const [rows, count] = await Promise.all([
        prisma.server.findMany(findArgs),
        prisma.server.count({ where }),
      ]);

      const hasMore = rows.length > take;
      const page = hasMore ? rows.slice(0, take) : rows;
      const nextCursor = hasMore ? encodeCursor(page[page.length - 1]!.id) : undefined;

      res.json({
        servers: page.map(toServerResponse),
        metadata: { count, nextCursor },
      });
    } catch (error) {
      logger.error('Error listing servers:', error);
      res.status(500).json({ error: 'Failed to fetch servers', code: 'INTERNAL_ERROR' });
    }
  }
);

// GET /v0.1/servers/:serverName/versions - all versions of a server, newest first
router.get(
  '/servers/:serverName/versions',
  optionalAuth(['read']),
  async (req: AuthenticatedRequest, res: Response<ServersListResponseResult>) => {
    try {
      const name = req.params.serverName!;
      const includeDeleted = req.query.include_deleted === 'true';

      const where: any = { name };
      if (!includeDeleted) where.registry_status = { not: 'deleted' };

      const rows = await prisma.server.findMany({
        where,
        orderBy: { published_at: 'desc' },
      });

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Server not found', code: 'NOT_FOUND' });
      }

      res.json({ servers: rows.map(toServerResponse), metadata: { count: rows.length } });
    } catch (error) {
      logger.error('Error listing server versions:', error);
      res.status(500).json({ error: 'Failed to fetch server versions', code: 'INTERNAL_ERROR' });
    }
  }
);

// GET /v0.1/servers/:serverName/versions/:version - a specific version ("latest" supported)
router.get(
  '/servers/:serverName/versions/:version',
  optionalAuth(['read']),
  async (req: AuthenticatedRequest, res: Response<ServerResponseResult>) => {
    try {
      const name = req.params.serverName!;
      const version = req.params.version!;
      const includeDeleted = req.query.include_deleted === 'true';

      const where: any = version === 'latest' ? { name, is_latest: true } : { name, version };
      if (!includeDeleted) where.registry_status = { not: 'deleted' };

      const row = await prisma.server.findFirst({ where });
      if (!row) {
        return res.status(404).json({ error: 'Server version not found', code: 'NOT_FOUND' });
      }

      res.json(toServerResponse(row));
    } catch (error) {
      logger.error('Error fetching server version:', error);
      res.status(500).json({ error: 'Failed to fetch server', code: 'INTERNAL_ERROR' });
    }
  }
);

// POST /v0.1/publish - publish a new server version
router.post(
  '/publish',
  publishRateLimit,
  validateBody(serverPublishSchema),
  requireAuth(['publish']),
  async (req: AuthenticatedRequest & { body: ServerPublishRequest }, res: Response<ServerResponseResult>) => {
    try {
      const body = req.body;

      // Enforce namespace ownership before creating anything.
      const denial = await authorizeNamespace(req, body.name);
      if (denial) {
        return res.status(denial.status).json({ error: denial.error, code: denial.code });
      }

      const existing = await prisma.server.findUnique({
        where: { name_version: { name: body.name, version: body.version } },
      });
      if (existing) {
        return res.status(409).json({ error: 'This server version already exists', code: 'CONFLICT' });
      }

      const created = await prisma.$transaction(async (tx) => {
        const row = await tx.server.create({
          data: {
            name: body.name,
            version: body.version,
            description: body.description,
            title: body.title || null,
            website_url: body.websiteUrl || null,
            schema_url: body.$schema || SERVER_JSON_SCHEMA_URL,
            repository: (body.repository as any) || undefined,
            packages: (body.packages as any) || [],
            remotes: (body.remotes as any) || [],
            metadata: sanitizePublisherMeta(body._meta) as any,
            registry_status: 'active',
          },
        });
        await recomputeLatest(tx, body.name);
        return tx.server.findUniqueOrThrow({ where: { id: row.id } });
      });

      await writeAudit(req, 'publish', created.id, {
        name: created.name,
        version: created.version,
      });

      res.status(201).json(toServerResponse(created));
    } catch (error) {
      logger.error('Error publishing server:', error);
      res.status(500).json({ error: 'Failed to publish server', code: 'INTERNAL_ERROR' });
    }
  }
);

// PUT /v0.1/servers/:serverName/versions/:version - replace an existing version
router.put(
  '/servers/:serverName/versions/:version',
  validateBody(serverPublishSchema),
  requireAuth(['publish']),
  async (req: AuthenticatedRequest & { body: ServerPublishRequest }, res: Response<ServerResponseResult>) => {
    try {
      const name = req.params.serverName!;
      const version = req.params.version!;
      const body = req.body;

      if (body.name !== name || body.version !== version) {
        return res.status(400).json({
          error: 'Body name/version must match the URL',
          code: 'VALIDATION_ERROR',
        });
      }

      const denial = await authorizeNamespace(req, name);
      if (denial) {
        return res.status(denial.status).json({ error: denial.error, code: denial.code });
      }

      const existing = await prisma.server.findUnique({
        where: { name_version: { name, version } },
      });
      if (!existing) {
        return res.status(404).json({ error: 'Server version not found', code: 'NOT_FOUND' });
      }

      const updated = await prisma.$transaction(async (tx) => {
        await tx.server.update({
          where: { name_version: { name, version } },
          data: {
            description: body.description,
            title: body.title || null,
            website_url: body.websiteUrl || null,
            schema_url: body.$schema || SERVER_JSON_SCHEMA_URL,
            repository: (body.repository as any) || undefined,
            packages: (body.packages as any) || [],
            remotes: (body.remotes as any) || [],
            metadata: sanitizePublisherMeta(body._meta) as any,
          },
        });
        await recomputeLatest(tx, name);
        return tx.server.findUniqueOrThrow({ where: { name_version: { name, version } } });
      });

      await writeAudit(req, 'update', updated.id, { name, version });

      res.json(toServerResponse(updated));
    } catch (error) {
      logger.error('Error updating server version:', error);
      res.status(500).json({ error: 'Failed to update server', code: 'INTERNAL_ERROR' });
    }
  }
);

// DELETE /v0.1/servers/:serverName/versions/:version - soft-delete a version
router.delete(
  '/servers/:serverName/versions/:version',
  requireAuth(['publish']),
  async (req: AuthenticatedRequest, res: Response<ServerResponseResult>) => {
    try {
      const name = req.params.serverName!;
      const version = req.params.version!;

      const denial = await authorizeNamespace(req, name);
      if (denial) {
        return res.status(denial.status).json({ error: denial.error, code: denial.code });
      }

      const existing = await prisma.server.findUnique({ where: { name_version: { name, version } } });
      if (!existing) {
        return res.status(404).json({ error: 'Server version not found', code: 'NOT_FOUND' });
      }

      const updated = await prisma.$transaction(async (tx) => {
        await tx.server.update({
          where: { name_version: { name, version } },
          data: { registry_status: 'deleted', status_changed_at: new Date(), is_latest: false },
        });
        await recomputeLatest(tx, name);
        return tx.server.findUniqueOrThrow({ where: { name_version: { name, version } } });
      });

      await writeAudit(req, 'delete', updated.id, { name, version });

      res.json(toServerResponse(updated));
    } catch (error) {
      logger.error('Error deleting server version:', error);
      res.status(500).json({ error: 'Failed to delete server', code: 'INTERNAL_ERROR' });
    }
  }
);

// PATCH /v0.1/servers/:serverName/versions/:version/status - set a single version's status
router.patch(
  '/servers/:serverName/versions/:version/status',
  validateBody(statusUpdateSchema),
  requireAuth(['publish']),
  async (req: AuthenticatedRequest & { body: StatusUpdateRequest }, res: Response<ServerResponseResult>) => {
    try {
      const name = req.params.serverName!;
      const version = req.params.version!;
      const { status, statusMessage } = req.body;

      const denial = await authorizeNamespace(req, name);
      if (denial) {
        return res.status(denial.status).json({ error: denial.error, code: denial.code });
      }

      const existing = await prisma.server.findUnique({ where: { name_version: { name, version } } });
      if (!existing) {
        return res.status(404).json({ error: 'Server version not found', code: 'NOT_FOUND' });
      }

      const updated = await prisma.$transaction(async (tx) => {
        await tx.server.update({
          where: { name_version: { name, version } },
          data: { registry_status: status, status_message: statusMessage || null, status_changed_at: new Date() },
        });
        await recomputeLatest(tx, name);
        return tx.server.findUniqueOrThrow({ where: { name_version: { name, version } } });
      });

      await writeAudit(req, 'update', updated.id, { name, version, status });

      res.json(toServerResponse(updated));
    } catch (error) {
      logger.error('Error updating version status:', error);
      res.status(500).json({ error: 'Failed to update status', code: 'INTERNAL_ERROR' });
    }
  }
);

// PATCH /v0.1/servers/:serverName/status - set status for all versions of a server
router.patch(
  '/servers/:serverName/status',
  validateBody(statusUpdateSchema),
  requireAuth(['publish']),
  async (req: AuthenticatedRequest & { body: StatusUpdateRequest }, res: Response<AllVersionsStatusResponseResult>) => {
    try {
      const name = req.params.serverName!;
      const { status, statusMessage } = req.body;

      const denial = await authorizeNamespace(req, name);
      if (denial) {
        return res.status(denial.status).json({ error: denial.error, code: denial.code });
      }

      const rows = await prisma.$transaction(async (tx) => {
        const result = await tx.server.updateMany({
          where: { name },
          data: { registry_status: status, status_message: statusMessage || null, status_changed_at: new Date() },
        });
        if (result.count === 0) return null;
        await recomputeLatest(tx, name);
        return tx.server.findMany({ where: { name }, orderBy: { published_at: 'desc' } });
      });

      if (!rows) {
        return res.status(404).json({ error: 'Server not found', code: 'NOT_FOUND' });
      }

      await writeAudit(req, 'update', name, { name, status, scope: 'all-versions' });

      res.json({ updatedCount: rows.length, servers: rows.map(toServerResponse) });
    } catch (error) {
      logger.error('Error updating server status:', error);
      res.status(500).json({ error: 'Failed to update status', code: 'INTERNAL_ERROR' });
    }
  }
);

// GET /v0.1/health - health check
router.get('/health', async (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: '0.1.0' });
});

export default router;
