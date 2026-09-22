import type { CrisisAnalytics } from '../types/analytics'
import type { FlightManifest, ManifestPassenger, ManifestSummary } from '../types/manifest'

type JsonRecord = Record<string, unknown>

function record(value: unknown): JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : {}
}

function rows(value: unknown): JsonRecord[] {
  const response = record(value)
  if (!Array.isArray(response.rows)) throw new Error('MS5 devolvió una respuesta sin filas válidas.')
  return response.rows.map(record)
}

function number(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function string(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function passenger(value: unknown): ManifestPassenger {
  const ticket = record(value)
  const person = record(ticket.persona)
  const baggage = Array.isArray(ticket.equipaje) ? ticket.equipaje : null
  const firstName = string(person.nombre || ticket.nombre)
  const lastName = string(person.apellido || ticket.apellido)

  return {
    id: number(ticket.id_persona ?? ticket.id_ticket),
    name: [firstName, lastName].filter(Boolean).join(' ') || `Persona #${ticket.id_persona ?? '—'}`,
    seat: string(ticket.asiento ?? ticket.asiento_codigo) || '—',
    boardingStatus: string(ticket.estado_boarding) || 'No disponible',
    baggageKg: baggage === null
      ? null
      : baggage.reduce<number>((total, item) => total + number(record(item).peso), 0),
  }
}

export function adaptManifest(value: unknown): FlightManifest {
  const response = record(value)
  if (!Array.isArray(response.pasajeros)) throw new Error('MS4 devolvió un manifiesto sin pasajeros válidos.')
  const flight = record(response.vuelo)
  const aircraft = record(flight.aeronave)
  const model = string(aircraft.modelo)
  const registration = string(aircraft.placa)
  const resources = Array.isArray(response.recursos_asignados) ? response.recursos_asignados : []

  return {
    flightId: number(response.vuelo_id),
    aircraft: [model, registration].filter(Boolean).join(' · ') || 'Aeronave no disponible',
    crewMembers: Array.isArray(response.tripulacion) ? response.tripulacion.length : 0,
    assignedResources: resources.map((item) => string(record(item).nombre) || string(item)).filter(Boolean),
    openIncidents: Array.isArray(response.incidencias_abiertas) ? response.incidencias_abiertas.length : 0,
    passengers: response.pasajeros.map(passenger),
    warnings: Array.isArray(response.warnings) ? response.warnings.filter((item): item is string => typeof item === 'string') : [],
  }
}

export function adaptManifestSummary(value: unknown, manifest: FlightManifest): ManifestSummary {
  const response = record(value)
  const passengersUnavailable = manifest.warnings.some((warning) => warning.startsWith('MS1/'))
  return {
    passengerCount: passengersUnavailable ? null : number(response.pasajeros_total),
    checkedInCount: passengersUnavailable
      ? null
      : manifest.passengers.filter(({ boardingStatus }) => ['Check-in', 'Embarcado'].includes(boardingStatus)).length,
    baggageKg: passengersUnavailable || manifest.passengers.some(({ baggageKg }) => baggageKg === null)
      ? null
      : number(response.equipaje_kg_total),
    openIncidents: number(response.incidencias_abiertas),
  }
}

export function adaptAnalytics(responses: unknown[]): CrisisAnalytics {
  if (responses.length !== 5) throw new Error('Faltan respuestas analíticas de MS5.')
  const [q1, q2, q3, q4, q5] = responses.map(rows)

  return {
    resourceFailures: q1.map((item) => ({
      resource: string(item.nombre_tecnico_locacion) || `Recurso #${item.recurso_id ?? '—'}`,
      failures: number(item.incidencias_total),
    })),
    averageDelay: q2.map((item) => ({
      flightType: string(item.grupo) === 'GLOBAL' ? 'Internacional' : `Internacional · ${string(item.categoria)}`,
      averageMinutes: number(item.retraso_promedio_min),
    })),
    fuelIncidents: q3.map((item) => ({
      airline: string(item.aerolinea) || 'Aerolínea sin nombre',
      incidents: number(item.incidencias_combustible),
    })),
    tuuaRevenue: q4.map((item) => ({
      category: string(item.categoria) || 'Sin categoría',
      amount: number(item.recaudacion_soles),
    })),
    peakDelays: q5.map((item) => ({
      period: [string(item.franja), string(item.tipo)].filter(Boolean).join(' · '),
      totalFlights: number(item.vuelos),
      delayedFlights: number(item.vuelos_retrasados),
      percentage: number(item.pct_retrasados),
    })),
  }
}
