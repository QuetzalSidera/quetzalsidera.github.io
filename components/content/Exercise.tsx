import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from 'react'
import styles from './Exercise.module.css'

export type ExerciseFont = 'kai' | 'song' | 'site'

export type ExerciseType =
  | 'single'
  | 'multiple'
  | 'judge'
  | 'fill'
  | 'short'
  | 'calculation'
  | 'proof'

type ExerciseSetProps = Omit<ComponentPropsWithoutRef<'section'>, 'children'> & {
  children: ReactNode
  font?: ExerciseFont
}

type ExerciseGroupProps = Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'title' | 'start'> & {
  children: ReactNode
  title?: ReactNode
  start?: number | string
}

type ExerciseProps = Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'source'> & {
  children: ReactNode
  type?: ExerciseType
  source?: ReactNode
  answerLines?: number | string
  keepTogether?: boolean | string
  breakBefore?: boolean | string
}

type ExerciseStemProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  children: ReactNode
}

type ExercisePartsProps = Omit<ComponentPropsWithoutRef<'ol'>, 'children' | 'start'> & {
  children: ReactNode
  start?: number | string
}

type ExerciseChoicesProps = Omit<ComponentPropsWithoutRef<'ol'>, 'children' | 'start'> & {
  children: ReactNode
  choiceColumns?: 1 | 2 | 4 | '1' | '2' | '4'
  start?: number | string
}

type ExerciseDisclosureProps = Omit<ComponentPropsWithoutRef<'details'>, 'children'> & {
  children: ReactNode
  label?: ReactNode
}

const defaultAnswerLines: Record<ExerciseType, number> = {
  single: 0,
  multiple: 0,
  judge: 0,
  fill: 1,
  short: 4,
  calculation: 8,
  proof: 10,
}

const exerciseTypeValues = new Set<ExerciseType>([
  'single',
  'multiple',
  'judge',
  'fill',
  'short',
  'calculation',
  'proof',
])

const defaultKeepTogetherTypes = new Set<ExerciseType>([
  'single',
  'multiple',
  'judge',
  'fill',
])

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

function normalizeStart(start: number | string | undefined) {
  const value = Number(start)
  if (!Number.isFinite(value)) return 1
  return Math.max(1, Math.trunc(value))
}

function normalizeLineCount(answerLines: number | string | undefined, type: ExerciseType) {
  if (answerLines === undefined) return defaultAnswerLines[type]
  const value = Number(answerLines)
  if (!Number.isFinite(value)) return defaultAnswerLines[type]
  return Math.max(0, Math.trunc(value))
}

