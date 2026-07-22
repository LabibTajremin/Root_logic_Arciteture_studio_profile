import { eq } from 'drizzle-orm';
import { getDb } from '@/infrastructure/db/client';
import { themeSettings } from '@/infrastructure/db/schema';
import { toThemeSettings } from '@/infrastructure/db/mappers/themeMapper';
import { resolveActiveTenantId } from '@/infrastructure/auth/tenant';
import type { ThemeSettings } from '@/domain/entities/Settings';

/** Sensible defaults matching the schema, used when no theme row exists yet. */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  tenantId: '',
  mode: 'system',
  accentId: 'oxblood',
  customAccentHex: null,
  patternId: 'none',
  patternOpacity: 6,
  fontPairId: 'fraunces-manrope',
  fontOverrides: {},
  headingColorHex: null,
  bodyColorHex: null,
  radius: 'subtle',
  density: 'comfortable',
  motionLevel: 'refined',
  grain: false,
  glass: true,
  heroStyle: 'full-bleed',
  motionPreset: 'refined',
  scrollRevealStyle: 'fade-up-soft',
  heroAnimation: 'ken-burns-drift',
  imageHoverStyle: 'zoom',
  cardHoverStyle: 'lift-shadow',
  pageTransition: 'fade',
  textRevealStyle: 'mask-slide-up',
  cursorStyle: 'none',
  loaderStyle: 'none',
  scrollProgress: false,
  smoothScroll: false,
  parallaxIntensity: 20,
  motionSpeed: 100,
  staggerMs: 70,
  animateOnce: true,
  motionOnMobile: 'reduced',
};

/**
 * Loads the active tenant's theme, falling back to defaults if the DB is unreachable
 * (e.g. during static generation) or no row exists — so the site always renders.
 */
export async function getActiveTheme(): Promise<ThemeSettings> {
  try {
    const tenantId = await resolveActiveTenantId();
    if (!tenantId) return DEFAULT_THEME_SETTINGS;
    const [row] = await getDb()
      .select()
      .from(themeSettings)
      .where(eq(themeSettings.tenantId, tenantId))
      .limit(1);
    return row ? toThemeSettings(row) : { ...DEFAULT_THEME_SETTINGS, tenantId };
  } catch {
    return DEFAULT_THEME_SETTINGS;
  }
}
