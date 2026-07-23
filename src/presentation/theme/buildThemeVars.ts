import { ACCENTS_BY_ID, onAccent } from '@/presentation/theme/accents';
import { FONT_PAIRS_BY_ID, RADIUS_SCALE, DENSITY_SCALE } from '@/presentation/theme/fonts';
import { PATTERNS_BY_ID } from '@/presentation/theme/patterns';
import { resolveMotionVars } from '@/presentation/theme/motion';
import type { MotionPreset } from '@/presentation/theme/motion';
import type { ThemeSettings, FontArea } from '@/domain/entities/Settings';

export type Mode = 'light' | 'dark';

const FONT_AREA_VAR: Record<FontArea, string> = {
  headings: '--font-headings',
  body: '--font-body',
  nav: '--font-nav',
  buttons: '--font-buttons',
  hero: '--font-hero',
  accents: '--font-accents',
};

/**
 * Builds the full CSS-variable set for one mode from a tenant's theme settings.
 * Injected on `<html>` during SSR so there is no theme flicker.
 */
export function buildThemeVars(theme: ThemeSettings, mode: Mode): Record<string, string> {
  const accent = ACCENTS_BY_ID.get(theme.accentId);
  const accentHex =
    theme.customAccentHex ?? (accent ? (mode === 'dark' ? accent.dark : accent.light) : '#8f2d3b');

  const pair = FONT_PAIRS_BY_ID.get(theme.fontPairId) ?? FONT_PAIRS_BY_ID.get('fraunces-manrope')!;
  const pattern = PATTERNS_BY_ID.get(theme.patternId) ?? PATTERNS_BY_ID.get('none')!;

  const vars: Record<string, string> = {
    '--accent': accentHex,
    '--accent-foreground': onAccent(accentHex),
    '--pattern-opacity': String(theme.patternOpacity / 100),
    '--pattern-color': 'currentColor',
    '--radius': RADIUS_SCALE[theme.radius] ?? RADIUS_SCALE.subtle!,
    '--density': DENSITY_SCALE[theme.density] ?? DENSITY_SCALE.comfortable!,
    // Global font pair; per-area overrides applied below.
    '--font-headings': pair.display,
    '--font-hero': pair.display,
    '--font-accents': pair.display,
    '--font-body': pair.body,
    '--font-nav': pair.body,
    '--font-buttons': pair.body,
    ...resolveMotionVars(
      {
        motionPreset: theme.motionPreset as MotionPreset,
        motionSpeed: theme.motionSpeed,
        staggerMs: theme.staggerMs,
        parallaxIntensity: theme.parallaxIntensity,
      },
      false,
    ),
  };

  if (theme.headingColorHex) vars['--heading-color'] = theme.headingColorHex;
  if (theme.bodyColorHex) vars['--body-color'] = theme.bodyColorHex;

  // Per-area font + colour overrides win over the global pair.
  for (const [area, override] of Object.entries(theme.fontOverrides ?? {})) {
    if (!override) continue;
    const varName = FONT_AREA_VAR[area as FontArea];
    if (override.fontId) {
      const overridePair = FONT_PAIRS_BY_ID.get(override.fontId);
      if (overridePair) vars[varName] = overridePair.display;
    }
    if (override.colorHex) vars[`${varName}-color`] = override.colorHex;
  }

  vars['--pattern-css'] = pattern.css;
  return vars;
}

/** Serialise a var map into a CSS declaration block (excluding the raw pattern css). */
export function varsToCss(vars: Record<string, string>): string {
  return Object.entries(vars)
    .filter(([k]) => k !== '--pattern-css')
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ');
}
