/**
 * Motion engine (§7.4). Every animated element reads these CSS variables and the shared
 * registries below — no component hardcodes a duration, easing, or distance. One admin
 * control therefore restyles the whole site.
 */

export interface RegistryItem {
  id: string;
  name: string;
}

export const SCROLL_REVEAL_STYLES: readonly RegistryItem[] = [
  { id: 'none', name: 'None' },
  { id: 'fade', name: 'Fade' },
  { id: 'fade-up', name: 'Fade Up' },
  { id: 'fade-up-soft', name: 'Fade Up Soft' },
  { id: 'slide-in-side', name: 'Slide In From Side' },
  { id: 'scale-in', name: 'Scale In' },
  { id: 'blur-in', name: 'Blur In' },
  { id: 'clip-reveal', name: 'Clip Reveal' },
  { id: 'curtain-wipe', name: 'Curtain Wipe' },
  { id: 'line-draw', name: 'Line Draw' },
  { id: 'stagger-grid', name: 'Stagger Grid' },
  { id: 'perspective-tilt', name: 'Perspective Tilt' },
];

export const HERO_ANIMATIONS: readonly RegistryItem[] = [
  { id: 'static', name: 'Static' },
  { id: 'ken-burns-drift', name: 'Ken Burns Drift' },
  { id: 'crossfade-slides', name: 'Crossfade Slides' },
  { id: 'split-curtain', name: 'Split Curtain' },
  { id: 'masked-word-swap', name: 'Masked Word Swap' },
  { id: 'zoom-out-on-load', name: 'Zoom Out On Load' },
  { id: 'video-loop', name: 'Video Loop' },
  { id: 'layered-parallax', name: 'Layered Parallax' },
];

export const IMAGE_HOVER_STYLES: readonly RegistryItem[] = [
  { id: 'none', name: 'None' },
  { id: 'zoom', name: 'Zoom' },
  { id: 'zoom-darken', name: 'Zoom + Darken' },
  { id: 'duotone-colour', name: 'Duotone → Colour' },
  { id: 'grayscale-colour', name: 'Grayscale → Colour' },
  { id: 'caption-slide-up', name: 'Reveal Caption Slide-Up' },
  { id: 'accent-border-draw', name: 'Accent Border Draw' },
  { id: 'tilt-follow', name: 'Tilt Follow Cursor' },
];

export const CARD_HOVER_STYLES: readonly RegistryItem[] = [
  { id: 'none', name: 'None' },
  { id: 'lift-shadow', name: 'Lift + Shadow' },
  { id: 'accent-underline', name: 'Accent Underline Draw' },
  { id: 'border-trace', name: 'Border Trace' },
  { id: 'inner-glow', name: 'Inner Glow' },
  { id: 'content-shift', name: 'Content Shift' },
];

export const TEXT_REVEAL_STYLES: readonly RegistryItem[] = [
  { id: 'none', name: 'None' },
  { id: 'fade', name: 'Fade' },
  { id: 'mask-slide-up', name: 'Mask Slide-Up' },
  { id: 'word-stagger', name: 'Word Stagger' },
  { id: 'character-stagger', name: 'Character Stagger' },
  { id: 'blur-focus', name: 'Blur Focus' },
];

export const PAGE_TRANSITIONS: readonly RegistryItem[] = [
  { id: 'none', name: 'None' },
  { id: 'fade', name: 'Fade' },
  { id: 'accent-wipe', name: 'Accent Wipe' },
  { id: 'curtain-up', name: 'Curtain Up' },
  { id: 'slide-push', name: 'Slide Push' },
  { id: 'logo-mask', name: 'Logo Mask' },
];

export type MotionPreset = 'off' | 'subtle' | 'refined' | 'expressive' | 'custom';

interface MotionBase {
  durationMs: number;
  ease: string;
  distancePx: number;
  staggerMs: number;
}

const PRESETS: Record<Exclude<MotionPreset, 'custom'>, MotionBase> = {
  off: { durationMs: 0, ease: 'linear', distancePx: 0, staggerMs: 0 },
  subtle: { durationMs: 450, ease: 'cubic-bezier(0.16, 1, 0.3, 1)', distancePx: 8, staggerMs: 50 },
  refined: {
    durationMs: 600,
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    distancePx: 12,
    staggerMs: 70,
  },
  expressive: {
    durationMs: 750,
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    distancePx: 20,
    staggerMs: 90,
  },
};

export interface MotionInput {
  motionPreset: MotionPreset;
  motionSpeed: number; // 50–150 (% multiplier on duration)
  staggerMs: number;
  parallaxIntensity: number;
}

export interface MotionVars {
  '--motion-duration': string;
  '--motion-ease': string;
  '--motion-distance': string;
  '--motion-stagger': string;
  '--parallax-intensity': string;
}

/**
 * Resolves the motion CSS variables from settings. The guardrail: when the viewer
 * prefers reduced motion, everything collapses to instant with zero travel, regardless
 * of the admin's preset — this cannot be overridden.
 */
export function resolveMotionVars(input: MotionInput, reducedMotion: boolean): MotionVars {
  if (reducedMotion) {
    return {
      '--motion-duration': '0ms',
      '--motion-ease': 'linear',
      '--motion-distance': '0px',
      '--motion-stagger': '0ms',
      '--parallax-intensity': '0',
    };
  }

  const base = input.motionPreset === 'custom' ? PRESETS.refined : PRESETS[input.motionPreset];
  const speed = Math.min(150, Math.max(50, input.motionSpeed)) / 100;
  const duration = Math.round(base.durationMs * speed);
  const stagger = input.motionPreset === 'custom' ? input.staggerMs : base.staggerMs;

  return {
    '--motion-duration': `${duration}ms`,
    '--motion-ease': base.ease,
    '--motion-distance': `${base.distancePx}px`,
    '--motion-stagger': `${stagger}ms`,
    '--parallax-intensity': String(Math.min(100, Math.max(0, input.parallaxIntensity)) / 100),
  };
}
