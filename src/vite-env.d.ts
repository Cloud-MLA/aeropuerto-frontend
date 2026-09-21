/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_USE_MOCKS?: string
  readonly VITE_REAL_SERVICES?: string
  readonly VITE_MS1_OPENAPI_URL?: string
  readonly VITE_MS2_OPENAPI_URL?: string
  readonly VITE_MS3_OPENAPI_URL?: string
  readonly VITE_MS4_OPENAPI_URL?: string
  readonly VITE_MS5_OPENAPI_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

