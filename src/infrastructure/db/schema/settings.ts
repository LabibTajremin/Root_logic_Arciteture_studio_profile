import { boolean, jsonb, pgTable, smallint, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from '@/infrastructure/db/schema/_common';
import type { FontArea, FontAreaOverride } from '@/domain/entities/Settings';

export const siteSettings = pgTable(
  'site_settings',
  {
    tenantId: uuid('tenant_id').primaryKey(),
    studioName: text('studio_name').notNull(),
    tagline: text('tagline'),
    logoLightMediaId: uuid('logo_light_media_id'),
    logoDarkMediaId: uuid('logo_dark_media_id'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    whatsapp: text('whatsapp'),
    address: text('address'),
    socials: jsonb('socials').$type<Record<string, string>>().notNull().default({}),
    navConfig: jsonb('nav_config').$type<unknown>(),
    footer: jsonb('footer').$type<unknown>(),
    editorVerificationRequired: boolean('editor_verification_required').notNull().default(true),
    blogEnabled: boolean('blog_enabled').notNull().default(false),
    visionMissionEnabled: boolean('vision_mission_enabled').notNull().default(false),
    visionText: text('vision_text'),
    missionText: text('mission_text'),
    // When false, the header shows only the logo image (for logos that already include the name).
    logoShowTitle: boolean('logo_show_title').notNull().default(true),
    // Public-site admin login shield icon (top right of the header). Some studios don't
    // want a visible admin entry point; when off, the settings page shows the /login URL
    // so the admin can bookmark it before the button disappears.
    showAdminShield: boolean('show_admin_shield').notNull().default(true),
    // Admin-set expected media aspect ratios; surfaced as upload helper text.
    mediaRatios: jsonb('media_ratios').$type<Record<string, string>>().notNull().default({
      heroImage: '16:9',
      heroVideo: '16:9',
      projectCover: '4:5',
      projectGallery: '4:5',
      memberPhoto: '3:4',
      ogImage: '1.91:1',
    }),
    ...timestamps,
  },
  (t) => [uniqueIndex('uniq_site_settings_tenant').on(t.tenantId)],
);

export const themeSettings = pgTable(
  'theme_settings',
  {
    tenantId: uuid('tenant_id').primaryKey(),
    mode: text('mode').notNull().default('system'),
    accentId: text('accent_id').notNull().default('oxblood'),
    customAccentHex: text('custom_accent_hex'),
    patternId: text('pattern_id').notNull().default('none'),
    patternOpacity: smallint('pattern_opacity').notNull().default(6),
    fontPairId: text('font_pair_id').notNull().default('fraunces-manrope'),
    // Per-area font + colour overrides (product-owner request).
    fontOverrides: jsonb('font_overrides')
      .$type<Partial<Record<FontArea, FontAreaOverride>>>()
      .notNull()
      .default({}),
    headingColorHex: text('heading_color_hex'),
    bodyColorHex: text('body_color_hex'),
    radius: text('radius').notNull().default('subtle'),
    density: text('density').notNull().default('comfortable'),
    motionLevel: text('motion_level').notNull().default('refined'),
    grain: boolean('grain').notNull().default(false),
    glass: boolean('glass').notNull().default(true),
    heroStyle: text('hero_style').notNull().default('full-bleed'),
    // Motion engine (§7.4) — all admin-controlled, read as CSS vars.
    motionPreset: text('motion_preset').notNull().default('refined'),
    scrollRevealStyle: text('scroll_reveal_style').notNull().default('fade-up-soft'),
    heroAnimation: text('hero_animation').notNull().default('ken-burns-drift'),
    imageHoverStyle: text('image_hover_style').notNull().default('zoom'),
    cardHoverStyle: text('card_hover_style').notNull().default('lift-shadow'),
    pageTransition: text('page_transition').notNull().default('fade'),
    textRevealStyle: text('text_reveal_style').notNull().default('mask-slide-up'),
    cursorStyle: text('cursor_style').notNull().default('none'),
    loaderStyle: text('loader_style').notNull().default('none'),
    scrollProgress: boolean('scroll_progress').notNull().default(false),
    smoothScroll: boolean('smooth_scroll').notNull().default(false),
    parallaxIntensity: smallint('parallax_intensity').notNull().default(20),
    motionSpeed: smallint('motion_speed').notNull().default(100),
    staggerMs: smallint('stagger_ms').notNull().default(70),
    animateOnce: boolean('animate_once').notNull().default(true),
    motionOnMobile: text('motion_on_mobile').notNull().default('reduced'),
    ...timestamps,
  },
  (t) => [uniqueIndex('uniq_theme_settings_tenant').on(t.tenantId)],
);

export const seoSettings = pgTable(
  'seo_settings',
  {
    tenantId: uuid('tenant_id').primaryKey(),
    defaultTitle: text('default_title'),
    defaultDescription: text('default_description'),
    ogImageMediaId: uuid('og_image_media_id'),
    gaId: text('ga_id'),
    gtmId: text('gtm_id'),
    metaPixelId: text('meta_pixel_id'),
    robots: text('robots'),
    ...timestamps,
  },
  (t) => [uniqueIndex('uniq_seo_settings_tenant').on(t.tenantId)],
);
