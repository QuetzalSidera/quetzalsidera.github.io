# 迁移说明：VitePress → Nextra

> 范围：本仓库的 Vue/VitePress 主题与配置全部迁移到 Nextra（基于 Next.js）。
> UI 用 **React 函数组件**，样式统一用 **CSS Modules**。
> 内容（`posts/`、`collections/`、`tags/`、`public/`）尽量原样保留。

本文档列出迁移的目标、对照表、阶段计划与已知风险。
落地动作的细节约束见 [`AGENT.md`](./AGENT.md)，整体说明见 [`README.md`](./README.md)。

---

## 1. 目标

- **可读性**：Markdown 文章无须重写，frontmatter 字段保持兼容。
- **可维护性**：组件用 React + CSS Modules，状态层从 Vue `reactive` 切到多个 React Context。
- **可部署性**：构建产物仍能托管在 **Cloudflare Pages**（项目名 `quetzalsidera-blog`，自定义域名 `quetzalsidera.me`），Next.js 走 `output: 'export'` 静态导出 → `wrangler pages deploy out`。
- **可回退性**：迁移期间 `.vitepress/` 与 `main` 分支不被破坏，随时能切回旧版构建。

非目标 / 用户明确要求：

- **迁移只动框架与技术架构，不改其他任何行为**。视觉、交互、字体、动画时长、文章内容、frontmatter、链接结构全部保持一致。
- 装饰类组件（Splash / Fireworks / Spine / BGM）**全量保留**。
- 评论体系切换到 giscus（这是技术架构层面的变更，已征得用户同意）。

---

## 2. 技术栈对照

| 维度          | VitePress（现状）                                                   | Nextra（目标）                                                  |
| ------------- | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| 构建器        | VitePress 1.x                                                        | Next.js + Nextra v4（App Router）                                |
| 渲染语言      | Vue 3 SFC（`<template>` + `<script setup>`）                         | React 函数组件（`.tsx`）                                         |
| 样式          | Less + `<style scoped lang="less">` + CSS 变量                       | CSS Modules（`*.module.css`）+ CSS 变量集中到 `styles/tokens.css` |
| 路由          | `posts/*.md` → `posts/*.html`                                        | `app/posts/[slug]/page.tsx`，URL `/posts/<slug>`，旧 `.html` 由 `public/_redirects` 兜底 |
| 数据加载      | `*.data.mts`（VitePress build-time loader）                          | `lib/posts.ts` + `generateStaticParams`，仍用 `gray-matter`        |
| 全局状态      | `reactive` + `useStore()`                                            | 多个 React Context（按主题 / 菜单 / Splash / 搜索 拆分）          |
| 主题切换      | `html[theme=light/dark]` + manual store                              | `next-themes` 库，CSS 变量走 `[data-theme=light/dark]` 选择器     |
| Markdown 渲染 | markdown-it（行号、math、custom-attrs）                              | Nextra v4 MDX pipeline + remark/rehype 插件                       |
| 数学公式      | `markdown-it-mathjax3`                                               | `remark-math` + `rehype-katex`                                    |
| 代码高亮      | Shiki（`solarized-dark`）                                            | Shiki（保留 `solarized-dark` 主题）                                |
| 自定义图片属性 | `markdown-it-custom-attrs`（注入 `data-fancybox=gallery`）           | 自定义 rehype 插件，把 MDX `<img>` 改写为 `<BlogImage>` 并注入 `data-fancybox` |
| 评论          | Gitalk（GitHub OAuth，clientSecret 在前端）                          | **giscus**（GitHub Discussions，纯前端无 secret）                  |
| 图片组件      | 全局 `<Image>`（覆盖 VitePress 默认）                                 | `<BlogImage>`（避开 `next/image` 命名）                            |
| 字体          | `@fontsource/jetbrains-mono` + 自定义 Blueaka 字体                   | 不变（继续从 `public/font` 加载）                                 |
| 部署          | Cloudflare Pages Git Integration<br>构建 `pnpm build`，产物 `.vitepress/dist` | Cloudflare Pages Git Integration<br>构建 `pnpm build`，产物 `out/`（`output: 'export'`） |

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

### 阶段 0 ｜准备（已完成）

- [x] 切到 `react-migration` 分支
- [x] 写 README.md / AGENT.md / MIGRATION.md
- [x] 用户确认所有迁移决策（见 §6 决策记录）
- [x] 仓库内 `.github/` 已移除，部署改为 Cloudflare Pages Git Integration

### 阶段 1 ｜最小可跑 demo（先验证骨架）

