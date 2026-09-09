import type { CrisisAnalytics } from '../types/analytics'

export const mockCrisisAnalytics: CrisisAnalytics = {
  resourceFailures: [
    { resource: 'Radar RDR-02', failures: 14 },
    { resource: 'Manga MGA-04', failures: 11 },
    { resource: 'Radar RDR-03', failures: 8 },
    { resource: 'Remolcador VEH-17', failures: 5 },
    { resource: 'Puerta PUE-B12', failures: 3 },
  ],
  averageDelay: [
    { flightType: 'Internacional', averageMinutes: 38.6 },
    { flightType: 'Nacional', averageMinutes: 21.4 },
    { flightType: 'Carga', averageMinutes: 29.8 },
  ],
  fuelIncidents: [
    { airline: 'LATAM Airlines', incidents: 18 },
    { airline: 'JetSMART', incidents: 13 },
    { airline: 'Avianca', incidents: 9 },
    { airline: 'Sky Airline', incidents: 7 },
    { airline: 'Iberia', incidents: 4 },
  ],
  tuuaRevenue: [
    { category: 'Internacional', amount: 684320 },
    { category: 'Nacional', amount: 412840 },
    { category: 'Tránsito', amount: 97650 },
  ],
  peakDelays: [
    { period: '06:00–09:00', totalFlights: 126, delayedFlights: 31, percentage: 24.6 },
    { period: '18:00–21:00', totalFlights: 148, delayedFlights: 44, percentage: 29.7 },
  ],
}
