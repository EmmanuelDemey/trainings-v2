<template>
  <div class="skeleton" data-testid="profile-skeleton" aria-busy="true">
    <div class="line" style="width: 40%" />
    <div class="line" style="width: 65%" />
  </div>
</template>

<style scoped>
.skeleton { display: grid; gap: 0.6rem; padding: 0.4rem 0; }
.line {
  height: 0.9rem;
  border-radius: 4px;
  background: var(--border);
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}
</style>
