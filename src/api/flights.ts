import { mockFlights } from '../mocks/flights'
import type { Flight } from '../types/flight'
import { request, USE_MOCKS } from './client'

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export async function listFlights(): Promise<Flight[]> {
  if (USE_MOCKS) {
    await delay(450)
    return mockFlights
  }

  return request<Flight[]>('/api/vuelos/vuelos')
}

export async function getFlight(id: number): Promise<Flight> {
  if (USE_MOCKS) {
    await delay(250)
    const flight = mockFlights.find((item) => item.id === id)
    if (!flight) throw new Error('No se encontró el vuelo seleccionado.')
    return flight
  }

  return request<Flight>(`/api/vuelos/vuelos/${id}`)
}

