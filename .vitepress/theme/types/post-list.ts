export interface PostListItem {
  title: string
  href: string
  create: number
  cover?: string
  excerpt: string
  //归属于的文集
  collection?: PostCollectionInfo
  tags: string[]
  tagsInteractive: boolean
  pinned: boolean
  metricText: string
}

export type PostCollectionInfo = {
  title: string,
  href: string,
}

