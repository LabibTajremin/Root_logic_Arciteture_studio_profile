import { describe, expect, it } from 'vitest';
import { PATTERNS, PATTERNS_BY_ID } from '@/presentation/theme/patterns';

describe('pattern registry', () => {
  it('ships exactly 22 patterns with unique ids', () => {
    expect(PATTERNS).toHaveLength(22);
    expect(new Set(PATTERNS.map((p) => p.id)).size).toBe(22);
  });

  it('every pattern provides CSS and is indexed', () => {
    for (const pattern of PATTERNS) {
      expect(pattern.css.length).toBeGreaterThan(0);
      expect(PATTERNS_BY_ID.get(pattern.id)).toBe(pattern);
    }
  });

  it('includes a blank "none" option', () => {
    expect(PATTERNS_BY_ID.get('none')?.css).toContain('none');
  });
});
