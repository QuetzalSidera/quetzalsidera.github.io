# QuetzalSidera Blog

这是 QuetzalSidera 的个人博客项目，原由 VitePress + 自定义 Vue 主题搭建，目前正在迁移到 **Nextra**（React + CSS Modules）。

> 当前分支：`react-migration`
> 所有迁移期间的代码与文档更改都在此分支进行，`main` 分支继续保留稳定的 VitePress 版本。

目前站点内容主要包括：

- 关于我
- 项目清单
- 技术栈整理
- 文化建设 / 兴趣记录

## 迁移概览

- 源框架：VitePress 1.x + Vue 3 SFC + Less + 内联 `<style>`
- 目标框架：Nextra（基于 Next.js）+ React + CSS Modules
- 内容形式：保持现有 Markdown / MDX，frontmatter 字段尽量保持向后兼容
- 部署方式：仍走 GitHub Pages（构建命令切换为 Next.js 静态导出）

迁移的详细规划与对照表见 [`MIGRATION.md`](./MIGRATION.md)。
面向后续协作 Agent 的项目导览与约束见 [`AGENT.md`](./AGENT.md)。

## 技术说明

| 维度       | 现状（VitePress）                  | 目标（Nextra）                           |
| ---------- | ---------------------------------- | ---------------------------------------- |
| 框架       | VitePress 1.x                      | Nextra（Next.js）                        |
| UI 层      | Vue 3 SFC                          | React 函数组件                           |
| 样式       | 内联 `<style scoped lang="less">`  | CSS Modules（`*.module.css`）            |
| 数据加载   | `*.data.mts` (Node 端 `gray-matter`) | Next.js 静态生成 + 同等 frontmatter 解析 |
| 路由       | 文件路由（`posts/*.md`）           | 文件路由（`pages/posts/*.mdx`）          |
| 包管理器   | pnpm                               | pnpm                                     |
| 部署       | GitHub Pages（vitepress build）    | GitHub Pages（next export）              |

## 主题配置

VitePress 主题主要配置文件位于 [`.vitepress/config.mts`](.vitepress/config.mts) 与 [`.vitepress/theme/config/site.ts`](.vitepress/theme/config/site.ts)。

当前已经补齐并启用的配置项包括：

- 站点标题与描述
- 首页欢迎语、博客名、motto
- 社交链接
- 页脚信息
- sitemap 域名
- Gitalk 评论配置
- 标签页 / 文集页 / 文章页数据读取
- SEO（OG、Twitter Card、JSON-LD）

迁移到 Nextra 后，这些配置会被拆为：

- `theme.config.tsx`（Nextra 主题层基础信息、导航、社交链接）
- `lib/site.ts`（站点元信息常量，可被组件与 SEO 共用）
- 各 layout / page 组件内的 `<Head>` / `next/head` 注入

首页相关资源仍位于 `.vitepress/theme/assets/banner/`，迁移阶段会同步整理到 `public/`：

- `avatar.webp`：首页头像
- `banner.webp`：首页背景
- `banner_dark.webp`：暗色模式背景
- `bgm.mp3`：背景音乐
- `banner_video.mp4`：视频横幅资源，当前未启用

## 文章写法

文章放在 `posts/` 目录。Nextra 迁移过程中会原样保留下列 frontmatter：

```md
---
title: 标题
date: 2026-04-07
tags: [标签1, 标签2]
collection: 文集名
pinned: false
cover: /Imgs/cover.webp
outline:
  - title: 一级标题
    slug: 一级标题
  - title: 二级标题
    slug: 二级标题
    level: 1
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

- `head`：Nextra 阶段会改由 `getStaticProps` 注入 `<Head>` 元信息，frontmatter 字段保持不变。
- `outline`：迁移后若使用 Nextra 自动目录，可逐步移除手动维护项。
- 列表页（首页 / 标签 / 文集）会自动读取标题、日期、标签、摘要和置顶信息，不需要再手工维护一份目录。

## 本地开发（VitePress，迁移期间仍可用）

```bash
pnpm install
pnpm run dev
```

> 切到 Nextra 后，开发命令会变为 `pnpm dev`（背后是 `next dev`），保留 `pnpm build` / `pnpm preview` 入口。

## 生产构建

```bash
pnpm run build
pnpm run preview
```

## 目录说明

- `.vitepress/`：现有 VitePress 站点配置与 Vue 主题代码（迁移完成后逐步移除）
- `posts/`：博客文章内容（迁移期间保持原位）
- `collections/`：文集索引页
- `tags/`：标签页入口
- `public/`：静态资源
- `.github/workflows/`：GitHub Pages 部署工作流
- `MIGRATION.md`：VitePress → Nextra 迁移规划
- `AGENT.md`：协作 Agent 的项目导览与约束

## 部署说明

仓库内已经带有 GitHub Pages 工作流：

- [deploy.yml](.github/workflows/deploy.yml)

默认会在 `main` 分支更新时自动构建并发布。`react-migration` 分支期间不会触发线上部署，待迁移收尾时再统一切换。

如果后续更换域名，只需要同步修改：

- [config.mts](.vitepress/config.mts) 或 Nextra 版的 `lib/site.ts` 中的 `hostname`
- GitHub Pages / 自定义域名设置

## 鸣谢

- [vitepress-theme-bluearchive](https://github.com/Alittfre/vitepress-theme-bluearchive) 提供了本项目使用与改造的初始模板
- [vitepress-theme-sakura](https://github.com/flaribbit/vitepress-theme-sakura) 提供参考
- [vitepress X BA logo](https://github.com/nulla2011/bluearchive-logo) 非常好 BA logo 生成器
- [Anime.js Fireworks canvas demo](https://codepen.io/juliangarnier/pen/gmOwJX)
  and [hexo-theme-yun](https://github.com/YunYouJun/hexo-theme-yun) 点击烟花效果
- [spine-runtimes](https://github.com/esotericsoftware/spine-runtimes) spine 运行时
- [Blueaka@kivo.fun](https://kivo.fun/) BA 游戏字体
- [Nextra](https://nextra.site/) 迁移目标框架
