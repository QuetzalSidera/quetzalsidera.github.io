<template>
  <button
    class="to-top-button"
    :class="buttonClass"
    @click="toTop"
    title="回到顶部"
  >
    <svg class="to-top-button__progress" viewBox="0 0 44 44" aria-hidden="true">
      <circle class="to-top-button__progress-track" cx="22" cy="22" r="18" />
      <circle
        class="to-top-button__progress-ring"
        cx="22"
        cy="22"
        r="18"
        :style="progressStyle"
      />
    </svg>
    <FontAwesomeIcon :icon="faPlaneUp" class="to-top-button__icon" />
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { faPlaneUp } from '@fortawesome/free-solid-svg-icons'
import FontAwesomeIcon from '../FontAwesomeIcon.vue'

const isVisible = ref(false)
const hasMounted = ref(false)
const progress = ref(0)

const progressStyle = computed(() => {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress.value)

  return {
    strokeDasharray: `${circumference}`,
    strokeDashoffset: `${offset}`,
  }
})

const onScroll = () => {
  window.requestAnimationFrame(() => {
    isVisible.value = window.scrollY > 600
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    progress.value = scrollHeight > 0
      ? Math.min(Math.max(window.scrollY / scrollHeight, 0), 1)
      : 0
  })
}

const buttonClass = computed(() => {
  if (!hasMounted.value) {
    return ''
  }

  return isVisible.value ? 'to-top-button--enter' : 'to-top-button--leave'
})

const toTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  hasMounted.value = true
  window.addEventListener('scroll', onScroll)
  onScroll()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})

</script>

<style scoped lang="less">
.to-top-button {
  //样式来自于SideList
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  transform: translateY(24px);
  position: relative;
  width: var(--sidelist-button-width);
  height: var(--sidelist-button-height);
  color: var(--sidelist-button-color);
  font-size: var(--sidelist-button-font-size);
  border-radius: var(--sidelist-button-border-radius);
  border: var(--sidelist-button-border);
  background: var(--sidelist-button-background);
  box-shadow: var(--sidelist-button-box-shadow);
  backdrop-filter: var(--sidelist-button-backdrop-filter);
}

.to-top-button__progress {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  rotate: -90deg;
  pointer-events: none;
}

.to-top-button__progress-track,
.to-top-button__progress-ring {
  fill: none;
  stroke-width: 2.5;
}

.to-top-button__progress-track {
  stroke: rgba(var(--blue-shadow-color), 0.16);
}

.to-top-button__progress-ring {
  stroke: var(--color-blue);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.12s linear;
}

.to-top-button--enter {
  opacity: 1;
  pointer-events: auto;
  animation: to-top-button-enter 0.45s ease forwards;
}

.to-top-button--leave {
  opacity: 0;
  pointer-events: none;
  animation: to-top-button-leave 0.55s ease forwards;
}

.to-top-button__icon {
  position: relative;
  z-index: 1;
  transform: rotate(180deg);
}

.to-top-button--enter .to-top-button__icon {
  animation: to-top-button-icon-enter 0.45s ease forwards;
}

.to-top-button--leave .to-top-button__icon {
  animation: to-top-button-icon-leave 0.55s ease forwards;
}

@keyframes to-top-button-enter {
  0% {
    opacity: 0;
    transform: translateY(24px);
  }

  45% {
    opacity: 1;
    transform: translateY(24px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes to-top-button-leave {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  45% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(24px);
  }
}

@keyframes to-top-button-icon-enter {
  0% {
    transform: rotate(180deg);
  }

  45% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(0deg);
  }
}

@keyframes to-top-button-icon-leave {
  0% {
    transform: rotate(0deg);
  }

  45% {
    transform: rotate(180deg);
  }

  100% {
    transform: rotate(180deg);
  }
}
</style>
