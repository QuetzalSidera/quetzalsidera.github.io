'use client'

import {
  type CSSProperties,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import styles from './MindMap.module.css'

type MindMapStyle = CSSProperties & {
  '--mindmap-height': string
  '--mindmap-print-height': string
}

type MindMapProps = {
  source?: string
  title?: string
  height?: string | number
  printHeight?: string | number
  interactive?: boolean | string
}

function readBoolean(value: boolean | string | undefined, fallback: boolean) {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function readLength(value: string | number | undefined, fallback: string) {
  if (typeof value === 'number') return `${value}px`
  if (
    typeof value === 'string' &&
    /^\d+(?:\.\d+)?(?:px|rem|em|vh|vw|mm|cm|in|pt)$/.test(value)
  ) {
    return value
  }
  return fallback
}

export function MindMap({
  source = '',
  title = '思维导图',
  height,
  printHeight,
  interactive = true,
}: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const markmapRef = useRef<import('markmap-view').Markmap | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const titleId = useId()
  const canInteract = readBoolean(interactive, true)
  const style: MindMapStyle = {
    '--mindmap-height': readLength(height, '28rem'),
    '--mindmap-print-height': readLength(printHeight, '112mm'),
  }

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !source.trim()) return

    let disposed = false

    async function renderMindMap(svgElement: SVGSVGElement) {
      try {
        const [{ Transformer }, { Markmap }] = await Promise.all([
          import('markmap-lib'),
          import('markmap-view'),
        ])
        if (disposed) return

        const transformer = new Transformer()
        const { root } = transformer.transform(source)
        const markmap = Markmap.create(
          svgElement,
          {
            autoFit: false,
            duration: canInteract ? 240 : 0,
            fitRatio: 0.92,
            maxInitialScale: 1.4,
            maxWidth: 220,
            pan: canInteract,
            scrollForPan: false,
            spacingHorizontal: 90,
            spacingVertical: 8,
            zoom: canInteract,
          },
        )
        markmapRef.current = markmap
        await markmap.setData(root)
        await markmap.fit()
        if (!disposed) {
          setIsReady(true)
          setHasError(false)
        }
      } catch (error) {
        if (!disposed) {
          setHasError(true)
          console.error('Failed to render mind map.', error)
        }
      }
    }

    void renderMindMap(svg)

    let screenTransform: string | null | undefined
    const fitForPrint = () => {
      const markmap = markmapRef.current
      if (!markmap) return

      const root = svg.closest<HTMLElement>('[data-mindmap]')
      root?.setAttribute('data-print-sizing', 'true')
      if (screenTransform === undefined) {
        screenTransform = markmap.g.attr('transform')
      }

      const { width, height } = svg.getBoundingClientRect()
      const { x1, x2, y1, y2 } = markmap.state.rect
      const contentWidth = x2 - x1
      const contentHeight = y2 - y1
      if (!width || !height || !contentWidth || !contentHeight) return

      const scale = Math.min(
        (width / contentWidth) * markmap.options.fitRatio,
        (height / contentHeight) * markmap.options.fitRatio,
        markmap.options.maxInitialScale,
      )
      const translateX = (width - contentWidth * scale) / 2 - x1 * scale
      const translateY = (height - contentHeight * scale) / 2 - y1 * scale
      markmap.g.attr(
        'transform',
        `translate(${translateX},${translateY}) scale(${scale})`,
      )
    }
    const restoreAfterPrint = () => {
      svg.closest<HTMLElement>('[data-mindmap]')?.removeAttribute('data-print-sizing')
      if (screenTransform === undefined) return
      markmapRef.current?.g.attr('transform', screenTransform)
      screenTransform = undefined
    }
    window.addEventListener('beforeprint', fitForPrint)
    window.addEventListener('afterprint', restoreAfterPrint)

    return () => {
      disposed = true
      window.removeEventListener('beforeprint', fitForPrint)
      window.removeEventListener('afterprint', restoreAfterPrint)
      markmapRef.current?.destroy()
      markmapRef.current = null
    }
  }, [canInteract, source])

  async function fitView() {
    await markmapRef.current?.fit()
  }

  if (!source.trim()) return null

  return (
    <figure
      className={styles.root}
      style={style}
      data-mindmap=""
      data-ready={isReady ? 'true' : 'false'}
      data-error={hasError ? 'true' : 'false'}
    >
      <div className={styles.headingRow}>
        <figcaption className={styles.title} id={titleId}>
          {title}
        </figcaption>
        {canInteract && isReady ? (
          <button className={styles.fitButton} type="button" onClick={fitView}>
            适合画布
          </button>
        ) : null}
      </div>
      <svg
        ref={svgRef}
        className={styles.canvas}
        role="img"
        aria-labelledby={titleId}
      />
      <pre className={styles.fallback} aria-hidden={isReady && !hasError}>
        {source}
      </pre>
    </figure>
  )
}
