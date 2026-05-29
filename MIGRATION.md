# 迁移说明：VitePress → Next.js App Router

> 范围：本仓库的 Vue/VitePress 主题与配置已迁移到 Next.js App Router。
> UI 用 **React 函数组件**，样式统一用 **CSS Modules**。
> 内容（`posts/`、`collections/`、`tags/`、`public/`）尽量原样保留。

本文档保留迁移目标、对照表、阶段记录、测试矩阵与后续维护注意事项。
落地动作的细节约束见 [`AGENT.md`](./AGENT.md)，整体说明见 [`README.md`](./README.md)。

---

## 1. 目标

- **可读性**：Markdown 文章无须重写，frontmatter 字段保持兼容。
- **可维护性**：组件用 React + CSS Modules，状态层从 Vue `reactive` 切到多个 React Context。
- **可部署性**：构建产物仍能托管在 **Cloudflare Pages**（项目名 `quetzalsidera-blog`，自定义域名 `quetzalsidera.me`
  ），Next.js 走 `output: 'export'` 静态导出；Cloudflare Pages Git Integration 使用构建命令 `pnpm build`、输出目录
  `out/`。
- **收尾状态**：Cloudflare preview、视觉回归与生产配置完成后，仓库已删除 `.vitepress/`，仅保留 Next.js 静态导出链路。

非目标 / 用户明确要求：

- **迁移只动框架与技术架构，不改其他任何行为**。视觉、交互、字体、动画时长、文章内容、frontmatter、链接结构全部保持一致。
- 装饰类组件（Splash / Fireworks / Spine / BGM）**全量保留**。
- 评论体系切换到 giscus（这是技术架构层面的变更，已征得用户同意）。

---

## 2. 技术栈对照

| 维度          | VitePress（原实现）                                                           | Next.js（当前实现）                                                                      |
|-------------|--------------------------------------------------------------------------|------------------------------------------------------------------------------------|
| 构建器         | VitePress 1.x                                                            | Next.js App Router                                                                 |
| 渲染语言        | Vue 3 SFC（`<template>` + `<script setup>`）                               | React 函数组件（`.tsx`）                                                                 |
| 样式          | Less + `<style scoped lang="less">` + CSS 变量                             | CSS Modules（`*.module.css`）+ `styles/globals.scss` / `_theme.scss`                 |
| 路由          | `posts/*.md` → `posts/*.html`                                            | `app/posts/[slug]/page.tsx`，URL `/posts/<slug>`，旧 `.html` 由 `public/_redirects` 兜底 |
| 数据加载        | `*.data.mts`（VitePress build-time loader）                                | `lib/posts.ts` + `generateStaticParams`，仍用 `gray-matter`                           |
| 全局状态        | `reactive` + `useStore()`                                                | 多个 React Context（按主题 / 菜单 / Splash / 搜索 拆分）                                        |
| 主题切换        | `html[theme=light/dark]` + manual store                                  | `BlogRuntime` Context 复刻亮 / 暗 / 系统三态，仍使用 `html[theme]`                             |
| Markdown 渲染 | markdown-it（行号、math、custom-attrs）                                        | `next-mdx-remote/rsc` + remark/rehype 插件                                           |
| 数学公式        | `markdown-it-mathjax3`                                                   | `remark-math` + `rehype-katex`                                                     |
| 代码高亮        | Shiki（`solarized-dark`）                                                  | Shiki（保留 `solarized-dark` 主题）                                                      |
| 自定义图片属性     | `markdown-it-custom-attrs`（注入 `data-fancybox=gallery`）                   | 自定义 rehype 插件，把 MDX `<img>` 改写为 `<BlogImage>` 并注入 `data-fancybox`                  |
| 评论          | Gitalk（GitHub OAuth，clientSecret 在前端）                                    | **giscus**（GitHub Discussions，纯前端无 secret）                                         |
| 图片组件        | 全局 `<Image>`（覆盖 VitePress 默认）                                            | `<BlogImage>`（避开 `next/image` 命名）                                                  |
| 字体          | `@fontsource/jetbrains-mono` + 自定义 Blueaka 字体                            | 不变（继续从 `public/font` 加载）                                                           |
| 部署          | Cloudflare Pages Git Integration<br>构建 `pnpm build`，产物 `.vitepress/dist` | Cloudflare Pages Git Integration<br>构建 `pnpm build`，产物 `out/`（`output: 'export'`）  |

---

## 3. 组件 / 文件对照

按现有 Vue 组件给出 React 端落点（命名暂定，落地时可微调）。

### 3.1 入口与布局

| VitePress 原实现                                  | Next.js 端                                              | 备注                                   |
|------------------------------------------------|--------------------------------------------------------|--------------------------------------|
| `.vitepress/config.mts`                        | `next.config.mjs` + `theme.config.tsx` + `lib/site.ts` | head / sitemap / 别名拆到 next 配置        |
| `.vitepress/theme/index.ts`                    | `pages/_app.tsx`（注册全局样式 / 字体 / Image 组件）               | normalize.css 仍保留                    |
| `.vitepress/theme/Layout.vue`                  | `components/layout/Layout.tsx` + 路由分发逻辑（`useRouter()`） | hero / content 由路由 hook 切换           |
| `.vitepress/theme/composables/useBlogTheme.ts` | `lib/useBlogTheme.ts` 或直接 import `lib/site.ts`         | 改为纯函数 / Hook                         |
| `.vitepress/theme/store/index.ts`              | `lib/store.ts`（Zustand）                                | `selectedPosts / currTag / ...` 全量迁移 |
| `.vitepress/theme/store/defaults.ts`           | 同上                                                     | `createEmptyPost()` 保留               |

