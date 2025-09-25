import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Health check endpoint
 * Verifies database connectivity and returns system status
 */
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get basic system info
    const userCount = await prisma.user.count();
    const sessionCount = await prisma.session.count({
      where: {
        revoked_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userCount,
        activeSessions: sessionCount,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      uptime: process.uptime(),
    });
  }
});

/**
 * Simple ping endpoint for basic connectivity testing
 */
router.get('/ping', (req, res) => {
  res.status(200).json({
    message: 'pong',
    timestamp: new Date().toISOString(),
  });
});

export default router;
