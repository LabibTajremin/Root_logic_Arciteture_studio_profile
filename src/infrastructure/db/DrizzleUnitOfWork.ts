import { DrizzleProjectRepository } from '@/infrastructure/db/repositories/DrizzleProjectRepository';
import { DrizzleMediaAssetRepository } from '@/infrastructure/db/repositories/DrizzleMediaAssetRepository';
import { DrizzleMemberRepository } from '@/infrastructure/db/repositories/DrizzleMemberRepository';
import { DrizzleUserRepository } from '@/infrastructure/db/repositories/DrizzleUserRepository';
import type { Db } from '@/infrastructure/db/repositories/types';
import type { RepositoryRegistry, UnitOfWork } from '@/domain/repositories/UnitOfWork';

/**
 * Runs a use case's writes inside a single Drizzle transaction. If the callback
 * throws, the transaction rolls back and no partial state persists.
 */
export class DrizzleUnitOfWork implements UnitOfWork {
  constructor(private readonly db: Db) {}

  run<T>(work: (repos: RepositoryRegistry) => Promise<T>): Promise<T> {
    return this.db.transaction((tx) => work(buildRegistry(tx as Db)));
  }
}

export function buildRegistry(db: Db): RepositoryRegistry {
  return {
    projects: new DrizzleProjectRepository(db),
    media: new DrizzleMediaAssetRepository(db),
    members: new DrizzleMemberRepository(db),
    users: new DrizzleUserRepository(db),
  };
}
