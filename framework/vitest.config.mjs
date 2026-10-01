import { defineConfig } from 'vitest/config';

// One Vitest project per package, named after its folder: `pnpm test` runs both,
// `pnpm test --project create-training-kit` one of them (the CI runs them apart).
const packages = ['training-kit', 'create-training-kit'];

export default defineConfig({
  test: {
    projects: packages.map((name) => ({ root: `packages/${name}`, test: { name } })),
  },
});
