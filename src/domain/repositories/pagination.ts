/** Keyset cursor: list endpoints page by (createdAt, id), never OFFSET. */
export interface Cursor {
  readonly createdAt: Date;
  readonly id: string;
}

export interface PageRequest {
  readonly limit: number;
  readonly after?: Cursor;
}

export interface Page<T> {
  readonly items: readonly T[];
  readonly nextCursor: Cursor | null;
}
