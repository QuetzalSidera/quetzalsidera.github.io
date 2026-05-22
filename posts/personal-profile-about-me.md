---
title: 关于我
date: 2026-04-07
tags: [ 自我介绍, 个人博客 ]
pinned: true
collection: 个人档案
cover: /Image/Portrait/阿洛娜_比心.webp
outline:
  - title: 主线剧情
    slug: 主线剧情
  - title: 1. 学习
    slug: 学习
    level: 1

  - title: 2. 个人项目
    slug: 个人项目
    level: 1
  - title: 2.1 QQ机器人迁移
    slug: QQ机器人迁移
    level: 2
  - title: 2.2 CSVX
    slug: CSVX
    level: 2
  - title: 2.3 个人博客维护
    slug: 个人博客维护
    level: 2
  - title: 2.4 个人邮件系统
    slug: 个人邮件系统
    level: 2

  - title: 技术栈
    slug: 技术栈
  - title: 3.1 C#
    slug: C#
    level: 1
  - title: 3.2 Ts / Js
    slug: Ts-Js
    level: 1
  - title: 3.3 CSS/Html
    slug: CSS-Html
    level: 1
  - title: 3.4 C 与嵌入式
    slug: C与嵌入式
    level: 1
  - title: 3.5 工具链
    slug: 工具链
    level: 1

  - title: 文化建设
    slug: 文化建设

head:
  - - meta
    - name: description
      content: QuetzalSidera 的个人介绍，包含专业方向、兴趣爱好与博客记录计划。
  - - meta
    - name: keywords
      content: QuetzalSidera, 个人博客, 机器人, 计算机科学, 自我介绍
---

一个在机器人、力学和代码之间来回横跳的 23 级本科生。

---


<script setup lang="ts">

import {path as miscellaneousImagePath} from '@Miscellaneous/path' 
import Image from '../.vitepress/theme/components/shared/Image.vue'
import {path as groupPhotoPath} from '@public/Image/GroupPhoto/path'

const imageOfAronaAndPlana = {
  src: groupPhotoPath['阿洛娜与普拉娜'],
  alt: '阿洛娜与普拉娜',
  align: 'right',
  wrap: true,
  maxHeight: '16rem',
} as const


const blueArchive = {
  src: miscellaneousImagePath['蔚蓝档案'],
  alt: '蔚蓝档案',
  align: 'right',
  wrap: true,
  maxHeight: '20rem',
  caption:'《蔚蓝档案》：“一切奇迹的起点”',
  captionLink:'https://bluearchive-cn.com',
} as const
 
 
const minecraft ={
  src: miscellaneousImagePath['我的世界'],
  alt: '蔚蓝档案',
  align: 'right',
  wrap: true,
  maxHeight: '20rem',
  caption:'Minecraft：无限续杯的创作沙盒。',
  captionLink:'https://www.minecraft.net/zh-hans',
} as const

const bigFishBegonia={
  src: miscellaneousImagePath['大鱼海棠'],
  alt: '大鱼海棠',
  align: 'right',
  wrap: true,
  maxHeight: '20rem',
  caption:'《大鱼海棠》',
  captionLink: 'https://www.imdb.com/title/tt1920885/',
} as const

const planetarian={
  src: miscellaneousImagePath['星之梦'],
  alt: '星之梦',
  align: 'right',
  wrap: true,
  maxHeight: '20rem',
  caption:'《星之梦》',
  captionLink:'https://www.bilibili.com/bangumi/play/ep90842',
} as const

const insideOut={
  src: miscellaneousImagePath['头脑特工队'],
  alt: '头脑特工队',
  align: 'right',
  wrap: true,
  maxHeight: '20rem',
  caption:'《头脑特工队》',
  captionLink:'https://www.bilibili.com/bangumi/play/ss46265',
} as const


const yourName={
  src: miscellaneousImagePath['你的名字'],
  alt: '你的名字',
  align: 'right',
  wrap: true,
  maxHeight: '20rem',
  caption:'《你的名字》',
  captionLink:'https://www.imdb.com/title/tt5311514/',
} as const

const touhouYouReimu= {
  src: miscellaneousImagePath['东方幼灵梦'],
  alt: '东方幼灵梦',
  align: 'right',
  wrap: true,
  maxHeight: '20rem',
  caption:'《东方幼灵梦》',
  captionLink:'https://baike.baidu.com/item/%E4%B8%9C%E6%96%B9%E5%B9%BC%E7%81%B5%E6%A2%A6/7904133',
} as const


</script>

我目前是 23 级本科生，主修机器人工程，辅修工程力学，同时也对计科保持着“上头”状态。

## 主线剧情{#主线剧情}

### 1. 学习{#学习}

最近这段时间，我主要在肝**计科基础**以及课内的**机器人学**相关知识，后续在机器人学结束后应该会精进游戏开发

后期计划：

- 计科：计算机操作系统 => 数据结构与算法（当前） => 数据库 => 计算机网络复习
- 课内：机器人机构学（当前） => 机器人学基础/理论力学/高等数学/线性代数复习

