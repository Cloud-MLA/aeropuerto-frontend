import { checkInMockTicket, createMockTicket, mockMigrationCategories } from '../mocks/tickets'
import type { MigrationCategory, Ticket, TicketDraft } from '../types/ticket'
import { request, USE_MOCKS } from './client'

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export async function listMigrationCategories(): Promise<MigrationCategory[]> {
  if (USE_MOCKS) {
    await delay(250)
    return mockMigrationCategories
  }
  return request<MigrationCategory[]>('/api/pasajeros/categorias-migratorias')
}

export async function issueTicket(draft: TicketDraft): Promise<Ticket> {
  if (USE_MOCKS) {
    await delay(650)
    return createMockTicket(draft)
  }
  return request<Ticket>('/api/pasajeros/tickets', {
    method: 'POST',
    body: JSON.stringify(draft),
  })
}

export async function checkInTicket(id: number): Promise<Ticket> {
  if (USE_MOCKS) {
    await delay(500)
    return checkInMockTicket(id)
  }
  return request<Ticket>(`/api/pasajeros/tickets/${id}/checkin`, { method: 'POST' })
}
