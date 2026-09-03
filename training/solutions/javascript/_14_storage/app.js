// TP 14 - Remembering — solution
//
// ⚠️ Chrome refuses localStorage on a file:// page. Serve the folder first:
//
//     npx serve chapters/javascript/tp/14_storage
//
// Keep the Application panel of the devtools open, on Local Storage.

const TODOS_KEY = 'trainings.todos.v1';
const DRAFT_KEY = 'trainings.draft.v1';

const list = document.querySelector('#todos');
const empty = document.querySelector('#empty');
const countLine = document.querySelector('#count');
const form = document.querySelector('#add-form');
const input = document.querySelector('#task');
const draft = document.querySelector('#draft');

// --- 2. Writing -------------------------------------------------------------
function save() {
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(state.todos));
  } catch (error) {
    // Quota exceeded, private mode, storage disabled: the app keeps working in
    // memory. Persistence is a convenience, never the source of truth.
    console.warn('storage unavailable, staying in memory:', error.name);
  }
}

// --- 3. Reading -------------------------------------------------------------
function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(TODOS_KEY));
    // A missing key parses to null; a value written by an older version of the
    // app can be anything. Only an array is usable here.
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

// --- The state --------------------------------------------------------------
// Read once, at startup. Everything after that goes through update().
let state = { todos: load() };

// --- The page ---------------------------------------------------------------
function render() {
  list.replaceChildren(
    ...state.todos.map((todo) => {
      const li = document.createElement('li');

      const label = document.createElement('span');
      label.textContent = todo.text;
      if (todo.done) label.classList.add('done');

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.textContent = todo.done ? 'Undo' : 'Done';
      toggle.addEventListener('click', () => {
        update({
          todos: state.todos.map((item) =>
            item.id === todo.id ? { ...item, done: !item.done } : item,
          ),
        });
      });

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => {
        update({ todos: state.todos.filter((item) => item.id !== todo.id) });
      });

      li.append(label, toggle, remove);
      return li;
    }),
  );

  empty.classList.toggle('hidden', state.todos.length > 0);
  countLine.textContent = `${state.todos.filter((todo) => !todo.done).length} left, ${state.todos.length} in total`;
}

// --- 4. One single funnel ---------------------------------------------------
function update(next) {
  state = { ...state, ...next };
  save();   // the ONE place that writes — no setItem in the handlers
  render();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  update({ todos: [...state.todos, { id: crypto.randomUUID(), text, done: false }] });
  input.value = '';
  input.focus();
});

// --- 5. Clear ---------------------------------------------------------------
document.querySelector('#clear').addEventListener('click', () => {
  state = { ...state, todos: [] };
  localStorage.removeItem(TODOS_KEY); // save() would leave an empty '[]' behind
  render();
});

// --- 6. The draft, in sessionStorage ----------------------------------------
// Same four methods, another lifetime: this one dies with the tab.
draft.value = sessionStorage.getItem(DRAFT_KEY) ?? '';
draft.addEventListener('input', () => {
  sessionStorage.setItem(DRAFT_KEY, draft.value);
});

// --- 7. Bonus: two tabs -----------------------------------------------------
// Fired in the OTHER tabs of the same origin, never in the one that wrote.
window.addEventListener('storage', (event) => {
  if (event.key !== TODOS_KEY) return;
  state = { ...state, todos: load() };
  render();
});

render();
