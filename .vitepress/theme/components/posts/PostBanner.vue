<template>
  <Banner v-if="currentPost"
          :title="currentPost.title"
          :subtitle="`发布于${
        Intl.DateTimeFormat('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date(currentPost.create))
      }
      | 约${ currentPost.wordCount }字 | ${ currentPost.collection }`"
  ></Banner>

</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { resolveCurrentPost } from '../../utils/currentPost'
import Banner from '../shared/Banner.vue'

const { page } = useData()
const route = useRoute()
const base = useData().site.value.base

const currentPost = computed(() => {
  return resolveCurrentPost({
    relativePath: page.value.relativePath,
    routePath: route.path,
    base,
  })
})

</script>
