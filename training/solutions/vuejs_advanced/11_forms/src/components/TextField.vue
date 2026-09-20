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
//
// `validateOnValueUpdate: false` validates on blur instead of on every
// keystroke. Two reasons, and the second is the one that matters here: it stops
// shouting at someone who is still typing, and it is what keeps the async
// availability rule from firing once per character.
const { value, errorMessage, handleBlur, handleChange, meta } = useField<string>(
  () => props.name,
  undefined,
  { validateOnValueUpdate: false },
);

const id = computed(() => fieldId(props.name));
const errorId = computed(() => `${id.value}-error`);
const hintId = computed(() => `${id.value}-hint`);

/**
 * Both the message AND the hint, in reading order.
 *
 * `undefined` rather than `''` when there is nothing to describe:
 * `aria-describedby=""` points at an element with an empty id, and some screen
 * readers announce the resulting nothing as a pause. No attribute is not the
 * same as an empty one.
 */
const describedBy = computed(() => {
  const ids = [props.hint ? hintId.value : null, errorMessage.value ? errorId.value : null].filter(
    Boolean,
  );
  return ids.length > 0 ? ids.join(' ') : undefined;
});
</script>

<template>
  <div class="field">
    <!-- `for`/`id`: this is what makes clicking the label focus the input, and
         what makes a screen reader announce the field's name. A placeholder is
         not a label — it disappears the moment the user types. -->
    <label :for="id">{{ label }}</label>

    <input
      :id="id"
      v-model="value"
      :type="type ?? 'text'"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :aria-describedby="describedBy"
      :aria-invalid="errorMessage ? 'true' : undefined"
      @blur="handleBlur"
      @change="handleChange"
    />

    <p v-if="hint" :id="hintId" class="hint">{{ hint }}</p>

    <!-- `role="alert"` — an implicit `aria-live="assertive"`. The message
         appears AFTER the page was read, so without a live region a screen
         reader user never hears it: they tab away from a field and nothing
         tells them it was rejected. -->
    <p v-if="errorMessage" :id="errorId" class="error" role="alert">{{ errorMessage }}</p>

    <span v-if="meta.pending" class="pending">checking…</span>
  </div>
</template>
