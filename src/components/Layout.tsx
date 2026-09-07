import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  ['/', 'Operaciones'],
  ['/tickets', 'Tickets'],
  ['/infraestructura', 'Infraestructura'],
  ['/dashboard', 'Analítica'],
  ['/docs', 'APIs'],
]

export function Layout() {
  const now = new Date()
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">✈</span>
          <div>
            <strong>Jorge Chávez</strong>
            <small>Centro de operaciones</small>
          </div>
        </div>
        <nav aria-label="Navegación principal">
          {navigation.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar__meta">
          <time>{new Intl.DateTimeFormat('es-PE', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(now)}</time>
          <div className="system-status"><span /> Sistema operativo</div>
          <span className="avatar">JC</span>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
