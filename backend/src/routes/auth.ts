import express from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth';
import { SessionService } from '../services/session';

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string(),
});

const emailVerificationRequestSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

const emailVerificationConfirmSchema = z.object({
  token: z.string().min(1),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

const passwordResetConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = registerSchema.parse(req.body);
    
    const result = await AuthService.register(email, password, displayName || '');
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.userId,
        email: result.email,
        displayName: result.displayName,
        role: 'user',
      },
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: error.issues,
      });
    }
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists',
        });
      }
    }
    
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const result = await AuthService.login(email, password);
    
    // Create session
    const { token, expiresAt } = await SessionService.createSession(
      result.user.id,
      req.get('User-Agent'),
      req.ip
    );
    
    // Set session cookie
    res.cookie('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.displayName,
        role: result.user.role,
      },
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: error.issues,
      });
    }
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid credentials')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }
    }
    
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.session_token;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No active session',
      });
    }
    
    // Validate session and get session ID
    const sessionInfo = await SessionService.validateSession(token);
    
    if (sessionInfo) {
      // Revoke the session
      await SessionService.revokeSession(sessionInfo.sessionId);
    }
    
    // Clear the cookie
    res.clearCookie('session_token');
    
    res.json({
      success: true,
      message: 'Logout successful',
    });
    return;
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }
});

// GET /auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.session_token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No active session',
      });
    }
    
    // Get user details (this method handles session validation internally)
    const user = await AuthService.getCurrentUser(token);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.user_roles?.[0]?.role?.name || 'user',
      },
    });
    return;
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }
});

// POST /auth/verify/request
router.post('/verify/request', async (req, res) => {
  try {
    const { email } = emailVerificationRequestSchema.parse(req.body);
    
    await AuthService.requestEmailVerification(email);
    
    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If the email exists, a verification link has been sent',
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
        errors: error.issues,
      });
    }
    
    console.error('Email verification request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }
});

// POST /auth/verify/confirm
router.post('/verify/confirm', async (req, res) => {
  try {
    const { token } = emailVerificationConfirmSchema.parse(req.body);
    
    await AuthService.verifyEmail(token);
    
    res.json({
      success: true,
      message: 'Email verified successfully',
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token',
        errors: error.issues,
      });
    }
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid token')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token',
        });
      }
      if (error.message.includes('already verified')) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified',
        });
      }
    }
    
    console.error('Email verification confirm error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }
});

// POST /auth/password/reset/request
router.post('/password/reset/request', async (req, res) => {
  try {
    const { email } = passwordResetRequestSchema.parse(req.body);
    
    await AuthService.requestPasswordReset(email);
    
    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
        errors: error.issues,
      });
    }
    
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }
});

// POST /auth/password/reset/confirm
router.post('/password/reset/confirm', async (req, res) => {
  try {
    const { token, newPassword } = passwordResetConfirmSchema.parse(req.body);
    
    await AuthService.resetPassword(token, newPassword);
    
    res.json({
      success: true,
      message: 'Password reset successfully',
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        errors: error.issues,
      });
    }
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid token')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
        });
      }
      if (error.message.includes('Password must contain')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
    }
    
    console.error('Password reset confirm error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }
});

export default router;