### 3.2 数据与 SEO

| VitePress 原实现                                 | Next.js 端                                           |
|-----------------------------------------------|-----------------------------------------------------|
| `.vitepress/theme/utils/posts.data.mts`       | `lib/posts.ts`（fs + gray-matter，构建时调用）              |
| `.vitepress/theme/utils/collections.data.mts` | `lib/collections.ts`                                |
| `.vitepress/theme/utils/currentPost.ts`       | `lib/route.ts#resolveCurrentPost`                   |
| `.vitepress/theme/utils/currentCollection.ts` | `lib/route.ts#resolveCurrentCollection`             |
| `.vitepress/theme/config/site.ts`             | `lib/site.ts`（保留 `siteMeta` / `blogThemeConfig` 形状） |
| `.vitepress/theme/config/seo.ts`              | `lib/seo.ts` + 各 page 的 `<Head>` 注入                 |
| `.vitepress/theme/types/theme.ts`             | `lib/types.ts`                                      |

### 3.3 组件

| VitePress 原实现 (`.vitepress/theme/components/...`)  | Next.js 端 (`components/...`)                   | 行数        | 说明                                         |
|----------------------------------------------------|------------------------------------------------|-----------|--------------------------------------------|
| `Splash.vue`                                       | `splash/Splash.tsx`                            | 143       | 入场动画，挂在 `_app.tsx`                         |
| `layout/Navbar.vue`                                | `layout/Navbar.tsx`                            | 219       | 含 logo、菜单、汉堡按钮、SearchDialog                |
| `Navbar/Dropdown-Menu.vue`                         | `layout/DropdownMenu.tsx`                      | 115       | 移动端菜单                                      |
| `Navbar/Music-Control.vue`                         | `layout/MusicControl.tsx`                      | 51        | 背景音乐控件                                     |
| `Navbar/Search-Button.vue`                         | `layout/SearchButton.tsx`                      | 32        |                                            |
| `Navbar/Search-Dialog.vue`                         | `search/SearchDialog.tsx`                      | 292       | minisearch 搜索                              |
| `Navbar/ToggleSwitch.vue`                          | `layout/ThemeToggle.tsx`                       | 237       | 主题切换 + 系统跟随                                |
| `home/BannerHero.vue`                              | `home/BannerHero.tsx`                          | 260       | 首页 banner 容器（slot 替换为 children）            |
| `home/WelcomeBox.vue`                              | `home/WelcomeBox.tsx`                          | 247       | 名字、motto、社交链接                              |
| `posts/PostList.vue`                               | `posts/PostList.tsx`                           | 504       | 列表 + 分页 + 排序                               |
| `posts/PostListCard.vue`                           | `posts/PostListCard.tsx`                       | 339       | 单条文章卡片                                     |
| `posts/PostBanner.vue`                             | `posts/PostBanner.tsx`                         | 33        | 文章顶部 banner                                |
| `posts/PostViewer.vue`                             | `posts/PostViewer.tsx`                         | 680       | 文章正文容器 + 评论                                |
| `posts/PostOutline.vue` / `PostOutlineRefined.vue` | `posts/PostOutline.tsx`                        | 503 / 450 | 目录组件，优先用 Refined                           |
| `posts/PostSideList.vue`                           | `posts/PostSideList.tsx`                       | 59        | 侧栏推荐                                       |
| `posts/TagFilter.vue`                              | `posts/TagFilter.tsx`                          | 169       | 标签云 + 过滤                                   |
| `posts/DownloadPdfButton.vue`                      | 合并到 `posts/PostSideList.tsx`                   | 484       | 浏览器原生打印 / 保存 PDF                           |
| `posts/ToTopButton.vue`                            | `posts/ToTopButton.tsx`                        | 208       |                                            |
| `collections/CollectionsBanner.vue`                | `collections/CollectionsBanner.tsx`            | 31        |                                            |
| `collections/CollectionBanner.vue`                 | `collections/CollectionBanner.tsx`             | 34        |                                            |
| `shared/Banner.vue`                                | `shared/Banner.tsx`                            | 59        |                                            |
| `shared/Image.vue`                                 | `shared/Image.tsx`                             | 156       | 注意：原作为全局组件 `<Image>`，要避开 `next/image` 命名冲突 |
| `Fireworks.vue`                                    | `fx/Fireworks.tsx`                             | 219       | anime.js，需 client only                     |
| `spine/SpinePlayer.vue`                            | `fx/SpinePlayer.tsx`                           | n/a       | spine-runtimes，需 dynamic import            |
| `Footer.vue`                                       | `layout/Footer.tsx`                            | 80        |                                            |
| `Gitalk.vue`                                       | `comments/GiscusComments.tsx`                  | 84        | 已切换到 giscus，主题 CSS 自定义                     |
| `NotFound.vue`                                     | `pages/404.tsx`                                | 66        |                                            |
| `FontAwesomeIcon.vue`                              | 直接使用 `@fortawesome/react-fontawesome`          | 39        | 不再保留自封装 FAIcon                             |
| `ToTop.vue`                                        | 合并到 `posts/ToTopButton.tsx` 或单独 `ui/ToTop.tsx` | 54        |                                            |

