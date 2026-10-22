<script setup lang="ts">
const query = defineModel<string>({ required: true });
</script>

<template>
  <label>
    Search the catalog
    <input v-model="query" type="search" placeholder="Title or author" />
  </label>
</template>
