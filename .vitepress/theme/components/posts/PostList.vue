<template>
  <div class="container posts-content">
    <div class="posts-toolbar">
      <label class="sort-control">
        <span class="sort-label">排序</span>
        <select v-model="sortMode" @change="handleSortChange">
          <option value="newest">最近发布</option>
          <option value="oldest">最早发布</option>
        </select>
      </label>
    </div>
    <TransitionGroup class="posts-list" name="list" tag="div">
      <PostListCard
        v-for="item in listItems"
        :key="item.href"
        :item="item"
        :base="base"
        @select-tag="state.currTag = $event"
      />
    </TransitionGroup>
    <div v-if="totalPage != 1" class="pagination">
      <button
        :disabled="isActivePage(1)"
        :class="{ hide: isActivePage(1) }"
        id="up"
        @click="goToPage(currPage - 1)"
      >
        <i class="iconfont icon-arrow"></i>
      </button>

      <div class="page-numbers">
        <!-- 第一页 -->
        <button class="page-number" :class="{ active: isActivePage(1) }" @click="goToPage(1)">
          1
        </button>

        <!-- 页码省略号 -->
        <span v-if="showLeftEllipsis" class="ellipsis">...</span>

        <!-- 当前页码 -->
        <button
          v-for="page in visiblePageNumbers"
          :key="page"
          class="page-number"
          :class="{ active: isActivePage(page) }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <!-- 页码省略号 -->
        <span v-if="showRightEllipsis" class="ellipsis">...</span>

        <!-- 尾页 -->
        <button
          v-if="totalPage > 1"
          class="page-number"
          :class="{ active: isActivePage(totalPage) }"
          @click="goToPage(totalPage)"
        >
          {{ totalPage }}
        </button>
      </div>

      <button
        :disabled="currPage >= totalPage"
        :class="{ hide: currPage >= totalPage }"
        id="next"
        @click="goToPage(currPage + 1)"
      >
        <i class="iconfont icon-arrow"></i>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, onMounted, onUnmounted, ref, toRef, watch } from 'vue'
import { data as posts, type PostData } from '../../utils/posts.data'
import { type CollectionData, data as collections } from '../../utils/collections.data'
import { getPostsByCollection } from '../../utils/currentCollection'
import { useStore } from '../../store'
import PostListCard from './PostListCard.vue'
import type { PostListItem } from '../../types/post-list'

const { state } = useStore()
const { page } = useData()
const base = useData().site.value.base
let handlePopState: (() => void) | null = null
const sortMode = ref<'newest' | 'oldest'>('newest')

function mapPostsToListItems(items: PostData[]): PostListItem[] {
  return items.map((post) => ({
    title: post.title,
    href: post.href,
    create: post.create,
    cover: post.cover,
    excerpt: post.excerpt || '',
    tags: post.tags ?? [],
    tagsInteractive: true,
    pinned: !!post.pinned,
    metricText: `约${post.wordCount}字`,
  }))
}

function mapCollectionsToListItems(items: CollectionData[]): PostListItem[] {
  return items.map((collection) => ({
    title: collection.title,
    href: collection.href,
    create: collection.create,
    cover: collection.cover,
    excerpt: collection.description || '',
    tags: collection.tags ?? [],
    tagsInteractive: false,
    pinned: false,
    metricText: `共${getPostsByCollection(collection).length}篇文章`,
  }))
}

const finalItems = computed(() => {
  if (page.value.filePath === 'index.md') {
    return mapPostsToListItems(posts)
  } else if (page.value.filePath === 'tags/index.md') {
    return mapPostsToListItems(state.selectedPosts)
  } else if (page.value.filePath === 'collections/index.md') {
    return mapCollectionsToListItems(collections)
  } else if (
    page.value.filePath?.startsWith('collections/') &&
    page.value.filePath !== 'collections/index.md'
  ) {
    return mapPostsToListItems(state.selectedPosts)
  }
  return []
})

function compareTitles(a: PostListItem, b: PostListItem) {
  return a.title.localeCompare(b.title, 'zh-CN')
}

function sortItems(items: PostListItem[]) {
  if (sortMode.value === 'default') {
    return items
  }

  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1
    }

    if (sortMode.value === 'newest') {
      return b.create - a.create
    }

    if (sortMode.value === 'oldest') {
      return a.create - b.create
    }

    if (sortMode.value === 'title-asc') {
      return compareTitles(a, b)
    }

    return compareTitles(b, a)
  })
}

// 文章列表长度
const pageSize = ref(5)

const currPage = toRef(state, 'currPage')

function isActivePage(pageNumber: number) {
  return currPage.value === pageNumber
}

onMounted(() => {
  updatePageFromUrl()
  handlePopState = () => {
    updatePageFromUrl()
  }
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  if (handlePopState) {
    window.removeEventListener('popstate', handlePopState)
  }
})

function updatePageFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  const pageParam = urlParams.get('page')
  if (
    pageParam &&
    !isNaN(parseInt(pageParam)) &&
    parseInt(pageParam) > 0 &&
    parseInt(pageParam) <= totalPage.value
  ) {
    state.currPage = parseInt(pageParam)
  } else {
    state.currPage = 1
  }
}

