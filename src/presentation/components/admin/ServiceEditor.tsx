'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addServiceImageAction,
  deleteServiceImageAction,
  setServiceCoverAction,
  updateServiceAction,
} from '@/app/(admin)/admin/services/actions';

export interface EditorService {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  parentId: string | null;
  coverUrl: string | null;
}

export interface GalleryImage {
  id: string;
  url: string;
}

const field =
  'min-h-11 w-full rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export function ServiceEditor({
  service,
  gallery,
}: {
  service: EditorService;
  gallery: GalleryImage[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(service.title);
  const [excerpt, setExcerpt] = useState(service.excerpt ?? '');
  const [body, setBody] = useState(service.body ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  async function uploadCover(file: File) {
    setCoverUploading(true);
    const form = new FormData();
    form.set('file', file);
    form.set('altText', service.title);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    if (res.ok) {
      const { media } = (await res.json()) as { media: { id: string } };
      await setServiceCoverAction(service.id, media.id);
    }
    setCoverUploading(false);
    router.refresh();
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    await updateServiceAction(service.id, { title, excerpt, body });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  async function uploadImages(files: FileList) {
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.set('file', file);
      form.set('altText', service.title);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      if (res.ok) {
        const { media } = (await res.json()) as { media: { id: string } };
        await addServiceImageAction(service.id, media.id);
      }
    }
    setUploading(false);
    router.refresh();
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 text-sm">
          <span>Cover photo (shown at the top of the service page)</span>
          <div className="flex items-center gap-3">
            <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-md bg-current/5">
              {service.coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={service.coverUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <label className="min-h-11 cursor-pointer rounded-md border border-current/20 px-3 py-2 text-sm">
              {coverUploading ? 'Uploading…' : service.coverUrl ? 'Replace cover' : 'Upload cover'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadCover(f);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          <p className="text-xs opacity-60">Recommended ratio 16:9.</p>
        </div>
        <label className="flex flex-col gap-1.5 text-sm">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Short excerpt
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Body (full description shown on the service page)
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className={field}
          />
        </label>
        {saved && <p className="text-sm text-green-700 dark:text-green-400">Saved.</p>}
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="min-h-11 self-start rounded-md bg-[var(--accent)] px-5 font-medium text-[var(--accent-foreground)] disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save details'}
        </button>
      </div>

      <div className="flex flex-col gap-3 border-t border-current/10 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Gallery images</h2>
          <label className="min-h-11 cursor-pointer rounded-md border border-current/20 px-4 py-2 text-sm">
            {uploading ? 'Uploading…' : 'Add images'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) void uploadImages(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
        </div>
        <p className="text-sm opacity-60">
          These images appear on the public service page. You can select several at once.
        </p>
        {gallery.length === 0 ? (
          <p className="opacity-60">No images yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {gallery.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-md bg-current/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={async () => {
                    await deleteServiceImageAction(service.id, img.id);
                    router.refresh();
                  }}
                  className="absolute right-1 top-1 rounded bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
