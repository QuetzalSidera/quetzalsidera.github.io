import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from 'react'
import styles from './ImageGroup.module.css'

type ColumnCount = 1 | 2 | 3 | 4
type ColumnCountInput = ColumnCount | `${ColumnCount}`

type ImageGroupStyle = CSSProperties & {
  '--image-group-columns': ColumnCount
  '--image-group-mobile-columns': ColumnCount
  '--image-group-print-columns': ColumnCount
}

export type ImageGroupProps = Omit<ComponentPropsWithoutRef<'figure'>, 'children'> & {
  children: ReactNode
  columns?: ColumnCountInput
  mobileColumns?: ColumnCountInput
  printColumns?: ColumnCountInput
}

export type GroupCaptionProps = ComponentPropsWithoutRef<'figcaption'>

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(' ')
}

function readColumnCount(value: ColumnCountInput | undefined, fallback: ColumnCount): ColumnCount {
  const count = Number(value)
  return count === 1 || count === 2 || count === 3 || count === 4 ? count : fallback
}

export function ImageGroup({
  children,
  columns = 2,
  mobileColumns = 1,
  printColumns = columns,
  className,
  style,
  ...props
}: ImageGroupProps) {
  const normalizedColumns = readColumnCount(columns, 2)
  const groupStyle: ImageGroupStyle = {
    ...style,
    '--image-group-columns': normalizedColumns,
    '--image-group-mobile-columns': readColumnCount(mobileColumns, 1),
    '--image-group-print-columns': readColumnCount(printColumns, normalizedColumns),
  }

  return (
    <figure
      {...props}
      className={joinClassNames(styles.group, className)}
      style={groupStyle}
      data-image-group="true"
    >
      {children}
    </figure>
  )
}

export function GroupCaption({ className, ...props }: GroupCaptionProps) {
  return (
    <figcaption
      {...props}
      className={joinClassNames(styles.caption, className)}
    />
  )
}
