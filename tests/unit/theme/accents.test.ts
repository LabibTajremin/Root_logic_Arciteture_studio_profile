import { describe, expect, it } from 'vitest';
import { ACCENTS, bestContrast, onAccent } from '@/presentation/theme/accents';

const AA = 4.5;

describe('accent registry', () => {
  it('ships exactly 24 accents with unique ids', () => {
    expect(ACCENTS).toHaveLength(24);
    expect(new Set(ACCENTS.map((a) => a.id)).size).toBe(24);
  });

  it('every accent passes WCAG AA for its on-accent text in light mode', () => {
    for (const accent of ACCENTS) {
      const ratio = bestContrast(accent.light);
      expect(ratio, `${accent.name} (light ${accent.light})`).toBeGreaterThanOrEqual(AA);
    }
  });

  it('every accent passes WCAG AA for its on-accent text in dark mode', () => {
    for (const accent of ACCENTS) {
      const ratio = bestContrast(accent.dark);
      expect(ratio, `${accent.name} (dark ${accent.dark})`).toBeGreaterThanOrEqual(AA);
    }
  });

  it('picks a concrete ink for every accent', () => {
    for (const accent of ACCENTS) {
      expect(onAccent(accent.light)).toMatch(/^#[0-9a-f]{6}$/);
      expect(onAccent(accent.dark)).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
