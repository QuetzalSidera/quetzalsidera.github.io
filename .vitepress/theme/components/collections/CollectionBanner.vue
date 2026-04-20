<template>
  <div v-if="currentCollection" class="post-banner">
    <h1 class="title">{{ currentCollection.title }}</h1>
    <span class="status">
      创建于 {{ formatDate(currentCollection.create) }} | {{ currentCollection.postCount }} 篇文章
    </span>
    <p v-if="currentCollection.description" class="description">
      {{ currentCollection.description }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import { resolveCurrentCollection } from '../../utils/currentCollection'

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
}

.title {
  font-size: 4.5vw;
  margin-bottom: 20px;
  text-align: center;
}

.status {
  font-size: 1vw;
  font-weight: bold;
}

.description {
  max-width: 780px;
  margin: 18px 0 0;
  font-size: 1vw;
  line-height: 1.8;
  text-align: center;
}

@media (max-width: 768px) {
  .title {
    font-size: 5vh;
  }

  .status {
    font-size: 1.5vh;
  }

  .description {
    max-width: min(100vw - 40px, 560px);
    font-size: 1.5vh;
  }
}
</style>
