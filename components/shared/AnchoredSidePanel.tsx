'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEventHandler,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { getPageOverlayRoot } from './PageOverlayRoot'
import styles from './AnchoredSidePanel.module.css'

type AnchoredSidePanelProps = {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  id: string
  ariaLabel: string
  desktopWidth?: number
  role?: 'dialog' | 'tooltip'
  onClose: () => void
  children: ReactNode
  onPointerEnter?: PointerEventHandler<HTMLDivElement>
  onPointerLeave?: PointerEventHandler<HTMLDivElement>
}

type PanelPosition = {
  left: number
  top: number
  ready: boolean
  sheet: boolean
}

const VIEWPORT_GAP = 12
const PANEL_GAP = 12
const DEFAULT_DESKTOP_PANEL_WIDTH = 256
const DESKTOP_PANEL_VIEWPORT_ALLOWANCE = 80
const MOBILE_MAX_WIDTH = 600

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum))
}

export function AnchoredSidePanel({
  open,
  anchorRef,
  id,
  ariaLabel,
  desktopWidth = DEFAULT_DESKTOP_PANEL_WIDTH,
  role = 'dialog',
  onClose,
  children,
  onPointerEnter,
  onPointerLeave,
}: AnchoredSidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)
  const [position, setPosition] = useState<PanelPosition>({
    left: VIEWPORT_GAP,
    top: VIEWPORT_GAP,
    ready: false,
    sheet: false,
  })

  useLayoutEffect(() => {
    if (!open) {
      setPosition((current) =>
        current.ready ? { ...current, ready: false } : current,
      )
      return
    }

    function measure() {
      frameRef.current = null
      const anchor = anchorRef.current
      const panel = panelRef.current
      if (!anchor || !panel) return

      const anchorBounds = anchor.getBoundingClientRect()
      const panelBounds = panel.getBoundingClientRect()
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight
      const viewportOffsetLeft = window.visualViewport?.offsetLeft ?? 0
      const viewportOffsetTop = window.visualViewport?.offsetTop ?? 0
      const panelWidth = Math.min(
        desktopWidth,
        Math.max(0, viewportWidth - DESKTOP_PANEL_VIEWPORT_ALLOWANCE),
      )
      const sheet =
        viewportWidth <= MOBILE_MAX_WIDTH ||
        anchorBounds.left - panelWidth - PANEL_GAP < viewportOffsetLeft + VIEWPORT_GAP

      if (sheet) {
        setPosition({ left: VIEWPORT_GAP, top: VIEWPORT_GAP, ready: true, sheet: true })
        return
      }

      const left = clamp(
        anchorBounds.left - panelWidth - PANEL_GAP,
        viewportOffsetLeft + VIEWPORT_GAP,
        viewportOffsetLeft + viewportWidth - panelWidth - VIEWPORT_GAP,
      )
      const top = clamp(
        anchorBounds.top + (anchorBounds.height - panelBounds.height) / 2,
        viewportOffsetTop + VIEWPORT_GAP,
        viewportOffsetTop + viewportHeight - panelBounds.height - VIEWPORT_GAP,
      )
      setPosition({ left, top, ready: true, sheet: false })
    }

    function scheduleMeasure() {
      if (frameRef.current !== null) return
      frameRef.current = window.requestAnimationFrame(measure)
    }

    scheduleMeasure()
    const observer = new ResizeObserver(scheduleMeasure)
    if (anchorRef.current) observer.observe(anchorRef.current)
    if (panelRef.current) observer.observe(panelRef.current)
    window.addEventListener('resize', scheduleMeasure)
    window.addEventListener('scroll', scheduleMeasure, true)
    window.visualViewport?.addEventListener('resize', scheduleMeasure)
    window.visualViewport?.addEventListener('scroll', scheduleMeasure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
      window.removeEventListener('scroll', scheduleMeasure, true)
      window.visualViewport?.removeEventListener('resize', scheduleMeasure)
      window.visualViewport?.removeEventListener('scroll', scheduleMeasure)
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [anchorRef, desktopWidth, open])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return
      onClose()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      onClose()
      anchorRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [anchorRef, onClose, open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={panelRef}
      className={[styles.panel, position.sheet ? styles.sheet : ''].filter(Boolean).join(' ')}
      id={id}
      role={role}
      aria-label={ariaLabel}
      data-anchored-side-panel=""
      data-panel-layout={position.sheet ? 'sheet' : 'anchored'}
      data-panel-ready={position.ready}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{
        '--anchored-panel-width': `${desktopWidth}px`,
        ...(position.sheet ? {} : { left: position.left, top: position.top }),
        visibility: position.ready ? 'visible' : 'hidden',
      } as CSSProperties}
    >
      {children}
    </div>,
    getPageOverlayRoot(),
  )
}
