import { computed, ref } from 'vue';
import { listUsers, type User } from '../api/fakeApi';

/**
 * An app composable. Once `unplugin-auto-import` is wired with
 * `dirs: ['src/composables']`, no page has to import it either.
 */
export function useUsers() {
  const users = ref<User[]>(listUsers());
  const count = computed(() => users.value.length);

  return { users, count };
}
