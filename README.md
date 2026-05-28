# QuetzalSidera Blog

这是 QuetzalSidera 的个人博客项目，原由 VitePress + 自定义 Vue 主题搭建，现已迁移到 **Next.js App Router**（React + CSS Modules）。迁移初期目标参考 Nextra，但当前实现采用自定义 App Router 路由与 `next-mdx-remote/rsc`，以保持原有 `posts/` / `collections/` 内容结构。

> 当前分支：`react-migration`
> 迁移收尾改动在此分支进行，合并回 `main` 后由 Cloudflare Pages 触发生产部署。

目前站点内容主要包括：

- 关于我
- 项目清单
- 技术栈整理
- 文化建设 / 兴趣记录

## 迁移概览

- 历史框架：VitePress 1.x + Vue 3 SFC + Less + 内联 `<style>`
- 当前框架：Next.js App Router + React + CSS Modules
- 内容形式：保持现有 Markdown / MDX，frontmatter 字段尽量保持向后兼容
- 部署方式：**Cloudflare Pages + Git Integration**（自定义域名 `quetzalsidera.me`）。Cloudflare 直接监听 GitHub 仓库的
  `main` 分支推送，构建命令、产物目录、环境变量均在 Cloudflare Pages 控制台配置；当前构建产物目录为 `out/`。

> 仓库名虽然是 `quetzalsidera.github.io`，但 GitHub Pages 部署已停用，仓库内也已移除 GitHub Actions（`.github/`），线上托管全部走
Cloudflare Pages（项目名 `quetzalsidera-blog`）。

迁移的详细规划与对照表见 [`MIGRATION.md`](./MIGRATION.md)。
面向后续协作 Agent 的项目导览与约束见 [`AGENT.md`](./AGENT.md)。

## 技术说明

| 维度   | 当前实现 |
|------|---------|
| 框架   | Next.js App Router |
| UI 层 | React 函数组件 |
| 样式   | CSS Modules（`*.module.css`）+ `styles/globals.scss` / `styles/_theme.scss` |
| 数据加载 | Next.js 静态生成 + `gray-matter` frontmatter 解析 |
| 路由   | App Router 动态路由（`app/posts/[slug]/page.tsx`） |
| 包管理器 | pnpm |
| 部署   | Cloudflare Pages Git Integration（构建命令 `pnpm build`，产物 `out/`） |

## 主题配置

主题配置已迁移到 Next.js 运行时代码中。

当前已经补齐并启用的配置项包括：

- 站点标题与描述
- 首页欢迎语、博客名、motto
- 社交链接
- 页脚信息
- sitemap 域名
- giscus 评论组件（repoId / categoryId 已配置，评论主题已按站点明暗色自定义）
- 标签页 / 文集页 / 文章页数据读取
- SEO（OG、Twitter Card、JSON-LD）

主要配置入口：

- `lib/site.ts`（站点元信息常量，可被组件与 SEO 共用）
- `lib/types.ts`（文章、文集、主题配置等共享类型）
- App Router `metadata` / `generateMetadata` 与 JSON-LD 注入

首页相关资源已整理到 `public/assets/banner/`：

- `avatar.webp`：首页头像
- `banner.webp`：首页背景
- `banner_dark.webp`：暗色模式背景
- `bgm.mp3`：背景音乐
- `banner_video.mp4`：视频横幅资源，当前未启用

## 文章写法

文章放在 `posts/` 目录。迁移后仍保留下列 frontmatter：

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

- `head`：Next.js 阶段由 `lib/seo.ts` 转换为 App Router metadata，frontmatter 字段保持不变。
- `outline`：迁移后仍保留并优先用于文章侧栏目录。
- 列表页（首页 / 标签 / 文集）会自动读取标题、日期、标签、摘要和置顶信息，不需要再手工维护一份目录。

## 本地开发（Next.js）

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

- `app/`：Next.js App Router 页面入口
- `components/`：React 组件与 CSS Modules
- `lib/`：数据读取、SEO、MDX 兼容层、共享类型与站点配置
- `posts/`：博客文章内容
- `collections/`：文集索引页
- `tags/`：标签页入口
- `public/`：静态资源
- `MIGRATION.md`：VitePress → Nextra 迁移规划
- `AGENT.md`：协作 Agent 的项目导览与约束

> 部署：由 Cloudflare Pages 通过 Git Integration 自动监听 GitHub 仓库 `main` 分支，无需仓库内 CI 配置文件。

## 部署说明

部署目标是 **Cloudflare Pages**（项目名 `quetzalsidera-blog`），自定义域名 `quetzalsidera.me`。
GitHub Pages 已停用，仓库名 `quetzalsidera.github.io` 仅为历史命名。
仓库内不保留任何 CI 配置文件（`.github/` 已移除）。

接入方式：**Cloudflare Pages Git Integration**

- Cloudflare 直接监听本仓库 `main` 分支的推送
- 构建命令、Node 版本、产物目录、环境变量都在 Cloudflare Pages 控制台配置
- 当前生产配置：
  - 构建命令：`pnpm build`
  - 产物目录：`out/`（`output: 'export'` 的 Next 静态导出）

`react-migration` 分支不会触发生产部署（Cloudflare 默认只对 production branch / preview branch 列表中的分支构建），但可以在
Cloudflare 控制台把它加为 preview branch 来出预览链接。

如果后续更换域名，需要同步修改：

- `lib/site.ts` 中的 `hostname`
- Cloudflare Pages 自定义域名设置

## 鸣谢

- [Cloudflare Pages](https://pages.cloudflare.com/) 托管与分发
- [vitepress-theme-bluearchive](https://github.com/Alittfre/vitepress-theme-bluearchive) 提供了本项目使用与改造的初始模板
- [vitepress-theme-sakura](https://github.com/flaribbit/vitepress-theme-sakura) 提供参考
- [vitepress X BA logo](https://github.com/nulla2011/bluearchive-logo) 非常好 BA logo 生成器
- [Anime.js Fireworks canvas demo](https://codepen.io/juliangarnier/pen/gmOwJX)
  and [hexo-theme-yun](https://github.com/YunYouJun/hexo-theme-yun) 点击烟花效果
- [spine-runtimes](https://github.com/esotericsoftware/spine-runtimes) spine 运行时
- [Blueaka@kivo.fun](https://kivo.fun/) BA 游戏字体
- [Nextra](https://nextra.site/) 迁移目标框架