### 3.4 样式

| VitePress 原实现                             | Next.js 端                                    |
|-------------------------------------------|----------------------------------------------|
| `.vitepress/theme/styles/vars.less`       | `styles/globals.scss` + `styles/_theme.scss` |
| `.vitepress/theme/styles/icons.less`      | `styles/icons.css`                           |
| `.vitepress/theme/styles/index.less`      | 拆解到 `_app.tsx` 引入                            |
| `.vitepress/theme/styles/fontawesome.css` | 同 `styles/` 目录下保留                            |
| 各组件 `<style scoped lang="less">`          | `<Component>.module.css`，类名用 camelCase       |

---

## 4. 阶段计划

每个阶段都以可运行 / 可预览为目标，避免一次性大爆炸。

### 阶段 0 ｜准备（已完成）

- [x] 切到 `react-migration` 分支
- [x] 写 README.md / AGENT.md / MIGRATION.md
- [x] 用户确认所有迁移决策（见 §6 决策记录）
- [x] 仓库内 `.github/` 已移除，部署改为 Cloudflare Pages Git Integration

### 阶段 1 ｜最小可跑 demo（先验证骨架）

目标：跑通 `pnpm dev`，能看到首页 + 至少一篇文章，验证 Next.js 15 + App Router + `output: 'export'` 在本仓库的组合可行。

**Nextra v4 落地细化**：Nextra v4 的 MDX loader 强绑定 `content/` 目录约定与文件路由，与本项目的 `posts/` 既有结构和"按
tag / collection 分页 / 文集卡片"的列表逻辑冲突。为遵守"只动框架与技术架构、不动其他行为"的总原则，阶段 1 demo *
*不引入 `nextra` 包**，MDX 渲染走 `next-mdx-remote/rsc`，路由完全自定义。骨架仍是用户决策的 "Next.js 15 + App Router +
自定义主题"。如果后续要复用 Nextra 的 sidebar / 自动 TOC，再单独评估接入路径。

- [x] `.gitignore` 加入 `.next/` / `out/` / `next-env.d.ts`
- [x] `package.json`：新增 `next@^15` / `react@^19` / `react-dom@^19` / `next-mdx-remote` /
  `remark-math` / `rehype-katex` / `remark-gfm` / `katex` / `giscus` / `shiki` / `@fortawesome/react-fontawesome` 等依赖；
  收尾阶段已移除 `vitepress` / `vue` / `less` / `markdown-it-*` / `wrangler` / `md5` / `install` 等旧链路依赖与 `vp:*`
  脚本
- [x] 拆分 `tsconfig.json`（给 Next.js 用）与 `tsconfig.vitepress.json`（给 vue-tsc 用；收尾阶段已删除）
- [x] `next.config.mjs`：开启 `output: 'export'`、`images.unoptimized: true`、`trailingSlash: true`、`reactStrictMode`
- [x] `lib/site.ts`：从 `.vitepress/theme/config/site.ts` 迁移；social 图标改用字符串 key，避免服务端导入 FA esm
- [x] `lib/posts.ts`：从 `.vitepress/theme/utils/posts.data.mts` 迁移；增加 `slug` 字段，`href` 去除 `.html`
- [x] `app/layout.tsx`：根布局 + metadata
- [x] `app/page.tsx` + `app/page.module.css`：首页占位（文章列表 + 站点元信息）
- [x] `app/posts/[slug]/page.tsx` + `page.module.css`：动态文章页 + `generateStaticParams` + MDXRemote 渲染
- [x] `app/not-found.tsx`：404 兜底
- [x] `styles/globals.css`：最小重置 + JetBrains Mono + KaTeX 样式 + 临时 CSS 变量
- [x] `lib/mdx.ts` + `components/BlogImage.tsx`：VitePress Markdown 兼容层（移除 Vue `<script setup>`、兼容旧标题锚点 /
  `Image {...imageConfig}` / TeX 旋量符号 / 裸小写 HTML 标签）

验证结果：

- [x] `pnpm install` 装新依赖（当前本地 `node_modules` 已可用）
- [x] `pnpm typecheck` 通过
- [x] `pnpm build` 通过，静态导出生成 `out/`
- [x] `pnpm dev --hostname 127.0.0.1 --port 3001` 起 Next dev server
- [x] 访问 `http://127.0.0.1:3001`，确认首页能看到文章列表
- [x] 点开任一文章，确认正文 + 数学公式能渲染

预期可能踩到的坑：

- **MDX 严格语法**：阶段 1 已改为 `next-mdx-remote` 的 `format: 'md'` 模式，原因是现有 `posts/*.md` 是 VitePress
  Markdown，不是 MDX；直接按 MDX 编译会被 `{...}`、`<link>`、`\$` 等旧写法卡住。VitePress 兼容逻辑集中在 `lib/mdx.ts`，后续若逐篇改成
  MDX 再切回 `format: 'mdx'`。
