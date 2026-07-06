# QuetzalSidera Blog

QuetzalSidera 的个人博客项目。项目已从 VitePress 迁移到 **Next.js App Router**，当前生产分支为 `main`，由 Cloudflare Pages Git Integration 自动构建和部署。

## 项目概览

| 维度 | 当前实现 |
|-----|---------|
| 框架 | Next.js App Router |
| UI | React 函数组件 |
| 样式 | CSS Modules + SCSS 主题变量 |
| 内容 | Markdown 文章，保留 frontmatter 与手写 `outline` |
| 渲染 | `next-mdx-remote/rsc` + remark / rehype |
| 评论 | giscus |
| 部署 | Cloudflare Pages，构建命令 `pnpm build`，产物目录 `out/` |

站点内容主要包括个人介绍、技术笔记、项目记录、兴趣整理和博客更新记录。

## 常用命令

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm build
pnpm preview
```

## 目录入口

| 路径 | 内容 |
|-----|------|
| `app/` | Next.js App Router 页面入口 |
| `components/` | React 组件与 CSS Modules |
| `lib/` | 数据读取、SEO、MDX 兼容层、共享类型与站点配置 |
| `styles/` | 全局样式、调色盘与主题变量 |
| `posts/` | 博客文章 |
| `collections/` | 文集索引 |
| `public/` | 静态资源 |
| `docs/AGENT_WRITING.md` | 写作规范 |
| `docs/IMAGE_USAGE.md` | 文章图片引用规范 |
| `AGENT.md` | AI 协作者项目约束 |
| `MIGRATION.md` | VitePress 到 Next.js 的迁移记录 |

## 部署

线上托管在 Cloudflare Pages，项目名 `quetzalsidera-blog`，自定义域名 `quetzalsidera.me`。仓库名 `quetzalsidera.github.io` 仅为历史命名；GitHub Pages 与 GitHub Actions 部署链路已停用。

## 参考

- [协作约束](./AGENT.md)
- [写作规范](./docs/AGENT_WRITING.md)
- [图片引用规范](./docs/IMAGE_USAGE.md)
- [迁移记录](./MIGRATION.md)
