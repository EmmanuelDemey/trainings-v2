// The catalogue, the stock and the reviews of the ReBoot shop.

const products = document.getElementById('products');
const stock = document.getElementById('stock');
const reviews = document.getElementById('reviews');

// --- The catalogue -----------------------------------------------------------
// The one function the page used from a 200 kB bundle: the platform has it.
const price = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

for (const product of window.PRODUCTS) {
  const item = document.createElement('li');
  item.className = 'product';
  item.innerHTML = `
    <picture>
      <source type="image/avif" srcset="images/${product.slug}-240.avif 240w, images/${product.slug}-480.avif 480w" sizes="15rem" />
      <img src="images/${product.slug}-240.webp" srcset="images/${product.slug}-240.webp 240w, images/${product.slug}-480.webp 480w"
        sizes="15rem" width="240" height="240" alt="${product.name}" loading="lazy" decoding="async" />
    </picture>
    <h3>${product.name}</h3>
    <p class="grade">${product.grade}</p>
    <p class="price">${price.format(product.priceCents / 100)}</p>`;
  products.append(item);
}

// --- The stock -----------------------------------------------------------------
// It changes a few times a day: once per visit is enough.
fetch('stock.json')
  .then((response) => response.json())
  .then(({ available }) => {
    stock.textContent = `${available} phones in stock`;
  });

// --- The reviews ---------------------------------------------------------------
// Built when someone asks for them, and only the first 20.
const AUTHORS = ['Alice', 'Bilal', 'Chloé', 'Diego', 'Emma', 'Farid', 'Gaëlle', 'Hugo'];
const TEXTS = ['Works like new.', 'Battery still great.', 'Fast delivery.', 'Not a scratch.', 'Half the price of a new one.'];
document.getElementById('show-reviews').addEventListener('click', (event) => {
  for (let i = 0; i < 20; i++) {
    const review = document.createElement('li');
    review.innerHTML = `<span class="author">${AUTHORS[i % AUTHORS.length]}</span>
      <span class="stars">${'★'.repeat(3 + (i % 3))}</span> ${TEXTS[i % TEXTS.length]}`;
    reviews.append(review);
  }
  reviews.hidden = false;
  event.currentTarget.hidden = true;
});
