'use client'

import { useEffect, useRef } from 'react'
import { useBlogRuntime } from '@/components/runtime/BlogRuntime'
import { blogThemeConfig } from '@/lib/site'
import styles from './GiscusComments.module.css'

const giscusThemeFiles = {
  light: '/styles/giscus-arona.css',
  dark: '/styles/giscus-plana.css',
} as const
const giscusThemeVersion = '20260529-safari5'

type GiscusElement = HTMLElement & {
  iframeRef?: HTMLIFrameElement
  repo: string
  repoId: string
  category: string
  categoryId: string
  mapping: string
  strict: string
  reactionsEnabled: string
  emitMetadata: string
  inputPosition: string
  theme: string
  lang: string
  loading: string
}

function getGiscusTheme(theme: 'light' | 'dark') {
  if (typeof window === 'undefined' || window.location.protocol !== 'https:') {
    return theme === 'dark' ? 'transparent_dark' : 'light'
  }

  const themeUrl = new URL(giscusThemeFiles[theme], window.location.origin)
  themeUrl.searchParams.set('v', giscusThemeVersion)
  return themeUrl.toString()
}

function setGiscusFrameTheme(widget: GiscusElement, theme: string) {
  const frame =
    widget.iframeRef ??
    widget.shadowRoot?.querySelector<HTMLIFrameElement>('iframe') ??
    document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')

  frame?.contentWindow?.postMessage(
    {
      giscus: {
        setConfig: {
          theme,
        },
      },
    },
    'https://giscus.app',
  )
}

export function GiscusComments() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetRef = useRef<GiscusElement | null>(null)
  const { effectiveTheme } = useBlogRuntime()
  const config = blogThemeConfig.giscus

  function applyWidgetConfig(widget: GiscusElement, theme: string) {
    if (!config) return

    widget.repo = config.repo
    widget.repoId = config.repoId
    widget.category = config.category
    widget.categoryId = config.categoryId
    widget.mapping = 'pathname'
    widget.strict = '0'
    widget.reactionsEnabled = '1'
    widget.emitMetadata = '0'
    widget.inputPosition = 'bottom'
    widget.theme = theme
    widget.lang = 'zh-CN'
    widget.loading = 'lazy'
  }

  useEffect(() => {
    if (!config || !containerRef.current) return

    let disposed = false
    let syncTimer: number | undefined
    const theme = getGiscusTheme(effectiveTheme)

    async function mountWidget() {
      await import('giscus')

      if (disposed || !containerRef.current) return

      const widget = document.createElement('giscus-widget') as GiscusElement
      applyWidgetConfig(widget, theme)
      widgetRef.current = widget
      containerRef.current.replaceChildren(widget)

      syncTimer = window.setTimeout(() => setGiscusFrameTheme(widget, theme), 160)
    }

    mountWidget()

    return () => {
      disposed = true
      if (syncTimer) {
        window.clearTimeout(syncTimer)
      }
      widgetRef.current = null
      containerRef.current?.replaceChildren()
    }
  }, [config, effectiveTheme])

  useEffect(() => {
    const widget = widgetRef.current
    if (!widget || !config) return

    const theme = getGiscusTheme(effectiveTheme)
    applyWidgetConfig(widget, theme)
    setGiscusFrameTheme(widget, theme)
    const timer = window.setTimeout(() => setGiscusFrameTheme(widget, theme), 120)

    return () => window.clearTimeout(timer)
  }, [config, effectiveTheme])

  if (!config) {
    return null
  }

  return (
    <section className={[styles.giscusContainer, 'giscus'].join(' ')} aria-label="评论区">
      <div className={styles.giscusInner} ref={containerRef} />
    </section>
  )
}
