---
title: 从 GitHub 到 Cloudflare
date: 2026-05-21T00:00:00
tags: [ Cloudflare, GitHub, VitePress, 博客 ]
pinned: false
collection: 个人博客的更新记录
outline:
  - title: 概要
    slug: 概要
  - title: 迁移目的
    slug: 迁移目的
  - title: 迁移方案
    slug: 迁移方案
  - title: 迁移后变化
    slug: 迁移后变化
  - title: 困难
    slug: 困难
head:
  - - meta
    - name: description
      content: 记录个人博客从 GitHub Pages + 阿里云 DNS 迁移到 Cloudflare Pages + Cloudflare DNS 的过程、原因与方案
  - - meta
    - name: keywords
      content: Cloudflare Pages, GitHub Actions, VitePress, 博客迁移, DNS, CDN, 个人博客
---

记录个人博客从 GitHub Pages + 阿里云 DNS 迁移到 Cloudflare Pages + Cloudflare DNS 的过程、原因与方案。

---

<script setup lang="ts">
import Image from '../.vitepress/theme/components/shared/Image.vue'
import { path as miscellaneousImagePath } from '@Miscellaneous/path'

const dnsImage = {
  src: miscellaneousImagePath.dns,
  alt: 'Cloudflare',
  align: 'right',
  wrap: true,
  maxHeight: '16rem',
  caption: 'Cloudflare DNS迁移',
} as const

const aliyunImage = {
  src: miscellaneousImagePath.aliyun,
  alt: '阿里云',
  align: 'right',
  wrap: true,
  maxHeight: '16rem',
  caption: '原有的阿里云DNS',
} as const

const customDomainImage = {
  src: miscellaneousImagePath['custom-domain'],
  alt: '自定义域',
  align: 'right',
  wrap: true,
  maxHeight: '16rem',
  caption: 'Cloudflare自定义域配置',
} as const

const commitImage = {
  src: miscellaneousImagePath.commit,
  alt: 'Cloudflare',
  align: 'right',
  wrap: true,
  maxHeight: '16rem',
  caption: 'Github Commit',
} as const
</script>

这个博客之前一直跑在 GitHub Pages 上，DNS 挂在阿里云。最近终于把整条链路迁到了 Cloudflare Pages。
终于不用赤来回配置DNS的石了...

## 一、概要<a id=概要></a>

> 把个人博客从 GitHub Pages + 阿里云 DNS 的混杂链路，整体迁移到 Cloudflare Pages + Cloudflare DNS 的一次记录。

这个博客基于 VitePress 构建，之前：

- **代码仓库**在 GitHub
- **构建和部署**走 GitHub Actions → GitHub Pages
- **域名 DNS**在阿里云解析

现在变成了：

- **代码仓库**仍在 GitHub（不需要迁移）
- **DNS 解析**迁移到 Cloudflare DNS
- **构建**由 GitHub Actions 完成，**部署**通过 Github Action + Wrangler 直接推到 Cloudflare Pages

构建工具、文章内容和仓库本身没有任何变化。与此同时，由于需要保留域名备案，所以网站还是得悬挂ICP备案号。

## 二、迁移目的<a id=迁移目的></a>

### GitHub Pages 自定义域的碎片化配置

之前的方案维护体验很差：

**1. 域名配置分散在两个平台**

自定义域需要在 GitHub 仓库设置里配一次，再到阿里云 DNS 控制台配一次。每次改域名相关的东西，都要两边来回确认，而且DNS还有的生效时间，总之就是很赤石...

**2. 没有 CDN，国内访问速度不稳定**

GitHub Pages 本身没有 CDN 层，静态资源直连 GitHub 的服务器。对国内访问来说，速度和可用性都不理想。

DNS、CDN、部署目标分散在多个不同的平台，平时写文章还好，但一旦DNS出问题就是来回好几个小时。

迁移到 Cloudflare Pages，把DNS、CDN和部署目标全放在到同一个平台，解决DNS来回配置与等待生效的问题。

## 三、迁移方案<a id=迁移方案></a>

迁移的总体原则是：**文章和仓库不动，只换部署目标和 DNS**。

### 1. DNS 服务器迁移

将域名 `quetzalsidera.me` 的 DNS 解析从阿里云迁出，迁移到 Cloudflare DNS。

Cloudflare 提供了自动扫描和导入已有 DNS 记录的功能(确实太方便了，考虑到有二十几条记录...)，迁移过程中已有的解析记录不会丢失。迁移完成后，阿里云侧的
DNS 服务就可以完全关掉。

