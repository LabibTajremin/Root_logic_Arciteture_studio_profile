import type { Member } from '@/domain/entities/Member';

export type NewMember = Omit<Member, 'createdAt' | 'updatedAt'>;
export type MemberPatch = Partial<Omit<Member, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>;

export interface MemberRepository {
  findById(tenantId: string, id: string): Promise<Member | null>;
  listPublished(tenantId: string): Promise<readonly Member[]>;
  listAll(tenantId: string): Promise<readonly Member[]>;
  create(member: NewMember): Promise<Member>;
  update(tenantId: string, id: string, patch: MemberPatch): Promise<Member>;
  delete(tenantId: string, id: string): Promise<void>;
  reorder(tenantId: string, id: string, sortOrder: number): Promise<void>;
}
