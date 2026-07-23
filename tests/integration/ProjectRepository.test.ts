import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DrizzleProjectRepository } from '@/infrastructure/db/repositories/DrizzleProjectRepository';
import type { NewProject } from '@/domain/repositories/ProjectRepository';
import { closeTestDb, cleanupTenant, createTenant, getTestDb } from './helpers/testDb';

const db = getTestDb();
const repo = new DrizzleProjectRepository(db);

let tenantId: string;
let userId: string;

function draft(overrides: Partial<NewProject>): NewProject {
  return {
    id: crypto.randomUUID(),
    tenantId,
    slug: `p-${crypto.randomUUID().slice(0, 8)}`,
    title: 'Untitled',
    summary: null,
    body: null,
    categoryId: null,
    status: 'draft',
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
    ...overrides,
  };
}

beforeAll(async () => {
  const t = await createTenant(db);
  tenantId = t.tenantId;
  userId = t.userId;
});

afterAll(async () => {
  await cleanupTenant(db, tenantId);
  await closeTestDb();
});

describe('DrizzleProjectRepository', () => {
  it('creates and reads back a project by id and slug', async () => {
    const created = await repo.create(draft({ title: 'Villa', slug: 'villa-x' }));
    expect(created.title).toBe('Villa');

    const byId = await repo.findById(tenantId, created.id);
    const bySlug = await repo.findBySlug(tenantId, 'villa-x');
    expect(byId?.id).toBe(created.id);
    expect(bySlug?.id).toBe(created.id);
  });

  it('updates a project', async () => {
    const created = await repo.create(draft({ title: 'Old' }));
    const updated = await repo.update(tenantId, created.id, { title: 'New', status: 'published' });
    expect(updated.title).toBe('New');
    expect(updated.status).toBe('published');
  });

  it('filters by status and featured', async () => {
    await repo.create(draft({ status: 'published', isFeatured: true }));
    await repo.create(draft({ status: 'draft' }));

    const published = await repo.list(tenantId, { status: 'published' }, { limit: 50 });
    expect(published.items.every((p) => p.status === 'published')).toBe(true);

    const featured = await repo.list(tenantId, { isFeatured: true }, { limit: 50 });
    expect(featured.items.every((p) => p.isFeatured)).toBe(true);
  });

  it('paginates by keyset without repeating rows', async () => {
    // Ensure a known set of rows exist for this tenant.
    for (let i = 0; i < 5; i++) {
      await repo.create(draft({ title: `Keyset ${i}` }));
    }
    const first = await repo.list(tenantId, {}, { limit: 3 });
    expect(first.items).toHaveLength(3);
    expect(first.nextCursor).not.toBeNull();

    const second = await repo.list(tenantId, {}, { limit: 3, after: first.nextCursor! });
    const firstIds = new Set(first.items.map((p) => p.id));
    for (const p of second.items) {
      expect(firstIds.has(p.id)).toBe(false);
    }
  });

  it('finds a project by full-text search', async () => {
    await repo.create(draft({ title: 'Lakeside Pavilion', summary: 'timber and glass' }));
    const found = await repo.list(tenantId, { search: 'pavilion' }, { limit: 10 });
    expect(found.items.some((p) => p.title === 'Lakeside Pavilion')).toBe(true);
  });
});
