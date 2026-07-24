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
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const { role, name, mustChangePassword } = session.user;
  const licence = getLicenceStatus();

  return (
    <div className="min-h-screen">
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
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row md:gap-10">
        <aside className="md:w-56 md:shrink-0">
          <p className="mb-4 text-xs uppercase tracking-widest opacity-60">Maapkathi Admin</p>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 inline-flex min-h-9 items-center gap-1.5 rounded-md border border-current/15 px-3 text-sm hover:bg-current/5"
          >
            View public site
            <span aria-hidden>↗</span>
          </Link>
          <AdminNav items={NAV.filter((item) => !item.adminOnly || role === 'admin')} />
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
            className="mt-6"
          >
            <p className="mb-2 text-xs opacity-60">
              {name} · {role}
            </p>
            <button type="submit" className="text-sm underline opacity-80">
              Sign out
            </button>
          </form>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
