'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createServiceAction,
  deleteServiceAction,
  toggleServicePublishedAction,
  updateServiceAction,
  type ServiceFormState,
} from '@/app/(admin)/admin/services/actions';

export interface ServiceRow {
  id: string;
  title: string;
  excerpt: string | null;
  parentId: string | null;
  status: string;
}

const field =
  'min-h-11 w-full rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

function ServiceRowItem({ service, indent }: { service: ServiceRow; indent: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(service.title);
  const [excerpt, setExcerpt] = useState(service.excerpt ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await updateServiceAction(service.id, { title, excerpt });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <li
      className={`flex flex-col gap-3 rounded-md border border-current/10 p-4 sm:flex-row sm:items-center ${
        indent ? 'ml-6' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-col gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={field}
              placeholder="Title"
            />
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className={field}
              placeholder="Excerpt"
            />
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
            <p className="font-medium">
              {indent && <span className="opacity-40">↳ </span>}
              {service.title}
            </p>
            {service.excerpt && <p className="text-sm opacity-70">{service.excerpt}</p>}
          </>
        )}
      </div>
      {!editing && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
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
              await toggleServicePublishedAction(service.id, service.status !== 'published');
              router.refresh();
            }}
            className="min-h-9 rounded-md border border-current/20 px-3 text-xs"
          >
            {service.status === 'published' ? 'Published' : 'Hidden'}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm(`Delete "${service.title}"?`)) return;
              await deleteServiceAction(service.id);
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

export function ServiceManager({ services }: { services: ServiceRow[] }) {
  const [state, action, pending] = useActionState<ServiceFormState, FormData>(
    createServiceAction,
    {},
  );
  const topLevel = services.filter((s) => !s.parentId);

  return (
    <div className="flex flex-col gap-8">
      <ul className="flex flex-col gap-3">
        {services.length === 0 && (
          <li className="opacity-60">No services yet — add a category below.</li>
        )}
        {topLevel.map((cat) => (
          <div key={cat.id} className="flex flex-col gap-3">
            <ServiceRowItem service={cat} indent={false} />
            {services
              .filter((s) => s.parentId === cat.id)
              .map((child) => (
                <ServiceRowItem key={child.id} service={child} indent />
              ))}
          </div>
        ))}
      </ul>

      <form
        action={action}
        className="flex max-w-xl flex-col gap-3 border-t border-current/10 pt-6"
      >
        <h2 className="text-lg font-medium">Add a service</h2>
        <input name="title" placeholder="Title" required className={field} />
        <textarea name="excerpt" placeholder="Excerpt (optional)" rows={2} className={field} />
        <label className="flex flex-col gap-1.5 text-sm">
          Category
          <select name="parentId" defaultValue="" className={field}>
            <option value="">— Top-level category —</option>
            {topLevel.map((cat) => (
              <option key={cat.id} value={cat.id}>
                Sub-service of: {cat.title}
              </option>
            ))}
          </select>
        </label>
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
          {pending ? 'Adding…' : 'Add service'}
        </button>
      </form>
    </div>
  );
}
