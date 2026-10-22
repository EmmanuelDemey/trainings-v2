<script setup lang="ts">
import { formatPrice, type Book } from '../books';

const props = defineProps<{ book: Book; inCart: number }>();
const emit = defineEmits<{ add: [book: Book] }>();

const soldOut = () => props.inCart >= props.book.stock;
</script>

<template>
  <article :aria-labelledby="`title-${book.isbn}`">
    <h2 :id="`title-${book.isbn}`">{{ book.title }}</h2>
    <p>{{ book.author }}</p>
    <p>{{ formatPrice(book.priceInCents) }}</p>
    <p v-if="book.stock === 0" role="status">Out of stock</p>
    <button type="button" :disabled="soldOut()" @click="emit('add', book)">
      Add “{{ book.title }}” to cart
    </button>
  </article>
</template>
