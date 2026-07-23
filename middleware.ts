import NextAuth from 'next-auth';
import { authConfig } from '@/infrastructure/auth/auth.config';

// Edge middleware uses the DB-free config to gate /admin routes.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/admin/:path*'],
};
