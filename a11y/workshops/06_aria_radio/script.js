/**
 * Genea11y — the main script, shared by index.html and create.html.
 * The workshops complete it one after the other.
 */

// --- Sample data ---
const people = [
  { id: 1, lastName: 'Dupont', firstName: 'Jean', birthDate: '1980-05-15' },
  { id: 2, lastName: 'Martin', firstName: 'Marie', birthDate: '1975-03-22' },
  { id: 3, lastName: 'Bernard', firstName: 'Pierre', birthDate: '1990-11-08' },
  { id: 4, lastName: 'Durand', firstName: 'Sophie', birthDate: '1985-09-30' },
  { id: 5, lastName: 'Petit', firstName: 'Lucas', birthDate: '2000-01-12' },
];

document.addEventListener('DOMContentLoaded', () => {
  renderPeople();
  initCreateForm();
  // TODO workshop 6: make the custom radio group keyboard-operable
  // TODO workshop 7: wire the details dialog
});

// --- The list of people (index.html) ---
function renderPeople() {
  const tbody = document.querySelector('#people');
  if (!tbody) return; // not on this page

  tbody.replaceChildren();
  for (const person of people) {
    const row = document.createElement('tr');

    const lastName = document.createElement('td');
    lastName.textContent = person.lastName;
    const firstName = document.createElement('td');
    firstName.textContent = person.firstName;

    // A machine-readable date: assistive tech and search engines read datetime
    const birthDate = document.createElement('td');
    const time = document.createElement('time');
    time.dateTime = person.birthDate;
    time.textContent = person.birthDate;
    birthDate.append(time);

    row.append(lastName, firstName, birthDate);
    tbody.append(row);
  }
}

// --- The form (create.html) ---
const REQUIRED_FIELDS = [
  { id: 'last-name', message: 'The last name is required' },
  { id: 'first-name', message: 'The first name is required' },
];

function initCreateForm() {
  const form = document.querySelector('#create-form');
  if (!form) return; // not on this page

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const errors = REQUIRED_FIELDS.filter(({ id }) => document.getElementById(id).value.trim() === '');

    for (const { id, message } of REQUIRED_FIELDS) {
      setFieldError(document.getElementById(id), errors.some((error) => error.id === id) ? message : null);
    }
    renderErrorSummary(form, errors);

    const status = document.querySelector('#form-status');
    if (errors.length > 0) {
      status.textContent = '';
      // The first field in error takes the focus: the user lands where to act
      document.getElementById(errors[0].id).focus();
      return;
    }

    const lastName = document.getElementById('last-name').value.trim();
    const firstName = document.getElementById('first-name').value.trim();
    status.textContent = `${firstName} ${lastName} was added to the family tree.`;
    form.reset();
  });
}

/** Marks a field invalid and ties its message to it — or clears both. */
function setFieldError(input, message) {
  const errorId = `${input.id}-error`;
  document.getElementById(errorId)?.remove();

  if (!message) {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    return;
  }
  const error = document.createElement('p');
  error.className = 'error-message';
  error.id = errorId;
  error.textContent = message;
  input.after(error);
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', errorId);
}

/** The summary at the top of the form: role="alert", one link per field. */
function renderErrorSummary(form, errors) {
  form.querySelector('.error-summary')?.remove();
  if (errors.length === 0) return;

  const summary = document.createElement('div');
  summary.className = 'error-summary';
  summary.setAttribute('role', 'alert');

  const title = document.createElement('h3');
  title.textContent = `The form has ${errors.length} error${errors.length > 1 ? 's' : ''}`;
  const list = document.createElement('ul');
  for (const { id, message } of errors) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = message;
    item.append(link);
    list.append(item);
  }
  summary.append(title, list);
  form.prepend(summary);
}
