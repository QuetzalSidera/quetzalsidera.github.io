---
title: quetzalsidera.me 邮箱系统
date: 2026-05-01T00:00:00
tags: [ C#,ASP.NET Core , Next.js ]
pinned: false
collection: 个人项目
outline:
  - title: 这是什么
    slug: 这是什么
  - title: 为什么重构
    slug: 为什么重构
  - title: 支持功能
    slug: 支持功能
  - title: 后面还会继续做什么
    slug: 后面还会继续做什么
head:
  - - meta
    - name: description
      content: 一篇介绍 QuetzalSidera Mail 的个人博客文章，讲清楚它是什么、为什么做，以及它与 quetzalsidera.me 的关系
  - - meta
    - name: keywords
      content: 邮件系统, relay, 临时邮箱, quetzalsidera.me, 个人博客
---

最近把 `quetzalsidera.me` 上的邮件系统正式整理出来了。

也是有自己独立的邮件服务力～😋。

---

# 一、这是什么<a id=这是什么></a>

> 一个围绕个人主邮箱、relay 地址、网页收件箱和可控转发能力搭起来的自用邮件系统。

`QuetzalSidera Mail` 是一个挂在此个人博客体系之下的邮件系统。

它的前身是CloudFlare临时邮件，但最近重构了，现在它有一个明确的名字：**QuetzalSidera Mail**，并且长期提供服务，不再依赖于CloudFlare临时邮件系统。

整体上大部分是使用Codex CLI Vibe出来的。

访问入口：

- Web 前端：[mail.quetzalsidera.me](https://mail.quetzalsidera.me)
- API：[api.mail.quetzalsidera.me](https://api.mail.quetzalsidera.me)
- 主邮箱域名：`@quetzalsidera.me`
- Relay 域名：`@privaterelay.quetzalsidera.me`

但它并不是想和 Gmail、Outlook 这种完整的大型邮件服务正面竞争的产品。

它更像是一个从个人需求出发，逐渐长成体系的工具：

- 我希望有自己的主邮箱
- 我希望 relay 地址是我自己控制，而不是某个平台的黑盒
- ~~我希望拥有无数个个人邮箱地址~~（雾）

# 二、为什么重构<a id=为什么重构></a>

这个系统并不是从零凭空冒出来的。

它的前身，是我之前基于 **Cloudflare** 部署的一套“临时邮件 / 转发邮件”方案，源代码来源于
[cloudflare_temp_email](https://github.com/dreamhunter2333/cloudflare_temp_email)。

但它有几个很现实的限制：

1. 它将邮件登录Key保存在浏览器缓存中，不便于长期管理。
2. 你能申请多个邮箱，但收件箱相互独立，无relay功能。
3. 不能写邮件。
4. 前端很简陋。

于是后来我就决定把它往前再进一步：

- 不只是临时地址
- 不只是简单转发
- 而是做成一个真正属于 `quetzalsidera.me` 体系里的邮件系统

所以你现在看到的 `QuetzalSidera Mail`，是从那套 Cloudflare 临时邮件思路中继续生长出来的下一阶段版本。

# 三、支持功能<a id=支持功能></a>

到目前为止，这个系统已经具备了一套比较完整的基础能力。

### 1. 主邮箱

用户可以申请并使用自己的 `@quetzalsidera.me` 主邮箱。

这意味着它不再只是某个中转地址，而是一个真正可以长期持有、长期使用的邮箱身份。

### 2. Relay 地址

系统支持创建 `@privaterelay.quetzalsidera.me` 的 relay 地址。

这类地址适合：

- 网站注册
- 订阅通知
- 临时活动
- 不希望暴露真实主邮箱的场景

当某个地址开始被滥用时，可以直接停用或删除，而不影响主邮箱本身。

### 3. 网页收件箱

它已经不再只是“外部转发 + 别处查看”。

现在系统本身就提供了网页收件箱，可以：

- 查看来信
- 解析正文
- 下载附件
- 区分主邮箱与 relay 的投递来源

这件事很重要，因为它把“地址管理”和“邮件查看”终于放到了同一个界面里。

### 4. 邮件外发

除了收信，现在也支持以 `@quetzalsidera.me` 地址对外发信。

这意味着它已经不只是一个“收件工具”，而开始具备真正的双向邮件能力。

### 5. 自己控制的部署链路

它的收信、发信、前端、后端和存储现在都是自己可控的：

- 前端：`Next.js`
- 后端：`ASP.NET Core`
- 数据层：`PostgreSQL`
- 反向代理与 HTTPS：`Caddy`

对普通使用者来说，这些技术细节未必重要；但对我自己来说很重要，因为这意味着：

> 这个系统已经不再只是“借了一个现成平台的能力”，而是一个真正独立运转的站点级服务。

# 四、后面还会继续做什么<a id=后面还会继续做什么></a>

虽然现在它已经能用了，但它还远远没有到“完成”的状态。

接下来我比较明确还想继续做的方向有这些：

- 继续提升入站邮件解析质量，尤其是不同服务商 HTML 邮件的兼容性
- 继续优化前端交互，让收件箱更稳定、更顺手
- 让 relay 的创建、停用和筛选体验更成熟
- 补更多部署脚本和恢复脚本，降低维护成本
- 逐渐把它从“自用能跑”推向“结构清晰、可长期维护”

如果再往更长期看，我希望它最终会变成这样一种东西：

> 不是单纯的临时邮箱，也不是传统意义上沉重的企业邮箱，而是一套更适合个人站点、自托管身份与 relay 管理的邮件系统。

对外看，它是一套邮件系统。

对我自己来说，它更像是 `quetzalsidera.me` 这整个个人站点体系继续向前延伸的一部分。

而这，大概才是我真正想做它的原因。
