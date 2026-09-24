import { mockCrisisAnalytics } from '../mocks/analytics'
import type { CrisisAnalytics } from '../types/analytics'
import { request, shouldUseMocksFor } from './client'
import { adaptAnalytics } from './contractAdapters'
import { createResourceCache } from './resourceCache'

const delay = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

async function loadCrisisAnalytics(): Promise<CrisisAnalytics> {
  if (shouldUseMocksFor('ms5')) { await delay(550); return structuredClone(mockCrisisAnalytics) }
  return adaptAnalytics(await Promise.all([
    request<unknown>('/api/analitica/recursos-mas-fallas?dias=7', undefined, 75_000),
    request<unknown>('/api/analitica/retraso-promedio?tipo=Internacional', undefined, 75_000),
    request<unknown>('/api/analitica/incidencias-combustible-por-aerolinea', undefined, 75_000),
    request<unknown>('/api/analitica/recaudacion-tuua-por-categoria', undefined, 75_000),
    request<unknown>('/api/analitica/vuelos-hora-punta-retrasados', undefined, 75_000),
  ]))
}

const analyticsCache = createResourceCache(loadCrisisAnalytics, 60_000)

export const getCrisisAnalytics = analyticsCache.get
export const getCachedCrisisAnalytics = analyticsCache.peek
