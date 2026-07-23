export const ROLES = ['admin', 'editor'] as const;
export type Role = (typeof ROLES)[number];

export const CONTENT_STATUSES = ['draft', 'pending_review', 'published', 'archived'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const MEDIA_TYPES = ['image', 'video'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];
