'use client';

import { useActionState, useState } from 'react';
import { updateSettingsAction, type SettingsState } from '@/app/(admin)/admin/settings/actions';

const field =
  'min-h-11 rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export interface SettingsValues {
  studioName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  editorVerificationRequired: boolean;
  logoLightMediaId: string;
  logoLightUrl: string;
  logoDarkMediaId: string;
  logoDarkUrl: string;
}

function LogoUploadField({
  name,
  label,
  hint,
  initialMediaId,
  initialUrl,
  previewBackground,
}: {
  name: string;
  label: string;
  hint: string;
  initialMediaId: string;
  initialUrl: string;
  previewBackground: string;
}) {
  const [mediaId, setMediaId] = useState(initialMediaId);
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    const body = new FormData();
    body.set('file', file);
    body.set('altText', `${label} logo`);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      if (res.ok) {
        const { media } = (await res.json()) as { media: { id: string; url: string } };
        setMediaId(media.id);
        setPreviewUrl(media.url);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span>{label}</span>
      <input type="hidden" name={name} value={mediaId} />
      <div className="flex items-center gap-3">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-current/15"
          style={{ background: previewBackground }}
        >
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="" className="h-full w-full object-contain p-2" />
          )}
        </div>
        <label className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-current/15 px-4 text-sm font-medium hover:bg-current/5">
          {uploading ? 'Uploading…' : previewUrl ? 'Replace' : 'Upload'}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
        </label>
      </div>
      <p className="text-xs opacity-60">{hint}</p>
    </div>
  );
}

export function SettingsForm({ current }: { current: SettingsValues }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateSettingsAction,
    {},
  );

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">
        Studio name
        <input name="studioName" defaultValue={current.studioName} required className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Tagline
        <input name="tagline" defaultValue={current.tagline} className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Contact email
        <input
          name="contactEmail"
          type="email"
          defaultValue={current.contactEmail}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Contact phone
        <input name="contactPhone" defaultValue={current.contactPhone} className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm">
        Address
        <input name="address" defaultValue={current.address} className={field} />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LogoUploadField
          name="logoLightMediaId"
          label="Logo (light mode)"
          hint="Shown on light backgrounds. PNG/WebP with a transparent background works best."
          initialMediaId={current.logoLightMediaId}
          initialUrl={current.logoLightUrl}
          previewBackground="#faf6f1"
        />
        <LogoUploadField
          name="logoDarkMediaId"
          label="Logo (dark mode)"
          hint="Shown on dark backgrounds. PNG/WebP with a transparent background works best."
          initialMediaId={current.logoDarkMediaId}
          initialUrl={current.logoDarkUrl}
          previewBackground="#0d0b0a"
        />
      </div>

      <label className="mt-2 flex items-start gap-3 rounded-md border border-current/15 p-4 text-sm">
        <input
          type="checkbox"
          name="editorVerificationRequired"
          defaultChecked={current.editorVerificationRequired}
          className="mt-1"
        />
        <span>
          <span className="font-medium">Require verification for editors</span>
          <span className="mt-1 block opacity-70">
            When on, an editor’s new content waits in the approvals queue until an admin approves
            it. When off, editors publish directly.
          </span>
        </span>
      </label>

      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.saved && <p className="text-sm text-green-700 dark:text-green-400">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 self-start rounded-md bg-[var(--accent)] px-5 font-medium text-[var(--accent-foreground)] disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
