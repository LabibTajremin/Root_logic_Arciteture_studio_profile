import type { ProjectRepository } from '@/domain/repositories/ProjectRepository';
import type { MediaAssetRepository } from '@/domain/repositories/MediaAssetRepository';
import type { MemberRepository } from '@/domain/repositories/MemberRepository';
import type { UserRepository } from '@/domain/repositories/UserRepository';

/** Repositories bound to a single transaction, handed to a use case's work callback. */
export interface RepositoryRegistry {
  readonly projects: ProjectRepository;
  readonly media: MediaAssetRepository;
  readonly members: MemberRepository;
  readonly users: UserRepository;
}

/**
 * Unit of Work: runs a use case's writes inside one transaction. Used whenever a use
 * case mutates more than one aggregate, so partial writes never persist.
 */
export interface UnitOfWork {
  run<T>(work: (repos: RepositoryRegistry) => Promise<T>): Promise<T>;
}
