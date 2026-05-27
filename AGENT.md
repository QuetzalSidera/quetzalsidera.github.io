# AGENT.md

写给在本仓库工作的 AI 协作者（Claude Code、其他 Agent 等）。
本仓库正处于 **VitePress → Nextra** 迁移阶段，所有规则在迁移完成前一律以本文件为准。

---

## 0. 高优先约束（必读）

1. **分支**：所有改动（无论代码、文档、配置）一律在 `react-migration` 分支提交。
   - 在执行任何写操作前先确认 `git branch --show-current` 为 `react-migration`，若不是，先 `git checkout react-migration`。
   - `main` 分支保留稳定 VitePress 版本，不应被迁移期间的改动污染。
2. **技术栈**：迁移目标是 **Nextra（React）+ CSS Modules**。
   - 不再使用 Vue 3、Vue SFC、`<script setup>`、Less、内联 `<style scoped>`。
   - 不使用全局内联样式或 styled-jsx；统一走 `*.module.css`，必要的 CSS 变量集中到一处。
3. **不破坏现有内容**：`posts/` 下的 Markdown 内容是用户长期资产，迁移过程中不得擅自重写文章正文、frontmatter 字段或目录结构。
4. **写之前先看**：本仓库 Vue 组件不少（~5800 行），先读再写，不要凭印象重写组件。

---

## 1. 仓库一图入门

```
quetzalsidera.github.io/
├─ .vitepress/                 # 现有 VitePress 实现（迁移完成后逐步退场）
│  ├─ config.mts               # VitePress 站点配置入口
│  └─ theme/                   # Vue 主题（要被替换的部分）
│     ├─ Layout.vue            # 顶层布局，根据路由切换 hero / content 组件
│     ├─ index.ts              # 主题入口，注册全局组件、引入 less
│     ├─ components/           # 所有 Vue 组件
│     │  ├─ home/              # BannerHero / WelcomeBox
│     │  ├─ layout/            # Navbar
│     │  ├─ Navbar/            # SearchDialog / DropdownMenu / Music / Toggle / Search-Button
│     │  ├─ posts/             # PostList / PostListCard / PostViewer / PostBanner /
│     │  │                      # PostOutline(Refined) / PostSideList / TagFilter /
│     │  │                      # DownloadPdfButton / ToTopButton
│     │  ├─ collections/       # CollectionsBanner / CollectionBanner
│     │  ├─ shared/            # Banner / Image
│     │  ├─ spine/             # SpinePlayer（live2d 风格立绘）
│     │  ├─ Fireworks.vue      # anime.js 点击烟花
│     │  ├─ Splash.vue         # 入场动画
│     │  ├─ Footer.vue
│     │  ├─ Gitalk.vue         # GitHub OAuth 评论
│     │  ├─ NotFound.vue
│     │  └─ FontAwesomeIcon.vue
│     ├─ composables/          # useBlogTheme（读 themeConfig）
│     ├─ store/                # reactive 全局状态（selectedPosts / currTag / currCollection / ...）
│     ├─ config/               # site.ts（站点元信息）、seo.ts（OG / Twitter / JSON-LD）
│     ├─ types/theme.ts        # BlogThemeConfig 类型
│     ├─ utils/                # posts.data.mts / collections.data.mts / currentPost / currentCollection
│     ├─ styles/               # vars.less / icons.less / index.less
│     └─ assets/               # banner、icon、背景、字体
├─ posts/                      # 博客文章（保留）
├─ collections/                # 文集索引 Markdown（保留）
├─ tags/                       # 标签入口（保留）
├─ public/                     # 静态资源（保留并迁移到 Nextra 的 public/）
├─ index.md                    # 首页
├─ ignore/                     # 不入构建的草稿
├─ env.d.ts / tsconfig.json
├─ package.json                # 现含 vitepress / vue / less，将逐步替换为 next / nextra / react
├─ MIGRATION.md                # 迁移规划（请先读）
└─ README.md
```

---

## 2. 数据流（VitePress 现状）

- **文章数据**：`.vitepress/theme/utils/posts.data.mts`
  - 用 `gray-matter` 读取 `posts/*.md` 的 frontmatter + 摘要 + 字数。
  - 输出 `Post[]`，按 `pinned` + `create` 排序。
  - VitePress 的 `data loader` 约定，构建期被静态注入。
- **文集数据**：`.vitepress/theme/utils/collections.data.mts`
  - 类似上面，读取 `collections/*.md`。
