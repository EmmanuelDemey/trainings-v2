<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { onBeforeRouteLeave, useRouter } from 'vue-router';
import { ApiFieldError } from '@/api/fakeApi';
import ErrorSummary from '@/components/ErrorSummary.vue';
import TextField from '@/components/TextField.vue';
import {
  invoiceSchema,
  toFieldErrors,
  type InvoiceFormValues,
  type InvoiceInput,
} from '@/schemas/invoice';
import { useInvoicesStore } from '@/stores/invoices';

/**
 * STEP 5 — the form.
 *
 * What makes a form trustworthy, in order of how often it is missed: the API is
 * never called with invalid data, the submit cannot fire twice, a server error
 * lands under the field it names, and leaving with unsaved work asks first.
 */
const store = useInvoicesStore();
const router = useRouter();

const form = reactive<InvoiceFormValues>({ number: '', customer: '', amount: '', dueDate: '' });
const errors = ref<Partial<Record<keyof InvoiceInput, string>>>({});
const touched = ref(new Set<keyof InvoiceInput>());
const submitCount = ref(0);
const submitting = ref(false);
const saved = ref(false);
const serverError = ref<string | null>(null);

const isDirty = computed(() => Object.values(form).some((value) => value !== ''));

/**
 * Validate one field on blur — but only show its message once the user has
 * actually left it, or once they have tried to submit. Shouting "expected the
 * format INV-1234" at someone who has typed "I" is how a form feels hostile.
 *
 * The whole object is parsed and the result filtered down to this one field:
 * a schema is not a bag of independent rules, and parsing the field alone would
 * miss any cross-field constraint the day one is added.
 */
function validateField(name: keyof InvoiceInput): void {
  touched.value.add(name);

  const result = invoiceSchema.safeParse(form);
  const next = { ...errors.value };

  if (result.success) delete next[name];
  else {
    const fieldErrors = toFieldErrors(result.error);
    if (fieldErrors[name]) next[name] = fieldErrors[name];
    else delete next[name];
  }

  errors.value = next;
}

async function onSubmit(): Promise<void> {
  // The double-submit guard, FIRST: a slow network plus an impatient user is
  // two invoices with the same reference, and the second one 422s in a way
  // nobody can explain.
  if (submitting.value) return;

  submitCount.value += 1;
  serverError.value = null;

  const result = invoiceSchema.safeParse(form);
  if (!result.success) {
    errors.value = toFieldErrors(result.error);
    // No API call. Validating and then submitting anyway is the bug this whole
    // step exists to prevent.
    return;
  }
  errors.value = {};

  submitting.value = true;
  try {
    // `result.data`, never `form`: this is the schema OUTPUT, so `amount` is a
    // number here and a string in `form`.
    const created = await store.create(result.data);

    saved.value = true;
    await router.push({ name: 'invoice', params: { id: created.id } });
  } catch (error) {
    // The server validates too, and it knows things the client cannot — such as
    // which references already exist. Try creating INV-1001 a second time.
    if (error instanceof ApiFieldError) {
      errors.value = { ...errors.value, [error.field]: error.message };
      touched.value.add(error.field);
      return;
    }
    serverError.value = (error as Error).message;
  } finally {
    submitting.value = false;
  }
}

/**
 * A filled-in form that vanishes because the user clicked "Invoices" is a bug
 * report waiting to happen. `saved` keeps the prompt from firing on the
 * navigation that follows a successful create.
 *
 * What this does NOT cover: closing the tab or reloading. Those never reach the
 * router — only `beforeunload` sees them, and the browser shows its own generic
 * dialog rather than your message.
 */
onBeforeRouteLeave(() => {
  if (!isDirty.value || saved.value) return true;
  return window.confirm('You have unsaved changes. Leave this page anyway?');
});
</script>

<template>
  <section>
    <h2>New invoice</h2>

    <ErrorSummary :errors="errors" :submit-count="submitCount" />

    <form novalidate @submit.prevent="onSubmit">
      <TextField
        v-model="form.number"
        name="number"
        label="Reference"
        hint="INV- followed by four digits"
        :error="errors.number"
        @blur="validateField('number')"
      />
      <TextField
        v-model="form.customer"
        name="customer"
        label="Customer"
        :error="errors.customer"
        @blur="validateField('customer')"
      />
      <TextField
        v-model="form.amount"
        name="amount"
        label="Amount (€)"
        type="text"
        hint="Two decimals at most"
        :error="errors.amount"
        @blur="validateField('amount')"
      />
      <TextField
        v-model="form.dueDate"
        name="dueDate"
        label="Due date"
        type="date"
        :error="errors.dueDate"
        @blur="validateField('dueDate')"
      />

      <button type="submit" data-testid="submit" :disabled="submitting">
        {{ submitting ? 'Creating…' : 'Create invoice' }}
      </button>
    </form>

    <p v-if="serverError" class="error" role="alert" data-testid="server-error">{{ serverError }}</p>
  </section>
</template>
