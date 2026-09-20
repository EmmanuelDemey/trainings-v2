<script setup lang="ts">
/**
 * The ops console. Every panel below can be broken on purpose, and today
 * breaking one of them takes the whole page with it.
 *
 * TODO 6: wrap `TotalsPanel` and `SelfHealingPanel` — each in its **own**
 *   `<ErrorBoundary>`, with a `label`. One boundary around both would degrade
 *   two panels for one failure; the granularity of a boundary is a product
 *   decision, not a technical one.
 */
import { ref } from 'vue';
import ErrorBoundary from './components/ErrorBoundary.vue';
import TotalsPanel from './components/TotalsPanel.vue';
import SelfHealingPanel from './components/SelfHealingPanel.vue';
import EscapedPanel from './components/EscapedPanel.vue';
import IncidentLog from './components/IncidentLog.vue';

const ROWS = [
  { label: 'Hosting', amount: 1240 },
  { label: 'Support', amount: 380 },
  { label: 'Licences', amount: 612 },
];

const brokenTotals = ref(false);
const brokenSelf = ref(false);
</script>

<template>
  <h1>Ops console</h1>

  <section>
    <h2>Break things</h2>
    <div class="row">
      <button type="button" data-testid="break-totals" @click="brokenTotals = !brokenTotals">
        {{ brokenTotals ? 'Repair the totals' : 'Break the totals' }}
      </button>
      <button type="button" data-testid="break-self" @click="brokenSelf = !brokenSelf">
        {{ brokenSelf ? 'Repair the panel' : 'Break the self-healing panel' }}
      </button>
    </div>
  </section>

  <section>
    <h2>Totals</h2>
    <TotalsPanel :rows="brokenTotals ? null : ROWS" />
  </section>

  <section>
    <h2>Self-healing panel</h2>
    <SelfHealingPanel :broken="brokenSelf" />
  </section>

  <section>
    <h2>Outside the pipeline</h2>
    <EscapedPanel />
  </section>

  <IncidentLog />
</template>
