import type { Role } from '@/domain/entities/enums';
import type { ContentStatus } from '@/domain/entities/enums';

/**
 * How an edit to an already-published item is handled.
 *  - 'apply-live'       → the change is applied to the live item immediately.
 *  - 'pending-revision' → the change is stored as a revision; the live version stays
 *                          up until an admin approves it.
 */
export type PublishedEditMode = 'apply-live' | 'pending-revision';

/**
 * Strategy interface. Two concrete strategies are selected from
 * `site_settings.editor_verification_required`.
 */
export interface ContentVisibilityStrategy {
  readonly name: 'auto-publish' | 'verification-required';
  /** Resulting status when `role` creates or edits a not-yet-published item. */
  statusForNewOrDraftEdit(role: Role): ContentStatus;
  /** What happens when `role` edits an already-published item. */
  editOfPublished(role: Role): PublishedEditMode;
}

/** Verification OFF: everyone publishes immediately; edits apply live. */
class AutoPublishStrategy implements ContentVisibilityStrategy {
  readonly name = 'auto-publish' as const;

  statusForNewOrDraftEdit(_role: Role): ContentStatus {
    return 'published';
  }

  editOfPublished(_role: Role): PublishedEditMode {
    return 'apply-live';
  }
}

/**
 * Verification ON: admins publish immediately; editors' new content is queued for
 * review, and editors' edits to published items become pending revisions.
 */
class VerificationRequiredStrategy implements ContentVisibilityStrategy {
  readonly name = 'verification-required' as const;

  statusForNewOrDraftEdit(role: Role): ContentStatus {
    return role === 'admin' ? 'published' : 'pending_review';
  }

  editOfPublished(role: Role): PublishedEditMode {
    return role === 'admin' ? 'apply-live' : 'pending-revision';
  }
}

/**
 * Factory selecting the strategy from the tenant's verification setting.
 * This is the single place that decision is made.
 */
export function createContentVisibilityPolicy(
  verificationRequired: boolean,
): ContentVisibilityStrategy {
  return verificationRequired ? new VerificationRequiredStrategy() : new AutoPublishStrategy();
}
