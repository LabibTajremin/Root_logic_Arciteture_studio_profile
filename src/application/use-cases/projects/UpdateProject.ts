import { type Result, err, ok } from '@/domain/shared/Result';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
  type DomainError,
} from '@/domain/errors/DomainError';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { createContentVisibilityPolicy } from '@/domain/services/ContentVisibilityPolicy';
import { updateProjectSchema, type UpdateProjectInput } from '@/application/dto/projectDtos';
import type { ActorContext } from '@/domain/entities/User';
import type { Project } from '@/domain/entities/Project';
import type { ProjectRepository, ProjectPatch } from '@/domain/repositories/ProjectRepository';
import type { SiteSettingsRepository } from '@/domain/repositories/SettingsRepository';

export interface UpdateProjectDeps {
  projects: ProjectRepository;
  site: SiteSettingsRepository;
}

/**
 * Updates a project. If an editor edits an already-published item while verification is
 * on, the change is not applied live (it would become a pending revision — handled by
 * the approval workflow); here we refuse the direct live edit.
 */
export class UpdateProject {
  constructor(private readonly deps: UpdateProjectDeps) {}

  async execute(
    actor: ActorContext,
    input: UpdateProjectInput,
  ): Promise<Result<Project, DomainError>> {
    if (!RolePolicy.canCreateContent(actor.role)) {
      return err(new ForbiddenError('You cannot edit content'));
    }
    const parsed = updateProjectSchema.safeParse(input);
    if (!parsed.success) {
      return err(new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid project'));
    }
    const { id, ...fields } = parsed.data;

    const project = await this.deps.projects.findById(actor.tenantId, id);
    if (!project) return err(new NotFoundError('Project', id));

    if (project.status === 'published') {
      const site = await this.deps.site.get(actor.tenantId);
      const policy = createContentVisibilityPolicy(site?.editorVerificationRequired ?? true);
      if (policy.editOfPublished(actor.role) === 'pending-revision') {
        return err(
          new ForbiddenError(
            'Editing a published item requires review — submit it through the approval queue',
          ),
        );
      }
    }

    const patch: ProjectPatch = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) (patch as Record<string, unknown>)[key] = value;
    }

    const updated = await this.deps.projects.update(actor.tenantId, id, patch);
    return ok(updated);
  }
}
