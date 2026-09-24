import { checkInMockTicket, createMockTicket, mockMigrationCategories } from '../mocks/tickets'
import type { MigrationCategory, Ticket, TicketDraft } from '../types/ticket'
import { request, shouldUseMocksFor } from './client'
import { createResourceCache } from './resourceCache'

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

async function loadMigrationCategories(): Promise<MigrationCategory[]> {
  if (shouldUseMocksFor('ms1')) {
    await delay(250)
    return mockMigrationCategories
  }
  const categories = await request<Array<{ id: number; nombre: string; tarifa: number }>>('/api/pasajeros/categorias-migratorias')
  return categories.map((category) => ({ id: category.id, name: category.nombre, description: `Categoría migratoria ${category.nombre}`, tuua: category.tarifa }))
}

const categoriesCache = createResourceCache(loadMigrationCategories, 60_000)

export const listMigrationCategories = categoriesCache.get
export const getCachedMigrationCategories = categoriesCache.peek

export async function issueTicket(draft: TicketDraft): Promise<Ticket> {
  if (shouldUseMocksFor('ms1')) {
    await delay(650)
    return createMockTicket(draft)
  }
  const documentType = draft.documentType === 'CE' ? 'Carnet de Extranjeria' : draft.documentType
  const search = new URLSearchParams({ tipo_documento: documentType, numero_documento: draft.documentNumber })
  const matches = await request<Array<{ id_persona: number }>>(`/api/pasajeros/pasajeros?${search}`)
  const passenger = matches[0] ?? await request<{ id_persona: number }>('/api/pasajeros/pasajeros', {
    method: 'POST',
    body: JSON.stringify({
      nombre: draft.firstName,
      apellido: draft.lastName,
      fecha_nacimiento: draft.birthDate,
      tipo_documento: documentType,
      numero_documento: draft.documentNumber,
      id_categoria: draft.categoryId,
    }),
  })
  const issued = await request<{ id_ticket: number; fecha_emision: string; estado_boarding: Ticket['status'] }>('/api/pasajeros/tickets', {
    method: 'POST',
    body: JSON.stringify({ precio: draft.tuua, fecha_emision: new Date().toISOString().slice(0, 10), id_vuelo: draft.flightId, id_persona: passenger.id_persona }),
  })
  return {
    id: issued.id_ticket,
    passengerName: `${draft.firstName} ${draft.lastName}`,
    documentType: draft.documentType,
    documentNumber: draft.documentNumber,
    flightId: draft.flightId,
    flightNumber: draft.flightNumber,
    category: draft.categoryName,
    tuua: draft.tuua,
    status: issued.estado_boarding,
    issuedAt: issued.fecha_emision,
  }
}

export async function checkInTicket(ticket: Ticket): Promise<Ticket> {
  if (shouldUseMocksFor('ms1')) {
    await delay(500)
    return checkInMockTicket(ticket.id)
  }
  const result = await request<{ fecha_hora: string }>(`/api/pasajeros/tickets/${ticket.id}/checkin`, {
    method: 'POST',
    body: JSON.stringify({ counter: 'WEB', con_equipaje: false }),
  })
  return { ...ticket, status: 'Check-in', checkInAt: result.fecha_hora }
}
