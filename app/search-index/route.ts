import { getAllPosts } from '@/lib/posts'
import { createSearchDocuments } from '@/lib/search'

export const dynamic = 'force-static'

export function GET() {
  return Response.json(createSearchDocuments(getAllPosts()), {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
