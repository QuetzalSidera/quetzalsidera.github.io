/**
 * 文章数据加载。
 * 迁移自 .vitepress/theme/utils/posts.data.mts；构建期同步读取 posts/*.md。
 *
 * 与原版差异：
 * - 不再生成 id（之前是模块级自增 id，多次调用不稳定，且新版本路由也不需要）
 * - href 不再带 .html 后缀；旧 .html 链接由 public/_redirects 兜底
 * - 增加 slug 字段（不带扩展名的文件名），App Router 用它做 generateStaticParams
 */

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { toMdxSource } from '@/lib/mdx'
import type { Post } from '@/lib/types'
export type { Post, PostOutline } from '@/lib/types'

const cwd = process.cwd()
const POSTS_DIR = path.join(cwd, 'posts')

function countWords(text: string): number {
  const replacedText = text.replace(/[a-zA-Z]+/g, 'A')
  const matches = replacedText.match(/[一-龥A]/g)
  return matches ? matches.length : 0
}

function readPostFromFile(file: string): Post {
  const fullPath = path.join(POSTS_DIR, file)
  const timestamp = Math.floor(fs.statSync(fullPath).mtimeMs)
  const src = fs.readFileSync(fullPath, 'utf-8')
  const { data, excerpt, content } = matter(src, { excerpt: true })
  const normalizedContent = toMdxSource(content)
  const normalizedExcerpt = excerpt ? toMdxSource(excerpt) : undefined

  const slug = file.replace(/\.md$/i, '')
  const createTimestamp = data.date ? new Date(data.date).getTime() : timestamp

  return {
    slug,
    title: data.title ?? slug,
    outline: data.outline,
    content: normalizedContent,
    href: `/posts/${slug}/`,
    create: Number.isNaN(createTimestamp) ? timestamp : createTimestamp,
    update: timestamp,
    tags: data.tags,
    collection: data.collection,
    wordCount: countWords(normalizedContent),
    cover: data.cover,
    excerpt: normalizedExcerpt || undefined,
    pinned: !!data.pinned,
  }
}

let cachedPosts: Post[] | null = null

export function getAllPosts(): Post[] {
  if (cachedPosts) {
    return cachedPosts
  }

  cachedPosts = fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md') && file !== 'index.md')
    .map(readPostFromFile)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.create - a.create
    })

  return cachedPosts
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((post) => post.slug === slug)
}

export function getAllPostSlugs(): string[] {
  return getAllPosts().map((post) => post.slug)
}
