'use client'

import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation, faCircleInfo, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import type { BannerMessage } from '@/components/runtime/BlogRuntime'
import type { BannerMessageType } from '@/components/runtime/BlogRuntime'
import { useBlogRuntime } from '@/components/runtime/BlogRuntime'
import styles from './BannerMessages.module.css'

const bannerExitMs = 240

const typeIconMap = {
  info: faCircleInfo,
  warn: faTriangleExclamation,
  error: faCircleExclamation,
} satisfies Record<BannerMessageType, typeof faCircleInfo>

type VisibleBannerMessage = BannerMessage & {
  exiting: boolean
}

export function BannerMessages() {
  const { bannerMessages, removeBannerMessage } = useBlogRuntime()
  const [visibleMessages, setVisibleMessages] = useState<VisibleBannerMessage[]>([])
  const exitTimersRef = useRef(new Map<string, number>())

  useEffect(() => {
    const nextIds = new Set(bannerMessages.map((message) => message.id))

    setVisibleMessages((current) => {
      const activeMessages = bannerMessages.map((message) => ({ ...message, exiting: false }))
      const exitingMessages = current
        .filter((message) => !nextIds.has(message.id))
        .map((message) => ({ ...message, exiting: true }))

      return [...activeMessages, ...exitingMessages].slice(-6)
    })
  }, [bannerMessages])

  useEffect(() => {
    for (const message of visibleMessages) {
      const existingTimer = exitTimersRef.current.get(message.id)

      if (!message.exiting) {
        if (existingTimer) {
          window.clearTimeout(existingTimer)
          exitTimersRef.current.delete(message.id)
        }
        continue
      }

      if (!existingTimer) {
        const timer = window.setTimeout(() => {
          exitTimersRef.current.delete(message.id)
          setVisibleMessages((current) => current.filter((item) => item.id !== message.id))
        }, bannerExitMs)
        exitTimersRef.current.set(message.id, timer)
      }
    }
  }, [visibleMessages])

  useEffect(
    () => () => {
      for (const timer of exitTimersRef.current.values()) {
        window.clearTimeout(timer)
      }
      exitTimersRef.current.clear()
    },
    [],
  )

  if (!visibleMessages.length) {
    return null
  }

  return (
    <div className={styles.bannerStack} role="status" aria-live="polite" aria-atomic="false">
      {visibleMessages.map((message, index) => {
        const stackIndex = visibleMessages.length - index - 1

        return (
          <div
            key={message.id}
            className={[
              styles.bannerFrame,
              message.exiting ? styles.bannerFrameExiting : '',
            ].filter(Boolean).join(' ')}
            style={{
              transform: `translate3d(0, ${stackIndex * 8}px, 0) scale(${1 - stackIndex * 0.018})`,
              zIndex: visibleMessages.length - stackIndex,
            }}
          >
            <button
              type="button"
              className={[
                styles.bannerItem,
                styles[message.type],
                message.exiting ? styles.bannerItemExiting : '',
              ].filter(Boolean).join(' ')}
              onClick={() => removeBannerMessage(message.id)}
            >
              <FontAwesomeIcon icon={typeIconMap[message.type]} className={styles.icon} />
              <span className={styles.text}>{message.text}</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
