'use client'

import { createPortal } from 'react-dom'
import {
  type CSSProperties,
  type ComponentPropsWithoutRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { getPageOverlayRoot } from '@/components/shared/PageOverlayRoot'
import styles from './LightboxImage.module.css'

type LightboxImageProps = Omit<
  ComponentPropsWithoutRef<'img'>,
  'alt' | 'children' | 'src' | 'style'
> & {
  src?: string
  alt?: string
  caption?: string
  style?: CSSProperties | string
}

type ScrollLockSnapshot = {
  body: {
    overflow: string
    overscrollBehavior: string
    touchAction: string
  }
  documentElement: {
    overflow: string
    overscrollBehavior: string
    touchAction: string
  }
}

function parseStyle(style: CSSProperties | string | undefined): CSSProperties | undefined {
  if (!style) return undefined
  if (typeof style !== 'string') return style

  const parsed: Record<string, string> = {}
  for (const declaration of style.split(';')) {
    const separator = declaration.indexOf(':')
    if (separator < 0) continue
    const property = declaration.slice(0, separator).trim()
    const value = declaration.slice(separator + 1).trim()
    if (!property || !value) continue

    const camelProperty = property.replace(/-([a-z])/g, (_, character: string) =>
      character.toUpperCase(),
    )
    parsed[camelProperty] = value
  }

  return parsed
}

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('hidden'))
}

export function LightboxImage({
  src,
  alt = '',
  caption,
  className,
  style,
  ...imageProps
}: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  const bodyStyleSnapshotRef = useRef<ScrollLockSnapshot | null>(null)
  const scrollYRef = useRef(0)
  const dialogId = useId()

  const closeLightbox = useCallback(() => {
    setIsOpen(false)
  }, [])

  const openLightbox = useCallback(() => {
    previousActiveElementRef.current = triggerRef.current
    setIsOpen(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    const body = document.body
    const documentElement = document.documentElement
    scrollYRef.current = window.scrollY
    bodyStyleSnapshotRef.current = {
      body: {
        overflow: body.style.overflow,
        overscrollBehavior: body.style.overscrollBehavior,
        touchAction: body.style.touchAction,
      },
      documentElement: {
        overflow: documentElement.style.overflow,
        overscrollBehavior: documentElement.style.overscrollBehavior,
        touchAction: documentElement.style.touchAction,
      },
    }
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    body.style.touchAction = 'none'
    documentElement.style.overflow = 'hidden'
    documentElement.style.overscrollBehavior = 'none'
    documentElement.style.touchAction = 'none'

    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus({ preventScroll: true })
    }, 0)

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeLightbox()
        return
      }

      if (event.key !== 'Tab') return
      const dialog = dialogRef.current
      if (!dialog) return

      const focusableElements = getFocusableElements(dialog)
      if (!focusableElements.length) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
      const active = document.activeElement
      if (!dialog.contains(active)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || active === dialog)) {
        event.preventDefault()
        first.focus()
      }
    }

    function handleBeforePrint() {
      closeLightbox()
    }

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('beforeprint', handleBeforePrint)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('beforeprint', handleBeforePrint)

      const snapshot = bodyStyleSnapshotRef.current
      if (snapshot) {
        body.style.overflow = snapshot.body.overflow
        body.style.overscrollBehavior = snapshot.body.overscrollBehavior
        body.style.touchAction = snapshot.body.touchAction
        documentElement.style.overflow = snapshot.documentElement.overflow
        documentElement.style.overscrollBehavior = snapshot.documentElement.overscrollBehavior
        documentElement.style.touchAction = snapshot.documentElement.touchAction
        bodyStyleSnapshotRef.current = null
      }

      window.scrollTo({ top: scrollYRef.current, behavior: 'auto' })

      const previousActiveElement = previousActiveElementRef.current
      previousActiveElement?.focus({ preventScroll: true })
      previousActiveElementRef.current = null
    }
  }, [closeLightbox, isOpen])

  if (!src) return null

  const thumbnailClassName = [styles.thumbnail, className].filter(Boolean).join(' ')
  const normalizedStyle = parseStyle(style)

  return (
    <>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        data-lightbox-trigger="true"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? dialogId : undefined}
        aria-label={`查看大图：${alt || '图片'}`}
        onClick={openLightbox}
      >
        <img
          {...imageProps}
          className={thumbnailClassName}
          src={src}
          alt={alt}
          style={normalizedStyle}
        />
      </button>
      {isOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className={styles.overlay}
              data-lightbox-overlay="true"
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) closeLightbox()
              }}
            >
              <div
                ref={dialogRef}
                id={dialogId}
                className={styles.dialog}
                data-lightbox-dialog="true"
                role="dialog"
                aria-modal="true"
                aria-label={`图像预览：${alt || '图片'}`}
                tabIndex={-1}
              >
                <button
                  ref={closeRef}
                  className={styles.closeButton}
                  type="button"
                  data-lightbox-close="true"
                  aria-label="关闭图像预览"
                  onClick={closeLightbox}
                >
                  <span aria-hidden="true">×</span>
                </button>
                <figure className={styles.previewFigure}>
                  <img
                    className={styles.previewImage}
                    data-lightbox-image="true"
                    src={src}
                    alt={alt}
                  />
                  {caption ? <figcaption>{caption}</figcaption> : null}
                </figure>
              </div>
            </div>,
            getPageOverlayRoot(),
          )
        : null}
    </>
  )
}
