---
title: 文化建设
date: 2026-04-07
tags: [ 爱好, 阅读, 游戏, 生活 ]
collection: 个人档案
outline:
  - title: 游戏
    slug: 游戏
  - title: 阅读
    slug: 阅读
  - title: 番剧与动画电影
    slug: 番剧与动画电影
  - title: 电影
    slug: 电影
  - title: 音乐
    slug: 音乐
head:
  - - meta
    - name: description
      content: QuetzalSidera 的兴趣地图，包含游戏、阅读、番剧、电影与音乐。
  - - meta
    - name: keywords
      content: 爱好, 阅读, 游戏, 动画, 电影, 音乐
---


---

<script setup lang="ts">
import Image from '../.vitepress/theme/components/shared/Image.vue'
import { path as miscellaneousImagePath } from '@Miscellaneous/path'

const createImage = (name: keyof typeof miscellaneousImagePath, alt: string, caption: string, captionLink: string) => ({
  src: miscellaneousImagePath[name],
  alt,
  align: 'center' as const,
  wrap: false,
  maxHeight: '16rem',
  caption,
  captionLink,
})

const gameImages = [
  createImage('蔚蓝档案', '蔚蓝档案', '《蔚蓝档案》：“一切奇迹的起点”', 'https://bluearchive-cn.com'),
  createImage('我的世界', '我的世界', 'Minecraft：无限续杯的创作沙盒。', 'https://www.minecraft.net/zh-hans'),
]

const bookImages = [
  createImage('精神分析引论', '精神分析引论', '《精神分析引论》', 'https://weread.qq.com/web/reader/6d332150727c90136d3799b'),
  createImage('发现的乐趣', '发现的乐趣', '《发现的乐趣》', 'https://weread.qq.com/web/reader/7af32ba05e01507af3447c7'),
  createImage('逃避自由', '逃避自由', '《逃避自由》', 'https://weread.qq.com/web/bookDetail/f70322c0811e33942g014cf5'),
  createImage('爱的艺术', '爱的艺术', '《爱的艺术》', 'https://weread.qq.com/web/reader/d7d32d70722dd429d7d723d'),
  createImage('娱乐至死', '娱乐至死', '《娱乐至死》', 'https://weread.qq.com/web/reader/aef326f05d0f19aef085d2b'),
  createImage('我的世界观', '我的世界观', '《我的世界观》', 'https://weread.qq.com/web/bookDetail/83c329e07166cdd783c051d'),
]

const bangumiImages = [
  createImage('星之梦', '星之梦', '《星之梦》', 'https://www.bilibili.com/bangumi/play/ep90842'),
  createImage('可塑性记忆', '可塑性记忆', '《可塑性记忆》', 'https://www.imdb.com/title/tt4603222/'),
  createImage('孤独摇滚', '孤独摇滚', '《孤独摇滚》', 'https://www.bilibili.com/bangumi/play/ep693247'),
  createImage('东方幼灵梦', '东方幼灵梦', '《东方幼灵梦》', 'https://baike.baidu.com/item/%E4%B8%9C%E6%96%B9%E5%B9%BC%E7%81%B5%E6%A2%A6/7904133'),
  createImage('你的名字', '你的名字', '《你的名字》', 'https://www.imdb.com/title/tt5311514/'),
  createImage('大鱼海棠', '大鱼海棠', '《大鱼海棠》', 'https://www.imdb.com/title/tt1920885/'),
]

const movieImages = [
  createImage('冰雪奇缘', '冰雪奇缘', '《冰雪奇缘》', 'https://www.bilibili.com/bangumi/play/ss46052'),
  createImage('冰雪奇缘II', '冰雪奇缘 II', '《冰雪奇缘 II》', 'https://www.bilibili.com/bangumi/play/ss46062'),
  createImage('头脑特工队', '头脑特工队', '《头脑特工队》', 'https://www.bilibili.com/bangumi/play/ss46265'),
  createImage('狮子王', '狮子王', '《狮子王》', 'https://www.bilibili.com/bangumi/play/ss46258'),
  createImage('心灵奇旅', '心灵奇旅', '《心灵奇旅》', 'https://www.bilibili.com/bangumi/play/ss46248'),
  createImage('泰山', '泰山', '《泰山》', 'https://www.imdb.com/title/tt0120855'),
]

