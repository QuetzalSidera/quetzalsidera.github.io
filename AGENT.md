# AGENT.md

写给在本仓库工作的 AI 协作者（Claude Code、其他 Agent 等）。
本仓库已从 **VitePress** 迁移到 **Next.js App Router**。当前分支仍是 `react-migration`，收尾后合并回 `main` 触发生产部署。

---

## 0. 高优先约束（必读）

1. **分支**：迁移收尾阶段的所有改动（无论代码、文档、配置）一律在 `react-migration` 分支提交。
   - 在执行任何写操作前先确认 `git branch --show-current` 为 `react-migration`，若不是，先 `git checkout react-migration`。
   - 合并回 `main` 后由 Cloudflare Pages 触发生产部署。
2. **技术栈**：当前实现是 **Next.js App Router + React + CSS Modules**。
   - 不再使用 Vue 3、Vue SFC、`<script setup>`、Less、内联 `<style scoped>`。
   - 不使用全局内联样式或 styled-jsx；组件样式统一走 `*.module.css`，全局调色盘与主题变量在 `styles/globals.scss` / `styles/_theme.scss`。
   - 状态管理用多个 React Context。
   - 主题切换沿用站点自定义 runtime，亮 / 暗 token 仍走 `html[theme=...]`。
   - 数学公式用 **rehype-katex**；代码高亮主题保留 `solarized-dark`。
   - 部署形态：`output: 'export'` 静态导出。
3. **用户明确要求：迁移只动框架与技术架构，不改其他任何行为**。
   - 视觉、交互、动画时长、字体、文章内容、frontmatter、链接结构尽量保持一致。
   - 装饰类组件（Splash / Fireworks / Spine / BGM）**全量保留**。
   - 旧 `.html` 链接通过 `public/_redirects` 兜底（Cloudflare Pages 原生支持）。
4. **唯一例外**：评论系统从 Gitalk 切换到 **giscus**（已征得同意，因 Gitalk 不能直接复用其前端 `clientSecret`，且 giscus 是 React 原生体验更顺）。
5. **不破坏现有内容**：`posts/` 下的 Markdown 内容是用户长期资产，迁移过程中不得擅自重写文章正文、frontmatter 字段或目录结构。
6. **写之前先看**：迁移后的 React 组件已有对应实现，先读再写，不要凭旧 Vue 结构臆测。
7. **main 分支冻结**：收尾阶段所有提交（包括文章 hotfix）都走 `react-migration`，再 PR 回 `main`。

---

## 1. 仓库一图入门

```
quetzalsidera.github.io/
├─ app/                        # Next.js App Router 页面入口
├─ components/                 # React 组件与 CSS Modules
│  ├─ comments/                # giscus 评论
│  ├─ collections/             # 文集 banner
│  ├─ fx/                      # Splash / Fireworks / Spine
│  ├─ home/                    # BannerHero / WelcomeBox
│  ├─ layout/                  # Navbar / Footer / BannerMessages
│  ├─ posts/                   # PostList / PostViewer / PostSideList / ...
│  └─ shared/                  # 通用展示组件
├─ lib/                        # 数据读取、SEO、MDX 兼容层、共享类型与站点配置
├─ styles/                     # 全局样式、调色盘、主题 mixin、iconfont 兼容
├─ posts/                      # 博客文章
├─ collections/                # 文集索引 Markdown
├─ tags/                       # 标签入口（保留）
├─ public/                     # 静态资源
├─ ignore/                     # 不入构建的草稿
├─ package.json                # Next.js / React / remark / rehype / giscus 等当前依赖
├─ MIGRATION.md                # 迁移记录与测试矩阵
└─ README.md

# 注意：仓库内已无 .github/ 目录。部署由 Cloudflare Pages Git Integration 直接监听 main 分支，
# 构建命令与产物目录都在 Cloudflare 控制台配置。不要再往仓库里加 GitHub Actions workflow。
```

---

## 2. 数据流（Next.js 现状）

- **文章数据**：`lib/posts.ts`
  - 用 `gray-matter` 读取 `posts/*.md` 的 frontmatter + 摘要 + 字数。
  - 输出 `Post[]`，按 `pinned` + `create` 排序。
  - App Router 的 `generateStaticParams` / 静态导出在构建期消费。
- **文集数据**：`lib/collections.ts`
  - 类似上面，读取 `collections/*.md`。
