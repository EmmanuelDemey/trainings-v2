import { describe, expect, it } from 'vitest';
import { DiscountsSchema, PricesSchema, TierSchema } from '../src/schemas/pricing';

describe('TierSchema', () => {
  it('lists the three tiers, in order', () => {
    expect(TierSchema.options).toEqual(['standard', 'vip', 'backstage']);
  });
});

describe('PricesSchema', () => {
  it('accepts a price for every tier', () => {
    const prices = { standard: 40, vip: 90, backstage: 250 };
    expect(PricesSchema.parse(prices)).toEqual(prices);
  });

  it('rejects a missing tier, and says which one', () => {
    const result = PricesSchema.safeParse({ standard: 40, vip: 90 });
    expect(result.error?.issues.map((issue) => issue.path)).toEqual([['backstage']]);
  });

  it('rejects a tier that does not exist', () => {
    expect(PricesSchema.safeParse({ standard: 40, vip: 90, backstage: 250, gold: 500 }).success).toBe(false);
  });

  it('rejects a free tier', () => {
    expect(PricesSchema.safeParse({ standard: 0, vip: 90, backstage: 250 }).success).toBe(false);
  });
});

describe('DiscountsSchema', () => {
  it('accepts a discount on some tiers only', () => {
    expect(DiscountsSchema.parse({ vip: 0.2 })).toEqual({ vip: 0.2 });
    expect(DiscountsSchema.parse({})).toEqual({});
  });

  it('still rejects a tier that does not exist', () => {
    expect(DiscountsSchema.safeParse({ gold: 0.1 }).success).toBe(false);
  });

  it('rejects a rate outside 0..1', () => {
    expect(DiscountsSchema.safeParse({ vip: 20 }).success).toBe(false);
  });
});