- **代码高亮主题**：已通过 `rehypeShiki` 接入 Shiki `solarized-dark`，外壳由 `BlogCodeBlock` 复刻 VitePress 代码块结构。
- **frontmatter `head` 字段**：原 VitePress 用它注入 SEO meta，Next 端已在 `lib/seo.ts` 中读取并转换，后续新增文章仍可沿用旧字段。

### 阶段 2 ｜数据 & SEO

- [x] `lib/posts.ts` / `lib/collections.ts`（迁移自 `theme/utils/*.data.mts`）
- [x] `lib/types.ts`：统一导出文章、文集、主题配置与 giscus 配置类型
- [x] `lib/seo.ts`：复刻 `theme/config/seo.ts` 的 OG / Twitter / JSON-LD，注入到 App Router metadata，并读取 frontmatter
  `head`
- [x] `app/sitemap.ts` + `public/robots.txt`：静态 sitemap / robots
- [x] `public/_redirects`：旧 `.html` URL 301 到新 trailing slash 路由
- [x] 列表数据全部跑通（`generateStaticParams` + 文章 / 文集 / 标签）

### 阶段 3 ｜列表与文章页 UI

- [x] CSS 变量迁移：`vars.less` → `styles/globals.scss` / `styles/_theme.scss`，调色盘与组件语义变量已拆分为 SCSS mixin 管理
- [x] 主题切换：当前用 `BlogRuntime` 复刻原有亮 / 暗 / 系统三态（未引入 `next-themes`）
- [x] 首页（`/`）：复刻 `WelcomeBox` + `PostList`
- [x] 标签页（`/tags`）：复刻 `TagFilter` + `PostList`
- [x] 文集页（`/collections`、`/collections/[slug]`）：复刻 `CollectionsBanner` / `CollectionBanner` + `PostList`
- [x] 文章页（`/posts/[slug]`）：复刻 `PostBanner` + `PostViewer` + `PostSideList`
- [x] 状态层：当前收敛到 `BlogRuntime` Context，包含主题 / 搜索 / Splash / Fireworks / Spine 状态

本轮已从 `.vitepress/theme/components` 对照迁移：

- [x] `shared/Banner.vue` → `components/shared/Banner.tsx`
- [x] `Footer.vue` → `components/layout/Footer.tsx`
- [x] `home/BannerHero.vue` → `components/home/BannerHero.tsx`
- [x] `home/WelcomeBox.vue` → `components/home/WelcomeBox.tsx`
- [x] `FontAwesomeIcon.vue` → 直接使用 `@fortawesome/react-fontawesome`
- [x] `collections/CollectionsBanner.vue` → `components/collections/CollectionsBanner.tsx`
- [x] `collections/CollectionBanner.vue` → `components/collections/CollectionBanner.tsx`
- [x] `posts/PostBanner.vue` → `components/posts/PostBanner.tsx`
- [x] `posts/PostList.vue` → `components/posts/PostList.tsx`
- [x] `posts/PostListCard.vue` → `components/posts/PostListCard.tsx`
- [x] `posts/TagFilter.vue` → `components/posts/TagFilter.tsx`
- [x] `posts/PostViewer.vue` → `components/posts/PostViewer.tsx`
- [x] `posts/PostSideList.vue` → `components/posts/PostSideList.tsx`
- [x] `Navbar/Search-Dialog.vue` → `components/search/SearchDialog.tsx`
- [x] `Splash.vue` → `components/fx/Splash.tsx`
- [x] `Fireworks.vue` → `components/fx/Fireworks.tsx`
- [x] `spine/SpinePlayer.vue` → `components/fx/SpinePlayer.tsx`
- [x] `Navbar/Music-Control.vue` → `components/layout/controls/MusicControl.tsx`
- [x] `Gitalk.vue` → `components/comments/GiscusComments.tsx`（repo / category 配置已填入，主题 CSS 已按站点明暗色自定义）

验证结果：

- [x] `pnpm typecheck` 通过
- [x] `pnpm build` 通过，静态导出生成 47 个页面
- [x] `http://127.0.0.1:3001/`、`/collections/`、`/collections/robot-kinematics/`、`/posts/robot-kinematics-08-dof/` 均返回
  200

### 阶段 4 ｜装饰、交互、特殊功能

- [x] Splash 入场动画
- [x] Fireworks 点击烟花（anime.js，client component）
- [x] SpinePlayer 立绘（client component；运行时代码已复制到 `components/fx/spine-runtime/`，Next 运行时不再依赖
  `.vitepress/`）
- [x] BGM 背景音乐 + Music-Control
- [x] 搜索（`/search-index` 静态 JSON 按需加载；客户端用 minisearch 建索引，不再把完整 posts payload 注入根布局）
- [x] PDF 下载（浏览器原生打印 / 保存 PDF，打印 CSS 强制浅色并改善分页）
- [x] BlogImage 组件 + Markdown 兼容层改写旧 `<Image>` / 图片节点
- [x] giscus 评论配置：`blogThemeConfig.giscus` 已填入 repo / repoId / category / categoryId，评论主题已迁移到
  `public/styles/giscus-*.css`
