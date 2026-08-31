'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { AnchoredSidePanel } from '@/components/shared/AnchoredSidePanel'
import { getPageOverlayRoot } from '@/components/shared/PageOverlayRoot'
import actionStyles from '@/components/shared/PageSideActions.module.css'
import { usePageSidePanel } from '@/components/shared/PageSideActionsContext'
import type { DocumentKind, ExerciseFont } from '@/lib/types'
import styles from './PostPrintControl.module.css'

type PrintMode = 'note' | 'practice' | 'solution'
type PrintFont = 'default' | ExerciseFont
type PrintPanelCopy = {
  ariaLabel: string
  title: string
  description?: string
}

const PRINT_ASSET_TIMEOUT_MS = 5000
const PRINT_FRAME_FALLBACK_MS = 100
const PRINT_PANEL_COPY: Record<DocumentKind, PrintPanelCopy> = {
  article: {
    ariaLabel: '打印设置：文章',
    title: '打印文章',
    description: 'A4 博客文章版式',
  },
  note: {
    ariaLabel: '打印设置：笔记',
    title: '打印笔记',
    description: 'A4 紧凑笔记版式',
  },
  exercise: {
    ariaLabel: '打印设置：习题',
    title: '打印习题',
  },
  experiment: {
    ariaLabel: '打印设置：实验',
    title: '打印实验',
    description: 'A4 实验记录版式',
  },
}

type PostPrintControlProps = {
  title: string
  kind: DocumentKind
  exerciseFont: ExerciseFont
}

function nextFrame() {
  return new Promise<void>((resolve) => {
    let settled = false
    let animationFrame = 0
    let fallbackTimer = 0

    const finish = () => {
      if (settled) return
      settled = true
      window.cancelAnimationFrame(animationFrame)
      window.clearTimeout(fallbackTimer)
      resolve()
    }

    animationFrame = window.requestAnimationFrame(finish)
    fallbackTimer = window.setTimeout(finish, PRINT_FRAME_FALLBACK_MS)
  })
}

function waitAtMost(promise: PromiseLike<unknown>, timeoutMs: number) {
  return new Promise<void>((resolve) => {
    let settled = false
    const timer = window.setTimeout(finish, timeoutMs)

    function finish() {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      resolve()
    }

    Promise.resolve(promise).then(finish, finish)
  })
}

function waitForImageLoad(image: HTMLImageElement) {
  if (image.complete) return Promise.resolve()

  return new Promise<void>((resolve) => {
    let settled = false
    const timer = window.setTimeout(finish, PRINT_ASSET_TIMEOUT_MS)

    function finish() {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      image.removeEventListener('load', handleSettled)
      image.removeEventListener('error', handleSettled)
      resolve()
    }

    function handleSettled() {
      finish()
    }

    image.addEventListener('load', handleSettled)
    image.addEventListener('error', handleSettled)

    if (image.complete) {
      finish()
      return
    }

    if (image.loading === 'lazy') image.loading = 'eager'
    if (image.complete) finish()
  })
}

async function waitForImages(root: ParentNode) {
  const images = Array.from(root.querySelectorAll('img'))
  await Promise.all(
    images.map(async (image) => {
      await waitForImageLoad(image)
      if (image.complete && image.decode) {
        await waitAtMost(image.decode(), PRINT_ASSET_TIMEOUT_MS)
      }
    }),
  )
}

async function waitForRenderedContent(root: ParentNode) {
  const startedAt = window.performance.now()
  while (
    root.querySelector('[data-ready="false"]') &&
    window.performance.now() - startedAt < 3000
  ) {
    await nextFrame()
  }
}

async function waitForPrintAssets(root: ParentNode) {
  await waitAtMost(
    Promise.all([
      'fonts' in document ? document.fonts.ready : Promise.resolve(),
      waitForImages(root),
      waitForRenderedContent(root),
    ]),
    PRINT_ASSET_TIMEOUT_MS,
  )
  await nextFrame()
}

