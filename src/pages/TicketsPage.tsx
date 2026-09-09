import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { listFlights } from '../api/flights'
import { checkInTicket, issueTicket, listMigrationCategories } from '../api/tickets'
import { StatePanel } from '../components/StatePanel'
import type { Flight } from '../types/flight'
import type { MigrationCategory, Ticket } from '../types/ticket'

export function TicketsPage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [categories, setCategories] = useState<MigrationCategory[]>([])
  const [passengerName, setPassengerName] = useState('')
  const [documentType, setDocumentType] = useState('DNI')
  const [documentNumber, setDocumentNumber] = useState('')
  const [flightId, setFlightId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listFlights(), listMigrationCategories()])
      .then(([flightResult, categoryResult]) => {
        setFlights(flightResult.filter((flight) => flight.status !== 'Cancelado'))
        setCategories(categoryResult)
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los datos de emisión.'))
      .finally(() => setLoading(false))
  }, [])

  const selectedFlight = useMemo(() => flights.find((flight) => flight.id === Number(flightId)), [flightId, flights])
  const selectedCategory = useMemo(() => categories.find((category) => category.id === Number(categoryId)), [categories, categoryId])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await issueTicket({ passengerName: passengerName.trim(), documentType, documentNumber: documentNumber.trim(), flightId: Number(flightId), categoryId: Number(categoryId) })
      setTicket(result)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible emitir el ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  async function performCheckIn() {
    if (!ticket) return
    setError('')
    setCheckingIn(true)
    try { setTicket(await checkInTicket(ticket.id)) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible completar el check-in.') }
    finally { setCheckingIn(false) }
  }

  function reset() {
    setPassengerName('')
    setDocumentNumber('')
    setFlightId('')
    setCategoryId('')
    setTicket(null)
    setError('')
  }

  return (
    <section className="ticket-page">
      <div className="section-hero">
        <span className="eyebrow">Pasajeros</span>
        <h1>Tickets y check-in</h1>
        <p>Emite un ticket, valida el vuelo seleccionado y completa el registro de embarque del pasajero.</p>
        <div className="hero-process"><span className="is-active">1</span> Datos del pasajero <i /> <span>2</span> Emisión <i /> <span>3</span> Check-in</div>
      </div>

      <div className="ticket-workspace">
        {error && <StatePanel eyebrow="Atención" title="No se pudo completar la operación" message={error} tone="error" />}
        {loading ? <StatePanel eyebrow="Conectando" title="Preparando la emisión" message="Consultando vuelos y categorías migratorias…" /> : (
          <div className="ticket-layout">
            <form className="ticket-form-card" onSubmit={(event) => void submit(event)}>
              <header><div><span className="eyebrow">Nueva emisión</span><h2>Información del pasajero</h2></div><span className="secure-label">● Validación segura</span></header>
              <div className="form-grid">
                <label className="field field--wide"><span>Nombre completo</span><input required value={passengerName} onChange={(event) => setPassengerName(event.target.value)} placeholder="Ej. Valeria Mendoza Ruiz" /></label>
                <label className="field"><span>Tipo de documento</span><select value={documentType} onChange={(event) => setDocumentType(event.target.value)}><option>DNI</option><option>Pasaporte</option><option>CE</option></select></label>
                <label className="field"><span>Número de documento</span><input required minLength={6} value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} placeholder="Documento del pasajero" /></label>
                <label className="field field--wide"><span>Vuelo disponible</span><select required value={flightId} onChange={(event) => setFlightId(event.target.value)}><option value="">Selecciona un vuelo</option>{flights.map((flight) => <option key={flight.id} value={flight.id}>{flight.number} · {flight.origin} → {flight.destination} · {flight.gate}</option>)}</select></label>
                <label className="field field--wide"><span>Categoría migratoria</span><select required value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Selecciona una categoría</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name} · TUUA US$ {category.tuua.toFixed(2)}</option>)}</select></label>
              </div>
              <div className="form-summary"><div><span>Vuelo</span><strong>{selectedFlight?.number ?? 'Por seleccionar'}</strong><small>{selectedFlight ? `${selectedFlight.origin} → ${selectedFlight.destination}` : 'Selecciona una operación disponible'}</small></div><div><span>Categoría</span><strong>{selectedCategory?.name ?? 'Por seleccionar'}</strong><small>{selectedCategory?.description ?? 'Define la condición migratoria'}</small></div><div><span>Tasa TUUA</span><strong>{selectedCategory ? `US$ ${selectedCategory.tuua.toFixed(2)}` : '—'}</strong><small>Calculada según categoría</small></div></div>
              <div className="form-actions"><button type="button" className="secondary-action" onClick={reset}>Limpiar</button><button className="primary-action" disabled={submitting}>{submitting ? 'Emitiendo…' : 'Emitir ticket →'}</button></div>
            </form>

            <aside className="boarding-card">
              <div className="boarding-card__top"><span>Centro de operaciones</span><strong>{ticket?.flightNumber ?? 'BOARDING PASS'}</strong><small>{ticket ? `Ticket #${ticket.id}` : 'Completa el formulario para emitir'}</small></div>
              {ticket ? <>
                <div className="boarding-passenger"><span>Pasajero</span><h2>{ticket.passengerName}</h2><small>{ticket.documentType} · {ticket.documentNumber}</small></div>
                <dl className="boarding-facts"><div><dt>Vuelo</dt><dd>{ticket.flightNumber}</dd></div><div><dt>Categoría</dt><dd>{ticket.category}</dd></div><div><dt>TUUA</dt><dd>US$ {ticket.tuua.toFixed(2)}</dd></div><div><dt>Estado</dt><dd><span className={`ticket-status ${ticket.status === 'Check-in' ? 'ticket-status--done' : ''}`}>{ticket.status}</span></dd></div></dl>
                <div className="barcode" aria-label="Código de ticket" />
                <button className="primary-action" type="button" disabled={checkingIn || ticket.status === 'Check-in'} onClick={() => void performCheckIn()}>{ticket.status === 'Check-in' ? '✓ Check-in completado' : checkingIn ? 'Registrando…' : 'Completar check-in'}</button>
              </> : <div className="boarding-empty"><span>✈</span><p>El ticket emitido aparecerá aquí listo para realizar el check-in.</p></div>}
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}
