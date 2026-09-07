export interface ManifestPassenger {
  id: number
  name: string
  seat: string
  boardingStatus: 'Emitido' | 'Check-in' | 'Embarcado' | 'No-show' | 'Cancelado'
  baggageKg: number
}

export interface FlightManifest {
  flightId: number
  aircraft: string
  crewMembers: number
  assignedResources: string[]
  openIncidents: number
  passengers: ManifestPassenger[]
}

export interface ManifestSummary {
  passengerCount: number
  checkedInCount: number
  baggageKg: number
  openIncidents: number
}

