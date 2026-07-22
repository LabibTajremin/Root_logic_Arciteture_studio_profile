import { describe, expect, it } from 'vitest';
import { createContentVisibilityPolicy } from '@/domain/services/ContentVisibilityPolicy';

describe('ContentVisibilityPolicy — verification OFF (auto-publish)', () => {
  const policy = createContentVisibilityPolicy(false);

  it('selects the auto-publish strategy', () => {
    expect(policy.name).toBe('auto-publish');
  });

  it('publishes new/draft content immediately for both roles', () => {
    expect(policy.statusForNewOrDraftEdit('admin')).toBe('published');
    expect(policy.statusForNewOrDraftEdit('editor')).toBe('published');
  });

  it('applies edits to published content live for both roles', () => {
    expect(policy.editOfPublished('admin')).toBe('apply-live');
    expect(policy.editOfPublished('editor')).toBe('apply-live');
  });
});

describe('ContentVisibilityPolicy — verification ON (verification-required)', () => {
  const policy = createContentVisibilityPolicy(true);

  it('selects the verification-required strategy', () => {
    expect(policy.name).toBe('verification-required');
  });

  it('publishes admin content immediately', () => {
    expect(policy.statusForNewOrDraftEdit('admin')).toBe('published');
  });

  it('queues editor content for review', () => {
    expect(policy.statusForNewOrDraftEdit('editor')).toBe('pending_review');
  });

  it('applies admin edits to published content live', () => {
    expect(policy.editOfPublished('admin')).toBe('apply-live');
  });

  it('stores editor edits to published content as a pending revision', () => {
    expect(policy.editOfPublished('editor')).toBe('pending-revision');
  });
});
