import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { createIncident, listIncidents, listResources, updateResourceStatus } from '../api/infrastructure'
import { StatePanel } from '../components/StatePanel'
import type { AirportResource, Incident, IncidentSeverity, ResourceStatus } from '../types/infrastructure'

const statuses: Array<'Todos' | ResourceStatus> = ['Todos', 'Libre', 'Ocupado', 'Mantenimiento', 'Fuera de servicio']
const statusClass = (status: ResourceStatus) => status.toLowerCase().replaceAll(' ', '-')

export function InfrastructurePage() {
  const [resources, setResources] = useState<AirportResource[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [filter, setFilter] = useState<(typeof statuses)[number]>('Todos')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState('Falla_Operativa')
  const [severity, setSeverity] = useState<IncidentSeverity>('Media')
  const [description, setDescription] = useState('')
  const [flightId, setFlightId] = useState('')

  useEffect(() => {
    Promise.all([listResources(), listIncidents()])
      .then(([resourceResult, incidentResult]) => {
        setResources(resourceResult)
        setIncidents(incidentResult)
        setSelectedId(resourceResult[0]?.id ?? null)
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No se pudo consultar la infraestructura.'))
      .finally(() => setLoading(false))
  }, [])

  const visibleResources = useMemo(() => resources.filter((resource) => filter === 'Todos' || resource.status === filter), [filter, resources])
  const selected = resources.find((resource) => resource.id === selectedId) ?? null
  const metrics = useMemo(() => ({
    total: resources.length,
    free: resources.filter((item) => item.status === 'Libre').length,
    attention: resources.filter((item) => ['Mantenimiento', 'Fuera de servicio'].includes(item.status)).length,
    open: incidents.filter((item) => item.status !== 'Cerrada').length,
  }), [incidents, resources])

  async function changeStatus(status: ResourceStatus) {
    if (!selected) return
    setSaving(true); setError(''); setNotice('')
    try {
      const updated = await updateResourceStatus(selected.id, status)
      setResources((items) => items.map((item) => item.id === updated.id ? updated : item))
      setNotice(`${updated.code} cambió a ${updated.status}.`)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible actualizar el recurso.') }
    finally { setSaving(false) }
  }

  async function submitIncident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    setSaving(true); setError(''); setNotice('')
    try {
      const created = await createIncident({ title: title.trim(), type, severity, description: description.trim(), resourceId: selected.id, flightId: flightId ? Number(flightId) : undefined })
      setIncidents((items) => [created, ...items])
      setResources((items) => items.map((item) => item.id === selected.id ? { ...item, status: 'Fuera de servicio' } : item))
      setTitle(''); setDescription(''); setFlightId('')
      setNotice(`Incidencia #${created.id} registrada correctamente.`)
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible registrar la incidencia.') }
    finally { setSaving(false) }
  }

  return (
    <section className="infra-page">
      <div className="section-hero infra-hero"><span className="eyebrow">Infraestructura aeroportuaria</span><h1>Recursos e incidencias</h1><p>Supervisa la disponibilidad operativa y registra eventos que requieren atención inmediata.</p></div>
      <div className="infra-workspace">
        <div className="infra-metrics"><article><span>Recursos</span><strong>{metrics.total}</strong><small>Inventario monitoreado</small></article><article><span>Disponibles</span><strong>{metrics.free}</strong><small>Listos para asignación</small></article><article className="is-warning"><span>Requieren atención</span><strong>{metrics.attention}</strong><small>Mantenimiento o falla</small></article><article className="is-alert"><span>Incidencias abiertas</span><strong>{metrics.open}</strong><small>Seguimiento activo</small></article></div>
        {error && <StatePanel eyebrow="Atención" title="No se pudo completar la operación" message={error} tone="error" />}
        {notice && <div className="success-notice">✓ {notice}</div>}
        {loading ? <StatePanel eyebrow="Conectando" title="Consultando infraestructura" message="Obteniendo recursos e incidencias…" /> : <>
          <div className="infra-toolbar"><div><span className="eyebrow">Control operativo</span><h2>Inventario de recursos</h2></div><label><span>Filtrar por estado</span><select value={filter} onChange={(event) => setFilter(event.target.value as (typeof statuses)[number])}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label></div>
          <div className="infra-layout">
            <div className="resource-card"><div className="resource-table-wrap"><table><thead><tr><th>Código</th><th>Recurso</th><th>Zona</th><th>Estado</th></tr></thead><tbody>{visibleResources.map((resource) => <tr key={resource.id} className={resource.id === selectedId ? 'is-selected' : ''} onClick={() => setSelectedId(resource.id)}><td><strong>{resource.code}</strong></td><td>{resource.name}<small>{resource.type}</small></td><td>{resource.zone}</td><td><span className={`resource-status resource-status--${statusClass(resource.status)}`}>{resource.status}</span></td></tr>)}</tbody></table></div>{visibleResources.length === 0 && <StatePanel eyebrow="Sin resultados" title="No hay recursos" message="Cambia el filtro para consultar otro estado." />}</div>
            <aside className="resource-detail">{selected ? <><div className="resource-detail__heading"><div><span>{selected.type}</span><h2>{selected.code}</h2></div><span className={`resource-status resource-status--${statusClass(selected.status)}`}>{selected.status}</span></div><h3>{selected.name}</h3><dl><div><dt>Zona</dt><dd>{selected.zone}</dd></div><div><dt>Última inspección</dt><dd>{new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(selected.lastInspection))}</dd></div></dl><label className="field"><span>Cambiar estado operativo</span><select disabled={saving} value={selected.status} onChange={(event) => void changeStatus(event.target.value as ResourceStatus)}>{statuses.slice(1).map((status) => <option key={status}>{status}</option>)}</select></label><form className="incident-form" onSubmit={(event) => void submitIncident(event)}><div><span className="eyebrow">Nueva incidencia</span><h3>Registrar evento</h3></div><label className="field"><span>Título</span><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Descripción breve" /></label><div className="incident-form__row"><label className="field"><span>Tipo</span><select value={type} onChange={(event) => setType(event.target.value)}><option>Falla_Operativa</option><option>Falla_Radar</option><option>Falla_Manga</option><option>Seguridad</option></select></label><label className="field"><span>Severidad</span><select value={severity} onChange={(event) => setSeverity(event.target.value as IncidentSeverity)}><option>Baja</option><option>Media</option><option>Alta</option><option>Crítica</option></select></label></div><label className="field"><span>Vuelo relacionado (opcional)</span><input inputMode="numeric" value={flightId} onChange={(event) => setFlightId(event.target.value)} placeholder="Ej. 1841" /></label><label className="field"><span>Detalle</span><textarea required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe el evento observado" /></label><button className="primary-action" disabled={saving}>{saving ? 'Registrando…' : 'Registrar incidencia →'}</button></form></> : <StatePanel eyebrow="Detalle" title="Selecciona un recurso" message="Consulta o actualiza su estado operativo." />}</aside>
          </div>
          <section className="incident-history"><header><div><span className="eyebrow">Seguimiento</span><h2>Incidencias recientes</h2></div><span>{incidents.length} registros</span></header><div className="incident-list">{incidents.map((incident) => <article key={incident.id}><span className={`severity severity--${incident.severity.toLowerCase().replace('í', 'i')}`}>{incident.severity}</span><div><strong>#{incident.id} · {incident.title}</strong><small>{incident.resourceCode}{incident.flightId ? ` · Vuelo ${incident.flightId}` : ''}</small></div><p>{incident.description}</p><time>{new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(incident.reportedAt))}</time></article>)}</div></section>
        </>}
      </div>
    </section>
  )
}
