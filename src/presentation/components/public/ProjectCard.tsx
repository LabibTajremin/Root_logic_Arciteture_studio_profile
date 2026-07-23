import Link from 'next/link';
import type { ProjectCardView } from '@/infrastructure/db/queries/publicQueries';

/** Editorial project card: cover with slow zoom-on-hover, category chip, title, year. */
export function ProjectCard({ project }: { project: ProjectCardView }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block overflow-hidden rounded-[var(--radius)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-current/5">
        {project.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.coverUrl}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-[1.04]"
            style={{ transition: 'transform var(--motion-duration) var(--motion-ease)' }}
          />
        )}
        {project.categoryName && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            {project.categoryName}
          </span>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-3 pt-3">
        <h3
          className="text-lg font-medium tracking-tight"
          style={{ fontFamily: 'var(--font-headings)' }}
        >
          {project.title}
        </h3>
        {project.year && <span className="text-sm opacity-60">{project.year}</span>}
      </div>
      {project.location && <p className="text-sm opacity-60">{project.location}</p>}
    </Link>
  );
}
