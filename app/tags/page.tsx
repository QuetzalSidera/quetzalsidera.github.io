import { getAllCollections } from '@/lib/collections'
import { getAllPosts } from '@/lib/posts'
import { mapPostsToListItems, type PostListItem } from '@/lib/post-list'
import { createTagsJsonLd, createTagsMetadata } from '@/lib/seo'
import { TagsPageClient } from './TagsPageClient'

export const metadata = createTagsMetadata()

export default function TagsPage() {
  const posts = getAllPosts()
  const collections = getAllCollections()
  const listItemsByTag: Record<string, PostListItem[]> = {}
  const tags: string[] = []
  let initialTag = ''
  const jsonLd = createTagsJsonLd()

  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      listItemsByTag[tag] ??= []
      if (!tags.includes(tag)) {
        tags.push(tag)
        initialTag ||= tag
      }
      listItemsByTag[tag].push(...mapPostsToListItems([post], collections))
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TagsPageClient tags={tags} listItemsByTag={listItemsByTag} initialTag={initialTag} />
    </>
  )
}
