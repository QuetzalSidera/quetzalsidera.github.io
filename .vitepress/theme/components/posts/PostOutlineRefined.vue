<template>
  <aside v-if="outlineItems.length" class="outline" :class="state.outlineState">
    <p class="outline-title">文章导航</p>
    <div class="outline-card">
      <ul class="outline-list">
        <li
          v-for="item in outlineItems"
          :key="item.slug"
          class="outline-item"
          :class="['level-' + item.level]"
        >
          <a :href="`#${item.slug}`" :class="{ active: activeSlug === item.slug }">
            {{ item.title }}
          </a>
        </li>
      </ul>
    </div>
    <button class="outline-button" @click="toggleOutline" title="文章导航">
      <FontAwesomeIcon :icon="faAngleRight" />
    </button>
  </aside>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { resolveCurrentPost } from '../../utils/currentPost'
import { useStore } from '../../store'
import FontAwesomeIcon from '../FontAwesomeIcon.vue'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'

const state = useStore().state
const { page } = useData()
const route = useRoute()
const base = useData().site.value.base
const activeSlug = ref('')
let scrollRafId: number | null = null

const toggleOutline = () => {
  if (state.outlineState !== 'expanded' && state.outlineState !== 'collapsed') return
  switch (state.outlineState) {
    case 'expanded':
      state.outlineState = 'collapsing'
      setTimeout(() => {
        state.outlineState = 'collapsed'
      }, 1000)
      break
    case 'collapsed':
      state.outlineState = 'expanding'
      setTimeout(() => {
        state.outlineState = 'expanded'
      }, 1000)
  }
}

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
  --outline-duration-width: 0.42s;
  --outline-duration-height: 0.58s;
  --outline-reveal-delay: 0.42s;
  --outline-collapsed-width: var(--sidelist-button-width);
  --outline-collapsed-height: var(--sidelist-button-height);
  --outline-expanded-width: 200px;
  --outline-stack-offset: calc(var(--sidelist-button-gap) * 2 + var(--sidelist-button-height) * 2);
  --outline-expanded-height: min(700px, calc((1 - var(--sidelist-bottom-float)) * 100dvh - var(--sidelist-button-gap) * (var(--sidelist-button-count) - 1) - var(--sidelist-button-height) * (var(--sidelist-button-count) - 1) - 80px));

  --outline-expanded-radius: 24px;
  --outline-collapsed-radius: var(--sidelist-button-border-radius);

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: absolute;
  right: 0;
  bottom: var(--outline-stack-offset);
  overflow: hidden;
  z-index: 10;
  box-sizing: border-box;
  border-radius: var(--outline-collapsed-radius);
  border: var(--sidelist-button-border);
  background: var(--sidelist-button-background);
  box-shadow: var(--sidelist-button-box-shadow);
  backdrop-filter: var(--sidelist-button-backdrop-filter);

  &.expanded,
  &.expanding {
    width: var(--outline-expanded-width);
    height: var(--outline-expanded-height);
    border-radius: var(--outline-expanded-radius);
  }

  &.collapsed,
  &.collapsing {
    width: var(--outline-collapsed-width);
    height: var(--outline-collapsed-height);
    border-radius: var(--outline-collapsed-radius);
  }

  &.expanding {
    transition: width var(--outline-duration-width) ease,
    height var(--outline-duration-height) ease var(--outline-duration-width),
    border-radius 0.25s ease;
  }

  &.collapsing {
    transition: height var(--outline-duration-height) ease,
    width var(--outline-duration-width) ease var(--outline-duration-height),
    border-radius 0.25s ease calc(var(--outline-duration-height) + var(--outline-duration-width) - 0.12s);
  }
}

.outline-title {
  --outline-title-top-expanded: 10px;
  --outline-title-top-collapsed: 0;
  --outline-title-left-expanded: 10px;
  --outline-title-left-collapsed: 0;
  --outline-title-opacity-expanded: 1;
  --outline-title-opacity-collapsed: 0;

  position: absolute;
  top: var(--outline-title-top-collapsed);
  left: var(--outline-title-left-collapsed);
  margin: 0;
  height: var(--sidelist-button-height);
  line-height: 2;
  font-size: calc(var(--sidelist-button-height) / 2);
  font-weight: 700;
  color: var(--font-color-grey);
  white-space: nowrap;
  opacity: var(--outline-title-opacity-collapsed);
}

.outline.expanded .outline-title {
  top: var(--outline-title-top-expanded);
  left: var(--outline-title-left-expanded);
  opacity: var(--outline-title-opacity-expanded);
}

