/// <reference types="vite/client" />

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// Enhanced environment variables
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_DATAFORSEO_LOGIN?: string;
  readonly VITE_DATAFORSEO_PASSWORD?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_GA_MEASUREMENT_ID?: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};