import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getPublishedPosts, getSiteSettings } from '@/infrastructure/db/queries/publicQueries';
import { Reveal } from '@/presentation/components/public/Reveal';
import { copyText } from '@/presentation/lib/copy';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Notes from the studio.',
};

export default async function BlogPage() {
  const tenantId = await resolveActiveTenantId();
  const site = tenantId ? await getSiteSettings(tenantId) : null;
  if (!site?.blogEnabled) notFound();

  const posts = tenantId ? await getPublishedPosts(tenantId) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.2em] opacity-60">
          {copyText(site?.copy, 'blog.eyebrow')}
        </p>
        <h1
          className="text-[clamp(2.2rem,6vw,4rem)] font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-headings)' }}
        >
          {copyText(site?.copy, 'blog.title')}
        </h1>
      </header>

      {posts.length === 0 ? (
        <p className="opacity-70">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} as="article" delayIndex={i % 3}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius)] bg-current/5">
                  {post.coverUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <h2 className="mt-4 text-lg font-medium">{post.title}</h2>
                {post.excerpt && <p className="mt-1 text-sm opacity-70">{post.excerpt}</p>}
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}
