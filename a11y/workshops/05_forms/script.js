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
  // TODO workshop 5: wire the validation of the form of create.html
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
