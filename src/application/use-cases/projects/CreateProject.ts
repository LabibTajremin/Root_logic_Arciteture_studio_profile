import { type Result, err, ok } from '@/domain/shared/Result';
import { ConflictError, ValidationError, type DomainError } from '@/domain/errors/DomainError';
import { createContentVisibilityPolicy } from '@/domain/services/ContentVisibilityPolicy';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { ForbiddenError } from '@/domain/errors/DomainError';
import { createProjectSchema, type CreateProjectInput } from '@/application/dto/projectDtos';
import type { ActorContext } from '@/domain/entities/User';
import type { Project } from '@/domain/entities/Project';
import type { ProjectRepository } from '@/domain/repositories/ProjectRepository';
import type { SiteSettingsRepository } from '@/domain/repositories/SettingsRepository';
import type { IdGeneratorPort } from '@/application/ports/IdGeneratorPort';
import type { ClockPort } from '@/application/ports/ClockPort';

export interface CreateProjectDeps {
  projects: ProjectRepository;
  site: SiteSettingsRepository;
  ids: IdGeneratorPort;
  clock: ClockPort;
}

/**
 * Creates a project. The resulting status is decided by ContentVisibilityPolicy from
 * the tenant's verification setting and the actor's role (admin publishes immediately;
 * an editor is queued for review when verification is on).
 */
export class CreateProject {
  constructor(private readonly deps: CreateProjectDeps) {}

  async execute(
    actor: ActorContext,
    input: CreateProjectInput,
  ): Promise<Result<Project, DomainError>> {
    if (!RolePolicy.canCreateContent(actor.role)) {
      return err(new ForbiddenError('You cannot create content'));
    }

    const parsed = createProjectSchema.safeParse(input);
    if (!parsed.success) {
      return err(new ValidationError(parsed.error.issues[0]?.message ?? 'Invalid project'));
    }
    const data = parsed.data;

    const existing = await this.deps.projects.findBySlug(actor.tenantId, data.slug);
    if (existing)
      return err(new ConflictError(`A project with slug "${data.slug}" already exists`));

    const site = await this.deps.site.get(actor.tenantId);
    const policy = createContentVisibilityPolicy(site?.editorVerificationRequired ?? true);
    const status = policy.statusForNewOrDraftEdit(actor.role);

    const project = await this.deps.projects.create({
      id: this.deps.ids.generate(),
      tenantId: actor.tenantId,
      slug: data.slug,
      title: data.title,
      summary: data.summary ?? null,
      body: data.body ?? null,
      categoryId: data.categoryId ?? null,
      status,
      isFeatured: data.isFeatured ?? false,
      sortOrder: this.deps.clock.now().getTime(),
      completedAt: data.completedAt ?? null,
      location: data.location ?? null,
      clientName: data.clientName ?? null,
      areaSqft: data.areaSqft ?? null,
      coverMediaId: data.coverMediaId ?? null,
      createdBy: actor.userId,
      reviewedBy: status === 'published' ? actor.userId : null,
      reviewedAt: status === 'published' ? this.deps.clock.now() : null,
    });

    return ok(project);
  }
}
