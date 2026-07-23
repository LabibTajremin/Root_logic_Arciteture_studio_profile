import { describe, expect, it } from 'vitest';
import { err, isErr, isOk, map, ok, unwrap } from '@/domain/shared/Result';
import { ValidationError } from '@/domain/errors/DomainError';

describe('Result', () => {
  it('constructs and narrows ok', () => {
    const r = ok(5);
    expect(isOk(r)).toBe(true);
    expect(isErr(r)).toBe(false);
    expect(unwrap(r)).toBe(5);
  });

  it('constructs and narrows err', () => {
    const r = err(new ValidationError('nope'));
    expect(isErr(r)).toBe(true);
    expect(() => unwrap(r)).toThrow(ValidationError);
  });

  it('maps ok values and passes errors through', () => {
    expect(map(ok(2), (n) => n * 3)).toEqual({ ok: true, value: 6 });
    const e = err(new ValidationError('bad'));
    expect(map(e, (n: number) => n * 3)).toBe(e);
  });
});

describe('DomainError', () => {
  it('carries a stable code and its class name', () => {
    const e = new ValidationError('bad input');
    expect(e.code).toBe('VALIDATION');
    expect(e.name).toBe('ValidationError');
    expect(e).toBeInstanceOf(Error);
  });
});
