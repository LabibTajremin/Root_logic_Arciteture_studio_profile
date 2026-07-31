import type { Metadata } from 'next';
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
  getSeoSettings,
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
import { copyText } from '@/presentation/lib/copy';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const tenantId = await resolveActiveTenantId();
  if (!tenantId) return {};
  const [site, seo] = await Promise.all([getSiteSettings(tenantId), getSeoSettings(tenantId)]);
  const studioName = site?.studioName ?? 'Maapkathi';
  const description = seo?.defaultDescription ?? site?.tagline ?? undefined;
  return {
    title: { absolute: site?.tagline ? `${studioName} — ${site.tagline}` : studioName },
    description,
    alternates: { canonical: '/' },
  };
}

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

  const c = (key: string) => copyText(site?.copy, key);

  return (
    <main>
      <Hero slides={slides} />
      <PrincipalNote tagline={site?.tagline ?? null} />
      <ClientLogoWall clients={clients} />
      <PortfolioCategories
        categories={categories}
        eyebrow={c('home.portfolio.eyebrow')}
        title={c('home.portfolio.title')}
      />
      <FeaturedProjects
        projects={featured}
        eyebrow={c('home.featuredProjects.eyebrow')}
        title={c('home.featuredProjects.title')}
      />
      <Services
        services={groupServicesByCategory(services)}
        eyebrow={c('home.services.eyebrow')}
        title={c('home.services.title')}
      />
      <StatsBand stats={stats} />
      <CoreValues
        values={values}
        eyebrow={c('home.values.eyebrow')}
        title={c('home.values.title')}
      />
      <Team members={members} eyebrow={c('home.team.eyebrow')} title={c('home.team.title')} />
      <Testimonials
        testimonials={testimonials}
        eyebrow={c('home.testimonials.eyebrow')}
        title={c('home.testimonials.title')}
      />
      <AwardsList
        awards={awards}
        eyebrow={c('home.awards.eyebrow')}
        title={c('home.awards.title')}
      />
      <FaqAccordion faqs={faqs} eyebrow={c('home.faq.eyebrow')} title={c('home.faq.title')} />
      <ContactBand
        email={site?.contactEmail ?? null}
        phone={site?.contactPhone ?? null}
        heading={c('home.contactBand.heading')}
        ctaLabel={c('home.contactBand.ctaLabel')}
      />
    </main>
  );
}
