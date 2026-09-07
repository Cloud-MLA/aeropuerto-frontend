import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { FlightsPage } from './pages/FlightsPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<FlightsPage />} />
        <Route path="tickets" element={<PlaceholderPage eyebrow="Pasajeros" title="Tickets y check-in" description="Emisión de tickets y seguimiento del proceso de embarque." dependency="MS1 Pasajeros + MS2 Vuelos" />} />
        <Route path="infraestructura" element={<PlaceholderPage eyebrow="Aeropuerto" title="Recursos e incidencias" description="Control de mangas, radares e incidencias de la operación." dependency="MS3 Infraestructura" />} />
        <Route path="dashboard" element={<PlaceholderPage eyebrow="Inteligencia operacional" title="Dashboard de crisis" description="Indicadores y tendencias procesadas mediante Amazon Athena." dependency="MS5 Analítica" />} />
        <Route path="docs" element={<PlaceholderPage eyebrow="Integración" title="Catálogo de APIs" description="Documentación centralizada de los cinco microservicios." dependency="OpenAPI de MS1–MS5" />} />
        <Route path="*" element={<PlaceholderPage eyebrow="404" title="Página no encontrada" description="La dirección solicitada no pertenece al centro de operaciones." dependency="Navegación principal" />} />
      </Route>
    </Routes>
  )
}

