import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderForm } from '../src/OrderForm.tsx';
import { parseOrder } from '../src/order.ts';

const email = 'ada@example.com';

/** The FormData a <form> would send. */
function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.append(name, value);
  return data;
}

describe('parseOrder', () => {
  test('fills in the defaults', () => {
    expect(parseOrder(form({ email }))).toEqual({
      ok: true,
      order: { quantity: 1, email, shipping: 'standard', giftWrap: false },
    });
  });

  test('turns strings into numbers and booleans', () => {
    expect(parseOrder(form({ email, quantity: '3', shipping: 'express', giftWrap: 'on' }))).toEqual({
      ok: true,
      order: { quantity: 3, email, shipping: 'express', giftWrap: true },
    });
  });

  test('keeps only the fields it knows', () => {
    const result = parseOrder(form({ email, coupon: 'FREE', admin: 'true' }));
    expect(result.ok && Object.keys(result.order).sort()).toEqual(['email', 'giftWrap', 'quantity', 'shipping']);
  });

  test.each([
    ['a missing email', {}, /email/],
    ['an email that is not one', { email: 'ada' }, /email/],
    ['a quantity that is not a number', { email, quantity: 'eight' }, /quantity/],
    ['an unknown shipping', { email, shipping: 'drone' }, /shipping/],
    ['a gift wrap that is not a boolean', { email, giftWrap: 'maybe' }, /giftWrap/],
  ])('refuses %s', (_label, fields, message) => {
    expect(parseOrder(form(fields))).toMatchObject({ ok: false, error: expect.stringMatching(message) });
  });

  test('names every field that is wrong, not just the first', () => {
    expect(parseOrder(form({ quantity: 'eight' }))).toMatchObject({
      ok: false,
      error: expect.stringMatching(/quantity[\s\S]*email|email[\s\S]*quantity/),
    });
  });
});

describe('OrderForm', () => {
  test('hands the parsed order to onOrder', async () => {
    const onOrder = vi.fn();
    render(<OrderForm onOrder={onOrder} />);
    await userEvent.type(screen.getByLabelText('Email'), email);
    await userEvent.clear(screen.getByLabelText('Quantity'));
    await userEvent.type(screen.getByLabelText('Quantity'), '2');
    await userEvent.click(screen.getByLabelText('Gift wrap'));
    await userEvent.click(screen.getByRole('button', { name: 'Order' }));
    expect(onOrder).toHaveBeenCalledWith({ quantity: 2, email, shipping: 'standard', giftWrap: true });
  });

  test('shows what is wrong, and orders nothing', async () => {
    const onOrder = vi.fn();
    render(<OrderForm onOrder={onOrder} />);
    await userEvent.click(screen.getByRole('button', { name: 'Order' }));
    expect((await screen.findByRole('alert')).textContent).toMatch(/email/);
    expect(onOrder).not.toHaveBeenCalled();
  });
});
