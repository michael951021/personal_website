'use client'

import { useEffect, useRef } from 'react'

// ─── color interpolation ──────────────────────────────────────

const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t)

const PALETTE: Record<string, { s: [number, number, number]; e: [number, number, number] }> = {
  'color-bg': { s: [199, 222, 240], e: [7, 16, 36] },
  'color-ink': { s: [32, 44, 58], e: [208, 228, 250] },
  'color-muted': { s: [116, 136, 154], e: [120, 180, 245] },
  'color-border': { s: [214, 226, 235], e: [16, 40, 75] },
  'color-surface': { s: [226, 235, 242], e: [10, 24, 48] },
}

function applyDepth(t: number) {
  const root = document.documentElement

  // Shared helpers reused by ink / muted / border branches
  const bgS = PALETTE['color-bg'].s
  const bgE = PALETTE['color-bg'].e
  const avgBg = (lerp(bgS[0], bgE[0], t) + lerp(bgS[1], bgE[1], t) + lerp(bgS[2], bgE[2], t)) / 3
  // "Sticky" interpolation factor — plateaus in the mid-range so each mode's
  // colours stay close to their endpoint values for maximum readability.
  const temp = t < 0.2 ? t : t < 0.6 ? 0.2 : t < 0.8 ? 0.2 + (t - 0.6) * 1.5 : 1
  const lightMode = avgBg > 128

  for (const [k, { s, e }] of Object.entries(PALETTE)) {

    // ── ink: near-black on light bg / near-white on dark bg ─────────────
    if (k === 'color-ink') {
      const ink_delta = 20
      if (lightMode) {
        root.style.setProperty(`--${k}`,
          `rgb(${lerp(s[0], s[0] + ink_delta, temp)},${lerp(s[1], s[1] + ink_delta, temp)},${lerp(s[2], s[2] + ink_delta, temp)})`)
      } else {
        root.style.setProperty(`--${k}`,
          `rgb(${lerp(e[0], e[0] - ink_delta, temp)},${lerp(e[1], e[1] - ink_delta, temp)},${lerp(e[2], e[2] + ink_delta, temp)})`)
      }
      continue
    }

    // ── muted: contrast-guaranteed, CSS-transitioned ────────────────────────
    // Within each mode the value is driven directly from avgBg so it always
    // has readable contrast against the current background:
    //   light mode: lerp floor[32,44,56] → s  as avgBg rises 128→220
    //   dark  mode: lerp e               → ceil[220,232,244] as avgBg rises 20→128
    // The 250ms CSS @property transition (globals.css) cross-fades the jump
    // at the avgBg=128 threshold so it fades instead of snapping.
    if (k === 'color-muted') {
      const floor: [number, number, number] = [32, 44, 56]    // dark — 3.4:1 at threshold bg
      const ceil:  [number, number, number] = [220, 232, 244] // light — 3.3:1 at threshold bg
      if (lightMode) {
        // tScale 0 at avgBg=128 (threshold) → 1 at avgBg≈220 (page top)
        const tScale = Math.max(0, Math.min(1, (avgBg - 128) / (220 - 128)))
        root.style.setProperty(`--${k}`,
          `rgb(${lerp(floor[0], s[0], tScale)},${lerp(floor[1], s[1], tScale)},${lerp(floor[2], s[2], tScale)})`)
      } else {
        // tScale 1 at avgBg=128 (threshold) → 0 at avgBg≈20 (page bottom)
        const tScale = Math.max(0, Math.min(1, (avgBg - 20) / (128 - 20)))
        root.style.setProperty(`--${k}`,
          `rgb(${lerp(e[0], ceil[0], tScale)},${lerp(e[1], ceil[1], tScale)},${lerp(e[2], ceil[2], tScale)})`)
      }
      continue
    }

    // ── everything else (bg, border, surface): simple linear interpolation
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

    @keyframes coralSway {
      0%, 100% { transform: rotate(calc(var(--sway, 2deg) * -1)); }
      50%      { transform: rotate(var(--sway, 2deg)); }
    }
    .coral-sway { transform-origin: 50% 100%; animation: coralSway var(--dur, 7s) ease-in-out var(--delay, 0s) infinite; }
    @media (max-width: 760px) { .coral-bed { display: none; } }
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

// x is a fraction of the side margin (0 = screen edge); mirrored on the right-hand bed.
interface CoralSpec { svg: string; x: number; scale: number; sway: number }

const SHALLOW_BED: CoralSpec[] = [
  { svg: KELP_SVG, x: 0.08, scale: 1.1, sway: 4 },
  { svg: STAGHORN_SVG, x: 0.3, scale: 0.95, sway: 1.5 },
  { svg: SEA_FAN_SVG, x: 0.62, scale: 0.75, sway: 2.5 },
  { svg: KELP_SVG, x: 0.85, scale: 0.8, sway: 5 },
]

const DEEP_BED: CoralSpec[] = [
  { svg: SOFT_CORAL_SVG, x: 0.1, scale: 1, sway: 2 },
  { svg: BRAIN_CORAL_SVG, x: 0.38, scale: 0.85, sway: 0 },
  { svg: TUBE_WORMS_SVG, x: 0.7, scale: 0.9, sway: 1 },
]

interface CoralBeds { shallow: HTMLElement; deep: HTMLElement }

function spawnCoral(container: HTMLElement): CoralBeds {
  // Beds sit in the side margins outside the 960px content column
  const margin = Math.max(110, (window.innerWidth - 960) / 2)

  const makeBed = (specs: CoralSpec[], color: string, opacity: number) => {
    const bed = document.createElement('div')
    bed.className = 'coral-bed'
    bed.style.cssText = `position:fixed;inset:0;pointer-events:none;opacity:0;transition:opacity 600ms ease;color:${color};`
    for (const side of ['left', 'right'] as const) {
      specs.forEach((spec, i) => {
        const outer = document.createElement('div')
        outer.style.cssText = `position:fixed;bottom:-6px;${side}:${spec.x * (margin - 60)}px;` +
          `transform:scale(${spec.scale}) scaleX(${side === 'right' ? -1 : 1});transform-origin:50% 100%;opacity:${opacity};`
        const inner = document.createElement('div')
        inner.className = 'coral-sway'
        inner.style.setProperty('--sway', spec.sway + 'deg')
        inner.style.setProperty('--dur', 6 + ((i * 1.7) % 4) + 's')
        inner.style.setProperty('--delay', -(i * 1.3 + (side === 'right' ? 2 : 0)) + 's')
        inner.innerHTML = spec.svg
        outer.appendChild(inner)
        bed.appendChild(outer)
      })
    }
    container.appendChild(bed)
    return bed
  }

  return {
    shallow: makeBed(SHALLOW_BED, 'rgb(70,130,200)', 0.22),
    deep: makeBed(DEEP_BED, 'rgb(28,68,128)', 0.7),
  }
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

function spawnFish(container: HTMLElement, t: number) {
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

    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        if (containerRef.current) spawnFish(containerRef.current, computeT())
        schedule()
      }, 700 + Math.random() * 2200)
    }
    schedule()

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      clearTimeout(timer)
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
