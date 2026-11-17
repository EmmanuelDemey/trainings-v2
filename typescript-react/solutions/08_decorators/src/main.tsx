// `npm start` — tsx runs the decorators: Node.js's type stripping cannot.
import { renderToStaticMarkup } from 'react-dom/server';
import { CartStore, auditLog } from './cart.ts';
import { CartView, CommandPalette } from './CartView.tsx';
import { commandsOf } from './decorators.ts';

const cart = new CartStore();
cart.add('book', 20, 2);
cart.add('pen', 2);
cart.discount = 5;

console.log(`${cart}`);
console.log('total:', cart.total());
console.log('shipping:', cart.shippingTo('FR'), cart.shippingTo('FR'));
console.log('commands:', commandsOf(CartStore));
console.log(auditLog.join('\n'));
console.log(renderToStaticMarkup(<><CartView cart={cart} /><CommandPalette of={CartStore} /></>));
