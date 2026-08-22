'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { getPageOverlayRoot } from './PageOverlayRoot'
import { PageSideActionsProvider } from './PageSideActionsContext'
import styles from './PageSideActions.module.css'

type PageSideActionsProps = {
  children: ReactNode
  className?: string
}

export function PageSideActionSlot({ children }: { children: ReactNode }) {
  return <div className={styles.actionSlot}>{children}</div>
}

export function PageSideActions({ children, className }: PageSideActionsProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])

  if (!isMounted) return null

  return createPortal(
    <PageSideActionsProvider>
      <div
        className={[styles.rail, className].filter(Boolean).join(' ')}
        data-page-side-actions=""
        data-site-chrome=""
        aria-label="页面操作"
      >
        {children}
      </div>
    </PageSideActionsProvider>,
    getPageOverlayRoot(),
  )
}
