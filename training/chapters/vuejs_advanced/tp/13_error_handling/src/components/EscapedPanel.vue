<script setup lang="ts">
/**
 * Two ways out of Vue's pipeline. Neither button is caught by any boundary, and
 * neither reaches `app.config.errorHandler`: once you hand a callback to the
 * platform, you have left the pipeline.
 *
 * Nothing to change here. The fix is in `src/observability/windowNet.ts`.
 */
function throwFromATimer(): void {
  setTimeout(() => {
    throw new Error('thrown from a timer');
  }, 0);
}

function rejectWithoutAwaiting(): void {
  void Promise.reject(new Error('nobody awaited me'));
}
</script>

<template>
  <div class="row">
    <button type="button" data-testid="throw-timer" @click="throwFromATimer()">
      Throw from a timer
    </button>
    <button type="button" data-testid="reject-promise" @click="rejectWithoutAwaiting()">
      Reject a promise
    </button>
  </div>
</template>
