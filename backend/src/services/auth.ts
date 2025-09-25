import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
import { SessionService } from './session';
import { EmailService } from './email';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Password hashing service using Argon2id
 * Argon2id is the recommended password hashing algorithm
 * It's resistant to timing attacks and GPU-based attacks
 */
export class PasswordService {
  /**
   * Hash a password using Argon2id
   * @param password - Plain text password
   * @returns Promise<string> - Hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,         // 3 iterations
        parallelism: 1,      // 1 thread
      });
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a password against its hash
   * @param hash - Hashed password from database
   * @param password - Plain text password to verify
   * @returns Promise<boolean> - True if password matches
   */
  static async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      throw new Error('Failed to verify password');
    }
  }

  /**
   * Check if a password meets security requirements
   * @param password - Password to validate
   * @returns Object with isValid boolean and error message
   */
  static validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password || password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }

    if (password.length > 128) {
      return { isValid: false, error: 'Password must be less than 128 characters' };
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one special character' };
    }

    return { isValid: true };
  }
}

/**
 * Main authentication service
 * Handles user registration, login, logout, and verification flows
 */
export class AuthService {
  /**
   * Normalize email address (lowercase, trim)
   * @param email - Raw email address
   * @returns string - Normalized email
   */
  static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Validate email format
   * @param email - Email address to validate
   * @returns boolean - True if valid
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Register a new user
   * @param email - User email
   * @param password - Plain text password
   * @param displayName - User display name
   * @returns Promise<{ userId: string; email: string; displayName: string }>
   */
  static async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<{ userId: string; email: string; displayName: string }> {
    // Validate password
    const passwordValidation = PasswordService.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }

    // Normalize email
    const normalizedEmail = this.normalizeEmail(email);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await PasswordService.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password_hash: passwordHash,
        display_name: displayName.trim(),
        status: 'PENDING', // Requires email verification
      },
    });

    return {
      userId: user.id,
      email: user.email,
      displayName: user.display_name || '',
    };
  }

  /**
   * Login a user
   * @param email - User email
   * @param password - Plain text password
   * @param userAgent - Browser user agent
   * @param ipAddress - Client IP address
   * @returns Promise<{ user: any; sessionToken: string }>
   */
  static async login(
    email: string,
    password: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ user: any; sessionToken: string }> {
    const normalizedEmail = this.normalizeEmail(email);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (user.status === 'SUSPENDED' || user.status === 'DELETED') {
      throw new Error('Account is suspended or deleted');
    }

    // Verify password
    const isValidPassword = await PasswordService.verifyPassword(user.password_hash, password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Revoke old sessions (session rotation)
    await SessionService.revokeAllUserSessions(user.id);

    // Create new session
    const { token: sessionToken } = await SessionService.createSession(
      user.id,
      userAgent,
      ipAddress
    );

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      sessionToken,
    };
  }

  /**
   * Logout a user (revoke current session)
   * @param sessionToken - Session token to revoke
   * @returns Promise<void>
   */
  static async logout(sessionToken: string): Promise<void> {
    const sessionInfo = await SessionService.validateSession(sessionToken);
    if (sessionInfo) {
      await SessionService.revokeSession(sessionInfo.sessionId);
    }
  }

  /**
   * Get current user from session
   * @param sessionToken - Session token
   * @returns Promise<any> - User object or null
   */
  static async getCurrentUser(sessionToken: string): Promise<any> {
    const sessionInfo = await SessionService.validateSession(sessionToken);
    if (!sessionInfo) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionInfo.userId },
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Request email verification
   * @param email - User email
   * @returns Promise<void>
   */
  static async requestEmailVerification(email: string): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await prisma.verificationToken.create({
      data: {
        token: verificationToken,
        user_id: user.id,
        purpose: 'EMAIL_VERIFICATION',
        expires_at: expiresAt,
      },
    });

    // Send verification email
    const emailService = new EmailService();
    await emailService.sendVerificationEmail(
      normalizedEmail,
      verificationToken,
      user.display_name || undefined
    );
  }

  /**
   * Verify email with token
   * @param token - Verification token
   * @returns Promise<void>
   */
  static async verifyEmail(token: string): Promise<void> {
    // Find verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: token,
        purpose: 'EMAIL_VERIFICATION',
        expires_at: {
          gt: new Date(),
        },
        consumed_at: null,
      },
      include: {
        user: true,
      },
    });

    if (!verificationToken) {
      throw new Error('Invalid or expired verification token');
    }

    // Check if user is already verified
    if (verificationToken.user.email_verified_at) {
      throw new Error('Email is already verified');
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: verificationToken.user_id },
      data: { email_verified_at: new Date() },
    });

    // Mark token as used
    await prisma.verificationToken.update({
      where: { id: verificationToken.id },
      data: { consumed_at: new Date() },
    });
  }

  /**
   * Request password reset
   * @param email - User email
   * @returns Promise<void>
   */
  static async requestPasswordReset(email: string): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await prisma.verificationToken.create({
      data: {
        token: resetToken,
        user_id: user.id,
        purpose: 'PASSWORD_RESET',
        expires_at: expiresAt,
      },
    });

    // Send reset email
    const emailService = new EmailService();
    await emailService.sendPasswordResetEmail(
      normalizedEmail,
      resetToken,
      user.display_name || undefined
    );
  }

  /**
   * Reset password with token
   * @param token - Reset token
   * @param newPassword - New password
   * @returns Promise<void>
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate new password
    const passwordValidation = PasswordService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error);
    }

    // Find reset token
    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        token: token,
        purpose: 'PASSWORD_RESET',
        expires_at: {
          gt: new Date(),
        },
        consumed_at: null,
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await PasswordService.hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.user_id },
      data: { password_hash: hashedPassword },
    });

    // Mark token as used
    await prisma.verificationToken.update({
      where: { id: resetToken.id },
      data: { consumed_at: new Date() },
    });

    // Revoke all existing sessions for security
    await SessionService.revokeAllUserSessions(resetToken.user_id);
  }
}
