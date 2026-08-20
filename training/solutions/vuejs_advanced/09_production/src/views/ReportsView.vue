<script setup lang="ts">
/**
 * The only consumer of the heavy "library". One button, 120 kB in the entry
 * chunk for every visitor.
 */
import { ref } from 'vue';
// TYPE-ONLY import: erased at compile time, so it drags nothing into any chunk.
// The runtime import moved into `exportReport()` below.
import type { ReportRow } from '@/api/heavyReport';
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
    // Fetched on the FIRST click, then cached by the module registry. The chunk
    // is small on disk — the 4 000-row table is built at runtime — but nobody
    // who never exports a report pays to download, parse or run any of it.
    const { buildReport, download } = await import('@/api/heavyReport');
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
      The import is dynamic: this button downloads its code the first time it is
      clicked, and never again. Watch the Network tab — nothing on page load.
    </p>
  </section>
</template>