.outline.expanding .outline-title {
  animation: outline-title-expanding 1s forwards;
}

.outline.collapsing .outline-title {
  animation: outline-title-collapsing 1s forwards;
}

.outline.collapsed .outline-title {
  top: var(--outline-title-top-collapsed);
  left: var(--outline-title-left-collapsed);
  opacity: var(--outline-title-opacity-collapsed);
}

@keyframes outline-title-expanding {
  0% {
    opacity: var(--outline-title-opacity-collapsed);
    top: var(--outline-title-top-collapsed);
    left: var(--outline-title-left-collapsed);
  }

  50% {
    opacity: var(--outline-title-opacity-expanded);
    top: var(--outline-title-top-collapsed);
    left: var(--outline-title-left-expanded);
  }

  100% {
    opacity: var(--outline-title-opacity-expanded);
    top: var(--outline-title-top-expanded);
    left: var(--outline-title-left-expanded);
  }
}

@keyframes outline-title-collapsing {
  0% {
    opacity: var(--outline-title-opacity-expanded);
    top: var(--outline-title-top-expanded);
    left: var(--outline-title-left-expanded);
  }

  50% {
    opacity: var(--outline-title-opacity-expanded);
    top: var(--outline-title-top-collapsed);
    left: var(--outline-title-left-expanded);
  }

  100% {
    opacity: var(--outline-title-opacity-collapsed);
    top: var(--outline-title-top-collapsed);
    left: var(--outline-title-left-collapsed);
  }
}

.outline-button {
  --outline-button-top-expanded: 10px;
  --outline-button-top-collapsed: 0;
  --outline-button-right-expanded: 10px;
  --outline-button-right-collapsed: 0;
  --outline-button-rotate-expanded: 90deg;
  --outline-button-rotate-collapsed: 0deg;

  position: absolute;
  top: var(--outline-button-top-collapsed);
  right: var(--outline-button-right-collapsed);
  width: var(--sidelist-button-width);
  height: var(--sidelist-button-height);
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  color: var(--sidelist-button-color);
  font-size: var(--sidelist-button-font-size);
  line-height: 1;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  rotate: var(--outline-button-rotate-collapsed);

  &:focus {
    outline: none;
  }
}

.outline.expanded .outline-button {
  top: var(--outline-button-top-expanded);
  right: var(--outline-button-right-expanded);
  rotate: var(--outline-button-rotate-expanded);
}

.outline.expanding .outline-button {
  animation: outline-button-expanding 1s forwards;
}

.outline.collapsing .outline-button {
  animation: outline-button-collapsing 1s forwards;
}

.outline.collapsed .outline-button {
  top: var(--outline-button-top-collapsed);
  right: var(--outline-button-right-collapsed);
  rotate: var(--outline-button-rotate-collapsed);
}

@keyframes outline-button-expanding {
  0% {
    top: var(--outline-button-top-collapsed);
    right: var(--outline-button-right-collapsed);
    rotate: var(--outline-button-rotate-collapsed);
  }

  50% {
    top: var(--outline-button-top-collapsed);
    right: var(--outline-button-right-expanded);
    rotate: var(--outline-button-rotate-expanded);
  }

  100% {
    top: var(--outline-button-top-expanded);
    right: var(--outline-button-right-expanded);
    rotate: var(--outline-button-rotate-expanded);
  }
}

@keyframes outline-button-collapsing {
  0% {
    top: var(--outline-button-top-expanded);
    right: var(--outline-button-right-expanded);
    rotate: var(--outline-button-rotate-expanded);
  }

  50% {
    top: var(--outline-button-top-collapsed);
    right: var(--outline-button-right-expanded);
    rotate: var(--outline-button-rotate-expanded);
  }

  100% {
    top: var(--outline-button-top-collapsed);
    right: var(--outline-button-right-collapsed);
    rotate: var(--outline-button-rotate-collapsed);
  }
}

.outline-card {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0 12px 20px 18px;
  margin-top: 50px;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: none;
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.18s ease,
  transform 0.26s ease;
}

.outline.expanded .outline-card,
.outline.expanding .outline-card {
  opacity: 1;
  transform: translateY(0);
  transition-delay: var(--outline-reveal-delay);
}

.outline.collapsed .outline-card,
.outline.collapsing .outline-card {
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition-delay: 0s;
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
  overflow: hidden;
  text-wrap: wrap;
  word-break: break-all;
  text-overflow: ellipsis;
  transition: background-color 0.2s ease,
  color 0.2s ease;

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
</style>
