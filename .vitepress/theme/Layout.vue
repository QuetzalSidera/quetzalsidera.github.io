<template>
  <Splash></Splash>
  <template v-if="!page.isNotFound">
    <main style="min-height: 100vh">
      <Navbar></Navbar>
      <BannerHero>
        <transition name="fade" mode="out-in">
          <component :is="heroComponent" :key="heroKey"></component>
        </transition>
      </BannerHero>
      <transition name="fade" mode="out-in">
        <component :is="contentComponent" :key="contentKey"></component>
      </transition>
    </main>
    <Footer></Footer>
    <Fireworks v-if="state.fireworksEnabled"></Fireworks>
    <ClientOnly>
      <SpinePlayer></SpinePlayer>
    </ClientOnly>
    <ToTop></ToTop>
    <!-- 背景音乐元素 -->
    <audio id="background-music" loop>
      <source src="./assets/banner/bgm.mp3" type="audio/mpeg" />
    </audio>
  </template>
  <NotFound v-else></NotFound>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import Splash from './components/Splash.vue'
import Navbar from './components/layout/Navbar.vue'
import BannerHero from './components/home/BannerHero.vue'
import WelcomeBox from './components/home/WelcomeBox.vue'
import PostList from './components/posts/PostList.vue'
import TagFilter from './components/posts/TagFilter.vue'
import PostViewer from './components/posts/PostViewer.vue'
import PostBanner from './components/posts/PostBanner.vue'
import NotFound from './components/NotFound.vue'
import ToTop from './components/ToTop.vue'
import Fireworks from './components/Fireworks.vue'
import Footer from './components/Footer.vue'
// @ts-ignore
import SpinePlayer from './components/spine/SpinePlayer.vue'
import { useData, useRoute } from 'vitepress'
import { useStore } from './store'
import { createEmptyPost } from './store/defaults'
import { resolveCurrentPost } from './utils/currentPost'

const { page } = useData()
const route = useRoute()
const base = useData().site.value.base

const { state } = useStore()

const normalizedRoutePath = computed(() => {
  const path = route.path || ''
  return path.startsWith(base) ? path.slice(base.length - 1) : path
})

const currentPageKey = computed(() => normalizedRoutePath.value || page.value.relativePath || 'index')

const isHomePage = computed(() => {
  return normalizedRoutePath.value === '/' || normalizedRoutePath.value === '/index.html'
})

const isTagPage = computed(() => {
  return normalizedRoutePath.value === '/tags/' || normalizedRoutePath.value === '/tags/index.html'
})

const heroComponent = computed(() => {
  if (!state.splashLoading && isHomePage.value) {
    return WelcomeBox
  }

  if (isTagPage.value) {
    return TagFilter
  }

  return PostBanner
})

const heroKey = computed(() => {
  if (!state.splashLoading && isHomePage.value) {
    return `welcome-${currentPageKey.value}`
  }

  if (isTagPage.value) {
    return `tag-${currentPageKey.value}`
  }

  return `banner-${currentPageKey.value}`
})

const contentComponent = computed(() => {
  return isHomePage.value || isTagPage.value ? PostList : PostViewer
})

const contentKey = computed(() => {
  return isHomePage.value || isTagPage.value
    ? `post-list-${currentPageKey.value}`
    : `post-viewer-${currentPageKey.value}`
})

watchEffect(() => {
  const currentPost = resolveCurrentPost({
    relativePath: page.value.relativePath,
    routePath: route.path,
    base,
  })

  state.currPost = currentPost ?? createEmptyPost()
})
</script>

<style lang="less">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

html {
  scroll-behavior: smooth;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

body {
  background-image: var(--theme-background-image);
  background-color: var(--general-background-color);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: fixed;
  overflow-y: scroll;
  overflow-x: hidden;
  color: var(--font-color-grey);
  font-family: 'Blueaka', sans-serif;
  transition: background-image 0.5s, background-color 0.5s;
}

:root[theme='light'] {
  --theme-background-image: url('./assets/background.svg');
}

:root[theme='dark'] {
  --theme-background-image: url('./assets/background_dark.svg');
}

ul {
  list-style: none;
}

a {
  text-decoration: none;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: var(--color-blue);
  cursor: pointer;
}

@media (max-width: 768px) {
  .container {
    width: 100vw;
  }
}
</style>
