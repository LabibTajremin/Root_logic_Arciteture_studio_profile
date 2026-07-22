import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DrizzleUnitOfWork } from '@/infrastructure/db/DrizzleUnitOfWork';
import type { NewProject } from '@/domain/repositories/ProjectRepository';
import { closeTestDb, cleanupTenant, createTenant, getTestDb } from './helpers/testDb';

const db = getTestDb();
const uow = new DrizzleUnitOfWork(db);

let tenantId: string;
let userId: string;

function draft(slug: string): NewProject {
  return {
    id: crypto.randomUUID(),
    tenantId,
    slug,
    title: slug,
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

describe('DrizzleUnitOfWork', () => {
  it('commits all writes when the callback succeeds', async () => {
    await uow.run(async (repos) => {
      await repos.projects.create(draft('uow-commit-1'));
      await repos.projects.create(draft('uow-commit-2'));
    });
    const one = await new (
      await import('@/infrastructure/db/repositories/DrizzleProjectRepository')
    ).DrizzleProjectRepository(db).findBySlug(tenantId, 'uow-commit-1');
    expect(one).not.toBeNull();
  });

  it('rolls back every write when the callback throws', async () => {
    const repo = new (
      await import('@/infrastructure/db/repositories/DrizzleProjectRepository')
    ).DrizzleProjectRepository(db);

    await expect(
      uow.run(async (repos) => {
        await repos.projects.create(draft('uow-rollback-1'));
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    // The first insert must have been rolled back.
    expect(await repo.findBySlug(tenantId, 'uow-rollback-1')).toBeNull();
  });
});