function readBoolean(value: boolean | string | undefined) {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

export function ExerciseSet({
  children,
  className,
  font,
  ...sectionProps
}: ExerciseSetProps) {
  return (
    <section
      {...sectionProps}
      className={joinClassNames(styles.exerciseSet, className)}
      data-exercise-set=""
      data-font={font}
    >
      {children}
    </section>
  )
}

export function ExerciseGroup({
  children,
  className,
  style,
  title,
  start,
  ...sectionProps
}: ExerciseGroupProps) {
  const normalizedStart = normalizeStart(start)
  const counterStyle = {
    ...style,
    '--exercise-start': normalizedStart - 1,
  } as CSSProperties

  return (
    <section
      {...sectionProps}
      className={joinClassNames(styles.exerciseGroup, className)}
      data-exercise-group=""
      data-start={normalizedStart}
      style={counterStyle}
    >
      {title ? (
        <div className={styles.groupTitle} role="heading" aria-level={2}>
          {title}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function Exercise({
  children,
  className,
  type = 'short',
  source,
  answerLines,
  keepTogether,
  breakBefore = false,
  ...sectionProps
}: ExerciseProps) {
  const normalizedType = exerciseTypeValues.has(type) ? type : 'short'
  const lineCount = normalizeLineCount(answerLines, normalizedType)
  const shouldKeepTogether =
    readBoolean(keepTogether) ?? defaultKeepTogetherTypes.has(normalizedType)
  const shouldBreakBefore = readBoolean(breakBefore) ?? false

  return (
    <section
      {...sectionProps}
      className={joinClassNames(styles.exercise, className)}
      data-answer-lines={lineCount}
      data-break-before={shouldBreakBefore ? 'true' : 'false'}
      data-exercise=""
      data-keep-together={shouldKeepTogether ? 'true' : 'false'}
      data-has-source={source ? 'true' : 'false'}
      data-type={normalizedType}
    >
      <span className={styles.exerciseNumber} aria-hidden="true" />
      <div className={styles.exerciseBody}>
        {source ? <span className={styles.source}>{source}</span> : null}
        {children}
        <div className={styles.answerSpace} data-answer-space="" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, index) => (
            <span className={styles.answerLine} key={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function ExerciseStem({ children, className, ...divProps }: ExerciseStemProps) {
  return (
    <div {...divProps} className={joinClassNames(styles.stem, className)} data-exercise-stem="">
      {children}
    </div>
  )
}

export function ExerciseParts({
  children,
  className,
  start,
  style,
  ...listProps
}: ExercisePartsProps) {
  const normalizedStart = normalizeStart(start)
  const counterStyle = {
    ...style,
    '--exercise-parts-start': normalizedStart - 1,
  } as CSSProperties

  return (
    <ol
      {...listProps}
      className={joinClassNames(styles.parts, className)}
      data-exercise-parts=""
      start={normalizedStart}
      style={counterStyle}
    >
      {children}
    </ol>
  )
}

export function ExerciseChoices({
  children,
  choiceColumns = 1,
  className,
  start,
  style,
  ...listProps
}: ExerciseChoicesProps) {
  const normalizedStart = normalizeStart(start)
  const columnCount = Number(choiceColumns)
  const normalizedColumns = columnCount === 2 || columnCount === 4 ? columnCount : 1
  const counterStyle = {
    ...style,
    '--exercise-choices-start': normalizedStart - 1,
  } as CSSProperties

  return (
    <ol
      {...listProps}
      className={joinClassNames(styles.choices, className)}
      data-choice-columns={normalizedColumns}
      data-exercise-choices=""
      start={normalizedStart}
      style={counterStyle}
    >
      {children}
    </ol>
  )
}

function ExerciseDisclosure({
  children,
  className,
  label,
  sectionClassName,
  sectionName,
  ...detailsProps
}: ExerciseDisclosureProps & {
  sectionClassName: string
  sectionName: 'answer' | 'solution' | 'hint'
}) {
  return (
    <details
      {...detailsProps}
      className={joinClassNames(styles.disclosure, sectionClassName, className)}
      data-exercise-section={sectionName}
    >
      <summary className={styles.disclosureSummary}>{label}</summary>
      <div className={styles.disclosureBody}>{children}</div>
    </details>
  )
}

export function ExerciseAnswer({
  children,
  label = '答案',
  ...detailsProps
}: ExerciseDisclosureProps) {
  return (
    <ExerciseDisclosure
      {...detailsProps}
      label={label}
      sectionClassName={styles.answer}
      sectionName="answer"
    >
      {children}
    </ExerciseDisclosure>
  )
}

export function ExerciseSolution({
  children,
  label = '解析',
  ...detailsProps
}: ExerciseDisclosureProps) {
  return (
    <ExerciseDisclosure
      {...detailsProps}
      label={label}
      sectionClassName={styles.solution}
      sectionName="solution"
    >
      {children}
    </ExerciseDisclosure>
  )
}

export function ExerciseHint({
  children,
  label = '提示',
  ...detailsProps
}: ExerciseDisclosureProps) {
  return (
    <ExerciseDisclosure
      {...detailsProps}
      label={label}
      sectionClassName={styles.hint}
      sectionName="hint"
    >
      {children}
    </ExerciseDisclosure>
  )
}
