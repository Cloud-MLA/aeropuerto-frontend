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

function dependencyMessage(status?: number) {
  if (status === 404) return 'El recurso solicitado no existe o todavía no está publicado en API Gateway.'
  if (status === 409) return 'La operación entra en conflicto con el estado actual del recurso.'
  if (status === 422) return 'La operación no cumple una regla de negocio del microservicio.'
  if (status === 502 || status === 503 || status === 504) return 'El microservicio está temporalmente fuera de servicio. Inténtalo nuevamente en unos minutos.'
  return status ? `La API respondió con estado ${status}.` : 'No fue posible comunicarse con la API.'
}

async function readApiMessage(response: Response) {
  try {
    const body = await response.clone().json() as { detail?: unknown; error?: { message?: unknown }; message?: unknown }
    const candidate = body.error?.message ?? body.detail ?? body.message
    return typeof candidate === 'string' && candidate.trim() ? candidate : dependencyMessage(response.status)
  } catch {
    return dependencyMessage(response.status)
  }
}

export async function request<T>(path: string, init?: RequestInit, timeoutMs = 12_000): Promise<T> {
  if (!API_BASE) {
    throw new ApiError('La URL de API Gateway no está configurada.')
  }

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  let response: Response

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch (reason) {
    if (reason instanceof DOMException && reason.name === 'AbortError') {
      throw new ApiError('La API tardó demasiado en responder. Verifica que el microservicio esté desplegado.')
    }
    throw new ApiError('No se pudo conectar con API Gateway. Verifica el despliegue, la red y la configuración CORS.')
  } finally {
    window.clearTimeout(timeout)
  }

  if (!response.ok) {
    throw new ApiError(await readApiMessage(response), response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

