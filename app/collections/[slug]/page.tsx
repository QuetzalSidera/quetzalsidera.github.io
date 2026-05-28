import { notFound, permanentRedirect } from 'next/navigation'
import { CollectionBanner } from '@/components/collections/CollectionBanner'
import { BannerHero } from '@/components/home/BannerHero'
import { PostList } from '@/components/posts/PostList'
import {
  getAllCollectionSlugs,
  getAllCollections,
  getCollectionPageData,
} from '@/lib/collections'
import { mapPostsToListItems } from '@/lib/post-list'
import { createCollectionJsonLd, createCollectionMetadata } from '@/lib/seo'
import styles from './page.module.css'

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  const slugs = getAllCollectionSlugs()

  if (process.env.NODE_ENV === 'development') {
    return slugs.flatMap((slug) => [{ slug }, { slug: `${slug}.html` }])
  }

  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug: rawSlug } = await params
  const slug = rawSlug.replace(/\.html$/i, '')
  const collection = getCollectionPageData(slug)
  if (!collection) return {}

  return createCollectionMetadata(collection)
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug: rawSlug } = await params
  const slug = rawSlug.replace(/\.html$/i, '')
  if (rawSlug !== slug) {
    permanentRedirect(`/collections/${slug}/`)
  }

  const collection = getCollectionPageData(slug)
  if (!collection) notFound()

  const listItems = mapPostsToListItems(collection.posts, getAllCollections())
  const jsonLd = createCollectionJsonLd(collection)

  return (
    <main className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BannerHero>
        <CollectionBanner collection={collection} />
      </BannerHero>
      <section className={[styles.section, 'section-route-enter'].join(' ')}>
        <PostList items={listItems} />
      </section>
    </main>
  )
}
