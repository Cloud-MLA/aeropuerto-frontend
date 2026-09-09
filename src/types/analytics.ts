export interface ResourceFailureMetric { resource: string; failures: number }
export interface AverageDelayMetric { flightType: string; averageMinutes: number }
export interface AirlineFuelIncidentMetric { airline: string; incidents: number }
export interface TuuaRevenueMetric { category: string; amount: number }
export interface PeakDelayMetric { period: string; totalFlights: number; delayedFlights: number; percentage: number }

export interface CrisisAnalytics {
  resourceFailures: ResourceFailureMetric[]
  averageDelay: AverageDelayMetric[]
  fuelIncidents: AirlineFuelIncidentMetric[]
  tuuaRevenue: TuuaRevenueMetric[]
  peakDelays: PeakDelayMetric[]
}
