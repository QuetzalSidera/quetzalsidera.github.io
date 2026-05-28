'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import MiniSearch, { type SearchResult } from 'minisearch'
import type { SearchDocument } from '@/lib/search'
import styles from './SearchDialog.module.css'

type SearchDialogProps = {
  onClose: () => void
}

type StoredSearchResult = SearchResult & {
  title?: string
  href?: string
  excerpt?: string
  content?: string
}

function stripMarkdown(value: string) {
  return value
    .replace(/<script\s+setup(?:\s+[^>]*)?>[\s\S]*?<\/script>/gi, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[#>*_`~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSummary(result: StoredSearchResult) {
  const summary = result.excerpt || (typeof result.content === 'string' ? stripMarkdown(result.content) : '')
  return summary || '暂无摘要'
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getSearchTerms(query: string) {
  return Array.from(
    new Set(query.trim().split(/\s+/).filter((term) => term.length > 0).sort((a, b) => b.length - a.length)),
  )
}

function renderHighlightedText(text: string, query: string) {
  const terms = getSearchTerms(query)
  if (!terms.length) return text

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi')
  return text.split(pattern).map((part, index) => {
    const matched = terms.some((term) => part.toLowerCase() === term.toLowerCase())
    return matched ? (
      <mark key={`${part}-${index}`} className={styles.highlight}>
        {part}
      </mark>
    ) : (
      part
    )
  })
}

export function SearchDialog({ onClose }: SearchDialogProps) {
  const [searchStr, setSearchStr] = useState('')
  const [status, setStatus] = useState('搜索索引加载中……')
  const [resultList, setResultList] = useState<StoredSearchResult[]>([])
  const [closing, setClosing] = useState(false)
  const [documents, setDocuments] = useState<SearchDocument[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const miniSearch = useMemo(() => {
    const search = new MiniSearch<SearchDocument>({
      fields: ['title', 'content'],
      storeFields: ['title', 'href', 'excerpt', 'content'],
      searchOptions: {
        fuzzy: 0.3,
      },
    })
    search.addAll(documents ?? [])
    return search
  }, [documents])

  useEffect(() => {
    let cancelled = false

    fetch('/search-index')
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load search index: ${response.status}`)
        return response.json() as Promise<SearchDocument[]>
      })
      .then((nextDocuments) => {
        if (cancelled) return
        setDocuments(nextDocuments)
        setStatus('这里空空的')
      })
      .catch(() => {
        if (cancelled) return
        setLoadFailed(true)
        setStatus('搜索索引加载失败')
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!documents) {
      setResultList([])
      setStatus(loadFailed ? '搜索索引加载失败' : '搜索索引加载中……')
      return undefined
    }

    if (!searchStr) {
      setStatus('这里空空的')
      setResultList([])
      return undefined
    }

    setStatus('搜索中……')
    const timer = window.setTimeout(() => {
      const results = miniSearch.search(searchStr).slice(0, 5) as StoredSearchResult[]
      setResultList(results)
      setStatus(results.length ? '搜到了~' : '这里空空的')
    }, 500)

    return () => window.clearTimeout(timer)
  }, [miniSearch, searchStr])

  function closeDialog() {
    setClosing(true)
    window.setTimeout(onClose, 200)
  }

  return (
    <div className={[styles.searchDialog, closing ? styles.hideDialog : ''].filter(Boolean).join(' ')}>
      <div className={styles.dialogCover} onClick={closeDialog} />
      <div className={styles.dialogContent}>
        <button type="button" className={styles.closeBtn} onClick={closeDialog} aria-label="关闭搜索">
          ×
        </button>
        <span className={styles.title}>搜索</span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="请输入关键字"
          value={searchStr}
          onChange={(event) => setSearchStr(event.target.value)}
          autoFocus
        />
        <ul className={styles.searchList}>
          <span className={styles.status}>{status}</span>
          {resultList.map((result, index) => (
            <li
              key={`${result.href}-${result.id}`}
              className={styles.searchItem}
              style={{ animationDelay: `${index * 55}ms` }}
              onClick={closeDialog}
            >
              <Link href={result.href ?? '/'} className={styles.searchLink}>
                <span className={styles.resultTitle}>
                  {renderHighlightedText(result.title ?? '无标题', searchStr)}
                </span>
                <span className={styles.resultExcerpt}>
                  {renderHighlightedText(getSummary(result), searchStr)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
