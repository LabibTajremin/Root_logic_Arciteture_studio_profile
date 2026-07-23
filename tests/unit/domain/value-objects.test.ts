import { describe, expect, it } from 'vitest';
import { Slug } from '@/domain/value-objects/Slug';
import { HexColor } from '@/domain/value-objects/HexColor';
import { Opacity } from '@/domain/value-objects/Opacity';

describe('Slug', () => {
  it('accepts a valid slug', () => {
    const result = Slug.create('riverside-villa');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.value).toBe('riverside-villa');
  });

  it('lowercases and trims', () => {
    const result = Slug.create('  Riverside-Villa  ');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.value).toBe('riverside-villa');
  });

  it('rejects empty input', () => {
    const result = Slug.create('   ');
    expect(result.ok).toBe(false);
  });

  it('rejects invalid characters and leading/trailing hyphens', () => {
    expect(Slug.create('bad slug!').ok).toBe(false);
    expect(Slug.create('-leading').ok).toBe(false);
    expect(Slug.create('trailing-').ok).toBe(false);
    expect(Slug.create('double--hyphen').ok).toBe(false);
  });

  it('slugifies free text', () => {
    const result = Slug.fromText('Café at 12 O’Clock!');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.value).toBe('cafe-at-12-o-clock');
  });
});

describe('HexColor', () => {
  it('accepts and expands shorthand hex', () => {
    const result = HexColor.create('#FFF');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.value).toBe('#ffffff');
  });

  it('rejects malformed hex', () => {
    expect(HexColor.create('white').ok).toBe(false);
    expect(HexColor.create('#12').ok).toBe(false);
    expect(HexColor.create('#gggggg').ok).toBe(false);
  });

  it('computes a high contrast ratio for black on white', () => {
    const black = HexColor.create('#000000');
    const white = HexColor.create('#ffffff');
    expect(black.ok && white.ok).toBe(true);
    if (black.ok && white.ok) {
      expect(black.value.contrastRatio(white.value)).toBeCloseTo(21, 0);
    }
  });

  it('computes a low contrast ratio for similar colours', () => {
    const a = HexColor.create('#777777');
    const b = HexColor.create('#7a7a7a');
    if (a.ok && b.ok) {
      expect(a.value.contrastRatio(b.value)).toBeLessThan(1.2);
    }
  });
});

describe('Opacity', () => {
  it('accepts an in-range integer', () => {
    const result = Opacity.create(6);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.percent).toBe(6);
      expect(result.value.fraction).toBeCloseTo(0.06);
    }
  });

  it('rejects out-of-range and non-integer values', () => {
    expect(Opacity.create(-1).ok).toBe(false);
    expect(Opacity.create(101).ok).toBe(false);
    expect(Opacity.create(5.5).ok).toBe(false);
    expect(Opacity.create(Number.NaN).ok).toBe(false);
  });
});
