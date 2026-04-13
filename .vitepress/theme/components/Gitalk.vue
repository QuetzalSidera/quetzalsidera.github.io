<template>
  <div class="gitalk-container">
    <div id="gitalk-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import md5 from 'md5'
import { useBlogTheme } from '../composables/useBlogTheme'

const themeConfig = useBlogTheme()
declare var Gitalk: any
onMounted(() => {
  if (typeof window === 'undefined' || typeof Gitalk === 'undefined') {
    return
  }

  const commentConfig = {
    clientID: themeConfig.clientID,
    clientSecret: themeConfig.clientSecret,
    repo: themeConfig.repo,
    owner: themeConfig.owner,
    admin: themeConfig.admin,
    id: md5(window.location.pathname).toString(),
    distractionFreeMode: false,
  }

  try {
    const gitalk = new Gitalk(commentConfig)
    gitalk.render('gitalk-container')
  } catch (error) {
    console.error('Gitalk 初始化失败:', error)
  }
})
</script>

<style>
.gt-container .gt-header-textarea {
  color: var(--font-color-grey);
  background-color: var(--general-background-color) !important;
  transition: background-color 0.5s, color 0.5s !important;
  
}
.gt-container .gt-comment-content{
  background-color: var(--gitalk-background) !important;
  border-radius: 10px;
  p{
    color: var(--font-color-grey);
  }
  ol{
    color: var(--gitalk-font-color-ol);
  }
  .email-fragment {
    color: var(--font-color-grey);
  }
  .email-hidden-reply {
    color: var(--font-color-grey);
  }
}

.gt-container .gt-comment-content:hover {
  -webkit-box-shadow: var(--gitalk-shadow) !important;
          box-shadow: var(--gitalk-shadow) !important; 
}

.gt-container .gt-comment-body {
  color: #ffffff !important;
}

.markdown-body blockquote {
  padding: 0 1em;
  border-left: var(--gitalk-border-left) !important;
}
</style>
