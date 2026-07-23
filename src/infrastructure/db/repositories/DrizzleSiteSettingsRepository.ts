import { eq } from 'drizzle-orm';
import { siteSettings } from '@/infrastructure/db/schema';
import { toSiteSettings } from '@/infrastructure/db/mappers/siteMapper';
import type { Db } from '@/infrastructure/db/repositories/types';
import type { SiteSettings } from '@/domain/entities/Settings';
import type { SiteSettingsRepository } from '@/domain/repositories/SettingsRepository';

export class DrizzleSiteSettingsRepository implements SiteSettingsRepository {
  constructor(private readonly db: Db) {}

  async get(tenantId: string): Promise<SiteSettings | null> {
    const [row] = await this.db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.tenantId, tenantId))
      .limit(1);
    return row ? toSiteSettings(row) : null;
  }

  async upsert(settings: SiteSettings): Promise<SiteSettings> {
    const values = {
      tenantId: settings.tenantId,
      studioName: settings.studioName,
      tagline: settings.tagline,
      logoLightMediaId: settings.logoLightMediaId,
      logoDarkMediaId: settings.logoDarkMediaId,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      whatsapp: settings.whatsapp,
      address: settings.address,
      socials: settings.socials,
      navConfig: settings.navConfig,
      footer: settings.footer,
      editorVerificationRequired: settings.editorVerificationRequired,
      updatedAt: new Date(),
    };
    const [row] = await this.db
      .insert(siteSettings)
      .values(values)
      .onConflictDoUpdate({ target: siteSettings.tenantId, set: values })
      .returning();
    return toSiteSettings(row!);
  }
}
