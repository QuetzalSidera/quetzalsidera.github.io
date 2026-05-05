import { IconDefinition } from '@fortawesome/free-brands-svg-icons'

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
  recordName: string
  poweredList: ThemeLinkItem[]
  clientID: string
  // clientSecret: string
  repo: string
  owner: string
  admin: string[]
}
