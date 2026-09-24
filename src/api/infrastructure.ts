import { createMockIncident, getMockIncidents, getMockResources, updateMockResource } from '../mocks/infrastructure'
import type { AirportResource, Incident, IncidentDraft, ResourceStatus } from '../types/infrastructure'
import { request, shouldUseMocksFor } from './client'
import { createResourceCache } from './resourceCache'

const delay = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

interface BackendResource {
  _id?: string
  id: number
  nombre_tecnico_locacion: string
  tipo: 'manga' | 'radar'
  manga?: { estado_acople?: string; longitud?: number; clase_max?: string }
  radar?: { estado_radar?: string; frecuencia?: string }
}

interface BackendIncident {
  id: number
  gravedad: Incident['severity']
  descripcion: string
  tipo_incidencia: string
  fecha_reporte: string
  fecha_cierre?: string | null
  afecta_recursos?: Array<{ recurso_id: number }>
  retrasa_vuelos?: Array<{ vuelo_id: number }>
}

function toFrontendStatus(resource: BackendResource): ResourceStatus {
  const status = resource.tipo === 'manga' ? resource.manga?.estado_acople : resource.radar?.estado_radar
  if (status === 'Inoperativa' || status === 'Fuera de servicio') return 'Fuera de servicio'
  if (status === 'Ocupado' || status === 'Mantenimiento') return status
  return 'Libre'
}

function mapResource(resource: BackendResource): AirportResource {
  const prefix = resource.tipo === 'manga' ? 'MGA' : 'RDR'
  return { backendId: resource._id, id: resource.id, code: `${prefix}-${String(resource.id).padStart(2, '0')}`, name: resource.nombre_tecnico_locacion, type: resource.tipo === 'manga' ? 'Manga' : 'Radar', zone: resource.nombre_tecnico_locacion, status: toFrontendStatus(resource) }
}

function mapIncident(incident: BackendIncident): Incident {
  const resourceId = incident.afecta_recursos?.[0]?.recurso_id ?? 0
  const flightId = incident.retrasa_vuelos?.[0]?.vuelo_id
  return { id: incident.id, title: incident.tipo_incidencia.replaceAll('_', ' '), type: incident.tipo_incidencia, severity: incident.gravedad, description: incident.descripcion, resourceId, resourceCode: resourceId ? `REC-${resourceId}` : 'Sin recurso', flightId, status: incident.fecha_cierre ? 'Cerrada' : 'Abierta', reportedAt: incident.fecha_reporte }
}

async function loadResources(): Promise<AirportResource[]> {
  if (shouldUseMocksFor('ms3')) { await delay(350); return getMockResources() }
  const resources = await request<BackendResource[]>('/api/infra/recursos')
  return resources.map(mapResource)
}

async function loadIncidents(): Promise<Incident[]> {
  if (shouldUseMocksFor('ms3')) { await delay(300); return getMockIncidents() }
  const incidents = await request<BackendIncident[]>('/api/infra/incidencias')
  return incidents.map(mapIncident)
}

const resourcesCache = createResourceCache(loadResources, 60_000)
const incidentsCache = createResourceCache(loadIncidents, 60_000)

export const getCachedResources = resourcesCache.peek
export const getCachedIncidents = incidentsCache.peek
export async function listResources(status?: ResourceStatus): Promise<AirportResource[]> {
  const resources = await resourcesCache.get()
  return status ? resources.filter((resource) => resource.status === status) : resources
}
export const listIncidents = incidentsCache.get

export async function createIncident(draft: IncidentDraft): Promise<Incident> {
  if (shouldUseMocksFor('ms3')) { await delay(550); const created = createMockIncident(draft); incidentsCache.invalidate(); resourcesCache.invalidate(); return created }
  const payload = {
    id: Math.floor(Date.now() / 1000),
    gravedad: draft.severity,
    descripcion: `${draft.title}: ${draft.description}`,
    tipo_incidencia: draft.type,
    fecha_reporte: new Date().toISOString(),
    fecha_cierre: null,
    afecta_recursos: [{ recurso_id: draft.resourceId }],
    retrasa_vuelos: draft.flightId ? [{ vuelo_id: draft.flightId }] : [],
  }
  const response = await request<{ datos: BackendIncident }>('/api/infra/incidencias', { method: 'POST', body: JSON.stringify(payload) })
  incidentsCache.invalidate()
  resourcesCache.invalidate()
  return mapIncident(response.datos)
}

export async function updateResourceStatus(resource: AirportResource, status: ResourceStatus): Promise<AirportResource> {
  if (shouldUseMocksFor('ms3')) { await delay(400); const updated = updateMockResource(resource.id, status); resourcesCache.update((items) => items.map((item) => item.id === updated.id ? updated : item)); return updated }
  const backendStatus = status === 'Fuera de servicio' ? 'Inoperativa' : status
  const body = resource.type === 'Manga' ? { manga: { estado_acople: backendStatus } } : { radar: { estado_radar: backendStatus } }
  const response = await request<{ datos: BackendResource }>(`/api/infra/recursos/${resource.backendId ?? resource.id}/estado`, { method: 'PATCH', body: JSON.stringify(body) })
  const updated = mapResource(response.datos)
  resourcesCache.update((items) => items.map((item) => item.id === updated.id ? updated : item))
  return updated
}
