import { type CSSProperties, useEffect, useMemo, useState } from 'react'
import { getCrisisAnalytics } from '../api/analytics'
import { StatePanel } from '../components/StatePanel'
import type { CrisisAnalytics } from '../types/analytics'

const money = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function HorizontalBars({ items, value, label }: { items: Array<{ name: string; amount: number }>; value: (amount: number) => string; label: string }) {
  const maximum = Math.max(...items.map((item) => item.amount), 1)
  return <div className="horizontal-bars" aria-label={label}>{items.map((item) => <div key={item.name}><header><span>{item.name}</span><strong>{value(item.amount)}</strong></header><div><i style={{ width: `${(item.amount / maximum) * 100}%` }} /></div></div>)}</div>
}

export function DashboardPage() {
  const [analytics, setAnalytics] = useState<CrisisAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(new Date())

  async function load() {
    setLoading(true); setError('')
    try { setAnalytics(await getCrisisAnalytics()); setUpdatedAt(new Date()) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudieron obtener los indicadores analíticos.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    getCrisisAnalytics()
      .then((result) => { setAnalytics(result); setUpdatedAt(new Date()) })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No se pudieron obtener los indicadores analíticos.'))
      .finally(() => setLoading(false))
  }, [])

  const summary = useMemo(() => {
    if (!analytics) return null
    const failures = analytics.resourceFailures.reduce((sum, item) => sum + item.failures, 0)
    const delay = analytics.averageDelay.find((item) => item.flightType === 'Internacional')?.averageMinutes ?? 0
    const fuel = analytics.fuelIncidents.reduce((sum, item) => sum + item.incidents, 0)
    const revenue = analytics.tuuaRevenue.reduce((sum, item) => sum + item.amount, 0)
    const peak = Math.max(...analytics.peakDelays.map((item) => item.percentage))
    return { failures, delay, fuel, revenue, peak }
  }, [analytics])

  return (
    <section className="analytics-page">
      <div className="section-hero analytics-hero"><span className="eyebrow">Inteligencia operacional</span><h1>Dashboard de crisis</h1><p>Indicadores consolidados desde el lago de datos para anticipar riesgos y priorizar decisiones.</p><div className="analytics-meta"><span>● Athena conectado</span><span>Última actualización: {new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(updatedAt)}</span><button onClick={() => void load()} disabled={loading}>↻ Actualizar</button></div></div>
      <div className="analytics-workspace">
        {error && <StatePanel eyebrow="Atención" title="No se pudo actualizar el dashboard" message={error} tone="error" />}
        {loading && <StatePanel eyebrow="Analizando" title="Consultando Amazon Athena" message="Procesando las cinco consultas operacionales…" />}
        {!loading && analytics && summary && <>
          <div className="analytics-kpis">
            <article className="kpi-card kpi-card--red"><span>Fallas de recursos</span><strong>{summary.failures}</strong><small>Últimos 7 días</small><b>Requiere seguimiento</b></article>
            <article className="kpi-card kpi-card--amber"><span>Retraso internacional</span><strong>{summary.delay.toFixed(1)} min</strong><small>Promedio operacional</small><b>+4.2 min vs. periodo anterior</b></article>
            <article className="kpi-card kpi-card--orange"><span>Incidencias de combustible</span><strong>{summary.fuel}</strong><small>Eventos por aerolínea</small><b>5 aerolíneas afectadas</b></article>
            <article className="kpi-card kpi-card--green"><span>Recaudación TUUA</span><strong>{money.format(summary.revenue)}</strong><small>Acumulado analizado</small><b>Información financiera</b></article>
            <article className="kpi-card kpi-card--blue"><span>Retraso en hora punta</span><strong>{summary.peak.toFixed(1)}%</strong><small>Mayor franja registrada</small><b>18:00–21:00</b></article>
          </div>

          <div className="analytics-grid">
            <article className="chart-card chart-card--wide"><header><div><span className="eyebrow">Infraestructura</span><h2>Recursos con más fallas</h2></div><small>Ventana: 7 días</small></header><HorizontalBars label="Fallas por recurso" items={analytics.resourceFailures.map((item) => ({ name: item.resource, amount: item.failures }))} value={(amount) => `${amount} fallas`} /></article>
            <article className="chart-card"><header><div><span className="eyebrow">Puntualidad</span><h2>Retraso promedio</h2></div></header><div className="delay-columns">{analytics.averageDelay.map((item) => <div key={item.flightType}><div><i style={{ height: `${Math.max(item.averageMinutes * 3, 20)}px` }} /></div><strong>{item.averageMinutes.toFixed(1)} min</strong><span>{item.flightType}</span></div>)}</div></article>
            <article className="chart-card"><header><div><span className="eyebrow">Hora punta</span><h2>Vuelos retrasados</h2></div></header><div className="peak-list">{analytics.peakDelays.map((item) => <div key={item.period}><div className="peak-ring" style={{ '--percentage': `${item.percentage * 3.6}deg` } as CSSProperties}><strong>{item.percentage.toFixed(1)}%</strong></div><div><strong>{item.period}</strong><span>{item.delayedFlights} de {item.totalFlights} vuelos</span></div></div>)}</div></article>
            <article className="chart-card chart-card--wide"><header><div><span className="eyebrow">Seguridad operacional</span><h2>Incidencias de combustible por aerolínea</h2></div></header><HorizontalBars label="Incidencias por aerolínea" items={analytics.fuelIncidents.map((item) => ({ name: item.airline, amount: item.incidents }))} value={(amount) => `${amount} eventos`} /></article>
            <article className="chart-card"><header><div><span className="eyebrow">Ingresos</span><h2>Recaudación TUUA</h2></div></header><div className="revenue-list">{analytics.tuuaRevenue.map((item, index) => <div key={item.category}><i className={`revenue-dot revenue-dot--${index + 1}`} /><span>{item.category}</span><strong>{money.format(item.amount)}</strong></div>)}</div></article>
          </div>
          <footer className="analytics-source"><span>Fuente</span><strong>MS5 Analítica · Amazon Athena</strong><small>Las visualizaciones se actualizarán automáticamente al conectar la API real.</small></footer>
        </>}
      </div>
    </section>
  )
}
