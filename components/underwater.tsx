'use client'

import { useEffect, useRef } from 'react'

// ─── color interpolation ──────────────────────────────────────

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t)

const PALETTE: Record<string, { s: [number, number, number]; e: [number, number, number] }> = {
  'color-bg':      { s: [246, 244, 240], e: [7,   16,  36]  },
  'color-ink':     { s: [28,  25,  23],  e: [208, 228, 250] },
  'color-muted':   { s: [155, 145, 137], e: [80,  120, 165] },
  'color-border':  { s: [224, 219, 212], e: [16,  40,  75]  },
  'color-surface': { s: [237, 234, 228], e: [10,  24,  48]  },
}

function applyDepth(t: number) {
  const root = document.documentElement
  for (const [k, { s, e }] of Object.entries(PALETTE)) {
    root.style.setProperty(
      `--${k}`,
      `rgb(${lerp(s[0], e[0], t)},${lerp(s[1], e[1], t)},${lerp(s[2], e[2], t)})`
    )
  }
}

// ─── fish ─────────────────────────────────────────────────────

// Simple silhouette: oval body + forked tail + dorsal hint + eye
const FISH_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 28" width="70" height="28" aria-hidden="true">',
  '<ellipse cx="42" cy="14" rx="25" ry="9" fill="currentColor"/>',
  '<polygon points="18,14 4,5 4,23" fill="currentColor"/>',
  '<path d="M38,5 Q48,0 55,5" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  '<circle cx="61" cy="11" r="2" fill="rgba(255,255,255,0.5)"/>',
  '</svg>',
].join('')

function spawnFish(container: HTMLElement) {
  const goRight = Math.random() > 0.3
  const y        = 60 + Math.random() * (window.innerHeight - 120)
  const speed    = 0.9 + Math.random() * 1.8
  const scale    = 0.65 + Math.random() * 0.7

  const maxScroll = document.body.scrollHeight - window.innerHeight
  const depth     = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0
  const opacity   = Math.min(0.07 + depth * 0.22 + Math.random() * 0.06, 0.35)

  const el = document.createElement('div')
  el.innerHTML = FISH_SVG
  Object.assign(el.style, {
    position:        'fixed',
    pointerEvents:   'none',
    zIndex:          '0',
    color:           'rgb(70,130,200)',
    opacity:         String(opacity),
    top:             y + 'px',
    left:            (goRight ? -80 : window.innerWidth + 80) + 'px',
    transform:       `scaleX(${goRight ? 1 : -1}) scale(${scale})`,
    transformOrigin: 'center center',
    willChange:      'left, top',
  })
  container.appendChild(el)

  let x      = goRight ? -80 : window.innerWidth + 80
  let tick   = 0
  const originY = y

  const frame = () => {
    tick++
    x += speed * (goRight ? 1 : -1)
    el.style.left = x + 'px'
    el.style.top  = (originY + Math.sin(tick * 0.04) * 5) + 'px'

    const done = goRight ? x > window.innerWidth + 80 : x < -80
    if (!done) requestAnimationFrame(frame)
    else el.remove()
  }

  requestAnimationFrame(frame)
}

// ─── component ────────────────────────────────────────────────

export function Underwater() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const computeT = () => {
      const max = document.body.scrollHeight - window.innerHeight
      return max > 0 ? Math.min(window.scrollY / max, 1) : 0
    }

    // Apply depth immediately for non-zero scroll position on mount
    applyDepth(computeT())

    let raf  = 0
    let prev = -1
    const onScroll = () => {
      const t = computeT()
      if (Math.abs(t - prev) < 0.003) return
      prev = t
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => applyDepth(t))
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Staggered fish spawning
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        if (containerRef.current) spawnFish(containerRef.current)
        schedule()
      }, 9000 + Math.random() * 15000)
    }
    // First fish after a short delay
    timer = setTimeout(() => {
      if (containerRef.current) spawnFish(containerRef.current)
      schedule()
    }, 3000 + Math.random() * 5000)

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      for (const k of Object.keys(PALETTE)) {
        document.documentElement.style.removeProperty(`--${k}`)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
