<script setup lang="ts">
import { computed } from 'vue';
import { useField } from 'vee-validate';
import { fieldId } from '@/utils/fieldId';

/**
 * STEP 3 & 6 — The field component you write once and reuse everywhere.
 *
 * `useField` finds the parent form by injection: no prop drilling, no events.
 * Every accessibility rule of the chapter lives here — get it right once, and
 * every form in the app inherits it.
 */
const props = defineProps<{
  name: string;
  label: string;
  type?: string;
  autocomplete?: string;
  inputmode?: 'text' | 'numeric' | 'email';
  hint?: string;
}>();

// A getter, not `props.name`: the field has to follow a name that changes
// (`attendees[0].name` becomes `attendees[1].name` when a row is removed).
const { value, errorMessage, handleBlur, handleChange, meta } = useField<string>(() => props.name);

const id = computed(() => fieldId(props.name));
const errorId = computed(() => `${id.value}-error`);
const hintId = computed(() => `${id.value}-hint`);

const describedBy = computed(() => {
  // TODO 6.1: point the input at its message *and* its hint, when they exist.
  //           Returning `undefined` when there is nothing to describe matters:
  //           `aria-describedby=""` is not the same as no attribute at all.
  return undefined as string | undefined;
});
</script>

<template>
  <div class="field">
    <!-- TODO 6.2: the label must be tied to the input (`for` / `id`). A
         placeholder is not a label. -->
    <label>{{ label }}</label>

    <input
      :id="id"
      v-model="value"
      :type="type ?? 'text'"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :aria-describedby="describedBy"
      @blur="handleBlur"
      @change="handleChange"
    />
    <!-- TODO 6.3: add `aria-invalid` so a screen reader announces the field as
         invalid — a red border says nothing to it. -->

    <p v-if="hint" :id="hintId" class="hint">{{ hint }}</p>

    <!-- TODO 6.4: an error appearing after the fact has to be announced.
         Which ARIA role does that? -->
    <p v-if="errorMessage" :id="errorId" class="error">{{ errorMessage }}</p>

    <span v-if="meta.pending" class="pending">checking…</span>
  </div>
</template>
