---
title: 图像引用优化
date: 2026-05-22T00:00:00
tags: [ 个人博客,TypeScript,VitePress ]
pinned: false
collection: 个人博客的更新记录
outline:
  - title: 概要
    slug: 概要
  - title: 原始方案问题
    slug: 原始方案问题
  - title: 1. 图像样式不成组件
    slug: 图像样式不成组件
    level: 1
  - title: 2. 图片路径硬编码
    slug: 图片路径硬编码
    level: 1
  - title: 3. 未使用WebP
    slug: 未使用WebP
    level: 1
  - title: 解决方案
    slug: 解决方案
  - title: 1. 统一使用 Image 组件
    slug: 统一使用Image组件
    level: 1
  - title: 2. 自动化生成WebP与路径文件
    slug: 自动化生成WebP与路径文件
    level: 1
  - title: 3. build期间静态检查
    slug: build期间静态检查
    level: 1
  - title: 总结
    slug: 总结
head:
  - - meta
    - name: description
      content: 记录个人博客中图像引用方式的整理过程，包括 Image 组件接入、path.ts 路径对象引用、WebP 统一与写作规范补充。
  - - meta
    - name: keywords
      content: VitePress, Image组件, Markdown, WebP, 图像引用, 博客维护
---

记录个人博客中图像引用方式的一次集中整理。

---

<script setup lang="ts">
import Image from '../.vitepress/theme/components/shared/Image.vue'
import {path as miscellaneousImagePath} from '@Miscellaneous/path'
import {path as groupImagePath} from '@public/Image/GroupPhoto/path'

const commitImage = {
  src: miscellaneousImagePath['02-commit'],
  alt: 'Github Commit',
  align: 'right',
  wrap: true,
  maxHeight: '16rem',
  caption: 'Github Commit',
} as const

const demoImage = {
  src: groupImagePath['联邦理事会长和老师'],
  alt: '联邦理事会长和老师',
  align: 'right',
  wrap: true,
  maxHeight: '16rem',
  caption: '图像效果展示',
} as const

</script>

这次调整统一文章了中的图片组件写法、去掉硬编码路径、把若干旧资源切换到 `WebP`。

## 一、概要 {#概要}

