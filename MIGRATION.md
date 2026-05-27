# 迁移说明：VitePress → Nextra

> 范围：本仓库的 Vue/VitePress 主题与配置全部迁移到 Nextra（基于 Next.js）。
> UI 用 **React 函数组件**，样式统一用 **CSS Modules**。
> 内容（`posts/`、`collections/`、`tags/`、`public/`）尽量原样保留。

本文档列出迁移的目标、对照表、阶段计划与已知风险。
落地动作的细节约束见 [`AGENT.md`](./AGENT.md)，整体说明见 [`README.md`](./README.md)。

---

## 1. 目标

- **可读性**：Markdown 文章无须重写，frontmatter 字段保持兼容。
- **可维护性**：组件用 React + CSS Modules，状态层从 Vue `reactive` 切到 React 友好的方案（Zustand / Context）。
- **可部署性**：构建产物仍能托管在 GitHub Pages（`next export` 静态导出）。
- **可回退性**：迁移期间 `.vitepress/` 与 `main` 分支不被破坏，随时能切回旧版构建。

非目标：

- 不重做视觉设计；BA 风格、烟花、Splash、Spine 等观感保留。
- 不替换文章内容、不变更域名 / 评论体系（Gitalk）。

---

## 2. 技术栈对照

| 维度          | VitePress（现状）                                                   | Nextra（目标）                                                  |
| ------------- | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| 构建器        | VitePress 1.x                                                        | Next.js + `nextra` / `nextra-theme-blog` 或自定义主题            |
| 渲染语言      | Vue 3 SFC（`<template>` + `<script setup>`）                         | React 函数组件（`.tsx`）                                         |
| 样式          | Less + `<style scoped lang="less">` + CSS 变量                       | CSS Modules（`*.module.css`）+ CSS 变量集中到 `styles/tokens.css` |
| 路由          | `posts/*.md` → `posts/*.html`                                        | `pages/posts/[slug].mdx` 或 `app/posts/[slug]/page.tsx`          |
| 数据加载      | `*.data.mts`（VitePress build-time loader）                          | `getStaticProps` / `generateStaticParams` 读 `gray-matter`        |
| 全局状态      | `reactive` + `useStore()`                                            | Zustand（推荐）或 多个 React Context                             |
| Markdown 渲染 | markdown-it（主题 `solarized-dark`、行号、math、custom-attrs）       | `next-mdx-remote` 或 Nextra 默认 MDX + remark/rehype 插件        |
| 数学公式      | `markdown-it-mathjax3`                                               | `remark-math` + `rehype-katex` 或 `rehype-mathjax`               |
| 代码高亮      | Shiki（`solarized-dark`）                                            | Shiki（Nextra 内置）或 `rehype-pretty-code`                       |
| 自定义图片属性 | `markdown-it-custom-attrs`（注入 `data-fancybox=gallery`）           | 自定义 remark/rehype 插件，或在 MDX 组件层包装 `<img>`           |
| 部署          | `pnpm run build`（vitepress build） → GitHub Pages                   | `pnpm build && pnpm export` → GitHub Pages                       |
| 评论          | Gitalk（GitHub OAuth）                                               | 同 Gitalk，React 包装（或换 giscus，待定）                       |
| 字体          | `@fontsource/jetbrains-mono` + 自定义 Blueaka 字体                   | 不变（继续从 `public/font` 加载）                                |

---

## 3. 组件 / 文件对照

按现有 Vue 组件给出 React 端落点（命名暂定，落地时可微调）。

### 3.1 入口与布局

| VitePress 现状                                  | Nextra 端                                                                          | 备注                                                  |
| ----------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `.vitepress/config.mts`                         | `next.config.mjs` + `theme.config.tsx` + `lib/site.ts`                              | head / sitemap / 别名拆到 next 配置                   |
| `.vitepress/theme/index.ts`                     | `pages/_app.tsx`（注册全局样式 / 字体 / Image 组件）                                | normalize.css 仍保留                                  |
| `.vitepress/theme/Layout.vue`                   | `components/layout/Layout.tsx` + 路由分发逻辑（`useRouter()`）                       | hero / content 由路由 hook 切换                       |
| `.vitepress/theme/composables/useBlogTheme.ts`  | `lib/useBlogTheme.ts` 或直接 import `lib/site.ts`                                    | 改为纯函数 / Hook                                     |
| `.vitepress/theme/store/index.ts`               | `lib/store.ts`（Zustand）                                                            | `selectedPosts / currTag / ...` 全量迁移              |
| `.vitepress/theme/store/defaults.ts`            | 同上                                                                                | `createEmptyPost()` 保留                              |

### 3.2 数据与 SEO

