import styles from './BlogImage.module.css'

type BlogImageProps = {
  src?: string
  alt?: string
  align?: 'left' | 'right' | 'center'
  wrap?: boolean
  caption?: string
  captionLink?: string
  maxHeight?: number | string
  legacyBind?: string
}

export function BlogImage({
  src,
  alt,
  align = 'center',
  wrap = false,
  caption,
  captionLink,
  maxHeight = '32rem',
  legacyBind,
}: BlogImageProps) {
  if (!src) {
    return (
      <span className={styles.legacy}>
        图片引用 {legacyBind ? `v-bind="${legacyBind}"` : '暂未迁移'}
      </span>
    )
  }

  const className = [
    styles.figure,
    styles[align] ?? styles.center,
    wrap ? styles.wrap : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <figure className={className}>
      <img
        className={styles.image}
        src={src}
        alt={alt ?? caption ?? ''}
        loading="lazy"
        style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
      />
      {caption ? (
        <figcaption className={styles.caption}>
          {captionLink ? (
            <a href={captionLink} target="_blank" rel="noopener noreferrer">
              {caption}
            </a>
          ) : (
            caption
          )}
        </figcaption>
      ) : null}
    </figure>
  )
}
