import { redirect } from 'next/navigation';
import { asc, eq, getTableColumns } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import {
  awards,
  categories,
  clients,
  faqs,
  mediaAssets,
  stats,
  testimonials,
  values,
} from '@/infrastructure/db/schema';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { ContentManager, type ContentItem } from '@/presentation/components/admin/ContentManager';
import { CONTENT_ENTITIES } from '@/presentation/components/admin/contentConfig';

export const dynamic = 'force-dynamic';

async function loadWithImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: any,
  imageCol: string | null,
  tenantId: string,
): Promise<ContentItem[]> {
  const db = getDb();
  if (imageCol) {
    const rows = await db
      .select({ ...getTableColumns(table), imageUrl: mediaAssets.url })
      .from(table)
      .leftJoin(mediaAssets, eq(mediaAssets.id, table[imageCol]))
      .where(eq(table.tenantId, tenantId))
      .orderBy(asc(table.sortOrder));
    return rows as ContentItem[];
  }
  const rows = await db
    .select()
    .from(table)
    .where(eq(table.tenantId, tenantId))
    .orderBy(asc(table.sortOrder));
  return rows as ContentItem[];
}

export default async function ContentAdminPage() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) redirect('/admin');

  const [clientRows, testimonialRows, awardRows, statRows, valueRows, faqRows, categoryRows] =
    await Promise.all([
      loadWithImage(clients, 'logoMediaId', actor.tenantId),
      loadWithImage(testimonials, 'avatarMediaId', actor.tenantId),
      loadWithImage(awards, 'mediaId', actor.tenantId),
      loadWithImage(stats, null, actor.tenantId),
      loadWithImage(values, null, actor.tenantId),
      loadWithImage(faqs, null, actor.tenantId),
      loadWithImage(categories, null, actor.tenantId),
    ]);

  const itemsByEntity: Record<string, ContentItem[]> = {
    clients: clientRows,
    testimonials: testimonialRows,
    awards: awardRows,
    stats: statRows,
    values: valueRows,
    faqs: faqRows,
    categories: categoryRows,
  };

  return (
    <section className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
        <p className="mt-1 opacity-60">
          Manage the homepage content sections — clients, testimonials, awards, stats, values, FAQs
          and portfolio categories.
        </p>
      </div>
      {CONTENT_ENTITIES.map((config) => (
        <ContentManager
          key={config.entity}
          config={config}
          items={itemsByEntity[config.entity] ?? []}
        />
      ))}
    </section>
  );
}
