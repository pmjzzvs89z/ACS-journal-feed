/// <reference types="vite/client" />

// Minimal declaration so JSDoc typecheck stops flagging `import.meta.env.DEV`
// access in .js files under `src/utils/`. Vite injects these at build time;
// the full `ImportMetaEnv` is documented at https://vite.dev/guide/env-and-mode
interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
