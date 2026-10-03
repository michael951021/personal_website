import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/posts'
import { SKILLS } from '@/lib/skills'
import { SkillList, type SkillEntry } from '@/components/skill-list'

export const metadata: Metadata = {
  title: 'Skills',
}

export default function Skills() {
  const posts = getAllPosts()

  // Link each skill to the posts tagged with its name or one of its aliases
  const norm = (s: string) => s.toLowerCase()
  const skills: SkillEntry[] = SKILLS.map(skill => {
    const names = new Set([skill.name, ...(skill.aliases ?? [])].map(norm))
    return {
      ...skill,
      posts: posts
        .filter(p => p.tags?.some(t => names.has(norm(t))))
        .map(p => ({ title: p.title, slug: p.slug })),
    }
  })

  return (
    <div style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '720px' }}>

        {/* Heading */}
        <h1 className="page-title">Skills</h1>

        <p
          style={{
            fontSize:     '17px',
            lineHeight:   1.75,
            color:        'var(--color-ink)',
            marginBottom: '2rem',
            maxWidth:     '520px',
          }}
        >
          What I&rsquo;ve worked with, mostly on the ML side. Filter by area or by where I used it, and open a row to
          see what I actually did with it.
        </p>

        <SkillList skills={skills} />

      </div>
    </div>
  )
}
