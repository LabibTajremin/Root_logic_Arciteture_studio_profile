import type { InferSelectModel } from 'drizzle-orm';
import type { members } from '@/infrastructure/db/schema';
import type { Member } from '@/domain/entities/Member';
import type { ContentStatus } from '@/domain/entities/enums';

type MemberRow = InferSelectModel<typeof members>;

export function toMember(row: MemberRow): Member {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    roleTitle: row.roleTitle,
    bio: row.bio,
    photoMediaId: row.photoMediaId,
    socials: row.socials,
    sortOrder: row.sortOrder,
    status: row.status as ContentStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
