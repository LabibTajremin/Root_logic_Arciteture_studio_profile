import Link from 'next/link';

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
};

export function SiteFooter({
  studioName,
  email,
  phone,
  whatsapp,
  address,
  socials,
}: {
  studioName: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  socials: Record<string, string>;
}) {
  const socialEntries = Object.entries(socials).filter(([, url]) => url);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-current/10">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-14 md:grid-cols-3 md:px-6">
        <div>
          <p className="text-lg font-semibold" style={{ fontFamily: 'var(--font-hero)' }}>
            {studioName}
          </p>
          {address && <p className="mt-3 max-w-xs text-sm opacity-70">{address}</p>}
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <p className="mb-1 text-xs uppercase tracking-[0.2em] opacity-50">Contact</p>
          {email && (
            <a href={`mailto:${email}`} className="opacity-80 hover:opacity-100">
              {email}
            </a>
          )}
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="opacity-80 hover:opacity-100">
              {phone}
            </a>
          )}
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-80 hover:opacity-100"
            >
              WhatsApp
            </a>
          )}
        </div>

        {socialEntries.length > 0 && (
          <div className="flex flex-col gap-2 text-sm">
            <p className="mb-1 text-xs uppercase tracking-[0.2em] opacity-50">Follow</p>
            {socialEntries.map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 hover:opacity-100"
              >
                {SOCIAL_LABELS[platform] ?? platform}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-current/10 px-4 py-6 text-center text-xs opacity-50 md:px-6">
        © {year} {studioName}. ·{' '}
        <Link href="/contact" className="hover:opacity-100">
          Get in touch
        </Link>
      </div>
    </footer>
  );
}
