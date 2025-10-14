interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN: string
  readonly VITE_FB_API_KEY: string
  readonly VITE_FB_AUTH_DOMAIN: string
  readonly VITE_FB_PROJECT_ID: string
  readonly VITE_FN_SEND_EMAIL: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
declare module 'vue3-easy-data-table';