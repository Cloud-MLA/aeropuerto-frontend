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
  gate: string
  status: FlightStatus
}

