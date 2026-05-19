import type { Metadata } from 'next'
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
            [Opening sentence that positions who you are — your role, current institution or employer,
            and the kind of problems you work on. Write it the way you'd say it to a colleague, not a recruiter.]
          </p>
          <p style={{ fontSize: '17px', lineHeight: 1.85, color: 'var(--color-ink)', marginBottom: '1.2rem' }}>
            [Second paragraph. Go a level deeper — what draws you to this area, what questions feel important
            to you right now. This is where your voice should come through.]
          </p>
          <p style={{ fontSize: '17px', lineHeight: 1.85, color: 'var(--color-ink)' }}>
            [Third paragraph, optional. Current work, ongoing research, or what you're learning.]
          </p>
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '2.5rem 0' }} />

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
              { label: 'Previously', value: '[Previous role or institution]' },
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
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '2.5rem 0' }} />

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
            I&rsquo;m also on{' '}
            <a href="https://github.com" className="link-underline">
              GitHub
            </a>
            {' '}and{' '}
            <a href="https://linkedin.com" className="link-underline">
              LinkedIn
            </a>.
          </p>
        </div>

      </div>
    </div>
  )
}
