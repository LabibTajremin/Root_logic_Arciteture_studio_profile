'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createHeroSlideAction,
  deleteHeroSlideAction,
  setHeroImageAction,
  toggleHeroActiveAction,
  updateHeroTextAction,
  type HeroFormState,
} from '@/app/(admin)/admin/hero/actions';

export interface HeroSlideRow {
  id: string;
  eyebrow: string | null;
  headline: string;
  kickerWord: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  isActive: boolean;
  imageUrl: string | null;
}

const field =
  'min-h-11 w-full rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

function HeroSlideItem({ slide }: { slide: HeroSlideRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [eyebrow, setEyebrow] = useState(slide.eyebrow ?? '');
  const [headline, setHeadline] = useState(slide.headline);
  const [kickerWord, setKickerWord] = useState(slide.kickerWord ?? '');
  const [ctaLabel, setCtaLabel] = useState(slide.ctaLabel ?? '');
  const [ctaHref, setCtaHref] = useState(slide.ctaHref ?? '');

  async function uploadImage(file: File) {
    setUploading(true);
    const body = new FormData();
    body.set('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body });
    if (res.ok) {
      const { media } = (await res.json()) as { media: { id: string } };
      await setHeroImageAction(slide.id, media.id);
    }
    setUploading(false);
    router.refresh();
  }

  async function save() {
    setSaving(true);
    await updateHeroTextAction(slide.id, { eyebrow, headline, kickerWord, ctaLabel, ctaHref });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <li className="flex flex-col gap-4 rounded-md border border-current/10 p-4 sm:flex-row sm:items-start">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-current/5 sm:w-48">
        {slide.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.imageUrl} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-col gap-2">
            <input
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder="Eyebrow"
              className={field}
            />
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Headline"
              className={field}
            />
            <input
              value={kickerWord}
              onChange={(e) => setKickerWord(e.target.value)}
              placeholder="Kicker word"
              className={field}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="CTA label"
                className={field}
              />
              <input
                value={ctaHref}
                onChange={(e) => setCtaHref(e.target.value)}
                placeholder="CTA link"
                className={field}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="min-h-9 rounded-md bg-[var(--accent)] px-4 text-xs font-medium text-[var(--accent-foreground)] disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="min-h-9 rounded-md border border-current/20 px-4 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {slide.eyebrow && (
              <p className="text-xs uppercase tracking-widest opacity-60">{slide.eyebrow}</p>
            )}
            <p className="font-medium">
              {slide.headline}{' '}
              {slide.kickerWord && <span className="opacity-60">/ {slide.kickerWord}</span>}
            </p>
          </>
        )}
      </div>
      {!editing && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <label className="min-h-11 cursor-pointer rounded-md border border-current/20 px-3 py-2 text-xs">
            {uploading ? 'Uploading…' : 'Image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadImage(f);
                e.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="min-h-11 rounded-md border border-current/20 px-3 text-xs"
          >
            Edit text
          </button>
          <button
            type="button"
            onClick={async () => {
              await toggleHeroActiveAction(slide.id, !slide.isActive);
              router.refresh();
            }}
            className="min-h-11 rounded-md border border-current/20 px-3 text-xs"
          >
            {slide.isActive ? 'Active' : 'Hidden'}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm('Delete this slide?')) return;
              await deleteHeroSlideAction(slide.id);
              router.refresh();
            }}
            className="min-h-11 rounded-md border border-current/20 px-3 text-xs text-red-600 dark:text-red-400"
          >
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

export function HeroManager({ slides }: { slides: HeroSlideRow[] }) {
  const [state, action, pending] = useActionState<HeroFormState, FormData>(
    createHeroSlideAction,
    {},
  );
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
          <HeroSlideItem key={s.id} slide={s} />
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
