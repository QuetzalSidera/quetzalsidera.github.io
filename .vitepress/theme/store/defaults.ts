import type { PostData } from '../utils/posts.data'

export function createEmptyPost(): PostData {
  return {
    id: 0,
    title: '',
    content: '',
    href: '',
    create: 0,
    update: 0,
    tags: [],
    wordCount: 0,
    cover: '',
    excerpt: '',
    pinned: false,
  }
}