// 更新页码逻辑
function goToPage(page: number) {
  if (page < 1 || page > totalPage.value) return
  state.currPage = page

  // 获取URL信息
  const url = new URL(window.location.href)

  // 非首页时获取URL页码
  if (page > 1) {
    url.searchParams.set('page', page.toString())
  } else {
    url.searchParams.delete('page')
  }

  // Tag页面页码逻辑
  const tagParam = url.searchParams.get('tag')
  if (tagParam) {
    url.searchParams.set('tag', tagParam)
  }

  const collectionParam = url.searchParams.get('collection')
  if (collectionParam) {
    url.searchParams.set('collection', collectionParam)
  }

  window.history.pushState({}, '', url.toString())
}

// 计算要显示的页码
const maxVisiblePages = 3 // 省略号两边显示的页码按钮数量
const visiblePageNumbers = computed(() => {
  if (totalPage.value <= 7)
    return Array.from({ length: totalPage.value - 2 }, (_, i) => i + 2).filter(
      (p) => p > 1 && p < totalPage.value,
    )

  let startPage = Math.max(2, currPage.value - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPage.value - 1, startPage + maxVisiblePages - 1)

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(2, endPage - maxVisiblePages + 1)
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)
})

// 省略号显示逻辑
const showLeftEllipsis = computed(() => {
  return totalPage.value > 7 && visiblePageNumbers.value[0] > 2
})

const showRightEllipsis = computed(() => {
  return (
    totalPage.value > 7 &&
    visiblePageNumbers.value[visiblePageNumbers.value.length - 1] < totalPage.value - 1
  )
})
const sortedItems = computed(() => {
  return sortItems(finalItems.value)
})

const postsList = computed(() => {
  return sortedItems.value.slice(
    (currPage.value - 1) * pageSize.value,
    currPage.value * pageSize.value,
  )
})
const totalPage = computed(() => {
  return Math.ceil(sortedItems.value.length / pageSize.value) || 1
})

const listItems = computed(() => postsList.value)

function handleSortChange() {
  currPage.value = 1
  const url = new URL(window.location.href)
  url.searchParams.delete('page')
  window.history.replaceState({}, '', url.toString())
}

// 监听文章列表
watch(
  () => state.selectedPosts,
  () => {
    // 标签页逻辑，获取URL页码
    const urlParams = new URLSearchParams(window.location.search)
    const pageParam = urlParams.get('page')

    // 标签更改时重置页码
    const newTotalPages = Math.ceil(state.selectedPosts.length / pageSize.value) || 1

    if (!pageParam || currPage.value > newTotalPages) {
      currPage.value = 1

      // 更新URL
      if (pageParam) {
        const url = new URL(window.location.href)
        url.searchParams.delete('page')
        window.history.pushState({}, '', url.toString())
      }
    }
  },
)
</script>
<style scoped lang="less">
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}

.list-leave-active {
  position: absolute;
  right: 0;
  left: 0;
}

.posts-list {
  position: relative;
  overflow-wrap: break-word;
}

.posts-toolbar {
  display: flex;
  justify-content: flex-end;
  margin: 0 0 20px;
}

.sort-control {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 14px;
  border: solid 2px var(--foreground-color);
  background: color-mix(in srgb, var(--foreground-color) 88%, transparent);
  box-shadow: 0 0 8px rgb(var(--blue-shadow-color), 0.25);
  backdrop-filter: var(--blur-val);
}

.sort-label {
  color: var(--font-color-grey);
  font-size: 14px;
  font-weight: 600;
}

.sort-control select {
  min-width: 132px;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--font-color-grey);
  font-size: 14px;
  cursor: pointer;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 50px;
  padding: 0;

  button {
    background-color: transparent;
    border-style: none;
    cursor: pointer;
  }

  .hide {
    opacity: 0;
    cursor: auto;
  }

  .icon-arrow {
    font-size: 36px;
    color: var(--icon-color);
  }

  #up {
    animation: arrow-pre 1s ease-in-out infinite alternate;
  }

  #next {
    animation: arrow-next 1s ease-in-out infinite alternate;
  }

  .page-numbers {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .page-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 16px;
    border-radius: 6px;
    color: var(--icon-color);
    transition: all 0.3s;

    &:hover {
      background-color: var(--btn-hover);
      color: var(--font-color-gold);
    }

    &.active {
      background-color: var(--btn-hover);
      color: var(--font-color-gold);
      font-weight: bold;
    }
  }

  .ellipsis {
    margin: 0 4px;
    color: var(--icon-color);
  }
}

@keyframes arrow-pre {
  from {
    transform: translateX(0) rotate(-0.25turn);
  }

  to {
    transform: translateX(10px) rotate(-0.25turn);
  }
}

@keyframes arrow-next {
  from {
    transform: translateX(0) rotate(0.25turn);
  }

  to {
    transform: translateX(-10px) rotate(0.25turn);
  }
}

@media (max-width: 768px) {
  .posts-toolbar {
    margin: 0 8px 16px;
  }

  .sort-control {
    width: 100%;
    justify-content: space-between;
    padding: 8px 12px;
  }

  .pagination {
    margin-top: 32px;

    .icon-arrow {
      font-size: 32px;
    }

    .page-number {
      width: 28px;
      height: 28px;
      font-size: 14px;
    }

    .page-numbers {
      gap: 4px;
    }
  }
}
</style>
