---
layout: cover
---

# Annexe — Introduction

<div style="opacity: 0.75; font-size: 0.9em;">Deep dives — outside the three-day run</div>

---

# TypeScript in this training

- **All code snippets are written in TypeScript** — closer to real-world projects
- Vue's Composition API was designed with type inference in mind:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const count = ref(0);                       // Ref<number>, inferred
const double = computed(() => count.value * 2);  // ComputedRef<number>
</script>
```

- Type-check a Vue project with **`vue-tsc`**, not `tsc`:

```bash
vue-tsc --noEmit      # understands .vue single-file components
```

