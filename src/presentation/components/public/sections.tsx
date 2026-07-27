import Link from 'next/link';
import { Reveal } from '@/presentation/components/public/Reveal';
import { ProjectCard } from '@/presentation/components/public/ProjectCard';
import type { ProjectCardView } from '@/infrastructure/db/queries/publicQueries';

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10 flex flex-col gap-2">
      <p className="text-xs uppercase tracking-[0.2em] opacity-60">{eyebrow}</p>
      <h2
        className="text-[clamp(1.8rem,4vw,3rem)] font-semibold tracking-tight"
        style={{ fontFamily: 'var(--font-headings)' }}
      >
        {title}
      </h2>
    </div>
  );
}

export function PrincipalNote({ tagline }: { tagline: string | null }) {
  if (!tagline) return null;
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 text-center md:px-6 md:py-28">
      <Reveal>
        <p
          className="text-[clamp(1.4rem,3.5vw,2.4rem)] font-light leading-snug tracking-tight"
          style={{ fontFamily: 'var(--font-headings)' }}
        >
          {tagline}
        </p>
      </Reveal>
    </section>
  );
}

export function FeaturedProjects({ projects }: { projects: ProjectCardView[] }) {
  if (!projects.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <div className="flex items-end justify-between">
        <SectionHeading eyebrow="Selected work" title="Featured projects" />
        <Link href="/work" className="mb-10 hidden text-sm underline underline-offset-4 md:inline">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <Reveal key={project.id} as="article" delayIndex={i % 3}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
      <div className="mt-10 md:hidden">
        <Link href="/work" className="text-sm underline underline-offset-4">
          View all work
        </Link>
      </div>
    </section>
  );
}

export interface ServiceCategoryCard {
  id: string;
  title: string;
  excerpt: string | null;
  iconUrl: string | null;
  children: { id: string; title: string; slug: string }[];
}

