import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import type { HeadConfig, PageData } from 'vitepress'
import { siteMeta } from './site'

type MarkdownMeta = {
  title?: string
  description?: string
  tags: string[]
  cover?: string
  datePublished?: string
  dateModified?: string
  collection?: string
}

type SeoTransformContext = {
  page: string
  pageData: PageData
  title: string
  description: string
  head: HeadConfig[]
}

const cwd = process.cwd()
const markdownMetaCache = new Map<string, { timestamp: number; meta: MarkdownMeta }>()

function stripHtml(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_\-\n\r|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncateText(value: string, maxLength = 160) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1).trim()}…`
}

function normalizeDescription(value?: string) {
  if (!value) {
    return ''
  }

  return truncateText(stripHtml(value))
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((tag) => String(tag).trim())
    .filter(Boolean)
}

function normalizeDate(value: unknown) {
  if (!value) {
    return undefined
  }

  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function normalizeAssetUrl(value?: string) {
  if (!value) {
    return siteMeta.defaultOgImage
  }

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  return value.startsWith('/') ? value : `/${value}`
}

function resolveAbsoluteUrl(value: string) {
  return new URL(value, siteMeta.hostname).toString()
}

function normalizePagePath(page: string) {
  const normalized = (page.startsWith('/') ? page : `/${page}`).replace(/\.md$/i, '.html')

  if (normalized === '/index.html') {
    return '/'
  }

  return normalized.replace(/\/index\.html$/i, '/')
}

function getMetaContentFromHead(head: unknown, metaName: string) {
  if (!Array.isArray(head)) {
    return undefined
  }

  for (const entry of head) {
    if (!Array.isArray(entry) || entry.length < 2) {
      continue
    }

    const [tag, attrs] = entry
    if (tag !== 'meta' || !attrs || typeof attrs !== 'object') {
      continue
    }

    const attributes = attrs as Record<string, unknown>
    if (attributes.name === metaName && typeof attributes.content === 'string') {
      return attributes.content
    }
  }

  return undefined
}

function getMarkdownMeta(relativePath: string): MarkdownMeta | undefined {
  if (!relativePath) {
    return undefined
  }

  const fullPath = path.join(cwd, relativePath)
  if (!fs.existsSync(fullPath)) {
    return undefined
  }

  const timestamp = Math.floor(fs.statSync(fullPath).mtimeMs)
  const cached = markdownMetaCache.get(fullPath)
  if (cached && cached.timestamp === timestamp) {
    return cached.meta
  }

  const source = fs.readFileSync(fullPath, 'utf-8')
  const { data, excerpt } = matter(source, { excerpt: true })

  const description = normalizeDescription(
    typeof data.description === 'string'
      ? data.description
      : getMetaContentFromHead(data.head, 'description') || excerpt,
  )

  const meta: MarkdownMeta = {
    title: typeof data.title === 'string' ? data.title : undefined,
    description,
    tags: normalizeTags(data.tags),
    cover: typeof data.cover === 'string' ? data.cover : undefined,
    datePublished: normalizeDate(data.date),
    dateModified: new Date(timestamp).toISOString(),
    collection: typeof data.collection === 'string' ? data.collection : undefined,
  }

  markdownMetaCache.set(fullPath, { timestamp, meta })
  return meta
}

function hasHeadMeta(head: HeadConfig[], key: 'name' | 'property', value: string) {
  return head.some((entry) => {
    if (entry[0] !== 'meta') {
      return false
    }

    return entry[1]?.[key] === value
  })
}

function createJsonLd(context: SeoTransformContext, metadata: MarkdownMeta, canonicalUrl: string) {
  const description = context.pageData.description || context.description || siteMeta.description
  const image = resolveAbsoluteUrl(normalizeAssetUrl(metadata.cover))
  const pageType = resolvePageType(context.pageData.relativePath)

  if (pageType === 'post') {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: context.pageData.title,
      description,
      image,
      inLanguage: siteMeta.lang,
      mainEntityOfPage: canonicalUrl,
      datePublished: metadata.datePublished,
      dateModified: metadata.dateModified,
      articleSection: metadata.collection,
      keywords: metadata.tags,
      author: {
        '@type': 'Person',
        name: siteMeta.author,
        url: siteMeta.hostname,
      },
      publisher: {
        '@type': 'Person',
        name: siteMeta.author,
        url: siteMeta.hostname,
      },
    }
  }

  if (pageType === 'home') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          name: siteMeta.author,
          url: siteMeta.hostname,
          description: siteMeta.description,
        },
        {
          '@type': 'WebSite',
          name: siteMeta.title,
          url: siteMeta.hostname,
          inLanguage: siteMeta.lang,
          description: siteMeta.description,
          author: {
            '@type': 'Person',
            name: siteMeta.author,
          },
        },
        {
          '@type': 'WebPage',
          name: context.pageData.title,
          url: canonicalUrl,
          description,
          inLanguage: siteMeta.lang,
        },
      ],
    }
  }

  const pageSchemaType = pageType === 'collection' || pageType === 'collections' ? 'CollectionPage' : 'WebPage'

  return {
    '@context': 'https://schema.org',
    '@type': pageSchemaType,
    name: context.pageData.title,
    url: canonicalUrl,
    description,
    inLanguage: siteMeta.lang,
    keywords: metadata.tags,
  }
}

function resolvePageType(relativePath: string) {
  if (relativePath === 'index.md') {
    return 'home'
  }

  if (relativePath === 'tags/index.md') {
    return 'tags'
  }

  if (relativePath === 'collections/index.md') {
    return 'collections'
  }

  if (relativePath.startsWith('collections/') && relativePath !== 'collections/index.md') {
    return 'collection'
  }

  if (relativePath.startsWith('posts/') && relativePath !== 'posts/index.md') {
    return 'post'
  }

  return 'page'
}

function isNoindexPage(relativePath: string, isNotFound?: boolean) {
  if (isNotFound) {
    return true
  }

  return relativePath === 'posts/index.md'
}

function getDefaultDescription(relativePath: string) {
  switch (resolvePageType(relativePath)) {
    case 'home':
      return 'QuetzalSidera 的个人博客首页，记录项目、技术栈、兴趣与成长轨迹。'
    case 'tags':
      return '按标签浏览 QuetzalSidera 的文章，快速查看技术笔记、项目记录、兴趣随笔与个人内容。'
    case 'collections':
      return '按文集浏览 QuetzalSidera 的主题内容，包括操作系统、算法、机器人、项目与随笔整理。'
    case 'page':
      return siteMeta.description
    default:
      return ''
  }
}

export function derivePageDescription(pageData: PageData) {
  const markdownMeta = getMarkdownMeta(pageData.relativePath)
  const fallbackDescription = getDefaultDescription(pageData.relativePath)

  return (
    markdownMeta?.description ||
    normalizeDescription(pageData.frontmatter?.description) ||
    normalizeDescription(pageData.description) ||
    fallbackDescription ||
    siteMeta.description
  )
}

export function createSeoHead(context: SeoTransformContext): HeadConfig[] {
  const pageType = resolvePageType(context.pageData.relativePath)
  const markdownMeta = getMarkdownMeta(context.pageData.relativePath) || { tags: [] }
  const pagePath = normalizePagePath(context.page)
  const canonicalUrl = resolveAbsoluteUrl(pagePath)
  const imageUrl = resolveAbsoluteUrl(normalizeAssetUrl(markdownMeta.cover))
  const description = context.pageData.description || context.description || siteMeta.description
  const locale = siteMeta.lang.replace('-', '_')
  const noindex = isNoindexPage(context.pageData.relativePath, context.pageData.isNotFound)
  const keywords = [...new Set([...siteMeta.defaultKeywords, ...markdownMeta.tags])]
  const head: HeadConfig[] = [
    ['meta', { name: 'author', content: siteMeta.author }],
    ['meta', { name: 'theme-color', content: siteMeta.themeColor }],
    ['meta', { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' }],
    ['meta', { property: 'og:locale', content: locale }],
    ['meta', { property: 'og:site_name', content: siteMeta.title }],
    ['meta', { property: 'og:title', content: context.title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: canonicalUrl }],
    ['meta', { property: 'og:image', content: imageUrl }],
    ['meta', { property: 'og:image:alt', content: context.pageData.title || siteMeta.title }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: context.title }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: imageUrl }],
    ['script', { type: 'application/ld+json' }, JSON.stringify(createJsonLd(context, markdownMeta, canonicalUrl))],
  ]

  if (!noindex) {
    head.unshift(['link', { rel: 'canonical', href: canonicalUrl }])
  }

  if (!hasHeadMeta(context.head, 'name', 'keywords') && keywords.length > 0) {
    head.push(['meta', { name: 'keywords', content: keywords.join(', ') }])
  }

  if (pageType === 'post') {
    head.push(['meta', { property: 'og:type', content: 'article' }])

    if (markdownMeta.datePublished) {
      head.push(['meta', { property: 'article:published_time', content: markdownMeta.datePublished }])
    }

    if (markdownMeta.dateModified) {
      head.push(['meta', { property: 'article:modified_time', content: markdownMeta.dateModified }])
    }

    if (markdownMeta.collection) {
      head.push(['meta', { property: 'article:section', content: markdownMeta.collection }])
    }

    for (const tag of markdownMeta.tags) {
      head.push(['meta', { property: 'article:tag', content: tag }])
    }
  } else {
    head.push(['meta', { property: 'og:type', content: 'website' }])
  }

  return head
}
