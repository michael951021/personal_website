import Link from 'next/link'
import { current } from '@/lib/config'
import loop from '@/content/writing/data/local-multi-agent-loop.json'

// Headline numbers come from the report's own data export, so they stay in sync when it's refreshed.
const { totals, reuse_by_era: reuse } = loop
const stats = [
  { value: String(totals.runs), label: 'agent runs' },
  { value: `${Math.round(totals.agent_hours)} h`, label: 'of agent time' },
  { value: `${(totals.gen_tok / 1e6).toFixed(1)}M`, label: 'tokens generated' },
  { value: `${Math.round(reuse.ollama)}% → ${Math.round(reuse.llama)}%`, label: 'prompt-cache reuse' },
]

export function FeaturedProject() {
  return (
    <div className="featured-card">
      <p className="featured-label">
        <span className="live-dot" aria-hidden="true" />
        Currently working on
      </p>

      <Link href={current.href} className="featured-title">
        {current.title}
      </Link>

      <p style={{ fontSize: '16px', lineHeight: 1.75, color: 'var(--color-ink)', margin: '0.6rem 0 1.25rem', maxWidth: '600px' }}>
        {current.summary}
      </p>

      <dl className="featured-stats">
        {stats.map(s => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </dl>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem 1rem' }}>
        <Link href={current.href} className="check-out-link">
          Read the report →
        </Link>
        <a href={current.runUrl} target="_blank" rel="noopener noreferrer" className="check-out-link">
          See a run ↗
        </a>
      </div>
    </div>
  )
}
