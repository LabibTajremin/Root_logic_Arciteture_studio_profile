import type { Project } from '@/domain/entities/Project';
import type { ContentStatus } from '@/domain/entities/enums';
import type { Page, PageRequest } from '@/domain/repositories/pagination';

/** Composable filter (Specification) for project queries. */
export interface ProjectFilter {
  readonly status?: ContentStatus;
  readonly categoryId?: string;
  readonly isFeatured?: boolean;
  readonly year?: number;
  readonly search?: string;
}

export type NewProject = Omit<Project, 'createdAt' | 'updatedAt'>;
export type ProjectPatch = Partial<
  Omit<Project, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'createdBy'>
>;

/**
 * Persistence boundary for projects. All methods are tenant-scoped: every query is
 * filtered by `tenantId` in the implementation (integration-tested for isolation).
 */
export interface ProjectRepository {
  findById(tenantId: string, id: string): Promise<Project | null>;
  findBySlug(tenantId: string, slug: string): Promise<Project | null>;
  list(tenantId: string, filter: ProjectFilter, page: PageRequest): Promise<Page<Project>>;
  create(project: NewProject): Promise<Project>;
  update(tenantId: string, id: string, patch: ProjectPatch): Promise<Project>;
  delete(tenantId: string, id: string): Promise<void>;
  /** Persist a new fractional sort_order without rewriting siblings. */
  reorder(tenantId: string, id: string, sortOrder: number): Promise<void>;
}
