<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ApiFieldError } from '@/api/fakeApi';
import ErrorSummary from '@/components/ErrorSummary.vue';
import TextField from '@/components/TextField.vue';
import { invoiceSchema, toFieldErrors, type InvoiceInput } from '@/schemas/invoice';
import { useInvoicesStore } from '@/stores/invoices';

/**
 * STEP 5 — the form.
 *
 * The markup, the field component and the error summary are provided. What is
 * missing is everything that makes a form trustworthy: validation, the state of
 * the submit, the server error, and what happens when the user leaves with
 * unsaved changes.
 */
const store = useInvoicesStore();
const router = useRouter();

const form = reactive({ number: '', customer: '', amount: '', dueDate: '' });
const errors = ref<Partial<Record<keyof InvoiceInput, string>>>({});
const submitCount = ref(0);
const submitting = ref(false);
const serverError = ref<string | null>(null);

// TODO 5.4: validate a single field on blur, so the user is told early — but
//   ONLY after the first submit attempt for the fields never touched. Deciding
//   when a message appears is half of what makes a form pleasant.
function validateField(_name: keyof InvoiceInput): void {}

async function onSubmit(): Promise<void> {
  submitCount.value += 1;
  serverError.value = null;

  // TODO 5.5: validate with `invoiceSchema.safeParse(...)`.
  //   - on failure: fill `errors` via `toFieldErrors`, and DO NOT call the API
  //   - on success: submit `result.data`, which is parsed and typed — not `form`
  //
  // TODO 5.6: `submitting` guards the button against a double submit.
  //
  // TODO 5.7: the server validates too. Catch `ApiFieldError` and put the
  //   message under the field it names (try creating `INV-1001` again); any
  //   other error goes to `serverError`.
  //
  // TODO 5.8: on success, `router.push` to the created invoice's detail page.
  void store;
  void router;
  void ApiFieldError;
  void toFieldErrors;
  void invoiceSchema;
  void submitting;
}

// TODO 3.8: `onBeforeRouteLeave` — a filled-in form that vanishes because the
//   user clicked "Invoices" is a bug report waiting to happen. Ask for
//   confirmation only when something was actually typed.
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
