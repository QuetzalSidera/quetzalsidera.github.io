---
title: 从 VitePress 到 Next.js
date: 2026-05-29T04:17:48
tags: [ 个人博客, VitePress, Next.js, React ]
pinned: false
collection: 个人博客的更新记录
cover: /Image/Background/基沃托斯鸟瞰.webp
outline:
  - title: 概要
    slug: 概要
  - title: 原始方案问题
    slug: 原始方案问题
  - title: 1. 使用全局样式
    slug: 使用全局样式
    level: 1
  - title: 2. Vue 维护成本
    slug: Vue-维护成本
    level: 1
  - title: 3. 主题功能越来越重
    slug: 主题功能越来越重
    level: 1
  - title: 迁移方案
    slug: 迁移方案
  - title: 1. 分支与骨架
    slug: 分支与骨架
    level: 1
  - title: 2. 组件迁移
    slug: 组件迁移
    level: 1
  - title: 3. Markdown 兼容层
    slug: Markdown-兼容层
    level: 1
  - title: 4. 评论、SEO 与部署
    slug: 评论-SEO-与部署
    level: 1
  - title: 测试记录
    slug: 测试记录
  - title: 1. 构建与输出检查
    slug: 构建与输出检查
    level: 1

  - title: 2. 浏览器测试
    slug: 浏览器测试
    level: 1
  - title: 2.1 macOS 端
    slug: macOS端
    level: 2
  - title: 2.2 Windows 端
    slug: Windows端
    level: 2
  - title: 2.3 iPad 端
    slug: iPad端
    level: 2

  - title: 3. Lighthouse报告
    slug: Lighthouse报告
    level: 1
  - title: 收尾
    slug: 收尾
  - title: 相关提交
    slug: 相关提交
head:
  - - meta
    - name: description
      content: 记录个人博客从 VitePress 迁移到 Next.js App Router 的原因、迁移过程、测试记录与收尾状态。
  - - meta
    - name: keywords
      content: VitePress, Next.js, React, CSS Modules, 个人博客, 博客迁移, Nextra
---

记录个人博客从 VitePress 迁移到 Next.js App Router 的原因、过程、测试和收尾状态。

---

```ts image-setup
import { path as miscellaneousImagePath } from '@public/Image/Miscellaneous/path'

const previewCommitImage = {
  src: miscellaneousImagePath['01-commit-第一次上线Preview'],
  alt: '第一次上线 Preview 的提交记录',
  align: 'right',
  wrap: true,
  maxHeight: '16rem',
  caption: '第一次上线 Preview',
} as const

const testingCommitImage = {
  src: miscellaneousImagePath['02-commit-迁移基本完成-测试结束'],
  alt: '迁移基本完成并完成测试的提交记录',
  align: 'right',
  wrap: true,
  maxHeight: '16rem',
  caption: '迁移基本完成，测试结束',
} as const

const cleanupCommitImage = {
  src: miscellaneousImagePath['03-commit-删除-vitepress'],
  alt: '删除 VitePress 旧目录的提交记录',
  align: 'right',
  wrap: true,
  maxHeight: '16rem',
  caption: '删除 VitePress 旧目录',
} as const

const mergeCommitImage = {
  src: miscellaneousImagePath['04-commit-合并分支'],
  alt: '合并迁移分支到 main 的提交记录',
  align: 'right',
  wrap: true,
  maxHeight: '16rem',
  caption: '合并回 main',
} as const
```

这一次改动基本上是一次脱胎换骨，直接把 VitePress 主题迁到了 Nextra，全面脱离Vue，拥抱React。

## 一、概要 {#概要}

> 这次迁移的目标是彻底换掉底层框架，同时让读者看到的网站尽量保持原样。

迁移前后的变化如下：

