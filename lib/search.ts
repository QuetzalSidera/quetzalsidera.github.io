import type { Post } from '@/lib/types'

export type SearchDocument = {
  id: number
  title: string
  href: string
  excerpt: string
  content: string
}

function stripSearchText(value: string) {
  return value
    .replace(/@@LEGACY_IMAGE:[^@]+@@/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/\{#[^}]+}/g, ' ')
    .replace(/[#>*_`~|\\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(value: string, length = 180) {
  return value.length <= length ? value : `${value.slice(0, length - 1).trim()}…`
}

export function createSearchDocuments(posts: Post[]): SearchDocument[] {
  return posts.map((post, id) => {
    const content = stripSearchText(post.content)
    const excerpt = stripSearchText(post.excerpt || '') || truncate(content)

    return {
      id,
      title: post.title,
      href: post.href,
      excerpt,
      content,
    }
  })
}
