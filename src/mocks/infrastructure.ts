import type { AirportResource, Incident, IncidentDraft, ResourceStatus } from '../types/infrastructure'

const resources: AirportResource[] = [
  { id: 1, code: 'MGA-01', name: 'Manga de embarque 01', type: 'Manga', zone: 'Terminal nacional', status: 'Libre', lastInspection: '2026-09-08T09:30:00-05:00' },
  { id: 2, code: 'MGA-04', name: 'Manga de embarque 04', type: 'Manga', zone: 'Terminal internacional', status: 'Ocupado', lastInspection: '2026-09-08T08:15:00-05:00' },
  { id: 3, code: 'RDR-02', name: 'Radar de superficie 02', type: 'Radar', zone: 'Torre de control', status: 'Mantenimiento', lastInspection: '2026-09-07T16:00:00-05:00' },
  { id: 4, code: 'PUE-B12', name: 'Puerta B12', type: 'Puerta', zone: 'Espigón norte', status: 'Libre', lastInspection: '2026-09-09T06:45:00-05:00' },
  { id: 5, code: 'VEH-17', name: 'Remolcador de aeronaves 17', type: 'Vehículo', zone: 'Plataforma oeste', status: 'Libre', lastInspection: '2026-09-08T18:20:00-05:00' },
  { id: 6, code: 'RDR-03', name: 'Radar meteorológico 03', type: 'Radar', zone: 'Torre de control', status: 'Fuera de servicio', lastInspection: '2026-09-06T11:10:00-05:00' },
]

const incidents: Incident[] = [
  { id: 301, title: 'Lectura intermitente', type: 'Falla_Radar', severity: 'Alta', description: 'Se detectaron pérdidas breves de señal.', resourceId: 3, resourceCode: 'RDR-02', flightId: 1841, status: 'En atención', reportedAt: '2026-09-09T08:35:00-05:00' },
  { id: 302, title: 'Sensor de acople', type: 'Falla_Manga', severity: 'Media', description: 'El sensor requiere calibración preventiva.', resourceId: 2, resourceCode: 'MGA-04', status: 'Abierta', reportedAt: '2026-09-09T09:10:00-05:00' },
]

export function getMockResources(status?: ResourceStatus): AirportResource[] {
  return resources.filter((resource) => !status || resource.status === status).map((resource) => ({ ...resource }))
}

export function getMockIncidents(): Incident[] {
  return incidents.map((incident) => ({ ...incident }))
}

export function createMockIncident(draft: IncidentDraft): Incident {
  const resource = resources.find((item) => item.id === draft.resourceId)
  if (!resource) throw new Error('El recurso seleccionado ya no existe.')
  const incident: Incident = { ...draft, id: 303 + incidents.length, status: 'Abierta', reportedAt: new Date().toISOString(), resourceCode: resource.code }
  incidents.unshift(incident)
  resource.status = 'Fuera de servicio'
  return { ...incident }
}

export function updateMockResource(id: number, status: ResourceStatus): AirportResource {
  const resource = resources.find((item) => item.id === id)
  if (!resource) throw new Error('No se encontró el recurso seleccionado.')
  resource.status = status
  return { ...resource }
}
