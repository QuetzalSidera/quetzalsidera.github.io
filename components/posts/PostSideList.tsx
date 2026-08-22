'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { PageSideActions, PageSideActionSlot } from '@/components/shared/PageSideActions'
import { ScrollToTopControl } from '@/components/shared/ScrollToTopControl'
import { ShareControl } from '@/components/shared/ShareControl'
import type { DocumentKind, ExerciseFont, PostOutline } from '@/lib/types'
import { PostPrintControl } from './PostPrintControl'
import styles from './PostSideList.module.css'

type PostSideListProps = {
  outline: PostOutline[]
  description?: string
  title: string
  url: string
  kind: DocumentKind
  exerciseFont: ExerciseFont
}

type OutlineState = 'expanded' | 'expanding' | 'collapsing' | 'collapsed'

export function PostSideList({
  description,
  outline,
  title,
  url,
  kind,
  exerciseFont,
}: PostSideListProps) {
  const [outlineState, setOutlineState] = useState<OutlineState>('expanded')
  const [activeSlug, setActiveSlug] = useState('')
  const outlineTimerRef = useRef<number | null>(null)
  const scrollRafRef = useRef<number | null>(null)

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
    }
  }, [])

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

  return (
    <PageSideActions className="post-side-list">
      {outlineItems.length ? (
        <PageSideActionSlot>
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
              aria-label="文章导航"
              aria-expanded={outlineState === 'expanded' || outlineState === 'expanding'}
            >
              <FontAwesomeIcon icon={faAngleRight} />
            </button>
          </aside>
        </PageSideActionSlot>
      ) : null}

      <PostPrintControl title={title} kind={kind} exerciseFont={exerciseFont} />
      <ShareControl description={description} title={title} url={url} />
      <ScrollToTopControl />
    </PageSideActions>
  )
}
