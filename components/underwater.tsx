'use client'

import { useEffect, useRef } from 'react'

// ─── color interpolation ──────────────────────────────────────

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t)

const PALETTE: Record<string, { s: [number, number, number]; e: [number, number, number] }> = {
  'color-bg': { s: [199, 222, 240], e: [7, 16, 36] },
  'color-ink': { s: [26, 36, 48], e: [208, 228, 250] },
  'color-muted': { s: [70, 88, 106], e: [130, 186, 248] },
  'color-border': { s: [214, 226, 235], e: [16, 40, 75] },
  'color-surface': { s: [226, 235, 242], e: [10, 24, 48] },
}

// WCAG relative luminance of an sRGB colour
function luminance([r, g, b]: [number, number, number]) {
  const f = (v: number) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

// Text endpoints. Ink and muted both run toward near-black / near-white as the background approaches the
// mid-tone where the light/dark switch happens, so muted text holds ≥4.5:1 over ~97% of the scroll
// (the dip at the switch itself is ~4.3:1; even pure black only reaches ~4.6:1 there).
const TEXT = {
  inkTop: [26, 36, 48], mutedTop: [70, 88, 106], nearBlack: [0, 4, 10],
  inkBottom: [208, 228, 250], mutedBottom: [130, 186, 248], nearWhite: [244, 248, 253],
} as const
const SWITCH_AVG = 120 // average channel value of the background at the switch
const mix = (a: readonly number[], b: readonly number[], u: number) =>
  `rgb(${lerp(a[0], b[0], u)},${lerp(a[1], b[1], u)},${lerp(a[2], b[2], u)})`

function applyDepth(t: number) {
  const root = document.documentElement

  const bgS = PALETTE['color-bg'].s
  const bgE = PALETTE['color-bg'].e
  const bg: [number, number, number] = [lerp(bgS[0], bgE[0], t), lerp(bgS[1], bgE[1], t), lerp(bgS[2], bgE[2], t)]
  const avgBg = (bg[0] + bg[1] + bg[2]) / 3
  // Dark text while it out-contrasts white text on this background
  const L = luminance(bg)
  const lightMode = (L + 0.05) / 0.05 >= 1.05 / (L + 0.05)

  if (lightMode) {
    // u: 0 at the switch → 1 at the page top
    const u = Math.max(0, Math.min(1, (avgBg - SWITCH_AVG) / (220 - SWITCH_AVG)))
    root.style.setProperty('--color-ink', mix(TEXT.nearBlack, TEXT.inkTop, u))
    root.style.setProperty('--color-muted', mix(TEXT.nearBlack, TEXT.mutedTop, u))
  } else {
    // u: 1 at the switch → 0 at the page bottom
    const u = Math.max(0, Math.min(1, (avgBg - 20) / (SWITCH_AVG - 20)))
    root.style.setProperty('--color-ink', mix(TEXT.inkBottom, TEXT.nearWhite, u))
    root.style.setProperty('--color-muted', mix(TEXT.mutedBottom, TEXT.nearWhite, u))
  }

  // Background, border and surface: simple linear interpolation
  for (const k of ['color-bg', 'color-border', 'color-surface']) {
    const { s, e } = PALETTE[k]
    root.style.setProperty(`--${k}`, `rgb(${lerp(s[0], e[0], t)},${lerp(s[1], e[1], t)},${lerp(s[2], e[2], t)})`)
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

    @keyframes coralSway {
      0%, 100% { transform: rotate(calc(var(--sway, 2deg) * -1)); }
      50%      { transform: rotate(var(--sway, 2deg)); }
    }
    .coral-sway { transform-origin: 50% 100%; animation: coralSway var(--dur, 7s) ease-in-out var(--delay, 0s) infinite; }
    @media (prefers-reduced-motion: reduce) { .coral-sway { animation: none; } }

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

const FISH_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 28" width="70" height="28" aria-hidden="true">',
  '<ellipse cx="42" cy="14" rx="25" ry="9" fill="currentColor"/>',
  '<polygon points="18,14 4,5 4,23" fill="currentColor"/>',
  '<path d="M38,5 Q48,0 55,5" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  '<circle cx="61" cy="11" r="2" fill="rgba(255,255,255,0.5)"/>',
  '</svg>',
].join('')

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

// ─── coral SVGs ───────────────────────────────────────────────
// Same flat-silhouette style as the fish: currentColor shapes with faint white accents.
// Shallow beds are fish-blue; deep beds are angler-navy with lure-coloured glow.

const STAGHORN_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140" aria-hidden="true">',
  '<path d="M60,140 L60,92 M60,108 L38,72 L30,42 M38,72 L50,50 M60,92 L80,60 L74,30 M80,60 L98,42 M60,92 L58,62"',
  ' stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
  '<circle cx="30" cy="42" r="2" fill="rgba(255,255,255,0.45)"/>',
  '<circle cx="74" cy="30" r="2" fill="rgba(255,255,255,0.45)"/>',
  '<circle cx="98" cy="42" r="2" fill="rgba(255,255,255,0.45)"/>',
  '</svg>',
].join('')

const SEA_FAN_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 130" width="110" height="130" aria-hidden="true">',
  '<path d="M10,62 A45,45 0 0 1 100,62 L57,112 Z" fill="currentColor" opacity="0.8"/>',
  '<path d="M57,112 L18,40 M57,112 L36,22 M57,112 L57,17 M57,112 L78,22 M57,112 L94,40"',
  ' stroke="rgba(255,255,255,0.22)" stroke-width="1.5" fill="none"/>',
  '<path d="M57,130 L57,108" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
  '</svg>',
].join('')

