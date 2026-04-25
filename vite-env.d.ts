/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_RAZORPAY_KEY_ID: string;
  // add more VITE_ vars here as your project grows
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
