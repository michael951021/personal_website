'use client'

import Link from 'next/link'
import type { Project } from '@/lib/projects'

function spawnBubbles(li: HTMLElement) {
  const count = 3 + Math.floor(Math.random() * 3)
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const b = document.createElement('span')
      const x     = 5 + Math.random() * 88
      const size  = 2.5 + Math.random() * 3.5
      const rise  = 16 + Math.random() * 22
      const drift = (Math.random() - 0.5) * 10

      Object.assign(b.style, {
        position:        'absolute',
        left:            x + '%',
        bottom:          '2px',
        width:           size + 'px',
        height:          size + 'px',
        borderRadius:    '50%',
        border:          '1px solid var(--color-muted)',
        backgroundColor: 'rgba(150,200,255,0.04)',
        opacity:         '0.5',
        pointerEvents:   'none',
        willChange:      'transform, opacity',
      })

      li.appendChild(b)

      // Double rAF ensures the initial state is painted before transition begins
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          b.style.transition = 'transform 0.65s ease-out, opacity 0.65s ease-out'
          b.style.transform  = `translate(${drift}px, -${rise}px)`
          b.style.opacity    = '0'
        })
      })

      setTimeout(() => b.remove(), 700)
    }, i * 70 + Math.random() * 40)
  }
}

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {projects.map((project, i) => (
        <li
          key={project.slug}
          style={{
            borderTop:    '1px solid var(--color-border)',
            paddingTop:   '1.1rem',
            paddingBottom:'1.1rem',
            position:     'relative',
          }}
          onMouseEnter={e => spawnBubbles(e.currentTarget)}
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
                    fontSize:   '11px',
                    color:      'var(--color-muted)',
                    letterSpacing: '0.04em',
                    flexShrink: 0,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="project-title"
                  style={{
                    fontSize:   '17px',
                    color:      'var(--color-ink)',
                    transition: 'font-style 0ms',
                  }}
                >
                  {project.title}
                </span>
              </div>
              <p
                style={{
                  fontSize:   '14px',
                  color:      'var(--color-muted)',
                  marginTop:  '0.2rem',
                  paddingLeft:'1.75rem',
                }}
              >
                {project.summary}
              </p>
            </div>
            <span
              style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      '11px',
                color:         'var(--color-muted)',
                letterSpacing: '0.04em',
                flexShrink:    0,
                paddingTop:    '0.15rem',
              }}
            >
              {project.year}
            </span>
          </Link>
        </li>
      ))}
      <li style={{ borderTop: '1px solid var(--color-border)' }} />
    </ol>
  )
}
