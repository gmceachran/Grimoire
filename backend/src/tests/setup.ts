// Jest setup file
// This runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST || 'postgresql://gmceachran:password123@localhost:5432/grimoire_dev';

// Increase timeout for database operations
jest.setTimeout(30000);
