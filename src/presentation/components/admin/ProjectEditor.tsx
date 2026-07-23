'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import {
  publishProjectAction,
  setCoverAction,
  updateProjectAction,
  type ProjectFormState,
} from '@/app/(admin)/admin/projects/actions';

export interface EditorMedia {
  id: string;
  url: string;
  altText: string | null;
}

export interface EditorProject {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  location: string | null;
  isFeatured: boolean;
  status: string;
  coverMediaId: string | null;
}

const field =
  'min-h-11 w-full rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export function ProjectEditor({
  project,
  media,
}: {
  project: EditorProject;
  media: EditorMedia[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ProjectFormState, FormData>(
    updateProjectAction,
    {},
  );
  const [uploading, setUploading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.set('file', file);
    body.set('projectId', project.id);
    body.set('altText', project.title);
    const res = await fetch('/api/admin/upload', { method: 'POST', body });
    setUploading(false);
    e.target.value = '';
    if (res.ok) router.refresh();
  }

  async function publish() {
    setPublishError(null);
    const result = await publishProjectAction(project.id);
    if (result?.error) setPublishError(result.error);
    else router.refresh();
  }

  async function makeCover(mediaId: string) {
    await setCoverAction(project.id, mediaId);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-current/10 px-3 py-1 text-xs">
          {project.status.replace('_', ' ')}
        </span>
        <div className="flex items-center gap-3">
          {project.status !== 'published' && (
            <button
              type="button"
              onClick={publish}
              className="min-h-11 rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)]"
            >
              Publish
            </button>
          )}
        </div>
      </div>
      {publishError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {publishError}
        </p>
      )}

      <form action={action} className="flex max-w-2xl flex-col gap-4">
        <input type="hidden" name="id" value={project.id} />
        <label className="flex flex-col gap-1.5 text-sm">
          Title
          <input name="title" defaultValue={project.title} required className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Summary
          <textarea
            name="summary"
            defaultValue={project.summary ?? ''}
            rows={3}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Body
          <textarea name="body" defaultValue={project.body ?? ''} rows={6} className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Location
          <input name="location" defaultValue={project.location ?? ''} className={field} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={project.isFeatured} />
          Featured on the homepage
        </label>
        {state.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 self-start rounded-md border border-current/20 px-5 text-sm font-medium disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Media</h2>
          <label className="min-h-11 cursor-pointer rounded-md border border-current/20 px-4 py-2 text-sm">
            {uploading ? 'Uploading…' : 'Upload image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={upload}
              className="hidden"
              data-testid="media-input"
            />
          </label>
        </div>
        {media.length === 0 ? (
          <p className="opacity-60">No media yet — upload an image to use as the cover.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {media.map((m) => (
              <li key={m.id} className="flex flex-col gap-2">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-current/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.altText ?? ''} className="h-full w-full object-cover" />
                  {project.coverMediaId === m.id && (
                    <span className="absolute left-2 top-2 rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs text-[var(--accent-foreground)]">
                      Cover
                    </span>
                  )}
                </div>
                {project.coverMediaId !== m.id && (
                  <button
                    type="button"
                    onClick={() => makeCover(m.id)}
                    className="min-h-11 rounded-md border border-current/20 text-xs"
                  >
                    Set as cover
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
