// The data, and the only four ways to touch it.
console.log('store loaded'); // step 4: printed ONCE, whoever imports this file

// `items` is NOT exported: the outside world goes through the functions below.
let items = [
  { id: 'i1', name: 'Mug', price: 12 },
  { id: 'i2', name: 'Poster', price: 8.5 },
];

export function getItems() {
  return items;
}

export function addItem(name, amount) {
  items = [...items, { id: crypto.randomUUID(), name, price: amount }];
}

export function removeItem(id) {
  items = items.filter((item) => item.id !== id);
}

export function total() {
  return items.reduce((sum, item) => sum + item.price, 0);
}
