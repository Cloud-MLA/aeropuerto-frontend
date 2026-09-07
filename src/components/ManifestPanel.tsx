import type { FlightManifest, ManifestSummary } from '../types/manifest'

interface ManifestPanelProps {
  manifest: FlightManifest
  summary: ManifestSummary
  onClose: () => void
}

export function ManifestPanel({ manifest, summary, onClose }: ManifestPanelProps) {
  return (
    <section className="manifest-panel" aria-labelledby="manifest-title">
      <div className="manifest-panel__heading">
        <div>
          <span className="eyebrow">Manifiesto consolidado</span>
          <h2 id="manifest-title">Operación del vuelo #{manifest.flightId}</h2>
          <p>{manifest.aircraft}</p>
        </div>
        <button className="secondary-action" onClick={onClose}>Cerrar manifiesto</button>
      </div>

      <div className="summary-grid">
        <article><span>Pasajeros</span><strong>{summary.passengerCount}</strong></article>
        <article><span>Con check-in</span><strong>{summary.checkedInCount}</strong></article>
        <article><span>Equipaje total</span><strong>{summary.baggageKg.toFixed(1)} kg</strong></article>
        <article className={summary.openIncidents ? 'summary-card--alert' : ''}>
          <span>Incidencias abiertas</span><strong>{summary.openIncidents}</strong>
        </article>
      </div>

      <div className="manifest-grid">
        <div className="passenger-table-wrap">
          <table>
            <thead><tr><th>Pasajero</th><th>Asiento</th><th>Embarque</th><th>Equipaje</th></tr></thead>
            <tbody>
              {manifest.passengers.map((passenger) => (
                <tr key={passenger.id}>
                  <td><strong>{passenger.name}</strong><small>#{passenger.id}</small></td>
                  <td>{passenger.seat}</td>
                  <td>{passenger.boardingStatus}</td>
                  <td>{passenger.baggageKg.toFixed(1)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="manifest-resources">
          <span>Recursos asignados</span>
          <ul>{manifest.assignedResources.map((resource) => <li key={resource}>{resource}</li>)}</ul>
          <dl><dt>Tripulación</dt><dd>{manifest.crewMembers} personas</dd></dl>
        </aside>
      </div>
    </section>
  )
}

