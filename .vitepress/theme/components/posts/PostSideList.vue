<script setup lang="ts">

import ToTopButton from './ToTopButton.vue'
import DownloadPdfButton from './DownloadPdfButton.vue'
import PostOutlineRefined from './PostOutlineRefined.vue'
</script>

<template>
  <div class="post-side-list">
    <PostOutlineRefined class="post-outline"></PostOutlineRefined>
    <DownloadPdfButton class="download-pdf-button"></DownloadPdfButton>
    <ToTopButton class="to-top-button"></ToTopButton>
  </div>
</template>

<style scoped lang="less">
.post-side-list {
  --sidelist-bottom: 10%;
  --sidelist-bottom-float: 0.1;
  --sidelist-right: 20px;
  --sidelist-button-width: 44px;
  --sidelist-button-height: 44px;
  --sidelist-button-border-radius: 10px;
  --sidelist-button-border: none;
  --sidelist-button-background: color-mix(in srgb, var(--foreground-color) 86%, transparent);
  --sidelist-button-box-shadow: 0 0 8px rgb(var(--blue-shadow-color), 0.8);
  --sidelist-button-backdrop-filter: var(--blur-val);
  --sidelist-button-gap: 5px;
  --sidelist-button-count: 3;
  --sidelist-button-color: var(--font-color-grey);
  --sidelist-button-font-size: 20px;

  display: flex;
  position: fixed;
  bottom: var(--sidelist-bottom);
  right: var(--sidelist-right);

  height: calc(var(--sidelist-button-count) * var(--sidelist-button-height) + (var(--sidelist-button-count) - 1) * var(--sidelist-button-gap));
  width: var(--sidelist-button-width);
}

.post-outline {
  position: absolute;
  bottom: calc(var(--sidelist-button-gap) * 2 + var(--sidelist-button-height) * 2);
  right: 0;
}

.download-pdf-button {
  position: absolute;
  top: calc(var(--sidelist-button-gap) + var(--sidelist-button-height));
  right: 0;
}

.to-top-button {
  position: absolute;
  top: calc(var(--sidelist-button-gap) * 2 + var(--sidelist-button-height) * 2);
  right: 0;
}
</style>
