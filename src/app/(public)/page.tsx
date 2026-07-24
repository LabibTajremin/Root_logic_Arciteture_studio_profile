import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import {
  getActiveHeroSlides,
  getAwards,
  getCategoriesWithCounts,
  getClients,
  getFaqs,
  getFeaturedProjects,
  getPublishedMembers,
  getServices,
  getSiteSettings,
  getStats,
  getTestimonials,
  getValues,
  groupServicesByCategory,
} from '@/infrastructure/db/queries/publicQueries';
import { Hero } from '@/presentation/components/public/Hero';
import { FaqAccordion } from '@/presentation/components/public/FaqAccordion';
import {
  AwardsList,
  ClientLogoWall,
  ContactBand,
  CoreValues,
  FeaturedProjects,
  PortfolioCategories,
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
        <h1 className="text-3xl font-semibold">Maapkathi</h1>
        <p className="mt-4 opacity-70">No tenant configured yet. Run `pnpm db:seed`.</p>
      </main>
    );
  }

  const [
    site,
    slides,
    categories,
    featured,
    services,
    stats,
    values,
    members,
    testimonials,
    clients,
    awards,
    faqs,
  ] = await Promise.all([
    getSiteSettings(tenantId),
    getActiveHeroSlides(tenantId),
    getCategoriesWithCounts(tenantId),
    getFeaturedProjects(tenantId),
    getServices(tenantId),
    getStats(tenantId),
    getValues(tenantId),
    getPublishedMembers(tenantId),
    getTestimonials(tenantId),
    getClients(tenantId),
    getAwards(tenantId),
    getFaqs(tenantId),
  ]);

  return (
    <main>
      <Hero slides={slides} />
      <PrincipalNote tagline={site?.tagline ?? null} />
      <ClientLogoWall clients={clients} />
      <PortfolioCategories categories={categories} />
      <FeaturedProjects projects={featured} />
      <Services services={groupServicesByCategory(services)} />
      <StatsBand stats={stats} />
      <CoreValues values={values} />
      <Team members={members} />
      <Testimonials testimonials={testimonials} />
      <AwardsList awards={awards} />
      <FaqAccordion faqs={faqs} />
      <ContactBand
        studioName={site?.studioName ?? 'Maapkathi'}
        email={site?.contactEmail ?? null}
        phone={site?.contactPhone ?? null}
      />
    </main>
  );
}
