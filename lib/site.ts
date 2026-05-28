/**
 * 站点级元信息与主题配置。
 * 迁移自 .vitepress/theme/config/site.ts；字段名尽量保留，方便对照。
 *
 * 注意：原 VitePress 版本的 social.icon 使用了 FontAwesome 的 IconDefinition 对象，
 * 这里改为字符串名（如 "github"），由组件层映射到具体 React 组件，
 * 避免在服务端导入 @fortawesome/free-brands-svg-icons 引发 ESM 互操作问题。
 */

import type { BlogThemeConfig } from '@/lib/types'
export type { BlogThemeConfig, GiscusConfig, ThemeLinkItem, ThemeSocialItem } from '@/lib/types'

export const siteMeta = {
  lang: 'zh-CN',
  title: 'QuetzalSidera 的个人博客',
  description: '记录项目、技术栈、阅读和兴趣的个人博客',
  hostname: 'https://quetzalsidera.me',
  author: 'QuetzalSidera',
  themeColor: '#7fbcff',
  defaultOgImage: '/og-image.webp',
  defaultKeywords: [
    'QuetzalSidera',
    '个人博客',
    '技术博客',
    'Nextra',
    'Next.js',
    '机器人',
    '操作系统',
    '算法',
  ],
} as const

export const blogThemeConfig: BlogThemeConfig = {
  menuList: [
    { name: '首页', url: '/' },
    { name: '标签', url: '/tags/' },
    { name: '文集', url: '/collections/' },
  ],
  videoBanner: false,
  name: 'QuetzalSidera',
  welcomeText: 'Hello! 欢迎来到我的个人博客',
  motto: [
    '机器人 | 计科 | 二次元',
    '23级本科生，主修机器人工程，辅修工程力学，喜欢计科，在机械、力学与代码三重世界之间游走',
  ],
  social: [
    { icon: 'github', url: 'https://github.com/QuetzalSidera' },
    { icon: 'bilibili', url: 'https://space.bilibili.com/327475434' },
    { icon: 'zhihu', url: 'https://www.zhihu.com/people/33-80-62-74-84' },
  ],
  spineVoiceLang: 'zh',
  footerName: 'QuetzalSidera',
  recordName: '粤ICP备2025477459号',
  poweredList: [
    { name: 'Nextra', url: 'https://nextra.site/' },
    { name: 'Cloudflare Pages', url: 'https://pages.cloudflare.com/' },
    { name: 'Markdown', url: 'https://www.markdownguide.org/' },
  ],
  giscus: {
    repo: 'QuetzalSidera/quetzalsidera.github.io',
    repoId: 'R_kgDORrqtDQ',
    category: 'Announcements',
    categoryId: 'DIC_kwDORrqtDc4C9-Hu',
  },
  repo: 'quetzalsidera.github.io',
  owner: 'QuetzalSidera',
}
