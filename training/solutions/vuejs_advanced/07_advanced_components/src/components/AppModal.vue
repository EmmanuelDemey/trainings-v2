<script setup lang="ts">
/**
 * STEP 5 — Teleport
 *
 * This dialog is declared inside a panel that creates a clipping AND a
 * containing block (`overflow: hidden` + `transform`). As long as its DOM nodes
 * stay there, `position: fixed` is resolved against the panel instead of the
 * viewport: the backdrop only covers the panel and the dialog is cut off.
 *
 * The component tree is right — the DOM position is not. That is exactly what
 * `<Teleport>` is for: it moves the NODES, and leaves the component tree (props,
 * events, provide/inject, devtools hierarchy) exactly where it was.
 */
import { nextTick, ref, watch } from 'vue';

defineProps<{ title: string }>();

const open = defineModel<boolean>('open', { required: true });

/** When true, the dialog must stay in place (`:disabled` on the teleport). */
const inline = defineModel<boolean>('inline', { required: true });

const emit = defineEmits<{ confirm: [] }>();

const dialog = ref<HTMLElement | null>(null);

function close(): void {
  open.value = false;
}

/**
 * Bonus — Escape to close, and move the focus into the dialog on open.
 *
 * Teleport moves the DOM nodes; it does not move the focus, does not trap it,
 * and does not make anything behind the backdrop inert. Accessibility stays
 * your job — this is the minimum, not the whole of it (a real dialog also traps
 * Tab and restores focus to the trigger on close, which is what the native
 * `<dialog showModal()>` gives you for free).
 */
watch(open, async (isOpen) => {
  if (!isOpen) return;
  await nextTick();
  dialog.value?.focus();
});
</script>

<template>
  <!--
    `to="#modal-root"` targets the container `App.vue` renders AFTER the panels.

    `defer` (Vue 3.5) is what makes that work: without it, `to` is resolved when
    the teleport MOUNTS — and at that moment the app has not rendered
    `#modal-root` yet, so Vue logs "Failed to locate Teleport target" and
    nothing renders. `defer` postpones the lookup to after the current render
    tick, by which time the target exists.

    Note that the `v-if` is INSIDE the teleport, not on it. On the `<Teleport>`
    itself it would delay the mount to the first click — by then `#modal-root`
    exists, the warning never appears, and the whole problem `defer` solves
    stays invisible.

    `:disabled="inline"` puts the nodes back where they were declared, WITHOUT
    unmounting anything: type in the "Reason" field, tick the checkbox, and the
    value survives the move. A teleport relocates nodes; it never re-creates them.
  -->
  <Teleport to="#modal-root" defer :disabled="inline">
    <div v-if="open" class="backdrop" data-testid="modal-backdrop" @click.self="close">
      <div
        ref="dialog"
        class="modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        @keydown.esc="close"
      >
        <h3>{{ title }}</h3>
        <slot />

        <label class="modal-field">
          Reason
          <input data-testid="modal-reason" placeholder="Type something, then toggle" />
        </label>

        <!-- Inside the dialog: with the backdrop up, nothing behind it is clickable. -->
        <label class="row">
          <input v-model="inline" type="checkbox" data-testid="modal-inline" />
          <span class="muted">Keep the dialog inline (<code>:disabled</code>)</span>
        </label>

        <div class="row modal-actions">
          <button type="button" data-testid="modal-cancel" @click="close">Cancel</button>
          <button type="button" data-testid="modal-confirm" @click="emit('confirm'); close()">
            Confirm
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
