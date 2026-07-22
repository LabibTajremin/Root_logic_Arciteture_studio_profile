import { type Result, err, ok } from '@/domain/shared/Result';
import { ValidationError } from '@/domain/errors/DomainError';

/** An integer percentage 0–100, used for pattern opacity and grain intensity. */
export class Opacity {
  private constructor(public readonly percent: number) {}

  static create(raw: number): Result<Opacity, ValidationError> {
    if (!Number.isFinite(raw) || !Number.isInteger(raw)) {
      return err(new ValidationError('Opacity must be a whole number'));
    }
    if (raw < 0 || raw > 100) {
      return err(new ValidationError('Opacity must be between 0 and 100'));
    }
    return ok(new Opacity(raw));
  }

  get fraction(): number {
    return this.percent / 100;
  }

  toString(): string {
    return `${this.percent}%`;
  }
}
