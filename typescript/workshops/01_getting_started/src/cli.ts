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
  case 'add':
    todos.push(createTodo(todos.length + 1, args.join(' ')));
    console.log(formatTodo(todos.at(-1)));
    break;
  default:
    console.error(`Unknown command: ${command}`);
    process.exitCode = 1;
}
