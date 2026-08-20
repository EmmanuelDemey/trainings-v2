import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface CartLine {
  id: number;
  label: string;
  price: number;
  qty: number;
}

export const useCartStore = defineStore('cart', () => {
  const lines = ref<CartLine[]>([]);

  const count = computed(() => lines.value.reduce((n, l) => n + l.qty, 0));
  const total = computed(() => lines.value.reduce((n, l) => n + l.price * l.qty, 0));

  function add(line: Omit<CartLine, 'qty'>): void {
    const existing = lines.value.find((l) => l.id === line.id);
    if (existing) existing.qty += 1;
    else lines.value.push({ ...line, qty: 1 });
  }

  function remove(id: number): void {
    lines.value = lines.value.filter((l) => l.id !== id);
  }

  function clear(): void {
    lines.value = [];
  }

  return { lines, count, total, add, remove, clear };
});
