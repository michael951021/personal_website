import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getPost, getAllPosts, formatDate } from '@/lib/posts'
import { mdxComponents } from '@/components/mdx'
import { writingComponents } from '@/components/writing'

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const result = getPost(slug)
  if (!result) return {}
  return { title: result.data.title, description: result.data.summary }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const result = getPost(slug)
  if (!result) notFound()
  const { data, content } = result

  return (
    <div style={{ paddingTop: '3.5rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '100%' }}>

        <Link
          href="/writing"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.06em',
            color: 'var(--color-muted)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            marginBottom: '2.5rem',
          }}
        >
          ← Writing
        </Link>

        {/* Fixed light palette for reading; the ocean stays visible around it */}
        <div className="reading-panel">
          <header className="reading-measure" style={{ marginBottom: '2rem' }}>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 400,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                color: 'var(--color-ink)',
                marginBottom: '1rem',
              }}
            >
              {data.title}
            </h1>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem 1.25rem',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
              }}
            >
              <span>{formatDate(data.date)}</span>
              {data.tags?.map(tag => <span key={tag}>· {tag}</span>)}
            </div>
          </header>

          {data.url && (
            <div className="reading-measure" style={{ marginBottom: '1.5rem' }}>
              <a href={data.url} target="_blank" rel="noopener noreferrer" className="check-out-link">
                Check it out →
              </a>
            </div>
          )}

          <hr className="reading-measure" style={{ border: 'none', borderTop: '1px solid var(--color-muted)', marginBottom: '2rem' }} />

          <article>
            <MDXRemote source={content} components={{ ...mdxComponents, ...writingComponents }} />
          </article>
        </div>

      </div>
    </div>
  )
}
