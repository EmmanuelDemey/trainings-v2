<script setup lang="ts">
/**
 * A plain consumer. It knows the composable and nothing else — no import of the
 * host component, no import of the state, no knowledge of how the plugin was
 * configured. That is the bar a plugin has to clear.
 */
import { useToast } from '../plugins/toast';

const toast = useToast();

let order = 0;
function placeOrder(): void {
  order += 1;
  toast.notify(`Order #${order} confirmed`, 'success');
}
</script>

<template>
  <section>
    <h2>Checkout</h2>
    <div class="row">
      <button type="button" data-testid="order" @click="placeOrder()">Place an order</button>
      <button type="button" data-testid="info" @click="toast.notify('Saving your basket…')">
        Notify (info)
      </button>
      <button
        type="button"
        data-testid="error"
        @click="toast.notify('Payment declined', 'error')"
      >
        Notify (error)
      </button>
      <button type="button" data-testid="clear" @click="toast.clear()">Clear</button>
    </div>
    <p class="muted">
      Toasts stack up to the <code>max</code> given to <code>createToast()</code>, then the
      oldest one goes. Each dismisses itself after <code>duration</code> ms.
    </p>
  </section>
</template>
