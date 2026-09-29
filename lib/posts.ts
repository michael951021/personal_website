import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDir = path.join(process.cwd(), 'content/writing')

export interface Post {
  slug: string
  title: string
  date: string // YYYY-MM-DD
  summary: string
  tags: string[]
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(contentDir)) return []
  return fs
    .readdirSync(contentDir)
    .filter(f => f.endsWith('.mdx'))
    .map(file => {
      const raw = fs.readFileSync(path.join(contentDir, file), 'utf8')
      const { data } = matter(raw)
      return { slug: file.replace('.mdx', ''), ...data } as Post
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getPost(slug: string): { data: Post; content: string } | null {
  const file = path.join(contentDir, `${slug}.mdx`)
  if (!fs.existsSync(file)) return null
  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  return { data: { slug, ...data } as Post, content }
}

export function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
