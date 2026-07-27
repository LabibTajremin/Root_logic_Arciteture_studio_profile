'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createContentAction,
  deleteContentAction,
  setContentImageAction,
  updateContentAction,
  type ContentFormState,
} from '@/app/(admin)/admin/content/actions';
import type { ContentEntityConfig } from '@/presentation/components/admin/contentConfig';

export interface ContentItem {
  id: string;
  imageUrl?: string | null;
  [key: string]: unknown;
}

const field =
  'min-h-11 w-full rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

function ItemRow({ config, item }: { config: ContentEntityConfig; item: ContentItem }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of config.fields) v[f.name] = item[f.name] == null ? '' : String(item[f.name]);
    return v;
  });

  async function uploadImage(file: File) {
    setUploading(true);
    const body = new FormData();
    body.set('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body });
    if (res.ok) {
      const { media } = (await res.json()) as { media: { id: string } };
      await setContentImageAction(config.entity, item.id, media.id);
    }
    setUploading(false);
    router.refresh();
  }

  async function save() {
    setSaving(true);
    await updateContentAction(config.entity, item.id, vals);
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  const primary = config.fields[0]!;
  const secondary = config.fields.find((f) => f.type === 'textarea');

  return (
    <li className="flex flex-col gap-3 rounded-md border border-current/10 p-3 sm:flex-row sm:items-center">
      {config.image && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-current/5">
          {item.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="h-full w-full object-contain p-1" />
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-col gap-2">
            {config.fields.map((f) =>
              f.type === 'textarea' ? (
                <textarea
                  key={f.name}
                  value={vals[f.name]}
                  onChange={(e) => setVals((v) => ({ ...v, [f.name]: e.target.value }))}
                  placeholder={f.label}
                  rows={2}
                  className={field}
                />
              ) : (
                <input
                  key={f.name}
                  type={f.type === 'number' ? 'number' : 'text'}
                  value={vals[f.name]}
                  onChange={(e) => setVals((v) => ({ ...v, [f.name]: e.target.value }))}
                  placeholder={f.label}
                  className={field}
                />
              ),
            )}
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
            <p className="font-medium">{String(item[primary.name] ?? '')}</p>
            {secondary && item[secondary.name] != null && (
              <p className="line-clamp-2 text-sm opacity-70">{String(item[secondary.name])}</p>
            )}
          </>
        )}
      </div>
      {!editing && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {config.image && (
            <label className="min-h-9 cursor-pointer rounded-md border border-current/20 px-3 py-1.5 text-xs">
              {uploading ? 'Uploading…' : config.image.label}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadImage(f);
                  e.target.value = '';
                }}
              />
            </label>
          )}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="min-h-9 rounded-md border border-current/20 px-3 text-xs"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm('Delete this item?')) return;
              await deleteContentAction(config.entity, item.id);
              router.refresh();
            }}
            className="min-h-9 rounded-md border border-current/20 px-3 text-xs text-red-600 dark:text-red-400"
          >
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

export function ContentManager({
  config,
  items,
}: {
  config: ContentEntityConfig;
  items: ContentItem[];
}) {
  const boundCreate = createContentAction.bind(null, config.entity);
  const [state, action, pending] = useActionState<ContentFormState, FormData>(boundCreate, {});
  const [imageId, setImageId] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (!pending && !state.error) {
      setImageId('');
      setImagePreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  async function uploadNew(file: File) {
    setImageUploading(true);
    const body = new FormData();
    body.set('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body });
    if (res.ok) {
      const { media } = (await res.json()) as { media: { id: string; url: string } };
      setImageId(media.id);
      setImagePreview(media.url);
    }
    setImageUploading(false);
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-medium">{config.title}</h2>
        <p className="text-sm opacity-60">{config.description}</p>
      </div>

      {items.length > 0 && (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <ItemRow key={item.id} config={config} item={item} />
          ))}
        </ul>
      )}

      <form action={action} className="flex flex-col gap-2 rounded-md border border-current/10 p-3">
        {config.image && (
          <div className="flex items-center gap-3">
            <input type="hidden" name="imageMediaId" value={imageId} />
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-current/5">
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="" className="h-full w-full object-contain p-1" />
              )}
            </div>
            <label className="min-h-9 cursor-pointer rounded-md border border-current/20 px-3 py-1.5 text-xs">
              {imageUploading ? 'Uploading…' : `Upload ${config.image.label.toLowerCase()}`}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadNew(f);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
        )}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {config.fields.map((f) =>
            f.type === 'textarea' ? (
              <textarea
                key={f.name}
                name={f.name}
                placeholder={f.label + (f.required ? ' *' : '')}
                rows={2}
                className={`${field} sm:col-span-2`}
              />
            ) : (
              <input
                key={f.name}
                name={f.name}
                type={f.type === 'number' ? 'number' : 'text'}
                placeholder={f.label + (f.required ? ' *' : '')}
                className={field}
              />
            ),
          )}
        </div>
        {state.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="min-h-10 self-start rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-60"
        >
          {pending ? 'Adding…' : 'Add'}
        </button>
      </form>
    </section>
  );
}
