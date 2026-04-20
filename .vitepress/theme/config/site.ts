import type { HeadConfig } from 'vitepress'
import { faBilibili, faGithub, faZhihu } from '@fortawesome/free-brands-svg-icons'
import type { BlogThemeConfig } from '../types/theme'

export const siteMeta = {
  lang: 'zh-CN',
  title: 'QuetzalSidera 的个人博客',
  description: '记录项目、技术栈、阅读和兴趣的个人博客',
  hostname: 'https://quetzalsidera.me',
}

export const siteHead: HeadConfig[] = [
  ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
  ['link', { rel: 'stylesheet', href: 'https://unpkg.com/gitalk/dist/gitalk.css' }],
  ['script', { src: 'https://unpkg.com/gitalk/dist/gitalk.min.js' }],
  ['link', { rel: 'stylesheet', href: '/font/Blueaka/Blueaka.css' }],
  ['link', { rel: 'stylesheet', href: '/font/Blueaka_Bold/Blueaka_Bold.css' }],
  ['link', { rel: 'stylesheet', href: '/styles/fancybox.css' }],
  [
    'meta',
    {
      name: 'google-adsense-account',
      content: 'ca-pub-3737797471305738',
    },
  ],
]

export const blogThemeConfig: BlogThemeConfig = {
  menuList: [
    { name: '首页', url: '' },
    { name: '标签', url: 'tags/' },
    { name: '文集', url: 'collections/' },
  ],
  videoBanner: false,
  name: 'QuetzalSidera',
  welcomeText: 'Hello! 欢迎来到我的个人博客',
  motto: [
    '机器人 | 计科 | 二次元',
    '23级本科生，主修机器人工程，辅修工程力学，喜欢计科，在机械、力学与代码三重世界之间游走',
  ],
  social: [
    { icon: faGithub, url: 'https://github.com/QuetzalSidera' },
    { icon: faBilibili, url: 'https://space.bilibili.com/327475434' },
    { icon: faZhihu, url: 'https://www.zhihu.com/people/33-80-62-74-84' },
  ],
  spineVoiceLang: 'zh',
  footerName: 'QuetzalSidera',
  poweredList: [
    { name: 'VitePress', url: 'https://github.com/vuejs/vitepress' },
    { name: 'GitHub Pages', url: 'https://docs.github.com/zh/pages' },
    { name: 'Markdown', url: 'https://www.markdownguide.org/' },
  ],
  clientID: 'Ov23lih50I0dC7NzyGSY',
  repo: 'quetzalsidera.github.io',
  owner: 'QuetzalSidera',
  admin: ['QuetzalSidera'],
}
