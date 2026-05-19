import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllProjects } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Work',
}

export default function Work() {
  const projects = getAllProjects()

  return (
    <div style={{ paddingTop: '5rem', paddingBottom: '6rem' }}
    >
      <div style={{ maxWidth: '680px' }}>

        <div style={{ marginBottom: '3rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
              marginBottom: '0.75rem',
            }}
          >
            Work
          </h1>
          <p style={{ fontSize: '17px', lineHeight: 1.75, color: 'var(--color-ink)', maxWidth: '480px' }}>
            Selected projects. Each write-up covers the problem, approach, and what I learned.
          </p>
        </div>

        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {projects.map((project, i) => (
            <li
              key={project.slug}
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <Link
                href={`/work/${project.slug}`}
                style={{ display: 'block', padding: '1.4rem 0', textDecoration: 'none' }}
                className="group"
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '2rem',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    {/* Index + title row */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.35rem' }}>
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
                        style={{
                          fontSize: '19px',
                          color: 'var(--color-ink)',
                          letterSpacing: '-0.01em',
                          transition: 'font-style 0ms',
                        }}
                        className="group-hover:italic"
                      >
                        {project.title}
                      </span>
                    </div>

                    {/* Summary */}
                    <p
                      style={{
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: 'var(--color-muted)',
                        paddingLeft: '2rem',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {project.summary}
                    </p>

                    {/* Tags */}
                    {project.tags?.length > 0 && (
                      <div style={{ paddingLeft: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {project.tags.map(tag => (
                          <span
                            key={tag}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '10px',
                              letterSpacing: '0.06em',
                              color: 'var(--color-muted)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Year */}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--color-muted)',
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                      paddingTop: '0.25rem',
                    }}
                  >
                    {project.year}
                  </span>
                </div>
              </Link>
            </li>
          ))}
          <li style={{ borderTop: '1px solid var(--color-border)' }} />
        </ol>

      </div>
    </div>
  )
}
