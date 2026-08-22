import { notFound, permanentRedirect } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkDirective from 'remark-directive'
import { BlogCodeBlock } from '@/components/BlogCodeBlock'
import { BlogImage } from '@/components/BlogImage'
import { ContentFlow, FlowBody, FlowMedia } from '@/components/content/Flow'
import { GroupCaption, ImageGroup } from '@/components/content/ImageGroup'
import { MindMap } from '@/components/content/MindMap'
import {
  Exercise,
  ExerciseAnswer,
  ExerciseChoices,
  ExerciseGroup,
  ExerciseHint,
  ExerciseParts,
  ExerciseSet,
  ExerciseSolution,
  ExerciseStem,
} from '@/components/content/Exercise'
import { BannerHero } from '@/components/home/BannerHero'
import { PostBanner } from '@/components/posts/PostBanner'
import { PostContentLink } from '@/components/posts/PostContentLink'
import { PostViewer } from '@/components/posts/PostViewer'
import { remarkLegacyImages } from '@/lib/mdx'
import { remarkContentDirectives } from '@/lib/remark-content-directives'
import { getAllPostSlugs, getPostBySlug } from '@/lib/posts'
import { rehypeShiki } from '@/lib/rehype-shiki'
import { createPostJsonLd, createPostMetadata, createPostShareData } from '@/lib/seo'
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
  const share = createPostShareData(post)

  return (
    <main className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BannerHero isPostViewer>
        <PostBanner post={post} />
      </BannerHero>

      <PostViewer
        post={post}
        shareDescription={share.description}
        shareUrl={share.url}
      >
        <MDXRemote
          source={post.content}
          components={{
            Image: BlogImage,
            ContentFlow,
            FlowMedia,
            FlowBody,
            ImageGroup,
            GroupCaption,
            MindMap,
            ExerciseSet,
            ExerciseGroup,
            Exercise,
            ExerciseStem,
            ExerciseParts,
            ExerciseChoices,
            ExerciseAnswer,
            ExerciseSolution,
            ExerciseHint,
            a: PostContentLink,
            pre: BlogCodeBlock,
          }}
          options={{
            mdxOptions: {
              format: 'md',
              remarkPlugins: [
                remarkDirective,
                remarkLegacyImages,
                remarkContentDirectives,
                remarkGfm,
                remarkMath,
              ],
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
