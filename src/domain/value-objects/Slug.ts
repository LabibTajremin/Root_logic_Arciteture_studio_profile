import { type Result, err, ok } from '@/domain/shared/Result';
import { ValidationError } from '@/domain/errors/DomainError';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_LENGTH = 96;

/** URL-safe slug: lowercase alphanumerics separated by single hyphens. */
export class Slug {
  private constructor(public readonly value: string) {}

  static create(raw: string): Result<Slug, ValidationError> {
    const normalized = raw.trim().toLowerCase();
    if (normalized.length === 0) {
      return err(new ValidationError('Slug cannot be empty'));
    }
    if (normalized.length > MAX_LENGTH) {
      return err(new ValidationError(`Slug cannot exceed ${MAX_LENGTH} characters`));
    }
    if (!SLUG_RE.test(normalized)) {
      return err(
        new ValidationError(
          'Slug must be lowercase alphanumerics separated by single hyphens (e.g. "riverside-villa")',
        ),
      );
    }
    return ok(new Slug(normalized));
  }

  /** Best-effort slugify of arbitrary text; still validated via create(). */
  static fromText(text: string): Result<Slug, ValidationError> {
    const candidate = text
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return Slug.create(candidate);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }
}
