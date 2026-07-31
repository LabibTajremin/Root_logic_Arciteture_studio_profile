/**
 * Registry of every piece of static marketing copy an admin can override from
 * /admin/copy — section eyebrows/titles, CTAs, and page intros. Keys are grouped by
 * where they render; add a new entry here and it's immediately editable, no migration
 * needed (site_settings.copy is a single JSONB map).
 */

export interface CopyField {
  key: string;
  label: string;
  group: string;
  default: string;
  multiline?: boolean;
}

export const COPY_FIELDS: CopyField[] = [
  // ── Homepage sections ──────────────────────────────────────────────────────
  {
    key: 'home.portfolio.eyebrow',
    label: 'Eyebrow',
    group: 'Homepage — Portfolio categories',
    default: 'Explore',
  },
  {
    key: 'home.portfolio.title',
    label: 'Title',
    group: 'Homepage — Portfolio categories',
    default: 'Portfolio',
  },
  {
    key: 'home.featuredProjects.eyebrow',
    label: 'Eyebrow',
    group: 'Homepage — Featured projects',
    default: 'Selected work',
  },
  {
    key: 'home.featuredProjects.title',
    label: 'Title',
    group: 'Homepage — Featured projects',
    default: 'Featured projects',
  },
  {
    key: 'home.services.eyebrow',
    label: 'Eyebrow',
    group: 'Homepage — Services',
    default: 'What we do',
  },
  { key: 'home.services.title', label: 'Title', group: 'Homepage — Services', default: 'Services' },
  {
    key: 'home.values.eyebrow',
    label: 'Eyebrow',
    group: 'Homepage — Our values',
    default: 'How we work',
  },
  {
    key: 'home.values.title',
    label: 'Title',
    group: 'Homepage — Our values',
    default: 'Our values',
  },
  { key: 'home.team.eyebrow', label: 'Eyebrow', group: 'Homepage — Team', default: 'The people' },
  { key: 'home.team.title', label: 'Title', group: 'Homepage — Team', default: 'Our team' },
  {
    key: 'home.testimonials.eyebrow',
    label: 'Eyebrow',
    group: 'Homepage — Testimonials',
    default: 'Kind words',
  },
  {
    key: 'home.testimonials.title',
    label: 'Title',
    group: 'Homepage — Testimonials',
    default: 'What clients say',
  },
  {
    key: 'home.awards.eyebrow',
    label: 'Eyebrow',
    group: 'Homepage — Awards & press',
    default: 'Recognition',
  },
  {
    key: 'home.awards.title',
    label: 'Title',
    group: 'Homepage — Awards & press',
    default: 'Awards & press',
  },
  { key: 'home.faq.eyebrow', label: 'Eyebrow', group: 'Homepage — FAQ', default: 'Questions' },
  { key: 'home.faq.title', label: 'Title', group: 'Homepage — FAQ', default: 'FAQ' },
  {
    key: 'home.contactBand.heading',
    label: 'Heading',
    group: 'Homepage — Closing call-to-action',
    default: 'Let’s design something enduring together.',
    multiline: true,
  },
  {
    key: 'home.contactBand.ctaLabel',
    label: 'Button label',
    group: 'Homepage — Closing call-to-action',
    default: 'Get in touch',
  },

  // ── Page headers ───────────────────────────────────────────────────────────
  { key: 'work.eyebrow', label: 'Eyebrow', group: 'Work page', default: 'Portfolio' },
  { key: 'work.title', label: 'Title', group: 'Work page', default: 'Our work' },
  { key: 'team.eyebrow', label: 'Eyebrow', group: 'Team page', default: 'The people' },
  { key: 'team.title', label: 'Title', group: 'Team page', default: 'Our team' },
  { key: 'contact.eyebrow', label: 'Eyebrow', group: 'Contact page', default: 'Say hello' },
  { key: 'contact.title', label: 'Title', group: 'Contact page', default: 'Get in touch' },
  { key: 'about.eyebrow', label: 'Eyebrow', group: 'About page', default: 'About the studio' },
  { key: 'services.eyebrow', label: 'Eyebrow', group: 'Services page', default: 'What we do' },
  { key: 'services.title', label: 'Title', group: 'Services page', default: 'Services' },
  { key: 'blog.eyebrow', label: 'Eyebrow', group: 'Blog page', default: 'Notes' },
  { key: 'blog.title', label: 'Title', group: 'Blog page', default: 'Blog' },
];

const DEFAULTS_BY_KEY: Record<string, string> = Object.fromEntries(
  COPY_FIELDS.map((f) => [f.key, f.default]),
);

/** Resolves one key against the tenant's overrides, falling back to the built-in default. */
export function copyText(
  overrides: Readonly<Record<string, string>> | null | undefined,
  key: string,
): string {
  const override = overrides?.[key];
  return override && override.trim() ? override : (DEFAULTS_BY_KEY[key] ?? '');
}
