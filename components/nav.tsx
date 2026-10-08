'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/writing', label: 'Writing' },
  { href: '/skills', label: 'Skills' },
  { href: '/about', label: 'About' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <header style={{ paddingTop: '2rem', paddingBottom: '1rem' }}>
      <nav
        className="flex items-baseline justify-between"
        aria-label="Site navigation"
      >
        <Link
          href="/"
          className="transition-opacity duration-150 hover:opacity-55"
          style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--color-ink)' }}
        >
          {"Home"}
        </Link>

        <div className="flex gap-6 sm:gap-8">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className="transition-opacity duration-150 hover:opacity-55"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  letterSpacing: '0.06em',
                  opacity: active ? 1 : 0.7,
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
