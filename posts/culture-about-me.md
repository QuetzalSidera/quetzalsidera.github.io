---
title: 关于我
date: 2026-04-07
tags: [ 自我介绍, 个人博客 ]
pinned: true
kind: article
collection: 文化
cover: /Image/Portrait/阿洛娜_比心.webp
outline:
  - title: 1. 主线剧情
    slug: 主线剧情
  - title: 1.1 学习
    slug: 学习
    level: 1
  - title: 1.2 个人项目
    slug: 个人项目
    level: 1
  - title: 1.2.1 QQ 机器人迁移
    slug: QQ机器人迁移
    level: 2
  - title: 1.2.2 CSVX
    slug: CSVX
    level: 2
  - title: 1.2.3 个人博客维护
    slug: 个人博客维护
    level: 2

  - title: 2. 技术栈
    slug: 技术栈
  - title: 2.1 C#
    slug: C#
    level: 1
  - title: 2.2 TypeScript / JavaScript
    slug: Ts-Js
    level: 1
  - title: 2.3 CSS / HTML
    slug: CSS-Html
    level: 1
  - title: 2.4 C 与嵌入式
    slug: C与嵌入式
    level: 1
  - title: 2.5 常用工具链
    slug: 常用工具链
    level: 1

  - title: 3. 文化与价值观
    slug: 文化与价值观
head:
  - - meta
    - name: description
      content: QuetzalSidera 的个人介绍，记录机器人工程、计算机科学、个人项目与兴趣文化。
  - - meta
    - name: keywords
      content: QuetzalSidera, 个人博客, 机器人, 计算机科学, 自我介绍
---

一个在机器人、力学和代码之间来回横跳的 23 级本科生。

---

```ts image-setup
import { path as miscellaneousImagePath } from '@public/Image/Miscellaneous/path'
import { path as groupPhotoPath } from '@public/Image/GroupPhoto/path'

const aronaAndPlanaImage = {
  src: groupPhotoPath['阿洛娜与普拉娜'],
  alt: '阿洛娜与普拉娜并肩站立',
  align: 'right',
  wrap: false,
  maxHeight: '18rem',
} as const

const blueArchiveImage = {
  src: miscellaneousImagePath['蔚蓝档案'],
  alt: '蔚蓝档案游戏画面',
  align: 'center',
  wrap: false,
  maxHeight: '16rem',
  caption: '《蔚蓝档案》',
  captionLink: 'https://bluearchive-cn.com',
} as const

const minecraftImage = {
  src: miscellaneousImagePath['我的世界'],
  alt: 'Minecraft 游戏画面',
  align: 'center',
  wrap: false,
  maxHeight: '16rem',
  caption: 'Minecraft',
  captionLink: 'https://www.minecraft.net/zh-hans',
} as const

const bigFishBegoniaImage = {
  src: miscellaneousImagePath['大鱼海棠'],
  alt: '动画电影《大鱼海棠》画面',
  align: 'center',
  wrap: false,
  maxHeight: '16rem',
  caption: '《大鱼海棠》',
  captionLink: 'https://www.imdb.com/title/tt1920885/',
} as const

const planetarianImage = {
  src: miscellaneousImagePath['星之梦'],
  alt: '动画《星之梦》画面',
  align: 'center',
  wrap: false,
  maxHeight: '16rem',
  caption: '《星之梦》',
  captionLink: 'https://www.bilibili.com/bangumi/play/ep90842',
} as const

const insideOutImage = {
  src: miscellaneousImagePath['头脑特工队'],
  alt: '动画电影《头脑特工队》画面',
  align: 'center',
  wrap: false,
  maxHeight: '16rem',
  caption: '《头脑特工队》',
  captionLink: 'https://www.bilibili.com/bangumi/play/ss46265',
} as const

const yourNameImage = {
  src: miscellaneousImagePath['你的名字'],
  alt: '动画电影《你的名字》画面',
  align: 'center',
  wrap: false,
  maxHeight: '16rem',
  caption: '《你的名字》',
  captionLink: 'https://www.imdb.com/title/tt5311514/',
} as const

const touhouYouReimuImage = {
  src: miscellaneousImagePath['东方幼灵梦'],
  alt: '同人动画《东方幼灵梦》画面',
  align: 'center',
  wrap: false,
  maxHeight: '16rem',
  caption: '《东方幼灵梦》',
  captionLink: 'https://baike.baidu.com/item/%E4%B8%9C%E6%96%B9%E5%B9%BC%E7%81%B5%E6%A2%A6/7904133',
} as const
```

::::flow{mode="float" side="right" media-width="38%" min-text-width="24rem" print="block"}
:::media
<Image {...aronaAndPlanaImage} />
:::
:::body
我目前是 23 级本科生，主修机器人工程，辅修工程力学，同时也对计算机保持着持续的自学状态。

