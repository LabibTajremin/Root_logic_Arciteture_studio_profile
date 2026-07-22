import type { ContentStatus } from '@/domain/entities/enums';

export interface Project {
  readonly id: string;
  readonly tenantId: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string | null;
  readonly body: string | null;
  readonly categoryId: string | null;
  readonly status: ContentStatus;
  readonly isFeatured: boolean;
  readonly sortOrder: number;
  readonly completedAt: Date | null;
  readonly location: string | null;
  readonly clientName: string | null;
  readonly areaSqft: number | null;
  readonly coverMediaId: string | null;
  readonly createdBy: string;
  readonly reviewedBy: string | null;
  readonly reviewedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
