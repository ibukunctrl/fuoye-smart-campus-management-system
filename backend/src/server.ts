import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/database.js';
import { redis } from './config/redis.js';

const app = createApp();

// Test DB connection with retries (handles NeonDB cold-start / sleep)
async function connectWithRetry(maxRetries = 3, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      logger.info('✅ Database connection established successfully');
      return;
    } catch (err) {
      if (attempt < maxRetries) {
        logger.warn(`⏳ DB connection attempt ${attempt}/${maxRetries} failed. Retrying in ${delayMs / 1000}s... (NeonDB may be waking up)`);
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        logger.error({ err }, `❌ Could not connect to database after ${maxRetries} attempts. API calls requiring DB will fail until it's reachable.`);
      }
    }
  }
}

const server = app.listen(env.PORT, async () => {
  logger.info(`🚀 FUOYE Smart Campus Backend running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  logger.info(`🌐 Health check available at http://localhost:${env.PORT}/api/v1/health`);
  await connectWithRetry();
});

// Graceful Shutdown Handlers
async function shutdown(signal: string) {
  logger.info(`👋 Received ${signal}. Shutting down gracefully...`);
  
  server.close(async () => {
    logger.info('🛑 HTTP server closed.');
    try {
      await prisma.$disconnect();
      logger.info('📴 Prisma Database disconnected.');
      await redis.quit();
      logger.info('📴 Redis Client disconnected.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, '❌ Error during disconnection');
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, '💥 Unhandled Rejection at Promise. Shutting down server...');
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, '💥 Uncaught Exception thrown. Shutting down server...');
  process.exit(1);
});

