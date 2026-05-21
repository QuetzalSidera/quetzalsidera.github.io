<template>
  <div class="shared-banner">
    <h1 class="shared-banner-title">{{ props.title }}</h1>
    <span v-if="props.subtitle" class="shared-banner-subtitle">
      {{ subtitle }}
    </span>
    <p v-if="props.description" class="shared-banner-description">
      {{ props.description }}
    </p>
  </div>
</template>
<script setup lang="ts">

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  description?: string
}>(), {
  title: '',
  subtitle: undefined,
  description: undefined,

})
</script>


<style scoped lang="less">
.shared-banner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--post-InnerBanner-color);
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  transition: color 0.5s;
  margin: 0 10px;
}

.shared-banner-title {
  font-size: clamp(5vw, 3rem, 4rem);

  margin: 0 0 20px;
  text-align: center;
}

.shared-banner-subtitle {
  font-size: clamp(1.2vw, 1rem, 1.7rem);
  font-weight: bold;
  text-align: center;
}

.shared-banner-description {
  max-width: 780px;
  margin: 18px 0 0;
  font-size: clamp(1vw, 0.8rem, 1.2rem);
  line-height: 1.8;
  text-align: center;
}
</style>
