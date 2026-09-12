import { mockCrisisAnalytics } from '../mocks/analytics'
import type { AirlineFuelIncidentMetric, AverageDelayMetric, CrisisAnalytics, PeakDelayMetric, ResourceFailureMetric, TuuaRevenueMetric } from '../types/analytics'
import { request, useMocksFor } from './client'

const delay = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export async function getCrisisAnalytics(): Promise<CrisisAnalytics> {
  if (useMocksFor('ms5')) { await delay(550); return structuredClone(mockCrisisAnalytics) }
  const [resourceFailures, averageDelay, fuelIncidents, tuuaRevenue, peakDelays] = await Promise.all([
    request<ResourceFailureMetric[]>('/api/analitica/analitica/recursos-mas-fallas?dias=7'),
    request<AverageDelayMetric[]>('/api/analitica/analitica/retraso-promedio?tipo=Internacional'),
    request<AirlineFuelIncidentMetric[]>('/api/analitica/analitica/incidencias-combustible-por-aerolinea'),
    request<TuuaRevenueMetric[]>('/api/analitica/analitica/recaudacion-tuua-por-categoria'),
    request<PeakDelayMetric[]>('/api/analitica/analitica/vuelos-hora-punta-retrasados'),
  ])
  return { resourceFailures, averageDelay, fuelIncidents, tuuaRevenue, peakDelays }
}