| VitePress 现状                                          | Nextra 端                                                            |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| `.vitepress/theme/utils/posts.data.mts`                 | `lib/posts.ts`（fs + gray-matter，构建时调用）                        |
| `.vitepress/theme/utils/collections.data.mts`           | `lib/collections.ts`                                                  |
| `.vitepress/theme/utils/currentPost.ts`                 | `lib/route.ts#resolveCurrentPost`                                     |
| `.vitepress/theme/utils/currentCollection.ts`           | `lib/route.ts#resolveCurrentCollection`                               |
| `.vitepress/theme/config/site.ts`                       | `lib/site.ts`（保留 `siteMeta` / `blogThemeConfig` 形状）              |
| `.vitepress/theme/config/seo.ts`                        | `lib/seo.ts` + 各 page 的 `<Head>` 注入                                |
| `.vitepress/theme/types/theme.ts`                       | `lib/types.ts`                                                        |

### 3.3 组件

| VitePress 现状 (`.vitepress/theme/components/...`) | Nextra 端 (`components/...`)                       | 行数 | 说明                                |
| -------------------------------------------------- | --------------------------------------------------- | ---- | ----------------------------------- |
| `Splash.vue`                                       | `splash/Splash.tsx`                                 | 143  | 入场动画，挂在 `_app.tsx`           |
| `layout/Navbar.vue`                                | `layout/Navbar.tsx`                                 | 219  | 含 logo、菜单、汉堡按钮、SearchDialog |
| `Navbar/Dropdown-Menu.vue`                         | `layout/DropdownMenu.tsx`                           | 115  | 移动端菜单                          |
| `Navbar/Music-Control.vue`                         | `layout/MusicControl.tsx`                           | 51   | 背景音乐控件                        |
| `Navbar/Search-Button.vue`                         | `layout/SearchButton.tsx`                           | 32   |                                     |
| `Navbar/Search-Dialog.vue`                         | `search/SearchDialog.tsx`                           | 292  | minisearch 搜索                     |
| `Navbar/ToggleSwitch.vue`                          | `layout/ThemeToggle.tsx`                            | 237  | 主题切换 + 系统跟随                 |
| `home/BannerHero.vue`                              | `home/BannerHero.tsx`                               | 260  | 首页 banner 容器（slot 替换为 children）|
| `home/WelcomeBox.vue`                              | `home/WelcomeBox.tsx`                               | 247  | 名字、motto、社交链接               |
| `posts/PostList.vue`                               | `posts/PostList.tsx`                                | 504  | 列表 + 分页 + 排序                  |
| `posts/PostListCard.vue`                           | `posts/PostListCard.tsx`                            | 339  | 单条文章卡片                        |
| `posts/PostBanner.vue`                             | `posts/PostBanner.tsx`                              | 33   | 文章顶部 banner                     |
| `posts/PostViewer.vue`                             | `posts/PostViewer.tsx`                              | 680  | 文章正文容器 + 评论                 |
| `posts/PostOutline.vue` / `PostOutlineRefined.vue` | `posts/PostOutline.tsx`                             | 503 / 450 | 目录组件，优先用 Refined           |
| `posts/PostSideList.vue`                           | `posts/PostSideList.tsx`                            | 59   | 侧栏推荐                            |
| `posts/TagFilter.vue`                              | `posts/TagFilter.tsx`                               | 169  | 标签云 + 过滤                       |
| `posts/DownloadPdfButton.vue`                      | `posts/DownloadPdfButton.tsx`                       | 484  | html2pdf 客户端动态导入             |
| `posts/ToTopButton.vue`                            | `posts/ToTopButton.tsx`                             | 208  |                                     |
| `collections/CollectionsBanner.vue`                | `collections/CollectionsBanner.tsx`                 | 31   |                                     |
| `collections/CollectionBanner.vue`                 | `collections/CollectionBanner.tsx`                  | 34   |                                     |
| `shared/Banner.vue`                                | `shared/Banner.tsx`                                 | 59   |                                     |
| `shared/Image.vue`                                 | `shared/Image.tsx`                                  | 156  | 注意：原作为全局组件 `<Image>`，要避开 `next/image` 命名冲突 |
| `Fireworks.vue`                                    | `fx/Fireworks.tsx`                                  | 219  | anime.js，需 client only            |
| `spine/SpinePlayer.vue`                            | `fx/SpinePlayer.tsx`                                | n/a  | spine-runtimes，需 dynamic import   |
| `Footer.vue`                                       | `layout/Footer.tsx`                                 | 80   |                                     |
| `Gitalk.vue`                                       | `comments/Gitalk.tsx`                               | 84   | 客户端挂载                          |
| `NotFound.vue`                                     | `pages/404.tsx`                                     | 66   |                                     |
| `FontAwesomeIcon.vue`                              | `icons/FAIcon.tsx`                                  | 39   | 直接用 `@fortawesome/react-fontawesome` |
| `ToTop.vue`                                        | 合并到 `posts/ToTopButton.tsx` 或单独 `ui/ToTop.tsx` | 54   |                                     |

### 3.4 样式

| VitePress 现状                          | Nextra 端                                  |
| --------------------------------------- | ------------------------------------------- |
| `.vitepress/theme/styles/vars.less`     | `styles/tokens.css`（CSS 变量，亮暗主题）   |
| `.vitepress/theme/styles/icons.less`    | `styles/icons.css`                          |
| `.vitepress/theme/styles/index.less`    | 拆解到 `_app.tsx` 引入                      |
| `.vitepress/theme/styles/fontawesome.css` | 同 `styles/` 目录下保留                    |
| 各组件 `<style scoped lang="less">`     | `<Component>.module.css`，类名用 camelCase  |