- [x] Shiki 代码高亮：保留 `solarized-dark`，`BlogCodeBlock` 负责语言标签、复制按钮与行号样式
- [x] 标签页数据瘦身：`TagFilter` 只接收标签数组，列表按 tag 传轻量 `PostListItem`，避免序列化完整文章正文

### 阶段 5 ｜回归与上线

- [x] 视觉走查（与 main 分支线上并排对比）
- [x] Lighthouse / Pagespeed 检查
- [x] `public/_redirects`：旧 `.html` 链接 301 到无后缀 trailing slash 路径
- [x] 在 Cloudflare Pages 控制台把 `react-migration` 加为 preview branch，确认预览链接正常
- [x] 在 Cloudflare Pages 控制台把生产构建产物目录从 `.vitepress/dist` 改为 `out/`
- [x] Cloudflare preview 与视觉回归通过后，删除 `.vitepress/`，整理 `package.json` 依赖（清掉 vitepress / vue / less /
  markdown-it-* / wrangler 等仅旧 VitePress 链路使用的依赖；`animejs` 仍被 React 端 Splash / Fireworks 使用，不清理）
- [x] 收尾验证：`pnpm install --lockfile-only` 更新锁文件，`pnpm typecheck` / `pnpm build` 通过；导出产物未发现旧图片占位、
  `@Miscellaneous/path` 或旧 `.vitepress` 图片组件路径
- [x] `react-migration` 已合并回 `main`，由 Cloudflare 自动触发生产部署

---

## 5. 风险与注意事项

1. **`<Image>` 命名冲突 → BlogImage**：原项目全局注册的 `Image` 重命名为 `BlogImage`。MDX 中 Markdown `![]()` 通过自定义
   rehype 插件改写为 `<BlogImage>`，同时把原 `markdown-it-custom-attrs` 的 `data-fancybox=gallery` 一并注入。
2. **`outline` 字段保留**：每篇文章手写的 `outline` 不改、不删；目录组件优先读 frontmatter，回退到自动 TOC。
3. **数学公式**：`rehype-katex` 与原 MathJax 在长公式断行、`align` 环境上可能略有差异；视觉走查阶段重点回归。
4. **代码高亮主题**：保留 `solarized-dark`，行号样式由自定义 CSS 复刻。
5. **Spine 立绘**：spine-runtimes 是浏览器端 canvas，`dynamic({ ssr: false })` 加载。
6. **Gitalk → giscus**：原 `clientSecret` 写在前端配置里（已知风险点），切到 giscus 后该字段消失。`repoId` / `categoryId` 已通过
   giscus 配置页填入 `lib/site.ts`；Cloudflare preview 阶段仍需确认 GitHub Discussions、giscus App 权限与 HTTPS 自定义主题加载正常。
   **历史 Issue 评论不会自动迁移到 Discussions**（用户已接受这一代价）。
7. **`base` 路径**：自定义域名 `quetzalsidera.me` 部署在根路径，Next 端不设 `basePath`；任何"用 base 拼链接"的逻辑改为常量
   `/`。
8. **`.html` 后缀兼容**：通过 `public/_redirects` 写 `/posts/:slug.html /posts/:slug 301` 实现，Cloudflare Pages 原生支持，不动
   Next 路由。
9. **`output: 'export'` 限制**：不能用 `getServerSideProps` / API Routes / 服务端 `revalidate` / `next/image` 的运行时优化。
   `next/image` 必须配 `images.unoptimized: true`；BlogImage 直接用原生 `<img>` 就行（不必依赖 next/image）。
10. **`wrangler` 依赖**：已随 `.vitepress/` 收尾删除；Cloudflare Pages 由 Git Integration 负责构建部署。
11. **`pnpm-lock.yaml`**：迁移期间会增加 next/react/giscus/katex/remark/rehype/shiki 依赖，锁文件会显著增大；提交分批进行，避免一次性锁文件冲突。
12. **搜索索引导出**：`app/search-index/route.ts` 在静态导出后生成 `out/search-index`（无扩展名 JSON），SearchDialog 打开时
    `fetch('/search-index')` 再加载索引；页面 HTML/RSC 不再携带完整文章正文。
