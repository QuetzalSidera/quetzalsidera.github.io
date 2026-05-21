<script setup lang="ts">
import Banner from '../shared/Banner.vue'
</script>
<template>
  <Banner title="文集"></Banner>
</template>

<style scoped lang="less">
.collections-banner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--post-InnerBanner-color);
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  z-index: 100;
  transition: color 0.5s;

  .collections-banner-title {
    font-size: 4.5vw;
    margin: 0;
    text-align: center;
  }

  @media (max-width: 768px) {
    .collections-banner-title {
      font-size: 5vh;
    }
  }
}
</style>
