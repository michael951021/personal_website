// Article typography for MDX bodies (work write-ups and writing): every element uses the design tokens,
// so articles follow the site's scroll-depth palette.
export const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      {...props}
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'var(--text-lg)',
        fontWeight: 400,
        letterSpacing: '-0.015em',
        lineHeight: 1.3,
        marginTop: '3rem',
        marginBottom: '1rem',
        color: 'var(--color-ink)',
      }}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'var(--text-md)',
        fontWeight: 400,
        letterSpacing: '-0.01em',
        lineHeight: 1.4,
        marginTop: '2.5rem',
        marginBottom: '0.75rem',
        paddingBottom: '0.4rem',
        borderBottom: '1px solid var(--color-muted)',
        color: 'var(--color-ink)',
      }}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      {...props}
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '17px',
        fontWeight: 500,
        marginTop: '2rem',
        marginBottom: '0.5rem',
        color: 'var(--color-ink)',
      }}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      {...props}
      style={{
        fontSize: '17px',
        lineHeight: 1.65,
        marginTop: '1.1rem',
        marginBottom: '1.1rem',
        color: 'var(--color-ink)',
      }}
    />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      style={{
        color: 'var(--color-ink)',
        textDecoration: 'underline',
        textUnderlineOffset: '3px',
        textDecorationColor: 'var(--color-border)',
        transition: 'text-decoration-color 150ms ease',
      }}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      {...props}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13.5px',
        overflowWrap: 'anywhere',
        backgroundColor: 'var(--color-surface)',
        padding: '0.15em 0.4em',
        borderRadius: '2px',
        color: 'var(--color-ink)',
      }}
    />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...props}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        lineHeight: 1.7,
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '2px',
        padding: '1.25rem 1.5rem',
        overflowX: 'auto',
        marginTop: '1.5rem',
        marginBottom: '1.5rem',
        color: 'var(--color-ink)',
      }}
    />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      style={{
        borderLeft: '2px solid var(--color-border)',
        paddingLeft: '1.25rem',
        marginTop: '1.5rem',
        marginBottom: '1.5rem',
        fontStyle: 'italic',
        color: 'var(--color-muted)',
      }}
    />
  ),
  hr: () => (
    <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '2.5rem 0' }} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} style={{ listStyle: 'disc', paddingLeft: '1.25rem', marginTop: '1rem', marginBottom: '1rem' }} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol {...props} style={{ listStyle: 'decimal', paddingLeft: '1.25rem', marginTop: '1rem', marginBottom: '1rem' }} />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li {...props} style={{ fontSize: '17px', lineHeight: 1.65, marginBottom: '0.35rem', color: 'var(--color-ink)' }} />
  ),
}
