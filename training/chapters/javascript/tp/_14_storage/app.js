// TP 14 - Remembering
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

// --- The state --------------------------------------------------------------
// TODO (step 3): start from what was saved instead of an empty array.
let state = { todos: [] };

// --- 2. Writing -------------------------------------------------------------
function save() {
  // TODO: write state.todos under TODOS_KEY.
  //   Storage only holds strings: JSON.stringify on the way in.
}

// --- 3. Reading -------------------------------------------------------------
function load() {
  // TODO: read TODOS_KEY back and return the array.
  //   - a missing key gives null, and JSON.parse(null) returns null
  //   - a hand-edited value throws
  //   So: try / catch, and always a default value ([]).
  return [];
}

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
  // TODO: this is the ONE place that writes. Call save() here, then render().
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
  // TODO: empty the list AND remove the key from storage (removeItem), then
  //   render. Check in the Application panel that the key is really gone.
});

// --- 6. The draft, in sessionStorage ----------------------------------------
// TODO: on every `input` event on #draft, store its value under DRAFT_KEY in
//   sessionStorage. At startup, put it back into the textarea.
//   Then compare: reload (it is back), open a new tab (it is not).

// --- 7. Bonus: two tabs -----------------------------------------------------
// TODO: listen for the `storage` event on window and re-render when another tab
//   changes TODOS_KEY. The event never fires in the tab that wrote.

render();