const musicImages = [
  createImage('Ones-hope', 'Ones hope', 'Ones hope', 'https://www.bilibili.com/video/BV1A14y1n7hK'),
  createImage('温柔的回忆', '温柔的回忆', '温柔的回忆', 'https://www.bilibili.com/video/BV1Ag4y1b7pa'),
  createImage('ShowYourself', 'Show Yourself', 'Show Yourself', 'https://www.bilibili.com/video/BV1oh4y1Z72f'),
  createImage('像风一样自由', '像风一样自由', '像风一样自由', 'https://www.bilibili.com/video/BV1Ba4y1Q7NE'),
  createImage('Greensleeves', 'Greensleeves', 'Greensleeves', 'https://www.bilibili.com/video/BV1P8411o7PL'),
  createImage('Time-for-Miracles', 'Time for Miracles', 'Time for Miracles', 'https://www.bilibili.com/video/BV1EzHDzLE6R/'),
]
</script>

# 文化建设

这一板块的名字叫“文化建设”。我很喜欢这个说法，因为它听起来不像简单的“列爱好”，若将“文化”这一词从 “社会” 领域迁移到 “个人” 身上，也许个人的兴趣爱好、价值观也能被称为“文化”吧。

如果项目和技术栈是“我能做什么”，那爱好大概就是“我为什么还愿意一直往前走”。这里像一个小型补给站，专门放那些照亮过我、安慰过我、也逗笑过我的东西。

## 游戏

我平时会玩一些风格完全不同的游戏，比如：

- 《蔚蓝档案》
- Minecraft

一个偏角色与故事，一个偏创造与自由。放在一起看，像两家完全不同口味的小店，但我都愿意反复回访。

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; align-items: start;">
  <Image v-for="image in gameImages" :key="image.src" v-bind="image" />
</div>

## 阅读

我会看一些心理学、思想和科普方向的书，比如：

- 《精神分析引论》
- 《发现的乐趣》
- 《逃避自由》
- 《爱的艺术》
- 《娱乐至死》
- 《我的世界观》

这些书不一定每一本都轻松，但它们很像给脑子开窗通风。读完之后，世界不会立刻变简单，不过很多困惑会慢慢变得有轮廓。

这些书放在一起看，像一桌风格完全不同的老师。有的负责拆解人心，有的负责提醒你保持好奇，有的则会温柔但不客气地问一句：“你现在这套活法，真的是你自己选的吗？”

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; align-items: start;">
  <Image v-for="image in bookImages" :key="image.src" v-bind="image" />
</div>

## 番剧与动画电影

会反复想起的作品包括：

- 《星之梦》
- 《可塑性记忆》
- 《孤独摇滚》
- 《东方幼灵梦》
- 《你的名字》
- 《大鱼海棠》

我很吃那种既温柔、又带一点点后劲的作品。表面上它只是讲了一个故事，实际上它会在你关掉屏幕后，还在心里坐着不走。

这些作品有的像月光，有的像晚风，也有的像你某段时间的影子。平时它们安安静静地待在记忆角落里，但只要被提起，情绪就会立刻“啪”一下上线。

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; align-items: start;">
  <Image v-for="image in bangumiImages" :key="image.src" v-bind="image" />
</div>

## 电影

我也很喜欢一些偏情感表达、成长主题和想象力充足的电影，比如：

- 《冰雪奇缘》
- 《冰雪奇缘 II》
- 《头脑特工队》
- 《狮子王》
- 《心灵奇旅》
- 《泰山》

它们有的适合在低落时看，有的适合在迷茫时看，还有的适合在“我到底在忙什么啊”时，温柔地把人拽回来一点。

如果说有些电影是在讲故事，那这些作品更像在悄悄帮人整理情绪。看完不一定立刻满血复活，但通常会比点开前更愿意继续往前走一点。

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; align-items: start;">
  <Image v-for="image in movieImages" :key="image.src" v-bind="image" />
</div>

## 音乐

音乐这块我也听得挺杂，旧站里记录过的一些代表曲目有：

- `Ones hope`
- `温柔的回忆`
- `Show Yourself`
- `像风一样自由`
- `Greensleeves`
- `Time for Miracles`

有的歌像夜路上的路灯，有的像冬天一杯热饮，还有的像你明明已经很累了，但它拍拍你肩膀说一句“再坚持一下”。这种时刻，音乐确实很像不收加班费的情绪维修工。

这些曲目像是一串不同口味的情绪钥匙。想安静一点、想被鼓励一下、想短暂离开现实喘口气时，它们总能有人值班，不会让耳机里只剩下沉默。

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; align-items: start;">
  <Image v-for="image in musicImages" :key="image.src" v-bind="image" />
</div>
