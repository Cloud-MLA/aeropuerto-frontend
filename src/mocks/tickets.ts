import type { MigrationCategory, Ticket, TicketDraft } from '../types/ticket'
import { mockFlights } from './flights'

export const mockMigrationCategories: MigrationCategory[] = [
  { id: 1, name: 'Nacional', description: 'Vuelo dentro del territorio peruano', tuua: 12.4 },
  { id: 2, name: 'Internacional', description: 'Vuelo con destino fuera del Perú', tuua: 30.86 },
  { id: 3, name: 'Tránsito', description: 'Pasajero en conexión internacional', tuua: 15.43 },
]

const mockTickets: Ticket[] = []

export function createMockTicket(draft: TicketDraft): Ticket {
  const flight = mockFlights.find((item) => item.id === draft.flightId)
  const category = mockMigrationCategories.find((item) => item.id === draft.categoryId)
  if (!flight || !category) throw new Error('El vuelo o la categoría seleccionada ya no está disponible.')

  const ticket: Ticket = {
    id: 60001 + mockTickets.length,
    passengerName: draft.passengerName,
    documentType: draft.documentType,
    documentNumber: draft.documentNumber,
    flightId: flight.id,
    flightNumber: flight.number,
    category: category.name,
    tuua: category.tuua,
    status: 'Emitido',
    issuedAt: new Date().toISOString(),
  }
  mockTickets.push(ticket)
  return ticket
}

export function checkInMockTicket(id: number): Ticket {
  const ticket = mockTickets.find((item) => item.id === id)
  if (!ticket) throw new Error('No se encontró el ticket solicitado.')
  ticket.status = 'Check-in'
  ticket.checkInAt = new Date().toISOString()
  return { ...ticket }
}
