'use client'

import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import styles from './Flow.module.css'

type FlowMode = 'block' | 'float' | 'split'
type FlowSide = 'left' | 'right'
type FlowPrintMode = 'block' | 'preserve'
type CssLength = number | string

type FlowStyle = CSSProperties & {
  '--flow-media-width': string
  '--flow-min-text-width': string
}

export type ContentFlowProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  children: ReactNode
  mode?: FlowMode
  side?: FlowSide
  mediaWidth?: CssLength
  minTextWidth?: CssLength
  print?: FlowPrintMode
}

export type FlowMediaProps = ComponentPropsWithoutRef<'div'>
export type FlowBodyProps = ComponentPropsWithoutRef<'div'>

function toCssLength(value: CssLength): string {
  return typeof value === 'number' ? `${value}px` : value
}

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(' ')
}

function findDirectMedia(container: HTMLDivElement): HTMLElement | null {
  return (
    Array.from(container.children).find(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.dataset.flowMedia === 'true',
    ) ?? null
  )
}

export function ContentFlow({
  children,
  mode = 'block',
  side = 'left',
  mediaWidth = 'min(42%, 24rem)',
  minTextWidth = '18rem',
  print = 'block',
  className,
  style,
  ...props
}: ContentFlowProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mediaWidthProbeRef = useRef<HTMLSpanElement>(null)
  const minTextProbeRef = useRef<HTMLSpanElement>(null)
  const gapProbeRef = useRef<HTMLSpanElement>(null)
  const [stacked, setStacked] = useState(false)
  const mediaWidthValue = toCssLength(mediaWidth)
  const minTextWidthValue = toCssLength(minTextWidth)
  const flowStyle: FlowStyle = {
    ...style,
    '--flow-media-width': mediaWidthValue,
    '--flow-min-text-width': minTextWidthValue,
  }

  useEffect(() => {
    if (mode === 'block') {
      setStacked(false)
      return
    }

    const container = containerRef.current
    const mediaWidthProbe = mediaWidthProbeRef.current
    const minTextProbe = minTextProbeRef.current
    const gapProbe = gapProbeRef.current
    if (!container || !mediaWidthProbe || !minTextProbe || !gapProbe) return

    const media = findDirectMedia(container)
    if (!media) {
      setStacked(false)
      return
    }

    let animationFrame = 0

    const measure = () => {
      animationFrame = 0

      const containerStyle = window.getComputedStyle(container)
      const horizontalPadding =
        Number.parseFloat(containerStyle.paddingLeft) +
        Number.parseFloat(containerStyle.paddingRight)
      const availableWidth = container.clientWidth - horizontalPadding
      const mediaWidthPx = mediaWidthProbe.getBoundingClientRect().width
      const minTextWidthPx = minTextProbe.getBoundingClientRect().width
      const gapWidthPx = gapProbe.getBoundingClientRect().width
      const remainingTextWidth = availableWidth - mediaWidthPx - gapWidthPx

      setStacked((current) => {
        const next = remainingTextWidth + 0.5 < minTextWidthPx
        return current === next ? current : next
      })
    }

    const scheduleMeasure = () => {
      if (animationFrame) return
      animationFrame = window.requestAnimationFrame(measure)
    }

    scheduleMeasure()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', scheduleMeasure)
      return () => {
        window.removeEventListener('resize', scheduleMeasure)
        window.cancelAnimationFrame(animationFrame)
      }
    }

    const observer = new ResizeObserver(scheduleMeasure)
    observer.observe(container)
    observer.observe(media)
    observer.observe(mediaWidthProbe)
    observer.observe(minTextProbe)
    observer.observe(gapProbe)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(animationFrame)
    }
  }, [mediaWidthValue, minTextWidthValue, mode])

  return (
    <div
      {...props}
      ref={containerRef}
      className={joinClassNames(styles.root, className)}
      style={flowStyle}
      data-mode={mode}
      data-side={side}
      data-print={print}
      data-stacked={stacked ? 'true' : 'false'}
    >
      {children}
      <span
        ref={mediaWidthProbeRef}
        className={joinClassNames(styles.measureProbe, styles.mediaWidthProbe)}
        aria-hidden="true"
      />
      <span
        ref={minTextProbeRef}
        className={joinClassNames(styles.measureProbe, styles.minTextProbe)}
        aria-hidden="true"
      />
      <span
        ref={gapProbeRef}
        className={joinClassNames(styles.measureProbe, styles.gapProbe)}
        aria-hidden="true"
      />
    </div>
  )
}

export function FlowMedia({ className, ...props }: FlowMediaProps) {
  return (
    <div
      {...props}
      className={joinClassNames(styles.media, className)}
      data-flow-media="true"
    />
  )
}

export function FlowBody({ className, ...props }: FlowBodyProps) {
  return (
    <div
      {...props}
      className={joinClassNames(styles.body, className)}
      data-flow-body="true"
    />
  )
}