相关提交参见[feat: 优化图片引用](https://github.com/QuetzalSidera/quetzalsidera.github.io/commit/8bd4bbdace7938815a7bae22faaa388d9952e5e8)

> 把博客里分散的原生图片写法、硬编码路径和不一致的资源格式，整理成一套可复用的文章写法。

<Image v-bind="commitImage" />

调整范围包括：

- `public/*` (图片添加与路径规范化)
- `.gitignore` (排除非WebP文件)
- `.vitepress/config.mts` (优化vite引用alias)
- `collections/*` (修改文集封面)
- `posts/*` (修改文章图像引用)


## 二、原始方案问题 {#原始方案问题}

### 1. 图像样式不成组件 {#图像样式不成组件}

在之前的文章中，图像要么使用Markdown原生图片`[](..)`，要么使用`<img>`标签，样式极其混乱，而且图像排版也很难看。

例如
```html
<div class="media-grid">
  <article class="media-card">
    <img src="/Imgs/operating-sys-synchronize/单一实例死锁.png" alt="单一实例死锁"/>
    <h3 class="media-title">单一实例包含环死锁</h3>
  </article>
  <article class="media-card">
    <img src="/Imgs/operating-sys-synchronize/多实例死锁.png" alt="多实例死锁"/>
    <h3 class="media-title">多实例包含环死锁</h3>
  </article>
 <article class="media-card">
    <img src="/Imgs/operating-sys-synchronize/多实例未死锁.png" alt="多实例未死锁"/>
    <h3 class="media-title">多实例包含环但未死锁</h3>
  </article>
</div>
```

使用CSS类名将样式应用到图片上，无论是在样式管理还是图片本身路径管理上都是潜在的石山生成器。

### 2. 图片路径硬编码 {#图片路径硬编码}

文章里大量直接写 `/Imgs/...` 或其他静态路径字符串。维护体验很差：

- 资源迁移时需要手动逐篇替换
- 图像引用无静态检查，导致部署后才发现的问题

### 3. 未使用WebP {#未使用WebP}

旧文章里同时存在几种形式：

- 原生 `<img>`
- 原生 Markdown 图片
- 自定义组件 `<Image>`

这些写法混在一起时，文章维护成本会上升，而且不同编辑器插件对多行标签和嵌入脚本的支持也不完全一致。

### 4. 一部分旧资源还没有切到 `WebP`

例如同步篇中的死锁示意图原先仍在使用 `png`。迁移到`WebP`减少图像体积，在后续引入新图片时应该会更加友好，避免git仓库体积过大。

## 三、解决方案 {#解决方案}

迁移的原则是：**图片由资源目录维护，文章只引用路径对象；组件只负责展示，不承担路径查找逻辑。**

### 1. 统一使用 `Image` 组件{#统一使用Image组件}

文章中的图片统一改为使用主题中的 `Image.vue`，不再在正文里直接写原生 `<img>`。

`Image` 组件继续只接收展示字段：

```ts
const props = withDefaults(defineProps<{
  src: string //图像文件路径
  alt?: string 
  align?: Align //图像对齐方式
  wrap?: boolean //文本环绕方式
  caption?: string //脚注
  captionLink?: string //链接
  maxHeight?: number | string //最大高度（数字单位默认px，也可以使用字符串如32rem）
}>(), {
  alt: '',
  align: 'center',
  wrap: false,
  caption: '',
  captionLink: '',
  maxHeight: '32rem',
})

```

### 2. 自动化生成WebP与路径文件 {#自动化生成WebP与路径文件}

在项目的[public/Image](https://github.com/QuetzalSidera/quetzalsidera.github.io/tree/main/public/Image)目录下，有
`convert.sh`与`init.sh`两个脚本文件。

`convert.sh` 递归扫描当前目录下的`png`、`jpg`、`jpeg`图片文件，并使用`cwebp`转换为`.webp`格式。转换后的文件会按照原有目录结构输出到父目录下自动生成的
`当前目录-Convert`文件夹中，原始目录不会被修改。

例如
```text
.
├── GroupPhoto(Raw)-Convert
│         ├── 乐队合照1.webp
│         ├── 乐队合照2.webp
│         ├── 乐队合照3.webp
│         ├── 千禧年的孩子们.webp
│         ├── 妮露和爱丽丝1.webp
│         ├── 游戏开发部合照.webp
│         ├── 游戏开发部合照2.webp
│         ├── 爱丽丝和柯伊.webp
│         ├── 联邦理事会长和老师.webp
│         └── 阿洛娜与普拉娜.webp
├── GroupPhoto(Raw)
│         ├── 乐队合照1.PNG
│         ├── 乐队合照2.PNG
│         ├── 乐队合照3.PNG
│         ├── 千禧年的孩子们.jpg
│         ├── 妮露和爱丽丝1.PNG
│         ├── 游戏开发部合照.jpg
│         ├── 游戏开发部合照2.jpg
│         ├── 爱丽丝和柯伊.PNG
│         ├── 联邦理事会长和老师.jpg
│         └── 阿洛娜与普拉娜.PNG
```

`init.sh`用于递归扫描当前目录下的`.webp`文件，并自动生成`path.json`与`path.ts`。脚本会自动解析相对于`public`目录的资源路径，生成适用于
`VitePress`的图片路径映射。`path.ts`会按照文件夹结构自动分组并插入目录注释，便于在`Markdown`与`Vue`组件中通过`TypeScript`
获得自动补全、跳转定义与避免硬编码图片路径。

例如：

```ts
export const path = {
  // /Image/Miscellaneous/essay-openai-image-2
  "海报": "/Image/Miscellaneous/essay-openai-image-2/海报.webp",
  "漫画": "/Image/Miscellaneous/essay-openai-image-2/漫画.webp",
  "漫画_翻嵌": "/Image/Miscellaneous/essay-openai-image-2/漫画_翻嵌.webp",
  "阿洛娜与普拉娜": "/Image/Miscellaneous/essay-openai-image-2/阿洛娜与普拉娜.webp",
  "阿洛娜与普拉娜_原图": "/Image/Miscellaneous/essay-openai-image-2/阿洛娜与普拉娜_原图.webp",

  // /Image/Miscellaneous/operating-sys
  cover: "/Image/Miscellaneous/operating-sys/cover.webp",

  // /Image/Miscellaneous/operating-sys/synchronize
  "单一实例死锁": "/Image/Miscellaneous/operating-sys/synchronize/单一实例死锁.webp",
  "多实例未死锁": "/Image/Miscellaneous/operating-sys/synchronize/多实例未死锁.webp",
  "多实例死锁": "/Image/Miscellaneous/operating-sys/synchronize/多实例死锁.webp",

 
  // /Image/Miscellaneous/personal-profile-hobbies/Books
  "发现的乐趣": "/Image/Miscellaneous/personal-profile-hobbies/Books/发现的乐趣.webp",
  "娱乐至死": "/Image/Miscellaneous/personal-profile-hobbies/Books/娱乐至死.webp",
 

```

可以在代码中引用`path.ts`文件，在文章的 `<script setup lang="ts">` 中直接导入：

```ts
import Image from '../.vitepress/theme/components/shared/Image.vue'
import { path as miscellaneousImagePath } from '@Miscellaneous/path'
```

然后在脚本区定义配置对象
```ts
  const mangaResultImage = {
  src: miscellaneousImagePath['漫画_翻嵌'],
  alt: '漫画翻嵌结果',
  align: 'right',
  wrap: true,
  maxHeight: '28rem',
  caption: '处理后：中文文本可读性明显提升，画面氛围基本保留。',
} as const
```

再在正文中通过 `v-bind` 或` v-for` 使用自定义组件：

```ts
  <Image v-bind="mangaResultImage" />
```

然后就可以看到右侧的图片啦～

<Image v-bind="demoImage" />

这种写法使得
1. 路径不再硬编码
2. TypeScript 区域有正常高亮
3. 通过Key引用图像，IDE支持静态扫描


### 3. build期间静态检查 {#build期间静态检查}

截止上文的步骤结束，正确方式使用的图像组件已经具有了IDE高亮，意味着空引用将会被IDE静态代码扫描发现。但此时pnpm build仍然能够通过。

通过配置`pnpm build`先`vue-tsc`，再让`tsconfig`把`.md`当成`VitePress`的`Vue`文件参与检查，使得悬空的错误引用能够在编译期被发现。

```text
posts/blog-change-log-01-to-cloudflare.md:63:31 - error TS2339: Property 'error' does not exist on type '{ readonly 海报: "/Image/Miscellaneous/essay-openai-image-2/海报.webp"; readonly 漫画: "/Image/Miscellaneous/essay-openai-image-2/漫画.webp"; readonly 漫画_翻嵌: "/Image/Miscellaneous/essay-openai-image-2/漫画_翻嵌.webp"; ... 37 more ...; readonly dns: "/Image/Miscellaneous/project-blog-to-cloudflare/dns.webp"; }'.

63   src: miscellaneousImagePath.errorTest,
                                 ~~~~~


Found 1 error in posts/blog-change-log-01-to-cloudflare.md:63

```

## 四、总结{#总结}

本次更新汇总：

| 项目   | 调整前                       | 调整后                                |
|------|---------------------------|------------------------------------|
| 图片组件 | 原生 `<img>` 与 `<Image>` 混用 | 统一为 `Image` 组件                     |
| 路径来源 | 硬编码字符串 `/Imgs/...`        | 统一来自 `path.ts`                     |
| 资源格式 | 存在旧 `png/jpg/jpeg` 引用     | 统一切到 `public/Image` 下的 `webp` 路径对象 |

涉及文件：

- `public/*` (图片添加与路径规范化)
- `.gitignore` (排除非WebP文件)
- `.vitepress/config.mts` (优化vite引用alias)
- `collections/*` (修改文集封面)
- `posts/*` (修改文章图像引用)

