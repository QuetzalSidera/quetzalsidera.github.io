import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink, faTag } from '@fortawesome/free-solid-svg-icons'
import type { PostListItem } from '@/lib/post-list'
import { navigateWithRouteTransition } from '@/components/runtime/routeTransition'
import styles from './PostListCard.module.css'
import { faClock } from '@fortawesome/free-regular-svg-icons/faClock'

type PostListCardProps = {
  item: PostListItem
  onSelectTag?: (tag: string) => void
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp))
}

export function PostListCard({ item, onSelectTag }: PostListCardProps) {
  const router = useRouter()

  return (
    <article className={styles.postListCard}>
      {item.pinned ? <span className={styles.pinned} /> : null}
      <header className={styles.postHeader}>
        {item.cover ? (
          <div className={styles.coverContainer}>
            <img
              src={item.cover}
              className={styles.coverImage}
              alt={`${item.title}-cover`}
              loading="lazy"
            />
          </div>
        ) : null}
        <div className={styles.headerContent}>
          <div
            className={[styles.title, !item.cover ? styles.titleWithDot : '']
              .filter(Boolean)
              .join(' ')}
          >
            {!item.cover ? <div className={styles.titleDot} /> : null}
            <h1 className={styles.name}>
              <Link
                href={item.href}
                onClick={(event) => navigateWithRouteTransition(event, item.href, router.push)}
              >
                {item.title}
              </Link>
            </h1>
          </div>
          <div className={styles.metaInfoBar}>
            <div className={styles.timeInfo}>
              <FontAwesomeIcon icon={faClock} className={styles.timeIcon} />
              <time dateTime="">{formatDate(item.create)}</time>
            </div>
            <div className={styles.seperator} />
            <div className={styles.wordcount}>{item.metricText}</div>
            {item.collection ? <div className={styles.seperator} /> : null}

            {item.collection ? (
              <Link href={item.collection.href} className={styles.collection}>
                <FontAwesomeIcon icon={faLink} className={styles.collectionIcon} />
                {item.collection.title}
              </Link>
            ) : null}
          </div>
          {item.tags.length ? (
            <ul className={styles.tags}>
              {item.tags.map((tag) => (
                <li key={tag}>
                  {item.tagsInteractive ? (
                    <Link
                      href="/tags/"
                      onClick={() => {
                        onSelectTag?.(tag)
                      }}
                    >
                      <FontAwesomeIcon icon={faTag} className={styles.tagIcon} /> {tag}
                    </Link>
                  ) : (
                    <span className={styles.tagLabel}>
                      <FontAwesomeIcon icon={faTag} className={styles.tagIcon} /> {tag}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
          <div className={styles.excerpt}>
            <p>{item.excerpt}</p>
          </div>
        </div>
      </header>
    </article>
  )
}