---

## 4. 阶段计划

每个阶段都以可运行 / 可预览为目标，避免一次性大爆炸。

### 阶段 0 ｜准备（当前所在阶段）

- [x] 切到 `react-migration` 分支
- [x] 写 README.md / AGENT.md / MIGRATION.md
- [ ] 与用户确认：Nextra 版本（v3 / v4）、是否启用 `app router`、是否换 giscus

### 阶段 1 ｜骨架

- [ ] 在仓库根新增 Nextra 工程结构（`next.config.mjs`、`theme.config.tsx`、`pages/`、`styles/`、`components/`、`lib/`）
- [ ] 设置 `package.json` 中 Next.js / Nextra / React 依赖（保留 vitepress 依赖直到完成切换）
- [ ] 跑通 `next dev`，显示一个空白首页 + 一个示例 MDX 文章

### 阶段 2 ｜数据 & SEO

- [ ] `lib/site.ts` / `lib/types.ts` / `lib/posts.ts` / `lib/collections.ts`
- [ ] 用 `getStaticProps` 把所有 posts / collections 数据喂到列表页
- [ ] `lib/seo.ts` 输出 `<Head>` 配置，复刻原 `seo.ts` 的 OG / Twitter / JSON-LD

### 阶段 3 ｜列表与文章页

- [ ] 首页（`/`）：复刻 `WelcomeBox` + `PostList`
- [ ] 标签页（`/tags`）：复刻 `TagFilter` + `PostList`
- [ ] 文集页（`/collections`、`/collections/[slug]`）：复刻 `CollectionsBanner` / `CollectionBanner` + `PostList`
- [ ] 文章页（`/posts/[slug]`）：复刻 `PostBanner` + `PostViewer`（含目录、侧栏、评论）

### 阶段 4 ｜装饰与交互

- [ ] Splash、Fireworks、SpinePlayer、背景音乐（Music-Control）
- [ ] 主题切换（亮 / 暗 / 系统）
- [ ] 搜索（minisearch 客户端索引）
- [ ] PDF 下载（html2pdf.js，动态 import 以避免 SSR）

### 阶段 5 ｜回归与上线

- [ ] 视觉走查（与 main 分支并排对比）
- [ ] Lighthouse / Pagespeed 检查
- [ ] 改 GitHub Pages 工作流为 `next build && next export`
- [ ] 删除 `.vitepress/`，整理 `package.json` 依赖
- [ ] PR `react-migration` → `main`

---

## 5. 风险与注意事项

1. **`<Image>` 命名冲突**：原项目在 `theme/index.ts` 全局注册了 `Image` 组件覆盖 VitePress 默认。迁到 Next.js 后要避开 `next/image` 的同名导入，建议改名 `BlogImage` 或放在命名空间下。
2. **`outline` 字段**：当前每篇文章手写了 outline。React 端如果用 Nextra 自动 TOC，需要：
   - 兼容旧 frontmatter（优先用手写，回退到自动）；或
   - 一次性脚本清掉 outline 字段（**需用户授权**）。
3. **数学公式**：`markdown-it-mathjax3` → `remark-math` + `rehype-katex` 在长公式断行、`align` 环境上的兼容性需要测一遍。
4. **代码高亮主题**：保留 `solarized-dark`，注意行号样式。
5. **Spine 立绘**：spine-runtimes 是浏览器端 canvas，要用 `next/dynamic({ ssr: false })`。
6. **Gitalk**：构造时需要 `clientID` / `clientSecret` / `repo`。当前 `clientSecret` 写在前端配置里（同 VitePress 时期），上线前确认是否要换 giscus 或迁到环境变量。
7. **`base` 路径**：原 VitePress 用 `useData().site.value.base` 处理 GitHub Pages 子路径。迁移到 Next.js 后用 `next.config.mjs` 的 `basePath` + `assetPrefix`。
8. **`.html` 后缀**：原文章 href 形如 `posts/xxx.html`。Next 默认无 `.html`；需要保留旧链接的话用 `trailingSlash: true` 或 redirects 兜底。

---

## 6. 决策待定（需要用户确认）

- Nextra 是否启用 v4 + App Router，还是 v3 + pages router？
- 是否保留 Gitalk，或一并切到 giscus？
- 是否在迁移过程中顺手把 `outline` 字段移除、改用自动目录？
- 是否保留 `markdown-it-custom-attrs` 注入的 `data-fancybox=gallery`，或换 `react-medium-image-zoom` 等？
- BGM、Spine、Fireworks 是否全部保留？（如果想轻量化，迁移阶段是一个好的瘦身机会。）

---

## 7. 进度追踪

进度通过 git 提交 + 任务清单维护：

- 短期任务用对话内的 Task 列表跟踪。
- 阶段性进度同步回 `MIGRATION.md` 的"阶段计划"清单（每完成一项打钩）。
- 不在本文件外另起 `progress.md`、`status.md` 等冗余文件。
