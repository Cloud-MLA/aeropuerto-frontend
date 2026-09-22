import { mockCrisisAnalytics } from '../mocks/analytics'
import type { CrisisAnalytics } from '../types/analytics'
import { request, shouldUseMocksFor } from './client'
import { adaptAnalytics } from './contractAdapters'

const delay = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export async function getCrisisAnalytics(): Promise<CrisisAnalytics> {
  if (shouldUseMocksFor('ms5')) { await delay(550); return structuredClone(mockCrisisAnalytics) }
  return adaptAnalytics(await Promise.all([
    request<unknown>('/api/analitica/analitica/recursos-mas-fallas?dias=7', undefined, 75_000),
    request<unknown>('/api/analitica/analitica/retraso-promedio?tipo=Internacional', undefined, 75_000),
    request<unknown>('/api/analitica/analitica/incidencias-combustible-por-aerolinea', undefined, 75_000),
    request<unknown>('/api/analitica/analitica/recaudacion-tuua-por-categoria', undefined, 75_000),
    request<unknown>('/api/analitica/analitica/vuelos-hora-punta-retrasados', undefined, 75_000),
  ]))
}
