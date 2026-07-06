'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight, faFilePdf, faPlaneUp, faSpinner } from '@fortawesome/free-solid-svg-icons'
import type { PostOutline } from '@/lib/types'
import styles from './PostSideList.module.css'

type PostSideListProps = {
  outline: PostOutline[]
  title: string
}

type OutlineState = 'expanded' | 'expanding' | 'collapsing' | 'collapsed'

const SCROLL_TO_TOP_MIN_DURATION = 720
const SCROLL_TO_TOP_MAX_DURATION = 2000
const SCROLL_TO_TOP_MS_PER_PX = 0.34

function getScrollToTopDuration(distance: number) {
  return Math.min(
    SCROLL_TO_TOP_MAX_DURATION,
    Math.max(SCROLL_TO_TOP_MIN_DURATION, distance * SCROLL_TO_TOP_MS_PER_PX),
  )
}

function easeInOutCubic(progress: number) {
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
}

export function PostSideList({ outline, title }: PostSideListProps) {
  const [outlineState, setOutlineState] = useState<OutlineState>('expanded')
  const [activeSlug, setActiveSlug] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isPreparingPrint, setIsPreparingPrint] = useState(false)
  const outlineTimerRef = useRef<number | null>(null)
  const scrollRafRef = useRef<number | null>(null)
  const toTopRafRef = useRef<number | null>(null)

  const outlineItems = useMemo(
    () =>
      outline
        .filter((item) => item.title && item.slug)
        .map((item) => ({
          level: Math.max(Number(item.level ?? 0), 0),
          title: item.title.trim(),
          slug: item.slug.trim(),
        })),
    [outline],
  )

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    function updateActiveSlug() {
      const headings = outlineItems
        .map((item) => document.getElementById(item.slug))
        .filter((item): item is HTMLElement => item !== null)

      if (!headings.length) {
        setActiveSlug('')
        return
      }

      const activationLine = Math.max(110, Math.min(window.innerHeight * 0.18, 180))
      const currentHeading = headings.reduce((closestHeading, heading) => {
        const closestDistance = Math.abs(
          closestHeading.getBoundingClientRect().top - activationLine,
        )
        const currentDistance = Math.abs(heading.getBoundingClientRect().top - activationLine)
        const isCurrentPassed = heading.getBoundingClientRect().top <= activationLine
        const isClosestPassed = closestHeading.getBoundingClientRect().top <= activationLine

        if (isCurrentPassed !== isClosestPassed) {
          return isCurrentPassed ? heading : closestHeading
        }

        return currentDistance < closestDistance ? heading : closestHeading
      }, headings[0])

      setActiveSlug(currentHeading.id)
    }

    function handleScroll() {
      if (scrollRafRef.current !== null) return

      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null
        setIsVisible(window.scrollY > 600)
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        setProgress(scrollHeight > 0 ? Math.min(Math.max(window.scrollY / scrollHeight, 0), 1) : 0)
        updateActiveSlug()
      })
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollRafRef.current !== null) {
        window.cancelAnimationFrame(scrollRafRef.current)
        scrollRafRef.current = null
      }
    }
  }, [outlineItems])

  useEffect(() => {
    return () => {
      if (outlineTimerRef.current !== null) {
        window.clearTimeout(outlineTimerRef.current)
      }
      if (toTopRafRef.current !== null) {
        window.cancelAnimationFrame(toTopRafRef.current)
      }
    }
  }, [])

  const radius = 18
  const circumference = 2 * Math.PI * radius
  const progressStyle = {
    strokeDasharray: `${circumference}`,
    strokeDashoffset: `${circumference * (1 - progress)}`,
  }

  async function nextFrame() {
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))
  }

  async function waitForImages(root: ParentNode) {
    const images = Array.from(root.querySelectorAll('img'))
    await Promise.all(
      images.map(
        async (img) => {
          if (!img.complete) {
            await new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), { once: true })
              img.addEventListener('error', () => resolve(), { once: true })
            })
          }

          if (typeof img.decode === 'function') {
            await img.decode().catch(() => undefined)
          }
        },
      ),
    )
  }

  async function waitForPrintAssets(root: ParentNode) {
    await Promise.all([
      'fonts' in document ? document.fonts.ready.catch(() => undefined) : Promise.resolve(),
      waitForImages(root),
    ])
    await nextFrame()
  }

  function scrollToTop() {
    window.scrollTo({ top: 0 })
    // const startY = window.scrollY

    // if (toTopRafRef.current !== null) {
    //   window.cancelAnimationFrame(toTopRafRef.current)
    //   toTopRafRef.current = null
    // }

    // if (startY <= 0) return
    //
    // if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    //   window.scrollTo({ top: 0 })
    //   return
    // }
    //
    // const startedAt = window.performance.now()
    // const duration = getScrollToTopDuration(startY)
    //
    // function step(now: number) {
    //   const elapsed = now - startedAt
    //   const progress = Math.min(elapsed / duration, 1)
    //   const nextY = Math.round(startY * (1 - easeInOutCubic(progress)))
    //
    //   window.scrollTo(0, nextY)
    //
    //   if (progress < 1 && window.scrollY > 0) {
    //     toTopRafRef.current = window.requestAnimationFrame(step)
    //     return
    //   }
    //
    //   window.scrollTo(0, 0)
    //   toTopRafRef.current = null
    // }

    // toTopRafRef.current = window.requestAnimationFrame(step)
  }

  function toggleOutline() {
    if (outlineState !== 'expanded' && outlineState !== 'collapsed') return

    if (outlineTimerRef.current !== null) {
      window.clearTimeout(outlineTimerRef.current)
    }

    if (outlineState === 'expanded') {
      setOutlineState('collapsing')
      outlineTimerRef.current = window.setTimeout(() => setOutlineState('collapsed'), 1000)
      return
    }

    setOutlineState('expanding')
    outlineTimerRef.current = window.setTimeout(() => setOutlineState('expanded'), 1000)
  }

  async function downloadPdf() {
    if (isPreparingPrint) return

    const content = document.querySelector('article[class*="PostViewer_content"]')
    if (!(content instanceof HTMLElement)) return

    const previousTitle = document.title
    const printTitle = title.trim().replace(/[\\/:*?"<>|]+/g, ' ') || previousTitle
    let didCleanup = false

    function cleanupPrintState() {
      if (didCleanup) return
      didCleanup = true
      document.title = previousTitle
      setIsPreparingPrint(false)
      window.removeEventListener('afterprint', cleanupPrintState)
    }

    setIsPreparingPrint(true)

    try {
      await waitForPrintAssets(content)
      document.title = printTitle
      window.addEventListener('afterprint', cleanupPrintState, { once: true })
      window.print()
      window.setTimeout(cleanupPrintState, 30000)
    } catch (error) {
      cleanupPrintState()
      console.error('Failed to prepare print PDF.', error)
    }
  }

  const sideList = (
    <div className={`${styles.postSideList} post-side-list`}>
      {outlineItems.length ? (
        <aside className={[styles.outline, styles[outlineState]].join(' ')}>
          <p className={styles.outlineTitle}>文章导航</p>
          <div className={styles.outlineCard}>
            <ul className={styles.outlineList}>
              {outlineItems.map((item) => (
                <li
                  key={item.slug}
                  className={[styles.outlineItem, styles[`level${item.level}`] ?? ''].join(' ')}
                >
                  <a
                    href={`#${item.slug}`}
                    className={activeSlug === item.slug ? styles.active : ''}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <button
            className={styles.outlineButton}
            type="button"
            onClick={toggleOutline}
            title="文章导航"
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
        </aside>
      ) : null}

      <button
        className={styles.downloadPdfButton}
        type="button"
        title={isPreparingPrint ? '正在准备打印 / 保存PDF' : '打印 / 保存PDF'}
        disabled={isPreparingPrint}
        onClick={downloadPdf}
      >
        <FontAwesomeIcon
          icon={isPreparingPrint ? faSpinner : faFilePdf}
          className={[
            styles.downloadPdfButtonIcon,
            isPreparingPrint ? styles.preparingPdfIcon : '',
          ].join(' ')}
        />
      </button>

      <button
        className={[
          styles.toTopButton,
          isVisible ? styles.toTopButtonEnter : styles.toTopButtonLeave,
        ].join(' ')}
        type="button"
        onClick={scrollToTop}
        title="回到顶部"
      >
        <svg className={styles.toTopButtonProgress} viewBox="0 0 44 44" aria-hidden="true">
          <circle className={styles.toTopButtonProgressTrack} cx="22" cy="22" r="18" />
          <circle
            className={styles.toTopButtonProgressRing}
            cx="22"
            cy="22"
            r="18"
            style={progressStyle}
          />
        </svg>
        <FontAwesomeIcon icon={faPlaneUp} className={styles.toTopButtonIcon} />
      </button>
    </div>
  )

  if (!isMounted) {
    return null
  }

  return createPortal(sideList, document.body)
}
