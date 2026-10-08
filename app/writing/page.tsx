import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts, formatDate } from '@/lib/posts'
import { ProjectAnimation, type AnimationId } from '@/components/project-animation'

export const metadata: Metadata = {
  title: 'Writing',
}

export default function Writing() {
  const posts = getAllPosts()

  return (
    <div style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      <div>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 className="page-title">Writing</h1>
          <p className="page-lede">
            Reports and notes from experiments, with the data behind them.
          </p>
        </div>

        <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {posts.map(post => (
            <li key={post.slug} className="writing-project" style={{ borderTop: '1px solid var(--color-rule)' }}>
              <Link
                href={`/writing/${post.slug}`}
                style={{ display: 'block', flex: 1, minWidth: 0, padding: '1.4rem 0', textDecoration: 'none' }}
                className="group"
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem 1rem' }}>
                  <span
                    className="writing-title"
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
                <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--color-muted)', margin: '0.4rem 0 0', maxWidth: '36em' }}>
                  {post.summary}
                </p>
              </Link>
              {['local-multi-agent-loop', 'speculative-agent-workloads'].includes(post.slug) && (
                <ProjectAnimation scene={post.slug as AnimationId} compact />
              )}
            </li>
          ))}
          <li style={{ borderTop: '1px solid var(--color-rule)' }} />
        </ol>

      </div>
    </div>
  )
}
