export interface ManifestPassenger {
  id: number
  name: string
  seat: string
  boardingStatus: string
  baggageKg: number | null
}

export interface FlightManifest {
  flightId: number
  aircraft: string
  crewMembers: number
  assignedResources: string[]
  openIncidents: number
  passengers: ManifestPassenger[]
  warnings: string[]
}

export interface ManifestSummary {
  passengerCount: number | null
  checkedInCount: number | null
  baggageKg: number | null
  openIncidents: number
}

