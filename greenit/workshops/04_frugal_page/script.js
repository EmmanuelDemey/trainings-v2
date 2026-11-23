// The catalogue, the stock and the reviews of the ReBoot shop.

const products = document.getElementById('products');
const stock = document.getElementById('stock');
const reviews = document.getElementById('reviews');

// --- The catalogue -----------------------------------------------------------
// TODO workshop 4: what does this page need from vendor/everything.js?
for (const product of window.PRODUCTS) {
  const item = document.createElement('li');
  item.className = 'product';
  item.innerHTML = `
    <div class="card"><div class="card-inner"><div class="card-image-wrapper"><div class="card-image">
      <img src="images/${product.slug}.png" alt="${product.name}" />
    </div></div>
    <div class="card-body"><div class="card-title"><h3>${product.name}</h3></div>
      <div class="card-meta"><span class="grade">${product.grade}</span></div>
      <div class="card-price"><span class="price">${Everything.formatPrice(product.priceCents)}</span></div>
    </div></div></div>`;
  products.append(item);
}

// --- The stock -----------------------------------------------------------------
// TODO workshop 4: the stock changes a few times a day
async function refreshStock() {
  const response = await fetch('stock.json');
  const { available } = await response.json();
  stock.textContent = `${available} phones in stock`;
}
refreshStock();
setInterval(refreshStock, 1000);

// --- The reviews ---------------------------------------------------------------
const AUTHORS = ['Alice', 'Bilal', 'Chloé', 'Diego', 'Emma', 'Farid', 'Gaëlle', 'Hugo'];
const TEXTS = ['Works like new.', 'Battery still great.', 'Fast delivery.', 'Not a scratch.', 'Half the price of a new one.'];
for (let i = 0; i < 400; i++) {
  const review = document.createElement('li');
  review.innerHTML = `<div class="review"><div class="review-header"><span class="author">${AUTHORS[i % AUTHORS.length]}</span>
    <span class="stars">${'★'.repeat(3 + (i % 3))}</span></div><div class="review-body"><p>${TEXTS[i % TEXTS.length]}</p></div></div>`;
  reviews.append(review);
}
document.getElementById('show-reviews').addEventListener('click', (event) => {
  reviews.hidden = false;
  event.currentTarget.hidden = true;
});
