import { getDb } from '@/infrastructure/db/client';
import { DrizzleProjectRepository } from '@/infrastructure/db/repositories/DrizzleProjectRepository';
import { DrizzleMemberRepository } from '@/infrastructure/db/repositories/DrizzleMemberRepository';
import { DrizzleMediaAssetRepository } from '@/infrastructure/db/repositories/DrizzleMediaAssetRepository';
import { DrizzleUserRepository } from '@/infrastructure/db/repositories/DrizzleUserRepository';
import { DrizzleSiteSettingsRepository } from '@/infrastructure/db/repositories/DrizzleSiteSettingsRepository';
import { DrizzleInquiryRepository } from '@/infrastructure/db/repositories/DrizzleInquiryRepository';
import { CryptoIdGenerator, SystemClock } from '@/infrastructure/system/adapters';
import { CreateProject } from '@/application/use-cases/projects/CreateProject';
import { UpdateProject } from '@/application/use-cases/projects/UpdateProject';
import { PublishProject } from '@/application/use-cases/projects/PublishProject';
import { SubmitInquiry } from '@/application/use-cases/inquiries/SubmitInquiry';

/**
 * Composition root — a small manual DI container (no framework). Use cases receive
 * their dependencies here; delivery code (server actions/routes) asks the container for
 * a use case and never news up a repository itself.
 */
export function createContainer() {
  const db = getDb();
  const projects = new DrizzleProjectRepository(db);
  const members = new DrizzleMemberRepository(db);
  const media = new DrizzleMediaAssetRepository(db);
  const users = new DrizzleUserRepository(db);
  const site = new DrizzleSiteSettingsRepository(db);
  const inquiries = new DrizzleInquiryRepository(db);
  const ids = new CryptoIdGenerator();
  const clock = new SystemClock();

  return {
    repositories: { projects, members, media, users, site, inquiries },
    useCases: {
      createProject: new CreateProject({ projects, site, ids, clock }),
      updateProject: new UpdateProject({ projects, site }),
      publishProject: new PublishProject({ projects, site, clock }),
      submitInquiry: new SubmitInquiry({ inquiries, ids }),
    },
  };
}

export type Container = ReturnType<typeof createContainer>;
