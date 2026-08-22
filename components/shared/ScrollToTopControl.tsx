'use client'

import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlaneUp } from '@fortawesome/free-solid-svg-icons'
import styles from './PageSideActions.module.css'

const VISIBILITY_THRESHOLD = 600

type ScrollState = {
  isVisible: boolean
  progress: number
}

function readScrollState(): ScrollState {
  const scrollRoot = document.scrollingElement ?? document.documentElement
  const scrollTop = scrollRoot.scrollTop
  const scrollRange = scrollRoot.scrollHeight - window.innerHeight

  return {
    isVisible: scrollTop > VISIBILITY_THRESHOLD,
    progress:
      scrollRange > 0 ? Math.min(Math.max(scrollTop / scrollRange, 0), 1) : 0,
  }
}

function usePageScrollState() {
  const [state, setState] = useState<ScrollState>({ isVisible: false, progress: 0 })
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    function update() {
      frameRef.current = null
      const next = readScrollState()
      setState((current) =>
        current.isVisible === next.isVisible && current.progress === next.progress
          ? current
          : next,
      )
    }

    function scheduleUpdate() {
      if (frameRef.current !== null) return
      frameRef.current = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  return state
}

export function ScrollToTopControl() {
  const { isVisible, progress } = usePageScrollState()
  const radius = 18
  const circumference = 2 * Math.PI * radius

  return (
    <button
      className={[
        styles.actionButton,
        styles.toTopButton,
        isVisible ? styles.toTopButtonVisible : styles.toTopButtonHidden,
      ].join(' ')}
      type="button"
      onClick={() => window.scrollTo({ top: 0 })}
      title="回到顶部"
      aria-label="回到顶部"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
    >
      <svg className={styles.progress} viewBox="0 0 44 44" aria-hidden="true">
        <circle className={styles.progressTrack} cx="22" cy="22" r={radius} />
        <circle
          className={styles.progressRing}
          cx="22"
          cy="22"
          r={radius}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference * (1 - progress),
          }}
        />
      </svg>
      <FontAwesomeIcon icon={faPlaneUp} className={styles.toTopIcon} />
    </button>
  )
}
