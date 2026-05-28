import { getPostsByCollection } from '@/lib/collections'
import type { CollectionData, Post } from '@/lib/types'

export interface PostListItem {
  title: string
  href: string
  create: number
  cover?: string
  excerpt: string
  collection?: PostCollectionInfo
  tags: string[]
  tagsInteractive: boolean
  pinned: boolean
  metricText: string
}

export type PostCollectionInfo = {
  title: string
  href: string
}

export function mapPostsToListItems(posts: Post[], collections: CollectionData[]): PostListItem[] {
  return posts.map((post) => {
    const collection = collections.find((collection) => collection.title === post.collection)
    const postCollectionInfo: PostCollectionInfo | undefined = collection && {
      title: collection.title,
      href: collection.href,
    }

    return {
      title: post.title,
      href: post.href,
      create: post.create,
      cover: post.cover,
      excerpt: post.excerpt || '',
      collection: postCollectionInfo,
      tags: post.tags ?? [],
      tagsInteractive: true,
      pinned: !!post.pinned,
      metricText: `约${post.wordCount}字`,
    }
  })
}

export function mapCollectionsToListItems(collections: CollectionData[]): PostListItem[] {
  return collections.map((collection) => ({
    title: collection.title,
    href: collection.href,
    create: collection.create,
    cover: collection.cover,
    excerpt: collection.description || '',
    collection: undefined,
    tags: collection.tags ?? [],
    tagsInteractive: false,
    pinned: false,
    metricText: `共${getPostsByCollection(collection).length}篇文章`,
  }))
}
