interface PlaceholderPageProps {
  eyebrow: string
  title: string
  description: string
  dependency: string
}

export function PlaceholderPage({ eyebrow, title, description, dependency }: PlaceholderPageProps) {
  return (
    <section className="placeholder-page">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="dependency-card">
        <span>Próxima integración</span>
        <strong>{dependency}</strong>
        <small>La estructura está lista para conectarse cuando el contrato esté disponible.</small>
      </div>
    </section>
  )
}

