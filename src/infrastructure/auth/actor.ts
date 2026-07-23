import { auth } from '@/infrastructure/auth/auth';
import type { ActorContext } from '@/domain/entities/User';

/** Resolves the ActorContext from the current session, or null if unauthenticated. */
export async function getActor(): Promise<ActorContext | null> {
  const session = await auth();
  if (!session?.user) return null;
  return {
    userId: session.user.id,
    tenantId: session.user.tenantId,
    role: session.user.role,
  };
}
