import { computed, reactive, ref, watch } from 'vue';
import type { ZodType, input, output } from 'zod';

/**
 * STEP 2 — The fifty-line form.
 *
 * Before reaching for a library, write the thing yourself: values, errors,
 * touched, submit. You will read VeeValidate's documentation very differently
 * afterwards — and you will be able to say *why* you added the dependency.
 *
 * `HandRolledForm.vue` is already wired to the API below; it just never shows an
 * error, because `validate()` currently returns `true` no matter what.
 */
export function useZodForm<S extends ZodType>(schema: S, initial: input<S>) {
  const values = reactive({ ...(initial as object) }) as input<S>;
  const errors = ref<Record<string, string>>({});
  const touched = ref(new Set<string>());
  const submitCount = ref(0);
  const isSubmitting = ref(false);

  const snapshot = JSON.stringify(initial);
  const isDirty = computed(() => JSON.stringify(values) !== snapshot);
  const isValid = computed(() => Object.keys(errors.value).length === 0);

  /**
   * TODO 2.1: run `schema.safeParse(values)`, rebuild `errors.value` from
   *           `result.error.issues`, and return whether the parse succeeded.
   *
   *   - key each message by its *path*: `['attendees', 0, 'name']` has to become
   *     `attendees[0].name`, which is the name the inputs use.
   *   - keep the **first** message per path: one error per field on screen.
   */
  function validate(): boolean {
    errors.value = {};
    return true;
  }

  /**
   * TODO 2.2: mark a field as touched, then re-validate.
   *           This is what `@blur` calls on every input.
   */
  function handleBlur(field: string): void {
    void field;
  }

  /**
   * TODO 2.3: an error is *displayed* only once the user has left the field, or
   *           once they have tried to submit. Before that, stay quiet.
   */
  function errorFor(field: string): string | undefined {
    return errors.value[field];
  }

  /**
   * TODO 2.4: wrap the submit.
   *
   *   - prevent the default, increment `submitCount`
   *   - `safeParse` the values: on failure, refresh the errors and stop
   *   - on success, call `onValid` with `result.data` — the *output* of the
   *     schema, never `values`
   *   - flip `isSubmitting` around the call, in a `finally`
   */
  function handleSubmit(onValid: (data: output<S>) => void | Promise<void>) {
    return async (event?: Event): Promise<void> => {
      event?.preventDefault();
      await onValid(values as output<S>);
    };
  }

  function resetForm(): void {
    Object.assign(values as object, JSON.parse(snapshot));
    errors.value = {};
    touched.value = new Set();
    submitCount.value = 0;
  }

  // Re-validate on every change, so an error clears as soon as it is fixed.
  watch(values as object, () => validate(), { deep: true });

  return {
    values,
    errors,
    touched,
    submitCount,
    isSubmitting,
    isDirty,
    isValid,
    validate,
    handleBlur,
    errorFor,
    handleSubmit,
    resetForm,
  };
}
