import type { InferSelectModel } from 'drizzle-orm';
import type { siteSettings } from '@/infrastructure/db/schema';
import type { SiteSettings } from '@/domain/entities/Settings';

type SiteRow = InferSelectModel<typeof siteSettings>;

export function toSiteSettings(row: SiteRow): SiteSettings {
  return {
    tenantId: row.tenantId,
    studioName: row.studioName,
    tagline: row.tagline,
    logoLightMediaId: row.logoLightMediaId,
    logoDarkMediaId: row.logoDarkMediaId,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    whatsapp: row.whatsapp,
    address: row.address,
    socials: row.socials,
    navConfig: row.navConfig,
    footer: row.footer,
    editorVerificationRequired: row.editorVerificationRequired,
  };
}
