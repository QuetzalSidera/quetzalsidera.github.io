export interface PostData {
  id: number
  title: string
  outline: Outline[]
  content: string
  href: string
  create: number
  update: number
  tags?: string[]
  collection?: string
  wordCount: number
  cover?: string
  excerpt: string
  pinned?: boolean
}

type Outline = {
  level?: number
  title: string
  slug: string
}

export declare const data: PostData[]
