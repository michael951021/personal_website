import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/config'

export const metadata: Metadata = {
  title: 'About',
}

export default function About() {
  return (
    <div style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '680px' }}>

        <h1
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            marginBottom: '3rem',
          }}
        >
          About
        </h1>

        {/* Bio */}
        <div style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontSize: '20px', lineHeight: 1.75, marginBottom: '1.4rem', letterSpacing: '-0.01em' }}>
            I&rsquo;m Kevin, a computer science student at Cornell. I like the part of machine learning where the model
            meets everything around it: the serving stack, what ends up in the context window, and the numbers that
            tell you whether a change actually helped.
          </p>
          <p style={{ fontSize: '17px', lineHeight: 1.85, color: 'var(--color-ink)', marginBottom: '1.2rem' }}>
            This summer I was at <strong style={{ fontWeight: 500 }}>Gail</strong>, working on the realtime voice agent
            that answers the phone for insurance agencies. Most of my work lived at the edges of a live call: switching
            speech-to-text providers mid-call so an email address gets spelled out right, racing a second LLM request
            when the first one stalls, filler phrases in sixteen languages so a slow tool call doesn&rsquo;t sound like a
            dropped line, and tracing so you can see where every turn spent its time.
          </p>
          <p style={{ fontSize: '17px', lineHeight: 1.85, color: 'var(--color-ink)' }}>
            Right now I&rsquo;m running long-lived agent loops on my own hardware (two 3090s, two Qwen models) and{' '}
            <Link href="/writing/local-multi-agent-loop" className="link-underline">writing up</Link>{' '}
            what makes them better. On the side: whether Muon works because its Newton&ndash;Schulz step approximates the polar factor,
            or because of the shape it gives the singular values; a small cluster manager for local GPUs; and a demo
            for face recognition that runs on encrypted images.
          </p>
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-muted)', margin: '2.5rem 0' }} />

        {/* Background */}
        <div style={{ marginBottom: '3rem' }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
              marginBottom: '1rem',
            }}
          >
            Background
          </p>
          <dl style={{ margin: 0 }}>
            {[
              { label: 'Education', value: 'B.S. Computer Science, Cornell University, 2026' },
              { label: 'Previously', value: 'Gail — realtime voice agents, summer 2026' },
              { label: 'Now', value: 'Local agent loops, optimizer research' },
              { label: 'Location', value: site.location },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr',
                  gap: '0 1.5rem',
                  marginBottom: '0.6rem',
                  alignItems: 'baseline',
                }}
              >
                <dt
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    color: 'var(--color-muted)',
                    paddingTop: '0.1rem',
                  }}
                >
                  {label}
                </dt>
                <dd style={{ fontSize: '15px', margin: 0, color: 'var(--color-ink)' }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-muted)', margin: '2.5rem 0' }} />

        {/* Contact */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
              marginBottom: '1rem',
            }}
          >
            Contact
          </p>
          <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--color-ink)' }}>
            <a href={`mailto:${site.email}`} className="link-underline">
              {site.email}
            </a>
            {' '}is the best way to reach me.
            Code is on{' '}
            <a href={site.github} className="link-underline">
              GitHub
            </a>.
          </p>
        </div>

      </div>
    </div>
  )
}
