import Link from 'next/link'
import { getAllProjects } from '@/lib/projects'
import { site } from '@/lib/config'

export default function Home() {
  const projects = getAllProjects()

  return (
    <div style={{ paddingTop: '16vh', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '640px' }}>

        {/* Intro */}
        <section style={{ marginBottom: '5rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '30px',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '1.25rem',
              color: 'var(--color-ink)',
            }}
          >
            {site.name}
          </h1>
          <p
            style={{
              fontSize: '17px',
              lineHeight: 1.85,
              color: 'var(--color-ink)',
              maxWidth: '520px',
            }}
          >
            {site.bio}
          </p>
          {site.available && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: 'var(--color-muted)',
                marginTop: '1.25rem',
              }}
            >
              AVAILABLE FOR WORK
            </p>
          )}
        </section>

        {/* Work list */}
        {projects.length > 0 && (
          <section style={{ marginBottom: '5rem' }}>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
                marginBottom: '1.5rem',
              }}
            >
              Work
            </p>

            <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {projects.map((project, i) => (
                <li
                  key={project.slug}
                  style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '1.1rem',
                    paddingBottom: '1.1rem',
                  }}
                >
                  <Link
                    href={`/work/${project.slug}`}
                    className="group flex items-start justify-between gap-8"
                    style={{ textDecoration: 'none' }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            color: 'var(--color-muted)',
                            letterSpacing: '0.04em',
                            flexShrink: 0,
                          }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="project-title"
                          style={{
                            fontSize: '17px',
                            color: 'var(--color-ink)',
                            transition: 'font-style 0ms',
                          }}
                        >
                          {project.title}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '14px',
                          color: 'var(--color-muted)',
                          marginTop: '0.2rem',
                          paddingLeft: '1.75rem',
                        }}
                      >
                        {project.summary}
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--color-muted)',
                        letterSpacing: '0.04em',
                        flexShrink: 0,
                        paddingTop: '0.15rem',
                      }}
                    >
                      {project.year}
                    </span>
                  </Link>
                </li>
              ))}
              <li style={{ borderTop: '1px solid var(--color-border)' }} />
            </ol>
          </section>
        )}

        {/* Contact */}
        <section>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
              marginBottom: '0.6rem',
            }}
          >
            Contact
          </p>
          <a
            href={`mailto:${site.email}`}
            className="link-underline"
            style={{ fontSize: '17px', color: 'var(--color-ink)' }}
          >
            {site.email}
          </a>
        </section>

      </div>
    </div>
  )
}
