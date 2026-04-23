/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // add more VITE_ vars here as your project grows
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
