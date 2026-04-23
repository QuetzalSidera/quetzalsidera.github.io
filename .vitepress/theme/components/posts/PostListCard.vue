<template>
  <article class="post">
    <span v-if="item.pinned" class="pinned"></span>
    <header class="post-header">
      <div v-if="item.cover" class="cover-container">
        <img
          :src="item.cover"
          class="cover-image"
          :alt="item.title + '-cover'"
          loading="lazy"
        />
      </div>
      <div class="header-content">
        <div class="title">
          <div class="title-dot" v-if="!item.cover"></div>
          <h1 class="name">
            <a :href="base + item.href">{{ item.title }}</a>
          </h1>
        </div>
        <div class="meta-info-bar">
          <span class="iconfont icon-time time"></span>
          <div class="time-info">
            <time datetime="">{{ formatDate(item.create) }}</time>
          </div>
          <div class="wordcount seperator">{{ item.metricText }}</div>
        </div>
        <ul v-if="item.tags.length" class="tags">
          <li v-for="tag in item.tags" :key="tag">
            <a v-if="item.tagsInteractive" :href="`${base}tags/`" @click="emit('select-tag', tag)">
              <i class="iconfont icon-tag"></i> {{ tag }}
            </a>
            <span v-else class="tag-label"><i class="iconfont icon-tag"></i> {{ tag }}</span>
          </li>
        </ul>
        <div class="excerpt">
          <p>{{ item.excerpt }}</p>
        </div>
      </div>
    </header>
  </article>
</template>

<script setup lang="ts">
import type { PostListItem } from '../../types/post-list'

defineProps<{
  item: PostListItem
  base: string
}>()

const emit = defineEmits<{
  (e: 'select-tag', tag: string): void
}>()

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
</script>

<style scoped lang="less">
.post {
  display: flex;
  flex-direction: column;
  margin: 0 0 50px 0;
  padding-bottom: 16px;
  background-color: var(--foreground-color);
  border-radius: 32px;
  border-left: solid 16px var(--pot-border-left);
  background-image: var(--deco1);
  background-size: contain;
  background-position: right;
  background-repeat: no-repeat;
  box-shadow: 0px 0px 8px rgb(var(--blue-shadow-color), 0.8);
  transition: all 0.5s;
}

.pinned {
  position: absolute;
  width: 42px;
  height: 42px;
  top: -8px;
  right: -8px;
  border-radius: 50px;
  background: var(--icon-pinned) no-repeat;
  background-size: contain;
  box-shadow: 0 0 6px rgba(var(--blue-shadow-color), 0.65);
}

.post-header {
  display: flex;
  gap: 24px;
  padding: 32px 40px 0;
  position: relative;
  align-items: stretch;

  .cover-container {
    flex: 0 0 180px;
    height: 140px;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    margin-left: -8px;
    margin-bottom: 15px;
    align-self: center;

    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .header-content {
    flex: 1;
    min-width: 0;
    flex-direction: column;

    .title {
      position: relative;
      margin-bottom: 8px;
    }

    .excerpt {
      flex: 1;
      display: flex;
      align-items: flex-end;
    }
  }
}

.title {
  position: relative;
  margin-bottom: 8px;

  .title-dot {
    width: 4px;
    height: 20px;
    position: absolute;
    left: -16px;
    top: 9.5px;
    background: var(--pot-border-left);
    border-radius: 2px;
    transition: background 0.5s;
  }

  .name {
    display: flex;
    align-items: center;
    gap: 15px;
    margin: 0;
  }

  a {
    color: var(--font-color-grey);
    transition: text-shadow 0.5s, color 0.5s;

    &:hover {
      text-shadow: 0 0 3px var(--font-color-grey);
    }
  }
}

.meta-info-bar {
  display: flex;
  margin-bottom: 7px;
  opacity: 0.75;

  .time {
    font-size: 13px;
    color: var(--font-color-grey);
    margin: 3px 2px 0 0;
    font-weight: bold;
  }

  .seperator::before {
    content: '';
    display: inline-block;
    border-radius: 50%;
    height: 4px;
    width: 4px;
    vertical-align: middle;
    background-color: var(--font-color-grey);
    margin: 0 16px;
  }
}

.tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 0;
  margin: 0 0 6px;

  li {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 6px;
    margin-right: 16px;
  }

  a,
  .tag-label {
    color: var(--font-color-gold);
    background-color: var(--btn-background);
    border-radius: 5px;
    padding: 3px 5px;
    transition: all 0.5s;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  a:hover {
    background-color: var(--btn-hover);
  }
}

@media (max-width: 768px) {
  .post {
    margin: 0 8px 30px;
    background-size: cover;
    border-left: solid 1.5vh var(--pot-border-left);
  }

  .pinned {
    width: 27px;
    height: 27px;
    top: -2px;
    right: 12px;
  }

  .post-header {
    flex-direction: column;
    gap: 16px;
    padding: 24px 20px 0;

    .cover-container {
      flex: none;
      width: 100%;
      height: 240px;
      margin-left: 0;
    }
  }

  .title {
    margin-bottom: 6px;

    .name {
      font-size: 24px;
    }

    .title-dot {
      height: 18px;
      top: 6px;
    }
  }

  .meta-info-bar {
    margin-bottom: 4px;
    font-size: 12px;

    .time {
      font-size: 8px !important;
      margin: 3px 2px 0 0 !important;
    }

    .seperator::before {
      margin: 0 8px;
    }
  }

  .tags {
    li {
      padding-top: 4px;
      margin-right: 8px;
    }

    a,
    .tag-label {
      font-size: 12px;
      padding: 4px 6px;

      .icon-tag {
        font-size: 12px;
      }
    }
  }

  .excerpt {
    padding: 0;
    margin-bottom: 4px;
    font-size: 12px;
  }
}
</style>
