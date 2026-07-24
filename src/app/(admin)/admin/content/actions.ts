'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import {
  awards,
  categories,
  clients,
  faqs,
  stats,
  testimonials,
  values,
} from '@/infrastructure/db/schema';
import { isReadOnly } from '@/infrastructure/licence/licenceStatus';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { CONTENT_BY_ENTITY } from '@/presentation/components/admin/contentConfig';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TABLES: Record<string, any> = {
  clients,
  testimonials,
  awards,
  stats,
  values,
  faqs,
  categories,
};
const IMAGE_COL: Record<string, string> = {
  clients: 'logoMediaId',
  testimonials: 'avatarMediaId',
  awards: 'mediaId',
};
const HAS_STATUS = new Set(['testimonials', 'faqs']);

export interface ContentFormState {
  error?: string;
}

async function requireAdmin() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) return null;
  if (isReadOnly()) return null;
  return actor;
}

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `item-${Date.now()}`
  );
}

function coerceFields(entity: string, get: (name: string) => string | null) {
  const config = CONTENT_BY_ENTITY[entity];
  if (!config) return null;
  const out: Record<string, unknown> = {};
  for (const f of config.fields) {
    const raw = get(f.name);
    if (f.type === 'number') {
      out[f.name] = raw ? Number(raw) : f.required ? 0 : null;
    } else {
      out[f.name] = raw || (f.required ? '' : null);
    }
  }
  return out;
}

export async function createContentAction(
  entity: string,
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const actor = await requireAdmin();
  if (!actor) return { error: 'Not permitted.' };
  const table = TABLES[entity];
  const config = CONTENT_BY_ENTITY[entity];
  if (!table || !config) return { error: 'Unknown content type.' };

  const fields = coerceFields(entity, (n) => formData.get(n) as string | null);
  if (!fields) return { error: 'Invalid input.' };

  // Required validation.
  for (const f of config.fields) {
    if (f.required && !fields[f.name] && fields[f.name] !== 0) {
      return { error: `${f.label} is required.` };
    }
  }

  const values_: Record<string, unknown> = {
    tenantId: actor.tenantId,
    ...fields,
    sortOrder: Date.now(),
  };
  if (HAS_STATUS.has(entity)) values_.status = 'published';
  if (entity === 'categories') values_.slug = slugify(String(fields.name ?? ''));
  if (IMAGE_COL[entity]) {
    const mediaId = (formData.get('imageMediaId') as string) || null;
    if (mediaId) values_[IMAGE_COL[entity]!] = mediaId;
  }

  await getDb().insert(table).values(values_);

  revalidatePath('/admin/content');
  revalidatePath('/');
  return {};
}

export async function updateContentAction(
  entity: string,
  id: string,
  patch: Record<string, string>,
): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  const table = TABLES[entity];
  const config = CONTENT_BY_ENTITY[entity];
  if (!table || !config) return;

  const fields = coerceFields(entity, (n) => (n in patch ? patch[n]! : null)) ?? {};
  await getDb()
    .update(table)
    .set({ ...fields, updatedAt: new Date() })
    .where(and(eq(table.tenantId, actor.tenantId), eq(table.id, id)));

  revalidatePath('/admin/content');
  revalidatePath('/');
}

export async function deleteContentAction(entity: string, id: string): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  const table = TABLES[entity];
  if (!table) return;
  await getDb()
    .delete(table)
    .where(and(eq(table.tenantId, actor.tenantId), eq(table.id, id)));
  revalidatePath('/admin/content');
  revalidatePath('/');
}

export async function setContentImageAction(
  entity: string,
  id: string,
  mediaId: string,
): Promise<void> {
  const actor = await requireAdmin();
  if (!actor) return;
  const table = TABLES[entity];
  const col = IMAGE_COL[entity];
  if (!table || !col) return;
  await getDb()
    .update(table)
    .set({ [col]: mediaId, updatedAt: new Date() })
    .where(and(eq(table.tenantId, actor.tenantId), eq(table.id, id)));
  revalidatePath('/admin/content');
  revalidatePath('/');
}
