---
title: OpenAI-Image-2 浅尝
date: 2026-04-22
tags: [ AI, OpenAI ]
pinned: false
collection: 随笔
head:
  - - meta
    - name: description
      content: OpenAI Image-2 去水印、漫画翻嵌、招生海报三个场景的试用记录与评价。
  - - meta
    - name: keywords
      content: OpenAI-Image-2, OpenAI, 图像生成, 去水印, 漫画翻嵌, 海报生成
---

本文记录 `Image-2`在去水印、漫画翻嵌、招生海报三个场景的试用结果。

---

<script setup lang="ts">
import Image from '../.vitepress/theme/components/shared/Image.vue'
import {path as miscellaneousImagePath} from '@Miscellaneous/path'

const watermarkResultImage = {
  src: miscellaneousImagePath['阿洛娜与普拉娜'],
  alt: '阿洛娜与普拉娜去水印结果',
  align: 'right',
  wrap: true,
  maxHeight: '26rem',
  caption: '处理后：主体还原完整，但边缘和局部细节仍有修补痕迹。',
} as const

const watermarkSourceImage = {
  src: miscellaneousImagePath['阿洛娜与普拉娜_原图'],
  alt: '阿洛娜与普拉娜原图',
  align: 'right',
  wrap: true,
  maxHeight: '26rem',
  caption: '原图：带有水印的角色插画。',
} as const

const mangaResultImage = {
  src: miscellaneousImagePath['漫画_翻嵌'],
  alt: '漫画翻嵌结果',
  align: 'right',
  wrap: true,
  maxHeight: '28rem',
  caption: '处理后：中文文本可读性明显提升，画面氛围基本保留。',
} as const

const mangaSourceImage = {
  src: miscellaneousImagePath['漫画'],
  alt: '漫画原图',
  align: 'right',
  wrap: true,
  maxHeight: '28rem',
  caption: '原图：待翻嵌的漫画页面。',
} as const

const posterImage = {
  src: miscellaneousImagePath['海报'],
  alt: '招生海报',
  align: 'center',
  wrap: false,
  maxHeight: '30rem',
  caption: '招生海报测试图。',
} as const
</script>

OpenAI 在 2026 年 4 月 21 日发布了 `Image-2`，于是急不可耐直接开吃😋。

## 1. 去水印

原图角色主体明确，水印区域覆盖在画面上，背景不算复杂，适合观察模型的补图能力。

<Image v-bind="watermarkResultImage" />

<Image v-bind="watermarkSourceImage" />

角色主体未被严重破坏，颜色衔接和大块面补全自然，堪称完美。

## 2. 漫画翻嵌

翻嵌漫画比去水印更复杂——除补图外还需替换文本、识别对话框位置、控制中文排版、维持画面阅读节奏。

<Image v-bind="mangaResultImage" />

<Image v-bind="mangaSourceImage" />

此前多数模型在中文上不稳定。但`Image-2`输出的基本上可以用来发布了（最方便烤肉的一集）。

问题仍在：标点排版不太干净，字体样式学习还是欠佳，原图看字体边缘很明显是圆体，而翻嵌字体的圆角貌似没了。

字距与气泡边缘贴合不稳定，字体粗细也不是特别协调。

但无论如何，自用或者用来给汉化组做前期处理应该是很足够了。

## 3. 招生海报

海报是综合任务：要求构图、视觉重心安排、中文字渲染，同时不能出现过度"AI 感"。

<Image v-bind="posterImage" />

当时生成那一瞬间确实给我震惊到了，甚至还原了学校的Logo，而图片提示词还没有标题长...

虽然背景不太恰当，部分字体与二维码依然果冻化，但应该是远远领先同类模型了。

---

试用后感觉`Image-2`已经可以满足很多非正式商业需求了。

除此之外，好像OpenAI也把各个模型的识图能力同步提高了，拿来写实验报告与作业准确度提高了很多。