- **Markdown 兼容层**：`lib/mdx.ts`
  - 解析 ```` ```ts image-setup ```` 中的图片路径对象，改写 `<Image {...imageConfig} />`。
  - 兼容旧标题锚点、KaTeX、代码块和 Markdown 图片属性。
- **路由入口**：
  - `/` → `app/page.tsx`
  - `/tags/` → `app/tags/page.tsx`
  - `/collections/` → `app/collections/page.tsx`
  - `/collections/<slug>/` → `app/collections/[slug]/page.tsx`
  - `/posts/<slug>/` → `app/posts/[slug]/page.tsx`
- **运行时状态**：React Context 拆分管理主题、菜单、Splash、BannerMessages 等交互状态。

---

## 3. 工作约定

### 3.1 提交位置

- 写代码 / 写文档前，先：

  ```bash
  git branch --show-current   # 必须 react-migration
  ```

  如果不是，`git checkout react-migration` 后再动手。

- 与收尾无关的修复（如错别字、图片替换）也走 `react-migration`；待收尾完成统一 PR 回 `main`。

### 3.2 文件层面

- **新组件**：使用函数式 React + CSS Modules，沿用现有组件目录与命名。
- **不要引回旧链路**：不要新增 `.vue`、Less、VitePress 配置或 `vp:*` 脚本。
- **样式**：
  - 调色盘和主题变量集中在 `styles/globals.scss` / `styles/_theme.scss`。
  - 模块内只写局部样式；全局重置走 `app/layout.tsx` 引入的全局样式。
- **TypeScript**：严格类型，沿用 `lib/types.ts` 中的 `BlogThemeConfig`、`Post`、`CollectionData` 等接口。

### 3.3 内容兼容性

- `posts/*.md` 不重命名、不批量重排 frontmatter。
- 数学公式、代码高亮主题（`solarized-dark`）、旧图片属性和 fancybox 行为由 remark / rehype / 自定义兼容层承接。
- `outline` 字段是手写目录，目录组件优先兼容它，再回退到自动生成。
- `<Image {...imageConfig} />` 依赖 ```` ```ts image-setup ```` 中的 `@public/Image/.../path` 路径对象；不要删这些路径对象导入，除非同步改写图片内容。

### 3.4 不要做的事

- ❌ 不要直接 `git checkout main` 或往 main 推。
- ❌ 不要批量改 `posts/` 内容（即便只是空格 / 换行 / 字段重排）。
- ❌ 不要重新引入 `.vitepress/`、Vue、Less、wrangler 或 GitHub Actions 部署链路。
- ❌ 不要在样式里写 Tailwind / styled-components / emotion —— 约定就是 CSS Modules。

---

## 4. 收尾顺序（参考）

详细记录见 [`MIGRATION.md`](./MIGRATION.md)，这里只给最小提醒：

1. 每次改动前先确认工作树，不要覆盖用户未提交改动。
2. 变更后至少跑 `pnpm typecheck`；涉及构建、路由、Markdown、图片或依赖时跑 `pnpm build`。
3. 涉及文章兼容层时，检查导出产物里没有 `@@LEGACY_IMAGE`、`图片引用暂未迁移` 等占位。
4. 收尾完成后 PR `react-migration` → `main`，由 Cloudflare 自动触发生产部署；合并后做线上冒烟测试。

## 4.1 部署提醒

- 线上是 **Cloudflare Pages**（不是 GitHub Pages），仓库名 `quetzalsidera.github.io` 是历史命名。
- 接入方式：**Cloudflare Pages Git Integration** —— Cloudflare 在自己后台监听本仓库 `main` 分支的推送并自动构建。
- 仓库内 **没有** CI 配置文件（`.github/` 已删除）；不要再添加 GitHub Actions workflow。
- 构建命令、Node 版本、产物目录、环境变量全部在 Cloudflare Pages **控制台**配置，本地仓库不可见。
- 当前控制台配置：构建 `pnpm build`，产物目录 `out/`。
- `react-migration` 分支不会触发生产部署；若需要预览链接，请在 Cloudflare 控制台把它加为 preview branch。

---

## 5. 常用命令

```bash
pnpm install
pnpm dev                 # next dev
pnpm build               # next build，静态导出到 out/
pnpm preview             # 本地静态预览 out/
pnpm typecheck           # tsc --noEmit
```

---

## 6. 与用户沟通的语气

- 用户为中文母语，回复用中文。
- 用户偏好简洁汇报：先说做了什么、当前状态、下一步建议，少量必要细节，**避免大段流水账**。
- 涉及破坏性操作（清空 `posts/`、强推等）一律先与用户确认。

---

## 7. 维护本文件

- 当项目约定变化（例如主题变量、状态 Context、部署配置），及时回写本文件。
- 当某条约束过期（例如 VitePress 实现已删除），同步删除对应段落，保持本文件可信。
