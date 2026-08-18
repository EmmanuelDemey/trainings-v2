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
 * `<Teleport>` is for.
 */
defineProps<{ title: string }>();

const open = defineModel<boolean>('open', { required: true });

/** When true, the dialog must stay in place (`:disabled` on the teleport). */
const inline = defineModel<boolean>('inline', { required: true });

const emit = defineEmits<{ confirm: [] }>();

function close(): void {
  open.value = false;
}
</script>

<template>
  <!--
    TODO 5.1: wrap the whole backdrop in a `<Teleport to="body">`.
      Open the modal, then look at the Elements tab: the nodes must sit at the
      end of `<body>`, no longer inside `<section>`. The dialog is centred on the
      viewport again — without touching a single line of CSS.

    TODO 5.2: bind `:disabled="inline"` on the teleport. The checkbox below then
      puts the dialog back inside the panel, WITHOUT closing it: type something in
      the "Reason" field first, then toggle. The nodes move, the typed value
      survives — a teleport moves DOM nodes, it does not re-create anything.

    TODO 5.3: point the teleport at `#modal-root` (rendered by `App.vue`, AFTER
      the panels) instead of `body`. Reload: Vue warns that the target cannot be
      found and nothing renders — `to` is resolved when the teleport MOUNTS, and
      at that moment the app has not rendered `#modal-root` yet.
      Add the `defer` prop (Vue 3.5) to postpone the lookup to after the render.

      Note: keep the `v-if` INSIDE the teleport, as it is here. Moving it onto
      the `<Teleport>` itself would delay the mount until the first click, and
      you would never see the problem `defer` solves.

    TODO 5.4 (bonus): close the dialog on `Escape` and move the focus into it on
      open (`onMounted` + a `ref` on the dialog). Teleport moves the nodes, not
      the focus: accessibility stays YOUR job.
  -->
  <div v-if="open" class="backdrop" data-testid="modal-backdrop" @click.self="close">
    <div class="modal" role="dialog" aria-modal="true" :aria-label="title">
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
</template>
