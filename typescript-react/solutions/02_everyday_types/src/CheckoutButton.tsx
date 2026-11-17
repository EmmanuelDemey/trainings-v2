// The checkout button: disabled while the order is being sent.
import { useState } from 'react';

/** Turns `loading` on now, and back off when `using` disposes of it. */
export function startLoading(setLoading: (loading: boolean) => void): Disposable {
  setLoading(true);
  return {
    [Symbol.dispose]() {
      setLoading(false);
    },
  };
}

export interface CheckoutButtonProps {
  onCheckout: () => Promise<void>;
}

export function CheckoutButton({ onCheckout }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    using _loading = startLoading(setLoading);
    await onCheckout();
  } // ← `loading` goes back to false here — even when `onCheckout` threw

  return (
    <button disabled={loading} onClick={() => handleClick().catch(() => {})}>
      {loading ? 'Sending…' : 'Checkout'}
    </button>
  );
}
