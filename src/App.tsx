import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { FlightsPage } from './pages/FlightsPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { TicketsPage } from './pages/TicketsPage'
import { InfrastructurePage } from './pages/InfrastructurePage'
import { DashboardPage } from './pages/DashboardPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<FlightsPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="infraestructura" element={<InfrastructurePage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="docs" element={<PlaceholderPage eyebrow="Integración" title="Catálogo de APIs" description="Documentación centralizada de los cinco microservicios." dependency="OpenAPI de MS1–MS5" />} />
        <Route path="*" element={<PlaceholderPage eyebrow="404" title="Página no encontrada" description="La dirección solicitada no pertenece al centro de operaciones." dependency="Navegación principal" />} />
      </Route>
    </Routes>
  )
}

