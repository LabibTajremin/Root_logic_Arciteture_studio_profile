'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface AdminNavItem {
  href: string;
  label: string;
}

export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 md:flex-col">
      {items.map((item) => {
        const active =
          item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? 'bg-[var(--accent)] font-medium text-[var(--accent-foreground)]'
                : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
