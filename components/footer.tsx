import { site } from '@/lib/config'

export function Footer() {
  return (
    <footer
      style={{
        paddingTop: '2.5rem',
        paddingBottom: '2rem',
        borderTop: '1px solid var(--color-muted)',
        marginTop: '4rem',
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.06em',
          color: 'var(--color-muted)',
        }}
      >
        <span>{new Date().getFullYear()}</span>
        <span className="flex gap-6">
          <a href={site.github} className="transition-opacity duration-150 hover:opacity-55">
            GitHub
          </a>
          <a
            href={`mailto:${site.email}`}
            className="transition-opacity duration-150 hover:opacity-55"
          >
            {site.email}
          </a>
        </span>
      </div>
    </footer>
  )
}