:::
::::

## 1. 主线剧情{#主线剧情}

### 1.1 学习{#学习}

最近主要学习操作系统与计算机网络，并继续补充机器人、力学和数学基础。

### 1.2 个人项目{#个人项目}

#### 1.2.1 QQ 机器人迁移{#QQ机器人迁移}

[项目演示](https://article.millealice.com)

将原有 QQ 机器人拆分为微服务，迁移至腾讯官方平台，并接入身份认证和网页控制中心。目前前端演示已经完成，后端仍在开发。

**技术栈**

- 前端：Next.js、CSS Modules
- 微服务框架：ASP.NET Core、EF Core、PostgreSQL
- 服务：ASP.NET Core API、TypeScript、Cloudflare Workers

#### 1.2.2 CSV-enhance（CSVX）{#CSVX}

[项目仓库](https://github.com/QuetzalSidera/csv-enhance)

CSVX 是一种文本优先、对 AI 友好的声明式标记语言，写法类似 LaTeX，可编译为 Excel 工作簿。它试图解决电子表格难以由普通文本模型直接编写和维护的问题。

这个项目从构想到首个版本不超过 18 小时，目前已经具备编译器和编辑器语法高亮雏形，后续是否继续扩展仍待评估。

**技术栈**

- TypeScript、Node.js

#### 1.2.3 个人博客维护{#个人博客维护}

博客的技术迁移、内容组件与排版改动记录在[博客更新日志](../collections/blog-change-log.md)中。

## 2. 技术栈{#技术栈}

### 2.1 C#{#C#}

最顺手的主力语言之一。语法与工具链完整，常用 EF Core 与 LINQ 处理数据访问。

### 2.2 TypeScript / JavaScript{#Ts-Js}

主要用于 Web 前端和 Cloudflare Workers。生态丰富、工具成熟，但 TypeScript 的高级类型有时会显得过于复杂。

### 2.3 CSS / HTML{#CSS-Html}

偏好 CSS Modules：组件与样式可以放在同一目录，同时保留接近原生 CSS 的写法。Tailwind CSS 适合快速开发，但在复杂页面中容易使结构与样式分散。

### 2.4 C 与嵌入式{#C与嵌入式}

这部分与机器人方向联系更紧。曾在 RoboMaster 项目中使用 C，也会在计算机网络等课程的底层编程实践中继续使用。

### 2.5 常用工具链{#常用工具链}

- `ASP.NET Core APIs`：后端服务
- `EF Core`：数据访问
- `React` / `Next.js`：Web 前端
- `Docker`：构建与部署

## 3. 文化与价值观{#文化与价值观}

> 这是一个关于爱、自由、知识与幸福的故事……

::::::flow{mode="float" side="right" media-width="46%" min-text-width="24rem" print="preserve"}
:::::media
::::image-group{columns="2" mobile-columns="2" print-columns="2"}
<Image {...blueArchiveImage} />

<Image {...minecraftImage} />
::::
:::::
:::::body
“文化”通常用于描述集体、社会或国家；如果将它从社会迁移到个人，也许能为“个人爱好”提供另一个观察角度。

社会因文化而有所区分，民族因传统而具有独特性；个人在成长过程中，也会逐渐发现一些使自己区别于群体的东西。
:::::
::::::

::::::flow{mode="float" side="left" media-width="50%" min-text-width="24rem" print="preserve"}
:::::media
::::image-group{columns="2" mobile-columns="2" print-columns="2"}
<Image {...bigFishBegoniaImage} />

<Image {...planetarianImage} />

<Image {...yourNameImage} />

<Image {...touhouYouReimuImage} />
::::
:::::
:::::body
往小看，爱好可以算作个人文化；往大看，价值观也可以算作个人文化。它没有固定的物理表征，也很难画出严格边界，却始终在外部现实之外保持某种独立性，同时不断受到现实影响——像主旋律下的一组隐藏和弦，只属于自己。

爱因斯坦曾写道：“完成同样一件工作对学生产生的教育方面的影响可能有很大不同，这取决于使他完成这件工作的内因究竟是害怕受伤害、利己主义的情感，还是获得喜悦和满足感。”个人文化正是外部行为背后的内部意识；它又在持续表达中得到强化，使人逐渐摆脱行为的工具性，发展真正属于自己的东西。
:::::
::::::

::::flow{mode="float" side="right" media-width="42%" min-text-width="24rem" print="preserve"}
:::media
<Image {...insideOutImage} />
:::
:::body
与集体文化相似，个人文化也像一种传统：它需要被建设，而不会自行生长。日积月累的照料会使它保持活力；若缺少维护、保存与表达，它也会像沙漠中的纪念碑，逐渐被黄沙掩埋。
:::
::::
