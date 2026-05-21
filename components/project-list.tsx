'use client'

import Link from 'next/link'
import type { Project } from '@/lib/projects'

function spawnBubbles(li: HTMLElement) {
  const titleEl = li.querySelector('.project-title') as HTMLElement | null
  if (!titleEl) return

  const liRect = li.getBoundingClientRect()
  const titleRect = titleEl.getBoundingClientRect()

  // Title position within the li's coordinate space
  const titleTopInLi = titleRect.top - liRect.top
  const titleLeftInLi = titleRect.left - liRect.left

  // How far to rise: from the title up to just above the viewport top
  const riseDistance = titleRect.top + 40

  const duration = 1.4 + Math.random() * 0.6
  const count = 6 + Math.floor(Math.random() * 3)

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const b = document.createElement('span')
      const xOffset = (Math.random() - 0.5) * titleRect.width * 0.9
      const x = titleLeftInLi + titleRect.width / 2 + xOffset
      const size = 3 + Math.random() * 3
      const drift = (Math.random() - 0.5) * 24

      Object.assign(b.style, {
        position: 'absolute',
        left: x + 'px',
        top: (titleTopInLi + titleRect.height / 2) + 'px',
        width: size + 'px',
        height: size + 'px',
        borderRadius: '50%',
        border: '1px solid var(--color-muted)',
        backgroundColor: 'rgba(150,200,255,0.06)',
        opacity: '0.65',
        pointerEvents: 'none',
        willChange: 'transform, opacity',
        transform: 'translate(0, 0)',
      })

      li.appendChild(b)

      // Double rAF ensures the initial state is painted before transition begins
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          b.style.transition = `transform ${duration}s ease-out, opacity ${duration * 0.9}s ease-in`
          b.style.transform = `translate(${drift}px, -${riseDistance}px)`
          b.style.opacity = '0'
        })
      })

      setTimeout(() => b.remove(), (duration + 0.15) * 1000)
    }, i * 30 + Math.random() * 50)
  }
}

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {projects.map((project, i) => (
        <li
          key={project.slug}
          style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: '1.1rem',
            paddingBottom: '1.1rem',
            position: 'relative',
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
                    fontSize: '11px',
                    color: 'var(--color-muted)',
                    letterSpacing: '0.04em',
                    flexShrink: 0,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="project-title group-hover:translate-x-1.5 transition-transform duration-150"
                  style={{
                    fontSize: '17px',
                    color: 'var(--color-ink)',
                    display: 'inline-block',
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
  )
}
