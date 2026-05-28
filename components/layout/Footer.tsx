import { blogThemeConfig } from '@/lib/site'
import styles from './Footer.module.css'

export function Footer() {
  const { footerName, recordName, poweredList } = blogThemeConfig

  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerInfo}>
        <span>
          © {new Date().getFullYear()} {footerName}{' '}
          <a href="https://beian.miit.gov.cn">{recordName}</a>
        </span>
        <br />
        <span>
          Powered by{' '}
          {poweredList.map((item, index) => (
            <span className={styles.poweredList} key={item.url}>
              <a href={item.url}>{item.name}</a>
              {index < poweredList.length - 1 ? ' & ' : ''}
            </span>
          ))}
        </span>
      </div>
      <div className={styles.footerLogo}>
        <img src="/assets/icon/footLogo.webp" alt="logo-quetzal-sidera" draggable={false} />
      </div>
    </footer>
  )
}
