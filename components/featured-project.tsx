import Link from 'next/link'
import { current } from '@/lib/config'
import loop from '@/content/writing/data/local-multi-agent-loop.json'
import { ProjectAnimation } from '@/components/project-animation'

// Supporting figures come from the report's own data export, so they stay in sync when it's refreshed.
const { totals } = loop
const facts = [
  `${totals.runs} runs`,
  `${Math.round(totals.agent_hours)} agent-hours`,
  `${(totals.gen_tok / 1e6).toFixed(1)}M tokens generated`,
]

export function FeaturedProject() {
  return (
    <>
    <div className="featured project-feature">
      <div>
      <p className="featured-label">Currently working on</p>

      <h2 style={{ margin: 0 }}>
        <Link href={current.href} className="featured-title" data-bubbles>
          {current.title}
        </Link>
      </h2>

      <p className="featured-summary">
        {current.summary}
      </p>

      <p className="featured-facts">{facts.join(' · ')}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem 1rem' }}>
        <Link href={current.href} className="button" data-bubbles>
          Read the report →
        </Link>
        <a href={current.runUrl} target="_blank" rel="noopener noreferrer" className="button" data-bubbles>
          See a run ↗
        </a>
      </div>
      </div>
      <ProjectAnimation scene="local-multi-agent-loop" compact />
    </div>
    <div className="featured project-feature" style={{ marginTop: '3rem' }}>
      <div>
        <p className="featured-label">Recent experiment</p>
        <h2 style={{ margin: 0 }}>
          <Link href="/writing/speculative-agent-workloads" className="featured-title" data-bubbles>
            Speculative Decoding for Agent Workloads
          </Link>
        </h2>
        <p className="featured-summary">
          Smaller models draft agent output; a target checks each block. Held-out prediction tests and a corrected decoder, with the speed comparison still pending.
        </p>
        <Link href="/writing/speculative-agent-workloads" className="button" data-bubbles>Read the report →</Link>
      </div>
      <ProjectAnimation scene="speculative-agent-workloads" compact />
    </div>
    </>
  )
}
