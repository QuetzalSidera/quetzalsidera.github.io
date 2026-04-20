<template>
  <div class="post-banner">
    <h1 class="title">文集</h1>
  </div>
</template>

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
    margin: 0;
    text-align: center;
  }

  @media (max-width: 768px) {
    .title {
      font-size: 5vh;
    }
  }
}
</style>
