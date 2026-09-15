import { price } from './format.js';
import { removeItem } from './store.js';

// Default export: one main thing per module, named by whoever imports it.
// `onChange` is passed in rather than imported from app.js — importing it back
// would be a circular import, and this module has no business knowing render().
export default function createItem(item, onChange) {
  const li = document.createElement('li');

  const label = document.createElement('span');
  label.textContent = `${item.name} — ${price(item.price)}`;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.textContent = 'Remove';
  remove.addEventListener('click', () => {
    removeItem(item.id);
    onChange();
  });

  li.append(label, remove);
  return li;
}
