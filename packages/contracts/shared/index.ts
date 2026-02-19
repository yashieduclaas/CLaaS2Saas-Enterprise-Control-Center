/**
 * Shared utility types.
 */

export type Nullable<T> = T | null;
export type Maybe<T> = T | undefined;
export type ISO8601 = string;

/** Alias for ISO8601 timestamps. */
export type IsoDateTime = ISO8601;

/** Branded type for role identifiers. */
export type RoleId = string;
