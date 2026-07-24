'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setPostCoverAction, updatePostAction } from '@/app/(admin)/admin/blog/actions';

export interface EditorPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  tags: string[];
  status: string;
  coverUrl: string | null;
}

const field =
  'min-h-11 w-full rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export function BlogEditor({ post }: { post: EditorPost }) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? '');
  const [body, setBody] = useState(post.body ?? '');
  const [tags, setTags] = useState(post.tags.join(', '));
  const [status, setStatus] = useState(post.status);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await updatePostAction(post.id, {
      title,
      slug,
      excerpt,
      body,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      status,
    });
    setSaving(false);
    if (res.error) setError(res.error);
    else {
      setSaved(true);
      router.refresh();
    }
  }

  async function uploadCover(file: File) {
    setUploading(true);
    const form = new FormData();
    form.set('file', file);
    form.set('altText', title);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    if (res.ok) {
      const { media } = (await res.json()) as { media: { id: string } };
      await setPostCoverAction(post.id, media.id);
    }
    setUploading(false);
    router.refresh();
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <p className="mb-1.5 text-sm">Cover image</p>
        <div className="flex items-center gap-3">
          <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-md bg-current/5">
            {post.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.coverUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <label className="min-h-11 cursor-pointer rounded-md border border-current/20 px-3 py-2 text-sm">
            {uploading ? 'Uploading…' : 'Upload'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadCover(f);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Slug
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Excerpt
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Body
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Tags (comma-separated)
        <input value={tags} onChange={(e) => setTags(e.target.value)} className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {saved && <p className="text-sm text-green-700 dark:text-green-400">Saved.</p>}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="min-h-11 self-start rounded-md bg-[var(--accent)] px-5 font-medium text-[var(--accent-foreground)] disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save post'}
      </button>
    </div>
  );
}