13. **文章图片写法边界**：`posts/*.md` 中仍保留 ```` ```ts image-setup ```` 里的 `@public/Image/.../path`
    路径对象导入，供 `lib/mdx.ts` 在构建期解析 `<Image {...imageConfig} />` 写法；Vue 组件 import 已移除，最终运行时不依赖
    `.vitepress/`。

---

## 6. 决策记录（已与用户对齐）

所有决策已在阶段 0 锁定，本节只供后续协作者查阅，不再变更需先开 issue / 重新对齐。

| 议题                      | 决策                                                             |
|-------------------------|----------------------------------------------------------------|
| Nextra 版本 + 路由          | **Nextra v4 + App Router**                                     |
| 工程目录                    | **收尾后删除 `.vitepress/`**，仓库根目录仅保留 Next.js 静态导出链路                |
| 部署形态                    | **`output: 'export'` 静态导出 → Cloudflare Pages Git Integration** |
| CI / Workflow           | **不用 GitHub Actions**（`.github/` 已删除），由 Cloudflare 控制台直接监听     |
| 状态管理                    | **多个 React Context**（不引入 Zustand）                              |
| 主题切换                    | **BlogRuntime Context**，CSS 变量继续使用 `html[theme=light/dark]`    |
| 评论系统                    | **切换到 giscus**（接受历史 Gitalk 评论不迁移的代价）                           |
| 数学公式                    | **`rehype-katex`**                                             |
| 代码高亮主题                  | 保留 `solarized-dark`                                            |
| 旧 `.html` 链接兼容          | **`public/_redirects` 301**                                    |
| 图片组件                    | **`BlogImage`**（避开 `next/image` 命名）                            |
| 装饰类组件                   | **Splash / Fireworks / Spine / BGM 全量保留**                      |
| `outline` 字段            | 保留，不重写                                                         |
| `data-fancybox=gallery` | 保留（由 rehype 插件注入到 `BlogImage`）                                 |
| 字体                      | Blueaka / Blueaka_Bold / JetBrains Mono 全部保留                   |
| `main` 分支同步策略           | **迁移已合并回 main**，后续维护以 main 的 Next.js 版本为准                      |
| 迁移路径                    | **先做最小可跑 demo**（阶段 1），跑通再扩展                                    |
| 总原则                     | **只动框架与技术架构，不改其他任何行为**                                         |

---

## 7. 进度追踪

进度通过 git 提交 + 任务清单维护：

- 短期任务用对话内的 Task 列表跟踪。
- 阶段性进度同步回 `MIGRATION.md` 的"阶段计划"清单（每完成一项打钩）。
- 不在本文件外另起 `progress.md`、`status.md` 等冗余文件。

## 8. 测试方案

测试状态只使用三种标记：`[测试通过]`、`[未测试]`、`[不通过]`。  
测试基准：迁移期使用 Cloudflare Pages `react-migration` preview 链接作为被测对象，`main` 分支线上 VitePress
版本作为视觉与行为对照；合并后以 `main` 生产站点为准。除非特别说明，每个测试项都需要覆盖浅色 / 深色 / 系统主题三态。

### 8.1 macOS 桌面

| 测试项目                                                         | Chrome(版本 148.0.7778.179 (正式版本) (arm64))                                                                | Safari(版本26.2 (21623.1.14.11.9))                                                                                        | Firefox(版本 151.0.2 (aarch64)) | Edge(版本 148.0.3967.83 (正式版本) (arm64)) |
|--------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|-------------------------------|---------------------------------------|
| 首页首屏布局：Navbar / BannerHero / WelcomeBox / PostList 无错位、无横向滚动 | [测试通过]                                                                                                  | [测试通过] 已修复待回归：保留 Navbar 高层级修复，同时把 Splash z-index 提升到 2000，开屏遮罩重新覆盖 Navbar。                                              | [测试通过]                        | [测试通过]                                |
| Splash 入场动画：停留、闪烁、淡出时序与原版一致                                  | [测试通过] 已修复待回归：从 animejs 切到 react-motion，直接驱动 `#breathingParts` 的 CSS 变量做 0.3→1 呼吸闪烁，Splash 遮罩本身只在结束时淡出。 | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| Navbar：居中稳定、移动/缩放/刷新不横向漂移，菜单与控件可用                            | [测试通过]                                                                                                  | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| 主题切换：浅色 / 深色 / 系统三态无 hydration mismatch，背景与遮罩同步              | [测试通过]                                                                                                  | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| WelcomeBox：文字、motto、社交图标、3D hover 效果正常                       | [测试通过]                                                                                                  | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| PostList：分页、排序、标签过滤、加载提示、滚动回顶、列表淡入动画正常                       | [测试通过] 已修复待回归：改为 List 内容整体 react-motion 淡出 / 切换 / 淡入，不再以卡片为单位做离场动画。                                     | [测试通过] 已修复待回归：为 `<BannerHero>` 下方 `section` 添加统一的 `section-route-enter` 动画，页面切换时由 section 承接淡入/虚化收敛，避免 PostList 自身直接消失。 | [测试通过]                        | [测试通过]                                |
| PostListCard：封面、标题点、标签 FontAwesome 图标、置顶标记、摘要一致              | [测试通过]                                                                                                  | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| 标签页 / 文集页：列表数据、筛选、文集详情页路由与样式正常                               | [测试通过]                                                                                                  | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| 文章页布局：PostBanner / PostViewer / PostSideList / Footer 对齐稳定   | [测试通过]                                                                                                  | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| PostSideList：目录跳转、阅读进度圆环、置顶/打印按钮定位正常                         | [测试通过]                                                                                                  | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| Markdown 标题锚点：标题 id、点击跳转、刷新 hash 定位正常                        | [测试通过]                                                                                                  | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| Markdown 图片：BlogImage、fancybox、相对路径、夜间亮度、懒加载正常               | [测试通过] 已修复待回归：blockquote / 标题 / 分割线清除浮动，引用块与标题恢复独占行。                                                    | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| Markdown 代码块：Shiki 高亮、行号、语言标签、复制按钮、横向滚动正常                    | [测试通过]                                                                                                  | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| KaTeX：行内公式、块级公式、长公式、中文邻接场景、字体比例正常                            | [测试通过]                                                                                                  | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| SearchDialog：标题、摘要截断、关键词高亮、列表动画、键盘/鼠标操作正常                    | [测试通过]                                                                                                  | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| giscus：评论区加载、登录入口、浅/深色自定义主题、HTTPS 主题 CSS 正常                  | [测试通过]                                                                                                  | [测试通过] Cloudflare preview 已回归：自定义主题 CSS 可访问，评论区浅 / 深色主题正常。                                                              | [测试通过]                        | [测试通过]                                |
| 装饰组件：Fireworks / Spine / BGM 控件加载与开关状态正常                     | [测试通过] 已修复待回归：Spine idle animation 在 runtime 初始化阶段设置，骨骼控制延后一帧绑定。                                        | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| 打印 / PDF：浅色打印样式、公式、代码块、图片、分页不截断关键元素                          | [测试通过] 已修复待回归：打印样式保留网页的 left / right / center / wrap 图片布局，只限制图片最大高度避免破页。                                | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| 旧链接兼容：`/posts/:slug.html`、`/collections/:slug.html` 301 到新路径 | [测试通过] 已修复待回归：dev 下旧文章 / 文集 `.html` 路径返回 308 到新路径，preview 仍由 `_redirects` 处理。                           | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| 404 与短页面：Footer 吸底、背景、返回链接、SEO 状态正常                          | [测试通过] 已修复待回归：新增 `/posts/` 404 页面入口，并设置 `dynamicParams = false`，dev 下未知文章 / 文集路径返回 404。                 | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |
| 响应时间：首次加载、路由跳转、搜索输入、主题切换无明显卡顿                                | [测试通过] 已修复待回归：同路径 nav 点击不再触发 route transition；真实切换才短暂模糊淡出，加载提示延迟到 push 前出现，并加入 900ms 清理兜底避免卡住。          | [测试通过]                                                                                                                  | [测试通过]                        | [测试通过]                                |

