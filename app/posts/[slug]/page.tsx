import { notFound, permanentRedirect } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { BlogCodeBlock } from '@/components/BlogCodeBlock'
import { BlogImage } from '@/components/BlogImage'
import { BannerHero } from '@/components/home/BannerHero'
import { PostBanner } from '@/components/posts/PostBanner'
import { PostViewer } from '@/components/posts/PostViewer'
import { remarkLegacyImages } from '@/lib/mdx'
import { getAllPostSlugs, getPostBySlug } from '@/lib/posts'
import { rehypeShiki } from '@/lib/rehype-shiki'
import { createPostJsonLd, createPostMetadata } from '@/lib/seo'
import styles from './page.module.css'

type PageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  const slugs = getAllPostSlugs()

  if (process.env.NODE_ENV === 'development') {
    return slugs.flatMap((slug) => [{ slug }, { slug: `${slug}.html` }])
  }

  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug: rawSlug } = await params
  const slug = rawSlug.replace(/\.html$/i, '')
  const post = getPostBySlug(slug)
  if (!post) return {}
  return createPostMetadata(post)
}

export default async function PostPage({ params }: PageProps) {
  const { slug: rawSlug } = await params
  const slug = rawSlug.replace(/\.html$/i, '')
  if (rawSlug !== slug) {
    permanentRedirect(`/posts/${slug}/`)
  }

  const post = getPostBySlug(slug)
  if (!post) notFound()
  const jsonLd = createPostJsonLd(post)

  return (
    <main className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BannerHero isPostViewer>
        <PostBanner post={post} />
      </BannerHero>

      <PostViewer post={post}>
        <MDXRemote
          source={post.content}
          components={{
            Image: BlogImage,
            pre: BlogCodeBlock,
          }}
          options={{
            mdxOptions: {
              format: 'md',
              remarkPlugins: [remarkLegacyImages, remarkGfm, remarkMath],
              rehypePlugins: [
                rehypeShiki,
                [rehypeKatex, { strict: false, throwOnError: false }],
              ],
            },
          }}
        />
      </PostViewer>
    </main>
  )
}
