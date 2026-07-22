import type { Role } from '@/domain/entities/enums';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      tenantId: string;
      mustChangePassword: boolean;
    };
  }

  interface User {
    role: Role;
    tenantId: string;
    mustChangePassword: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid: string;
    role: Role;
    tenantId: string;
    mustChangePassword: boolean;
  }
}
