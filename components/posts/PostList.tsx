'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Motion, spring } from 'react-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import type { PostListItem } from '@/lib/post-list'
import { PostListCard } from './PostListCard'
import styles from './PostList.module.css'

type SortMode = 'newest' | 'oldest'

type PostListProps = {
  items: PostListItem[]
  onSelectTag?: (tag: string) => void
  sortMode: SortMode
}

const pageSize = 5
const enterSpring = { stiffness: 170, damping: 24, precision: 0.1 }
const listSwapDelay = 180

function compareTitles(a: PostListItem, b: PostListItem) {
  return a.title.localeCompare(b.title, 'zh-CN')
}

function sortItems(items: PostListItem[], sortMode: SortMode) {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1
    }

    if (sortMode === 'newest') {
      return b.create - a.create
    }

    if (sortMode === 'oldest') {
      return a.create - b.create
    }

    return compareTitles(a, b)
  })
}

function getPageFromUrl(totalPage: number) {
  const urlParams = new URLSearchParams(window.location.search)
  const pageParam = urlParams.get('page')
  const parsedPage = pageParam ? parseInt(pageParam, 10) : 1

  if (!Number.isNaN(parsedPage) && parsedPage > 0 && parsedPage <= totalPage) {
    return parsedPage
  }

  return 1
}

export function PostList({ items, onSelectTag, sortMode:initialSortMode }: PostListProps) {
  const [sortMode, setSortMode] = useState<SortMode>(initialSortMode)
  const [currPage, setCurrPage] = useState(1)
  const sortedItems = useMemo(() => sortItems(items, sortMode), [items, sortMode])
  const totalPage = Math.ceil(sortedItems.length / pageSize) || 1
  const listItems = useMemo(
    () => sortedItems.slice((currPage - 1) * pageSize, currPage * pageSize),
    [currPage, sortedItems],
  )
  const listSignature = useMemo(() => listItems.map((item) => item.href).join('|'), [listItems])
  const [renderedItems, setRenderedItems] = useState(listItems)
  const [listVisible, setListVisible] = useState(true)
  const lastSignatureRef = useRef(listSignature)
  const pendingItemsRef = useRef(listItems)

  useEffect(() => {
    function updatePageFromUrl() {
      setCurrPage(getPageFromUrl(totalPage))
    }

    updatePageFromUrl()
    window.addEventListener('popstate', updatePageFromUrl)

    return () => {
      window.removeEventListener('popstate', updatePageFromUrl)
    }
  }, [totalPage])

  useEffect(() => {
    if (currPage > totalPage) {
      setCurrPage(1)
    }
  }, [currPage, totalPage])

  useEffect(() => {
    pendingItemsRef.current = listItems

    if (lastSignatureRef.current === listSignature) {
      setRenderedItems(listItems)
      return
    }

    lastSignatureRef.current = listSignature
    setListVisible(false)

    const timer = window.setTimeout(() => {
      setRenderedItems(pendingItemsRef.current)
      setListVisible(true)
    }, listSwapDelay)

    return () => window.clearTimeout(timer)
  }, [listItems, listSignature])

  function isActivePage(pageNumber: number) {
    return currPage === pageNumber
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPage) {
      return
    }

    setCurrPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const url = new URL(window.location.href)

    if (page > 1) {
      url.searchParams.set('page', page.toString())
    } else {
      url.searchParams.delete('page')
    }

    const tagParam = url.searchParams.get('tag')
    if (tagParam) {
      url.searchParams.set('tag', tagParam)
    }

    const collectionParam = url.searchParams.get('collection')
    if (collectionParam) {
      url.searchParams.set('collection', collectionParam)
    }

    window.history.pushState({}, '', url.toString())
  }

  const maxVisiblePages = 3
  const visiblePageNumbers = useMemo(() => {
    if (totalPage <= 7) {
      return Array.from({ length: totalPage - 2 }, (_, index) => index + 2).filter(
        (page) => page > 1 && page < totalPage,
      )
    }

    let startPage = Math.max(2, currPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPage - 1, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(2, endPage - maxVisiblePages + 1)
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index)
  }, [currPage, totalPage])

  const showLeftEllipsis = totalPage > 7 && visiblePageNumbers[0] > 2
  const showRightEllipsis =
    totalPage > 7 && visiblePageNumbers[visiblePageNumbers.length - 1] < totalPage - 1

  function handleSortChange(nextSortMode: SortMode) {
    setSortMode(nextSortMode)
    setCurrPage(1)
    const url = new URL(window.location.href)
    url.searchParams.delete('page')
    window.history.replaceState({}, '', url.toString())
  }

  return (
    <div className={styles.postsContent}>
      <div className={styles.postsToolbar}>
        <label className={styles.sortControl}>
          <span className={styles.sortLabel}>排序</span>
          <select className={styles.sortSelect}
                  value={sortMode}
                  onChange={(event) => handleSortChange(event.target.value as SortMode)}
          >
            <option className={styles.sortOption} value="newest">最近发布</option>
            <option className={styles.sortOption} value="oldest">最早发布</option>
          </select>
        </label>
      </div>
      <Motion
        defaultStyle={{ opacity: 1, blur: 0, y: 0 }}
        style={{
          opacity: spring(listVisible ? 1 : 0, enterSpring),
          blur: spring(listVisible ? 0 : 6, enterSpring),
          y: spring(listVisible ? 0 : -6, enterSpring),
        }}
      >
        {(style) => (
          <div
            className={styles.postsList}
            style={{
              opacity: style.opacity,
              filter: `blur(${style.blur}px)`,
              transform: `translate3d(0, ${style.y}px, 0)`,
            }}
          >
            {renderedItems.map((item) => (
              <div key={item.href} className={styles.listItem}>
                <PostListCard item={item} onSelectTag={onSelectTag} />
              </div>
            ))}
          </div>
        )}
      </Motion>
      {totalPage !== 1 ? (
        <div className={styles.pagination}>
          <button
            disabled={isActivePage(1)}
            className={isActivePage(1) ? styles.hide : ''}
            id="up"
            onClick={() => goToPage(currPage - 1)}
          >
            <FontAwesomeIcon icon={faChevronLeft} className={styles.paginationIcon} />
          </button>

          <div className={styles.pageNumbers}>
            <button
              className={[styles.pageNumber, isActivePage(1) ? styles.active : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => goToPage(1)}
            >
              1
            </button>

            {showLeftEllipsis ? <span className={styles.ellipsis}>...</span> : null}

            {visiblePageNumbers.map((page) => (
              <button
                key={page}
                className={[styles.pageNumber, isActivePage(page) ? styles.active : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}

            {showRightEllipsis ? <span className={styles.ellipsis}>...</span> : null}

            {totalPage > 1 ? (
              <button
                className={[styles.pageNumber, isActivePage(totalPage) ? styles.active : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => goToPage(totalPage)}
              >
                {totalPage}
              </button>
            ) : null}
          </div>

          <button
            disabled={currPage >= totalPage}
            className={currPage >= totalPage ? styles.hide : ''}
            id="next"
            onClick={() => goToPage(currPage + 1)}
          >
            <FontAwesomeIcon icon={faChevronRight} className={styles.paginationIcon} />
          </button>
        </div>
      ) : null}
    </div>
  )
}