### 2. 个人项目{#个人项目}

#### 2.1 QQ机器人迁移{#QQ机器人迁移}
[项目Demo地址](https://article.millealice.com)

将原本的QQ机器人拆分成微服务、迁移到腾讯官方平台、接入身份认证、并配套网页端控制中心
，目前只是一个小小的前端Demo，后端还在开发中...

技术栈

- 前端：Next.js + Module CSS
- 微服务框架：ASP.NET Core + EF Core + Pgsql
- 微服务：ASP.NET Core API

#### 2.2 CSV-enhance (CSVX){#CSVX}

[项目Demo地址](https://github.com/QuetzalSidera/csv-enhance)

CSVX是一个文本优先、AI友好、类似于LaTeX的声明式标记语言，可以编译成Excel，目的是解决Excel难以使用普通文本大模型编写的难点。

~~目前这个项目有点烂尾了~~ ，因为是纯Vibe的项目，而且从有想法立项到开发结束不超过18小时，虽然已经写了个编译器与插件代码高亮的雏形，但后续能否继续下去看情况吧～。

技术栈

- Ts + Node.js
- ~~Codex~~

#### 2.3 个人博客维护{#个人博客维护}

此部分可以参见专门的文集：[博客更新日志](../collections/blog-change-log.md)

#### 2.4 个人邮件系统{#个人邮件系统}

个人博客之下的邮件系统，目前还只是一个Vibe出来的雏型，之后应该会重构一次，引入现代化的后端设施与更漂亮的前端主题。

参见[个人邮件系统](./project-mail-system-intro.md)

## 技术栈{#技术栈}

#### 3.1 C#{#C#}

最顺手的主力语言之一，语法确实很舒服，但社区生态除了微软以外的都不太行。 EF Core 搭配上Linq真挺好用的。

#### 3.2 Ts / Js{#Ts-Js}

生态太好了，前端框架、工具库、社区资源都非常丰富。而且大模型支持也很完善，只不过Ts的类型系统有些过于绕了。

#### 3.3 CSS/Html{#CSS-Html}

一开始并没有想专门学CSS的，但是为了做Web项目不得不学（泪目）。还是比较喜欢接近传统CSS语法的Module CSS，将组件和样式放在一个目录下。Tailwind
CSS快速开发很好用，但是样式分散在Jsx里面，原子类的CSS又写在自定义的文件中，就很难受。

#### 3.4 C 与嵌入式{#C与嵌入式}

这部分和机器人方向联系更紧，接触过一年时间（指RoboMaster）。学习计算机网络等基础课程时也是不得不用的。

#### 3.5 ASP.NET Core APIs / EF Core / React / Docker{#工具链}

这些属于我比较熟悉的一整套工具链：

- `ASP.NET Core APIs` 后端框架
- `EF Core` 沟通数据库
- `React`/`Next.js`前端框架，虽然现在博客为了打包成静态页换成了 VitePress（Vue.js），但在其他项目里它还是我主要的前端框架
- `Docker` 部署


## 文化建设{#文化建设}

> 这是一个关于爱、自由、知识与幸福的故事...

<Image v-bind="blueArchive"/>
<Image v-bind="bigFishBegonia"/>
<Image v-bind="planetarian"/>
<Image v-bind="touhouYouReimu"/>
<Image v-bind="insideOut"/>

“文化”这一词语多用在集体、社会或者国家上，但如果将它从“社会”迁移至“个人”，也许能给简单的“个人爱好”这一概念带来不同视角下的理解吧。

正如社会以文化相区分，民族以传统而独特，也许个人在成长过程中，也会逐渐发现一些使自己独立于群体的东西。


这样的事物既没有外在的物理表征来感受其真实，也没有一个严格的界限来定义其范围。
往小看，也许爱好算是个人文化；往大看，也许价值观也算个人文化——但无论它究竟可以被定义成为什么，有一点是明确的，
它始终是在物理意义上和外部现实相互独立的，但又无时无刻不受到外界影响的，时时刻刻作为每一个现实主旋律之下的隐藏和弦的一个特殊存在——它只属于自己，而不属于任何外界。


正如爱因斯坦所说过的，“完成同样一件工作对学生产生的教育方面的影响可能有很大不同，这取决于使他完成这件工作的内因究竟是害怕受伤害、利己主义的情感，还是获得喜悦和满足感。”
“个人文化”便是如此——作为外部行为后的内部意识而存在，这样的意识又因为表达而得到强化，也因此个人脱离了它的外在工具性，得以发展真正属于自己的东西。
与集体、社会和国家的文化相似的一点在于，个人文化以同样类似于一种“传统”——它需要“被”建设，而不会自己长出来。日积月累的照料会使其成长得健康，但若缺乏妥善的维护、保存与建设，个人文化也会消亡。
正如沙漠里的纪念碑，长时间得不到清扫便会掩埋于黄沙之中。