目标：跑通 `pnpm dev`，能看到首页 + 至少一篇文章，验证 Nextra v4 + App Router + `output: 'export'` 在本仓库的组合可行。

- [ ] `package.json`：新增 `next` / `nextra` / `nextra-theme-blog`（或自定义主题）/ `react` / `react-dom` 依赖；保留 `vitepress` / `vue` / `less` 不动
- [ ] `next.config.mjs`：开启 `output: 'export'`、`images.unoptimized: true`、`trailingSlash` 视情况设
- [ ] `app/layout.tsx` + `app/page.tsx`（首页占位）
- [ ] `app/posts/[slug]/page.tsx`（动态文章页）+ `generateStaticParams` 读 `posts/`
- [ ] `theme.config.tsx`（如果走 Nextra 主题层）
- [ ] `lib/site.ts`：从 `.vitepress/theme/config/site.ts` 迁移过来
- [ ] 本地 `pnpm dev` 可见首页文字 + 任一文章渲染（样式可以裸）

### 阶段 2 ｜数据 & SEO

- [ ] `lib/types.ts` / `lib/posts.ts` / `lib/collections.ts`（迁移自 `theme/utils/*.data.mts`）
- [ ] `lib/seo.ts`：复刻 `theme/config/seo.ts` 的 OG / Twitter / JSON-LD，注入到 `app/layout.tsx` 的 `generateMetadata`
- [ ] 列表数据全部跑通（`generateStaticParams` + 文章 / 文集 / 标签）

### 阶段 3 ｜列表与文章页 UI

- [ ] CSS 变量迁移：`vars.less` → `styles/tokens.css`（按 `[data-theme=light/dark]` 拆）
- [ ] 主题切换：接入 `next-themes`，复刻原有亮 / 暗 / 系统三态
- [ ] 首页（`/`）：复刻 `WelcomeBox` + `PostList`
- [ ] 标签页（`/tags`）：复刻 `TagFilter` + `PostList`
- [ ] 文集页（`/collections`、`/collections/[slug]`）：复刻 `CollectionsBanner` / `CollectionBanner` + `PostList`
- [ ] 文章页（`/posts/[slug]`）：复刻 `PostBanner` + `PostViewer`（含目录、侧栏）
- [ ] 状态层：拆出 `MenuContext` / `SplashContext` / `SearchContext` / `OutlineContext` 等

### 阶段 4 ｜装饰、交互、特殊功能

- [ ] Splash 入场动画
- [ ] Fireworks 点击烟花（anime.js，client component）
- [ ] SpinePlayer 立绘（`dynamic({ ssr: false })`）
- [ ] BGM 背景音乐 + Music-Control
- [ ] 搜索（minisearch，构建时生成索引 → public/json，运行时拉取）
- [ ] PDF 下载（html2pdf.js 客户端动态 import）
- [ ] BlogImage 组件 + rehype 插件改写 MDX `<img>` 注入 `data-fancybox`
- [ ] giscus 评论（替换原 Gitalk）

### 阶段 5 ｜回归与上线

- [ ] 视觉走查（与 main 分支线上并排对比）
- [ ] Lighthouse / Pagespeed 检查
- [ ] `public/_redirects`：旧 `.html` 链接 301 到无后缀路径
- [ ] 在 Cloudflare Pages 控制台把 `react-migration` 加为 preview branch，确认预览链接正常
- [ ] 在 Cloudflare Pages 控制台把生产构建产物目录从 `.vitepress/dist` 改为 `out/`
- [ ] 删除 `.vitepress/`，整理 `package.json` 依赖（清掉 vitepress / vue / less / animejs 等仅 VitePress 用到的）
- [ ] PR `react-migration` → `main`，由 Cloudflare 自动触发生产部署

---

## 5. 风险与注意事项

