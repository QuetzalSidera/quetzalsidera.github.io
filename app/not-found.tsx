import Link from 'next/link'
import { createNotFoundMetadata } from '@/lib/seo'
import styles from './not-found.module.css'

export const metadata = createNotFoundMetadata()

export default function NotFound() {
  return (
    <main className={styles.notFound}>
      <img src="/assets/NotFound.webp" alt="" />
      <span>页面不存在</span>
      <span className={styles.band}>
        <Link href="/">回到主页</Link>
      </span>
    </main>
  )
}
