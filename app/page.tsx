import { BannerHero } from '@/components/home/BannerHero'
import { WelcomeBox } from '@/components/home/WelcomeBox'
import { PostList } from '@/components/posts/PostList'
import { getAllCollections } from '@/lib/collections'
import { mapPostsToListItems } from '@/lib/post-list'
import { getAllPosts } from '@/lib/posts'
import { createHomeJsonLd, createHomeMetadata } from '@/lib/seo'
import styles from './page.module.css'

export const metadata = createHomeMetadata()

export default function HomePage() {
  const posts = getAllPosts()
  const collections = getAllCollections()
  const listItems = mapPostsToListItems(posts, collections)
  const jsonLd = createHomeJsonLd()

  return (
    <main className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BannerHero key="home-hero">
        <WelcomeBox />
      </BannerHero>

      <section className={[styles.section, 'section-route-enter'].join(' ')}>
        <PostList items={listItems} />
      </section>
    </main>
  )
}
