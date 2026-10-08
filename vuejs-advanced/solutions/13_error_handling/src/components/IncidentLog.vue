<script setup lang="ts">
/** The reporter, on screen. Nothing to change here. */
import { reports, resetReports } from '../observability/reporter';
</script>

<template>
  <section>
    <h2>Incident log</h2>
    <div class="row">
      <span class="muted"><strong data-testid="report-count">{{ reports.length }}</strong> report(s)</span>
      <button type="button" data-testid="clear-reports" @click="resetReports()">Clear</button>
    </div>
    <table v-if="reports.length > 0">
      <thead><tr><th>Source</th><th>Phase</th><th>Message</th></tr></thead>
      <tbody>
        <tr v-for="(report, index) in reports" :key="index" data-testid="report-row">
          <td data-testid="report-source">{{ report.source }}</td>
          <td class="muted" data-testid="report-info">{{ report.info }}</td>
          <td data-testid="report-message">{{ report.message }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
