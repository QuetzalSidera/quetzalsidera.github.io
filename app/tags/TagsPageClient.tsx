'use client'

import { useMemo, useState } from 'react'
import { BannerHero } from '@/components/home/BannerHero'
import { PostList } from '@/components/posts/PostList'
import { TagFilter } from '@/components/posts/TagFilter'
import type { PostListItem } from '@/lib/post-list'
import styles from './page.module.css'

type TagsPageClientProps = {
  tags: string[]
  listItemsByTag: Record<string, PostListItem[]>
  initialTag: string
}

export function TagsPageClient({ tags, listItemsByTag, initialTag }: TagsPageClientProps) {
  const [selectedTag, setSelectedTag] = useState(initialTag)
  const listItems = useMemo(() => listItemsByTag[selectedTag] ?? [], [listItemsByTag, selectedTag])

  return (
    <main className={styles.main}>
      <BannerHero>
        <TagFilter tags={tags} initialTag={initialTag} onSelectTag={setSelectedTag} />
      </BannerHero>

      <section className={[styles.section, 'section-route-enter'].join(' ')}>
        <PostList items={listItems} sortMode={'newest'} />
      </section>
    </main>
  )
}