| 项目          | 迁移前                                   | 迁移后                                     |
|-------------|---------------------------------------|-----------------------------------------|
| 构建框架        | VitePress                             | Next.js App Router                      |
| UI 组件       | Vue SFC                               | React 函数组件                              |
| 样式组织        | Less、全局变量、组件样式混用                      | CSS Modules + SCSS 主题变量                 |
| Markdown 渲染 | markdown-it                           | `next-mdx-remote/rsc` + remark / rehype |
| 数学公式        | `markdown-it-mathjax3`                | `remark-math` + `rehype-katex`          |
| 评论系统        | Gitalk                                | giscus                                  |
| 部署          | Cloudflare Pages，产物 `.vitepress/dist` | Cloudflare Pages，产物 `out/`              |

迁移时的约定：

- 文章格式兼容：文章内容、frontmatter、`outline` 和链接结构保持兼容。
- 前端样式不变：Splash、Fireworks、Spine、BGM 这些装饰组件全部保留。
- 就链接重定向：旧 `.html` 链接继续兼容，由 Cloudflare Pages 的 `_redirects` 做 301。
- 脱离Vitepress与Vue：迁移完成并验证后删除 `.vitepress/`，不再把旧主题源码留在仓库里当依赖。

<Image {...previewCommitImage} />

## 二、原始方案问题 {#原始方案问题}

### 1. 使用全局样式 {#使用全局样式}

旧主题的样式由 Less、全局 CSS 变量和组件 scoped
样式一起组成。小项目这么写没有太大问题，但这个博客后来加了首页、文章页、标签页、文集页、搜索、侧边栏、Splash、Spine、评论区和打印样式，样式影响范围就开始变得难判断。

这次迁移后，组件样式全部使用到 `*.module.css`。并做了完整的的变量语义化，调色盘放在全局，主题变量按组件分类放进 SCSS mixin。

### 2. Vue 维护成本 {#Vue-维护成本}

我平时写 React / Next.js 更多，不是特别喜欢Vue的语法。原来的 Vue 把模板、脚本和样式都放在一个文件里，感觉非常混乱。

博客是长期项目，写文章之外还会不断加小功能。继续在一个不熟悉的Vue主题体系里堆功能，后面每次修改都会变成心理负担。

### 3. 主题功能越来越重 {#主题功能越来越重}

这个博客早就超出了普通静态 Markdown 站点的范围。迁移前主题里已经有：

- Splash / Fireworks / Spine / BGM
- 首页文章列表、标签筛选、文集页
- 搜索弹窗、关键字索引、文章摘要
- KaTeX、Shiki 代码块、图片灯箱、PDF 打印
- SEO、sitemap、旧链接跳转、评论区主题

最麻烦的一段是把这些东西“再长回去”。Next.js 框架，真正耗时间的是让每个旧组件在新框架里表现得像原来一样。

## 三、迁移方案 {#迁移方案}

### 1. 分支与骨架 {#分支与骨架}

迁移没有直接在 `main` 上改。`main` 继续承载原有 VitePress 生产版本，`react-migration` 用来开发 Next.js 版本，并接入
Cloudflare preview。

阶段记录如下：

| 阶段      | 主要工作                                                           | 状态 |
|---------|----------------------------------------------------------------|----|
| 准备      | 创建 `react-migration`，整理 `README.md`、`AGENT.md`、`MIGRATION.md`  | 完成 |
| 最小 demo | Next.js 15、App Router、`output: 'export'`、首页和文章页跑通              | 完成 |
| 数据与 SEO | 迁移文章、文集、标签、metadata、sitemap、robots、旧链接重定向                      | 完成 |
| 列表与文章页  | 迁移首页、标签页、文集页、文章页和主题 Context                                    | 完成 |
| 特殊功能    | 迁移 Splash、Fireworks、Spine、BGM、搜索、PDF、giscus                    | 完成 |
| 回归上线    | Cloudflare preview、视觉回归、Lighthouse、删除 `.vitepress/`、合并回 `main` | 完成 |

### 2. 组件迁移 {#组件迁移}

组件迁移按 `.vitepress/theme/components` 一项一项对照，不容易漏掉小细节。

