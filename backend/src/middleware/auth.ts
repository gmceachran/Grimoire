import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session';
import { AuthService } from '../services/auth';

/**
 * Authentication middleware to protect routes
 * Checks if user has valid session and adds user info to request
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract session token from cookie
    const sessionToken = req.cookies?.session_token;

    if (!sessionToken) {
      res.status(401).json({
        success: false,
        message: 'No active session'
      });
      return;
    }

    // Validate session token
    const sessionInfo = await SessionService.validateSession(sessionToken);

    if (!sessionInfo) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
      return;
    }

    // Get current user information
    const user = await AuthService.getCurrentUser(sessionToken);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Add user info to request object for use in route handlers
    req.user = user;
    req.sessionId = sessionInfo.sessionId;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
    return;
  }
};

/**
 * Optional authentication middleware
 * Adds user info to request if session exists, but doesn't block if not authenticated
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = req.cookies?.session_token;

    if (sessionToken) {
      const sessionInfo = await SessionService.validateSession(sessionToken);
      
      if (sessionInfo) {
        const user = await AuthService.getCurrentUser(sessionToken);
        if (user) {
          req.user = user;
          req.sessionId = sessionInfo.sessionId;
        }
      }
    }

    // Always continue, regardless of authentication status
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue even if there's an error
    next();
  }
};

// Extend Express Request interface to include user and sessionId
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        displayName: string;
        role: string;
        emailVerifiedAt: Date | null;
      };
      sessionId?: string;
    }
  }
}
