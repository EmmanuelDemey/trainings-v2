import { computed, reactive, ref, watch } from 'vue';
import type { ZodType, input, output } from 'zod';

/**
 * STEP 2 — The fifty-line form.
 *
 * Before reaching for a library, write the thing yourself: values, errors,
 * touched, submit. You will read VeeValidate's documentation very differently
 * afterwards — and you will be able to say *why* you added the dependency.
 *
 * What this does NOT do, and VeeValidate does: field arrays with stable keys,
 * per-field async validation with a pending state, `validateOnValueUpdate`
 * granularity, cross-component field registration. That list is the answer to
 * "why not just keep this?".
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
   * `['attendees', 0, 'name']` -> `attendees[0].name`.
   *
   * The whole point is that the result is the SAME string the inputs use as
   * their name — otherwise no error ever finds its field.
   */
  function pathToKey(path: PropertyKey[]): string {
    return path.reduce<string>((acc, segment) => {
      if (typeof segment === 'number') return `${acc}[${segment}]`;
      return acc === '' ? String(segment) : `${acc}.${String(segment)}`;
    }, '');
  }

  function collectErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
    const next: Record<string, string> = {};
    for (const issue of issues) {
      const key = pathToKey(issue.path);
      // FIRST message wins: three messages under one input is three times less
      // readable, and the user can only fix one thing at a time anyway.
      if (!(key in next)) next[key] = issue.message;
    }
    return next;
  }

  function validate(): boolean {
    const result = schema.safeParse(values);
    errors.value = result.success ? {} : collectErrors(result.error.issues);
    return result.success;
  }

  function handleBlur(field: string): void {
    touched.value.add(field);
    validate();
  }

  /**
   * An error is DISPLAYED only once the user has left the field, or once they
   * have tried to submit. Validating as they type the first character of their
   * email and shouting "invalid email" is how a form feels hostile.
   */
  function errorFor(field: string): string | undefined {
    if (!touched.value.has(field) && submitCount.value === 0) return undefined;
    return errors.value[field];
  }

  /** Server-side errors (a 422), merged in so they display like any other. */
  function setErrors(fieldErrors: Record<string, string>): void {
    errors.value = { ...errors.value, ...fieldErrors };
    for (const key of Object.keys(fieldErrors)) touched.value.add(key);
  }

  function handleSubmit(onValid: (data: output<S>) => void | Promise<void>) {
    return async (event?: Event): Promise<void> => {
      event?.preventDefault();
      submitCount.value += 1;

      const result = schema.safeParse(values);
      if (!result.success) {
        errors.value = collectErrors(result.error.issues);
        return;
      }
      errors.value = {};

      isSubmitting.value = true;
      try {
        // `result.data`, never `values`: this is the schema OUTPUT, so `age` is
        // a number here and a string in `values`. Sending `values` is the bug
        // this whole distinction exists to prevent.
        await onValid(result.data as output<S>);
      } finally {
        isSubmitting.value = false;
      }
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
    setErrors,
    handleSubmit,
    resetForm,
  };
}
