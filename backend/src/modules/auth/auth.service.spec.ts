import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let authService: AuthService;

  beforeAll(() => {
    authService = new AuthService();
  });

  describe('createUser', () => {
    it('should create a user with organization', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
        orgName: 'Test Org',
      };

      const result = await authService.createUser(userData);

      expect(result.user).toBeDefined();
      expect(result.org).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.name).toBe(userData.name);
      expect(result.org.name).toBe(userData.orgName);
      expect(result.user.role).toBe('owner');
    });

    it('should hash the password', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
        orgName: 'Test Org',
      };

      const result = await authService.createUser(userData);

      expect(result.user.passwordHash).toBeDefined();
      expect(result.user.passwordHash).not.toBe(userData.password);
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      const email = `test-${Date.now()}@example.com`;
      const password = 'password123';

      await authService.createUser({
        email,
        password,
        name: 'Test User',
        orgName: 'Test Org',
      });

      const user = await authService.validateUser(email, password);

      expect(user).toBeDefined();
      expect(user?.email).toBe(email);
    });

    it('should return null for invalid credentials', async () => {
      const user = await authService.validateUser('nonexistent@example.com', 'wrongpassword');

      expect(user).toBeNull();
    });
  });

  describe('createApiKey', () => {
    it('should create an API key', async () => {
      const { user, org } = await authService.createUser({
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
        orgName: 'Test Org',
      });

      const result = await authService.createApiKey({
        name: 'Test API Key',
        userId: user.id,
        orgId: org.id,
        permissions: ['read', 'write'],
      });

      expect(result.apiKey).toBeDefined();
      expect(result.plainKey).toBeDefined();
      expect(result.plainKey).toContain('sk-air-');
      expect(result.apiKey.name).toBe('Test API Key');
      expect(result.apiKey.isActive).toBe(true);
    });
  });

  describe('validateApiKey', () => {
    it('should validate a valid API key', async () => {
      const { user, org } = await authService.createUser({
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Test User',
        orgName: 'Test Org',
      });

      const { plainKey } = await authService.createApiKey({
        name: 'Test API Key',
        userId: user.id,
        orgId: org.id,
      });

      const validated = await authService.validateApiKey(plainKey);

      expect(validated).toBeDefined();
      expect(validated?.user.id).toBe(user.id);
      expect(validated?.org.id).toBe(org.id);
    });

    it('should return null for invalid API key', async () => {
      const validated = await authService.validateApiKey('invalid-key');

      expect(validated).toBeNull();
    });
  });
});

