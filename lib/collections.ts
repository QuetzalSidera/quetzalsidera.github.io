/**
 * 文集数据加载。
 * 迁移自 .vitepress/theme/utils/collections.data.mts；构建期同步读取 collections/*.md。
 */

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { getAllPosts } from '@/lib/posts'
import type { CollectionData, CollectionPageData, Post } from '@/lib/types'
export type { CollectionData, CollectionPageData } from '@/lib/types'

const cwd = process.cwd()
const COLLECTIONS_DIR = path.join(cwd, 'collections')

function parseDate(value: unknown, fallback: number) {
  if (!value) {
    return fallback
  }

  const timestamp = new Date(String(value)).getTime()
  return Number.isNaN(timestamp) ? fallback : timestamp
}

function normalizeCollectionRef(value?: string) {
  return (value || '').trim().toLowerCase()
}

function readCollectionFromFile(file: string): CollectionData {
  const fullPath = path.join(COLLECTIONS_DIR, file)
  const timestamp = Math.floor(fs.statSync(fullPath).mtimeMs)
  const src = fs.readFileSync(fullPath, 'utf-8')
  const { data, excerpt } = matter(src, { excerpt: true })
  const slug = file.replace(/\.md$/i, '')

  return {
    title: data.title || slug,
    slug,
    href: `/collections/${slug}/`,
    create: parseDate(data.date, timestamp),
    update: timestamp,
    cover: data.cover,
    description: data.description || excerpt || '',
    tags: data.tags,
  }
}

let cachedCollections: CollectionData[] | null = null

export function getAllCollections(): CollectionData[] {
  if (cachedCollections) {
    return cachedCollections
  }

  cachedCollections = fs
    .readdirSync(COLLECTIONS_DIR)
    .filter((file) => file.endsWith('.md') && file !== 'index.md')
    .map(readCollectionFromFile)
    .sort((a, b) => b.create - a.create)

  return cachedCollections
}

export function getCollectionBySlug(slug: string): CollectionData | undefined {
  return getAllCollections().find((collection) => collection.slug === slug)
}

export function getAllCollectionSlugs(): string[] {
  return getAllCollections().map((collection) => collection.slug)
}

export function getPostsByCollection(collection?: CollectionData): Post[] {
  if (!collection) {
    return []
  }

  const titleRef = normalizeCollectionRef(collection.title)
  const slugRef = normalizeCollectionRef(collection.slug)

  return getAllPosts().filter((post) => {
    const postRef = normalizeCollectionRef(post.collection)
    return postRef === titleRef || postRef === slugRef
  })
}

export function getCollectionPageData(slug: string): CollectionPageData | undefined {
  const collection = getCollectionBySlug(slug)
  if (!collection) {
    return undefined
  }

  const posts = getPostsByCollection(collection)

  return {
    ...collection,
    posts,
    postCount: posts.length,
  }
}
