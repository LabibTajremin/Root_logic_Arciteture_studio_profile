import type { DomainError } from '@/domain/errors/DomainError';

/**
 * Result models expected (recoverable) failures explicitly, so callers must handle
 * them. Programmer errors still throw. Used across domain and application layers.
 */
export type Result<T, E extends DomainError = DomainError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E extends DomainError>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T, E extends DomainError>(
  result: Result<T, E>,
): result is { ok: true; value: T } {
  return result.ok;
}

export function isErr<T, E extends DomainError>(
  result: Result<T, E>,
): result is { ok: false; error: E } {
  return !result.ok;
}

/** Unwrap the value or throw — use only when a failure is a programmer error. */
export function unwrap<T, E extends DomainError>(result: Result<T, E>): T {
  if (result.ok) return result.value;
  throw result.error;
}

export function map<T, U, E extends DomainError>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}