1. **`<Image>` 命名冲突 → BlogImage**：原项目全局注册的 `Image` 重命名为 `BlogImage`。MDX 中 Markdown `![]()` 通过自定义 rehype 插件改写为 `<BlogImage>`，同时把原 `markdown-it-custom-attrs` 的 `data-fancybox=gallery` 一并注入。
2. **`outline` 字段保留**：每篇文章手写的 `outline` 不改、不删；目录组件优先读 frontmatter，回退到自动 TOC。
3. **数学公式**：`rehype-katex` 与原 MathJax 在长公式断行、`align` 环境上可能略有差异；视觉走查阶段重点回归。
4. **代码高亮主题**：保留 `solarized-dark`，行号样式由自定义 CSS 复刻。
5. **Spine 立绘**：spine-runtimes 是浏览器端 canvas，`dynamic({ ssr: false })` 加载。
6. **Gitalk → giscus**：原 `clientSecret` 写在前端配置里（已知风险点），切到 giscus 后该字段消失。需要先在 GitHub 仓库开启 Discussions、在 giscus 控制台拿到 `data-repo-id` / `data-category-id`。**历史 Issue 评论不会自动迁移到 Discussions**（用户已接受这一代价）。
7. **`base` 路径**：自定义域名 `quetzalsidera.me` 部署在根路径，Next 端不设 `basePath`；任何"用 base 拼链接"的逻辑改为常量 `/`。
8. **`.html` 后缀兼容**：通过 `public/_redirects` 写 `/posts/:slug.html /posts/:slug 301` 实现，Cloudflare Pages 原生支持，不动 Next 路由。
9. **`output: 'export'` 限制**：不能用 `getServerSideProps` / API Routes / 服务端 `revalidate` / `next/image` 的运行时优化。`next/image` 必须配 `images.unoptimized: true`；BlogImage 直接用原生 `<img>` 就行（不必依赖 next/image）。
10. **`wrangler` 依赖**：`package.json` 里的 `wrangler` 自从切换到 Cloudflare Git Integration 后就没用了，迁移收尾时一并删除。
11. **`pnpm-lock.yaml`**：迁移期间会增加 next/nextra/react/giscus/next-themes/katex/remark/rehype 依赖，锁文件会显著增大；提交分批进行，避免一次性锁文件冲突。

---

## 6. 决策记录（已与用户对齐）

所有决策已在阶段 0 锁定，本节只供后续协作者查阅，不再变更需先开 issue / 重新对齐。

| 议题                                | 决策                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------- |
| Nextra 版本 + 路由                   | **Nextra v4 + App Router**                                                |
| 工程目录                            | **仓库根目录与 `.vitepress/` 并存**，迁移收尾时再删 `.vitepress/`           |
| 部署形态                            | **`output: 'export'` 静态导出 → Cloudflare Pages Git Integration**         |
| CI / Workflow                       | **不用 GitHub Actions**（`.github/` 已删除），由 Cloudflare 控制台直接监听 |
| 状态管理                            | **多个 React Context**（不引入 Zustand）                                   |
| 主题切换                            | **`next-themes`**，CSS 变量用 `[data-theme=light/dark]` 选择器             |
| 评论系统                            | **切换到 giscus**（接受历史 Gitalk 评论不迁移的代价）                       |
| 数学公式                            | **`rehype-katex`**                                                        |
| 代码高亮主题                        | 保留 `solarized-dark`                                                     |
| 旧 `.html` 链接兼容                  | **`public/_redirects` 301**                                               |
| 图片组件                            | **`BlogImage`**（避开 `next/image` 命名）                                  |
| 装饰类组件                          | **Splash / Fireworks / Spine / BGM 全量保留**                              |
| `outline` 字段                      | 保留，不重写                                                              |
| `data-fancybox=gallery`             | 保留（由 rehype 插件注入到 `BlogImage`）                                   |
| 字体                                | Blueaka / Blueaka_Bold / JetBrains Mono 全部保留                          |
| `main` 分支同步策略                 | **迁移期冻结 main**，所有提交走 `react-migration`，迁移完成后 PR 回 main   |
| 迁移路径                            | **先做最小可跑 demo**（阶段 1），跑通再扩展                                |
| 总原则                              | **只动框架与技术架构，不改其他任何行为**                                  |

---

## 7. 进度追踪

进度通过 git 提交 + 任务清单维护：

- 短期任务用对话内的 Task 列表跟踪。
- 阶段性进度同步回 `MIGRATION.md` 的"阶段计划"清单（每完成一项打钩）。
- 不在本文件外另起 `progress.md`、`status.md` 等冗余文件。

## 8. 下一步（阶段 1 起手式）

1. 在 `package.json` 里追加 `next` / `nextra` / `react` / `react-dom` / `next-themes` 等依赖（不动现有 vitepress 系列）。
2. 新增 `next.config.mjs`、`app/`、`lib/`、`styles/`、`components/`。
3. 跑通一个最小渲染链路：根路径首页 + 任选一篇 `posts/*.md` 渲染。
4. 这个最小 demo 跑通后再继续阶段 2（数据 & SEO）。

跑通 demo 之前 **不要** 大规模迁移组件，避免在底层假设错误时返工。
