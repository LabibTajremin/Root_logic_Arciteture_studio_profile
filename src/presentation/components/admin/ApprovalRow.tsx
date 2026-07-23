'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveProjectAction, rejectProjectAction } from '@/app/(admin)/admin/approvals/actions';

export function ApprovalRow({
  project,
}: {
  project: { id: string; title: string; slug: string; summary: string | null };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setBusy(true);
    setError(null);
    const result = await approveProjectAction(project.id);
    setBusy(false);
    if (result?.error) setError(result.error);
    else router.refresh();
  }

  async function reject() {
    setBusy(true);
    setError(null);
    const result = await rejectProjectAction(project.id, 'Changes requested');
    setBusy(false);
    if (result?.error) setError(result.error);
    else router.refresh();
  }

  return (
    <li className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium">{project.title}</p>
          {project.summary && <p className="text-sm opacity-70">{project.summary}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={approve}
            disabled={busy}
            className="min-h-11 rounded-md bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            onClick={reject}
            disabled={busy}
            className="min-h-11 rounded-md border border-current/20 px-4 text-sm disabled:opacity-60"
          >
            Request changes
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </li>
  );
}
