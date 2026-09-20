<script setup lang="ts">
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import TextField from '@/components/TextField.vue';
import ErrorSummary from '@/components/ErrorSummary.vue';
import { emptyRegistration, registrationSchema } from '@/schemas/registration';
import { ApiValidationError, apiStats, register } from '@/api/fakeApi';
import { fieldId } from '@/utils/fieldId';

/**
 * STEP 3 — The same form, with VeeValidate.
 *
 * `toTypedSchema` bridges Zod and VeeValidate: at runtime it turns
 * `issues[].path` into the paths the fields use; at compile time it carries
 * `z.input` into `values` and `z.output` into `handleSubmit`.
 */
const { defineField, errors, values, meta, handleSubmit, setErrors, isSubmitting, submitCount, resetForm } =
  useForm({
    // TODO 4.3: once the async rule exists, swap this for
    //           `registrationSchemaWithAvailability`, then cut the number of
    //           requests down. Two levers, and you want to understand both:
    //           `useField(name, undefined, { validateOnValueUpdate: false })` in
    //           `TextField` (validate on blur), and a cache in the schema
    //           (one answer per email). Watch the counter in the footer.
    validationSchema: toTypedSchema(registrationSchema),
    initialValues: emptyRegistration,
  });

// A worked example: a plain <input>, bound by hand.
const [plan, planAttrs] = defineField('plan');
const [consent, consentAttrs] = defineField('consent');

const formError = ref('');
const success = ref('');

/**
 * TODO 3.3: replace this with the real submit.
 *
 *   - call `register(data)` and show the returned id, then `resetForm()`
 *   - `data` is the schema *output*: check `typeof data.age` in the message,
 *     it proves you are sending the parsed output and not the raw model
 *
 * TODO 5.1: the server validates again, and answers `422` with paths.
 *
 *   - catch `ApiValidationError` and hand `error.fieldErrors` to `setErrors`
 *   - anything else is a form-level failure: `formError`
 *   - try it: an attendee named `Bob` comes back as
 *     `attendees[0].name` — the message has to land on that input, not in a banner
 */
const onSubmit = handleSubmit(async (data) => {
  formError.value = '';
  success.value = '';
  void register;
  void ApiValidationError;
  void setErrors;
  success.value = `Not wired yet — age would be sent as ${typeof data.age}`;
});
</script>

<template>
  <form class="form" novalidate @submit="onSubmit">
    <!-- STEP 6: the summary is already here; it needs focus management. -->
    <ErrorSummary :errors="errors" :submit-count="submitCount" />

    <p v-if="formError" class="banner banner--error" role="alert">{{ formError }}</p>
    <p v-if="success" class="banner banner--ok" role="status">{{ success }}</p>

    <!-- STEP 3: one <TextField> per field. The component gets everything from
         `useField`, so there is no v-model and no error prop to pass down. -->
    <TextField name="email" label="Email" type="email" autocomplete="email" />

    <!-- TODO 3.1: add the missing fields — password, confirm, fullName, age.
         `age` deserves an `inputmode="numeric"` and a hint. -->

    <div class="field">
      <label :for="fieldId('plan')">Plan</label>
      <select :id="fieldId('plan')" v-model="plan" v-bind="planAttrs">
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </select>
      <p v-if="errors.plan" class="error">{{ errors.plan }}</p>
    </div>

    <!-- TODO 3.2: `company` is optional on the free plan and required by the
         server on the pro plan. Show it only when `values.plan === 'pro'`, and
         make the schema require it in that case (`.superRefine`, or a
         discriminated union — try both and keep the one you would maintain). -->

    <fieldset class="attendees">
      <legend>Attendees</legend>

      <!-- TODO 4.1: `useFieldArray('attendees')` gives you `fields`, `push`,
           `remove` and `move`. Loop over `fields`, keyed by `field.key` — never
           by the index — and render two <TextField>s per row, named
           `attendees[${idx}].name` and `attendees[${idx}].email`.

           Once it works: fill three rows, remove the middle one, and check that
           no value moved up a line. Then try it again with `:key="idx"`. -->
      <p class="todo">TODO 4.1 — the attendee rows go here.</p>

      <p v-if="errors.attendees" class="error">{{ errors.attendees }}</p>
    </fieldset>

    <div class="field field--inline">
      <input :id="fieldId('consent')" v-model="consent" v-bind="consentAttrs" type="checkbox" />
      <label :for="fieldId('consent')">I accept the terms</label>
    </div>
    <p v-if="errors.consent" class="error">{{ errors.consent }}</p>

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
