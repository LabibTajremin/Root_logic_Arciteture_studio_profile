import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { authConfig } from '@/infrastructure/auth/auth.config';
import { verifyPassword } from '@/infrastructure/auth/password';
import { loginRateLimiter } from '@/infrastructure/auth/RateLimiter';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getDb } from '@/infrastructure/db/client';
import { DrizzleUserRepository } from '@/infrastructure/db/repositories/DrizzleUserRepository';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Rate-limit by email; blocks brute-force before touching the password hash.
        if (!loginRateLimiter.check(email.toLowerCase()).allowed) return null;

        const tenantId = await resolveActiveTenantId();
        if (!tenantId) return null;

        const users = new DrizzleUserRepository(getDb());
        const user = await users.findByEmail(tenantId, email);
        if (!user || !user.isActive) return null;

        const ok = await verifyPassword(user.passwordHash, password);
        if (!ok) return null;

        loginRateLimiter.reset(email.toLowerCase());
        await users.update(tenantId, user.id, { lastLoginAt: new Date() });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
});
