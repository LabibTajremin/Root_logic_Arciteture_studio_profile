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
    <nav className="flex flex-wrap gap-1 md:flex-col">
      {items.map((item) => {
        const active =
          item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
              active
                ? 'bg-[var(--accent-foreground)] font-semibold text-[var(--accent)] shadow-sm'
                : 'text-[var(--accent-foreground)]/85 hover:bg-[var(--accent-foreground)]/12 hover:text-[var(--accent-foreground)]'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
