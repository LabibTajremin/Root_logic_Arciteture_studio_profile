import { type Result, err, ok } from '@/domain/shared/Result';
import { NotFoundError, type DomainError } from '@/domain/errors/DomainError';
import { Authorization } from '@/application/authorization/Authorization';
import type { ActorContext } from '@/domain/entities/User';
import type { Project } from '@/domain/entities/Project';
import type { ProjectRepository } from '@/domain/repositories/ProjectRepository';
import type { SiteSettingsRepository } from '@/domain/repositories/SettingsRepository';
import type { ClockPort } from '@/application/ports/ClockPort';

export interface PublishProjectDeps {
  projects: ProjectRepository;
  site: SiteSettingsRepository;
  clock: ClockPort;
}

/**
 * Publishes a project. Enforced in the application layer: an editor cannot publish
 * directly while verification is required (that path goes through the approval queue).
 */
export class PublishProject {
  constructor(private readonly deps: PublishProjectDeps) {}

  async execute(actor: ActorContext, projectId: string): Promise<Result<Project, DomainError>> {
    const site = await this.deps.site.get(actor.tenantId);
    const verificationRequired = site?.editorVerificationRequired ?? true;

    const guard = Authorization.ensureCanPublishDirectly(actor, verificationRequired);
    if (!guard.ok) return guard;

    const project = await this.deps.projects.findById(actor.tenantId, projectId);
    if (!project) return err(new NotFoundError('Project', projectId));

    const updated = await this.deps.projects.update(actor.tenantId, projectId, {
      status: 'published',
      reviewedBy: actor.userId,
      reviewedAt: this.deps.clock.now(),
    });
    return ok(updated);
  }
}