const KELP_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 200" width="50" height="200" aria-hidden="true">',
  '<path d="M25,200 Q12,160 25,120 Q38,80 25,40 Q18,20 24,4" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/>',
  '<ellipse cx="14" cy="150" rx="10" ry="4" transform="rotate(-30 14 150)" fill="currentColor"/>',
  '<ellipse cx="36" cy="105" rx="10" ry="4" transform="rotate(30 36 105)" fill="currentColor"/>',
  '<ellipse cx="15" cy="62" rx="9" ry="3.5" transform="rotate(-30 15 62)" fill="currentColor"/>',
  '<ellipse cx="33" cy="24" rx="8" ry="3" transform="rotate(30 33 24)" fill="currentColor"/>',
  '</svg>',
].join('')

const TUBE_WORMS_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 130" width="100" height="130" style="overflow:visible" aria-hidden="true">',
  '<rect x="16" y="50" width="12" height="80" rx="6" fill="currentColor"/>',
  '<rect x="40" y="22" width="13" height="108" rx="6.5" fill="currentColor"/>',
  '<rect x="66" y="64" width="11" height="66" rx="5.5" fill="currentColor"/>',
  '<circle cx="22" cy="50" r="7" fill="#55ccff" class="lure-pulse"/>',
  '<circle cx="46.5" cy="22" r="8" fill="#55ccff" class="lure-pulse" style="animation-delay:-0.8s"/>',
  '<circle cx="71.5" cy="64" r="6.5" fill="#55ccff" class="lure-pulse" style="animation-delay:-1.5s"/>',
  '<circle cx="22" cy="50" r="2.5" fill="#99eeff" opacity="0.8"/>',
  '<circle cx="46.5" cy="22" r="3" fill="#99eeff" opacity="0.8"/>',
  '<circle cx="71.5" cy="64" r="2.5" fill="#99eeff" opacity="0.8"/>',
  '</svg>',
].join('')

