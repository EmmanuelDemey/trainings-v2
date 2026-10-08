import * as z from 'zod';

/** The seating tiers of every venue. */
export const TierSchema = z.enum(['standard', 'vip', 'backstage']);

export type Tier = z.output<typeof TierSchema>;

/**
 * A price for EVERY tier. With an enum as its key, `z.record` is exhaustive: a
 * missing tier is an error, not an `undefined` waiting at checkout.
 */
export const PricesSchema = z.record(TierSchema, z.number().positive());

/**
 * A discount for SOME tiers, as a rate between 0 and 1. `z.partialRecord` keeps
 * the keys checked against the enum, and lets any of them be missing.
 */
export const DiscountsSchema = z.partialRecord(TierSchema, z.number().min(0).max(1));
