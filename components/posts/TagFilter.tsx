'use client'

import { useEffect, useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTag } from '@fortawesome/free-solid-svg-icons'
import styles from './TagFilter.module.css'

type TagFilterProps = {
  tags: string[]
  initialTag?: string
  onSelectTag: (tag: string) => void
}

export function TagFilter({ tags, initialTag = '', onSelectTag }: TagFilterProps) {
  const tagSet = useMemo(() => new Set(tags), [tags])
  const [active, setActive] = useState<string | null>(initialTag || null)

  function resolveTag(tag: string) {
    if (tag && tagSet.has(tag)) {
      return tag
    }
    return tags[0] ?? ''
  }

  function setTag(tag: string, syncUrl = true) {
    const nextTag = resolveTag(tag)
    setActive(nextTag || null)
    onSelectTag(nextTag)

    if (!syncUrl) return

    const url = new URL(window.location.href)
    if (nextTag) {
      url.searchParams.set('tag', nextTag)
    } else {
      url.searchParams.delete('tag')
    }
    url.searchParams.delete('page')
    window.history.pushState({}, '', url.toString())
  }

  useEffect(() => {
    function getTagFromUrl() {
      const urlParams = new URLSearchParams(window.location.search)
      const tagParam = urlParams.get('tag')
      return tagParam && tagSet.has(tagParam) ? tagParam : ''
    }

    const nextInitialTag = getTagFromUrl() || initialTag || tags[0] || ''
    if (nextInitialTag) {
      setTag(nextInitialTag, !getTagFromUrl())
    }

    function handlePopState() {
      const nextTag = resolveTag(getTagFromUrl())
      if (nextTag !== active) {
        setTag(nextTag, false)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
    // active intentionally omitted to avoid rebinding on every click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTag, tagSet, tags])

  return (
    <ul className={styles.tags}>
      {tags.map((tag) => (
        <li key={tag} className={active === tag ? styles.active : ''}>
          <button type="button" onClick={() => setTag(tag)}>
            <FontAwesomeIcon icon={faTag} className={styles.tagIcon} /> {tag}
          </button>
        </li>
      ))}
    </ul>
  )
}
