<script setup lang="ts">
/**
 * The clock, and nothing else.
 *
 * Owning `now` here is the whole point: the ticking state no longer sits in a
 * parent, so the second that passes re-renders this badge and stops there. The
 * interval is cleared on unmount — an interval outliving its component is the
 * leak the Timeline shows as updates on a page you already left.
 */
import { computed, onUnmounted, onUpdated, ref } from 'vue';
import { countRender } from './renderStats';

const now = ref(new Date());
const timer = setInterval(() => {
  now.value = new Date();
}, 1000);
onUnmounted(() => clearInterval(timer));

const time = computed(() => now.value.toLocaleTimeString('en-GB'));

onUpdated(() => countRender('ClockBadge'));
</script>

<template>
  <span class="muted" data-testid="clock">{{ time }}</span>
</template>
