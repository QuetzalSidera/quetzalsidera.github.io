'use client'

import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import styles from './Poem.module.css'

type PoemProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  children: ReactNode
}

type PoemStyle = CSSProperties & {
  '--poem-height': string
}

export function Poem({ children, className, style, ...props }: PoemProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const measureFrameRef = useRef<number | null>(null)
  const [mediaHeight, setMediaHeight] = useState<number | null>(null)
  const poemStyle: PoemStyle = {
    ...style,
    '--poem-height': mediaHeight === null ? '18rem' : `${mediaHeight}px`,
  }

  useLayoutEffect(() => {
    const root = rootRef.current
    const flow = root?.closest<HTMLElement>('[data-mode]')
    const media = flow
      ? Array.from(flow.children).find(
          (child): child is HTMLElement =>
            child instanceof HTMLElement && child.dataset.flowMedia === 'true',
        )
      : null
    if (!root || !media) return

    const measureMedia = () => {
      const height = media.getBoundingClientRect().height
      if (height > 0) {
        setMediaHeight((current) =>
          current !== null && Math.abs(current - height) < 0.5 ? current : height,
        )
      }
    }

    const scheduleMeasure = () => {
      if (measureFrameRef.current !== null) return
      measureFrameRef.current = window.requestAnimationFrame(() => {
        measureFrameRef.current = null
        measureMedia()
      })
    }

    measureMedia()
    scheduleMeasure()
    window.addEventListener('resize', scheduleMeasure)
    window.addEventListener('beforeprint', scheduleMeasure)
    window.addEventListener('afterprint', scheduleMeasure)
    const images = Array.from(media.querySelectorAll('img'))
    images.forEach((image) => image.addEventListener('load', scheduleMeasure))

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        window.removeEventListener('resize', scheduleMeasure)
        window.removeEventListener('beforeprint', scheduleMeasure)
        window.removeEventListener('afterprint', scheduleMeasure)
        images.forEach((image) => image.removeEventListener('load', scheduleMeasure))
        if (measureFrameRef.current !== null) {
          window.cancelAnimationFrame(measureFrameRef.current)
          measureFrameRef.current = null
        }
      }
    }

    const observer = new ResizeObserver(scheduleMeasure)
    observer.observe(media)
    observer.observe(root)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
      window.removeEventListener('beforeprint', scheduleMeasure)
      window.removeEventListener('afterprint', scheduleMeasure)
      images.forEach((image) => image.removeEventListener('load', scheduleMeasure))
      if (measureFrameRef.current !== null) {
        window.cancelAnimationFrame(measureFrameRef.current)
        measureFrameRef.current = null
      }
    }
  }, [])

  return (
    <div
      {...props}
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={poemStyle}
      data-poem="true"
    >
      {children}
    </div>
  )
}
