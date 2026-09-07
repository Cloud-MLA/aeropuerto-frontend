import { useEffect, useMemo, useState } from 'react'
import { getFlight, listFlights } from '../api/flights'
import { getManifest, getManifestSummary } from '../api/manifests'
import { ManifestPanel } from '../components/ManifestPanel'
import { StatePanel } from '../components/StatePanel'
import { StatusBadge } from '../components/StatusBadge'
import type { Flight } from '../types/flight'
import type { FlightManifest, ManifestSummary } from '../types/manifest'

export function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [selected, setSelected] = useState<Flight | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [manifestLoading, setManifestLoading] = useState(false)
  const [error, setError] = useState('')
  const [manifest, setManifest] = useState<FlightManifest | null>(null)
  const [summary, setSummary] = useState<ManifestSummary | null>(null)

  useEffect(() => {
    listFlights()
      .then(setFlights)
      .catch((reason: unknown) =>
        setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los vuelos.'),
      )
      .finally(() => setLoading(false))
  }, [])

  const filteredFlights = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return flights
    return flights.filter((flight) =>
      [flight.number, flight.airline, flight.origin, flight.destination]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [flights, query])

  async function selectFlight(id: number) {
    setError('')
    setManifest(null)
    setSummary(null)
    try {
      setSelected(await getFlight(id))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo consultar el vuelo.')
    }
  }

  async function loadManifest() {
    if (!selected) return
    setError('')
    setManifestLoading(true)
    try {
      const [manifestResult, summaryResult] = await Promise.all([
        getManifest(selected.id),
        getManifestSummary(selected.id),
      ])
      setManifest(manifestResult)
      setSummary(summaryResult)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo consultar el manifiesto.')
    } finally {
      setManifestLoading(false)
    }
  }

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">Operación en tiempo real</span>
          <h1>Consulta de vuelos</h1>
          <p>Supervisa itinerarios, puertas y estado operativo desde un solo lugar.</p>
        </div>
        <div className="hero__metric">
          <span>Vuelos monitoreados</span>
          <strong>{flights.length.toString().padStart(2, '0')}</strong>
          <small>Actualización automática</small>
        </div>
      </section>

      <section className="workspace">
        <div className="toolbar">
          <div>
            <span className="eyebrow">Tablero de salidas y llegadas</span>
            <h2>Actividad programada</h2>
          </div>
          <label className="search">
            <span>Buscar vuelo</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Número, aerolínea o ciudad"
            />
          </label>
        </div>

        {loading && (
          <StatePanel eyebrow="Conectando" title="Consultando operaciones" message="Obteniendo los vuelos disponibles…" />
        )}
        {error && <StatePanel eyebrow="Atención" title="No se pudo completar la consulta" message={error} tone="error" />}
        {!loading && !error && filteredFlights.length === 0 && (
          <StatePanel eyebrow="Sin resultados" title="No encontramos coincidencias" message="Prueba con otro número de vuelo, aerolínea o ciudad." />
        )}

        {!loading && filteredFlights.length > 0 && (
          <div className="flight-grid">
            <div className="flight-list">
              {filteredFlights.map((flight) => (
                <button
                  className={`flight-card ${selected?.id === flight.id ? 'flight-card--active' : ''}`}
                  key={flight.id}
                  onClick={() => void selectFlight(flight.id)}
                >
                  <span className="flight-card__time">
                    {new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(
                      new Date(flight.scheduledAt),
                    )}
                  </span>
                  <span className="flight-card__route">
                    <strong>{flight.number}</strong>
                    <small>{flight.origin} → {flight.destination}</small>
                  </span>
                  <span className="flight-card__gate">Puerta {flight.gate}</span>
                  <StatusBadge status={flight.status} />
                </button>
              ))}
            </div>

            <aside className="detail-panel">
              {selected ? (
                <>
                  <span className="eyebrow">Detalle operativo</span>
                  <h2>{selected.number}</h2>
                  <p className="detail-panel__airline">{selected.airline}</p>
                  <div className="route-line">
                    <div><small>Origen</small><strong>{selected.origin}</strong></div>
                    <span>→</span>
                    <div><small>Destino</small><strong>{selected.destination}</strong></div>
                  </div>
                  <dl>
                    <div><dt>Puerta</dt><dd>{selected.gate}</dd></div>
                    <div><dt>Estado</dt><dd><StatusBadge status={selected.status} /></dd></div>
                  </dl>
                  <button className="primary-action" disabled={manifestLoading} onClick={() => void loadManifest()}>
                    {manifestLoading ? 'Consultando…' : 'Consultar manifiesto'}
                  </button>
                </>
              ) : (
                <StatePanel eyebrow="Detalle" title="Selecciona un vuelo" message="El detalle y el manifiesto aparecerán en este panel." />
              )}
            </aside>
          </div>
        )}
        {manifest && summary && (
          <ManifestPanel manifest={manifest} summary={summary} onClose={() => { setManifest(null); setSummary(null) }} />
        )}
      </section>
    </>
  )
}
