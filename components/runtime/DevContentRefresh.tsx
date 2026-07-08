'use client'

import { useEffect } from 'react'
import { useBlogRuntime } from './BlogRuntime'

const refreshQuietMs = 1200
const reconnectDelayMs = 1200
const readyRetryDelayMs = 500
const maxReadyRetries = 10
const webpackRuntimeRaceMessage = "Cannot read properties of undefined (reading 'call')"
const skipSplashStorageKey = 'blog-dev-skip-splash-once'
const skipPageMotionStorageKey = 'blog-dev-skip-page-motion-once'

function isWebpackRuntimeRace(message: string, stack: string, source: string) {
  return (
    message.includes(webpackRuntimeRaceMessage) &&
    (source.includes('/_next/static/chunks/webpack.js') ||
      stack.includes('webpack.js') ||
      stack.includes('__webpack_require__') ||
      stack.includes('options.factory'))
  )
}

async function waitForCurrentDocumentReady() {
  for (let attempt = 0; attempt < maxReadyRetries; attempt += 1) {
    try {
      const response = await fetch(window.location.href, {
        cache: 'no-store',
        headers: {
          'x-dev-content-refresh': '1',
        },
      })

      if (response.ok) {
        return true
      }
    } catch {
      // Retry while Next dev finishes compiling the current route.
    }

    await new Promise((resolve) => window.setTimeout(resolve, readyRetryDelayMs))
  }

  return false
}

function markNextDevReload() {
  try {
    window.sessionStorage.setItem(skipSplashStorageKey, '1')
    window.sessionStorage.setItem(skipPageMotionStorageKey, '1')
  } catch {
    // sessionStorage can be disabled; the reload still needs to proceed.
  }
}

export function DevContentRefresh() {
  const { pushBannerMessage, removeBannerMessage } = useBlogRuntime()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return undefined
    }

    let eventSource: EventSource | undefined
    let refreshTimer: number | undefined
    let reconnectTimer: number | undefined
    let reloading = false
    let disposed = false

    async function reloadWhenReady() {
      if (disposed || reloading) {
        return
      }

      pushBannerMessage({
        id: 'dev-content-refresh',
        type: 'info',
        text: '内容已更新，等待编译完成……',
        duration: 0,
      })

      const ready = await waitForCurrentDocumentReady()
      if (disposed || reloading) {
        return
      }

      reloading = true
      eventSource?.close()
      pushBannerMessage({
        id: 'dev-content-refresh',
        type: ready ? 'info' : 'warn',
        text: ready ? '内容已更新，正在重新加载……' : '内容已更新，重新加载以恢复状态……',
        duration: 0,
      })
      markNextDevReload()
      window.location.reload()
    }

    function connect() {
      eventSource = new EventSource('/dev-content-events/')

      eventSource.addEventListener('content-change', () => {
        window.clearTimeout(refreshTimer)
        refreshTimer = window.setTimeout(reloadWhenReady, refreshQuietMs)
      })

      eventSource.onerror = () => {
        eventSource?.close()
        eventSource = undefined

        if (disposed) {
          return
        }

        window.clearTimeout(reconnectTimer)
        reconnectTimer = window.setTimeout(connect, reconnectDelayMs)
      }
    }

    connect()

    function recoverFromWebpackRuntimeError(event: ErrorEvent) {
      const message = String(event.message || event.error?.message || '')
      const stack = String(event.error?.stack || '')
      const source = String(event.filename || '')
      if (!isWebpackRuntimeRace(message, stack, source)) {
        return
      }

      event.preventDefault()
      event.stopImmediatePropagation()
      if (reloading) {
        return
      }

      reloading = true
      eventSource?.close()
      pushBannerMessage({
        id: 'dev-content-refresh',
        type: 'warn',
        text: '检测到开发服务器热更新竞态，正在重新加载……',
        duration: 0,
      })
      markNextDevReload()
      window.setTimeout(() => window.location.reload(), 250)
    }

    function recoverFromWebpackRuntimeRejection(event: PromiseRejectionEvent) {
      const reason = event.reason || {}
      const message = String(reason.message || reason || '')
      const stack = String(reason.stack || '')
      if (!isWebpackRuntimeRace(message, stack, '')) {
        return
      }

      event.preventDefault()
      event.stopImmediatePropagation()
      if (reloading) {
        return
      }

      reloading = true
      eventSource?.close()
      pushBannerMessage({
        id: 'dev-content-refresh',
        type: 'warn',
        text: '检测到开发服务器热更新竞态，正在重新加载……',
        duration: 0,
      })
      markNextDevReload()
      window.setTimeout(() => window.location.reload(), 250)
    }

    window.addEventListener('error', recoverFromWebpackRuntimeError, true)
    window.addEventListener('unhandledrejection', recoverFromWebpackRuntimeRejection, true)

    return () => {
      disposed = true
      eventSource?.close()
      window.clearTimeout(refreshTimer)
      window.clearTimeout(reconnectTimer)
      window.removeEventListener('error', recoverFromWebpackRuntimeError, true)
      window.removeEventListener('unhandledrejection', recoverFromWebpackRuntimeRejection, true)
      removeBannerMessage('dev-content-refresh')
    }
  }, [pushBannerMessage, removeBannerMessage])

  return null
}
