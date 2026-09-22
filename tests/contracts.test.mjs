import assert from 'node:assert/strict'
import test from 'node:test'
import { adaptAnalytics, adaptManifest, adaptManifestSummary } from '../src/api/contractAdapters.ts'

test('adapta el manifiesto de MS4 sin inventar datos ausentes', () => {
  const manifest = adaptManifest({
    vuelo_id: 6058,
    vuelo: { aeronave: { modelo: 'Boeing 787-9', placa: 'OB-1111' } },
    pasajeros: [
      { id_ticket: 1, id_persona: 134482, estado_boarding: 'Embarcado', equipaje: [{ peso: '17.65' }] },
      { id_ticket: 2, id_persona: 134483, estado_boarding: 'Emitido' },
    ],
    tripulacion: [{ id_empleado: 1542 }],
    incidencias_abiertas: [{ id: 1 }],
    warnings: [],
  })

  assert.equal(manifest.flightId, 6058)
  assert.equal(manifest.aircraft, 'Boeing 787-9 · OB-1111')
  assert.equal(manifest.passengers[0].name, 'Persona #134482')
  assert.equal(manifest.passengers[0].seat, '—')
  assert.equal(manifest.passengers[0].baggageKg, 17.65)
  assert.equal(manifest.passengers[1].baggageKg, null)
  assert.deepEqual(manifest.assignedResources, [])
  assert.deepEqual(adaptManifestSummary({ pasajeros_total: 2, equipaje_kg_total: 17.65, incidencias_abiertas: 1 }, manifest), {
    passengerCount: 2, checkedInCount: 1, baggageKg: null, openIncidents: 1,
  })
})

test('señala un manifiesto parcial si falla MS1', () => {
  const manifest = adaptManifest({ vuelo_id: 3, pasajeros: [], warnings: ['MS1/tickets: timeout'] })
  assert.equal(adaptManifestSummary({ pasajeros_total: 0 }, manifest).checkedInCount, null)
  assert.equal(adaptManifestSummary({ pasajeros_total: 0 }, manifest).passengerCount, null)
  assert.deepEqual(manifest.warnings, ['MS1/tickets: timeout'])
})

test('adapta las cinco respuestas de MS5 con sus columnas Athena', () => {
  const result = adaptAnalytics([
    { query: 'Q1', rows: [{ nombre_tecnico_locacion: 'Radar Norte', incidencias_total: 59 }] },
    { query: 'Q2', rows: [{ grupo: 'GLOBAL', retraso_promedio_min: 38.6 }] },
    { query: 'Q3', rows: [{ aerolinea: 'LATAM', incidencias_combustible: 12 }] },
    { query: 'Q4', rows: [{ categoria: 'Turista', recaudacion_soles: 4000 }] },
    { query: 'Q5', rows: [{ franja: 'HORA PUNTA (06-09h)', tipo: 'Internacional', vuelos: 126, vuelos_retrasados: 31, pct_retrasados: 24.6 }] },
  ])

  assert.deepEqual(result.resourceFailures, [{ resource: 'Radar Norte', failures: 59 }])
  assert.deepEqual(result.averageDelay, [{ flightType: 'Internacional', averageMinutes: 38.6 }])
  assert.deepEqual(result.fuelIncidents, [{ airline: 'LATAM', incidents: 12 }])
  assert.deepEqual(result.tuuaRevenue, [{ category: 'Turista', amount: 4000 }])
  assert.deepEqual(result.peakDelays, [{ period: 'HORA PUNTA (06-09h) · Internacional', totalFlights: 126, delayedFlights: 31, percentage: 24.6 }])
})

test('rechaza respuestas de MS5 sin rows', () => {
  assert.throws(() => adaptAnalytics([{}, {}, {}, {}, {}]), /sin filas válidas/)
})
