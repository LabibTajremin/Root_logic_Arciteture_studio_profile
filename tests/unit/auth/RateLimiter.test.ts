import { describe, expect, it } from 'vitest';
import { RateLimiter } from '@/infrastructure/auth/RateLimiter';

describe('RateLimiter', () => {
  it('allows up to the limit then blocks', () => {
    const limiter = new RateLimiter(3, 1000, () => 0);
    expect(limiter.check('k').allowed).toBe(true);
    expect(limiter.check('k').allowed).toBe(true);
    expect(limiter.check('k').allowed).toBe(true);
    const blocked = limiter.check('k');
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(1000);
  });

  it('resets after the window elapses', () => {
    let now = 0;
    const limiter = new RateLimiter(1, 1000, () => now);
    expect(limiter.check('k').allowed).toBe(true);
    expect(limiter.check('k').allowed).toBe(false);
    now = 1000;
    expect(limiter.check('k').allowed).toBe(true);
  });

  it('tracks keys independently', () => {
    const limiter = new RateLimiter(1, 1000, () => 0);
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('b').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(false);
  });

  it('manual reset clears a key', () => {
    const limiter = new RateLimiter(1, 1000, () => 0);
    limiter.check('a');
    expect(limiter.check('a').allowed).toBe(false);
    limiter.reset('a');
    expect(limiter.check('a').allowed).toBe(true);
  });
});
