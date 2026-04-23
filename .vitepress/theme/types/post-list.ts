export interface PostListItem {
  title: string
  href: string
  create: number
  cover?: string
  excerpt: string
  tags: string[]
  tagsInteractive: boolean
  pinned: boolean
  metricText: string
}
