<script setup lang="ts">
import { computed, ref } from 'vue';
import { BOOKS, type Book } from './books';
import BookCard from './components/BookCard.vue';
import BookSearch from './components/BookSearch.vue';
import CartSummary from './components/CartSummary.vue';

const props = withDefaults(defineProps<{ books?: Book[] }>(), { books: () => BOOKS });

const query = ref('');
const cart = ref(new Map<string, { book: Book; quantity: number }>());
const confirmation = ref<string | null>(null);

const visible = computed(() => {
  const q = query.value.trim().toLowerCase();
  return props.books.filter((b) => `${b.title} ${b.author}`.toLowerCase().includes(q));
});
const lines = computed(() => [...cart.value.values()]);

function add(book: Book) {
  const line = cart.value.get(book.isbn);
  cart.value.set(book.isbn, { book, quantity: (line?.quantity ?? 0) + 1 });
}
function inCart(book: Book) {
  return cart.value.get(book.isbn)?.quantity ?? 0;
}
function checkout(coupon: string | null) {
  const count = lines.value.reduce((sum, l) => sum + l.quantity, 0);
  confirmation.value = `Order placed: ${count} book${count > 1 ? 's' : ''}${coupon ? `, coupon ${coupon}` : ''}.`;
  cart.value.clear();
}
</script>

<template>
  <main>
    <h1>The Paper Lantern</h1>
    <p v-if="confirmation" role="alert">{{ confirmation }}</p>
    <BookSearch v-model="query" />
    <p v-if="visible.length === 0">No book matches “{{ query }}”.</p>
    <BookCard v-for="book in visible" :key="book.isbn" :book="book" :in-cart="inCart(book)" @add="add" />
    <CartSummary :lines="lines" @remove="cart.delete($event)" @checkout="checkout" />
  </main>
</template>