function expandExerciseSections(root: ParentNode, mode: PrintMode) {
  if (mode === 'practice') return null

  const sections = Array.from(
    root.querySelectorAll<HTMLDetailsElement>('details[data-exercise-section]'),
  )
  const openStates = sections.map((section) => section.open)
  sections.forEach((section) => {
    section.open = true
  })

  return () => {
    sections.forEach((section, index) => {
      section.open = openStates[index]
    })
  }
}

export function PostPrintControl({
  title,
  kind,
  exerciseFont,
}: PostPrintControlProps) {
  const panelCopy = PRINT_PANEL_COPY[kind]
  const [isPreparing, setIsPreparing] = useState(false)
  const [preparationMessage, setPreparationMessage] = useState(
    '正在载入字体、图片与图表。',
  )
  const [exerciseMode, setExerciseMode] = useState<'practice' | 'solution'>('practice')
  const [font, setFont] = useState<PrintFont>('default')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const restoreExerciseSectionsRef = useRef<(() => void) | null>(null)
  const activePrintCleanupRef = useRef<(() => void) | null>(null)
  const panelId = useId()
  const { closePanel, isOpen, togglePanel } = usePageSidePanel(panelId)

  function restoreExerciseSections() {
    restoreExerciseSectionsRef.current?.()
    restoreExerciseSectionsRef.current = null
  }

  function prepareExerciseSections(root: ParentNode, mode: PrintMode) {
    restoreExerciseSections()
    restoreExerciseSectionsRef.current = expandExerciseSections(root, mode)
  }

  useEffect(() => {
    function prepareForNativePrint() {
      if (restoreExerciseSectionsRef.current) return

      const viewer = document.querySelector<HTMLElement>('[data-post-viewer]')
      const content = viewer?.querySelector('article')
      if (!viewer || !content) return

      const requestedMode = viewer.getAttribute('data-print-mode')
      const mode: PrintMode =
        requestedMode === 'practice' || requestedMode === 'solution'
          ? requestedMode
          : 'note'
      prepareExerciseSections(content, mode)
    }

    window.addEventListener('beforeprint', prepareForNativePrint)
    window.addEventListener('afterprint', restoreExerciseSections)
    return () => {
      window.removeEventListener('beforeprint', prepareForNativePrint)
      window.removeEventListener('afterprint', restoreExerciseSections)
      activePrintCleanupRef.current?.()
      restoreExerciseSections()
    }
  }, [])

  async function printDocument() {
    if (isPreparing || activePrintCleanupRef.current) return

    const viewer = document.querySelector<HTMLElement>('[data-post-viewer]')
    const content = viewer?.querySelector('article')
    if (!viewer || !content) return
    const printRoot = viewer

    const previousTitle = document.title
    const previousMode = viewer.getAttribute('data-print-mode')
    const previousFont = viewer.getAttribute('data-print-font')
    const printTitle = title.trim().replace(/[\\/:*?"<>|]+/g, ' ') || previousTitle
    const mode: PrintMode = kind === 'exercise' ? exerciseMode : 'note'
    let didCleanup = false
    let cleanupTimer: number | null = null

    function restoreAttribute(name: string, value: string | null) {
      if (value === null) printRoot.removeAttribute(name)
      else printRoot.setAttribute(name, value)
    }

    function cleanup() {
      if (didCleanup) return
      didCleanup = true
      if (cleanupTimer !== null) window.clearTimeout(cleanupTimer)
      activePrintCleanupRef.current = null
      document.title = previousTitle
      restoreAttribute('data-print-mode', previousMode)
      restoreAttribute('data-print-font', previousFont)
      restoreExerciseSections()
      printRoot.removeAttribute('data-printing')
      setIsPreparing(false)
      setPreparationMessage('正在载入字体、图片与图表。')
      window.removeEventListener('afterprint', cleanup)
    }

    activePrintCleanupRef.current = cleanup
    closePanel()
    setIsPreparing(true)
    setPreparationMessage('正在载入字体、图片与图表。')
    viewer.setAttribute('data-print-mode', mode)
    if (font === 'default') viewer.removeAttribute('data-print-font')
    else viewer.setAttribute('data-print-font', font)
    prepareExerciseSections(content, mode)
    viewer.setAttribute('data-printing', 'true')

    try {
      await nextFrame()
      await waitForPrintAssets(content)
      if (didCleanup) return
      setPreparationMessage('正在打开系统打印窗口。')
      await nextFrame()
      if (didCleanup) return
      document.title = printTitle
      window.addEventListener('afterprint', cleanup, { once: true })
      window.print()
      if (!didCleanup) cleanupTimer = window.setTimeout(cleanup, 30000)
    } catch (error) {
      cleanup()
      console.error('Failed to prepare print document.', error)
    }
  }

  return (
    <>
      <AnchoredSidePanel
        open={isOpen}
        anchorRef={triggerRef}
        id={panelId}
        ariaLabel={panelCopy.ariaLabel}
        role="dialog"
        onClose={closePanel}
      >
        <p className={styles.title}>{panelCopy.title}</p>
        {panelCopy.description ? (
          <p className={styles.description}>{panelCopy.description}</p>
        ) : null}
        {kind === 'exercise' ? (
          <fieldset className={styles.fieldset}>
            <legend>内容</legend>
            <label>
              <input
                type="radio"
                name="print-mode"
                value="practice"
                checked={exerciseMode === 'practice'}
                onChange={() => setExerciseMode('practice')}
              />
              练习版
            </label>
            <label>
              <input
                type="radio"
                name="print-mode"
                value="solution"
                checked={exerciseMode === 'solution'}
                onChange={() => setExerciseMode('solution')}
              />
              题解版
            </label>
          </fieldset>
        ) : null}
        {kind === 'exercise' ? (
          <label className={styles.selectLabel}>
            字体
            <select value={font} onChange={(event) => setFont(event.target.value as PrintFont)}>
              <option value="default">文章默认（{exerciseFont === 'kai' ? '文楷' : exerciseFont === 'song' ? '宋体' : '站点字体'}）</option>
              <option value="kai">文楷</option>
              <option value="song">宋体</option>
              <option value="site">站点字体</option>
            </select>
          </label>
        ) : null}
        <button className={styles.printButton} type="button" onClick={printDocument}>
          打印 / 保存 PDF
        </button>
      </AnchoredSidePanel>
      {isPreparing && typeof document !== 'undefined'
        ? createPortal(
            <div
              className={styles.preparingOverlay}
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-busy="true"
            >
              <div className={styles.preparingCard}>
                <FontAwesomeIcon icon={faSpinner} className={styles.preparingStatusIcon} />
                <div className={styles.preparingCopy}>
                  <p className={styles.preparingTitle}>正在准备打印文档</p>
                  <p className={styles.preparingDescription}>{preparationMessage}</p>
                  <p className={styles.preparingHint}>完成后将自动打开打印窗口。</p>
                </div>
              </div>
            </div>,
            getPageOverlayRoot(),
          )
        : null}
      <button
        ref={triggerRef}
        className={actionStyles.actionButton}
        type="button"
        title={isPreparing ? '正在准备打印 / 保存 PDF' : '打印 / 保存 PDF'}
        aria-label={isPreparing ? '正在准备打印 / 保存 PDF' : '打印 / 保存 PDF'}
        aria-controls={panelId}
        aria-expanded={isOpen}
        disabled={isPreparing}
        onClick={togglePanel}
      >
        <FontAwesomeIcon
          icon={isPreparing ? faSpinner : faFilePdf}
          className={[
            actionStyles.actionIcon,
            isPreparing ? styles.preparingIcon : '',
          ].join(' ')}
        />
      </button>
    </>
  )
}
