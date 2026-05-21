<template>
  <Banner v-if="currentCollection"
          :title="currentCollection.title"
          :subtitle="`创建于 ${formatDate(currentCollection.create)} | ${currentCollection.postCount}篇文章`"
          :description="currentCollection.description"
  ></Banner>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { resolveCurrentCollection } from '../../utils/currentCollection'
import Banner from '../shared/Banner.vue'

const { page } = useData()
const route = useRoute()
const base = useData().site.value.base

const currentCollection = computed(() => {
  return resolveCurrentCollection({
    relativePath: page.value.relativePath,
    routePath: route.path,
    base,
  })
})

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp))
}
</script>