<Image v-bind="dnsImage" />
<Image v-bind="aliyunImage" />

### 2. 部署链路调整

旧的部署链路分两个 Job：

**build 阶段：**

```
Checkout → Setup pnpm/Node.js → Install 依赖 → VitePress 构建 → upload-pages-artifact
```

**deploy 阶段：**

```
等待 build 完成 → actions/deploy-pages@v4 → 部署到 GitHub Pages
```

新的部署链路合并为单个 Job：

```
GitHub Actions → pnpm build → wrangler pages deploy → Cloudflare Pages
```

此外，认证通过 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID` 两个 GitHub Repository Secrets 完成，不需要额外登录步骤。

### 3. 自定义域配置

在 Cloudflare Pages 项目设置中添加自定义域 `quetzalsidera.me`。由于 DNS 已经在 Cloudflare 上，域名验证和 SSL
证书的签发是全自动的，不需要手动创建 CNAME 记录或等待证书审批，比Github Page轻松了不知道多少。

<Image v-bind="customDomainImage" />

## 四、迁移后变化<a id=迁移后变化></a>

| 维度       | 迁移前                       | 迁移后               |
|----------|---------------------------|-------------------|
| DNS 管理   | 阿里云                       | Cloudflare DNS    |
| 部署目标     | GitHub Pages              | Cloudflare Pages  |
| CDN      | 无                         | Cloudflare 全球 CDN |
| SSL 证书   | GitHub Pages 自动管理         | Cloudflare 自动管理   |
| 自定义域配置   | GitHub + 阿里云两处配置          | Cloudflare 单平台配置  |
| Workflow | Github Action + push main | 不变                |

几个值得单独提的变化：

**访问速度**

Cloudflare 的 CDN 节点在国内有覆盖，静态资源命中 CDN 缓存之后，响应速度比直连 GitHub Pages 服务器有明显改善。

**统一的控制面**

域名、DNS、CDN、部署全部在 Cloudflare 一个平台上管理。不管是排查问题还是调整配置，不再需要在 GitHub 和阿里云之间来回切换。

**部署流程依旧简洁**

新旧方案均使用Github Action，推送主分支时部署，博客随写随发布。

## 五、困难<a id=困难></a>

<Image v-bind="commitImage" />


迁移大概做了半下午时间，参考了一些[教程](https://vitepress.dev/zh/guide/deploy)，感觉还是有些磕磕绊绊的，很多部署的环境问题本地没法验证，导致做了不少的fix提交。

遇到的问题包括但不限于：

**1. gitalk <link>标签阻塞**

原有的gitalk组件使用 `<link>` 标签通过CDN的方式引入，本地测试（在`localhost`上）正常，推送部署后（在`quetzalsidra.me`上）出现
`Head-of-line blocking`，即浏览器网络请求一直卡在等待gitalk CDN响应的状态。将gitalk改为本地安装后解决。

参见[fix: gitalk问题的修复](https://github.com/QuetzalSidera/quetzalsidera.github.io/commit/8e37e96f20cc072b14ae90d42cd94839884938e3)

**2. site.ts中填写的根路径 `/` 被转移为` //` 导致页面导航失效**

这个问题应该是本地可以解决的，但是因为过了`pnpm build`，没有过多注意，导致部署完成后才发现导航栏链接出问题了。

参见[fix: 导航问题的修复](https://github.com/QuetzalSidera/quetzalsidera.github.io/commit/3fafd90dede9432322a63138557b460ed620a559)

**3. workflow.yaml与package.json中的pnpm版本冲突问题**

`workflow.yaml`是GPT帮忙写的，为了从之前的Github Page部署平稳过渡，在`package.json`中添加了
`"packageManager": "pnpm@9.0.0"`来控制pnpm版本。
但是workflow.yaml中也有一个pnpm@9.0.0版本，导致Github Action执行失败了。

参见[fix: pnpm版本问题的修复](https://github.com/QuetzalSidera/quetzalsidera.github.io/commit/5cadeab157ad50c2b06a0b7ce90b3a968fe06b66)

**4. wrangler依赖缺失问题**

最后一次失败，缺失依赖，安装完就行了。

参见[fix: 修复wrangler依赖缺失问题](https://github.com/QuetzalSidera/quetzalsidera.github.io/commit/9cae03f7fd3e52ff37d61c4f0c5fc93f5f727533)

