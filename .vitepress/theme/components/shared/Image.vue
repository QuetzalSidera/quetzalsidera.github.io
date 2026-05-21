<script setup lang="ts">
import { computed } from 'vue'

type Align = 'left' | 'right' | 'center'

const props = withDefaults(defineProps<{
  src: string
  alt?: string
  align?: Align
  wrap?: boolean
  caption?: string
  captionLink?: string
  maxHeight?: number | string
}>(), {
  alt: '',
  align: 'center',
  wrap: false,
  caption: '',
  captionLink: '',
  maxHeight: '32rem',
})

const imageClass = computed(() => [
  'image-block',
  `image-block--${props.align}`,
  {
    'image-block--wrap': props.wrap,
    'image-block--standalone': !props.wrap,
  },
])

const imageStyle = computed(() => ({
  maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
}))
</script>

<template>
  <figure :class="imageClass">
    <img
      :src="src"
      :alt="alt"
      :style="imageStyle"
      loading="lazy"
    />
    <figcaption v-if="caption">
      <a
        v-if="captionLink"
        :href="captionLink"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ caption }}
      </a>
      <template v-else>{{ caption }}</template>
    </figcaption>
  </figure>
</template>

<style scoped lang="less">
.image-block {
  width: fit-content;
  max-width: min(100%, 42rem);
  margin: 1.5rem 0;

  img {
    display: block;
    width: 100%;
    height: auto;
    max-width: 100%;
    border-radius: 14px;
    box-shadow: 0 10px 28px rgba(var(--blue-shadow-color), 0.16);
    object-fit: contain;
  }

  figcaption {
    margin-top: 0.65rem;
    font-size: 0.92rem;
    line-height: 1.7;
    text-align: center;
    color: var(--font-color-grey);
    opacity: 0.82;
    cursor: default;

    a {
      color: inherit;
      text-decoration: none;
      transition: text-decoration-color 0.2s ease;

      &:hover {
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }

  &--standalone {
    display: block;
  }

  &--wrap {
    width: min(100%, clamp(14rem, 42%, 24rem));
  }

  &--left {
    margin-right: auto;
  }

  &--right {
    margin-left: auto;
  }

  &--center {
    margin-left: auto;
    margin-right: auto;
  }

  &--wrap.image-block--left {
    float: left;
    margin-right: 1.5rem;
  }

  &--wrap.image-block--right {
    float: right;
    margin-left: 1.5rem;
  }

  &--wrap.image-block--center {
    float: none;
    margin-left: auto;
    margin-right: auto;
  }

  &--wrap ~ :deep(h1),
  &--wrap ~ :deep(h2),
  &--wrap ~ :deep(h3),
  &--wrap ~ :deep(h4),
  &--wrap ~ :deep(h5),
  &--wrap ~ :deep(h6),
  &--wrap ~ :deep(hr) {
    clear: both;
  }
}

@media (max-width: 768px) {
  .image-block {
    float: none !important;
    width: min(100%, 100%) !important;
    max-width: 100%;
    margin: 1.25rem auto;

    img {
      width: 100%;
    }
  }
}
</style>
