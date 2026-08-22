import type { ReactNode } from 'react'
import { GiscusComments } from '@/components/comments/GiscusComments'
import type { Post } from '@/lib/types'
import { PostSideList } from './PostSideList'
import styles from './PostViewer.module.css'

type PostViewerProps = {
  post: Post
  children: ReactNode
  comments?: boolean
  shareDescription?: string
  shareUrl?: string
}

export function PostViewer({
  post,
  children,
  comments = true,
  shareDescription,
  shareUrl = post.href,
}: PostViewerProps) {
  return (
    <div
      className={styles.postViewer}
      data-document-kind={post.kind}
      data-exercise-font={post.exerciseFont}
      data-post-viewer=""
      data-print-mode={post.kind === 'exercise' ? 'practice' : 'note'}
    >
      <div className={styles.viewBox}>
        <header className={styles.printHeader}>
          <h1>{post.title}</h1>
          {post.collection ? <p>{post.collection}</p> : null}
        </header>
        <article className={styles.content}>{children}</article>
        {comments ? <GiscusComments /> : null}
      </div>
      <PostSideList
        description={shareDescription}
        outline={post.outline ?? []}
        title={post.title}
        url={shareUrl}
        kind={post.kind}
        exerciseFont={post.exerciseFont}
      />
    </div>
  )
}
