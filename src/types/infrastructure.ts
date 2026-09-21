export type ResourceStatus = 'Libre' | 'Ocupado' | 'Mantenimiento' | 'Fuera de servicio'
export type IncidentSeverity = 'Leve' | 'Moderada' | 'Alta' | 'Critica'

export interface AirportResource {
  backendId?: string
  id: number
  code: string
  name: string
  type: 'Manga' | 'Radar' | 'Puerta' | 'Vehículo'
  zone: string
  status: ResourceStatus
  lastInspection?: string
}

export interface IncidentDraft {
  title: string
  type: string
  severity: IncidentSeverity
  description: string
  resourceId: number
  flightId?: number
}

export interface Incident extends IncidentDraft {
  id: number
  status: 'Abierta' | 'En atención' | 'Cerrada'
  reportedAt: string
  resourceCode: string
}
