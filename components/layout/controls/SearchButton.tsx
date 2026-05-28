'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { useBlogRuntime } from '@/components/runtime/BlogRuntime'
import styles from './NavControls.module.css'

export function SearchButton() {
  const { openSearchDialog } = useBlogRuntime()

  return (
    <button type="button" className={styles.iconButton} onClick={openSearchDialog} aria-label="搜索">
      <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.icon} />
    </button>
  )
}
