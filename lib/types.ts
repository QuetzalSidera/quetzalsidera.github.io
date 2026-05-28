export type PostOutline = {
  level?: number
  title: string
  slug: string
}

export type Post = {
  slug: string
  title: string
  outline?: PostOutline[]
  content: string
  href: string
  create: number
  update: number
  tags?: string[]
  collection?: string
  wordCount: number
  cover?: string
  excerpt?: string
  pinned?: boolean
}

export type CollectionData = {
  title: string
  slug: string
  href: string
  create: number
  update: number
  cover?: string
  description: string
  tags?: string[]
}

export type CollectionPageData = CollectionData & {
  posts: Post[]
  postCount: number
}

export type ThemeLinkItem = {
  name: string
  url: string
}

export type ThemeSocialItem = {
  /** FontAwesome brand icon key. */
  icon: 'github' | 'bilibili' | 'zhihu'
  url: string
}

export type GiscusConfig = {
  repo: string
  repoId: string
  category: string
  categoryId: string
}

export type BlogThemeConfig = {
  menuList: ThemeLinkItem[]
  videoBanner: boolean
  name: string
  welcomeText: string
  motto: string[]
  social: ThemeSocialItem[]
  spineVoiceLang: 'zh' | 'jp'
  footerName: string
  recordName: string
  poweredList: ThemeLinkItem[]
  /** Comments: migrated from Gitalk to giscus. */
  giscus?: GiscusConfig
  /** Repository metadata used by footer and SEO. */
  repo: string
  owner: string
}
