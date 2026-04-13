<template>
  <div class="post-banner">
    <h1 class="title">{{ currentPost?.title || '' }}</h1>
    <span v-if="currentPost" class="status">
      发布于
      {{
        Intl.DateTimeFormat('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date(currentPost.create))
      }}
      | 约{{ currentPost.wordCount }}字
    </span>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { resolveCurrentPost } from '../../utils/currentPost'

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
<style scoped lang="less">
.post-banner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--post-InnerBanner-color);
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  z-index: 100;
  transition: color 0.5s;

  .title {
    font-size: 4.5vw;
    margin-bottom: 50px;
    text-align: center;
  }

  .status {
    font-size: 1vw;
    font-weight: bold;
  }

  @media (max-width: 768px) {
    .title {
      font-size: 5vh;
    }

    .status {
      font-size: 1.5vh;
    }
  }
}
</style>
