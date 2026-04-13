import type { PostData } from './posts.data'
import { data as posts } from './posts.data'

function normalizeMarkdownPath(path: string) {
  return path.replace(/\.md$/i, '.html')
}

function stripBase(path: string, base: string) {
  if (!path) {
    return ''
  }

  return base && path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, '')
}

export function resolveCurrentPost(options: {
  relativePath?: string
  routePath?: string
  base?: string
}): PostData | undefined {
  const relativePath = options.relativePath || ''
  const routePath = options.routePath || ''
  const base = options.base || '/'

  const routeCandidate = routePath ? stripBase(routePath, base) : ''
  if (routeCandidate) {
    const postFromRoute = posts.find((post) => post.href === routeCandidate)
    if (postFromRoute) {
      return postFromRoute
    }
  }

  if (relativePath) {
    const markdownCandidate = normalizeMarkdownPath(relativePath)
    const postFromRelativePath = posts.find(
      (post) => post.href === markdownCandidate || post.href === relativePath,
    )
    if (postFromRelativePath) {
      return postFromRelativePath
    }
  }

  return undefined
}
