'use client'

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { useBlogRuntime } from '@/components/runtime/BlogRuntime'
import styles from './Diagram.module.css'

type DiagramProps = {
  source?: string
  title?: string
}

type RenderStatus = 'loading' | 'ready' | 'error'

type RenderState = {
  key: string
  status: RenderStatus
  svg: string
  width: string
}

type DiagramStyle = CSSProperties & {
  '--diagram-intrinsic-width': string
}

let renderQueue = Promise.resolve()

function safeMermaidId(reactId: string) {
  const suffix = Array.from(reactId, (character) =>
    character.codePointAt(0)!.toString(36),
  ).join('-')
  return `mermaid-diagram-${suffix}`
}

function inspectSvg(svg: string) {
  const document = new DOMParser().parseFromString(svg, 'image/svg+xml')
  const root = document.documentElement

  if (
    root.localName !== 'svg' ||
    root.namespaceURI !== 'http://www.w3.org/2000/svg' ||
    document.querySelector('parsererror')
  ) {
    throw new Error('Mermaid returned invalid SVG output.')
  }

  const viewBox = root.getAttribute('viewBox')?.trim().split(/[\s,]+/).map(Number)
  const viewBoxWidth = viewBox?.length === 4 ? (viewBox[2] ?? Number.NaN) : Number.NaN
  const width = Number.isFinite(viewBoxWidth) && viewBoxWidth > 0
    ? `${Math.ceil(viewBoxWidth)}px`
    : '100%'

  return { svg, width }
}

function readDiagramTheme() {
  const rootStyle = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string) =>
    rootStyle.getPropertyValue(name).trim() || fallback
  const surface = read('--foreground-color', '#fff')
  const text = read('--font-color-grey', '#4c5866')
  const accent = read('--color-blue', '#128afa')
  const divider = read('--post-viewer-table-border', '#cad4d5')
  const primary = read('--post-viewer-table-header-bg', '#e7f6fa')
  const secondary = read('--post-viewer-table-cell-bg', '#f7f7f6')

  return {
    fontFamily: getComputedStyle(document.body).fontFamily,
    themeVariables: {
      background: surface,
      primaryColor: primary,
      primaryTextColor: text,
      primaryBorderColor: accent,
      secondaryColor: secondary,
      secondaryTextColor: text,
      secondaryBorderColor: divider,
      tertiaryColor: surface,
      tertiaryTextColor: text,
      tertiaryBorderColor: divider,
      lineColor: text,
      edgeLabelBackground: surface,
      noteBkgColor: secondary,
      noteTextColor: text,
      noteBorderColor: divider,
    },
  }
}

function renderMermaid(
  source: string,
  id: string,
  theme: ReturnType<typeof readDiagramTheme>,
) {
  const task = renderQueue.then(async () => {
    const { default: mermaid } = await import('mermaid')

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      look: 'classic',
      theme: 'base',
      fontFamily: theme.fontFamily,
      themeVariables: theme.themeVariables,
      htmlLabels: false,
      flowchart: {
        curve: 'linear',
        htmlLabels: false,
      },
    })

    const { svg } = await mermaid.render(id, source)
    return inspectSvg(svg)
  })

  renderQueue = task.then(
    () => undefined,
    () => undefined,
  )
  return task
}

export function Diagram({ source = '', title = '关系图' }: DiagramProps) {
  const { effectiveTheme } = useBlogRuntime()
  const reactId = useId()
  const requestRef = useRef(0)
  const [renderState, setRenderState] = useState<RenderState>({
    key: '',
    status: 'loading',
    svg: '',
    width: '100%',
  })
  const trimmedSource = source.trim()
  const renderKey = `${effectiveTheme}\u0000${trimmedSource}`
  const diagramId = safeMermaidId(reactId)

  useEffect(() => {
    if (!trimmedSource) return

    const request = ++requestRef.current
    let disposed = false

    setRenderState((current) => ({
      key: renderKey,
      status: 'loading',
      svg: current.key === renderKey ? current.svg : '',
      width: current.key === renderKey ? current.width : '100%',
    }))

    async function render() {
      try {
        const result = await renderMermaid(
          trimmedSource,
          `${diagramId}-${request}`,
          readDiagramTheme(),
        )
        if (disposed || requestRef.current !== request) return

        setRenderState({
          key: renderKey,
          status: 'ready',
          svg: result.svg,
          width: result.width,
        })
      } catch (error) {
        if (disposed || requestRef.current !== request) return

        setRenderState({
          key: renderKey,
          status: 'error',
          svg: '',
          width: '100%',
        })
        console.error('Failed to render Mermaid diagram.', error)
      }
    }

    void render()

    return () => {
      disposed = true
    }
  }, [diagramId, effectiveTheme, renderKey, trimmedSource])

  if (!trimmedSource) return null

  const isCurrent = renderState.key === renderKey
  const isReady = isCurrent && renderState.status !== 'loading'
  const hasError = isCurrent && renderState.status === 'error'
  const renderedSvg = isCurrent ? renderState.svg : ''
  const style: DiagramStyle = {
    '--diagram-intrinsic-width': isCurrent ? renderState.width : '100%',
  }

  return (
    <figure
      className={styles.root}
      data-diagram=""
      data-ready={isReady ? 'true' : 'false'}
      data-error={hasError ? 'true' : 'false'}
    >
      <figcaption className={styles.title} id={`${diagramId}-title`}>
        {title}
      </figcaption>
      <div
        className={styles.viewport}
        aria-busy={!isReady}
        style={style}
      >
        {renderedSvg ? (
          <div
            className={styles.canvas}
            role="img"
            aria-labelledby={`${diagramId}-title`}
            dangerouslySetInnerHTML={{ __html: renderedSvg }}
          />
        ) : null}
        {hasError || !renderedSvg ? (
          <pre className={styles.fallback}>{source}</pre>
        ) : null}
      </div>
    </figure>
  )
}