| VitePress 组件        | React 端迁移                                | 迁移重点                          |
|---------------------|------------------------------------------|-------------------------------|
| `Splash.vue`        | `components/fx/Splash.tsx`               | 入场停留、`breathingParts` 闪烁、淡出时序 |
| `Navbar.vue`        | `components/layout/Navbar.tsx`           | 居中、移动端菜单、搜索入口、主题切换            |
| `WelcomeBox.vue`    | `components/home/WelcomeBox.tsx`         | motto、社交图标、3D hover           |
| `PostList.vue`      | `components/posts/PostList.tsx`          | 分页、排序、标签过滤、加载提示、列表动画          |
| `PostListCard.vue`  | `components/posts/PostListCard.tsx`      | 封面、标题点、标签图标、置顶标记              |
| `PostViewer.vue`    | `components/posts/PostViewer.tsx`        | 正文背景、Markdown 样式、代码块、公式、图片    |
| `PostSideList.vue`  | `components/posts/PostSideList.tsx`      | 目录、阅读进度圆环、置顶和打印按钮             |
| `Search-Dialog.vue` | `components/search/SearchDialog.tsx`     | 摘要截断、关键字高亮、结果列表动画             |
| `Gitalk.vue`        | `components/comments/GiscusComments.tsx` | giscus 配置、自定义浅色和深色主题          |

这部分修了很多肉眼才能发现的问题，例如 Navbar 首次加载时横向漂移、移动端 SideList 从屏幕外滑入、titleDot 高度不对、PostList
切换时卡住、Splash 遮罩没有停留闪烁、Spine 模型位置和主题切换不一致。

### 3. Markdown 兼容层 {#Markdown-兼容层}

旧文章是 VitePress Markdown，不是严格 MDX。直接按 MDX 编译会遇到 Vue 组件写法、旧图片导入、裸 HTML 标签、相对 `.md`
链接和公式边界问题。

兼容层集中放在 `lib/mdx.ts` 和图片检查脚本里：

