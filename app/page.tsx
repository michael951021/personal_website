import Link from 'next/link'
import { getAllProjects } from '@/lib/projects'
import { site } from '@/lib/config'
import { ProjectList } from '@/components/project-list'

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

            <ProjectList projects={projects} />
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
