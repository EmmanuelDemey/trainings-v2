<script setup lang="ts">
import { ref } from 'vue';
import { useFieldArray, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import TextField from '@/components/TextField.vue';
import ErrorSummary from '@/components/ErrorSummary.vue';
import { emptyRegistration, registrationSchemaWithAvailability } from '@/schemas/registration';
import { ApiValidationError, apiStats, register } from '@/api/fakeApi';
import { fieldId } from '@/utils/fieldId';

/**
 * STEP 3 — The same form, with VeeValidate.
 *
 * `toTypedSchema` bridges Zod and VeeValidate: at runtime it turns
 * `issues[].path` into the paths the fields use; at compile time it carries
 * `z.input` into `values` and `z.output` into `handleSubmit`.
 *
 * Compare this file with `HandRolledForm.vue`. The markup is shorter, but that
 * is not the win — the win is `useFieldArray` (stable keys through a removal)
 * and `meta.pending` (a per-field async state), both of which the hand-rolled
 * composable would need another hundred lines to reproduce.
 */
const {
  defineField,
  errors,
  values,
  meta,
  handleSubmit,
  setErrors,
  isSubmitting,
  submitCount,
  resetForm,
} = useForm({
  // The schema WITH the async availability rule. VeeValidate ignores field-level
  // rules once a form has a schema, which is why that rule lives at the object
  // level in `schemas/registration.ts`.
  validationSchema: toTypedSchema(registrationSchemaWithAvailability),
  initialValues: emptyRegistration,
});

// A worked example: a plain <input>, bound by hand.
const [plan, planAttrs] = defineField('plan');
const [company, companyAttrs] = defineField('company');
const [consent, consentAttrs] = defineField('consent');

/**
 * STEP 4.1 — `useFieldArray` owns the rows.
 *
 * `field.key` is a STABLE identity that survives a removal. Key the loop by
 * index instead, fill three rows and delete the middle one: Vue patches row 2
 * with row 3's data, and the DOM inputs keep their own state — the value the
 * user typed in row 3 appears to have moved up a line.
 */
const { fields, push, remove } = useFieldArray<{ name: string; email: string }>('attendees');

const formError = ref('');
const success = ref('');

const onSubmit = handleSubmit(async (data) => {
  formError.value = '';
  success.value = '';

  try {
    // `data` is the schema OUTPUT: `typeof data.age === 'number'` here, while
    // `values.age` is still the string the input holds.
    const { id } = await register(data);
    success.value = `Registered — ${id} (age sent as ${typeof data.age})`;
    resetForm();
  } catch (error) {
    if (error instanceof ApiValidationError) {
      // The server validates again — a client-side check is UX, never a
      // guarantee. Its `fieldErrors` are keyed by form path, including nested
      // ones like `attendees[0].name`, so `setErrors` lands each message on its
      // own input instead of in a banner.
      setErrors(error.fieldErrors);
      return;
    }
    formError.value = 'Something went wrong. Try again.';
  }
});
</script>

<template>
  <form class="form" novalidate @submit="onSubmit">
    <ErrorSummary :errors="errors" :submit-count="submitCount" />

    <p v-if="formError" class="banner banner--error" role="alert">{{ formError }}</p>
    <p v-if="success" class="banner banner--ok" role="status">{{ success }}</p>

    <!-- One <TextField> per field. The component gets everything from
         `useField`, so there is no v-model and no error prop to pass down. -->
    <TextField name="email" label="Email" type="email" autocomplete="email" />
    <TextField name="password" label="Password" type="password" autocomplete="new-password" />
    <TextField
      name="confirm"
      label="Confirm password"
      type="password"
      autocomplete="new-password"
    />
    <TextField name="fullName" label="Full name" autocomplete="name" />
    <TextField
      name="age"
      label="Age"
      inputmode="numeric"
      hint="You must be 18 or over. The input holds a string; the API receives a number."
    />

    <div class="field">
      <label :for="fieldId('plan')">Plan</label>
      <select :id="fieldId('plan')" v-model="plan" v-bind="planAttrs">
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </select>
      <p v-if="errors.plan" class="error" role="alert">{{ errors.plan }}</p>
    </div>

    <!-- Optional on the free plan, required by the server on the pro plan. The
         schema enforces the same rule with a `.refine()` on the object, so the
         two cannot drift apart. -->
    <div v-if="values.plan === 'pro'" class="field">
      <label :for="fieldId('company')">Company</label>
      <input
        :id="fieldId('company')"
        v-model="company"
        v-bind="companyAttrs"
        :aria-describedby="errors.company ? `${fieldId('company')}-error` : undefined"
        :aria-invalid="errors.company ? 'true' : undefined"
        autocomplete="organization"
      />
      <p v-if="errors.company" :id="`${fieldId('company')}-error`" class="error" role="alert">
        {{ errors.company }}
      </p>
    </div>

    <fieldset class="attendees">
      <legend>Attendees</legend>

      <div v-for="(field, idx) in fields" :key="field.key" class="attendee">
        <TextField :name="`attendees[${idx}].name`" label="Name" />
        <TextField :name="`attendees[${idx}].email`" label="Email" type="email" />
        <button type="button" class="ghost" @click="remove(idx)">Remove</button>
      </div>

      <button type="button" class="ghost" @click="push({ name: '', email: '' })">
        Add an attendee
      </button>

      <p v-if="errors.attendees" class="error" role="alert">{{ errors.attendees }}</p>
    </fieldset>

    <div class="field field--inline">
      <input
        :id="fieldId('consent')"
        v-model="consent"
        v-bind="consentAttrs"
        type="checkbox"
        :aria-describedby="errors.consent ? `${fieldId('consent')}-error` : undefined"
        :aria-invalid="errors.consent ? 'true' : undefined"
      />
      <label :for="fieldId('consent')">I accept the terms</label>
    </div>
    <p v-if="errors.consent" :id="`${fieldId('consent')}-error`" class="error" role="alert">
      {{ errors.consent }}
    </p>

    <footer class="actions">
      <button type="submit" :disabled="isSubmitting || meta.pending">
        {{ isSubmitting ? 'Registering…' : 'Register' }}
      </button>
      <button type="button" class="ghost" @click="resetForm()">Reset</button>
      <span class="meta">
        valid: {{ meta.valid }} · dirty: {{ meta.dirty }} · pending: {{ meta.pending }} ·
        submits: {{ submitCount }} · availability calls: {{ apiStats.isEmailAvailable }}
      </span>
    </footer>
  </form>
</template>
