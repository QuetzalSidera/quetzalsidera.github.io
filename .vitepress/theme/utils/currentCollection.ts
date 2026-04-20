import type { CollectionData } from './collections.data'
import type { PostData } from './posts.data'
import { data as collections } from './collections.data'
import { data as posts } from './posts.data'

export type CollectionPageData = CollectionData & {
  posts: PostData[]
  postCount: number
}

function normalizeMarkdownPath(path: string) {
  return path.replace(/\.md$/i, '.html')
}

function stripBase(path: string, base: string) {
  if (!path) {
    return ''
  }

  return base && path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, '')
}

function normalizeCollectionRef(value?: string) {
  return (value || '').trim().toLowerCase()
}

export function getPostsByCollection(collection?: CollectionData): PostData[] {
  if (!collection) {
    return []
  }

  const titleRef = normalizeCollectionRef(collection.title)
  const slugRef = normalizeCollectionRef(collection.slug)

  return posts.filter((post) => {
    const postRef = normalizeCollectionRef(post.collection)
    return postRef === titleRef || postRef === slugRef
  })
}

export function resolveCurrentCollection(options: {
  relativePath?: string
  routePath?: string
  base?: string
}): CollectionPageData | undefined {
  const relativePath = options.relativePath || ''
  const routePath = options.routePath || ''
  const base = options.base || '/'

  const routeCandidate = routePath ? stripBase(routePath, base) : ''
  let currentCollection =
    (routeCandidate && collections.find((collection) => collection.href === routeCandidate)) || undefined

  if (!currentCollection && relativePath) {
    const markdownCandidate = normalizeMarkdownPath(relativePath)
    currentCollection = collections.find(
      (collection) => collection.href === markdownCandidate || collection.href === relativePath,
    )
  }

  if (!currentCollection) {
    return undefined
  }

  const collectionPosts = getPostsByCollection(currentCollection)

  return {
    ...currentCollection,
    posts: collectionPosts,
    postCount: collectionPosts.length,
  }
}
