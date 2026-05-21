import type { Metadata } from 'next'
import { getAllProjects } from '@/lib/projects'
import { SkillList, type SkillEntry } from '@/components/skill-list'

export const metadata: Metadata = {
  title: 'Skills',
}

export default function Skills() {
  const projects = getAllProjects()

  // Build a map: tag → list of projects that use it
  const tagMap = new Map<string, Array<{ title: string; slug: string }>>()
  for (const project of projects) {
    for (const tag of project.tags ?? []) {
      if (!tagMap.has(tag)) tagMap.set(tag, [])
      tagMap.get(tag)!.push({ title: project.title, slug: project.slug })
    }
  }

  // Sort alphabetically
  const skills: SkillEntry[] = Array.from(tagMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tag, projs]) => ({ tag, projects: projs }))

  return (
    <div style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
      <div style={{ maxWidth: '720px' }}>

        {/* Heading */}
        <h1
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '11px',
            fontWeight:    400,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color:         'var(--color-muted)',
            marginBottom:  '0.5rem',
          }}
        >
          Skills
        </h1>

        <p
          style={{
            fontSize:     '17px',
            lineHeight:   1.75,
            color:        'var(--color-ink)',
            marginBottom: '3rem',
            maxWidth:     '480px',
          }}
        >
          Technologies I've used across my work, sorted alphabetically.
        </p>

        <SkillList skills={skills} />

      </div>
    </div>
  )
}
