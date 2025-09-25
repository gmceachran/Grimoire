import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Session management service
 * Handles secure session token generation, storage, and validation
 */
export class SessionService {
  /**
   * Generate a cryptographically secure session token
   * @returns Promise<string> - Random token
   */
  static async generateToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash a session token for secure storage
   * @param token - Raw session token
   * @returns Promise<string> - Hashed token
   */
  static async hashToken(token: string): Promise<string> {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Create a new session for a user
   * @param userId - User ID
   * @param userAgent - Browser user agent
   * @param ipAddress - Client IP address
   * @param deviceLabel - Optional device label
   * @returns Promise<{ token: string; expiresAt: Date }> - Session details
   */
  static async createSession(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
    deviceLabel?: string
  ): Promise<{ token: string; expiresAt: Date }> {
    const token = await this.generateToken();
    const tokenHash = await this.hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        token_hash: tokenHash,
        user_id: userId,
        expires_at: expiresAt,
        user_agent: userAgent,
        ip_address: ipAddress,
        device_label: deviceLabel,
      },
    });

    return { token, expiresAt };
  }

  /**
   * Validate a session token and return user info
   * @param token - Raw session token
   * @returns Promise<{ userId: string; sessionId: string } | null> - Session info or null
   */
  static async validateSession(token: string): Promise<{ userId: string; sessionId: string } | null> {
    const tokenHash = await this.hashToken(token);
    
    const session = await prisma.session.findFirst({
      where: {
        token_hash: tokenHash,
        expires_at: {
          gt: new Date(),
        },
        revoked_at: null,
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return null;
    }

    // Update last_used_at
    await prisma.session.update({
      where: { id: session.id },
      data: { last_used_at: new Date() },
    });

    return {
      userId: session.user_id,
      sessionId: session.id,
    };
  }

  /**
   * Revoke a specific session
   * @param sessionId - Session ID to revoke
   * @returns Promise<void>
   */
  static async revokeSession(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { revoked_at: new Date() },
    });
  }

  /**
   * Revoke all sessions for a user (useful for logout all devices)
   * @param userId - User ID
   * @returns Promise<void>
   */
  static async revokeAllUserSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { 
        user_id: userId,
        revoked_at: null,
      },
      data: { revoked_at: new Date() },
    });
  }

  /**
   * Clean up expired sessions (should be run periodically)
   * @returns Promise<number> - Number of sessions cleaned up
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * Get all active sessions for a user
   * @param userId - User ID
   * @returns Promise<Array> - List of active sessions
   */
  static async getUserSessions(userId: string) {
    return prisma.session.findMany({
      where: {
        user_id: userId,
        revoked_at: null,
        expires_at: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        created_at: true,
        last_used_at: true,
        expires_at: true,
        user_agent: true,
        ip_address: true,
        device_label: true,
      },
      orderBy: {
        last_used_at: 'desc',
      },
    });
  }
}
