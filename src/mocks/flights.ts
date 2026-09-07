import type { Flight } from '../types/flight'

export const mockFlights: Flight[] = [
  {
    id: 1841,
    number: 'LA 2113',
    airline: 'LATAM Airlines',
    origin: 'Lima',
    destination: 'Cusco',
    scheduledAt: '2026-09-07T14:20:00-05:00',
    gate: 'B12',
    status: 'Embarcando',
  },
  {
    id: 1842,
    number: 'JA 7720',
    airline: 'JetSMART',
    origin: 'Lima',
    destination: 'Arequipa',
    scheduledAt: '2026-09-07T15:05:00-05:00',
    gate: 'A04',
    status: 'Programado',
  },
  {
    id: 1843,
    number: 'AV 074',
    airline: 'Avianca',
    origin: 'Bogotá',
    destination: 'Lima',
    scheduledAt: '2026-09-07T15:40:00-05:00',
    gate: 'C08',
    status: 'Retrasado',
  },
]