### 8.2 Windows 桌面

| 测试项目                                            | Chrome(版本 148.0.7778.217 (正式版本) (arm64)) | Edge(版本 146.0.3856.59 (正式版本) (arm64)) | Firefox(版本 151.0.2 (64位)) |
|-------------------------------------------------|------------------------------------------|---------------------------------------|---------------------------|
| 首页与文章页整体布局无错位、无横向滚动                             | [测试通过]                                   | [测试通过]                                | [测试通过]                    |
| 字体：Blueaka / Blueaka_Bold / JetBrains Mono 正确加载 | [测试通过]                                   | [测试通过]                                | [测试通过]                    |
| Navbar、PostSideList、Footer 在刷新、缩放、跳转后定位稳定       | [测试通过]                                   | [测试通过]                                | [测试通过]                    |
| PostList 交互：分页、过滤、加载提示、滚动回顶、动画正常                | [测试通过]                                   | [测试通过]                                | [测试通过]                    |
| Markdown 渲染：图片、代码块、表格、自定义 block、标题锚点正常          | [测试通过]                                   | [测试通过]                                | [测试通过]                    |
| KaTeX 渲染：块级公式不退化为行内公式，字号与行距可读                   | [测试通过]                                   | [测试通过]                                | [测试通过]                    |
| SearchDialog：搜索结果摘要、高亮、滚动、关闭行为正常                | [测试通过]                                   | [测试通过]                                | [测试通过]                    |
| giscus：评论区主题、登录入口、加载状态正常                        | [测试通过]                                   | [测试通过]                                | [测试通过]                    |
| 打印 / PDF：分页、颜色、公式、图片输出正常                        | [测试通过]                                   | [测试通过]                                | [测试通过]                    |
| 响应时间：首次加载、列表切换、搜索输入无明显延迟                        | [测试通过]                                   | [测试通过]                                | [测试通过]                    |

### 8.3 iOS 移动端

| 测试项目                                              | Safari |
|---------------------------------------------------|--------|
| 首页移动布局：BannerHero、WelcomeBox、PostListCard 不溢出、不重叠 | [未测试]  |
| Navbar 移动端：居中稳定、菜单展开/收起、搜索与主题控件可用                 | [未测试]  |
| Splash 与页面加载动画：不撑宽页面、不造成 Navbar / SideList 漂移     | [未测试]  |
| PostSideList 移动端：保持显示，目录按钮与其他按钮定位在预期底部区域          | [未测试]  |
| 文章正文：段落、标题、列表、表格、blockquote、custom block 可读       | [未测试]  |
| 图片：加载、缩放、fancybox 触摸浏览、夜间亮度正常                     | [未测试]  |
| 代码块：横向滚动、复制按钮、语言标签不遮挡内容                           | [未测试]  |
| KaTeX：行内/块级公式在窄屏可滚动或正常换行，不撑出视口                    | [未测试]  |
| SearchDialog：输入、结果滚动、摘要截断、关键字高亮、动画正常              | [未测试]  |
| giscus：评论区加载、登录跳转、主题与布局在窄屏可用                      | [未测试]  |
| Spine / Fireworks / BGM：移动端位置、开关、性能无明显问题          | [未测试]  |
| 响应时间：首屏加载、文章跳转、搜索输入、主题切换可接受                       | [未测试]  |

