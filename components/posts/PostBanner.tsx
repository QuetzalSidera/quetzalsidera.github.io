import { Banner } from '@/components/shared/Banner'
import type { Post } from '@/lib/types'

type PostBannerProps = {
  post?: Post
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp))
}

export function PostBanner({ post }: PostBannerProps) {
  if (!post) {
    return null
  }

  return (
    <Banner
      title={post.title}
      subtitle={`发布于${formatDate(post.create)}
      | 约${post.wordCount}字 | ${post.collection ?? ''}`}
    />
  )
}
