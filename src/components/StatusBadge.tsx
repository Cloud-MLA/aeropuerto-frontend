import type { FlightStatus } from '../types/flight'

export function StatusBadge({ status }: { status: FlightStatus }) {
  return <span className={`status status--${status.toLowerCase()}`}>{status}</span>
}

