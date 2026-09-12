import { useEffect, useMemo, useState } from 'react'
import { getFlight, listFlights, updateFlightStatus } from '../api/flights'
import { getManifest, getManifestSummary } from '../api/manifests'
import { ManifestPanel } from '../components/ManifestPanel'
import { StatePanel } from '../components/StatePanel'
import { StatusBadge } from '../components/StatusBadge'
import type { Flight } from '../types/flight'
import type { FlightStatus } from '../types/flight'
import type { FlightManifest, ManifestSummary } from '../types/manifest'

const statuses = ['Todos', 'Programado', 'Embarcando', 'Despegado', 'Aterrizado', 'Retrasado', 'Cancelado']
const transitions: Record<FlightStatus, FlightStatus[]> = {
  Programado: ['Embarcando', 'Retrasado', 'Cancelado'],
  Embarcando: ['Despegado', 'Retrasado', 'Cancelado'],
  Retrasado: ['Embarcando', 'Despegado', 'Cancelado'],
  Despegado: ['Aterrizado'],
  Aterrizado: [],
  Cancelado: [],
}

export function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [selected, setSelected] = useState<Flight | null>(null)
  const [query, setQuery] = useState('')
  const [airline, setAirline] = useState('Todas')
  const [status, setStatus] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [manifestLoading, setManifestLoading] = useState(false)
  const [error, setError] = useState('')
  const [manifest, setManifest] = useState<FlightManifest | null>(null)
  const [summary, setSummary] = useState<ManifestSummary | null>(null)
  const [manifestError, setManifestError] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)

  useEffect(() => {
    listFlights()
      .then(setFlights)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los vuelos.'))
      .finally(() => setLoading(false))
  }, [])

  const airlines = useMemo(() => ['Todas', ...new Set(flights.map((flight) => flight.airline))], [flights])
  const metrics = useMemo(() => ({
    total: flights.length,
    onTime: flights.filter((flight) => !['Retrasado', 'Cancelado'].includes(flight.status)).length,
    delayed: flights.filter((flight) => flight.status === 'Retrasado').length,
    cancelled: flights.filter((flight) => flight.status === 'Cancelado').length,
  }), [flights])
  const filteredFlights = useMemo(() => {
    const term = query.trim().toLowerCase()
    return flights.filter((flight) => {
      const matchesQuery = [flight.number, flight.airline, flight.origin, flight.destination].join(' ').toLowerCase().includes(term)
      return matchesQuery && (airline === 'Todas' || flight.airline === airline) && (status === 'Todos' || flight.status === status)
    })
  }, [flights, query, airline, status])

  async function selectFlight(id: number) {
    setError('')
    setManifestError('')
    setManifest(null)
    setSummary(null)
    try { setSelected(await getFlight(id)) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo consultar el vuelo.') }
  }

  async function loadManifest() {
    if (!selected) return
    setManifestError('')
    setManifestLoading(true)
    try {
      const [manifestResult, summaryResult] = await Promise.all([getManifest(selected.id), getManifestSummary(selected.id)])
      setManifest(manifestResult)
      setSummary(summaryResult)
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'No se pudo consultar el manifiesto.'
      setManifestError(message.includes('No existe')
        ? 'El manifiesto de este vuelo estará disponible cuando se integre el microservicio MS4.'
        : message)
    } finally { setManifestLoading(false) }
  }

  async function changeFlightStatus(nextStatus: FlightStatus) {
    if (!selected || nextStatus === selected.status) return
    setError('')
    setSavingStatus(true)
    try {
      const updated = await updateFlightStatus(selected.id, nextStatus)
      setSelected(updated)
      setFlights((items) => items.map((item) => item.id === updated.id ? updated : item))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo actualizar el estado del vuelo.')
    } finally {
      setSavingStatus(false)
    }
  }

  function clearFilters() {
    setQuery('')
    setAirline('Todas')
    setStatus('Todos')
  }

  return (
    <section className="operations-page">
      <div className="operations-hero">
        <span className="eyebrow">Operaciones</span>
        <h1>Vuelos en tiempo real</h1>
        <p>Supervisa salidas, llegadas y el estado operativo de los vuelos del Aeropuerto Internacional Jorge Chávez.</p>
        <div className="weather-card"><strong>Lima, PE</strong><span>☁ 18°C</span><small>Nublado</small></div>
      </div>

      <div className="operations-content">
        <div className="metrics-grid">
          <article><span className="metric-icon metric-icon--blue">✈</span><div><strong>{metrics.total}</strong><span>Vuelos hoy</span><small>↑ 12% vs. ayer</small></div></article>
          <article><span className="metric-icon metric-icon--green">✓</span><div><strong>{metrics.onTime}</strong><span>En horario</span><small>Operación estable</small></div></article>
          <article><span className="metric-icon metric-icon--amber">◷</span><div><strong>{metrics.delayed}</strong><span>Con retraso</span><small>Requieren atención</small></div></article>
          <article><span className="metric-icon metric-icon--red">×</span><div><strong>{metrics.cancelled}</strong><span>Cancelados</span><small>Durante el día</small></div></article>
        </div>

        <div className="filters-bar">
          <label className="search search--wide"><span>⌕</span><input aria-label="Buscar vuelo" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por número de vuelo, aerolínea, origen o destino…" /></label>
          <label><span>Aerolínea</span><select value={airline} onChange={(event) => setAirline(event.target.value)}>{airlines.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label><span>Estado</span><select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
          <button className="clear-action" onClick={clearFilters}>Limpiar</button>
        </div>

        {error && <StatePanel eyebrow="Atención" title="No se pudo completar la consulta" message={error} tone="error" />}
        {loading && <StatePanel eyebrow="Conectando" title="Consultando operaciones" message="Obteniendo los vuelos disponibles…" />}

        {!loading && !error && (
          <div className="operations-grid">
            <div className="flight-table-card">
              <div className="flight-table-wrap">
                <table className="flight-table">
                  <thead><tr><th>Hora</th><th>Vuelo</th><th>Aerolínea</th><th>Origen</th><th>Destino</th><th>Puerta</th><th>Estado</th><th aria-label="Acciones" /></tr></thead>
                  <tbody>{filteredFlights.map((flight) => (
                    <tr key={flight.id} className={selected?.id === flight.id ? 'is-selected' : ''} onClick={() => void selectFlight(flight.id)}>
                      <td><strong>{new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(new Date(flight.scheduledAt))}</strong></td>
                      <td><strong>{flight.number}</strong></td><td>{flight.airline}</td><td>{flight.origin}</td><td>{flight.destination}</td><td>{flight.gate}</td>
                      <td><StatusBadge status={flight.status} /></td><td><button className="view-action" aria-label={`Ver ${flight.number}`}>◉</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              {filteredFlights.length === 0 && <StatePanel eyebrow="Sin resultados" title="No encontramos vuelos" message="Prueba limpiando o modificando los filtros." />}
              <footer className="table-footer"><span>Mostrando {filteredFlights.length} de {flights.length} vuelos</span><div><button disabled>‹</button><button className="active">1</button><button disabled>›</button></div></footer>
            </div>

            <aside className="flight-drawer">
              {selected ? <>
                <div className="drawer-heading"><span>Detalle del vuelo</span><button className="icon-action" aria-label="Cerrar detalle" onClick={() => setSelected(null)}>×</button></div>
                <div className="drawer-flight"><h2>{selected.number}</h2><span>{selected.airline}</span><StatusBadge status={selected.status} /></div>
                <div className="drawer-route"><div><strong>{selected.origin}</strong><small>Origen</small></div><span>✈</span><div><strong>{selected.destination}</strong><small>Destino</small></div></div>
                <dl className="flight-facts"><div><dt>Hora programada</dt><dd>{new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(new Date(selected.scheduledAt))}</dd></div><div><dt>Hora real</dt><dd>{selected.actualAt ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(selected.actualAt)) : 'Pendiente'}</dd></div><div><dt>Tipo</dt><dd>{selected.type ?? '—'}</dd></div><div><dt>Matrícula</dt><dd>{selected.registration ?? '—'}</dd></div></dl>
                <label className="field flight-status-field"><span>Actualizar estado operativo</span><select disabled={savingStatus || transitions[selected.status].length === 0} value={selected.status} onChange={(event) => void changeFlightStatus(event.target.value as FlightStatus)}><option value={selected.status}>{selected.status}</option>{transitions[selected.status].map((nextStatus) => <option key={nextStatus} value={nextStatus}>{nextStatus}</option>)}</select><small>{transitions[selected.status].length === 0 ? 'Este vuelo se encuentra en un estado final.' : 'Solo se muestran transiciones permitidas por MS2.'}</small></label>
                <div className="drawer-tabs"><button className="active">Resumen</button><button>Pasajeros</button><button>Recursos</button></div>
                <div className={`drawer-note ${manifestError ? 'drawer-note--error' : ''}`}><strong>{manifestError ? 'Manifiesto no disponible' : 'Información operativa'}</strong><p>{manifestError || 'Consulta pasajeros, equipaje, tripulación, recursos e incidencias asociadas.'}</p></div>
                <button className="primary-action" disabled={manifestLoading} onClick={() => void loadManifest()}>{manifestLoading ? 'Consultando…' : '▣  Ver manifiesto  →'}</button>
              </> : <StatePanel eyebrow="Detalle" title="Selecciona un vuelo" message="Consulta la información operativa desde la tabla." />}
            </aside>
          </div>
        )}
      </div>
      {manifest && summary && <div className="manifest-overlay"><ManifestPanel manifest={manifest} summary={summary} onClose={() => { setManifest(null); setSummary(null) }} /></div>}
    </section>
  )
}
