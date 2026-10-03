'use client'

// Bubbles that rise from an element (a skill name, a project title) when its container is hovered.
// The container must be position:relative; bubbles are appended to it and remove themselves.

export function spawnBubbles(li: HTMLElement, sourceSelector: string) {
  const nameEl = li.querySelector(sourceSelector) as HTMLElement | null
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

export function BubbleZone({ source, className, children }: {
  source: string // selector, within this zone, for the element the bubbles rise from
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className} style={{ position: 'relative' }} onMouseEnter={e => spawnBubbles(e.currentTarget, source)}>
      {children}
    </div>
  )
}
