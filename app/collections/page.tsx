import { CollectionsBanner } from '@/components/collections/CollectionsBanner'
import { BannerHero } from '@/components/home/BannerHero'
import { PostList } from '@/components/posts/PostList'
import { getAllCollections } from '@/lib/collections'
import { mapCollectionsToListItems } from '@/lib/post-list'
import { createCollectionsJsonLd, createCollectionsMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = createCollectionsMetadata()

export default function CollectionsPage() {
  const collections = getAllCollections()
  const listItems = mapCollectionsToListItems(collections)
  const jsonLd = createCollectionsJsonLd()

  return (
    <main className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BannerHero>
        <CollectionsBanner />
      </BannerHero>
      <section className={[styles.section, 'section-route-enter'].join(' ')}>
        <PostList items={listItems} />
      </section>
    </main>
  )
}
