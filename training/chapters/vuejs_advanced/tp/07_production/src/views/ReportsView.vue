<script setup lang="ts">
/**
 * The only consumer of the heavy "library". One button, 120 kB in the entry
 * chunk for every visitor.
 */
import { ref } from 'vue';
// TODO 2.4: this static import is what drags `heavyReport` into the entry chunk.
//   Move it inside `exportReport()` as a dynamic `await import(...)` and rebuild.
//   Then check in the Network tab that the chunk is fetched on CLICK, not on load.
import { buildReport, download, type ReportRow } from '@/api/heavyReport';
import { config } from '@/config';

const rows: ReportRow[] = [
  { label: 'Acme', value: 1240.5 },
  { label: 'Globex', value: 89.9 },
  { label: 'Initech', value: 4300 },
];

const busy = ref(false);

async function exportReport(): Promise<void> {
  busy.value = true;
  try {
    download(buildReport(rows), 'report.csv');
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <section>
    <h2>Reports</h2>

    <p v-if="!config.features.reports" class="muted" data-testid="feature-off">
      The <code>reports</code> feature flag is off in this mode — the button below
      would normally be hidden. It is kept visible so you can measure the chunk.
    </p>

    <button type="button" data-testid="export" :disabled="busy" @click="exportReport">
      {{ busy ? 'Building…' : 'Export the report (CSV)' }}
    </button>

    <p class="muted">
      TODO 2.4 — once the import is dynamic, this button downloads its code the
      first time it is clicked. Everything else stays the same for the user.
    </p>
  </section>
</template>
