'use client'

import { useState } from 'react'
import Link from 'next/link'
import { spawnBubbles } from '@/components/bubbles'
import { GROUPS, PLACES, type Group, type Place, type Skill } from '@/lib/skills'

// ─── inline fish bullet ───────────────────────────────────────
// Matches the silhouette from underwater.tsx but rendered small as a list marker.

function FishBullet() {
  return (
    <svg className="skill-fish" width="28" height="12" viewBox="0 0 70 28" aria-hidden="true">
      <ellipse cx="42" cy="14" rx="25" ry="9" fill="currentColor" />
      <polygon points="18,14 4,5 4,23" fill="currentColor" />
      <circle cx="61" cy="11" r="2" fill="rgba(255,255,255,0.55)" />
    </svg>
  )
}

// ─── types ────────────────────────────────────────────────────

export interface SkillEntry extends Skill {
  posts: Array<{ title: string; slug: string }>
}

// ─── filter chips ─────────────────────────────────────────────

function Chip({ active, count, onClick, children }: {
  active: boolean
  count: number
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button type="button" className="skill-chip" aria-pressed={active} disabled={!active && count === 0} onClick={onClick}>
      {children}
      <span className="skill-chip-count">{count}</span>
    </button>
  )
}

// ─── one row ──────────────────────────────────────────────────

function SkillRow({ skill, open, place, onToggle, onPlace }: {
  skill: SkillEntry
  open: boolean
  place: Place | null
  onToggle: () => void
  onPlace: (p: Place) => void
}) {
  const id = `skill-${skill.name.replace(/\W+/g, '-').toLowerCase()}`
  const others = (skill.where ?? []).filter(p => p !== place)
  const bubbleFromName = (e: React.MouseEvent<HTMLLIElement>) => {
    const name = e.currentTarget.querySelector<HTMLElement>('.skill-name')
    // Rows are wide targets even when the name is short, so they keep a fuller burst
    if (name) spawnBubbles(name, 5)
  }
  return (
    <li className="skill-row" data-open={open} onMouseEnter={bubbleFromName}>
      <button type="button" className="skill-head" aria-expanded={open} aria-controls={id} onClick={onToggle}>
        <FishBullet />
        <span className="skill-name">{skill.name}</span>
        <span className="skill-where">
          {(skill.where ?? []).map(p => PLACES[p].label).join(' · ')}
        </span>
        <span className="skill-caret" aria-hidden="true">+</span>
      </button>

      <div id={id} className="skill-body" role="region" aria-label={skill.name}>
        <div>
          <p className="skill-note">{skill.note}</p>
          {(others.length > 0 || skill.posts.length > 0) && (
            <div className="skill-links">
              {others.map(p => (
                <button key={p} type="button" className="link-underline skill-link" onClick={() => onPlace(p)}>
                  More from {PLACES[p].label}
                </button>
              ))}
              {skill.posts.map(post => (
                <Link key={post.slug} href={`/writing/${post.slug}`} className="link-underline skill-link">
                  Read: {post.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

// ─── component ────────────────────────────────────────────────

export function SkillList({ skills }: { skills: SkillEntry[] }) {
  const [group, setGroup] = useState<Group | null>(null)
  const [place, setPlace] = useState<Place | null>(null)
  const [open, setOpen] = useState<string | null>(null)

  const inPlace = (s: SkillEntry) => !place || (s.where ?? []).includes(place)
  const inGroup = (s: SkillEntry) => !group || s.group === group
  const shown = skills.filter(s => inPlace(s) && inGroup(s))

  const pickPlace = (p: Place | null) => {
    setPlace(p)
    setGroup(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {/* Filters: area of work, and where it was used. Counts respect the other filter. */}
      <div className="skill-filters">
        <span className="skill-filter-label">Area</span>
        <div className="skill-chips">
          <Chip active={!group} count={skills.filter(inPlace).length} onClick={() => setGroup(null)}>All</Chip>
          {GROUPS.map(g => (
            <Chip key={g} active={group === g} count={skills.filter(s => inPlace(s) && s.group === g).length}
              onClick={() => setGroup(group === g ? null : g)}>
              {g}
            </Chip>
          ))}
        </div>
      </div>
      <div className="skill-filters" style={{ marginBottom: '2.5rem' }}>
        <span className="skill-filter-label">Where</span>
        <div className="skill-chips">
          <Chip active={!place} count={skills.filter(inGroup).length} onClick={() => setPlace(null)}>Anywhere</Chip>
          {(Object.keys(PLACES) as Place[]).map(p => (
            <Chip key={p} active={place === p} count={skills.filter(s => inGroup(s) && (s.where ?? []).includes(p)).length}
              onClick={() => setPlace(place === p ? null : p)}>
              {PLACES[p].label}
            </Chip>
          ))}
        </div>
      </div>

      {place && 'href' in PLACES[place] && (
        <p style={{ fontSize: '15px', color: 'var(--color-muted)', margin: '-1.5rem 0 2rem' }}>
          There&rsquo;s a write-up:{' '}
          <Link href={(PLACES[place] as { href: string }).href} className="link-underline" style={{ color: 'var(--color-ink)' }}>
            {PLACES[place].label}
          </Link>
        </p>
      )}

      {GROUPS.filter(g => shown.some(s => s.group === g)).map(g => (
        <section key={g} style={{ marginBottom: '2.25rem' }}>
          <h2 className="skill-group-title">{g}</h2>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {shown.filter(s => s.group === g).map(s => (
              <SkillRow
                key={s.name}
                skill={s}
                open={open === s.name}
                place={place}
                onToggle={() => setOpen(open === s.name ? null : s.name)}
                onPlace={pickPlace}
              />
            ))}
            <li style={{ borderTop: '1px solid var(--color-muted)' }} />
          </ol>
        </section>
      ))}

      {shown.length === 0 && (
        <p style={{ fontSize: '15px', color: 'var(--color-muted)' }}>Nothing in that combination yet.</p>
      )}
    </div>
  )
}