const BRAIN_CORAL_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70" width="120" height="70" aria-hidden="true">',
  '<path d="M4,70 Q4,8 60,8 Q116,8 116,70 Z" fill="currentColor"/>',
  '<path d="M22,58 Q30,34 44,44 Q56,54 62,32 Q70,14 84,30 Q96,44 100,58"',
  ' stroke="rgba(255,255,255,0.16)" stroke-width="2" fill="none" stroke-linecap="round"/>',
  '<path d="M32,64 Q40,50 52,58 Q64,66 72,48 Q80,36 92,62"',
  ' stroke="rgba(255,255,255,0.12)" stroke-width="2" fill="none" stroke-linecap="round"/>',
  '</svg>',
].join('')

const SOFT_CORAL_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 150" width="90" height="150" style="overflow:visible" aria-hidden="true">',
  '<path d="M45,150 Q44,110 45,90 Q30,70 22,40 M45,90 Q60,66 68,30 M45,104 Q42,70 46,22"',
  ' stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/>',
  '<circle cx="22" cy="40" r="5" fill="#55ccff" opacity="0.35"/>',
  '<circle cx="68" cy="30" r="5" fill="#55ccff" opacity="0.35"/>',
  '<circle cx="46" cy="22" r="6" fill="#55ccff" class="lure-pulse"/>',
  '</svg>',
].join('')

interface CoralSpec { svg: string; scale: number; sway: number }

const SHALLOW_BED: CoralSpec[] = [
  { svg: KELP_SVG, scale: 1.05, sway: 4 },
  { svg: STAGHORN_SVG, scale: 0.9, sway: 1.5 },
  { svg: SEA_FAN_SVG, scale: 0.75, sway: 2.5 },
  { svg: KELP_SVG, scale: 0.8, sway: 5 },
  { svg: STAGHORN_SVG, scale: 0.7, sway: 2 },
]

const DEEP_BED: CoralSpec[] = [
  { svg: SOFT_CORAL_SVG, scale: 0.95, sway: 2 },
  { svg: BRAIN_CORAL_SVG, scale: 0.8, sway: 0 },
  { svg: TUBE_WORMS_SVG, scale: 0.85, sway: 1 },
]

// Average gap between coral along the bottom edge; jittered so it doesn't read as a grid
const CORAL_SPACING = 200

interface CoralBeds { shallow: HTMLElement; deep: HTMLElement; relayout: () => void }

function spawnCoral(container: HTMLElement): CoralBeds {
  const makeBed = (color: string) => {
    const bed = document.createElement('div')
    bed.style.cssText = `position:fixed;inset:0;pointer-events:none;opacity:0;transition:opacity 600ms ease;color:${color};`
    container.appendChild(bed)
    return bed
  }

  // Spread one coral per slot across the full width, cycling through the bed's specs
  const fill = (bed: HTMLElement, specs: CoralSpec[], opacity: number) => {
    bed.replaceChildren()
    const slots = Math.max(2, Math.round(window.innerWidth / CORAL_SPACING))
    const step = window.innerWidth / slots
    const first = Math.floor(Math.random() * specs.length)
    for (let i = 0; i < slots; i++) {
      const spec = specs[(first + i) % specs.length]
      const x = step * (i + 0.5) + (Math.random() - 0.5) * step * 0.4
      const scale = spec.scale * (0.85 + Math.random() * 0.25)
      const flip = Math.random() < 0.5 ? -1 : 1
      const outer = document.createElement('div')
      outer.style.cssText = `position:fixed;bottom:-6px;left:${x}px;opacity:${opacity};transform-origin:50% 100%;` +
        `transform:translateX(-50%) scale(${scale}) scaleX(${flip});`
      const inner = document.createElement('div')
      inner.className = 'coral-sway'
      inner.style.setProperty('--sway', spec.sway + 'deg')
      inner.style.setProperty('--dur', 6 + Math.random() * 4 + 's')
      inner.style.setProperty('--delay', -Math.random() * 8 + 's')
      inner.innerHTML = spec.svg
      outer.appendChild(inner)
      bed.appendChild(outer)
    }
  }

  const shallow = makeBed('rgb(70,130,200)')
  const deep = makeBed('rgb(28,68,128)')
  const relayout = () => {
    fill(shallow, SHALLOW_BED, 0.2)
    fill(deep, DEEP_BED, 0.65)
  }
  relayout()
  return { shallow, deep, relayout }
}

