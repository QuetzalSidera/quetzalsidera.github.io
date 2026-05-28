'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { BannerMessages } from './BannerMessages'
import { MusicControl } from './controls/MusicControl'
import { SearchButton } from './controls/SearchButton'
import { ThemeToggle } from './controls/ThemeToggle'
import { blogThemeConfig } from '@/lib/site'
import { navigateWithRouteTransition } from '@/components/runtime/routeTransition'
import styles from './Navbar.module.css'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [showDropdownMenu, setShowDropdownMenu] = useState(false)
  const isPostViewer = pathname?.startsWith('/posts/')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return
      }
      setShowDropdownMenu(false)
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setShowDropdownMenu(false)
  }, [pathname])

  return (
    <header
      className={[styles.headerContainer, isPostViewer ? styles.postViewer : '']
        .filter(Boolean)
        .join(' ')}
    >
      <nav>
        <span className={styles.logo}>
          <Link
            href="/"
            aria-label="首页"
            onClick={(event) => navigateWithRouteTransition(event, '/', router.push)}
          >
            <img src="/assets/icon/navLogo.svg" alt="" draggable={false} />
          </Link>
        </span>
        <span className={styles.menu}>
          <ul>
            {blogThemeConfig.menuList.map((item) => (
              <li key={item.url}>
                <Link
                  href={item.url}
                  onClick={(event) => navigateWithRouteTransition(event, item.url, router.push)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </span>
        <button
          ref={buttonRef}
          className={[styles.hamburger, showDropdownMenu ? styles.active : ''].join(' ')}
          type="button"
          aria-label="打开菜单"
          aria-expanded={showDropdownMenu}
          onClick={() => setShowDropdownMenu((current) => !current)}
        >
          <span className={styles.line} />
          <span className={styles.line} />
          <span className={styles.line} />
        </button>
        <div
          ref={dropdownRef}
          className={styles.dropdownMenu}
          data-showmenu={showDropdownMenu ? 'true' : 'false'}
        >
          <div className={styles.menuContent}>
            <div className={styles.firstRow}>
              <MusicControl />
              <SearchButton />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>
      <BannerMessages />
    </header>
  )
}
