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
  const [mediaHeight, setMediaHeight] = useState<number | null>(null)
  const poemStyle: PoemStyle = {
    ...style,
    '--poem-height': mediaHeight === null ? '18rem' : `${mediaHeight}px`,
  }

  useLayoutEffect(() => {
    const root = rootRef.current
    const flow = root?.closest<HTMLElement>('[data-mode]')
    const media = flow?.querySelector<HTMLElement>(':scope > [data-flow-media]')
    if (!root || !media) return

    const measureMedia = () => {
      const height = media.getBoundingClientRect().height
      if (height > 0) {
        setMediaHeight((current) =>
          current !== null && Math.abs(current - height) < 0.5 ? current : height,
        )
      }
    }

    measureMedia()
    window.addEventListener('resize', measureMedia)
    window.addEventListener('beforeprint', measureMedia)
    window.addEventListener('afterprint', measureMedia)

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        window.removeEventListener('resize', measureMedia)
        window.removeEventListener('beforeprint', measureMedia)
        window.removeEventListener('afterprint', measureMedia)
      }
    }

    const observer = new ResizeObserver(measureMedia)
    observer.observe(media)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measureMedia)
      window.removeEventListener('beforeprint', measureMedia)
      window.removeEventListener('afterprint', measureMedia)
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