const smoothstep = (a: number, b: number, x: number) => {
  const u = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return u * u * (3 - 2 * u)
}

// ─── orbs ─────────────────────────────────────────────────────

interface OrbRef { el: HTMLElement; rate: number }

function spawnOrbs(container: HTMLElement): OrbRef[] {
  const refs: OrbRef[] = []
  for (let i = 0; i < 40; i++) {
    const size = 1.5 + Math.random() * 8
    const blur = 0.4 + Math.random() * 2.5
    const opacity = 0.12 + Math.random() * 0.45
    const duration = 20 + Math.random() * 25
    const delay = -(Math.random() * duration)
    const drift = (Math.random() - 0.5) * 80
    const startX = Math.random() * 100
    const startY = 15 + Math.random() * 100
    // Larger orbs are closer → stronger parallax shift on scroll
    const rate = 0.08 + (size / 9.5) * 0.85

    // Outer wrapper: position:fixed anchor; receives scroll-driven translateY
    const outer = document.createElement('div')
    outer.style.cssText = `position:fixed;left:${startX}%;top:${startY}vh;pointer-events:none;will-change:transform;`

    // Inner: the actual particle with the looping float animation
    const inner = document.createElement('div')
    inner.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      'border-radius:50%',
      'background:rgba(210,240,255,1)',
      `filter:blur(${blur}px)`,
      'pointer-events:none',
      'will-change:transform,opacity',
      `animation:orbFloat ${duration}s linear ${delay}s infinite`,
    ].join(';')
    inner.style.setProperty('--op', String(opacity))
    inner.style.setProperty('--drift', drift + 'px')

    outer.appendChild(inner)
    container.appendChild(outer)
    refs.push({ el: outer, rate })
  }
  return refs
}

// ─── fish ─────────────────────────────────────────────────────

// Safety cap on fish in the water at once
const MAX_FISH = 14

