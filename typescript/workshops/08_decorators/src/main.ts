// `npm start` — tsx runs the decorators: Node.js's type stripping cannot.
import { Cart, auditLog } from './cart.ts';
import { commandsOf } from './decorators.ts';

const cart = new Cart();
cart.add('book', 20, 2);
cart.add('pen', 2);
cart.discount = 5;

console.log(`${cart}`);
console.log('total:', cart.total());
console.log('shipping:', cart.shippingTo('FR'), cart.shippingTo('FR'));
console.log('commands:', commandsOf(Cart));
console.log(auditLog.join('\n'));
