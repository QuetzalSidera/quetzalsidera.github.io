import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import type { Metadata } from 'next'
import { siteMeta } from '@/lib/site'
import type { CollectionData, CollectionPageData, Post } from '@/lib/types'

type PageKind = 'home' | 'tags' | 'collections' | 'collection' | 'post' | 'page'

type FrontmatterHeadEntry = [string, Record<string, unknown>?]

type MarkdownMeta = {
  title?: string
  description?: string
  keywords?: string[]
  tags: string[]
  cover?: string
  datePublished?: string
  dateModified?: string
  collection?: string
}

type SeoInput = {
  kind: PageKind
  title: string
  path: string
  description?: string
  tags?: string[]
  keywords?: string[]
  cover?: string
  datePublished?: string
  dateModified?: string
  collection?: string
  noindex?: boolean
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

function normalizeDescription(value?: unknown) {
  return typeof value === 'string' ? truncateText(stripHtml(value)) : ''
}

function normalizeKeywords(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((keyword) => String(keyword).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean)
  }

  return []
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

function normalizePagePath(value: string) {
  if (value === '/') {
    return '/'
  }

  const pathname = value.startsWith('/') ? value : `/${value}`
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

export function resolveAbsoluteUrl(value: string) {
  return new URL(value, siteMeta.hostname).toString()
}

function getMetaContentFromHead(head: unknown, metaName: string) {
  if (!Array.isArray(head)) {
    return undefined
  }

  for (const entry of head) {
    if (!Array.isArray(entry) || entry.length < 2) {
      continue
    }

    const [tag, attrs] = entry as FrontmatterHeadEntry
    if (tag !== 'meta' || !attrs || typeof attrs !== 'object') {
      continue
    }

    if (attrs.name === metaName && typeof attrs.content === 'string') {
      return attrs.content
    }
  }

  return undefined
}

function getMarkdownMeta(relativePath: string): MarkdownMeta | undefined {
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
    data.description || getMetaContentFromHead(data.head, 'description') || excerpt,
  )
  const meta: MarkdownMeta = {
    title: typeof data.title === 'string' ? data.title : undefined,
    description,
    keywords: normalizeKeywords(getMetaContentFromHead(data.head, 'keywords')),
    tags: normalizeKeywords(data.tags),
    cover: typeof data.cover === 'string' ? data.cover : undefined,
    datePublished: normalizeDate(data.date),
    dateModified: new Date(timestamp).toISOString(),
    collection: typeof data.collection === 'string' ? data.collection : undefined,
  }

  markdownMetaCache.set(fullPath, { timestamp, meta })
  return meta
}

function getDefaultDescription(kind: PageKind) {
  switch (kind) {
    case 'home':
      return 'QuetzalSidera 的个人博客首页，记录项目、技术栈、兴趣与成长轨迹。'
    case 'tags':
      return '按标签浏览 QuetzalSidera 的文章，快速查看技术笔记、项目记录、兴趣随笔与个人内容。'
    case 'collections':
      return '按文集浏览 QuetzalSidera 的主题内容，包括操作系统、算法、机器人、项目与随笔整理。'
    default:
      return siteMeta.description
  }
}

function createKeywords(input: SeoInput) {
  return [...new Set([...siteMeta.defaultKeywords, ...(input.keywords ?? []), ...(input.tags ?? [])])]
}

function createMetadata(input: SeoInput): Metadata {
  const pagePath = normalizePagePath(input.path)
  const canonicalUrl = resolveAbsoluteUrl(pagePath)
  const imageUrl = resolveAbsoluteUrl(normalizeAssetUrl(input.cover))
  const description = normalizeDescription(input.description) || getDefaultDescription(input.kind)
  const title = input.title || siteMeta.title
  const fullTitle = title === siteMeta.title ? siteMeta.title : `${title} | ${siteMeta.title}`
  const keywords = createKeywords(input)
  const robots = input.noindex ? 'noindex, nofollow' : 'index, follow'

  const metadata: Metadata = {
    title: input.kind === 'home' ? { absolute: fullTitle } : title,
    description,
    authors: [{ name: siteMeta.author, url: siteMeta.hostname }],
    creator: siteMeta.author,
    publisher: siteMeta.author,
    keywords,
    robots,
    alternates: input.noindex ? undefined : { canonical: canonicalUrl },
    openGraph: {
      type: input.kind === 'post' ? 'article' : 'website',
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: siteMeta.title,
      locale: siteMeta.lang.replace('-', '_'),
      images: [{ url: imageUrl, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [{ url: imageUrl, alt: title }],
    },
  }

  if (input.kind === 'post') {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime: input.datePublished,
      modifiedTime: input.dateModified,
      authors: [siteMeta.hostname],
      section: input.collection,
      tags: input.tags,
    }
  }

  return metadata
}

function createJsonLd(input: SeoInput) {
  const canonicalUrl = resolveAbsoluteUrl(normalizePagePath(input.path))
  const description = normalizeDescription(input.description) || getDefaultDescription(input.kind)
  const image = resolveAbsoluteUrl(normalizeAssetUrl(input.cover))

  if (input.kind === 'post') {
    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: input.title,
      description,
      image,
      inLanguage: siteMeta.lang,
      mainEntityOfPage: canonicalUrl,
      datePublished: input.datePublished,
      dateModified: input.dateModified,
      articleSection: input.collection,
      keywords: input.tags ?? [],
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

  if (input.kind === 'home') {
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
          name: input.title,
          url: canonicalUrl,
          description,
          inLanguage: siteMeta.lang,
        },
      ],
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': input.kind === 'collection' || input.kind === 'collections' ? 'CollectionPage' : 'WebPage',
    name: input.title,
    url: canonicalUrl,
    description,
    inLanguage: siteMeta.lang,
    keywords: input.tags ?? [],
  }
}

function postToSeoInput(post: Post): SeoInput {
  const markdownMeta = getMarkdownMeta(`posts/${post.slug}.md`)
  return {
    kind: 'post',
    title: markdownMeta?.title || post.title,
    path: post.href,
    description: markdownMeta?.description || post.excerpt,
    tags: markdownMeta?.tags.length ? markdownMeta.tags : post.tags,
    keywords: markdownMeta?.keywords,
    cover: markdownMeta?.cover || post.cover,
    datePublished: markdownMeta?.datePublished || normalizeDate(post.create),
    dateModified: markdownMeta?.dateModified || normalizeDate(post.update),
    collection: markdownMeta?.collection || post.collection,
  }
}

function collectionToSeoInput(collection: CollectionData | CollectionPageData): SeoInput {
  const markdownMeta = getMarkdownMeta(`collections/${collection.slug}.md`)
  return {
    kind: 'collection',
    title: markdownMeta?.title || collection.title,
    path: collection.href,
    description: markdownMeta?.description || collection.description,
    tags: markdownMeta?.tags.length ? markdownMeta.tags : collection.tags,
    keywords: markdownMeta?.keywords,
    cover: markdownMeta?.cover || collection.cover,
    datePublished: markdownMeta?.datePublished || normalizeDate(collection.create),
    dateModified: markdownMeta?.dateModified || normalizeDate(collection.update),
  }
}

export function createHomeMetadata() {
  const markdownMeta = getMarkdownMeta('index.md')
  return createMetadata({
    kind: 'home',
    title: markdownMeta?.title || '首页',
    path: '/',
    description: markdownMeta?.description,
    keywords: markdownMeta?.keywords,
  })
}

export function createTagsMetadata() {
  const markdownMeta = getMarkdownMeta('tags/index.md')
  return createMetadata({
    kind: 'tags',
    title: markdownMeta?.title || '标签',
    path: '/tags/',
    description: markdownMeta?.description,
    keywords: markdownMeta?.keywords,
  })
}

export function createCollectionsMetadata() {
  const markdownMeta = getMarkdownMeta('collections/index.md')
  return createMetadata({
    kind: 'collections',
    title: markdownMeta?.title || '文集',
    path: '/collections/',
    description: markdownMeta?.description,
    keywords: markdownMeta?.keywords,
  })
}

export function createPostMetadata(post: Post) {
  return createMetadata(postToSeoInput(post))
}

export function createCollectionMetadata(collection: CollectionData | CollectionPageData) {
  return createMetadata(collectionToSeoInput(collection))
}

export function createNotFoundMetadata() {
  return createMetadata({
    kind: 'page',
    title: '页面不存在',
    path: '/404/',
    description: '页面不存在',
    noindex: true,
  })
}

export function createHomeJsonLd() {
  return createJsonLd({
    kind: 'home',
    title: getMarkdownMeta('index.md')?.title || '首页',
    path: '/',
    description: getMarkdownMeta('index.md')?.description,
  })
}

export function createTagsJsonLd() {
  return createJsonLd({
    kind: 'tags',
    title: getMarkdownMeta('tags/index.md')?.title || '标签',
    path: '/tags/',
    description: getMarkdownMeta('tags/index.md')?.description,
  })
}

export function createCollectionsJsonLd() {
  return createJsonLd({
    kind: 'collections',
    title: getMarkdownMeta('collections/index.md')?.title || '文集',
    path: '/collections/',
    description: getMarkdownMeta('collections/index.md')?.description,
  })
}

export function createPostJsonLd(post: Post) {
  return createJsonLd(postToSeoInput(post))
}

export function createCollectionJsonLd(collection: CollectionData | CollectionPageData) {
  return createJsonLd(collectionToSeoInput(collection))
}