function spawnFish(container: HTMLElement, t: number) {
  if (container.querySelectorAll('.fish').length >= MAX_FISH) return
  // Anglerfish only appear in deep water; normal fish appear at all depths
  const isAngler = t > 0.65 && Math.random() < 0.35
  const goRight = Math.random() > 0.3
  const offscreen = isAngler ? 120 : 90

  // depth: 0 = far (slow parallax, small), 1 = near (fast parallax, large)
  const depth = isAngler
    ? 0.1 + Math.random() * 0.5   // anglerfish lurk at mid-distance
    : 0.15 + Math.random() * 0.85 // regular fish span the full depth range

  // How much of the scroll the fish inherits as upward drift
  const parallaxRate = 0.08 + depth * 0.72  // 0.19 (far) → 0.80 (near)

  const y = 60 + Math.random() * (window.innerHeight - 120)
  const speed = isAngler ? 0.4 + Math.random() * 0.7 : 0.9 + Math.random() * 1.8

  // Scale tied to depth: close fish loom large, distant fish are tiny silhouettes
  const scale = isAngler
    ? 0.5 + depth * 0.7    // 0.57–0.85 (ANGLER_SVG is 100×65, inherently large)
    : 0.3 + depth * 1.15   // 0.47–1.45 (FISH_SVG is 70×28)

  const baseOpacity = isAngler
    ? 0.38 + Math.random() * 0.18
    : Math.min(0.07 + t * 0.22 + Math.random() * 0.06, 0.35)

  const el = document.createElement('div')
  el.innerHTML = isAngler ? ANGLER_SVG : FISH_SVG
  Object.assign(el.style, {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: '0',
    color: isAngler ? 'rgb(28, 68, 128)' : 'rgb(70,130,200)',
    opacity: String(baseOpacity),
    top: y + 'px',
    left: (goRight ? -offscreen : window.innerWidth + offscreen) + 'px',
    transform: `scaleX(${goRight ? 1 : -1}) scale(${scale})`,
    transformOrigin: 'center center',
    willChange: 'left, top',
  })
  el.className = 'fish'
  container.appendChild(el)

  let x = goRight ? -offscreen : window.innerWidth + offscreen
  let tick = 0
  const originY = y
  const spawnScrollY = window.scrollY

  const frame = () => {
    tick++
    x += speed * (goRight ? 1 : -1)

    // Camera-moves-down illusion: closer fish drift up faster as you scroll
    const scrollOffset = (window.scrollY - spawnScrollY) * parallaxRate
    el.style.left = x + 'px'
    el.style.top = (originY + Math.sin(tick * (isAngler ? 0.02 : 0.04)) * (isAngler ? 3 : 5) - scrollOffset) + 'px'

    // Anglerfish fade out in bright water (bg avg > 128 = shallow)
    if (isAngler) {
      const max = document.body.scrollHeight - window.innerHeight
      const currentT = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      const { s: bgS, e: bgE } = PALETTE['color-bg']
      const avgBg = (lerp(bgS[0], bgE[0], currentT) + lerp(bgS[1], bgE[1], currentT) + lerp(bgS[2], bgE[2], currentT)) / 3
      const fadeMult = avgBg > 45 ? Math.max(0, 1 - (avgBg - 45) / 40) : 1
      el.style.opacity = String(baseOpacity * fadeMult)
    }

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

    let orbRefs: OrbRef[] = []
    let coral: CoralBeds | null = null
    if (containerRef.current) {
      coral = spawnCoral(containerRef.current)
      orbRefs = spawnOrbs(containerRef.current)
    }

    const computeT = () => {
      const max = document.body.scrollHeight - window.innerHeight
      return max > 0 ? Math.min(window.scrollY / max, 1) : 0
    }

    const rays = document.getElementById('water-rays')

    const updateOrbs = () => {
      // Use scroll fraction × bounded max so orbs stay visible on long pages.
      // Raw pixel accumulation pushed all orbs off-screen on /work/* pages.
      const t = computeT()
      for (const { el, rate } of orbRefs) {
        el.style.transform = `translateY(${-t * window.innerHeight * 0.45 * rate}px)`
      }
    }

    const applyAll = (t: number) => {
      applyDepth(t)
      if (rays) rays.style.opacity = String(Math.max(0, 0.22 - t * 0.2))
      // Shallow coral gives way to the deep bed as the water darkens
      if (coral) {
        coral.shallow.style.opacity = String(1 - smoothstep(0.35, 0.6, t))
        coral.deep.style.opacity = String(smoothstep(0.5, 0.8, t))
      }
    }

    applyAll(computeT())
    updateOrbs()

    let raf = 0
    let prev = -1
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const t = computeT()
        // Colour interpolation only needs to fire on meaningful depth change
        if (Math.abs(t - prev) >= 0.003) {
          applyAll(t)
          prev = t
        }
        // Orb parallax must track every scroll pixel for a smooth camera feel
        updateOrbs()
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    let lastWidth = window.innerWidth
    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (window.innerWidth === lastWidth) return
        lastWidth = window.innerWidth
        coral?.relayout()
      }, 200)
    }
    window.addEventListener('resize', onResize)

    // Timers keep firing in a hidden tab but animation frames pause, so fish would pile up at the edge and
    // swim in as a horde on return. Spawning stops while the tab is hidden and resumes when it's visible.
    let timer: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      timer = setTimeout(() => {
        if (containerRef.current) spawnFish(containerRef.current, computeT())
        schedule()
      }, 700 + Math.random() * 2200)
    }
    const onVisibility = () => {
      clearTimeout(timer)
      if (!document.hidden) schedule()
    }
    document.addEventListener('visibilitychange', onVisibility)
    if (!document.hidden) schedule()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      coral?.shallow.remove()
      coral?.deep.remove()
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
