import type { MetadataRoute } from 'next'
import { getAllCollections } from '@/lib/collections'
import { getAllPosts } from '@/lib/posts'
import { resolveAbsoluteUrl } from '@/lib/seo'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: resolveAbsoluteUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: resolveAbsoluteUrl('/tags/'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: resolveAbsoluteUrl('/collections/'),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const collectionRoutes = getAllCollections().map((collection) => ({
    url: resolveAbsoluteUrl(collection.href),
    lastModified: new Date(collection.update),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  const postRoutes = getAllPosts().map((post) => ({
    url: resolveAbsoluteUrl(post.href),
    lastModified: new Date(post.update),
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }))

  return [...staticRoutes, ...collectionRoutes, ...postRoutes]
}
