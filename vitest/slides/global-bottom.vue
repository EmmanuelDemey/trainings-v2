<template>
  <div class="slide-number">
    {{ $slidev.nav.currentPage }} / {{ $slidev.nav.total }}
  </div>
</template>

<style scoped>
.slide-number {
  position: fixed;
  bottom: 1rem;
  right: 1.5rem;
  font-size: 0.875rem;
  opacity: 0.5;
  font-weight: 500;
  z-index: 100;
}
</style>
