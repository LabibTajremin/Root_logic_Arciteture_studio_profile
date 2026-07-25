import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  smallint,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { idColumn, tenantIdColumn, timestamps } from '@/infrastructure/db/schema/_common';

export const heroSlides = pgTable(
  'hero_slides',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    eyebrow: text('eyebrow'),
    headline: text('headline').notNull(),
    kickerWord: text('kicker_word'),
    body: text('body'),
    imageMediaId: uuid('image_media_id'),
    videoMediaId: uuid('video_media_id'),
    ctaLabel: text('cta_label'),
    ctaHref: text('cta_href'),
    sortOrder: doublePrecision('sort_order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
  },
  (t) => [index('idx_hero_tenant_active_sort').on(t.tenantId, t.isActive, t.sortOrder)],
);

export const services = pgTable(
  'services',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    iconMediaId: uuid('icon_media_id'),
    coverMediaId: uuid('cover_media_id'),
    excerpt: text('excerpt'),
    body: text('body'),
    parentId: uuid('parent_id'),
    sortOrder: doublePrecision('sort_order').notNull().default(0),
    status: text('status').notNull().default('published'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('uniq_services_tenant_slug').on(t.tenantId, t.slug),
    index('idx_services_tenant_parent_sort').on(t.tenantId, t.parentId, t.sortOrder),
  ],
);

export const stats = pgTable(
  'stats',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    label: text('label').notNull(),
    valueNumber: integer('value_number').notNull(),
    suffix: text('suffix'),
    sortOrder: doublePrecision('sort_order').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('idx_stats_tenant_sort').on(t.tenantId, t.sortOrder)],
);

export const values = pgTable(
  'values',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    title: text('title').notNull(),
    body: text('body'),
    icon: text('icon'),
    sortOrder: doublePrecision('sort_order').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('idx_values_tenant_sort').on(t.tenantId, t.sortOrder)],
);

export const clients = pgTable(
  'clients',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    name: text('name').notNull(),
    logoMediaId: uuid('logo_media_id'),
    website: text('website'),
    sortOrder: doublePrecision('sort_order').notNull().default(0),
    isFeatured: boolean('is_featured').notNull().default(false),
    ...timestamps,
  },
  (t) => [index('idx_clients_tenant_sort').on(t.tenantId, t.sortOrder)],
);

export const testimonials = pgTable(
  'testimonials',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    authorName: text('author_name').notNull(),
    authorRole: text('author_role'),
    company: text('company'),
    quote: text('quote').notNull(),
    avatarMediaId: uuid('avatar_media_id'),
    rating: smallint('rating'),
    sortOrder: doublePrecision('sort_order').notNull().default(0),
    status: text('status').notNull().default('published'),
    ...timestamps,
  },
  (t) => [index('idx_testimonials_tenant_status_sort').on(t.tenantId, t.status, t.sortOrder)],
);

export const awards = pgTable(
  'awards',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    title: text('title').notNull(),
    issuer: text('issuer'),
    year: integer('year'),
    mediaId: uuid('media_id'),
    link: text('link'),
    sortOrder: doublePrecision('sort_order').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('idx_awards_tenant_year').on(t.tenantId, t.year)],
);

export const processSteps = pgTable(
  'process_steps',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    stepNo: integer('step_no').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    icon: text('icon'),
    sortOrder: doublePrecision('sort_order').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('idx_process_tenant_sort').on(t.tenantId, t.sortOrder)],
);

export const faqs = pgTable(
  'faqs',
  {
    id: idColumn(),
    tenantId: tenantIdColumn(),
    question: text('question').notNull(),
    answer: text('answer').notNull(),
    group: text('group'),
    sortOrder: doublePrecision('sort_order').notNull().default(0),
    status: text('status').notNull().default('published'),
    ...timestamps,
  },
  (t) => [index('idx_faqs_tenant_status_sort').on(t.tenantId, t.status, t.sortOrder)],
);
