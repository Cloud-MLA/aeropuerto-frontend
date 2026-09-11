import { mockFlights } from '../mocks/flights'
import type { Flight } from '../types/flight'
import { request, USE_MOCKS } from './client'

interface Ms2Flight {
  id: number
  numero: string
  origen: string
  destino: string
  horaProgramada: string
  horaReal?: string | null
  estado: Flight['status']
  tipo: Flight['type']
  aerolineaRuc: string
  aeronavePlaca: string
}

interface Ms2Airline {
  ruc: string
  nombre: string
}

function toFlight(flight: Ms2Flight, airlines: Map<string, string>): Flight {
  return {
    id: flight.id,
    number: flight.numero,
    airline: airlines.get(flight.aerolineaRuc) ?? flight.aerolineaRuc,
    airlineId: flight.aerolineaRuc,
    origin: flight.origen,
    destination: flight.destino,
    scheduledAt: flight.horaProgramada,
    actualAt: flight.horaReal,
    gate: '—',
    status: flight.estado,
    type: flight.tipo,
    registration: flight.aeronavePlaca,
  }
}

async function getAirlineMap(): Promise<Map<string, string>> {
  try {
    const airlines = await request<Ms2Airline[]>('/api/vuelos/aerolineas')
    return new Map(airlines.map((airline) => [airline.ruc, airline.nombre]))
  } catch {
    return new Map()
  }
}

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export async function listFlights(): Promise<Flight[]> {
  if (USE_MOCKS) {
    await delay(450)
    return mockFlights
  }

  const [flights, airlines] = await Promise.all([
    request<Ms2Flight[]>('/api/vuelos'),
    getAirlineMap(),
  ])
  return flights.map((flight) => toFlight(flight, airlines))
}

export async function getFlight(id: number): Promise<Flight> {
  if (USE_MOCKS) {
    await delay(250)
    const flight = mockFlights.find((item) => item.id === id)
    if (!flight) throw new Error('No se encontró el vuelo seleccionado.')
    return flight
  }

  const [flight, airlines] = await Promise.all([
    request<Ms2Flight>(`/api/vuelos/${id}`),
    getAirlineMap(),
  ])
  return toFlight(flight, airlines)
}

export async function updateFlightStatus(id: number, status: Flight['status']): Promise<Flight> {
  if (USE_MOCKS) {
    await delay(350)
    const flight = mockFlights.find((item) => item.id === id)
    if (!flight) throw new Error('No se encontró el vuelo seleccionado.')
    flight.status = status
    flight.actualAt = status === 'Despegado' ? new Date().toISOString() : flight.actualAt
    return { ...flight }
  }

  const [flight, airlines] = await Promise.all([
    request<Ms2Flight>(`/api/vuelos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado: status }),
    }),
    getAirlineMap(),
  ])
  return toFlight(flight, airlines)
}

