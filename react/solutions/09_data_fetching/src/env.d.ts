/// <reference types="vite/client" />

// Declaring the variables the app reads turns `import.meta.env.VITE_API_BASE_URL`
// from `any` into a `string`, and a typo in its name into a compile error.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
