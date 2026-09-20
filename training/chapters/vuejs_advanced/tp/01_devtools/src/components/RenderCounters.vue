<script setup lang="ts">
/**
 * The scoreboard. Nothing to change here — this is where you read the before /
 * after numbers the Definition of Done asks for.
 */
import { renderStats, resetRenderStats } from './renderStats';
</script>

<template>
  <section>
    <h2>Render counters</h2>
    <div class="row">
      <span v-for="(count, name) in renderStats" :key="name">
        {{ name }}: <strong :data-testid="`renders-${name}`">{{ count }}</strong>
      </span>
      <button type="button" data-testid="reset-counters" @click="resetRenderStats()">
        Reset
      </button>
    </div>
    <p class="muted">
      Reset, wait five seconds without touching anything, and read them again.
      Every number that moved is a render nobody asked for.
    </p>
  </section>
</template>
