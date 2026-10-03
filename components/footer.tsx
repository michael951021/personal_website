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
          fontSize: 'var(--text-xs)',
          letterSpacing: '0.06em',
          color: 'var(--color-muted)',
        }}
      >
        <span>{new Date().getFullYear()}</span>
        <a
          href={`mailto:${site.email}`}
          className="transition-opacity duration-150 hover:opacity-55"
        >
          {site.email}
        </a>
      </div>
    </footer>
  )
}
