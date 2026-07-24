'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createHeroSlideAction,
  deleteHeroSlideAction,
  setHeroImageAction,
  toggleHeroActiveAction,
  type HeroFormState,
} from '@/app/(admin)/admin/hero/actions';

export interface HeroSlideRow {
  id: string;
  eyebrow: string | null;
  headline: string;
  kickerWord: string | null;
  isActive: boolean;
  imageUrl: string | null;
}

const field =
  'min-h-11 w-full rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export function HeroManager({ slides }: { slides: HeroSlideRow[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<HeroFormState, FormData>(
    createHeroSlideAction,
    {},
  );
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [newSlideImageId, setNewSlideImageId] = useState('');
  const [newSlideImagePreview, setNewSlideImagePreview] = useState<string | null>(null);
  const [newSlideUploading, setNewSlideUploading] = useState(false);

  useEffect(() => {
    if (!pending && !state.error) {
      setNewSlideImageId('');
      setNewSlideImagePreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  async function uploadImage(slideId: string, file: File) {
    setUploadingId(slideId);
    const body = new FormData();
    body.set('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body });
    if (res.ok) {
      const { media } = (await res.json()) as { media: { id: string } };
      await setHeroImageAction(slideId, media.id);
    }
    setUploadingId(null);
    router.refresh();
  }

  async function uploadNewSlideImage(file: File) {
    setNewSlideUploading(true);
    const body = new FormData();
    body.set('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body });
    if (res.ok) {
      const { media } = (await res.json()) as { media: { id: string; url: string } };
      setNewSlideImageId(media.id);
      setNewSlideImagePreview(media.url);
    }
    setNewSlideUploading(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <ul className="flex flex-col gap-4">
        {slides.length === 0 && <li className="opacity-60">No slides yet — add one below.</li>}
        {slides.map((s) => (
          <li
            key={s.id}
            className="flex flex-col gap-4 rounded-md border border-current/10 p-4 sm:flex-row sm:items-center"
          >
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-current/5 sm:w-48">
              {s.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {s.eyebrow && (
                <p className="text-xs uppercase tracking-widest opacity-60">{s.eyebrow}</p>
              )}
              <p className="font-medium">
                {s.headline} {s.kickerWord && <span className="opacity-60">/ {s.kickerWord}</span>}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <label className="min-h-11 cursor-pointer rounded-md border border-current/20 px-3 py-2 text-xs">
                {uploadingId === s.id ? 'Uploading…' : 'Image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadImage(s.id, f);
                    e.target.value = '';
                  }}
                />
              </label>
              <button
                type="button"
                onClick={async () => {
                  await toggleHeroActiveAction(s.id, !s.isActive);
                  router.refresh();
                }}
                className="min-h-11 rounded-md border border-current/20 px-3 text-xs"
              >
                {s.isActive ? 'Active' : 'Hidden'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteHeroSlideAction(s.id);
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
        <h2 className="text-lg font-medium">Add a slide</h2>

        <div>
          <input type="hidden" name="imageMediaId" value={newSlideImageId} />
          <div className="flex items-center gap-3">
            <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-current/5">
              {newSlideImagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={newSlideImagePreview} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <label className="min-h-11 cursor-pointer rounded-md border border-current/20 px-3 py-2 text-sm">
              {newSlideUploading
                ? 'Uploading…'
                : newSlideImageId
                  ? 'Replace image'
                  : 'Upload image'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadNewSlideImage(f);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          <p className="mt-1.5 text-xs opacity-60">Recommended ratio 16:9, at least 2400×1350px.</p>
        </div>

        <input name="eyebrow" placeholder="Eyebrow (optional)" className={field} />
        <input name="headline" placeholder="Headline" required className={field} />
        <input name="kickerWord" placeholder="Kicker word (optional)" className={field} />
        <div className="grid grid-cols-2 gap-3">
          <input name="ctaLabel" placeholder="CTA label" className={field} />
          <input name="ctaHref" placeholder="CTA link (/work)" className={field} />
        </div>
        {state.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 self-start rounded-md bg-[var(--accent)] px-5 font-medium text-[var(--accent-foreground)] disabled:opacity-60"
        >
          {pending ? 'Adding…' : 'Add slide'}
        </button>
      </form>
    </div>
  );
}
