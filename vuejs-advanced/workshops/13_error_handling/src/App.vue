<script setup lang="ts">
/**
 * The ops console. Every panel can be broken on purpose, and each panel gets its
 * own boundary: once ErrorBoundary works, one broken panel costs one panel.
 *
 * One boundary around both would degrade two
 * panels for one failure — the granularity of a boundary is a product decision,
 * not a technical one: it answers "what is the smallest thing this user can
 * afford to lose?".
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
    <ErrorBoundary label="Totals">
      <TotalsPanel :rows="brokenTotals ? null : ROWS" />
    </ErrorBoundary>
  </section>

  <section>
    <h2>Self-healing panel</h2>
    <ErrorBoundary label="Self-healing panel">
      <SelfHealingPanel :broken="brokenSelf" />
    </ErrorBoundary>
  </section>

  <section>
    <h2>Outside the pipeline</h2>
    <EscapedPanel />
  </section>

  <IncidentLog />
</template>
