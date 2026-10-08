import * as z from 'zod';

/** The seating tiers of every venue. */
export const TierSchema = z.enum(['standard', 'vip', 'backstage']);

export type Tier = z.output<typeof TierSchema>;

/**
 * TODO 4: a price for EVERY tier, above zero. A missing tier must be an error,
 * not an `undefined` waiting at checkout; an unknown tier too.
 */
export const PricesSchema = z.record(z.string(), z.number());

/**
 * TODO 4: a discount for SOME tiers, as a rate between 0 and 1. The keys are
 * still checked against the tiers — any of them may be missing.
 */
export const DiscountsSchema = z.record(z.string(), z.number());
