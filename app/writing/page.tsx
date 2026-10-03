import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, formatDate } from '@/lib/posts'

export const metadata: Metadata = {
  title: 'Writing',
}

export default function Writing() {
  const posts = getAllPosts()

  return (
    <div style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '680px' }}>

        <div style={{ marginBottom: '3rem' }}>
          <h1 className="page-title">Writing</h1>
          <p style={{ fontSize: '17px', lineHeight: 1.75, color: 'var(--color-ink)', maxWidth: '480px' }}>
            Reports and notes from experiments, with the data behind them.
          </p>
        </div>

        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {posts.map(post => (
            <li key={post.slug} style={{ borderTop: '1px solid var(--color-muted)' }}>
              <Link
                href={`/writing/${post.slug}`}
                style={{ display: 'block', padding: '1.4rem 0', textDecoration: 'none' }}
                className="group"
              >
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '2rem' }}>
                  <span
                    style={{ fontSize: 'var(--text-md)', color: 'var(--color-ink)', letterSpacing: '-0.01em' }}
                    className="group-hover:italic"
                  >
                    {post.title}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-muted)',
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                    }}
                  >
                    {formatDate(post.date)}
                  </span>
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-muted)', margin: '0.35rem 0 0' }}>
                  {post.summary}
                </p>
              </Link>
            </li>
          ))}
          <li style={{ borderTop: '1px solid var(--color-muted)' }} />
        </ol>

      </div>
    </div>
  )
}
