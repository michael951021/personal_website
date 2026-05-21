import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const contentDir = path.join(process.cwd(), 'content/work')

export interface Project {
  slug: string
  title: string
  year: string
  type: string
  status: string
  summary: string
  tags: string[]
  url?: string
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(contentDir)) return []
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.mdx'))
  return files
    .map(file => {
      const slug = file.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(contentDir, file), 'utf8')
      const { data } = matter(raw)
      return { slug, ...data } as Project
    })
    .sort((a, b) => Number(b.year) - Number(a.year))
}

export function getProject(slug: string): { data: Project; content: string } | null {
  const file = path.join(contentDir, `${slug}.mdx`)
  if (!fs.existsSync(file)) return null
  const raw = fs.readFileSync(file, 'utf8')
  const { data, content } = matter(raw)
  return { data: { slug, ...data } as Project, content }
}
