import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { logger } from '../utils/logger';
import { config } from '../config';

const router = Router();

// Metrics cache to avoid expensive database queries on every request
let metricsCache: string | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds

async function generateMetrics(): Promise<string> {
  const startTime = Date.now();
  
  try {
    // Get basic registry statistics
    const [
      totalServers,
      stableServers,
      betaServers,
      experimentalServers,
      deprecatedServers,
      totalUsers,
      activeUsers,
      totalApiKeys,
      activeApiKeys,
      recentServers,
      auditLogCount
    ] = await Promise.all([
      prisma.server.count(),
      prisma.server.count({ where: { status: 'stable' } }),
      prisma.server.count({ where: { status: 'beta' } }),
      prisma.server.count({ where: { status: 'experimental' } }),
      prisma.server.count({ where: { status: 'deprecated' } }),
      prisma.user.count(),
      prisma.user.count({ where: { is_active: true } }),
      prisma.apiKey.count(),
      prisma.apiKey.count({ where: { is_active: true } }),
      prisma.server.count({ 
        where: { 
          created_at: { 
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          } 
        } 
      }),
      prisma.auditLog.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    const queryDuration = Date.now() - startTime;
    const uptime = process.uptime();

    // Generate comprehensive Prometheus-style metrics
    const metrics = `# HELP mcp_registry_servers_total Total number of servers in the registry
# TYPE mcp_registry_servers_total counter
mcp_registry_servers_total ${totalServers}

# HELP mcp_registry_servers_by_status Number of servers by status
# TYPE mcp_registry_servers_by_status gauge
mcp_registry_servers_by_status{status="stable"} ${stableServers}
mcp_registry_servers_by_status{status="beta"} ${betaServers}
mcp_registry_servers_by_status{status="experimental"} ${experimentalServers}
mcp_registry_servers_by_status{status="deprecated"} ${deprecatedServers}

# HELP mcp_registry_servers_created_24h Servers created in the last 24 hours
# TYPE mcp_registry_servers_created_24h gauge
mcp_registry_servers_created_24h ${recentServers}

# HELP mcp_registry_users_total Total number of users
# TYPE mcp_registry_users_total counter
mcp_registry_users_total ${totalUsers}

# HELP mcp_registry_users_active Number of active users
# TYPE mcp_registry_users_active gauge
mcp_registry_users_active ${activeUsers}

# HELP mcp_registry_api_keys_total Total number of API keys
# TYPE mcp_registry_api_keys_total counter
mcp_registry_api_keys_total ${totalApiKeys}

# HELP mcp_registry_api_keys_active Number of active API keys
# TYPE mcp_registry_api_keys_active gauge
mcp_registry_api_keys_active ${activeApiKeys}

# HELP mcp_registry_audit_events_24h Audit events in the last 24 hours
# TYPE mcp_registry_audit_events_24h gauge
mcp_registry_audit_events_24h ${auditLogCount}

# HELP mcp_registry_database_query_duration_ms Database query duration in milliseconds
# TYPE mcp_registry_database_query_duration_ms gauge
mcp_registry_database_query_duration_ms ${queryDuration}

# HELP mcp_registry_uptime_seconds Registry uptime in seconds
# TYPE mcp_registry_uptime_seconds counter
mcp_registry_uptime_seconds ${uptime}

# HELP mcp_registry_memory_usage_bytes Process memory usage in bytes
# TYPE mcp_registry_memory_usage_bytes gauge
mcp_registry_memory_usage_bytes{type="rss"} ${process.memoryUsage().rss}
mcp_registry_memory_usage_bytes{type="heapTotal"} ${process.memoryUsage().heapTotal}
mcp_registry_memory_usage_bytes{type="heapUsed"} ${process.memoryUsage().heapUsed}
mcp_registry_memory_usage_bytes{type="external"} ${process.memoryUsage().external}

# HELP mcp_registry_info Registry information
# TYPE mcp_registry_info gauge
mcp_registry_info{version="1.0.0",node_env="${config.nodeEnv}",node_version="${process.version}"} 1

# HELP mcp_registry_up Registry uptime indicator
# TYPE mcp_registry_up gauge
mcp_registry_up 1

# HELP mcp_registry_build_info Build information
# TYPE mcp_registry_build_info gauge
mcp_registry_build_info{version="1.0.0",built_at="${new Date().toISOString()}"} 1
`;

    return metrics;
  } catch (error) {
    logger.error('Error generating metrics:', error);
    return `# HELP mcp_registry_up Registry uptime indicator
# TYPE mcp_registry_up gauge
mcp_registry_up 0

# HELP mcp_registry_database_errors_total Number of database errors
# TYPE mcp_registry_database_errors_total counter
mcp_registry_database_errors_total 1
`;
  }
}

// GET /metrics - Prometheus metrics endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    
    // Use cached metrics if still valid
    if (metricsCache && (now - lastCacheUpdate) < CACHE_TTL) {
      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.set('Cache-Control', `public, max-age=${Math.floor(CACHE_TTL / 1000)}`);
      return res.send(metricsCache);
    }

    // Generate fresh metrics
    const metrics = await generateMetrics();
    
    // Cache the metrics
    metricsCache = metrics;
    lastCacheUpdate = now;

    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.set('Cache-Control', `public, max-age=${Math.floor(CACHE_TTL / 1000)}`);
    res.send(metrics);
  } catch (error) {
    logger.error('Error serving metrics:', error);
    const errorMetrics = `# HELP mcp_registry_up Registry uptime indicator
# TYPE mcp_registry_up gauge
mcp_registry_up 0

# HELP mcp_registry_errors_total Number of errors
# TYPE mcp_registry_errors_total counter
mcp_registry_errors_total 1
`;
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.status(500).send(errorMetrics);
  }
});

export default router;