/**
 * Domain error hierarchy. These never leak DB or HTTP concepts — the delivery layer
 * maps them to status codes. `code` is a stable machine-readable discriminator.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Input violated a domain invariant (bad slug, unreadable colour, empty title…). */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION';
}

/** A requested aggregate does not exist (within the caller's tenant scope). */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  constructor(entity: string, identifier?: string) {
    super(identifier ? `${entity} not found: ${identifier}` : `${entity} not found`);
  }
}

/** The actor is authenticated but not allowed to perform this action. */
export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
  constructor(message = 'You are not allowed to perform this action') {
    super(message);
  }
}

/** The action conflicts with current state (duplicate slug, already published…). */
export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
}

/** The deployment's licence does not permit this write (expired / read-only). */
export class LicenceError extends DomainError {
  readonly code = 'LICENCE';
  constructor(message = 'This action is not permitted by the current licence') {
    super(message);
  }
}