### 8.4 Android 移动端 [未测试]

| 测试项目                                              | Chrome | Firefox | Samsung Internet |
|---------------------------------------------------|--------|---------|------------------|
| 首页移动布局：BannerHero、WelcomeBox、PostListCard 不溢出、不重叠 | [未测试]  | [未测试]   | [未测试]            |
| Navbar 移动端：菜单、搜索、主题切换、BGM 控件可用                    | [未测试]  | [未测试]   | [未测试]            |
| PostList：分页、标签过滤、加载提示、滚动回顶与动画正常                   | [未测试]  | [未测试]   | [未测试]            |
| PostSideList：移动端保持显示，进度圆环和按钮定位正常                  | [未测试]  | [未测试]   | [未测试]            |
| Markdown 图片、代码块、表格、custom block 在窄屏不破版            | [未测试]  | [未测试]   | [未测试]            |
| KaTeX：长公式、块级公式、中文邻接公式不撑宽页面                        | [未测试]  | [未测试]   | [未测试]            |
| SearchDialog：键盘弹出后布局不跳乱，结果可滚动可点击                  | [未测试]  | [未测试]   | [未测试]            |
| giscus：评论区加载、登录入口、主题与输入框布局正常                      | [未测试]  | [未测试]   | [未测试]            |
| 装饰组件：Splash / Spine / Fireworks 不造成黑屏、闪烁或明显卡顿     | [未测试]  | [未测试]   | [未测试]            |
| 响应时间：首屏、路由跳转、搜索、主题切换无明显卡顿                         | [未测试]  | [未测试]   | [未测试]            |

### 8.5 平板

| 测试项目                                          | iPadOS Safari                                                                                             | 
|-----------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| 横屏首页布局：Navbar、Banner、PostListCard、Footer 对齐正常 | [测试通过]                                                                                                    |
| 竖屏首页布局：移动断点与桌面断点过渡自然，无横向滚动                    | [测试通过]                                                                                                    |
| 文章页：PostViewer 宽度、PostSideList 位置、目录跳转正常      | [测试通过] 已修复待回归：PostSideList bottom 改为 `clamp(..., 10dvh, ...)`，目录展开高度改用 `100dvh` 计算，避免 iPad Safari 视口高度超限。 |
| SearchDialog：弹窗尺寸、结果滚动、触摸操作正常                 | [测试通过]                                                                                                    |
| 图片 / 代码块 / KaTeX：横竖屏切换后布局稳定                   | [测试通过]                                                                                                    |
| giscus：评论区宽度、输入框、登录入口、主题正常                    | [测试通过]                                                                                                    |
| 响应时间：横竖屏切换、路由跳转、主题切换无明显卡顿                     | [测试通过]                                                                                                    |

### 8.6 Lighthouse / PageSpeed

| 报告                                                              | Performance | Accessibility | Best Practices | SEO | 备注                                                                                                                               |
|-----------------------------------------------------------------|-------------|---------------|----------------|-----|----------------------------------------------------------------------------------------------------------------------------------|
| Mobile：`ignore/LightHouse/localhost_3000-20260529T022243.html`  | 51          | 86            | 100            | 100 | FCP 9.9s、LCP 18.7s、Speed Index 18.6s、TBT 220ms、CLS 0.017；主要优化项为未使用 CSS/JS、首屏图片发现延迟、字体 / fancybox CSS 阻塞、Spine/banner 等资源体积与缓存策略。 |
| Desktop：`ignore/LightHouse/localhost_3000-20260529T022507.html` | 81          | 86            | 100            | 100 | FCP 1.5s、LCP 2.0s、Speed Index 2.2s、TBT 0ms、CLS 0；主要优化项为未使用 CSS/JS、图片尺寸 / 交付、字体 / fancybox CSS 阻塞。                                |

Accessibility 主要待优化项：分页按钮缺少可访问名称、社交链接缺少可辨识名称、排序 `<select>` 缺少 label，部分图片缺少显式
width / height。

### 8.7 验收规则

- 任一核心路径出现 `[不通过]` 时，不进入生产切换；核心路径包括首页、文章页、搜索、图片、KaTeX、代码块、giscus、旧链接重定向与移动端布局。
- 浏览器差异允许记录在对应表格单元格后追加简短备注，例如 `[不通过] Safari 打印分页截断公式`。
- Cloudflare preview 修复后需要回归对应失败项，并保留失败原因与修复说明到 PR 描述。

## 9. 合并后状态

1. `react-migration` 已合并回 `main`。
2. Cloudflare Pages 生产配置使用构建命令 `pnpm build`、产物目录 `out/`。
3. 本次合并后新增的 `robot-kinematics-10-type-synthesis` 与 `robot-kinematics-11-kinematics-analysis` 已通过
   `pnpm build` 进入静态路由。
4. 后续维护重点：移动端真机补测、Lighthouse Accessibility 项、资源体积与首屏性能优化。
