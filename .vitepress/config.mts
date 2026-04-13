import { defineConfigWithTheme } from 'vitepress'
// @ts-ignore
import mdItCustomAttrs from 'markdown-it-custom-attrs'
import { blogThemeConfig, siteHead, siteMeta } from './theme/config/site'
import type { BlogThemeConfig } from './theme/types/theme'

export default defineConfigWithTheme<BlogThemeConfig>({
  lang: siteMeta.lang,
  head: siteHead,
  ignoreDeadLinks: true,
  sitemap: {
    hostname: siteMeta.hostname,
  },
  title: siteMeta.title,
  description: siteMeta.description,
  themeConfig: blogThemeConfig,
  markdown: {
    theme: 'solarized-dark',
    lineNumbers: true,
    math: true,
    config: (md) => {
      // use more markdown-it plugins!
      md.use(mdItCustomAttrs, 'image', {
        'data-fancybox': 'gallery',
      })
    },
  },
})
