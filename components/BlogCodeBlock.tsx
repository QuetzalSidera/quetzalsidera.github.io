'use client'

import {
  Children,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons'
import styles from './BlogCodeBlock.module.css'

type BlogCodeBlockProps = ComponentProps<'pre'>
type CodeElement = ReactElement<ComponentProps<'code'>, 'code'>

function extractText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join('')
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children)
  }

  return ''
}

function findCodeChild(children: ReactNode): CodeElement | null {
  for (const child of Children.toArray(children)) {
    if (isValidElement<ComponentProps<'code'>>(child) && child.type === 'code') {
      return child as CodeElement
    }
  }

  return null
}

function getLanguage(className?: string) {
  return className?.match(/(?:^|\s)language-([A-Za-z0-9_-]+)/)?.[1] ?? 'text'
}

export function BlogCodeBlock({ children, className, ...preProps }: BlogCodeBlockProps) {
  const codeElement = findCodeChild(children)
  const codeProps = codeElement?.props
  const language = getLanguage(codeProps?.className)
  const copyText = useMemo(
    () => extractText(codeProps?.children ?? children).replace(/\n$/, ''),
    [children, codeProps?.children],
  )
  const lineCount = Math.max(copyText.split('\n').length, 1)
  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current)
      }
    }
  }, [])

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(copyText)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = copyText
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }

    setCopied(true)
    if (copiedTimerRef.current !== null) {
      window.clearTimeout(copiedTimerRef.current)
    }
    copiedTimerRef.current = window.setTimeout(() => setCopied(false), 1500)
  }

  const codeClassName = [codeProps?.className, styles.code].filter(Boolean).join(' ')
  const preClassName = [className, styles.pre].filter(Boolean).join(' ')

  return (
    <div className={[styles.codeBlock, 'blog-code-block', `language-${language}`].join(' ')}>
      <span className={[styles.lang, 'lang'].join(' ')}>{language}</span>
      <button
        className={[styles.copyButton, 'copy', copied ? styles.copied : ''].join(' ')}
        type="button"
        aria-label={copied ? '已复制代码' : '复制代码'}
        title={copied ? '已复制' : '复制代码'}
        onClick={copyCode}
      >
        <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
      </button>
      <div className={styles.codeBody}>
        <div className={[styles.lineNumbers, 'line-numbers-wrapper'].join(' ')} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, index) => (
            <span key={index}>{index + 1}</span>
          ))}
        </div>
        <pre {...preProps} className={preClassName}>
          {codeElement ? (
            <code {...codeProps} className={codeClassName}>
              {codeProps?.children}
            </code>
          ) : (
            <code className={styles.code}>{children}</code>
          )}
        </pre>
      </div>
    </div>
  )
}
