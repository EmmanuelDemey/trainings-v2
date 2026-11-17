// The order form: its action receives the FormData, and checks it with OrderSchema.
import { useActionState } from 'react';
import { parseOrder, type Order, type OrderResult } from './order.ts';

export interface OrderFormProps {
  onOrder: (order: Order) => void;
}

export function OrderForm({ onOrder }: OrderFormProps) {
  const [result, action] = useActionState((_previous: OrderResult | null, formData: FormData) => {
    const result = parseOrder(formData);
    if (result.ok) onOrder(result.order);
    return result;
  }, null);

  return (
    // noValidate: the browser's checks are a convenience — the schema is the boundary.
    <form action={action} noValidate>
      <label>
        Email <input name="email" type="email" />
      </label>
      <label>
        Quantity <input name="quantity" type="number" defaultValue={1} />
      </label>
      <label>
        Shipping
        <select name="shipping" defaultValue="standard">
          <option value="standard">Standard</option>
          <option value="express">Express</option>
          <option value="pickup">Pickup</option>
        </select>
      </label>
      <label>
        <input name="giftWrap" type="checkbox" /> Gift wrap
      </label>
      <button>Order</button>
      {result && !result.ok && <pre role="alert">{result.error}</pre>}
    </form>
  );
}
