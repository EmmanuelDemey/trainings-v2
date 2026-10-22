// TODO — Step 3. Snapshot the whole order. The id and the date change on every
// run: hand them to toMatchSnapshot as property matchers.
import { expect, test } from 'vitest';
import { createOrder } from '../src/order';
import { cleanCode, etranger } from './fixtures';

test.todo('records the order, with its amounts');
test.todo('an order without coupon has no discount');
