<script setup lang="ts">
import { computed } from 'vue';
import { fieldId } from '@/utils/fieldId';

/**
 * Provided, and accessible on purpose: chapter 7 already made you write this
 * one. Reuse it as it is — and notice, in the review, that reusing a correct
 * component is the cheapest accessibility strategy there is.
 */
const props = defineProps<{
  name: string;
  label: string;
  type?: string;
  hint?: string;
  error?: string;
}>();

const model = defineModel<string>({ required: true });

// `blur` does not bubble, so it cannot reach the parent through attribute
// fallthrough on the wrapper — the component has to forward it explicitly.
const emit = defineEmits<{ blur: [] }>();

const id = computed(() => fieldId(props.name));
const errorId = computed(() => `${id.value}-error`);
const hintId = computed(() => `${id.value}-hint`);

const describedBy = computed(() => {
  const ids = [props.hint ? hintId.value : null, props.error ? errorId.value : null].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
});
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>

    <input
      :id="id"
      v-model="model"
      :type="type ?? 'text'"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      :data-testid="name"
      @blur="emit('blur')"
    />

    <p v-if="hint" :id="hintId" class="muted">{{ hint }}</p>
    <p v-if="error" :id="errorId" class="error" role="alert" :data-testid="`${name}-error`">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.field {
  margin-bottom: 1rem;
  max-width: 26rem;
}
label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.2rem;
}
input {
  width: 100%;
}
input[aria-invalid='true'] {
  border-color: var(--danger);
}
p {
  margin: 0.25rem 0 0;
}
</style>
