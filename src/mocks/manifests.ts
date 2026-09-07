import type { FlightManifest, ManifestSummary } from '../types/manifest'

export const mockManifests: Record<number, FlightManifest> = {
  1841: {
    flightId: 1841,
    aircraft: 'Airbus A320neo · OB-2187',
    crewMembers: 6,
    assignedResources: ['Manga B12', 'Radar L-03'],
    openIncidents: 0,
    passengers: [
      { id: 100214, name: 'María Torres', seat: '12A', boardingStatus: 'Embarcado', baggageKg: 18.4 },
      { id: 100372, name: 'Luis Mendoza', seat: '12B', boardingStatus: 'Check-in', baggageKg: 12.1 },
      { id: 100481, name: 'Camila Rojas', seat: '14F', boardingStatus: 'Emitido', baggageKg: 0 },
    ],
  },
  1842: {
    flightId: 1842,
    aircraft: 'Airbus A320 · OB-2240',
    crewMembers: 5,
    assignedResources: ['Manga A04'],
    openIncidents: 0,
    passengers: [
      { id: 100512, name: 'Diego Chávez', seat: '08C', boardingStatus: 'Check-in', baggageKg: 21.3 },
      { id: 100620, name: 'Ana Salazar', seat: '09D', boardingStatus: 'Emitido', baggageKg: 15.8 },
    ],
  },
  1843: {
    flightId: 1843,
    aircraft: 'Boeing 787-8 · N784AV',
    crewMembers: 9,
    assignedResources: ['Manga C08', 'Radar S-01'],
    openIncidents: 2,
    passengers: [
      { id: 100701, name: 'Sofía Vargas', seat: '22A', boardingStatus: 'Check-in', baggageKg: 23.0 },
      { id: 100804, name: 'Jorge Paredes', seat: '24C', boardingStatus: 'No-show', baggageKg: 0 },
    ],
  },
}

export function summarizeManifest(manifest: FlightManifest): ManifestSummary {
  return {
    passengerCount: manifest.passengers.length,
    checkedInCount: manifest.passengers.filter(({ boardingStatus }) =>
      ['Check-in', 'Embarcado'].includes(boardingStatus),
    ).length,
    baggageKg: manifest.passengers.reduce((total, passenger) => total + passenger.baggageKg, 0),
    openIncidents: manifest.openIncidents,
  }
}

