import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import {
  getActiveHeroSlides,
  getFeaturedProjects,
  getPublishedMembers,
  getServices,
  getSiteSettings,
  getStats,
  getTestimonials,
} from '@/infrastructure/db/queries/publicQueries';
import { Hero } from '@/presentation/components/public/Hero';
import {
  ContactBand,
  FeaturedProjects,
  PrincipalNote,
  Services,
  StatsBand,
  Team,
  Testimonials,
} from '@/presentation/components/public/sections';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tenantId = await resolveActiveTenantId();
  if (!tenantId) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-32">
        <h1 className="text-3xl font-semibold">Maapkathi Studio</h1>
        <p className="mt-4 opacity-70">No tenant configured yet. Run `pnpm db:seed`.</p>
      </main>
    );
  }

  const [site, slides, featured, services, stats, members, testimonials] = await Promise.all([
    getSiteSettings(tenantId),
    getActiveHeroSlides(tenantId),
    getFeaturedProjects(tenantId),
    getServices(tenantId),
    getStats(tenantId),
    getPublishedMembers(tenantId),
    getTestimonials(tenantId),
  ]);

  return (
    <main>
      <Hero slides={slides} />
      <PrincipalNote tagline={site?.tagline ?? null} />
      <FeaturedProjects projects={featured} />
      <Services services={services} />
      <StatsBand stats={stats} />
      <Team members={members} />
      <Testimonials testimonials={testimonials} />
      <ContactBand
        studioName={site?.studioName ?? 'Maapkathi Studio'}
        email={site?.contactEmail ?? null}
        phone={site?.contactPhone ?? null}
      />
    </main>
  );
}
