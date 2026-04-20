<template>
  <ul class="tags">
    <li :class="['item', { active: active === tag }]" v-for="(_, tag) in tagData">
      <a href="javascript:void(0)" @click="setTag(tag)"
        ><i class="iconfont icon-tag"></i> {{ tag }}</a
      >
    </li>
  </ul>
</template>
<script setup lang="ts">
import { data as posts, type PostData } from '../../utils/posts.data'
import { ref, watch, onUnmounted, onMounted } from 'vue'
import { useStore } from '../../store'

const active = ref<string | null>(null)
const tagData: Record<string, PostData[]> = {}
const { state } = useStore()
let handlePopState: (() => void) | null = null

for (const post of posts) {
  if (!post.tags) continue
  for (const tag of post.tags) {
    if (!tagData[tag]) tagData[tag] = []
    tagData[tag].push(post)
  }
}

function getFirstTag() {
  return Object.keys(tagData)[0] || ''
}

function resolveTag(tag: string) {
  if (tag && tagData[tag]) {
    return tag
  }

  return getFirstTag()
}

const setTag = (tag: string, syncUrl = true) => {
  const nextTag = resolveTag(tag)
  active.value = nextTag || null
  state.selectedPosts = nextTag ? tagData[nextTag] || [] : []
  state.currTag = nextTag

  if (!syncUrl || typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)

  if (nextTag) {
    url.searchParams.set('tag', nextTag)
  } else {
    url.searchParams.delete('tag')
  }

  url.searchParams.delete('page')
  window.history.pushState({}, '', url.toString())
}

// 从URL获取tag
function getTagFromUrl(): string {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const tagParam = urlParams.get('tag')
    if (tagParam && tagData[tagParam]) {
      return tagParam
    }
  }
  return state.currTag || ''
}

// 挂载组件时获取URL的tag
onMounted(() => {
  const tagFromUrl = getTagFromUrl()
  const firstTag = getFirstTag()

  if (tagFromUrl) {
    setTag(tagFromUrl)
  } else if (state.currTag) {
    setTag(state.currTag)
  } else if (firstTag) {
    setTag(firstTag)
  }

  handlePopState = () => {
    const tagFromUrl = getTagFromUrl()
    const nextTag = resolveTag(tagFromUrl)
    if (nextTag !== active.value) {
      setTag(tagFromUrl, false)
    }
  }
  window.addEventListener('popstate', handlePopState)
})

watch(
  () => state.currTag,
  (newTag) => {
    if (newTag !== active.value) {
      setTag(newTag)
    }
  },
)

onUnmounted(() => {
  if (handlePopState) {
    window.removeEventListener('popstate', handlePopState)
  }
  active.value = null
  state.selectedPosts = []
})
</script>
<style scoped lang="less">
.active a {
  background-color: var(--btn-hover) !important;
}

.tags {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  box-sizing: border-box;
  padding: 16px;
  background-color: var(--infobox-background-initial);
  border-radius: 32px;
  border: solid 2px var(--foreground-color);
  backdrop-filter: var(--blur-val);
  width: 768px;
  z-index: 100;

  li {
    margin: 8px;

    a {
      color: var(--font-color-grey);
      padding: 3px 5px;
      color: var(--font-color-gold);
      background-color: var(--btn-background);
      border-radius: 5px;
      transition: background-color 0.5s;

      &:hover {
        background-color: var(--btn-hover);
      }
    }
  }
}

@media (max-width: 768px) {
  .tags {
    width: auto;
    li {
      margin: 4px;
      a {
        font-size: 12px;
        .icon-tag {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
