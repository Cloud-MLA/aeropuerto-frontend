import { mockManifests, summarizeManifest } from '../mocks/manifests'
import type { FlightManifest, ManifestSummary } from '../types/manifest'
import { request, useMocksFor } from './client'

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export async function getManifest(flightId: number): Promise<FlightManifest> {
  if (useMocksFor('ms4')) {
    await delay(400)
    const manifest = mockManifests[flightId]
    if (!manifest) throw new Error('No existe un manifiesto para este vuelo.')
    return manifest
  }

  return request<FlightManifest>(`/api/manifiesto/manifiesto/${flightId}`)
}

export async function getManifestSummary(flightId: number): Promise<ManifestSummary> {
  if (useMocksFor('ms4')) {
    await delay(250)
    const manifest = mockManifests[flightId]
    if (!manifest) throw new Error('No existe un resumen para este vuelo.')
    return summarizeManifest(manifest)
  }

  return request<ManifestSummary>(`/api/manifiesto/manifiesto/${flightId}/resumen`)
}

