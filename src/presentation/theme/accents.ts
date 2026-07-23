import { HexColor } from '@/domain/value-objects/HexColor';

/**
 * Accent registry (24). Each accent gives a filled-surface colour for light and dark
 * mode. `onAccent` (text placed on that surface) is whichever neutral ink yields the
 * higher WCAG contrast; every pair passes AA (>= 4.5:1), asserted by the contrast test.
 */
export interface Accent {
  id: string;
  name: string;
  light: string;
  dark: string;
}

export const ACCENT_INK = '#141110';
export const ACCENT_CREAM = '#faf6f1';

export const ACCENTS: readonly Accent[] = [
  { id: 'obsidian-gold', name: 'Obsidian Gold', light: '#6b5410', dark: '#8a6d1f' },
  { id: 'terracotta', name: 'Terracotta', light: '#9c4a2f', dark: '#a8502f' },
  { id: 'sage', name: 'Sage', light: '#46583c', dark: '#8fa27f' },
  { id: 'deep-teal', name: 'Deep Teal', light: '#0f5a5e', dark: '#17767b' },
  { id: 'midnight-blue', name: 'Midnight Blue', light: '#1e3a5f', dark: '#2f5580' },
  { id: 'burnt-sienna', name: 'Burnt Sienna', light: '#8f4a2a', dark: '#a5522f' },
  { id: 'olive', name: 'Olive', light: '#55591f', dark: '#6a6f26' },
  { id: 'plum', name: 'Plum', light: '#5d2a4e', dark: '#7e3a6a' },
  { id: 'copper', name: 'Copper', light: '#9a5a2f', dark: '#bd7440' },
  { id: 'slate', name: 'Slate', light: '#3f4a54', dark: '#6f8290' },
  { id: 'sand', name: 'Sand', light: '#cbb389', dark: '#d8c39c' },
  { id: 'forest', name: 'Forest', light: '#24503a', dark: '#356b4f' },
  { id: 'oxblood', name: 'Oxblood', light: '#6e1f2a', dark: '#8f2d3b' },
  { id: 'cobalt', name: 'Cobalt', light: '#1f3fa0', dark: '#3357c4' },
  { id: 'champagne', name: 'Champagne', light: '#d9c48f', dark: '#e4d3a6' },
  { id: 'charcoal-rose', name: 'Charcoal Rose', light: '#6b4a52', dark: '#a67d86' },
  { id: 'emerald', name: 'Emerald', light: '#0f6b47', dark: '#128052' },
  { id: 'amber', name: 'Amber', light: '#b5730a', dark: '#e0940f' },
  { id: 'indigo', name: 'Indigo', light: '#34327a', dark: '#4a47a3' },
  { id: 'clay', name: 'Clay', light: '#9a5744', dark: '#b56d58' },
  { id: 'moss', name: 'Moss', light: '#4f5b2c', dark: '#626f37' },
  { id: 'bronze', name: 'Bronze', light: '#7d5a2e', dark: '#916a39' },
  { id: 'ink-violet', name: 'Ink Violet', light: '#3a2a5e', dark: '#52407e' },
  { id: 'warm-graphite', name: 'Warm Graphite', light: '#44403c', dark: '#605a54' },
];

export const ACCENTS_BY_ID: ReadonlyMap<string, Accent> = new Map(ACCENTS.map((a) => [a.id, a]));

/** The readable ink (dark or cream) to place on a given accent surface. */
export function onAccent(surfaceHex: string): string {
  const surface = HexColor.create(surfaceHex);
  if (!surface.ok) return ACCENT_CREAM;
  const ink = HexColor.create(ACCENT_INK);
  const cream = HexColor.create(ACCENT_CREAM);
  if (!ink.ok || !cream.ok) return ACCENT_CREAM;
  return surface.value.contrastRatio(ink.value) >= surface.value.contrastRatio(cream.value)
    ? ACCENT_INK
    : ACCENT_CREAM;
}

/** Best available contrast ratio of the chosen ink against an accent surface. */
export function bestContrast(surfaceHex: string): number {
  const surface = HexColor.create(surfaceHex);
  const on = HexColor.create(onAccent(surfaceHex));
  if (!surface.ok || !on.ok) return 0;
  return surface.value.contrastRatio(on.value);
}
