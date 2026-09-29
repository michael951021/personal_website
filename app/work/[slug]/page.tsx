import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getProject, getAllProjects } from '@/lib/projects'
import { mdxComponents } from '@/components/mdx'

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

        {/* "Check it out!" — sits right above the divider, below the header */}
        {data.url && (
          <div style={{ marginBottom: '1.5rem' }}>
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="check-out-link"
            >
              Check it out →
            </a>
          </div>
        )}

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--color-muted)', marginBottom: '2.5rem' }} />

        {/* Summary / description */}
        {data.summary && (
          <p
            style={{
              fontSize: '19px',
              lineHeight: 1.75,
              color: 'var(--color-ink)',
              marginBottom: '2rem',
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
                className="tag-pill"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  fontWeight: 600,
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
