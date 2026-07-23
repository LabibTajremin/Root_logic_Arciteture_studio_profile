import { describe, expect, it } from 'vitest';
import {
  CARD_HOVER_STYLES,
  HERO_ANIMATIONS,
  IMAGE_HOVER_STYLES,
  PAGE_TRANSITIONS,
  SCROLL_REVEAL_STYLES,
  TEXT_REVEAL_STYLES,
  resolveMotionVars,
  type MotionPreset,
} from '@/presentation/theme/motion';

const ALL_PRESETS: MotionPreset[] = ['off', 'subtle', 'refined', 'expressive', 'custom'];

function input(preset: MotionPreset) {
  return { motionPreset: preset, motionSpeed: 100, staggerMs: 70, parallaxIntensity: 40 };
}

describe('motion registries', () => {
  it('ship the required counts', () => {
    expect(SCROLL_REVEAL_STYLES).toHaveLength(12);
    expect(HERO_ANIMATIONS).toHaveLength(8);
    expect(IMAGE_HOVER_STYLES).toHaveLength(8);
    expect(CARD_HOVER_STYLES).toHaveLength(6);
    expect(TEXT_REVEAL_STYLES).toHaveLength(6);
    expect(PAGE_TRANSITIONS).toHaveLength(6);
  });
});

describe('resolveMotionVars', () => {
  it('neutralises every preset under reduced motion (guardrail)', () => {
    for (const preset of ALL_PRESETS) {
      const vars = resolveMotionVars(input(preset), true);
      expect(vars['--motion-duration'], preset).toBe('0ms');
      expect(vars['--motion-distance'], preset).toBe('0px');
      expect(vars['--motion-stagger'], preset).toBe('0ms');
      expect(vars['--parallax-intensity'], preset).toBe('0');
    }
  });

  it('produces distinct motion for different presets when not reduced', () => {
    const subtle = resolveMotionVars(input('subtle'), false);
    const expressive = resolveMotionVars(input('expressive'), false);
    expect(subtle['--motion-distance']).not.toBe(expressive['--motion-distance']);
    expect(subtle['--motion-duration']).not.toBe(expressive['--motion-duration']);
  });

  it('applies the motion-speed multiplier to duration', () => {
    const slow = resolveMotionVars({ ...input('refined'), motionSpeed: 50 }, false);
    const fast = resolveMotionVars({ ...input('refined'), motionSpeed: 150 }, false);
    expect(parseInt(slow['--motion-duration'])).toBeLessThan(parseInt(fast['--motion-duration']));
  });

  it('turns motion off for the off preset', () => {
    const off = resolveMotionVars(input('off'), false);
    expect(off['--motion-duration']).toBe('0ms');
    expect(off['--motion-distance']).toBe('0px');
  });
});
