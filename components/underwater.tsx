'use client'

import { useEffect, useRef } from 'react'

// ─── color interpolation ──────────────────────────────────────

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t)


const PALETTE: Record<string, { s: [number, number, number]; e: [number, number, number] }> = {
  'color-bg': { s: [188, 218, 235], e: [7, 16, 36] },
  'color-ink': { s: [32, 44, 58], e: [208, 228, 250] },
  'color-muted': { s: [116, 136, 154], e: [80, 120, 165] },
  'color-border': { s: [214, 226, 235], e: [16, 40, 75] },
  'color-surface': { s: [226, 235, 242], e: [10, 24, 48] },
}

function applyDepth(t: number) {
  const root = document.documentElement
  for (const [k, { s, e }] of Object.entries(PALETTE)) {
    if (k === 'color-ink') {
      const bg_color_s = [PALETTE['color-bg'].s[0], PALETTE['color-bg'].s[1], PALETTE['color-bg'].s[2]]
      const bg_color_e = [PALETTE['color-bg'].e[0], PALETTE['color-bg'].e[1], PALETTE['color-bg'].e[2]]
      const avg_color = bg_color_s.reduce((acc, val, i) => acc + lerp(val, bg_color_e[i], t), 0) / 3
      const ink_delta = 20
      console.log(avg_color)
      const temp = t < 0.2 ? t : t < 0.6 ? 0.2 : t < 0.8 ? 0.2 + (t - 0.6) * 1.5 : 1
      if (avg_color > 128) {
        root.style.setProperty(
          `--${k}`,
          `rgb(${lerp(s[0], s[0] + ink_delta, temp)},${lerp(s[1], s[1] + ink_delta, temp)},${lerp(s[2], s[2] + ink_delta, temp)})`
        )
      } else {
        root.style.setProperty(
          `--${k}`,
          `rgb(${lerp(e[0], e[0] - ink_delta, temp)},${lerp(e[1], e[1] - ink_delta, temp)},${lerp(e[2], e[2] + ink_delta, temp)})`
        )
      }
      continue
    }
    root.style.setProperty(
      `--${k}`,
      `rgb(${lerp(s[0], e[0], t)},${lerp(s[1], e[1], t)},${lerp(s[2], e[2], t)})`
    )
  }
}

// ─── styles ───────────────────────────────────────────────────

function ensureStyles() {
  if (document.getElementById('underwater-styles')) return
  const s = document.createElement('style')
  s.id = 'underwater-styles'
  s.textContent = `
    @keyframes lurePulse {
      0%, 100% { opacity: 0.22; }
      50% { opacity: 0.06; }
    }
    .lure-pulse { animation: lurePulse 2.2s ease-in-out infinite; }

    @keyframes orbFloat {
      0%   { transform: translateY(0px) translateX(0px); opacity: 0; }
      10%  { opacity: var(--op, 0.3); }
      90%  { opacity: var(--op, 0.3); }
      100% { transform: translateY(-130vh) translateX(var(--drift, 0px)); opacity: 0; }
    }
  `
  document.head.appendChild(s)
}

// ─── fish SVGs ────────────────────────────────────────────────

// Simple silhouette: oval body + forked tail + dorsal hint + eye
const FISH_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 28" width="70" height="28" aria-hidden="true">',
  '<ellipse cx="42" cy="14" rx="25" ry="9" fill="currentColor"/>',
  '<polygon points="18,14 4,5 4,23" fill="currentColor"/>',
  '<path d="M38,5 Q48,0 55,5" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  '<circle cx="61" cy="11" r="2" fill="rgba(255,255,255,0.5)"/>',
  '</svg>',
].join('')

// Anglerfish: fat body, protruding jaw with teeth, dorsal lure with bioluminescent glow
const ANGLER_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 65" width="100" height="65" style="overflow:visible" aria-hidden="true">',
  '<polygon points="18,40 3,26 3,54" fill="currentColor"/>',
  '<ellipse cx="50" cy="40" rx="33" ry="20" fill="currentColor"/>',
  '<ellipse cx="78" cy="48" rx="10" ry="7" fill="currentColor"/>',
  '<polygon points="70,46 73,55 67,55" fill="rgba(255,255,255,0.42)"/>',
  '<polygon points="76,47 79,56 73,56" fill="rgba(255,255,255,0.42)"/>',
  '<circle cx="73" cy="33" r="3" fill="rgba(255,255,255,0.65)"/>',
  '<path d="M67,20 Q79,5 87,1" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  '<circle cx="87" cy="1" r="9" fill="#55ccff" class="lure-pulse"/>',
  '<circle cx="87" cy="1" r="4.5" fill="#99eeff" opacity="0.78"/>',
  '<circle cx="87" cy="1" r="2" fill="white" opacity="0.96"/>',
  '</svg>',
].join('')

