<template>
  <div class="skeleton" data-testid="chart-skeleton" aria-busy="true">
    <div v-for="n in 12" :key="n" class="bar" :style="{ height: `${30 + ((n * 13) % 60)}%` }" />
  </div>
</template>

<style scoped>
.skeleton {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 180px;
}
.bar {
  flex: 1;
  border-radius: 4px 4px 0 0;
  background: var(--border);
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
</style>
