# AGENT.md

写给在本仓库工作的 AI 协作者。当前仓库已经完成 VitePress 到 Next.js App Router 的迁移，`main` 分支承载生产版本。

## 1. 当前状态

- 技术栈：Next.js App Router + React + CSS Modules + SCSS 主题变量。
- 内容来源：`posts/`、`collections/`、`public/`。
- 部署方式：Cloudflare Pages Git Integration 监听 `main`，构建命令 `pnpm build`，产物目录 `out/`。
- 迁移分支 `react-migration` 已结束，不再作为默认工作分支。
- `.vitepress/`、Vue、Less、GitHub Actions 部署链路已经移除，不要重新引入。

## 2. 文档入口

| 文档 | 用途 |
|-----|------|
| `README.md` | 仓库介绍 |
| `docs/AGENT_WRITING.md` | AI 写作与文章结构规范 |
| `docs/IMAGE_USAGE.md` | 文章图片引用规范 |
| `MIGRATION.md` | 迁移过程、测试矩阵与历史决策 |

`ignore/` 目录不进入 Git 管理，不作为长期协作规范来源。需要长期保留的约定应写入 `docs/` 或根目录文档。

## 3. 工作约束

- 写入前先查看工作区状态，避免覆盖用户未提交内容。
- 除非用户明确要求，不要推送、提交、重置、清空或批量删除文件。
- 不要批量重排 `posts/` 的 frontmatter、正文换行或标题结构。
- 新组件使用函数式 React；样式使用 CSS Modules，文件名沿用 `*.module.css` 或现有 SCSS 全局入口。
- 全局调色盘与主题变量集中在 `styles/globals.scss` 和 `styles/_theme.scss`。
- 状态管理沿用现有 React Context，不为单点需求引入新的状态库。
- 数学公式由 `remark-math` / `rehype-katex` 处理，代码高亮主题保留 `solarized-dark`。
- 旧 `.html` 链接由 `public/_redirects` 兜底，不要为它新增动态服务端逻辑。

## 4. 内容规范

- 写文章前先读 `docs/AGENT_WRITING.md`。
- 写或修改文章图片前先读 `docs/IMAGE_USAGE.md`。
- 文章图片标准写法为 ```` ```ts image-setup ```` + `<Image {...imageConfig} />`。
- 不要新增 `<Image v-bind="...">`、`<script setup>`、`.vue` 组件导入或 `.vitepress` 路径。
- `outline` 是手写目录字段，修改正文标题时要同步检查 `outline`。
- 文章里的 `head` frontmatter 仍由 `lib/seo.ts` 转换为 Next metadata。

## 5. 常用检查

```bash
pnpm typecheck
pnpm check:post-images
pnpm build
```

检查选择：

- 只改文档：至少运行 `git diff --check`。
- 改文章或图片：运行 `pnpm check:post-images`，必要时运行 `pnpm typecheck`。
- 改路由、MDX、组件、依赖或部署相关配置：运行 `pnpm build`。

涉及文章兼容层时，构建后应确认导出产物中没有 `@@LEGACY_IMAGE`、`图片引用暂未迁移`、旧 Vue `v-bind` 等残留。

## 6. 沟通约定

- 默认使用中文回复。
- 汇报时先说修改结果、验证状态，再补必要细节。
- 发现无关未提交变更时，只说明受影响范围，不擅自回滚。
