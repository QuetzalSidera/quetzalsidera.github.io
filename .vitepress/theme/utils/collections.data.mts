import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const cwd = process.cwd()

interface CollectionData {
  title: string
  slug: string
  href: string
  create: number
  update: number
  cover?: string
  description?: string
  tags?: string[]
}

const cache: Map<string, { timestamp: number; collection: CollectionData }> = new Map()

function parseDate(value: unknown, fallback: number) {
  if (!value) {
    return fallback
  }

  const timestamp = new Date(String(value)).getTime()
  return Number.isNaN(timestamp) ? fallback : timestamp
}

function getCollection(file: string, collectionDir: string): CollectionData {
  const fullPath = path.join(collectionDir, file)
  const timestamp = Math.floor(fs.statSync(fullPath).mtimeMs)
  const cached = cache.get(fullPath)
  if (cached && cached.timestamp === timestamp) {
    return cached.collection
  }

  const src = fs.readFileSync(fullPath, 'utf-8')
  const { data, excerpt } = matter(src, { excerpt: true })
  const slug = file.replace(/\.md$/i, '')
  const collection: CollectionData = {
    title: data.title || slug,
    slug,
    href: `collections/${slug}.html`,
    create: parseDate(data.date, timestamp),
    update: timestamp,
    cover: data.cover,
    description: data.description || excerpt || '',
    tags: data.tags,
  }

  cache.set(fullPath, { timestamp, collection })
  return collection
}

async function load() {
  const collectionDir = path.join(cwd, 'collections')
  return fs
    .readdirSync(collectionDir)
    .filter((file) => file.endsWith('.md') && file !== 'index.md')
    .map((file) => getCollection(file, collectionDir))
    .sort((a, b) => b.create - a.create)
}

export default {
  watch: path.relative(__dirname, cwd + '/collections/*.md').replace(/\\/g, '/'),
  load,
}
