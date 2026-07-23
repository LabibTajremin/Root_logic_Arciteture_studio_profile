import type { SeoSettings, SiteSettings, ThemeSettings } from '@/domain/entities/Settings';

export interface SiteSettingsRepository {
  get(tenantId: string): Promise<SiteSettings | null>;
  upsert(settings: SiteSettings): Promise<SiteSettings>;
}

export interface ThemeSettingsRepository {
  get(tenantId: string): Promise<ThemeSettings | null>;
  upsert(settings: ThemeSettings): Promise<ThemeSettings>;
}

export interface SeoSettingsRepository {
  get(tenantId: string): Promise<SeoSettings | null>;
  upsert(settings: SeoSettings): Promise<SeoSettings>;
}
