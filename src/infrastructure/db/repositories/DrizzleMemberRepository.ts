import { and, asc, eq } from 'drizzle-orm';
import { members } from '@/infrastructure/db/schema';
import { toMember } from '@/infrastructure/db/mappers/memberMapper';
import type { Db } from '@/infrastructure/db/repositories/types';
import type { Member } from '@/domain/entities/Member';
import type {
  MemberPatch,
  MemberRepository,
  NewMember,
} from '@/domain/repositories/MemberRepository';

export class DrizzleMemberRepository implements MemberRepository {
  constructor(private readonly db: Db) {}

  async findById(tenantId: string, id: string): Promise<Member | null> {
    const [row] = await this.db
      .select()
      .from(members)
      .where(and(eq(members.tenantId, tenantId), eq(members.id, id)))
      .limit(1);
    return row ? toMember(row) : null;
  }

  async listPublished(tenantId: string): Promise<readonly Member[]> {
    const rows = await this.db
      .select()
      .from(members)
      .where(and(eq(members.tenantId, tenantId), eq(members.status, 'published')))
      .orderBy(asc(members.sortOrder));
    return rows.map(toMember);
  }

  async listAll(tenantId: string): Promise<readonly Member[]> {
    const rows = await this.db
      .select()
      .from(members)
      .where(eq(members.tenantId, tenantId))
      .orderBy(asc(members.sortOrder));
    return rows.map(toMember);
  }

  async create(member: NewMember): Promise<Member> {
    // Domain uses readonly arrays; Drizzle insert expects a mutable copy.
    const [row] = await this.db
      .insert(members)
      .values({ ...member, socials: [...member.socials] })
      .returning();
    return toMember(row!);
  }

  async update(tenantId: string, id: string, patch: MemberPatch): Promise<Member> {
    const { socials, ...rest } = patch;
    const [row] = await this.db
      .update(members)
      .set({
        ...rest,
        ...(socials ? { socials: [...socials] } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(members.tenantId, tenantId), eq(members.id, id)))
      .returning();
    if (!row) throw new Error(`Member ${id} not found for tenant ${tenantId}`);
    return toMember(row);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(members).where(and(eq(members.tenantId, tenantId), eq(members.id, id)));
  }

  async reorder(tenantId: string, id: string, sortOrder: number): Promise<void> {
    await this.db
      .update(members)
      .set({ sortOrder, updatedAt: new Date() })
      .where(and(eq(members.tenantId, tenantId), eq(members.id, id)));
  }
}
