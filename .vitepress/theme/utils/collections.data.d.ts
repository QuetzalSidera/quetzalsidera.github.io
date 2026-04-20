export interface CollectionData {
  title: string
  slug: string
  href: string
  create: number
  update: number
  cover?: string
  description?: string
  tags?: string[]
}

export declare const data: CollectionData[]
