import type { Metadata } from 'next';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import { getSiteSettings } from '@/infrastructure/db/queries/publicQueries';
import { ContactForm } from '@/presentation/components/public/ContactForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch to discuss your project.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const tenantId = await resolveActiveTenantId();
  const site = tenantId ? await getSiteSettings(tenantId) : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-20 md:px-6 md:py-28">
      <p className="text-xs uppercase tracking-[0.2em] opacity-60">Say hello</p>
      <h1
        className="text-[clamp(2.2rem,6vw,4rem)] font-semibold tracking-tight"
        style={{ fontFamily: 'var(--font-headings)' }}
      >
        Get in touch
      </h1>

      <dl className="mt-12 flex flex-col gap-6">
        {site?.contactEmail && (
          <div>
            <dt className="text-sm opacity-60">Email</dt>
            <dd>
              <a href={`mailto:${site.contactEmail}`} className="underline underline-offset-4">
                {site.contactEmail}
              </a>
            </dd>
          </div>
        )}
        {site?.contactPhone && (
          <div>
            <dt className="text-sm opacity-60">Phone</dt>
            <dd>{site.contactPhone}</dd>
          </div>
        )}
        {site?.address && (
          <div>
            <dt className="text-sm opacity-60">Studio</dt>
            <dd>{site.address}</dd>
          </div>
        )}
      </dl>

      <div className="mt-14">
        <h2 className="mb-6 text-xl font-medium tracking-tight">Send us a message</h2>
        <ContactForm />
      </div>
    </main>
  );
}
