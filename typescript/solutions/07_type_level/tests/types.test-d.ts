import { describe, expectTypeOf, test } from 'vitest';
import type { OrderId, UserId } from '../src/brand.ts';
import { orderId, userId } from '../src/brand.ts';
import { get } from '../src/get.ts';
import type * as t from '../src/types.ts';
import { ada, type User } from './fixtures.ts';

describe('mapped types', () => {
  test('DeepReadonly makes every level readonly', () => {
    const user = {} as t.DeepReadonly<User>;
    // @ts-expect-error — readonly
    user.name = 'Grace';
    // @ts-expect-error — readonly, one level down
    user.address.city = 'Paris';
    // @ts-expect-error — a readonly array has no push
    user.tags.push('code');
  });

  test('DeepReadonly leaves the primitives alone', () => {
    expectTypeOf<t.DeepReadonly<User>['address']['geo']['lat']>().toEqualTypeOf<number>();
  });

  test('Mutable removes readonly', () => {
    expectTypeOf<t.Mutable<{ readonly a: number; readonly b: string }>>().toEqualTypeOf<{ a: number; b: string }>();
  });

  test('PartialBy makes only the keys listed optional', () => {
    const draft: t.PartialBy<User, 'id' | 'tags'> = { name: 'Ada', address: ada.address };
    expectTypeOf(draft.id).toEqualTypeOf<string | undefined>();
    // @ts-expect-error — the name is still required
    const nameless: t.PartialBy<User, 'id'> = { address: ada.address, tags: [] };
  });

  test('Handlers names one handler per event', () => {
    interface Events {
      add: { sku: string };
      remove: number;
    }
    expectTypeOf<t.Handlers<Events>>().toEqualTypeOf<{
      onAdd: (payload: { sku: string }) => void;
      onRemove: (payload: number) => void;
    }>();
  });

  test('MethodKeys keeps the keys whose value is a function', () => {
    interface Counter {
      count: number;
      increment(): void;
      reset: () => void;
    }
    expectTypeOf<t.MethodKeys<Counter>>().toEqualTypeOf<'increment' | 'reset'>();
  });
});

describe('conditional types and infer', () => {
  test('Unwrap unwraps nested promises', () => {
    expectTypeOf<t.Unwrap<Promise<Promise<number>>>>().toEqualTypeOf<number>();
    expectTypeOf<t.Unwrap<string>>().toEqualTypeOf<string>();
  });

  test('ElementOf reads the type of the elements', () => {
    expectTypeOf<t.ElementOf<string[]>>().toEqualTypeOf<string>();
    expectTypeOf<t.ElementOf<readonly [1, 'a']>>().toEqualTypeOf<1 | 'a'>();
    expectTypeOf<t.ElementOf<number>>().toEqualTypeOf<never>();
  });

  test('Tuple builds a tuple of N items', () => {
    expectTypeOf<t.Tuple<3, number>>().toEqualTypeOf<[number, number, number]>();
    expectTypeOf<t.Tuple<0, string>>().toEqualTypeOf<[]>();
  });
});

describe('template literal types', () => {
  test('RgbColor accepts three numbers, no fewer', () => {
    const red: t.RgbColor = 'rgb(255, 0, 0)';
    // @ts-expect-error — two numbers only
    const broken: t.RgbColor = 'rgb(255, 0)';
  });

  test('PathOf lists every path to a leaf', () => {
    expectTypeOf<t.PathOf<{ a: number; b: { c: string; d: { e: boolean } } }>>().toEqualTypeOf<'a' | 'b.c' | 'b.d.e'>();
  });

  test('Get reads the type at a path', () => {
    expectTypeOf<t.Get<User, 'address.geo.lng'>>().toEqualTypeOf<number>();
    expectTypeOf<t.Get<User, 'address.zip'>>().toEqualTypeOf<never>();
  });

  test('get checks the path and types the result', () => {
    expectTypeOf(get(ada, 'address.city')).toEqualTypeOf<string>();
    // @ts-expect-error — no such path
    get(ada, 'address.zip');
  });
});

describe('branded types', () => {
  test('a plain string is not a UserId', () => {
    // @ts-expect-error — not branded
    const id: UserId = 'u_ada';
  });

  test('a UserId is not an OrderId', () => {
    // @ts-expect-error — another brand
    const id: OrderId = userId('u_ada');
  });

  test('a branded id is still a string', () => {
    expectTypeOf(orderId('o_42')).toExtend<string>();
    expectTypeOf(orderId('o_42').toUpperCase()).toEqualTypeOf<string>();
  });
});
