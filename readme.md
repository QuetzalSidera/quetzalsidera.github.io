# QuetzalSidera Blog

这是 QuetzalSidera 的个人博客项目，基于 VitePress 和自定义主题搭建。

目前站点内容主要包括：

- 关于我
- 项目清单
- 技术栈整理
- 文化建设 / 兴趣记录

## 技术说明

- 博客引擎：VitePress
- 包管理器：pnpm
- 内容形式：Markdown
- 部署方式：GitHub Pages

## 主题配置

主题主要配置文件在 [`.vitepress/config.mts`](/Users/qianshuang/Project/WebProject/Blog/.vitepress/config.mts)。

当前已经补齐并启用的配置项包括：

- 站点标题与描述
- 首页欢迎语、博客名、motto
- 社交链接
- 页脚信息
- sitemap 域名
- Gitalk 评论配置
- 标签页与文章页数据读取

首页相关资源位于 `.vitepress/theme/assets/banner/`：

- `avatar.webp`：首页头像
- `banner.webp`：首页背景
- `banner_dark.webp`：暗色模式背景
- `bgm.mp3`：背景音乐
- `banner_video.mp4`：视频横幅资源，当前未启用

如果后续要换皮肤，可以优先改这里，不需要满仓库翻箱倒柜。

## 文章写法

文章放在 `posts/` 目录，建议使用下面这套 frontmatter：

```md
---
title: 标题
date: 2026-04-07
tags: [标签1, 标签2]
pinned: false
head:
  - - meta
    - name: description
      content: SEO 描述
  - - meta
    - name: keywords
      content: 关键词1, 关键词2
---

这里是文章摘要

---

这里是正文
```

文章列表页会自动读取标题、日期、标签、摘要和置顶信息，不需要手工再维护一份目录，主题会自己去“巡逻登记”。

## 本地开发

```bash
pnpm install
pnpm run dev
```

## 生产构建

```bash
pnpm run build
pnpm run preview
```

## 目录说明

- `.vitepress/`：站点配置与主题代码
- `posts/`：博客文章内容
- `public/`：静态资源
- `tags/`：标签页入口
- `.github/workflows/`：GitHub Pages 部署工作流

## 部署说明

仓库内已经带有 GitHub Pages 工作流：

- [deploy.yml](/Users/qianshuang/Project/WebProject/Blog/.github/workflows/deploy.yml)

默认会在 `main` 分支更新时自动构建并发布。  
如果后续更换域名，只需要同步修改：

- [config.mts](/Users/qianshuang/Project/WebProject/Blog/.vitepress/config.mts) 里的 `sitemap.hostname`
- GitHub Pages 或自定义域名设置

## 迁移结果

目前已经完成这些迁移与整理工作：

- 旧博客资料迁移为新的 Markdown 内容
- 示例文章清理完毕
- 爱好页图片整理到 `public/Imgs/`
- 图片卡片排版与外链跳转补齐
- README、包信息与项目结构更新为当前博客版本

## 说明

`readmeRaw.txt` 保留了原主题仓库说明，当前 `readme.md` 则是已经适配本博客项目后的版本。

## 鸣谢

- [vitepress-theme-bluearchive](https://github.com/Alittfre/vitepress-theme-bluearchive) 提供了本项目使用与改造的初始模板
