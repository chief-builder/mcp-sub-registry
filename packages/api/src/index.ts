import 'dotenv/config';
import app from './app';
import { connectDB, disconnectDB } from './db';
import { logger } from './utils/logger';
import { config } from './config';

// Start server
async function startServer() {
  try {
    logger.info(`Starting MCP Sub-Registry v1.0.0 in ${config.nodeEnv} mode`);
    await connectDB();
    
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
      logger.info(`📊 Health check: http://localhost:${config.port}/health`);
      logger.info(`📈 Metrics: http://localhost:${config.port}/metrics`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

startServer();