| 对象    | 处理                                                     |
|-------|--------------------------------------------------------|
| 图片组件  | 把文章里的自定义 `Image` 映射到 React 组件，旧的 Vue 传参写法改成 MDX 对象展开   |
| 图片引用  | 继续使用 ```` ```ts image-setup ```` 声明图片对象，构建期检查 key 是否存在 |
| 本地链接  | `./foo.md` 输出为 `/posts/foo/` 或 `/collections/foo/`     |
| 标题锚点  | 保留旧文章手写 id，目录跳转和刷新 hash 定位都能用                          |
| KaTeX | 修复块级公式被当成行内公式的问题，调整公式字号和深色样式                           |
| 代码块   | 保留 Shiki `solarized-dark`，用自定义代码块恢复语言标签、行号和复制按钮        |

文章里使用图片的写法也迁移到了 React 的 TSX 语法：

```md
<Image {...previewCommitImage} />
```

### 4. 评论、SEO 与部署 {#评论-SEO-与部署}

评论系统从 Gitalk 改成 giscus。原来的 Gitalk 需要在前端放 GitHub OAuth 配置，giscus 只依赖 GitHub Discussions
和仓库配置，维护上更干净。代价是历史 Gitalk Issue 评论不会自动迁移，这一点迁移前已经接受。

SEO 也从 VitePress 的 `head` 字段迁到 Next.js metadata。旧文章里的 `head` 仍然保留，Next 端会读取并转换。`sitemap.xml`、
`robots.txt`、Open Graph、Twitter card 和 JSON-LD 都在 Next 端重建。

值得一提的是，迁移期间所有部署都是成功的：

| 分支                | 用途               | 结果                |
|-------------------|------------------|-------------------|
| `main`            | 原 VitePress 生产站点 | production 部署全部成功 |
| `react-migration` | Next.js 迁移预览站点   | preview 部署全部成功    |
| `main` 合并后        | Next.js 生产站点     | production 部署成功   |

## 四、测试记录 {#测试记录}

### 1. 构建与输出检查 {#构建与输出检查}

迁移后构建前置检查更多了。现在 `pnpm build` 会先执行 `pnpm typecheck`，其中包含 TypeScript 检查和文章图片引用检查。

本地检查记录：

| 检查项              | 内容                                               | 结果     |
|------------------|--------------------------------------------------|--------|
| `pnpm typecheck` | TypeScript + 文章图片引用检查                            | [测试通过] |
| `pnpm build`     | Next.js 静态导出，生成 `out/`                           | [测试通过] |
| 输出扫描             | `.md` 链接残留                                       | [测试通过] |
| 输出扫描             | 旧图片占位、旧 Vue 图片写法残留                               | [测试通过] |
| 旧链接              | `/posts/:slug.html`、`/collections/:slug.html` 跳转 | [测试通过] |

### 2. 浏览器测试 {#浏览器测试}

浏览器测试是**纯人工**进行的。迁移期以 Cloudflare Pages 的 `react-migration` preview 为被测对象，`main` 上的 VitePress
版本作为视觉和行为对照；测试环境覆盖了移动端与iPad端的所有主流浏览器。

| 平台      | 浏览器                             | 结果     |
|---------|---------------------------------|--------|
| macOS   | Chrome、Safari、Firefox、Edge      | [测试通过] |
| Windows | Chrome、Edge、Firefox             | [测试通过] |
| iPadOS  | Safari，横屏和竖屏                    | [测试通过] |
| iOS     | Safari                          | [未测试]  |
| Android | Chrome、Firefox、Samsung Internet | [未测试]  |

#### 2.1 macOS 端{#macOS端}

| 测试项目                                                         | Chrome(版本 148.0.7778.179 (正式版本) (arm64)) | Safari(版本26.2 (21623.1.14.11.9)) | Firefox(版本 151.0.2 (aarch64)) | Edge(版本 148.0.3967.83 (正式版本) (arm64)) |
|--------------------------------------------------------------|------------------------------------------|----------------------------------|-------------------------------|---------------------------------------|
| 首页首屏布局：Navbar / BannerHero / WelcomeBox / PostList 无错位、无横向滚动 | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| Splash 入场动画：停留、闪烁、淡出时序与原版一致                                  | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| Navbar：居中稳定、移动/缩放/刷新不横向漂移，菜单与控件可用                            | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| 主题切换：浅色 / 深色 / 系统三态无 hydration mismatch，背景与遮罩同步              | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| WelcomeBox：文字、motto、社交图标、3D hover 效果正常                       | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| PostList：分页、排序、标签过滤、加载提示、滚动回顶、列表淡入动画正常                       | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| PostListCard：封面、标题点、标签 FontAwesome 图标、置顶标记、摘要一致              | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| 标签页 / 文集页：列表数据、筛选、文集详情页路由与样式正常                               | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| 文章页布局：PostBanner / PostViewer / PostSideList / Footer 对齐稳定   | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| PostSideList：目录跳转、阅读进度圆环、置顶/打印按钮定位正常                         | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| Markdown 标题锚点：标题 id、点击跳转、刷新 hash 定位正常                        | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| Markdown 图片：BlogImage、fancybox、相对路径、夜间亮度、懒加载正常               | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| Markdown 代码块：Shiki 高亮、行号、语言标签、复制按钮、横向滚动正常                    | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| KaTeX：行内公式、块级公式、长公式、中文邻接场景、字体比例正常                            | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| SearchDialog：标题、摘要截断、关键词高亮、列表动画、键盘/鼠标操作正常                    | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| giscus：评论区加载、登录入口、浅/深色自定义主题、HTTPS 主题 CSS 正常                  | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| 装饰组件：Fireworks / Spine / BGM 控件加载与开关状态正常                     | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| 打印 / PDF：浅色打印样式、公式、代码块、图片、分页不截断关键元素                          | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| 旧链接兼容：`/posts/:slug.html`、`/collections/:slug.html` 301 到新路径 | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| 404 与短页面：Footer 吸底、背景、返回链接、SEO 状态正常                          | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |
| 响应时间：首次加载、路由跳转、搜索输入、主题切换无明显卡顿                                | [测试通过]                                   | [测试通过]                           | [测试通过]                        | [测试通过]                                |

#### 2.2 Windows 端{#Windows端}

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

#### 2.3  iPad 端{#iPad端}

| 测试项目                                          | iPadOS Safari | 
|-----------------------------------------------|---------------|
| 横屏首页布局：Navbar、Banner、PostListCard、Footer 对齐正常 | [测试通过]        |
| 竖屏首页布局：移动断点与桌面断点过渡自然，无横向滚动                    | [测试通过]        |
| 文章页：PostViewer 宽度、PostSideList 位置、目录跳转正常      | [测试通过]        |
| SearchDialog：弹窗尺寸、结果滚动、触摸操作正常                 | [测试通过]        |
| 图片 / 代码块 / KaTeX：横竖屏切换后布局稳定                   | [测试通过]        |
| giscus：评论区宽度、输入框、登录入口、主题正常                    | [测试通过]        |
| 响应时间：横竖屏切换、路由跳转、主题切换无明显卡顿                     | [测试通过]        |

测试时的问题主要集中在这些地方：

| 问题                                    | 修复结果                                          |
|---------------------------------------|-----------------------------------------------|
| Splash 整体闪烁，原版实际是 `breathingParts` 闪烁 | 改成只驱动 `breathingParts` 的呼吸闪烁，遮罩只负责停留和淡出       |
| Navbar / SideList 首次加载时横向漂移           | 收敛页面切换动画和视口尺寸写法，避免动画把页面撑宽                     |
| Safari 下 giscus 夜间模式变白                | 自定义 giscus 主题 CSS，并确保 preview 下 HTTPS 主题文件可访问 |
| PostList 切换时像卡住                       | 加载提示、滚动回顶和列表淡入淡出拆开处理                          |
| 文章图片、blockquote、标题清浮动不完整              | 恢复 Markdown 正文区域的清浮动和独占行规则                    |
| PDF 打印颜色和分页异常                         | 打印样式强制浅色，并改善图片、代码块、公式分页                       |
| 404 页面 Footer 不吸底                     | 修复短页面布局，让 Footer 留在视口底部                       |
| dev 下旧 `.html` 路径不方便回归                | 开发环境也补上旧路径跳转，preview 继续由 `_redirects` 处理      |

### 3. Lighthouse报告 {#Lighthouse报告}

迁移后，也同样补充了完整的 Lighthouse 测试，结果如下。

| 报告      | Performance | Accessibility | Best Practices | SEO | 备注                                                  |
|---------|-------------|---------------|----------------|-----|-----------------------------------------------------|
| Mobile  | 51          | 86            | 100            | 100 | FCP 9.9s，LCP 18.7s，主要问题是首屏资源、未使用 CSS / JS、字体和图片发现延迟 |
| Desktop | 81          | 86            | 100            | 100 | FCP 1.5s，LCP 2.0s，TBT 0ms，主要问题仍是资源体积和部分可访问性标签       |


<Image {...testingCommitImage} />

## 五、收尾 {#收尾}

验证通过后，`react-migration` 合并回 `main`。`.vitepress/` 已删除，旧的 VitePress / Vue / Less / markdown-it
相关依赖和脚本也从新链路里清掉。`animejs` 还保留，因为 React 端的 Splash 和 Fireworks 仍在使用。

收尾后的状态：

| 项目    | 状态                                                                                       |
|-------|------------------------------------------------------------------------------------------|
| 生产分支  | `main`                                                                                   |
| 构建命令  | `pnpm build`                                                                             |
| 输出目录  | `out/`                                                                                   |
| 部署平台  | Cloudflare Pages Git Integration                                                         |
| 旧主题目录 | `.vitepress/` 已删除                                                                        |
| 文章目录  | 继续使用 `posts/`                                                                            |
| 图片索引  | 继续使用 `public/Image/**/path.ts` 与 `path.json`                                             |
| 新增文章  | `robot-kinematics-10-type-synthesis` 和 `robot-kinematics-11-kinematics-analysis` 已进入静态路由 |

## 六、相关提交 {#相关提交}

<Image {...cleanupCommitImage} />

<Image {...mergeCommitImage} />

这几张截图对应迁移过程里的几个节点：第一次上线 preview、迁移基本完成并结束测试、删除 `.vitepress/`、合并回 `main`
。从部署结果看，迁移期间 `main` 的 production 和 `react-migration` 的 preview 都没有失败。

####
