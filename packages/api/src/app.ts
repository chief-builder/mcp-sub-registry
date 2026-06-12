import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { logger } from './utils/logger';
import { isProduction } from './config';
import { globalRateLimit } from './middleware/security';
import { maintenanceGuard } from './middleware/maintenance';

import v0_1Routes from './routes/v0_1';
import metricsRoutes from './routes/metrics';
import authRoutes from './routes/auth';
import apiKeyRoutes from './routes/api-keys';
import namespaceRoutes from './routes/namespaces';
import userRoutes from './routes/users';
import settingsRoutes from './routes/settings';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: isProduction,
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  } : false
}));

app.use(cors({
  origin: isProduction ? 
    (process.env.ALLOWED_ORIGINS?.split(',') || false) : 
    true,
  credentials: true
}));

// Performance middleware
app.use(compression());
app.use(globalRateLimit);

// Body parsing middleware
app.use(express.json({ 
  limit: '1mb',
  verify: (req, _res, buf) => {
    // Store raw body for webhook verification if needed
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Enforce maintenance mode (admin-only access when enabled).
app.use(maintenanceGuard());

// Routes
app.use('/v0.1', v0_1Routes);
app.use('/metrics', metricsRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/api-keys', apiKeyRoutes);
app.use('/api/v1/namespaces', namespaceRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/settings', settingsRoutes);

// Health check for load balancers
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    code: 'NOT_FOUND'
  });
});

export default app;