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
  initRadioGroup(document.querySelector('#sex'));
  initDialog();
});

// --- The list of people (index.html) ---
function renderPeople() {
  const tbody = document.querySelector('#people');
  if (!tbody) return; // not on this page

  tbody.replaceChildren();
  for (const person of people) {
    // Each row is a schema.org Person: search engines and tools read it as one
    const row = document.createElement('tr');
    row.setAttribute('itemscope', '');
    row.setAttribute('itemtype', 'https://schema.org/Person');

    const lastName = document.createElement('td');
    lastName.textContent = person.lastName;
    lastName.setAttribute('itemprop', 'familyName');
    const firstName = document.createElement('td');
    firstName.textContent = person.firstName;
    firstName.setAttribute('itemprop', 'givenName');

    // A machine-readable date: assistive tech and search engines read datetime
    const birthDate = document.createElement('td');
    const time = document.createElement('time');
    time.dateTime = person.birthDate;
    time.setAttribute('itemprop', 'birthDate');
    time.textContent = person.birthDate;
    birthDate.append(time);

    // The name of the button says WHICH person: "View details" alone, five
    // times over, is useless in a list of links or buttons
    const actions = document.createElement('td');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-details';
    button.dataset.id = String(person.id);
    button.textContent = 'View details';
    const who = document.createElement('span');
    who.className = 'sr-only';
    who.textContent = ` of ${person.firstName} ${person.lastName}`;
    button.append(who);
    actions.append(button);

    row.append(lastName, firstName, birthDate, actions);
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

// --- The custom radio group (create.html) ---
// The roving tabindex: the group is ONE tab stop, the arrows move inside it.
const NEXT_KEYS = ['ArrowDown', 'ArrowRight'];
const PREVIOUS_KEYS = ['ArrowUp', 'ArrowLeft'];

function initRadioGroup(group) {
  if (!group) return; // not on this page
  const radios = [...group.querySelectorAll('[role="radio"]')];

  const select = (radio) => {
    for (const other of radios) {
      const checked = other === radio;
      other.setAttribute('aria-checked', String(checked));
      other.tabIndex = checked ? 0 : -1;
    }
    radio.focus();
  };

  group.addEventListener('click', (event) => {
    const radio = event.target.closest('[role="radio"]');
    if (radio) select(radio);
  });

  group.addEventListener('keydown', (event) => {
    const index = radios.indexOf(document.activeElement);
    if (index === -1) return;

    if (event.key === ' ') {
      event.preventDefault(); // no page scroll
      select(radios[index]);
    } else if (NEXT_KEYS.includes(event.key)) {
      event.preventDefault();
      select(radios[(index + 1) % radios.length]);
    } else if (PREVIOUS_KEYS.includes(event.key)) {
      event.preventDefault();
      select(radios[(index - 1 + radios.length) % radios.length]);
    }
  });
}

// --- The details dialog (index.html) ---
const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let dialogTrigger = null;

function initDialog() {
  const modal = document.querySelector('#modal');
  if (!modal) return; // not on this page

  document.querySelector('#people').addEventListener('click', (event) => {
    const button = event.target.closest('.btn-details');
    if (!button) return;
    const person = people.find(({ id }) => String(id) === button.dataset.id);
    openDialog(person, button);
  });

  modal.addEventListener('click', (event) => {
    if (event.target.closest('.close-btn, #modal-close')) closeDialog();
  });
  document.querySelector('#modal-overlay').addEventListener('click', closeDialog);

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDialog();
    if (event.key === 'Tab') trapFocus(modal, event);
  });
}

function openDialog(person, trigger) {
  dialogTrigger = trigger; // where the focus goes back on close

  document.querySelector('#modal-title').textContent = `${person.firstName} ${person.lastName}`;
  const content = document.querySelector('#modal-content');
  content.replaceChildren();
  for (const [term, value] of [
    ['Last name', person.lastName],
    ['First name', person.firstName],
    ['Birth date', person.birthDate],
  ]) {
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = value;
    content.append(dt, dd);
  }

  // The page behind can be neither reached nor read while the dialog is open
  for (const element of document.querySelectorAll('header, main, footer, .skip-link')) element.inert = true;
  document.querySelector('#modal-overlay').classList.add('is-open');
  const modal = document.querySelector('#modal');
  modal.classList.add('is-open');
  modal.querySelector('#modal-close').focus();
}

function closeDialog() {
  const modal = document.querySelector('#modal');
  if (!modal.classList.contains('is-open')) return;

  modal.classList.remove('is-open');
  document.querySelector('#modal-overlay').classList.remove('is-open');
  for (const element of document.querySelectorAll('[inert]')) element.inert = false;
  dialogTrigger?.focus();
  dialogTrigger = null;
}

/** Tab on the last element goes back to the first one, Shift+Tab the other way. */
function trapFocus(modal, event) {
  const focusable = [...modal.querySelectorAll(FOCUSABLE)];
  const first = focusable[0];
  const last = focusable.at(-1);

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
