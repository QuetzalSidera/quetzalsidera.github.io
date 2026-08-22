'use client'

import { useEffect, useId, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShareNodes } from '@fortawesome/free-solid-svg-icons'
import { QRCodeSVG } from 'qrcode.react'
import { useBlogRuntime } from '@/components/runtime/BlogRuntime'
import { siteMeta } from '@/lib/site'
import { AnchoredSidePanel } from './AnchoredSidePanel'
import { usePageSidePanel } from './PageSideActionsContext'
import actionStyles from './PageSideActions.module.css'
import styles from './ShareControl.module.css'

type ShareControlProps = {
  title: string
  description?: string
  url: string
}

async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      // Fall through for browsers that expose the API but deny access to it.
    }
  }

  const activeElement =
    document.activeElement instanceof HTMLElement ? document.activeElement : null
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    if (!document.execCommand('copy')) {
      throw new Error('The browser rejected the copy command.')
    }
  } finally {
    textarea.remove()
    activeElement?.focus({ preventScroll: true })
  }
}

export function ShareControl({ description, title, url }: ShareControlProps) {
  const { pushBannerMessage } = useBlogRuntime()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeTimerRef = useRef<number | null>(null)
  const panelId = useId()
  const {
    closePanel: closePanelState,
    isOpen,
    openPanel: openPanelState,
  } = usePageSidePanel(panelId)
  const canonicalUrl = new URL(url, siteMeta.hostname).toString()
  const summary = description || siteMeta.description

  function cancelClose() {
    if (closeTimerRef.current === null) return
    window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }

  function handleOpen() {
    cancelClose()
    openPanelState()
  }

  function handleClose() {
    cancelClose()
    closePanelState()
  }

  function scheduleClose() {
    cancelClose()
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      closePanelState()
    }, 180)
  }

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    },
    [],
  )

  async function copyShareLink() {
    handleOpen()

    try {
      await copyToClipboard(`【QuetzalSidera的个人博客｜${title}】${canonicalUrl}`)
      pushBannerMessage({
        id: 'share-copy-feedback',
        text: '已复制分享链接。',
      })
    } catch {
      pushBannerMessage({
        id: 'share-copy-feedback',
        type: 'error',
        text: '无法复制分享链接，请检查浏览器权限。',
      })
    } finally {
      handleOpen()
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        className={actionStyles.actionButton}
        type="button"
        aria-controls={panelId}
        aria-describedby={isOpen ? panelId : undefined}
        aria-expanded={isOpen}
        aria-label="复制分享链接"
        title="复制分享链接"
        onPointerEnter={handleOpen}
        onPointerLeave={scheduleClose}
        onFocus={handleOpen}
        onBlur={scheduleClose}
        onClick={copyShareLink}
      >
        <FontAwesomeIcon icon={faShareNodes} className={actionStyles.actionIcon} />
      </button>

      <AnchoredSidePanel
        open={isOpen}
        anchorRef={triggerRef}
        id={panelId}
        ariaLabel={`分享《${title}》`}
        desktopWidth={336}
        role="tooltip"
        onClose={handleClose}
        onPointerEnter={handleOpen}
        onPointerLeave={scheduleClose}
      >
        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.body}>
            <p className={styles.description}>{summary}</p>
            <figure className={styles.qrFigure}>
              <div className={styles.qrCode}>
                <QRCodeSVG
                  value={canonicalUrl}
                  level="M"
                  marginSize={4}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  aria-hidden="true"
                />
              </div>
            </figure>
          </div>
          <p className={styles.qrCaption} data-share-qr-caption="">
            扫描二维码，在其他设备上查看此文章
          </p>
        </div>
      </AnchoredSidePanel>
    </>
  )
}
