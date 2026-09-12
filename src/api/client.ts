const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'
const REAL_SERVICES = new Set(
  (import.meta.env.VITE_REAL_SERVICES ?? '')
    .split(',')
    .map((service) => service.trim().toLowerCase())
    .filter(Boolean),
)

export function shouldUseMocksFor(service: 'ms1' | 'ms2' | 'ms3' | 'ms4' | 'ms5'): boolean {
  if (USE_MOCKS) return true
  if (REAL_SERVICES.size === 0) return false
  return !REAL_SERVICES.has(service)
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new ApiError('La URL de API Gateway no está configurada.')
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(`La API respondió con estado ${response.status}.`, response.status)
  }

  return response.json() as Promise<T>
}

