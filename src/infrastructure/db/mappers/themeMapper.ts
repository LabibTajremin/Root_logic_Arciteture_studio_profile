import type { InferSelectModel } from 'drizzle-orm';
import type { themeSettings } from '@/infrastructure/db/schema';
import type { ThemeSettings } from '@/domain/entities/Settings';

type ThemeRow = InferSelectModel<typeof themeSettings>;

export function toThemeSettings(row: ThemeRow): ThemeSettings {
  return {
    tenantId: row.tenantId,
    mode: row.mode as ThemeSettings['mode'],
    accentId: row.accentId,
    customAccentHex: row.customAccentHex,
    patternId: row.patternId,
    patternOpacity: row.patternOpacity,
    fontPairId: row.fontPairId,
    fontOverrides: row.fontOverrides,
    headingColorHex: row.headingColorHex,
    bodyColorHex: row.bodyColorHex,
    radius: row.radius,
    density: row.density,
    motionLevel: row.motionLevel,
    grain: row.grain,
    glass: row.glass,
    heroStyle: row.heroStyle,
    motionPreset: row.motionPreset,
    scrollRevealStyle: row.scrollRevealStyle,
    heroAnimation: row.heroAnimation,
    imageHoverStyle: row.imageHoverStyle,
    cardHoverStyle: row.cardHoverStyle,
    pageTransition: row.pageTransition,
    textRevealStyle: row.textRevealStyle,
    cursorStyle: row.cursorStyle,
    loaderStyle: row.loaderStyle,
    scrollProgress: row.scrollProgress,
    smoothScroll: row.smoothScroll,
    parallaxIntensity: row.parallaxIntensity,
    motionSpeed: row.motionSpeed,
    staggerMs: row.staggerMs,
    animateOnce: row.animateOnce,
    motionOnMobile: row.motionOnMobile,
  };
}
