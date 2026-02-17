import { db } from '../../db/index.js';
import { users, orgs, apiKeys, type User, type ApiKey } from '../../db/schema/index.js';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export class AuthService {
  async createUser(data: {
    email: string;
    password: string;
    name?: string;
    orgName: string;
  }): Promise<{ user: User; org: any }> {
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create organization first
    const [org] = await db
      .insert(orgs)
      .values({
        name: data.orgName,
        slug: this.generateSlug(data.orgName),
        plan: 'free',
        creditBalance: '1000', // $10 free credits (stored as string for numeric type)
      })
      .returning();

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash,
        name: data.name,
        orgId: org.id,
        role: 'owner',
        emailVerified: false,
      })
      .returning();

    return { user, org };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      console.log('[AuthService] User not found:', email);
      return null;
    }

    console.log('[AuthService] Comparing password for user:', email);
    console.log('[AuthService] Password length:', password.length);
    console.log('[AuthService] Hash length:', user.passwordHash.length);
    console.log('[AuthService] First 10 chars of password:', password.substring(0, 10));
    console.log('[AuthService] First 20 chars of hash:', user.passwordHash.substring(0, 20));
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log('[AuthService] Password valid:', isValid);
    
    if (!isValid) {
      return null;
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    return user;
  }

  async createApiKey(data: {
    name: string;
    userId: string;
    orgId: string;
    permissions?: string[];
    expiresAt?: Date;
  }): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const plainKey = `${process.env.API_KEY_PREFIX || 'sk-air'}-${nanoid(32)}`;
    const keyHash = await bcrypt.hash(plainKey, 10);

    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        key: plainKey,
        keyHash,
        name: data.name,
        userId: data.userId,
        orgId: data.orgId,
        permissions: data.permissions || ['read', 'write'],
        expiresAt: data.expiresAt,
        isActive: true,
      })
      .returning();

    return { apiKey, plainKey };
  }

  async validateApiKey(key: string): Promise<(ApiKey & { org: any; user: User }) | null> {
    const [apiKey] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, key))
      .limit(1);

    if (!apiKey) {
      return null;
    }

    // Check if key is active
    if (!apiKey.isActive) {
      return null;
    }

    // Check if key is expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Get org and user
    const [org] = await db.select().from(orgs).where(eq(orgs.id, apiKey.orgId)).limit(1);
    const [user] = await db.select().from(users).where(eq(users.id, apiKey.userId)).limit(1);

    if (!org || !user) {
      return null;
    }

    // Update last used timestamp
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey.id));

    return { ...apiKey, org, user };
  }

  async revokeApiKey(keyId: string, orgId: string): Promise<void> {
    // Delete the API key if it belongs to the user's organization (security check)
    await db
      .delete(apiKeys)
      .where(and(eq(apiKeys.id, keyId), eq(apiKeys.orgId, orgId)));
  }

  async listApiKeys(orgId: string): Promise<ApiKey[]> {
    // Only return active API keys
    return db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.orgId, orgId), eq(apiKeys.isActive, true)));
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }
}

