export type FlightStatus =
  | 'Programado'
  | 'Embarcando'
  | 'Despegado'
  | 'Aterrizado'
  | 'Retrasado'
  | 'Cancelado'

export interface Flight {
  id: number
  number: string
  airline: string
  origin: string
  destination: string
  scheduledAt: string
  actualAt?: string | null
  gate: string
  status: FlightStatus
  type?: 'Nacional' | 'Internacional'
  airlineId?: string
  aircraft?: string
  registration?: string
}
