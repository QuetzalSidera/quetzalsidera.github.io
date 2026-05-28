import styles from './Banner.module.css'

export type BannerProps = {
  title: string
  subtitle?: string
  description?: string
}

export function Banner({ title, subtitle, description }: BannerProps) {
  return (
    <div className={styles.sharedBanner}>
      <h1 className={styles.sharedBannerTitle}>{title}</h1>
      {subtitle ? <span className={styles.sharedBannerSubtitle}>{subtitle}</span> : null}
      {description ? <p className={styles.sharedBannerDescription}>{description}</p> : null}
    </div>
  )
}
