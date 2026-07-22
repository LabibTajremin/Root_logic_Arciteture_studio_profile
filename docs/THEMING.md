# Theming & Motion

All theming is **DB-backed** and injected as CSS custom properties on `<html>` during SSR — no flash, no
client-side theme flicker. Everything here is admin-editable from the **Appearance** page with live preview.

> This is the designer/operator reference. The registries and motion engine land in Phase 8; this document is
> the living spec and grows as they do.

## Colour

- **24 accent palettes** (e.g. Obsidian Gold, Terracotta, Sage, Deep Teal…), each defined as `{50…950}` for
  light and dark, tuned so text on the accent passes **WCAG AA in both modes**.
- **Custom hex** picker with a live contrast checker that blocks unreadable choices.
- Dark / light mode with a tiny inline script + cookie to avoid FOUC.

> **Default light-mode base (product owner preference):** light mode is **not** solid white. The default
> surface is a premium warm off-white / cream (`~#faf6f1`), paired with a **muted crimson** accent — refined,
> not bold. The default preset (Editorial Warm) ships these values; studios can still switch to any accent or a
> pure-white surface if they want.

## Background patterns

- **22 pure CSS/SVG patterns** (Fine Grid, Blueprint, Dot Matrix, Terrazzo, Marble Veins, Art Deco Fan…),
  tinted from the accent or a neutral, all driven by a single `--pattern-opacity` variable (0–100%, default 6%).
- Rendered in a `position: fixed`, `pointer-events: none` layer; simplified on low-power devices.

## Fonts & text colour (per-area, product-owner request)

Font choice is **not** a single global pair. The admin can assign a **different font and a different text
colour to each area** of the site — `headings`, `body`, `nav`, `buttons`, `hero`, and `accents`. A global pair
provides the default; any per-area override wins over it. Stored in `theme_settings.font_overrides` (jsonb)
plus base `heading_color` / `body_color`, and injected as scoped CSS variables so a change re-styles just that
area with no flash. All 8 curated font families remain self-hosted via `next/font` (no external font CDN);
custom text colours run through the same WCAG contrast checker as accents.

## Demo content (seed)

A fresh install seeds real demo content so the site looks alive before the studio adds their own: hero
**carousel demo images** and a **demo video**, demo project galleries, members, testimonials, and client logos.
Everything is stored as ordinary `media_assets` / `hero_slides` / project rows, so the admin **replaces every
demo image and the demo video from the panel** — nothing is hardcoded in components.

## Premium controls

Font pairing (8 curated, self-hosted via `next/font`), corner radius, density, grain overlay, glass surfaces,
hero style, project-card style, image aspect ratio, custom cursor, section dividers, logo variants, gallery
watermark, live preview, and Export/Import theme JSON (how presets ship to new clients). Three built-in
presets: **Editorial Warm**, **Architect Mono**, **Luxe Dark**.

## Motion (admin-controlled)

Motion is a first-class setting, not hardcoded. **No component defines its own timing, easing, or distance** —
every animated element reads from CSS variables (`--motion-duration`, `--motion-ease`, `--motion-distance`,
`--motion-stagger`) and a shared config. Registries: scroll reveal (12), hero (8), image hover (8), card hover
(6), text reveal (6), page transition (6), plus cursor and loader styles.

### Guardrails (cannot be overridden by any admin setting)

- `prefers-reduced-motion: reduce` wins over everything → instant or a plain opacity fade.
- Animate `transform` and `opacity` only. Zero CLS — space is reserved before reveal.
- Reveal never hides content if JS fails; elements are visible by default.
- `IntersectionObserver`, animate once by default; no scroll listeners in React state.
- Character-stagger, tilt, custom cursor: desktop + fine-pointer only.
- Smooth scroll (Lenis) off by default, off on touch, off under reduced-motion.
- Public-site animation JS stays within the 180 KB budget (Framer Motion via `LazyMotion` + `domAnimation`).
