'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  createMemberAction,
  deleteMemberAction,
  setMemberPhotoAction,
  togglePublishedAction,
  updateMemberAction,
  type MemberFormState,
} from '@/app/(admin)/admin/members/actions';

export interface MemberRow {
  id: string;
  name: string;
  roleTitle: string | null;
  bio: string | null;
  photoUrl: string | null;
  status: string;
}

const field =
  'min-h-11 w-full rounded-md border border-current/15 bg-transparent px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

function MemberRowItem({ member }: { member: MemberRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [roleTitle, setRoleTitle] = useState(member.roleTitle ?? '');
  const [bio, setBio] = useState(member.bio ?? '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function uploadPhoto(file: File) {
    setUploading(true);
    const body = new FormData();
    body.set('file', file);
    body.set('altText', member.name);
    const res = await fetch('/api/admin/upload', { method: 'POST', body });
    if (res.ok) {
      const { media } = (await res.json()) as { media: { id: string } };
      await setMemberPhotoAction(member.id, media.id);
    }
    setUploading(false);
    router.refresh();
  }

  async function save() {
    setSaving(true);
    await updateMemberAction(member.id, { name, roleTitle, bio });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return (
    <li className="flex flex-col gap-4 rounded-md border border-current/10 p-4 sm:flex-row sm:items-start">
      <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-md bg-current/5 sm:w-28">
        {member.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.photoUrl} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-col gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className={field}
            />
            <input
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="Role"
              className={field}
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bio"
              rows={2}
              className={field}
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
            <p className="font-medium">{member.name}</p>
            {member.roleTitle && <p className="text-sm opacity-60">{member.roleTitle}</p>}
            {member.bio && <p className="mt-1 text-sm opacity-70">{member.bio}</p>}
          </>
        )}
      </div>
      {!editing && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <label className="min-h-11 cursor-pointer rounded-md border border-current/20 px-3 py-2 text-xs">
            {uploading ? 'Uploading…' : 'Photo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadPhoto(f);
                e.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="min-h-11 rounded-md border border-current/20 px-3 text-xs"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={async () => {
              await togglePublishedAction(member.id, member.status !== 'published');
              router.refresh();
            }}
            className="min-h-11 rounded-md border border-current/20 px-3 text-xs"
          >
            {member.status === 'published' ? 'Published' : 'Hidden'}
          </button>
          <button
            type="button"
            onClick={async () => {
              if (!confirm(`Remove ${member.name}?`)) return;
              await deleteMemberAction(member.id);
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

export function MemberManager({ members }: { members: MemberRow[] }) {
  const [state, action, pending] = useActionState<MemberFormState, FormData>(
    createMemberAction,
    {},
  );

  return (
    <div className="flex flex-col gap-8">
      <ul className="flex flex-col gap-4">
        {members.length === 0 && (
          <li className="opacity-60">No team members yet — add one below.</li>
        )}
        {members.map((m) => (
          <MemberRowItem key={m.id} member={m} />
        ))}
      </ul>

      <form
        action={action}
        className="flex max-w-xl flex-col gap-3 border-t border-current/10 pt-6"
      >
        <h2 className="text-lg font-medium">Add a team member</h2>
        <input name="name" placeholder="Name" required className={field} />
        <input name="roleTitle" placeholder="Role (optional)" className={field} />
        <textarea name="bio" placeholder="Bio (optional)" rows={2} className={field} />
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
          {pending ? 'Adding…' : 'Add member'}
        </button>
      </form>
    </div>
  );
}
