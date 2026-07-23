import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe auth config shared by middleware and the Node handler. Contains no DB or
 * argon2 access, so it can run in the edge middleware runtime. The Credentials provider
 * (which needs the DB) is added in auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.uid = user.id!;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.uid;
      session.user.role = token.role;
      session.user.tenantId = token.tenantId;
      session.user.mustChangePassword = token.mustChangePassword;
      return session;
    },
    /**
     * Middleware authorisation. Enforces:
     *  - any /admin route requires a session
     *  - /admin/users is admin-only (editors are blocked)
     */
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (!pathname.startsWith('/admin')) return true;

      const role = auth?.user?.role;
      if (!role) return false; // not signed in → redirect to /login

      if (pathname.startsWith('/admin/users') && role !== 'admin') {
        return false;
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
