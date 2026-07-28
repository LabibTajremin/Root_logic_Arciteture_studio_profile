import Link from 'next/link';
import type { NavItem } from '@/presentation/components/public/SiteHeader';

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  youtube: 'YouTube',
  twitter: 'X (Twitter)',
};

export interface SiteFooterProps {
  studioName: string;
  tagline: string | null;
  nav: NavItem[];
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  socials: Readonly<Record<string, string>>;
}

/**
 * Site-wide footer: internal links (crawl depth + anchor text), NAP (name/address/phone)
 * for local SEO, and an Organization JSON-LD block so search engines get structured
 * contact data without scraping it from prose.
 */
export function SiteFooter({
  studioName,
  tagline,
  nav,
  email,
  phone,
  whatsapp,
  address,
  socials,
}: SiteFooterProps) {
  const year = new Date().getFullYear();
  const socialEntries = Object.entries(socials).filter(([, url]) => url);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: studioName,
    ...(tagline ? { description: tagline } : {}),
    ...(address ? { address: { '@type': 'PostalAddress', streetAddress: address } } : {}),
    ...(email || phone
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            ...(email ? { email } : {}),
            ...(phone ? { telephone: phone } : {}),
          },
        }
      : {}),
    ...(socialEntries.length ? { sameAs: socialEntries.map(([, url]) => url) } : {}),
  };

  return (
    <footer className="border-t border-current/10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 sm:grid-cols-2 md:px-6 md:py-20 lg:grid-cols-4 lg:gap-8">
        <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
          <p
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: 'var(--font-hero)' }}
          >
            {studioName}
          </p>
          {tagline && <p className="max-w-xs text-sm opacity-70">{tagline}</p>}
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.2em] opacity-50">Explore</p>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center text-sm opacity-80 hover:opacity-100 sm:min-h-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.2em] opacity-50">Contact</p>
          {email && (
            <a
              href={`mailto:${email}`}
              className="inline-flex min-h-11 items-center text-sm opacity-80 hover:opacity-100 sm:min-h-0"
            >
              {email}
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, '')}`}
              className="inline-flex min-h-11 items-center text-sm opacity-80 hover:opacity-100 sm:min-h-0"
            >
              {phone}
            </a>
          )}
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-sm opacity-80 hover:opacity-100 sm:min-h-0"
            >
              WhatsApp
            </a>
          )}
          {address && <p className="max-w-xs text-sm leading-relaxed opacity-70">{address}</p>}
        </div>

        {socialEntries.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.2em] opacity-50">Follow</p>
            {socialEntries.map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-sm opacity-80 hover:opacity-100 sm:min-h-0"
              >
                {SOCIAL_LABELS[platform] ?? platform}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-current/10">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs opacity-50 md:px-6">
          © {year} {studioName}. ·{' '}
          <Link href="/contact" className="hover:opacity-100">
            Get in touch
          </Link>
        </div>
      </div>
    </footer>
  );
}
