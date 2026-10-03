'use client'

import { useEffect } from 'react'

// Bubbles that rise from an element when it's hovered. The count scales with the element's width,
// so a small icon button lets out a couple and a wide title lets out more. Bubbles are fixed-position
// children of <body> and remove themselves.

export function spawnBubbles(el: HTMLElement, minCount = 2) {
  const rect = el.getBoundingClientRect()
  const riseDistance = rect.top + 40
  const duration = 1.4 + Math.random() * 0.6
  const count = Math.max(minCount, Math.min(8, Math.round(rect.width / 28)))

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const b = document.createElement('span')
      const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.9
      const size = 3 + Math.random() * 3
      const drift = (Math.random() - 0.5) * 24

      Object.assign(b.style, {
        position:        'fixed',
        left:            x + 'px',
        top:             (rect.top + rect.height / 2) + 'px',
        width:           size + 'px',
        height:          size + 'px',
        borderRadius:    '50%',
        border:          '1px solid var(--color-muted)',
        backgroundColor: 'rgba(150,200,255,0.06)',
        opacity:         '0.65',
        pointerEvents:   'none',
        zIndex:          '2',
        willChange:      'transform, opacity',
        transform:       'translate(0, 0)',
      })

      document.body.appendChild(b)

      // Double rAF so the start state paints before the transition begins
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

// Mounted once in the layout: any element with a data-bubbles attribute bubbles when the pointer enters it,
// so server components only need the attribute.
export function HoverBubbles() {
  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-bubbles]')
      // mouseover also fires when moving between an element's children; only count real entries
      if (!el || el.contains(e.relatedTarget as Node | null)) return
      spawnBubbles(el)
    }
    document.addEventListener('mouseover', onOver)
    return () => document.removeEventListener('mouseover', onOver)
  }, [])
  return null
}
