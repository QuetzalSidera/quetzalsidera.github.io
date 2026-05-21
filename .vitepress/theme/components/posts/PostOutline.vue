<template>
  <aside v-if="outlineItems.length" class="outline" :class="state.outlineState">
    <p class="outline-title" :class="state.outlineState">文章导航</p>
    <div class="outline-card" :class="state.outlineState">
      <ul class="outline-list">
        <li v-for="item in outlineItems" :key="item.slug" class="outline-item" :class="['level-' + item.level]">
          <a :href="`#${item.slug}`" :class="{ active: activeSlug === item.slug }">
            {{ item.title }}
          </a>
        </li>
      </ul>
    </div>
    <button class="outline-button" :class="state.outlineState" @click="toggleOutline" title="文章导航">
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
  //动画持续时间
  --outline-animation-duration: 1s;

  //collapsed样式来自于SideList（collapsed状态下与SideList中其他按钮样式一致）
  --outline-collapsed-width: var(--sidelist-button-width);
  --outline-collapsed-height: var(--sidelist-button-height);

  --outline-expanded-width: 200px;
  --outline-expanded-height: 700px;

  //样式来自于SideList
  border-radius: var(--sidelist-button-border-radius);
  border: var(--sidelist-button-border);
  background: var(--sidelist-button-background);
  box-shadow: var(--sidelist-button-box-shadow);
  backdrop-filter: var(--sidelist-button-backdrop-filter);

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
  z-index: 10;
  max-height: calc(100dvh - 300px);
  box-sizing: border-box;

  &.expanded {
    width: var(--outline-expanded-width);
    height: var(--outline-expanded-height);
  }

  &.expanding {
    animation: outline-expanding var(--outline-animation-duration) forwards;
  }

  &.collapsing {
    animation: outline-collapsing var(--outline-animation-duration) forwards;
  }

  &.collapsed {
    width: var(--outline-collapsed-width);
    height: var(--outline-collapsed-height);
  }

  @keyframes outline-expanding {
    0% {
      width: var(--outline-collapsed-width);
      height: var(--outline-collapsed-height);
    }
    50% {
      width: var(--outline-expanded-width);
      height: var(--outline-collapsed-height);
    }
    100% {
      width: var(--outline-expanded-width);
      height: var(--outline-expanded-height);
    }
  }
  @keyframes outline-collapsing {
    0% {
      width: var(--outline-expanded-width);
      height: var(--outline-expanded-height);
    }
    50% {
      width: var(--outline-expanded-width);
      height: var(--outline-collapsed-height);
    }
    100% {
      width: var(--outline-collapsed-width);
      height: var(--outline-collapsed-height);
    }
  }
}

.outline-title {
  --outline-title-height: var(--sidelist-button-height);
  --outline-title-line-height: 2;
  --outline-title-expanded-opacity: 1;
  --outline-title-collapsed-opacity: 0;
  --outline-title-expanded-top: 10px;
  --outline-title-collapsed-top: 0;
  --outline-title-expanded-left: 10px;
  --outline-title-collapsed-left: 0;
  position: absolute;

  line-height: var(--outline-title-line-height);
  font-size: calc(var(--outline-title-height) / var(--outline-title-line-height));
  height: var(--outline-title-height);

  font-weight: 700;
  color: var(--font-color-grey);
  white-space: nowrap;
  margin: 0 auto 0 0;

  &.expanded {
    opacity: var(--outline-title-expanded-opacity);
    top: var(--outline-title-expanded-top);
    left: var(--outline-title-expanded-left);
  }

  &.expanding {
    animation: outline-title-expanding var(--outline-animation-duration) forwards;
  }

  &.collapsing {
    animation: outline-title-collapsing var(--outline-animation-duration) forwards;
  }

  &.collapsed {
    opacity: var(--outline-title-collapsed-opacity);
    top: var(--outline-title-collapsed-top);
    left: var(--outline-title-collapsed-left);
  }

  @keyframes outline-title-expanding {
    0% {
      opacity: var(--outline-title-collapsed-opacity);
      top: var(--outline-title-collapsed-top);
      left: var(--outline-title-collapsed-left);
    }
    50% {
      opacity: var(--outline-title-expanded-opacity);
      top: var(--outline-title-collapsed-top);
      left: var(--outline-title-expanded-left);
    }
    100% {
      opacity: var(--outline-title-expanded-opacity);
      top: var(--outline-title-expanded-top);
      left: var(--outline-title-expanded-left);
    }
  }

  @keyframes outline-title-collapsing {
    0% {
      opacity: var(--outline-title-expanded-opacity);
      top: var(--outline-title-expanded-top);
      left: var(--outline-title-expanded-left);
    }
    50% {
      opacity: var(--outline-title-expanded-opacity);
      top: var(--outline-title-collapsed-top);
      left: var(--outline-title-expanded-left);
    }
    100% {
      opacity: var(--outline-title-collapsed-opacity);
      top: var(--outline-title-collapsed-top);
      left: var(--outline-title-collapsed-left);
    }
  }
}

