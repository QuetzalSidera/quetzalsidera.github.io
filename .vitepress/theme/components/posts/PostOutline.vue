<template>
  <aside v-if="outlineItems.length" class="outline">
    <div class="outline-card">
      <p class="outline-title">文章导航</p>
      <ul class="outline-list">
        <li v-for="item in outlineItems" :key="item.slug" class="outline-item" :class="['level-' + item.level]">
          <a :href="`#${item.slug}`" :class="{ active: activeSlug === item.slug }">
            {{ item.title }}
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { resolveCurrentPost } from '../../utils/currentPost'

const { page } = useData()
const route = useRoute()
const base = useData().site.value.base
const activeSlug = ref('')
let scrollRafId: number | null = null

const outlineItems = computed(() => {
  const currentPost = resolveCurrentPost({
    relativePath: page.value.relativePath,
    routePath: route.path,
    base,
  })

  return (currentPost?.outline ?? [])
    .filter((item) => item.title && item.slug)
    .map((item) => ({
      level: Math.max(Number(item.level ?? 0), 0),
      title: item.title!.trim(),
      slug: item.slug!.trim(),
    }))
})

const updateActiveSlug = () => {
  const headings = outlineItems.value
    .map((item) => document.getElementById(item.slug))
    .filter((item): item is HTMLElement => item !== null)

  if (!headings.length) {
    activeSlug.value = ''
    return
  }

  const activationLine = Math.max(110, Math.min(window.innerHeight * 0.18, 180))
  const currentHeading =
    headings.reduce((closestHeading, heading) => {
      const closestDistance = Math.abs(closestHeading.getBoundingClientRect().top - activationLine)
      const currentDistance = Math.abs(heading.getBoundingClientRect().top - activationLine)

      const isCurrentPassed = heading.getBoundingClientRect().top <= activationLine
      const isClosestPassed = closestHeading.getBoundingClientRect().top <= activationLine

      if (isCurrentPassed !== isClosestPassed) {
        return isCurrentPassed ? heading : closestHeading
      }

      return currentDistance < closestDistance ? heading : closestHeading
    }, headings[0])

  activeSlug.value = currentHeading.id
}

const handleScroll = () => {
  if (scrollRafId !== null) {
    return
  }

  scrollRafId = window.requestAnimationFrame(() => {
    scrollRafId = null
    updateActiveSlug()
  })
}

const initOutline = async () => {
  await nextTick()
  updateActiveSlug()
}

onMounted(() => {
  initOutline()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (scrollRafId !== null) {
    window.cancelAnimationFrame(scrollRafId)
  }
})

watch(
  () => page.value.relativePath,
  () => {
    initOutline()
  },
)
</script>

<style scoped lang="less">
.outline {
  position: fixed;
  top: 10%;
  right: max(16px, calc((100vw - 1200px) / 2 - 292px));
  width: 200px;
  max-height: calc(100dvh - 180px - 10%);
  overflow: hidden;
  z-index: 10;

  border-radius: 24px;
  border: solid 2px var(--foreground-color);
  background: color-mix(in srgb, var(--foreground-color) 86%, transparent);
  box-shadow: 0 0 8px rgb(var(--blue-shadow-color), 0.8);
  backdrop-filter: var(--blur-val);

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.outline-title {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--font-color-grey);
}

.outline-card {

  padding: 20px 12px 20px 18px;
  overflow-y: auto;

  scrollbar-width: none;
  transition: all 0.3s ease-in-out;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
}


.outline-list {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 5px;
  width: 100%;
  max-width: 100%;
}

.outline-item {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.outline-item a {

  display: block;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  padding: 5px;
  border-radius: 12px;
  color: var(--font-color-grey);
  line-height: 1.5;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  text-wrap: wrap;
  word-break: break-all;
  text-overflow: ellipsis;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  &.active {
    color: var(--color-blue);
  }
}

.level-1 a {
  padding-left: 12px;
  font-size: 14px;
  opacity: 0.9;
}

.level-2 a {
  padding-left: 24px;
  font-size: 13px;
  opacity: 0.8;
}

@media (max-width: 1500px) {
  .outline {
    display: none;
  }
}
</style>