export function Services({ services }: { services: ServiceCategoryCard[] }) {
  if (!services.length) return null;
  return (
    <section className="border-y border-current/10">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow="What we do" title="Services" />
          <Link
            href="/services"
            className="mb-10 hidden text-sm underline underline-offset-4 md:inline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.id} delayIndex={i % 3}>
              <div className="flex h-full flex-col gap-3">
                {service.iconUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.iconUrl}
                    alt=""
                    aria-hidden
                    className="service-icon h-12 w-12 object-contain"
                  />
                )}
                <h3 className="text-xl font-medium tracking-tight">{service.title}</h3>
                {service.excerpt && <p className="opacity-70">{service.excerpt}</p>}
                {service.children.length > 0 && (
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {service.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/services/${child.slug}`}
                          className="inline-block rounded-full border border-current/15 px-3 py-1 text-xs opacity-70 transition-opacity hover:opacity-100"
                        >
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 md:hidden">
          <Link href="/services" className="text-sm underline underline-offset-4">
            View all services
          </Link>
        </div>
      </div>
    </section>
  );
}

export function StatsBand({
  stats,
}: {
  stats: { id: string; label: string; value: number; suffix: string | null }[];
}) {
  if (!stats.length) return null;
  return (
    <section className="bg-[var(--accent)] text-[var(--accent-foreground)]">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-16 md:grid-cols-4 md:px-6">
        {stats.map((stat) => (
          <div key={stat.id} className="flex flex-col gap-1">
            <span className="text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-none">
              {stat.value}
              {stat.suffix}
            </span>
            <span className="text-sm opacity-80">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Team({
  members,
}: {
  members: { id: string; name: string; roleTitle: string | null; photoUrl: string | null }[];
}) {
  if (!members.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <SectionHeading eyebrow="The people" title="Our team" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {members.map((member, i) => (
          <Reveal key={member.id} delayIndex={i % 4}>
            <div className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius)] bg-current/5">
                {member.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    loading="lazy"
                    className="h-full w-full object-cover grayscale group-hover:grayscale-0"
                    style={{ transition: 'filter var(--motion-duration) var(--motion-ease)' }}
                  />
                )}
              </div>
              <p className="mt-3 font-medium">{member.name}</p>
              {member.roleTitle && <p className="text-sm opacity-60">[{member.roleTitle}]</p>}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Testimonials({
  testimonials,
}: {
  testimonials: {
    id: string;
    authorName: string;
    company: string | null;
    quote: string;
    avatarUrl?: string | null;
  }[];
}) {
  if (!testimonials.length) return null;
  return (
    <section className="border-y border-current/10">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-6 md:py-24">
        <SectionHeading eyebrow="Kind words" title="What clients say" />
        <div className="flex flex-col gap-12">
          {testimonials.map((t) => (
            <Reveal key={t.id}>
              <figure className="flex flex-col items-center gap-4">
                <blockquote
                  className="text-[clamp(1.3rem,3vw,2rem)] font-light leading-snug"
                  style={{ fontFamily: 'var(--font-headings)' }}
                >
                  “{t.quote}”
                </blockquote>
                <figcaption className="flex items-center gap-3 text-sm opacity-70">
                  {t.avatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                  )}
                  <span>
                    {t.authorName}
                    {t.company ? `, ${t.company}` : ''}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// Deterministic accent per client so the wordmarks read as distinct brands
// without needing real logo artwork.
const LOGO_HUES = [162, 200, 20, 260, 320, 40];

function clientInitials(name: string) {
  const words = name.trim().split(/\s+/);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase();
}

function ClientLetterMark({ name, index }: { name: string; index: number }) {
  const hue = LOGO_HUES[index % LOGO_HUES.length];
  return (
    <div
      className="flex h-14 items-center justify-center gap-2 rounded-md border border-current/10 px-3 text-sm font-semibold tracking-tight opacity-70 transition-opacity hover:opacity-100"
      title={name}
    >
      <span
        aria-hidden
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ backgroundColor: `hsl(${hue} 45% 38%)` }}
      >
        {clientInitials(name)}
      </span>
      <span className="truncate">{name}</span>
    </div>
  );
}

export function ClientLogoWall({
  clients,
}: {
  clients: { id: string; name: string; logoUrl?: string | null }[];
}) {
  if (!clients.length) return null;
  return (
    <section className="border-y border-current/10">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] opacity-50">Trusted by</p>
        <div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 md:grid-cols-6">
          {clients.map((c, i) =>
            c.logoUrl ? (
              <div
                key={c.id}
                className="flex h-14 items-center justify-center rounded-md border border-current/10 px-3"
                title={c.name}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.logoUrl} alt={c.name} className="max-h-8 w-auto object-contain" />
              </div>
            ) : (
              <ClientLetterMark key={c.id} name={c.name} index={i} />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

// Category-flavoured cover photos (CC0, StockSnap.io) so the demo portfolio
// cards read as real project categories rather than empty tiles.
const CATEGORY_COVER_IMAGES: Record<string, string> = {
  residential: 'https://cdn.stocksnap.io/img-thumbs/960w/HIH67XC5G0.jpg',
  commercial: 'https://cdn.stocksnap.io/img-thumbs/960w/QUU0AQABSN.jpg',
  hospitality: 'https://cdn.stocksnap.io/img-thumbs/960w/SX2H0BU5EG.jpg',
};
const DEFAULT_CATEGORY_COVER = 'https://cdn.stocksnap.io/img-thumbs/960w/TQNWBTLHLY.jpg';

export function PortfolioCategories({
  categories,
}: {
  categories: { id: string; name: string; slug: string }[];
}) {
  if (!categories.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <SectionHeading eyebrow="Explore" title="Portfolio" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {categories.map((cat, i) => (
          <Reveal key={cat.id} delayIndex={i % 3}>
            <Link
              href={`/work`}
              className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-[var(--radius)] border border-current/10 p-6"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CATEGORY_COVER_IMAGES[cat.slug] ?? DEFAULT_CATEGORY_COVER}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 -z-10 bg-black/45" aria-hidden />
              <span className="text-sm text-white/70">{String(i + 1).padStart(2, '0')}</span>
              <span
                className="text-2xl font-medium tracking-tight text-white"
                style={{ fontFamily: 'var(--font-headings)' }}
              >
                {cat.name}
              </span>
              <span
                className="absolute inset-0 -z-10 bg-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-20"
                aria-hidden
              />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CoreValues({
  values,
}: {
  values: { id: string; title: string; body: string | null }[];
}) {
  if (!values.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <SectionHeading eyebrow="How we work" title="Our values" />
      <ol className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
        {values.map((v, i) => (
          <Reveal key={v.id} as="li" delayIndex={i % 2}>
            <div className="flex gap-4">
              <span className="text-sm opacity-40">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="text-lg font-medium">{v.title}</h3>
                {v.body && <p className="mt-1 opacity-70">{v.body}</p>}
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export function AwardsList({
  awards,
}: {
  awards: { id: string; title: string; issuer: string | null; year: number | null }[];
}) {
  if (!awards.length) return null;
  return (
    <section className="border-y border-current/10">
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
        <SectionHeading eyebrow="Recognition" title="Awards & press" />
        <ul className="flex flex-col divide-y divide-current/10">
          {awards.map((a) => (
            <li key={a.id} className="flex items-baseline justify-between gap-4 py-4">
              <span className="font-medium">{a.title}</span>
              <span className="text-sm opacity-60">
                {a.issuer}
                {a.year ? ` · ${a.year}` : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ContactBand({ email, phone }: { email: string | null; phone: string | null }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <Reveal>
        <h2
          className="max-w-3xl text-[clamp(2rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-tight"
          style={{ fontFamily: 'var(--font-headings)' }}
        >
          Let’s design something enduring together.
        </h2>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-6 font-medium text-[var(--accent-foreground)]"
          >
            Get in touch
          </Link>
          {email && (
            <a href={`mailto:${email}`} className="text-sm underline underline-offset-4">
              {email}
            </a>
          )}
          {phone && <span className="text-sm opacity-70">{phone}</span>}
        </div>
      </Reveal>
    </section>
  );
}
