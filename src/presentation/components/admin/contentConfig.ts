export interface ContentField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number';
  required?: boolean;
}

export interface ContentEntityConfig {
  entity: string;
  title: string;
  description: string;
  fields: ContentField[];
  image?: { label: string; hint: string };
}

/**
 * Declarative config for the simple list-based content types managed on
 * /admin/content. `name` values are the Drizzle column property names so the
 * generic server actions can build insert/update objects directly.
 */
export const CONTENT_ENTITIES: ContentEntityConfig[] = [
  {
    entity: 'clients',
    title: 'Clients ("Trusted by")',
    description: 'Logos shown in the homepage "Trusted by" strip.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'website', label: 'Website URL', type: 'text' },
    ],
    image: { label: 'Logo', hint: 'Transparent PNG/WebP works best.' },
  },
  {
    entity: 'testimonials',
    title: 'Testimonials',
    description: 'Client quotes shown on the homepage.',
    fields: [
      { name: 'authorName', label: 'Author name', type: 'text', required: true },
      { name: 'authorRole', label: 'Author role', type: 'text' },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'quote', label: 'Quote', type: 'textarea', required: true },
      { name: 'rating', label: 'Rating (1–5)', type: 'number' },
    ],
    image: { label: 'Avatar', hint: 'Square photo works best.' },
  },
  {
    entity: 'awards',
    title: 'Awards',
    description: 'Recognition shown on the homepage.',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'issuer', label: 'Issuer', type: 'text' },
      { name: 'year', label: 'Year', type: 'number' },
      { name: 'link', label: 'Link URL', type: 'text' },
    ],
    image: { label: 'Badge / image', hint: 'Optional badge or logo.' },
  },
  {
    entity: 'stats',
    title: 'Stats',
    description: 'Headline numbers (e.g. "120 projects").',
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'valueNumber', label: 'Value', type: 'number', required: true },
      { name: 'suffix', label: 'Suffix (e.g. +, %)', type: 'text' },
    ],
  },
  {
    entity: 'values',
    title: 'Core values',
    description: 'The studio’s guiding principles.',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'body', label: 'Description', type: 'textarea' },
    ],
  },
  {
    entity: 'faqs',
    title: 'FAQs',
    description: 'Frequently asked questions.',
    fields: [
      { name: 'question', label: 'Question', type: 'text', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea', required: true },
    ],
  },
  {
    entity: 'categories',
    title: 'Portfolio categories',
    description: 'Categories projects can be grouped under.',
    fields: [{ name: 'name', label: 'Name', type: 'text', required: true }],
  },
];

export const CONTENT_BY_ENTITY: Record<string, ContentEntityConfig> = Object.fromEntries(
  CONTENT_ENTITIES.map((c) => [c.entity, c]),
);
