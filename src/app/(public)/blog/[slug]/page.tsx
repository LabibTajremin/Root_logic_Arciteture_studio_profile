import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getPostBySlug, getSiteSettings } from '@/infrastructure/db/queries/publicQueries';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tenantId = await resolveActiveTenantId();
  const post = tenantId ? await getPostBySlug(tenantId, slug) : null;
  if (!post) return { title: 'Post' };
  return { title: post.title, description: post.excerpt ?? undefined };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenantId = await resolveActiveTenantId();
  const site = tenantId ? await getSiteSettings(tenantId) : null;
  if (!site?.blogEnabled) notFound();

  const post = tenantId ? await getPostBySlug(tenantId, slug) : null;
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-20 md:px-6 md:py-28">
      <article>
        <header className="mb-8">
          <h1
            className="text-[clamp(2rem,5vw,3.2rem)] font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-headings)' }}
          >
            {post.title}
          </h1>
          {post.publishedAt && (
            <p className="mt-3 text-sm opacity-60">
              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </header>

        {post.coverUrl && (
          <div className="mb-10 overflow-hidden rounded-[var(--radius)] bg-current/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverUrl} alt="" className="h-auto w-full object-cover" />
          </div>
        )}

        <div className="prose-invert max-w-none text-lg leading-relaxed">
          {post.body ? (
            post.body.split('\n').map((para, i) =>
              para.trim() ? (
                <p key={i} className="mb-4">
                  {para}
                </p>
              ) : null,
            )
          ) : post.excerpt ? (
            <p>{post.excerpt}</p>
          ) : null}
        </div>

        {post.tags.length > 0 && (
          <ul className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-current/15 px-3 py-1 text-xs opacity-70"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </article>
    </main>
  );
}
