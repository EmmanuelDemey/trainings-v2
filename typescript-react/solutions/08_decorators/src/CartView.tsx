// The components that use the cart store — given. They call its decorated
// methods and accessor like any others: the decorators are invisible here.
import { useState, type FormEvent } from 'react';
import { CartStore } from './cart.ts';
import { commandsOf } from './decorators.ts';
import { useStore } from './store.ts';

export function CartView({ cart }: { cart: CartStore }) {
  useStore(cart);
  return (
    <section aria-label="Cart">
      <button onClick={() => cart.add('book', 20)}>Add a book</button>
      <button onClick={() => cart.add('pen', 2)}>Add a pen</button>
      <button onClick={() => cart.clear()}>Clear</button>
      <ul>
        {cart.lines.map((line, i) => (
          <li key={i}>
            {line.sku} × {line.quantity}
          </li>
        ))}
      </ul>
      <DiscountForm cart={cart} />
      <p>Total: {cart.total()}</p>
      <ShippingQuote cart={cart} country="FR" />
      <pre aria-label="Debug">{`${cart}`}</pre>
    </section>
  );
}

export function DiscountForm({ cart }: { cart: CartStore }) {
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(new FormData(event.currentTarget).get('discount'));
    try {
      cart.discount = value;
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Discount <input name="discount" defaultValue={cart.discount} />
      </label>
      <button type="submit">Apply</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

export function ShippingQuote({ cart, country }: { cart: CartStore; country: string }) {
  return (
    <p>
      Shipping to {country}: {cart.shippingTo(country)}
    </p>
  );
}

/** The commands a class registered with `@command`, read from its metadata. */
export function CommandPalette({ of }: { of: object }) {
  const commands = Object.entries(commandsOf(of));
  if (commands.length === 0) return <p>No commands</p>;
  return (
    <ul aria-label="Commands">
      {commands.map(([name, method]) => (
        <li key={name}>
          {name} → {String(method)}
        </li>
      ))}
    </ul>
  );
}
