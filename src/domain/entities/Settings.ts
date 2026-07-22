export interface SiteSettings {
  readonly tenantId: string;
  readonly studioName: string;
  readonly tagline: string | null;
  readonly logoLightMediaId: string | null;
  readonly logoDarkMediaId: string | null;
  readonly contactEmail: string | null;
  readonly contactPhone: string | null;
  readonly whatsapp: string | null;
  readonly address: string | null;
  readonly socials: Readonly<Record<string, string>>;
  readonly navConfig: unknown;
  readonly footer: unknown;
  /** Admin-controlled toggle gating editor content (see ContentVisibilityPolicy). */
  readonly editorVerificationRequired: boolean;
}

/** Editable text areas that can each take their own font and colour. */
export const FONT_AREAS = ['headings', 'body', 'nav', 'buttons', 'hero', 'accents'] as const;
export type FontArea = (typeof FONT_AREAS)[number];

/** Per-area font + colour override. Any field null means "inherit the global pair". */
export interface FontAreaOverride {
  readonly fontId: string | null;
  readonly colorHex: string | null;
}

export interface ThemeSettings {
  readonly tenantId: string;
  readonly mode: 'light' | 'dark' | 'system';
  readonly accentId: string;
  readonly customAccentHex: string | null;
  readonly patternId: string;
  readonly patternOpacity: number;
  /** Global display/body font pair id; per-area overrides win over it. */
  readonly fontPairId: string;
  /** Admin can use a different font (and colour) in each area — see FONT_AREAS. */
  readonly fontOverrides: Readonly<Partial<Record<FontArea, FontAreaOverride>>>;
  /** Base text colours; per-area overrides in fontOverrides take precedence. */
  readonly headingColorHex: string | null;
  readonly bodyColorHex: string | null;
  readonly radius: string;
  readonly density: string;
  readonly motionLevel: string;
  readonly grain: boolean;
  readonly glass: boolean;
  readonly heroStyle: string;
}

export interface SeoSettings {
  readonly tenantId: string;
  readonly defaultTitle: string | null;
  readonly defaultDescription: string | null;
  readonly ogImageMediaId: string | null;
  readonly gaId: string | null;
  readonly gtmId: string | null;
  readonly metaPixelId: string | null;
  readonly robots: string | null;
}
