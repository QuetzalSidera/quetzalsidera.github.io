import type { IconDefinition } from '@fortawesome/fontawesome-common-types'

export interface ThemeLinkItem {
  name: string
  url: string
}

export interface ThemeSocialItem {
  icon: IconDefinition
  url: string
}

export interface BlogThemeConfig {
  menuList: ThemeLinkItem[]
  videoBanner: boolean
  name: string
  welcomeText: string
  motto: string[]
  social: ThemeSocialItem[]
  spineVoiceLang: 'zh' | 'jp'
  footerName: string
  poweredList: ThemeLinkItem[]
  clientID: string
  // clientSecret: string
  repo: string
  owner: string
  admin: string[]
}
