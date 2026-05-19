import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getProject, getAllProjects } from '@/lib/projects'

export async function generateStaticParams() {
  return getAllProjects().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = getProject(slug)
  if (!result) return {}
  return {
    title: result.data.title,
    description: result.data.summary,
  }
}

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      {...props}
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '26px',
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
        fontSize: '20px',
        fontWeight: 400,
        letterSpacing: '-0.01em',
        lineHeight: 1.4,
        marginTop: '2.5rem',
        marginBottom: '0.75rem',
        paddingBottom: '0.4rem',
        borderBottom: '1px solid var(--color-border)',
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
        lineHeight: 1.85,
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
        margin: '1.5rem 0',
        fontStyle: 'italic',
        color: 'var(--color-muted)',
      }}
    />
  ),
  hr: () => (
    <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '2.5rem 0' }} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} style={{ paddingLeft: '1.25rem', margin: '1rem 0' }} />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol {...props} style={{ paddingLeft: '1.25rem', margin: '1rem 0' }} />
  ),
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
    <li {...props} style={{ fontSize: '17px', lineHeight: 1.75, marginBottom: '0.35rem', color: 'var(--color-ink)' }} />
  ),
}

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = getProject(slug)
  if (!result) notFound()

  const { data, content } = result

  return (
    <div style={{ paddingTop: '3.5rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '680px' }}>

        {/* Back link */}
        <Link
          href="/work"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.06em',
            color: 'var(--color-muted)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '2.5rem',
            transition: 'opacity 150ms ease',
          }}
        >
          ← Work
        </Link>

        {/* Header */}
        <header style={{ marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '32px',
              fontWeight: 400,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              color: 'var(--color-ink)',
              marginBottom: '1.25rem',
            }}
          >
            {data.title}
          </h1>

          {/* Meta row */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem 1.5rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
            }}
          >
            <span>{data.year}</span>
            {data.type && <span>·</span>}
            {data.type && <span>{data.type}</span>}
            {data.status && <span>·</span>}
            {data.status && <span>{data.status}</span>}
          </div>
        </header>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', marginBottom: '2.5rem' }} />

        {/* Summary */}
        {data.summary && (
          <p
            style={{
              fontSize: '19px',
              lineHeight: 1.75,
              color: 'var(--color-ink)',
              marginBottom: '2.5rem',
              letterSpacing: '-0.005em',
            }}
          >
            {data.summary}
          </p>
        )}

        {/* Tags */}
        {data.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '3rem' }}>
            {data.tags.map(tag => (
              <span
                key={tag}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted)',
                  border: '1px solid var(--color-border)',
                  padding: '0.25em 0.6em',
                  borderRadius: '1px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Body */}
        <article>
          <MDXRemote source={content} components={mdxComponents} />
        </article>

      </div>
    </div>
  )
}
