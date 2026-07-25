import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/infrastructure/auth/auth';
import { getLicenceStatus } from '@/infrastructure/licence/licenceStatus';
import { AdminNav } from '@/presentation/components/admin/AdminNav';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

const NAV: { href: string; label: string; adminOnly?: boolean }[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/services', label: 'Services', adminOnly: true },
  { href: '/admin/content', label: 'Content', adminOnly: true },
  { href: '/admin/blog', label: 'Blog', adminOnly: true },
  { href: '/admin/members', label: 'Team', adminOnly: true },
  { href: '/admin/hero', label: 'Hero', adminOnly: true },
  { href: '/admin/approvals', label: 'Approvals', adminOnly: true },
  { href: '/admin/users', label: 'Users', adminOnly: true },
  { href: '/admin/appearance', label: 'Appearance' },
  { href: '/admin/settings', label: 'Settings', adminOnly: true },
  { href: '/admin/account', label: 'Account' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const { role, name, mustChangePassword } = session.user;
  const licence = getLicenceStatus();

  const initials = (name || 'Admin')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="min-h-screen bg-black/[0.035] dark:bg-white/[0.035]">
      {licence.readOnly && (
        <div className="bg-red-600 px-4 py-2 text-center text-sm font-medium text-white">
          Read-only mode — {licence.reason}. Editing is disabled until the licence is renewed. The
          public site keeps serving.
        </div>
      )}
      {mustChangePassword && (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-black">
          Your account still uses the default password. Please change it in{' '}
          <Link href="/admin/account" className="underline">
            account settings
          </Link>
          .
        </div>
      )}
      <div className="mx-auto flex max-w-7xl flex-col gap-5 p-4 md:flex-row md:p-6">
        <aside className="md:w-64 md:shrink-0">
          <div className="sticky top-6 flex flex-col gap-5 rounded-2xl bg-[var(--accent)] p-5 text-[var(--accent-foreground)] shadow-xl shadow-black/10">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-foreground)]/15 text-sm font-bold">
                M
              </span>
              <span className="text-sm font-semibold tracking-wide">Maapkathi Admin</span>
            </div>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--accent-foreground)]/25 px-3 text-sm transition-colors hover:bg-[var(--accent-foreground)]/10"
            >
              View public site
              <span aria-hidden>↗</span>
            </Link>

            <AdminNav items={NAV.filter((item) => !item.adminOnly || role === 'admin')} />

            <div className="mt-1 flex items-center gap-3 border-t border-[var(--accent-foreground)]/15 pt-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-foreground)]/15 text-xs font-bold">
                {initials || 'A'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="text-xs capitalize opacity-70">{role}</p>
              </div>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/login' });
                }}
              >
                <button
                  type="submit"
                  title="Sign out"
                  className="rounded-lg border border-[var(--accent-foreground)]/25 px-2.5 py-1.5 text-xs transition-colors hover:bg-[var(--accent-foreground)]/10"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 rounded-2xl border border-current/10 bg-[var(--background)] p-6 shadow-sm md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
