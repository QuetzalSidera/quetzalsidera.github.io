<template>
  <svg
    v-if="icon"
    class="fa-icon"
    :class="`fa-icon-${icon.iconName}`"
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="`0 0 ${width} ${height}`"
    aria-hidden="true"
    focusable="false"
  >
    <path
      v-for="(pathData, index) in pathList"
      :key="`${icon.iconName}-${index}`"
      :d="pathData"
      fill="currentColor"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IconDefinition } from '@fortawesome/fontawesome-common-types'

const props = defineProps<{
  icon: IconDefinition
}>()

const width = computed(() => props.icon?.icon[0] ?? 0)
const height = computed(() => props.icon?.icon[1] ?? 0)
const pathList = computed(() => {
  const svgPathData = props.icon?.icon[4]

  if (!svgPathData) {
    return []
  }

  return Array.isArray(svgPathData) ? svgPathData : [svgPathData]
})
</script>
