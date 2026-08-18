<script setup lang="ts">
import { ref } from 'vue';
import { useZodForm } from '@/composables/useZodForm';
import { emptyRegistration, registrationSchema } from '@/schemas/registration';
import { ApiValidationError, register } from '@/api/fakeApi';

/**
 * The form of STEP 2, wired to `useZodForm`. Nothing to change here at first:
 * implement the composable and the errors start appearing.
 *
 * Read it once before you start — it is the reference for what the VeeValidate
 * version has to reproduce in STEP 3.
 */
const { values, errorFor, handleBlur, handleSubmit, isSubmitting, isDirty, submitCount, resetForm } =
  useZodForm(registrationSchema, emptyRegistration);

const formError = ref('');
const success = ref('');

const onSubmit = handleSubmit(async (data) => {
  formError.value = '';
  success.value = '';
  try {
    // `data` is the schema *output*: `data.age` is a number here.
    const { id } = await register(data);
    success.value = `Registered — ${id} (age sent as ${typeof data.age})`;
    resetForm();
  } catch (error) {
    if (error instanceof ApiValidationError) {
      // TODO 2.5: the hand-rolled version has nowhere to put these yet.
      //           Add a `setErrors()` to the composable and use it here.
      formError.value = Object.values(error.fieldErrors).join(' — ');
      return;
    }
    formError.value = 'Something went wrong. Try again.';
  }
});

function addAttendee(): void {
  values.attendees.push({ name: '', email: '' });
}

function removeAttendee(index: number): void {
  values.attendees.splice(index, 1);
}
</script>

<template>
  <form class="form" novalidate @submit="onSubmit">
    <p v-if="formError" class="banner banner--error" role="alert">{{ formError }}</p>
    <p v-if="success" class="banner banner--ok" role="status">{{ success }}</p>

    <div class="field">
      <label for="hr-email">Email</label>
      <input
        id="hr-email"
        v-model="values.email"
        type="email"
        autocomplete="email"
        @blur="handleBlur('email')"
      />
      <p v-if="errorFor('email')" class="error">{{ errorFor('email') }}</p>
    </div>

    <div class="field">
      <label for="hr-password">Password</label>
      <input
        id="hr-password"
        v-model="values.password"
        type="password"
        autocomplete="new-password"
        @blur="handleBlur('password')"
      />
      <p v-if="errorFor('password')" class="error">{{ errorFor('password') }}</p>
    </div>

    <div class="field">
      <label for="hr-confirm">Confirm password</label>
      <input
        id="hr-confirm"
        v-model="values.confirm"
        type="password"
        autocomplete="new-password"
        @blur="handleBlur('confirm')"
      />
      <p v-if="errorFor('confirm')" class="error">{{ errorFor('confirm') }}</p>
    </div>

    <div class="field">
      <label for="hr-fullName">Full name</label>
      <input id="hr-fullName" v-model="values.fullName" @blur="handleBlur('fullName')" />
      <p v-if="errorFor('fullName')" class="error">{{ errorFor('fullName') }}</p>
    </div>

    <div class="field">
      <label for="hr-age">Age</label>
      <input id="hr-age" v-model="values.age" inputmode="numeric" @blur="handleBlur('age')" />
      <p v-if="errorFor('age')" class="error">{{ errorFor('age') }}</p>
    </div>

    <fieldset class="attendees">
      <legend>Attendees</legend>
      <div v-for="(attendee, index) in values.attendees" :key="index" class="attendee">
        <div class="field">
          <label :for="`hr-att-name-${index}`">Name</label>
          <input
            :id="`hr-att-name-${index}`"
            v-model="attendee.name"
            @blur="handleBlur(`attendees[${index}].name`)"
          />
          <p v-if="errorFor(`attendees[${index}].name`)" class="error">
            {{ errorFor(`attendees[${index}].name`) }}
          </p>
        </div>
        <div class="field">
          <label :for="`hr-att-email-${index}`">Email</label>
          <input
            :id="`hr-att-email-${index}`"
            v-model="attendee.email"
            type="email"
            @blur="handleBlur(`attendees[${index}].email`)"
          />
          <p v-if="errorFor(`attendees[${index}].email`)" class="error">
            {{ errorFor(`attendees[${index}].email`) }}
          </p>
        </div>
        <button type="button" class="ghost" @click="removeAttendee(index)">Remove</button>
      </div>
      <p v-if="errorFor('attendees')" class="error">{{ errorFor('attendees') }}</p>
      <button type="button" class="ghost" @click="addAttendee">Add an attendee</button>
    </fieldset>

    <div class="field field--inline">
      <input id="hr-consent" v-model="values.consent" type="checkbox" @blur="handleBlur('consent')" />
      <label for="hr-consent">I accept the terms</label>
    </div>
    <p v-if="errorFor('consent')" class="error">{{ errorFor('consent') }}</p>

    <footer class="actions">
      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Registering…' : 'Register' }}
      </button>
      <button type="button" class="ghost" @click="resetForm">Reset</button>
      <span class="meta">dirty: {{ isDirty }} · submits: {{ submitCount }}</span>
    </footer>
  </form>
</template>
