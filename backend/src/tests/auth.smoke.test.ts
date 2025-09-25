import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth';
import { SessionService } from '../services/session';

let prisma: PrismaClient;

/**
 * Smoke tests for authentication system
 * These are basic integration tests to verify core functionality
 */
describe('Authentication Smoke Tests', () => {
  beforeAll(async () => {
    prisma = new PrismaClient();
  });

  // Clean up before each test
  beforeEach(async () => {
    // Clean up test data
    await prisma.session.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@test.com',
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('User Registration', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'TestPassword123!',
        displayName: 'Test User',
      };

      const result = await AuthService.register(
        userData.email,
        userData.password,
        userData.displayName
      );

      expect(result.email).toBe(userData.email);
      expect(result.displayName).toBe(userData.displayName);
      expect(result.userId).toBeDefined();

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { id: result.userId },
      });

      expect(user).toBeTruthy();
      expect(user?.email).toBe(userData.email);
      expect(user?.display_name).toBe(userData.displayName);
      expect(user?.status).toBe('PENDING');
    });

    it('should reject weak passwords', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'weak',
        displayName: 'Test User',
      };

      await expect(
        AuthService.register(userData.email, userData.password, userData.displayName)
      ).rejects.toThrow('Password must be at least 8 characters long');
    });

    it('should reject duplicate emails', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'TestPassword123!',
        displayName: 'Test User',
      };

      // Create first user
      await AuthService.register(userData.email, userData.password, userData.displayName);

      // Try to create duplicate
      await expect(
        AuthService.register(userData.email, userData.password, userData.displayName)
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create a test user
      await AuthService.register(
        'test@test.com',
        'TestPassword123!',
        'Test User'
      );
    });

    it('should login with correct credentials', async () => {
      const result = await AuthService.login(
        'test@test.com',
        'TestPassword123!',
        'Test User Agent',
        '127.0.0.1'
      );

      expect(result.user.email).toBe('test@test.com');
      expect(result.sessionToken).toBeDefined();
      expect(result.user.password_hash).toBeUndefined();
    });

    it('should reject incorrect password', async () => {
      await expect(
        AuthService.login('test@test.com', 'WrongPassword123!')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject non-existent email', async () => {
      await expect(
        AuthService.login('nonexistent@test.com', 'TestPassword123!')
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('Session Management', () => {
    let sessionToken: string;

    beforeEach(async () => {
      // Create user and login
      await AuthService.register(
        'test@test.com',
        'TestPassword123!',
        'Test User'
      );

      const loginResult = await AuthService.login(
        'test@test.com',
        'TestPassword123!'
      );
      sessionToken = loginResult.sessionToken;
    });

    it('should validate active session', async () => {
      const user = await AuthService.getCurrentUser(sessionToken);
      expect(user).toBeTruthy();
      expect(user.email).toBe('test@test.com');
    });

    it('should invalidate session on logout', async () => {
      await AuthService.logout(sessionToken);
      
      const user = await AuthService.getCurrentUser(sessionToken);
      expect(user).toBeNull();
    });

    it('should rotate sessions on new login', async () => {
      const firstLogin = await AuthService.login(
        'test@test.com',
        'TestPassword123!'
      );
      const firstToken = firstLogin.sessionToken;

      const secondLogin = await AuthService.login(
        'test@test.com',
        'TestPassword123!'
      );
      const secondToken = secondLogin.sessionToken;

      // First session should be invalidated
      expect(await AuthService.getCurrentUser(firstToken)).toBeNull();
      
      // Second session should work
      expect(await AuthService.getCurrentUser(secondToken)).toBeTruthy();
    });
  });

  describe('Domain CRUD with Foreign Keys', () => {
    let userId: string;

    beforeEach(async () => {
      // Create user
      const userResult = await AuthService.register(
        'test@test.com',
        'TestPassword123!',
        'Test User'
      );
      userId = userResult.userId;
    });

    it('should create library with user foreign key', async () => {
      const library = await prisma.library.create({
        data: {
          name: 'Test Library',
          description: 'Test Description',
          user_id: userId,
        },
      });

      expect(library.id).toBeDefined();
      expect(library.user_id).toBe(userId);
      expect(library.name).toBe('Test Library');
    });

    it('should create book with library foreign key', async () => {
      // Create library first
      const library = await prisma.library.create({
        data: {
          name: 'Test Library',
          description: 'Test Description',
          user_id: userId,
        },
      });

      // Create book
      const book = await prisma.book.create({
        data: {
          title: 'Test Book',
          description: 'Test Book Description',
          library_id: library.id,
          user_id: userId,
        },
      });

      expect(book.id).toBeDefined();
      expect(book.library_id).toBe(library.id);
      expect(book.user_id).toBe(userId);
    });

    it('should create chapter with book foreign key', async () => {
      // Create library
      const library = await prisma.library.create({
        data: {
          name: 'Test Library',
          description: 'Test Description',
          user_id: userId,
        },
      });

      // Create book
      const book = await prisma.book.create({
        data: {
          title: 'Test Book',
          description: 'Test Book Description',
          library_id: library.id,
          user_id: userId,
        },
      });

      // Create chapter
      const chapter = await prisma.chapter.create({
        data: {
          title: 'Test Chapter',
          content: 'Test Chapter Content',
          book_id: book.id,
          user_id: userId,
        },
      });

      expect(chapter.id).toBeDefined();
      expect(chapter.book_id).toBe(book.id);
      expect(chapter.user_id).toBe(userId);
    });
  });
});
