'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createPostAction,
  deletePostAction,
  type PostFormState,
} from '@/app/(admin)/admin/blog/actions';

export interface PostRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  coverUrl: string | null;
}

const field =
  'min-h-11 w-full rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export function BlogList({ posts }: { posts: PostRow[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<PostFormState, FormData>(createPostAction, {});

  return (
    <div className="flex flex-col gap-8">
      <ul className="flex flex-col gap-4">
        {posts.length === 0 && <li className="opacity-60">No posts yet — add one below.</li>}
        {posts.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-4 rounded-md border border-current/10 p-4 sm:flex-row sm:items-center"
          >
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-current/5 sm:w-40">
              {p.coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{p.title}</p>
              <p className="text-xs opacity-60">
                /{p.slug} · {p.status}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                href={`/admin/blog/${p.id}`}
                className="min-h-11 rounded-md border border-current/20 px-3 py-2 text-xs"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm(`Delete "${p.title}"?`)) return;
                  await deletePostAction(p.id);
                  router.refresh();
                }}
                className="min-h-11 rounded-md border border-current/20 px-3 text-xs text-red-600 dark:text-red-400"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form
        action={action}
        className="flex max-w-xl flex-col gap-3 border-t border-current/10 pt-6"
      >
        <h2 className="text-lg font-medium">New post</h2>
        <input name="title" placeholder="Title" required className={field} />
        <textarea
          name="excerpt"
          placeholder="Short excerpt (optional)"
          rows={2}
          className={field}
        />
        {state.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        {state.postId && (
          <p className="text-sm text-green-700 dark:text-green-400">
            Created —{' '}
            <Link href={`/admin/blog/${state.postId}`} className="underline">
              open it to add the body and publish
            </Link>
            .
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 self-start rounded-md bg-[var(--accent)] px-5 font-medium text-[var(--accent-foreground)] disabled:opacity-60"
        >
          {pending ? 'Creating…' : 'Create draft'}
        </button>
      </form>
    </div>
  );
}
