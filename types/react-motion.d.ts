declare module 'react-motion' {
  import type { ReactNode } from 'react'

  export type SpringConfig = {
    stiffness?: number
    damping?: number
    precision?: number
  }

  export type OpaqueConfig = {
    val: number
    stiffness: number
    damping: number
    precision: number
  }

  export type MotionStyle = Record<string, number | OpaqueConfig>
  export type PlainStyle = Record<string, number>

  export type TransitionStyle<Data = unknown> = {
    key: string
    data?: Data
    style: MotionStyle
  }

  export type TransitionPlainStyle<Data = unknown> = {
    key: string
    data?: Data
    style: PlainStyle
  }

  export function spring(value: number, config?: SpringConfig): OpaqueConfig

  export class Motion extends React.Component<{
    defaultStyle?: PlainStyle
    style: MotionStyle
    children: (style: PlainStyle) => ReactNode
  }> {}

  export const presets: {
    noWobble: Required<Pick<SpringConfig, 'stiffness' | 'damping'>>
    gentle: Required<Pick<SpringConfig, 'stiffness' | 'damping'>>
    wobbly: Required<Pick<SpringConfig, 'stiffness' | 'damping'>>
    stiff: Required<Pick<SpringConfig, 'stiffness' | 'damping'>>
  }

  export class TransitionMotion<Data = unknown> extends React.Component<{
    defaultStyles?: Array<TransitionStyle<Data>>
    styles: Array<TransitionStyle<Data>> | ((styles: Array<TransitionPlainStyle<Data>>) => Array<TransitionStyle<Data>>)
    willEnter?: (style: TransitionStyle<Data>) => PlainStyle
    willLeave?: (style: TransitionStyle<Data>) => MotionStyle | null
    children: (styles: Array<TransitionPlainStyle<Data>>) => ReactNode
  }> {}
}
