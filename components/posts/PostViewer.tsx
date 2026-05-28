import type { ReactNode } from 'react'
import { GiscusComments } from '@/components/comments/GiscusComments'
import type { Post } from '@/lib/types'
import { PostSideList } from './PostSideList'
import styles from './PostViewer.module.css'

type PostViewerProps = {
  post: Post
  children: ReactNode
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp))
}

export function PostViewer({ post, children }: PostViewerProps) {
  return (
    <div className={styles.postViewer}>
      <div className={styles.viewBox}>
        <header className={styles.printHeader}>
          <h1>{post.title}</h1>
          <p>
            发布于 {formatDate(post.create)}
            {post.collection ? ` | ${post.collection}` : ''}
          </p>
        </header>
        <article className={styles.content}>{children}</article>
        <GiscusComments />
      </div>
      <PostSideList outline={post.outline ?? []} title={post.title} />
    </div>
  )
}