- **路由判定**：`Layout.vue` 根据 `route.path` 决定渲染哪个 hero / content：
  - `/` → `WelcomeBox` + `PostList`
  - `/tags/` → `TagFilter` + `PostList`
  - `/collections/` → `CollectionsBanner` + `PostList`
  - `/collections/<slug>` → `CollectionBanner` + `PostList`
  - `posts/<slug>.html` → `PostBanner` + `PostViewer`
- **全局状态**：`.vitepress/theme/store/index.ts`，Vue `reactive`。
  - 关键字段：`selectedPosts / currTag / currCollection / currPost / currPage / searchDialog / splashLoading / fireworksEnabled / darkMode / outlineState`。
  - **迁移注意**：React 端建议拆为 Zustand 或多个 Context，避免全量 `reactive`。

---

## 3. 迁移期间的工作约定

### 3.1 提交位置

- 写代码 / 写文档前，先：

  ```bash
  git branch --show-current   # 必须 react-migration
  ```

  如果不是，`git checkout react-migration` 后再动手。

- 与迁移无关的修复（如错别字、图片替换）也走 `react-migration`；待迁移完成统一 PR 回 `main`。

### 3.2 文件层面

- **新组件**：使用函数式 React + CSS Modules，例如 `components/PostList/PostList.tsx` + `PostList.module.css`。
- **不要混用**：同一个目录不要既有 `.vue` 又有 `.tsx` 的同名替代品；要么并存于不同子目录、要么旧文件先标记不再使用。
- **样式**：
  - 颜色 / 间距 / 阴影集中到 CSS 变量（`styles/tokens.css`），亮暗主题切换沿用 `:root[theme=...]` 思路或 Nextra 的 `data-theme`。
  - 模块内只写局部样式；全局重置走 `_app.tsx` 或 Nextra 主题入口。
- **TypeScript**：严格类型，沿用现有 `BlogThemeConfig`、`Post`、`CollectionData` 等接口（位置可重新组织到 `lib/types.ts`）。

### 3.3 内容兼容性

- `posts/*.md` 暂不重命名、不改 frontmatter。
- 数学公式、代码高亮主题（`solarized-dark`）、`markdown-it-custom-attrs`（`image[data-fancybox=gallery]`）等扩展能力，在 Nextra 阶段需要找到对等方案（remark/rehype 插件）。
- 重要：`outline` 字段是手写目录，迁移目录组件时要兼容它，再考虑是否切到自动生成。

### 3.4 不要做的事

- ❌ 不要直接 `git checkout main` 或往 main 推。
- ❌ 不要删 `.vitepress/` —— 在 Nextra 跑通之前它是回退方案。
- ❌ 不要批量改 `posts/` 内容（即便只是空格 / 换行 / 字段重排）。
- ❌ 不要把 Vue 组件机械翻译为 React 而不读上下文（store 用法、route 判断、动画时序很容易丢）。
- ❌ 不要在样式里写 Tailwind / styled-components / emotion —— 约定就是 CSS Modules。

---

## 4. 推荐的迁移顺序（参考）

详细规划见 [`MIGRATION.md`](./MIGRATION.md)，这里只给最小提醒：

1. 起 Nextra 骨架（`next.config.js` + `theme.config.tsx`）。
2. 迁移 `lib/site.ts` + 类型定义。
3. 迁移数据层（`lib/posts.ts` / `lib/collections.ts`）。
4. 迁移布局：`<Layout>` → Next.js `_app.tsx` + 路由分发组件。
5. 迁移列表页（首页 / 标签 / 文集）→ 迁移文章页 → 迁移 404。
6. 迁移装饰类组件（Splash / Fireworks / Spine / Music / BGM）。
7. SEO（OG / Twitter / JSON-LD）补齐。
8. 联调 Gitalk、搜索、PDF 下载、目录、置顶等细节。
9. GitHub Actions 切到 Next 静态导出，PR 合并回 main。

---

## 5. 常用命令

```bash
# 当前（VitePress）
pnpm install
pnpm run dev
pnpm run build
pnpm run preview
pnpm run typecheck       # vue-tsc --noEmit

# 迁移到 Nextra 后（预期）
pnpm dev                 # next dev
pnpm build               # next build && next export
pnpm preview             # 本地静态预览
```

---

## 6. 与用户沟通的语气

- 用户为中文母语，回复用中文。
- 用户偏好简洁汇报：先说做了什么、当前状态、下一步建议，少量必要细节，**避免大段流水账**。
- 涉及破坏性操作（删除 `.vitepress/`、清空 `posts/`、强推等）一律先与用户确认。

---

## 7. 维护本文件

- 当迁移阶段产生新约定（例如最终选定的 CSS Modules 命名、Nextra 主题结构、状态库选型），及时回写本文件。
- 当某条约束过期（例如 VitePress 实现已删除），同步删除对应段落，保持本文件可信。
