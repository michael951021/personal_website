'use client'

import Link from 'next/link'

// ─── inline fish bullet ───────────────────────────────────────
// Matches the silhouette from underwater.tsx but rendered small as a list marker.

function FishBullet() {
  return (
    <svg
      width="28"
      height="12"
      viewBox="0 0 70 28"
      aria-hidden="true"
      style={{ flexShrink: 0, opacity: 0.55, color: 'var(--color-muted)' }}
    >
      <ellipse cx="42" cy="14" rx="25" ry="9" fill="currentColor" />
      <polygon points="18,14 4,5 4,23" fill="currentColor" />
      <circle cx="61" cy="11" r="2" fill="rgba(255,255,255,0.55)" />
    </svg>
  )
}

// ─── bubble spawner (mirrors project-list.tsx) ────────────────

function spawnBubbles(li: HTMLElement) {
  const nameEl = li.querySelector('.skill-name') as HTMLElement | null
  if (!nameEl) return

  const liRect   = li.getBoundingClientRect()
  const nameRect = nameEl.getBoundingClientRect()
  const nameTopInLi  = nameRect.top  - liRect.top
  const nameLeftInLi = nameRect.left - liRect.left
  const riseDistance = nameRect.top + 40
  const duration = 1.4 + Math.random() * 0.6
  const count    = 5 + Math.floor(Math.random() * 3)

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const b = document.createElement('span')
      const xOffset = (Math.random() - 0.5) * nameRect.width * 0.9
      const x    = nameLeftInLi + nameRect.width / 2 + xOffset
      const size = 3 + Math.random() * 3
      const drift = (Math.random() - 0.5) * 24

      Object.assign(b.style, {
        position:        'absolute',
        left:            x + 'px',
        top:             (nameTopInLi + nameRect.height / 2) + 'px',
        width:           size + 'px',
        height:          size + 'px',
        borderRadius:    '50%',
        border:          '1px solid var(--color-muted)',
        backgroundColor: 'rgba(150,200,255,0.06)',
        opacity:         '0.65',
        pointerEvents:   'none',
        willChange:      'transform, opacity',
        transform:       'translate(0, 0)',
      })

      li.appendChild(b)

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          b.style.transition = `transform ${duration}s ease-out, opacity ${duration * 0.9}s ease-in`
          b.style.transform  = `translate(${drift}px, -${riseDistance}px)`
          b.style.opacity    = '0'
        })
      })

      setTimeout(() => b.remove(), (duration + 0.15) * 1000)
    }, i * 30 + Math.random() * 50)
  }
}

// ─── types ────────────────────────────────────────────────────

export interface SkillEntry {
  tag: string
  projects: Array<{ title: string; slug: string }>
}

// ─── component ────────────────────────────────────────────────

export function SkillList({ skills }: { skills: SkillEntry[] }) {
  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {skills.map(({ tag, projects }) => (
        <li
          key={tag}
          style={{
            borderTop:     '1px solid var(--color-muted)',
            paddingTop:    '1rem',
            paddingBottom: '1rem',
            position:      'relative',
          }}
          onMouseEnter={e => spawnBubbles(e.currentTarget)}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>

            {/* Left: fish bullet + skill name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <FishBullet />
              <span
                className="skill-name"
                style={{
                  fontFamily:    'var(--font-serif)',
                  fontSize:      '17px',
                  color:         'var(--color-ink)',
                  letterSpacing: '-0.01em',
                }}
              >
                {tag}
              </span>
            </div>

            {/* Right: project links */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1rem' }}>
              {projects.map(p => (
                <Link
                  key={p.slug}
                  href={`/writing/${p.slug}`}
                  style={{
                    fontFamily:    'var(--font-mono)',
                    fontSize:      '11px',
                    letterSpacing: '0.05em',
                    color:         'var(--color-muted)',
                    textDecoration: 'none',
                    transition:    'opacity 150ms ease',
                  }}
                  className="link-fade"
                >
                  {p.title}
                </Link>
              ))}
            </div>

          </div>
        </li>
      ))}
      <li style={{ borderTop: '1px solid var(--color-muted)' }} />
    </ol>
  )
}
