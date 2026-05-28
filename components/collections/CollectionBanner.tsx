import { Banner } from '@/components/shared/Banner'
import type { CollectionPageData } from '@/lib/types'

type CollectionBannerProps = {
  collection?: CollectionPageData
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp))
}

export function CollectionBanner({ collection }: CollectionBannerProps) {
  if (!collection) {
    return null
  }

  return (
    <Banner
      title={collection.title}
      subtitle={`创建于 ${formatDate(collection.create)} | ${collection.postCount}篇文章`}
      description={collection.description}
    />
  )
}
