interface StatePanelProps {
  eyebrow: string
  title: string
  message: string
  tone?: 'neutral' | 'error'
}

export function StatePanel({ eyebrow, title, message, tone = 'neutral' }: StatePanelProps) {
  return (
    <section className={`state-panel state-panel--${tone}`}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      <p>{message}</p>
    </section>
  )
}

