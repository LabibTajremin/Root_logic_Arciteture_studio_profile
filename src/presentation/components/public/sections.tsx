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

export function Services({
  services,
}: {
  services: { id: string; title: string; excerpt: string | null }[];
}) {
  if (!services.length) return null;
  return (
    <section className="border-y border-current/10">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <SectionHeading eyebrow="What we do" title="Services" />
        <div className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.id} delayIndex={i % 3}>
              <div className="flex h-full flex-col gap-2 py-6 pr-6">
                <h3 className="text-xl font-medium tracking-tight">{service.title}</h3>
                {service.excerpt && <p className="opacity-70">{service.excerpt}</p>}
              </div>
            </Reveal>
          ))}
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
  testimonials: { id: string; authorName: string; company: string | null; quote: string }[];
}) {
  if (!testimonials.length) return null;
  return (
    <section className="border-y border-current/10">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center md:px-6 md:py-24">
        <SectionHeading eyebrow="Kind words" title="What clients say" />
        <div className="flex flex-col gap-12">
          {testimonials.map((t) => (
            <Reveal key={t.id}>
              <figure className="flex flex-col gap-4">
                <blockquote
                  className="text-[clamp(1.3rem,3vw,2rem)] font-light leading-snug"
                  style={{ fontFamily: 'var(--font-headings)' }}
                >
                  “{t.quote}”
                </blockquote>
                <figcaption className="text-sm opacity-70">
                  {t.authorName}
                  {t.company ? `, ${t.company}` : ''}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactBand({
  studioName,
  email,
  phone,
}: {
  studioName: string;
  email: string | null;
  phone: string | null;
}) {
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
        <p className="mt-16 text-sm opacity-50">
          © {new Date().getFullYear()} {studioName}
        </p>
      </Reveal>
    </section>
  );
}
