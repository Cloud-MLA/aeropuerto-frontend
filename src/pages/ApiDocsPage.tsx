import { useMemo, useState } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

type ServiceId = 'ms1' | 'ms2' | 'ms3' | 'ms4' | 'ms5'

interface ApiService {
  id: ServiceId
  shortName: string
  name: string
  technology: string
  description: string
  specPath: string
  localSpec: string
  envUrl?: string
}

const services: ApiService[] = [
  { id: 'ms1', shortName: 'MS1', name: 'Pasajeros y tickets', technology: 'FastAPI · MySQL', description: 'Pasajeros, categorías migratorias, emisión, check-in y equipaje.', specPath: '/api/pasajeros/openapi.json', localSpec: 'http://localhost:8001/openapi.json', envUrl: import.meta.env.VITE_MS1_OPENAPI_URL },
  { id: 'ms2', shortName: 'MS2', name: 'Vuelos y operaciones', technology: 'Spring Boot · PostgreSQL', description: 'Vuelos, aeronaves, aerolíneas, tripulación y estados operativos.', specPath: '/api/vuelos/v3/api-docs', localSpec: 'http://localhost:8002/v3/api-docs', envUrl: import.meta.env.VITE_MS2_OPENAPI_URL },
  { id: 'ms3', shortName: 'MS3', name: 'Infraestructura', technology: 'Express · MongoDB', description: 'Recursos aeroportuarios, asignaciones e incidencias.', specPath: '/api/infra/openapi.json', localSpec: 'http://localhost:8003/openapi.json', envUrl: import.meta.env.VITE_MS3_OPENAPI_URL },
  { id: 'ms4', shortName: 'MS4', name: 'Manifiesto', technology: 'FastAPI · Agregador', description: 'Manifiesto consolidado de vuelo y resumen operacional.', specPath: '/api/manifiesto/openapi.json', localSpec: 'http://localhost:8004/openapi.json', envUrl: import.meta.env.VITE_MS4_OPENAPI_URL },
  { id: 'ms5', shortName: 'MS5', name: 'Analítica', technology: 'FastAPI · Athena', description: 'Indicadores analíticos y consultas del lago de datos.', specPath: '/api/analitica/openapi.json', localSpec: 'http://localhost:8005/openapi.json', envUrl: import.meta.env.VITE_MS5_OPENAPI_URL },
]

function resolveSpecUrl(service: ApiService, apiBase: string) {
  if (service.envUrl) return service.envUrl
  return apiBase ? `${apiBase}${service.specPath}` : service.localSpec
}

export function ApiDocsPage() {
  const [selectedId, setSelectedId] = useState<ServiceId>('ms1')
  const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')
  const selected = services.find((service) => service.id === selectedId) ?? services[0]
  const specUrl = useMemo(() => resolveSpecUrl(selected, apiBase), [apiBase, selected])

  return (
    <section className="api-docs-page">
      <div className="section-hero api-docs-hero">
        <span className="eyebrow">Integración</span>
        <h1>Catálogo de APIs</h1>
        <p>Consulta en un solo lugar los contratos OpenAPI de los cinco microservicios del aeropuerto.</p>
        <div className="api-docs-status"><span>● OpenAPI 3</span><span>Documentación interactiva</span><span>MS1–MS5</span></div>
      </div>

      <div className="api-docs-workspace">
        {!apiBase && <div className="api-docs-notice"><strong>Modo local</strong><span>No se configuró VITE_API_BASE; se consultarán los puertos locales de cada servicio.</span></div>}

        <div className="api-service-grid" role="tablist" aria-label="Microservicios">
          {services.map((service) => (
            <button key={service.id} type="button" role="tab" aria-selected={service.id === selectedId} className={service.id === selectedId ? 'is-active' : ''} onClick={() => setSelectedId(service.id)}>
              <span>{service.shortName}</span>
              <strong>{service.name}</strong>
              <small>{service.technology}</small>
            </button>
          ))}
        </div>

        <section className="api-explorer" aria-live="polite">
          <header>
            <div><span className="eyebrow">{selected.shortName}</span><h2>{selected.name}</h2><p>{selected.description}</p></div>
            <a href={specUrl} target="_blank" rel="noreferrer">Abrir especificación ↗</a>
          </header>
          <div className="api-spec-location"><span>Origen del contrato</span><code>{specUrl}</code></div>
          <div className="swagger-shell">
            <SwaggerUI key={specUrl} url={specUrl} deepLinking displayRequestDuration tryItOutEnabled />
          </div>
        </section>
      </div>
    </section>
  )
}
