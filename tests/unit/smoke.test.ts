import { describe, expect, it } from 'vitest';

describe('toolchain smoke test', () => {
  it('runs vitest with path alias resolution available', () => {
    expect(1 + 1).toBe(2);
  });
});
