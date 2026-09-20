<script setup lang="ts">
import LocaleSwitcher from './components/LocaleSwitcher.vue';
import CatalogPanel from './components/CatalogPanel.vue';
import CartPanel from './components/CartPanel.vue';
import LegalPanel from './components/LegalPanel.vue';
</script>

<template>
  <h1>Boutique</h1>
  <LocaleSwitcher />
  <CatalogPanel />
  <CartPanel />
  <LegalPanel />
</template>