.outline-button {
  position: absolute;
  width: var(--sidelist-button-width);
  height: var(--sidelist-button-height);
  color: var(--sidelist-button-color);
  font-size: var(--sidelist-button-font-size);
  margin: 0;
  padding: 0;
  line-height: 1;
  border: none;
  background: none;
  z-index: 10;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;


  --outline-button-expanded-top: 10px;
  --outline-button-collapsed-top: 0;

  --outline-button-expanded-right: 10px;
  --outline-button-collapsed-right: 0;

  --outline-button-expanded-rotate: 90deg;
  --outline-button-collapsed-rotate: 0;


  &.expanded {
    top: var(--outline-button-expanded-top);
    right: var(--outline-button-expanded-right);
    rotate: var(--outline-button-expanded-rotate);
  }

  &.expanding {
    animation: outline-button-expanding var(--outline-animation-duration) forwards;
  }

  &.collapsing {
    animation: outline-button-collapsing var(--outline-animation-duration) forwards;
  }

  &.collapsed {
    top: var(--outline-button-collapsed-top);
    right: var(--outline-button-collapsed-right);
    rotate: var(--outline-button-collapsed-rotate);
  }

  @keyframes outline-button-expanding {
    0% {
      top: var(--outline-button-collapsed-top);
      right: var(--outline-button-collapsed-right);
      rotate: var(--outline-button-collapsed-rotate);
    }
    50% {
      top: var(--outline-button-collapsed-top);
      right: var(--outline-button-expanded-right);
      rotate: var(--outline-button-expanded-rotate);
    }
    100% {
      top: var(--outline-button-expanded-top);
      right: var(--outline-button-expanded-right);
      rotate: var(--outline-button-expanded-rotate);
    }
  }
  @keyframes outline-button-collapsing {
    0% {
      top: var(--outline-button-expanded-top);
      right: var(--outline-button-expanded-right);
      rotate: var(--outline-button-expanded-rotate);
    }
    50% {
      top: var(--outline-button-collapsed-top);
      right: var(--outline-button-expanded-right);
      rotate: var(--outline-button-expanded-rotate);
    }
    100% {
      top: var(--outline-button-collapsed-top);
      right: var(--outline-button-collapsed-right);
      rotate: var(--outline-button-collapsed-rotate);
    }
  }

  &:focus {
    outline: none;
  }
}

.outline-card {
  padding: 0 12px 20px 18px;
  overflow-y: auto;
  scrollbar-width: none;
  box-sizing: border-box;
  --outline-card-expanded-margin-top: 50px;
  --outline-card-collapsed-margin-top: 0;

  --outline-card-expanded-opacity: 1;
  --outline-card-collapsed-opacity: 0;

  --outline-card-expanded-width: 200px;
  --outline-card-collapsed-width: 0;


  &.expanded {
    margin-top: var(--outline-card-expanded-margin-top);
    opacity: var(--outline-card-expanded-opacity);
    width: var(--outline-card-expanded-width);

  }

  &.expanding {
    animation: outline-card-expanding var(--outline-animation-duration) forwards;
  }

  &.collapsing {
    animation: outline-card-collapsing var(--outline-animation-duration) forwards;
  }

  &.collapsed {
    margin-top: var(--outline-card-collapsed-margin-top);
    opacity: var(--outline-card-collapsed-opacity);
    width: var(--outline-card-collapsed-width);
  }

  @keyframes outline-card-expanding {
    0% {
      margin-top: var(--outline-card-collapsed-margin-top);
      opacity: var(--outline-card-collapsed-opacity);
      width: var(--outline-card-collapsed-width);
    }
    50% {
      margin-top: var(--outline-card-collapsed-margin-top);
      opacity: var(--outline-card-collapsed-opacity);
      width: var(--outline-card-expanded-width);
    }
    100% {
      margin-top: var(--outline-card-expanded-margin-top);
      opacity: var(--outline-card-expanded-opacity);
      width: var(--outline-card-expanded-width);
    }
  }
  @keyframes outline-card-collapsing {
    0% {
      margin-top: var(--outline-card-expanded-margin-top);
      opacity: var(--outline-card-expanded-opacity);
      width: var(--outline-card-expanded-width);
    }
    50% {
      margin-top: var(--outline-card-collapsed-margin-top);
      opacity: var(--outline-card-collapsed-opacity);
      width: var(--outline-card-expanded-width);

    }
    100% {
      margin-top: var(--outline-card-collapsed-margin-top);
      opacity: var(--outline-card-collapsed-opacity);
      width: var(--outline-card-collapsed-width);
    }
  }
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

</style>
