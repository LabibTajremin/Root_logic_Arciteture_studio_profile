import { redirect } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { getActor } from '@/infrastructure/auth/actor';
import { getDb } from '@/infrastructure/db/client';
import { heroSlides, mediaAssets } from '@/infrastructure/db/schema';
import { RolePolicy } from '@/domain/services/RolePolicy';
import { HeroManager } from '@/presentation/components/admin/HeroManager';

export const dynamic = 'force-dynamic';

export default async function HeroAdminPage() {
  const actor = await getActor();
  if (!actor) redirect('/login');
  if (!RolePolicy.canManageSettings(actor.role)) redirect('/admin');

  const rows = await getDb()
    .select({
      id: heroSlides.id,
      eyebrow: heroSlides.eyebrow,
      headline: heroSlides.headline,
      kickerWord: heroSlides.kickerWord,
      isActive: heroSlides.isActive,
      imageUrl: mediaAssets.url,
    })
    .from(heroSlides)
    .leftJoin(mediaAssets, eq(mediaAssets.id, heroSlides.imageMediaId))
    .where(eq(heroSlides.tenantId, actor.tenantId))
    .orderBy(asc(heroSlides.sortOrder));

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hero carousel</h1>
        <p className="mt-1 opacity-60">
          Manage the homepage hero slides. Recommended image ratio 16:9 (≥ 2400×1350).
        </p>
      </div>
      <HeroManager slides={rows} />
    </section>
  );
}
