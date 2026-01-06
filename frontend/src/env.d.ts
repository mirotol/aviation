/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPTILER_API_KEY: string;
  // add more VITE_ vars here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
