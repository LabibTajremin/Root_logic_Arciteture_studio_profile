import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DrizzleProjectRepository } from '@/infrastructure/db/repositories/DrizzleProjectRepository';
import type { NewProject } from '@/domain/repositories/ProjectRepository';
import { closeTestDb, cleanupTenant, createTenant, getTestDb } from './helpers/testDb';

const db = getTestDb();
const repo = new DrizzleProjectRepository(db);

let tenantA: { tenantId: string; userId: string };
let tenantB: { tenantId: string; userId: string };

function draft(tenantId: string, userId: string, slug: string, title: string): NewProject {
  return {
    id: crypto.randomUUID(),
    tenantId,
    slug,
    title,
    summary: null,
    body: null,
    categoryId: null,
    status: 'published',
    isFeatured: false,
    sortOrder: 0,
    completedAt: null,
    location: null,
    clientName: null,
    areaSqft: null,
    coverMediaId: null,
    createdBy: userId,
    reviewedBy: null,
    reviewedAt: null,
  };
}

beforeAll(async () => {
  tenantA = await createTenant(db);
  tenantB = await createTenant(db);
});

afterAll(async () => {
  await cleanupTenant(db, tenantA.tenantId);
  await cleanupTenant(db, tenantB.tenantId);
  await closeTestDb();
});

describe('cross-tenant isolation', () => {
  it('never returns another tenant’s rows through the repository', async () => {
    const aProj = await repo.create(
      draft(tenantA.tenantId, tenantA.userId, 'shared-slug', 'Tenant A Project'),
    );
    // Same slug in tenant B is allowed because uniqueness is (tenant_id, slug).
    const bProj = await repo.create(
      draft(tenantB.tenantId, tenantB.userId, 'shared-slug', 'Tenant B Project'),
    );

    // A's listing must contain only A's row.
    const aList = await repo.list(tenantA.tenantId, {}, { limit: 100 });
    expect(aList.items.some((p) => p.id === aProj.id)).toBe(true);
    expect(aList.items.some((p) => p.id === bProj.id)).toBe(false);
    expect(aList.items.every((p) => p.tenantId === tenantA.tenantId)).toBe(true);

    // Fetching B's project under A's tenant id returns nothing.
    expect(await repo.findById(tenantA.tenantId, bProj.id)).toBeNull();

    // Same slug resolves to each tenant's own project, never the other's.
    const aBySlug = await repo.findBySlug(tenantA.tenantId, 'shared-slug');
    const bBySlug = await repo.findBySlug(tenantB.tenantId, 'shared-slug');
    expect(aBySlug?.id).toBe(aProj.id);
    expect(bBySlug?.id).toBe(bProj.id);
  });

  it('does not update across tenants', async () => {
    const bProj = await repo.create(draft(tenantB.tenantId, tenantB.userId, 'b-only', 'B Only'));
    // Attempting to update B's project scoped to A must fail (no row matched).
    await expect(repo.update(tenantA.tenantId, bProj.id, { title: 'Hacked' })).rejects.toThrow();
    const untouched = await repo.findById(tenantB.tenantId, bProj.id);
    expect(untouched?.title).toBe('B Only');
  });
});
