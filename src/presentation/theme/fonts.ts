/**
 * Curated display/body font pairs (8). Families are self-hosted via next/font in the
 * public-site layer; here we register ids, labels, and CSS fallback stacks so the theme
 * variables always resolve even before the web fonts load.
 */
export interface FontPair {
  id: string;
  name: string;
  display: string;
  body: string;
}

const SERIF_FALLBACK = 'Georgia, "Times New Roman", serif';
const SANS_FALLBACK = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const FONT_PAIRS: readonly FontPair[] = [
  {
    id: 'fraunces-manrope',
    name: 'Fraunces + Manrope',
    display: `"Fraunces", ${SERIF_FALLBACK}`,
    body: `"Manrope", ${SANS_FALLBACK}`,
  },
  {
    id: 'cormorant-inter',
    name: 'Cormorant + Inter',
    display: `"Cormorant Garamond", ${SERIF_FALLBACK}`,
    body: `"Inter", ${SANS_FALLBACK}`,
  },
  {
    id: 'playfair-source',
    name: 'Playfair + Source Sans',
    display: `"Playfair Display", ${SERIF_FALLBACK}`,
    body: `"Source Sans 3", ${SANS_FALLBACK}`,
  },
  {
    id: 'instrument-geist',
    name: 'Instrument Serif + Geist',
    display: `"Instrument Serif", ${SERIF_FALLBACK}`,
    body: `"Geist", ${SANS_FALLBACK}`,
  },
  {
    id: 'libre-inter',
    name: 'Libre Caslon + Inter',
    display: `"Libre Caslon Display", ${SERIF_FALLBACK}`,
    body: `"Inter", ${SANS_FALLBACK}`,
  },
  {
    id: 'dmserif-dmsans',
    name: 'DM Serif + DM Sans',
    display: `"DM Serif Display", ${SERIF_FALLBACK}`,
    body: `"DM Sans", ${SANS_FALLBACK}`,
  },
  {
    id: 'spectral-work',
    name: 'Spectral + Work Sans',
    display: `"Spectral", ${SERIF_FALLBACK}`,
    body: `"Work Sans", ${SANS_FALLBACK}`,
  },
  {
    id: 'bricolage-manrope',
    name: 'Bricolage + Manrope',
    display: `"Bricolage Grotesque", ${SANS_FALLBACK}`,
    body: `"Manrope", ${SANS_FALLBACK}`,
  },
];

export const FONT_PAIRS_BY_ID: ReadonlyMap<string, FontPair> = new Map(
  FONT_PAIRS.map((p) => [p.id, p]),
);

export const RADIUS_SCALE: Record<string, string> = {
  sharp: '0px',
  subtle: '6px',
  soft: '14px',
  pill: '9999px',
};

export const DENSITY_SCALE: Record<string, string> = {
  compact: '0.85',
  comfortable: '1',
  spacious: '1.2',
};
