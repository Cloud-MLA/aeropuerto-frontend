import { createMockIncident, getMockIncidents, getMockResources, updateMockResource } from '../mocks/infrastructure'
import type { AirportResource, Incident, IncidentDraft, ResourceStatus } from '../types/infrastructure'
import { request, USE_MOCKS } from './client'

const delay = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export async function listResources(status?: ResourceStatus): Promise<AirportResource[]> {
  if (USE_MOCKS) { await delay(350); return getMockResources(status) }
  const query = status ? `?estado=${encodeURIComponent(status)}` : ''
  return request<AirportResource[]>(`/api/infra/recursos${query}`)
}

export async function listIncidents(): Promise<Incident[]> {
  if (USE_MOCKS) { await delay(300); return getMockIncidents() }
  return request<Incident[]>('/api/infra/incidencias')
}

export async function createIncident(draft: IncidentDraft): Promise<Incident> {
  if (USE_MOCKS) { await delay(550); return createMockIncident(draft) }
  return request<Incident>('/api/infra/incidencias', { method: 'POST', body: JSON.stringify(draft) })
}

export async function updateResourceStatus(id: number, status: ResourceStatus): Promise<AirportResource> {
  if (USE_MOCKS) { await delay(400); return updateMockResource(id, status) }
  return request<AirportResource>(`/api/infra/recursos/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado: status }) })
}
