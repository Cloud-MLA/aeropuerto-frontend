export interface MigrationCategory {
  id: number
  name: string
  description: string
  tuua: number
}

export interface TicketDraft {
  passengerName: string
  documentType: string
  documentNumber: string
  flightId: number
  categoryId: number
}

export interface Ticket {
  id: number
  passengerName: string
  documentType: string
  documentNumber: string
  flightId: number
  flightNumber: string
  category: string
  tuua: number
  status: 'Emitido' | 'Check-in'
  issuedAt: string
  checkInAt?: string
}