function spawnOrbs(container: HTMLElement) {
  for (let i = 0; i < 40; i++) {
    const orb = document.createElement('div')
    const size = 1.5 + Math.random() * 8
    const blur = 0.4 + Math.random() * 2.5
    const opacity = 0.12 + Math.random() * 0.45
    const duration = 20 + Math.random() * 25
    const delay = -(Math.random() * duration)
    const drift = (Math.random() - 0.5) * 80
    const startX = Math.random() * 100
    const startY = 15 + Math.random() * 100

    orb.style.cssText = [
      'position:fixed',
      `width:${size}px`,
      `height:${size}px`,
      'border-radius:50%',
      `left:${startX}%`,
      `top:${startY}vh`,
      'background:rgba(210,240,255,1)',
      `filter:blur(${blur}px)`,
      'pointer-events:none',
      'will-change:transform,opacity',
      `animation:orbFloat ${duration}s linear ${delay}s infinite`,
    ].join(';')
    orb.style.setProperty('--op', String(opacity))
    orb.style.setProperty('--drift', drift + 'px')

    container.appendChild(orb)
  }
}

function spawnFish(container: HTMLElement, t: number) {
  const isAngler = t > 0.65
  const goRight = Math.random() > 0.3
  const offscreen = isAngler ? 120 : 90

  const y = 60 + Math.random() * (window.innerHeight - 120)
  const speed = isAngler ? 0.4 + Math.random() * 0.7 : 0.9 + Math.random() * 1.8
  const scale = isAngler ? 0.8 + Math.random() * 0.5 : 0.65 + Math.random() * 0.7

  // Anglerfish are more opaque — they carry their own light in the dark
  const opacity = isAngler
    ? 0.38 + Math.random() * 0.18
    : Math.min(0.07 + t * 0.22 + Math.random() * 0.06, 0.35)

  const el = document.createElement('div')
  el.innerHTML = isAngler ? ANGLER_SVG : FISH_SVG
  Object.assign(el.style, {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: '0',
    color: isAngler ? 'rgb(28, 68, 128)' : 'rgb(70,130,200)',
    opacity: String(opacity),
    top: y + 'px',
    left: (goRight ? -offscreen : window.innerWidth + offscreen) + 'px',
    transform: `scaleX(${goRight ? 1 : -1}) scale(${scale})`,
    transformOrigin: 'center center',
    willChange: 'left, top',
  })
  container.appendChild(el)

  let x = goRight ? -offscreen : window.innerWidth + offscreen
  let tick = 0
  const originY = y

  const frame = () => {
    tick++
    x += speed * (goRight ? 1 : -1)
    el.style.left = x + 'px'
    el.style.top = (originY + Math.sin(tick * (isAngler ? 0.02 : 0.04)) * (isAngler ? 3 : 5)) + 'px'

    const done = goRight ? x > window.innerWidth + offscreen : x < -offscreen
    if (!done) requestAnimationFrame(frame)
    else el.remove()
  }

  requestAnimationFrame(frame)
}

// ─── component ────────────────────────────────────────────────

export function Underwater() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ensureStyles()
    if (containerRef.current) spawnOrbs(containerRef.current)

    const computeT = () => {
      const max = document.body.scrollHeight - window.innerHeight
      return max > 0 ? Math.min(window.scrollY / max, 1) : 0
    }

    const rays = document.getElementById('water-rays')

    const applyAll = (t: number) => {
      applyDepth(t)
      if (rays) rays.style.opacity = String(Math.max(0, 0.22 - t * 0.2))
    }

    // Apply depth immediately for non-zero scroll position on mount
    applyAll(computeT())

    let raf = 0
    let prev = -1
    const onScroll = () => {
      const t = computeT()
      if (Math.abs(t - prev) < 0.003) return
      prev = t
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => applyAll(t))
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Staggered fish spawning
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        if (containerRef.current) spawnFish(containerRef.current, computeT())
        schedule()
      }, 1000 + Math.random() * 8000)
    }
    schedule()

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
