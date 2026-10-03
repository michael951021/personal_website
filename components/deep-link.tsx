'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// Glows into view only in deep water (bottom of the page), the way the anglerfish do.
// If the page can't scroll there's no "deep", so it just shows.
export function DeepLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [glow, setGlow] = useState(0)

  useEffect(() => {
    const update = () => {
      const max = document.body.scrollHeight - window.innerHeight
      const t = max > 0 ? Math.min(window.scrollY / max, 1) : 1
      setGlow(Math.max(0, Math.min(1, (t - 0.6) / 0.3)))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <Link
      href={href}
      className="deep-link"
      style={{ '--glow': glow } as React.CSSProperties}
      aria-hidden={glow === 0 ? true : undefined}
      tabIndex={glow === 0 ? -1 : undefined}
    >
      {children}
    </Link>
  )
}
