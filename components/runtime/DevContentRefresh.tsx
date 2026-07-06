'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBlogRuntime } from './BlogRuntime'

const refreshDelayMs = 180
const reconnectDelayMs = 1200

export function DevContentRefresh() {
  const router = useRouter()
  const { pushBannerMessage, removeBannerMessage } = useBlogRuntime()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return undefined
    }

    let eventSource: EventSource | undefined
    let refreshTimer: number | undefined
    let reconnectTimer: number | undefined
    let disposed = false

    function connect() {
      eventSource = new EventSource('/dev-content-events/')

      eventSource.addEventListener('content-change', () => {
        window.clearTimeout(refreshTimer)
        refreshTimer = window.setTimeout(() => {
          pushBannerMessage({
            id: 'dev-content-refresh',
            type: 'info',
            text: '内容已更新，正在刷新……',
            duration: 1200,
          })
          router.refresh()
        }, refreshDelayMs)
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

    return () => {
      disposed = true
      eventSource?.close()
      window.clearTimeout(refreshTimer)
      window.clearTimeout(reconnectTimer)
      removeBannerMessage('dev-content-refresh')
    }
  }, [pushBannerMessage, removeBannerMessage, router])

  return null
}
