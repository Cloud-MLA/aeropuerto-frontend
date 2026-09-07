import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  ['/', 'Operaciones'],
  ['/tickets', 'Tickets'],
  ['/infraestructura', 'Infraestructura'],
  ['/dashboard', 'Analítica'],
  ['/docs', 'APIs'],
]

export function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">JC</span>
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
        <div className="system-status">
          <span /> Sistema operativo
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

