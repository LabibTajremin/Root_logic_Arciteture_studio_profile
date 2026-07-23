import { and, desc, eq, sql } from 'drizzle-orm';
import { projects } from '@/infrastructure/db/schema';
import { toProject } from '@/infrastructure/db/mappers/projectMapper';
import type { Db } from '@/infrastructure/db/repositories/types';
import type { Project } from '@/domain/entities/Project';
import type {
  NewProject,
  ProjectFilter,
  ProjectPatch,
  ProjectRepository,
} from '@/domain/repositories/ProjectRepository';
import type { Cursor, Page, PageRequest } from '@/domain/repositories/pagination';

/**
 * Drizzle-backed project repository. Every query is filtered by tenantId (isolation),
 * uses keyset pagination on (created_at, id), and never selects with SELECT *.
 */
export class DrizzleProjectRepository implements ProjectRepository {
  constructor(private readonly db: Db) {}

  async findById(tenantId: string, id: string): Promise<Project | null> {
    const [row] = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.tenantId, tenantId), eq(projects.id, id)))
      .limit(1);
    return row ? toProject(row) : null;
  }

  async findBySlug(tenantId: string, slug: string): Promise<Project | null> {
    const [row] = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.tenantId, tenantId), eq(projects.slug, slug)))
      .limit(1);
    return row ? toProject(row) : null;
  }

  async list(tenantId: string, filter: ProjectFilter, page: PageRequest): Promise<Page<Project>> {
    const conditions = [eq(projects.tenantId, tenantId)];

    if (filter.status) conditions.push(eq(projects.status, filter.status));
    if (filter.categoryId) conditions.push(eq(projects.categoryId, filter.categoryId));
    if (filter.isFeatured !== undefined)
      conditions.push(eq(projects.isFeatured, filter.isFeatured));
    if (filter.year !== undefined) {
      conditions.push(sql`extract(year from ${projects.completedAt}) = ${filter.year}`);
    }
    if (filter.search) {
      conditions.push(
        sql`to_tsvector('english', ${projects.title} || ' ' || coalesce(${projects.summary}, '')) @@ plainto_tsquery('english', ${filter.search})`,
      );
    }
    if (page.after) {
      // Keyset: strictly older than the cursor in (created_at, id) descending order.
      // Explicit casts let Postgres infer parameter types inside the row comparison.
      conditions.push(
        sql`(${projects.createdAt}, ${projects.id}) < (${page.after.createdAt.toISOString()}::timestamptz, ${page.after.id}::uuid)`,
      );
    }

    const rows = await this.db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(desc(projects.createdAt), desc(projects.id))
      .limit(page.limit + 1);

    const hasMore = rows.length > page.limit;
    const pageRows = hasMore ? rows.slice(0, page.limit) : rows;
    const last = pageRows.at(-1);
    const nextCursor: Cursor | null =
      hasMore && last ? { createdAt: last.createdAt, id: last.id } : null;

    return { items: pageRows.map(toProject), nextCursor };
  }

  async create(project: NewProject): Promise<Project> {
    const [row] = await this.db.insert(projects).values(project).returning();
    return toProject(row!);
  }

  async update(tenantId: string, id: string, patch: ProjectPatch): Promise<Project> {
    const [row] = await this.db
      .update(projects)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(projects.tenantId, tenantId), eq(projects.id, id)))
      .returning();
    if (!row) throw new Error(`Project ${id} not found for tenant ${tenantId}`);
    return toProject(row);
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db.delete(projects).where(and(eq(projects.tenantId, tenantId), eq(projects.id, id)));
  }

  async reorder(tenantId: string, id: string, sortOrder: number): Promise<void> {
    await this.db
      .update(projects)
      .set({ sortOrder, updatedAt: new Date() })
      .where(and(eq(projects.tenantId, tenantId), eq(projects.id, id)));
  }
}
