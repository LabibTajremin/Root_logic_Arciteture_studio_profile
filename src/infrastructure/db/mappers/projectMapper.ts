import type { InferSelectModel } from 'drizzle-orm';
import type { projects } from '@/infrastructure/db/schema';
import type { Project } from '@/domain/entities/Project';
import type { ContentStatus } from '@/domain/entities/enums';

type ProjectRow = InferSelectModel<typeof projects>;

export function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    tenantId: row.tenantId,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    categoryId: row.categoryId,
    status: row.status as ContentStatus,
    isFeatured: row.isFeatured,
    sortOrder: row.sortOrder,
    completedAt: row.completedAt,
    location: row.location,
    clientName: row.clientName,
    areaSqft: row.areaSqft,
    coverMediaId: row.coverMediaId,
    createdBy: row.createdBy,
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
