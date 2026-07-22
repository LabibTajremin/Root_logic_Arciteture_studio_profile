import type { ContentStatus } from '@/domain/entities/enums';

export interface MemberSocial {
  readonly platform: string;
  readonly url: string;
}

export interface Member {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly roleTitle: string | null;
  readonly bio: string | null;
  readonly photoMediaId: string | null;
  readonly socials: readonly MemberSocial[];
  readonly sortOrder: number;
  readonly status: ContentStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
