'use client'

// Small SVG chart toolkit for writing posts: a responsive frame, axes, a hover tooltip and a palette of
// mid-tone colors that read on both ends of the site's scroll palette (pale blue → deep navy).
import { useEffect, useRef, useState, type ReactNode } from 'react'

export const SERIES = ['#5b8def', '#e8883a', '#2fae94', '#d9aa2b', '#c46fb0', '#8c76e0', '#e0625f', '#7d93ad']

export function useWidth<T extends HTMLElement>(fallback = 640) {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(fallback)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, e.contentRect.width)))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

export function ticks(max: number, n = 4): number[] {
  if (max <= 0) return [0]
  const raw = max / n
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map(x => x * mag).find(x => x >= raw) ?? raw
  const out: number[] = []
  for (let v = 0; v <= max * 1.0001; v += step) out.push(+v.toFixed(6))
  return out
}

export const k = (v: number) =>
  Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : Math.abs(v) >= 1000 ? (v / 1000).toFixed(Math.abs(v) >= 1e5 ? 0 : 1) + 'k' : String(Math.round(v))

export function Figure({ caption, children, controls }: { caption: ReactNode; children: ReactNode; controls?: ReactNode }) {
  return (
    <figure
      style={{
        margin: '2rem 0',
        padding: '1rem 1rem 0.75rem',
        border: '1px solid var(--color-border)',
        borderRadius: '3px',
        background: 'color-mix(in srgb, var(--color-surface) 55%, transparent)',
      }}
    >
      {controls && <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>{controls}</div>}
      {children}
      <figcaption
        style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', lineHeight: 1.6, color: 'var(--color-muted)', marginTop: '0.6rem' }}
      >
        {caption}
      </figcaption>
    </figure>
  )
}

export function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        padding: '0.3em 0.7em',
        borderRadius: '2px',
        cursor: 'pointer',
        border: '1px solid var(--color-border)',
        color: active ? 'var(--color-bg)' : 'var(--color-muted)',
        background: active ? 'var(--color-ink)' : 'transparent',
        transition: 'background 150ms ease, color 150ms ease',
      }}
    >
      {children}
    </button>
  )
}

export function Legend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 1rem', marginTop: '0.5rem' }}>
      {items.map(i => (
        <span key={i.name} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
          <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 2, background: i.color, marginRight: 6 }} />
          {i.name}
        </span>
      ))}
    </div>
  )
}

/** A tooltip box positioned inside the chart frame. */
export function Tip({ x, y, width, children }: { x: number; y: number; width: number; children: ReactNode }) {
  const left = x > width * 0.6 ? undefined : x + 12
  const right = x > width * 0.6 ? width - x + 12 : undefined
  return (
    <div
      role="status"
      style={{
        position: 'absolute',
        top: Math.max(0, y - 10),
        left,
        right,
        pointerEvents: 'none',
        background: 'var(--color-bg)',
        color: 'var(--color-ink)',
        border: '1px solid var(--color-border)',
        borderRadius: '3px',
        padding: '0.45rem 0.6rem',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        lineHeight: 1.55,
        boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
        minWidth: 150,
        zIndex: 2,
      }}
    >
      {children}
    </div>
  )
}

export const axisText = { fill: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: 10 } as const
