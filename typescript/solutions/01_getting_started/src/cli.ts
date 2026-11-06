// Run it with `npm start -- add "Buy milk"` — Node.js runs this file as is: it
// strips the types, it does not check them. That is `npm run typecheck`'s job.
import { createTodo, formatTodo, summary, toggle } from './todo.ts';

const todos = [createTodo(1, 'Buy milk'), createTodo(2, 'Call Bob'), createTodo(3, 'Learn TypeScript')];
todos[0] = toggle(todos[0]);

const [command = 'list', ...args] = process.argv.slice(2);

switch (command) {
  case 'list':
    todos.forEach((todo) => console.log(formatTodo(todo)));
    console.log(summary(todos));
    break;
  case 'add': {
    // `todos.at(-1)` is typed `Todo | undefined`: on an empty array there is no
    // last element, and the checker does not track that we just pushed one. With
    // `strictNullChecks`, `undefined` is not a `Todo`, so `formatTodo` refuses it.
    // A `!` or an `as` would only silence the checker; keeping the todo we created
    // in a variable gives it a `Todo` it can prove — no `undefined` to deal with.
    const todo = createTodo(todos.length + 1, args.join(' '));
    todos.push(todo);
    console.log(formatTodo(todo));
    break;
  }
  default:
    console.error(`Unknown command: ${command}`);
    process.exitCode = 1;
}
