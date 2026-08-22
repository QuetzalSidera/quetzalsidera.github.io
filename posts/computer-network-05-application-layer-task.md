---
title: 应用层习题课
date: 2026-08-17T08:00:00
tags: [ 计算机网络, DNS, FTP, HTTP, 习题 ]
pinned: false
collection: 计算机网络
kind: exercise
exerciseFont: kai
outline:
  - title: 一、DNS
    slug: DNS习题
  - title: 1. 基本概念
    slug: DNS基本概念
    level: 1
  - title: 2. 查询过程
    slug: DNS查询过程
    level: 1
    
  - title: 二、FTP
    slug: FTP习题
  - title: 1. 基本概念
    slug: FTP基本概念
    level: 1
    
  - title: 三、HTTP
    slug: HTTP习题
  - title: 1. 连接模型
    slug: HTTP连接模型
    level: 1
    
  - title: 2. RTT 计算
    slug: HTTP-RTT计算
    level: 1
    
  - title: 四、综合时延
    slug: DNS与HTTP综合时延

head:
  - - meta
    - name: description
      content: 应用层配套习题，辨析 DNS 映射与查询次数、FTP 控制和数据连接，并计算不同 HTTP 连接方式及 DNS 查询下的 RTT 时延。
  - - meta
    - name: keywords
      content: 计算机网络习题, DNS查询, FTP, HTTP持续连接, HTTP流水线, HTTP时延, RTT
---

```ts image-setup
import { path as miscellaneousImagePath } from '@public/Image/Miscellaneous/path'

const dnsHttpDelayTopologyImage = {
  src: miscellaneousImagePath['习题-DNS与Web访问'],
  alt: '局域网中的主机和本地域名服务器连接到 Internet 中的根域名服务器、com 顶级域名服务器、abc.com 权威域名服务器和 Web 服务器',
  align: 'center',
  wrap: false,
  maxHeight: '58rem',
  caption: '题目拓扑：局域网内通信时延忽略，访问 Internet 中任一服务器的 RTT 均为 10 ms',
} as const
```

本文整理应用层配套习题，涉及 DNS、FTP、HTTP 连接模型与 RTT 计算。

---

参考笔记见[应用层](./computer-network-03-application-layer.md)。除题目另有说明外，时延计算均忽略对象传输、处理、排队、丢包与重传。

## 一、DNS{#DNS习题}

### 1. 基本概念{#DNS基本概念}

::::::exercise-set
:::::exercise-group{start="1"}
::::exercise{type="single"}
:::stem
域名与（　）具有一一对应的关系。
:::
:::choices{choice-columns="4"}
- IP 地址
- MAC 地址
- 主机
- 以上都不是
:::
:::answer
D
:::
:::solution

- 一个域名可解析为多个 IP 地址，多个域名也可解析为同一 IP 地址；
- 一个域名可由多台主机提供，一台主机也可绑定多个域名；
- MAC 地址不属于 DNS 的域名映射对象。

因此，域名与前三项均不具有一一对应关系。

> 一个域名可以解析到多个IP地址，一个IP地址也可以对应多个主机（IP任播）
:::
::::
:::::
::::::

### 2. 查询过程{#DNS查询过程}

::::::exercise-set
:::::exercise-group{start="2"}
::::exercise{type="single" source="2016 统考真题"}
:::stem
假设所有域名服务器均采用迭代查询方式进行域名解析。当主机访问规范域名为 `www.abc.xyz.com` 的网站时，本地域名服务器在完成该域名解析的过程中，可能发出
DNS 查询的最少和最多次数分别是（ ）。
:::
:::choices{choice-columns="4"}
- $0, 3$
- $1, 3$
- $0, 4$
- $1, 4$
:::
:::answer
C
:::
:::solution

若本地域名服务器已有可用缓存，则不向其他域名服务器查询：

$$
N_{\min}=0.
$$

缓存全部未命中且各级域名分别委派时，本地域名服务器依次查询：

1. 根域名服务器；
2. `.com` 顶级域名服务器；
3. `xyz.com` 权威域名服务器；
4. `abc.xyz.com` 权威域名服务器。

因此

$$
N_{\max}=4.
$$

题目只统计本地域名服务器向外发出的查询，不计主机发给本地域名服务器的查询，参见[查询链计算](./computer-network-03-application-layer.md#DNS查询链计算)。

> 粗略计算时，本地DNS服务器迭代解析最大次数可视为等于域名标签数
:::
::::
:::::
::::::

## 二、FTP{#FTP习题}

### 1. 基本概念{#FTP基本概念}

::::::exercise-set
:::::exercise-group{start="3"}
::::exercise{type="single" source="2017 统考真题"}
:::stem
下列关于 FTP 的叙述中，错误的是（ ）。
:::
:::choices{choice-columns="1"}
- 数据连接在每次数据传输完毕后就关闭
- 控制连接在整个会话期间保持打开状态
- 服务器与客户端的 TCP 20 端口建立数据连接
- 客户端与服务器的 TCP 21 端口建立控制连接
:::
:::answer
C
:::
:::solution

选项 C 把 TCP/20 同时写成了服务器与客户端端口；即使在主动模式下，也只有服务器使用经典的 TCP/20
作为源端口。参见[控制连接与数据连接](./computer-network-03-application-layer.md#控制连接与数据连接)
和[主动模式与被动模式](./computer-network-03-application-layer.md#主动模式与被动模式)。


> | 连接       | 客户端端口    | 服务器端口         | 生命周期       |
> |----------|----------|---------------|------------|
> | 控制连接     | 临时端口     | TCP/21        | 贯穿 FTP 会话  |
> | 主动模式数据连接 | 客户端协商的端口 | TCP/20 为经典源端口 | 通常每次传输单独建立 |
> | 被动模式数据连接 | 临时端口     | 服务器协商的临时端口    | 通常每次传输单独建立 |
:::
::::
:::::
::::::

## 三、HTTP{#HTTP习题}

### 1. 连接模型{#HTTP连接模型}

::::::exercise-set
:::::exercise-group{start="4"}
::::exercise{type="single"}
:::stem
使用鼠标单击一个万维网文档时，若该文档除有文本外，还有三幅 GIF 图像，则在 HTTP/1.0 中需要建立（ ）次 TCP 连接。
:::
:::choices{choice-columns="4"}
- $4$
- $3$
- $2$
- $1$
:::
:::answer
A
:::
:::solution

按 HTTP/1.0 默认的非持续连接模型，每个对象使用一条 TCP 连接。页面包含一个基础 HTML 对象和三个 GIF 对象，因此

$$
N_{\mathrm{TCP}}=1+3=4.
$$
:::
::::

::::exercise{type="single"}
:::stem
以下关于非持续连接 HTTP 特点的描述中，错误的是（ ）。
:::
:::choices{choice-columns="1"}
- HTTP 支持非持续连接与持续连接
- HTTP/1.0 使用非持续连接，而 HTTP/1.1 默认使用持续连接
- 非持续连接中对每次请求—响应都要建立一次 TCP 连接
- 非持续连接中读取一个包含 $100$ 个图片对象的 Web 页面，需要打开和关闭 $100$ 次 TCP 连接
:::
:::answer
D
:::
:::solution

页面还包含一个基础 HTML 对象，因此对象总数为

$$
1+100=101.
$$

按题设的非持续连接模型，需要打开和关闭 $101$ 次 TCP 连接。选项 B 描述的是协议的默认行为；HTTP/1.0 的历史实现也存在
`Keep-Alive` 扩展。
:::
::::
:::::
::::::

### 2. RTT 计算{#HTTP-RTT计算}

忽略传输时延时，每条新建的非持续连接通常需要 $1\mathrm{RTT}$ 建连和 $1\mathrm{RTT}$ 请求—响应。持续连接流水线可在基础 HTML
到达后连续发送引用对象请求。

::::::exercise-set
:::::exercise-group{start="6"}
::::exercise{type="single"}
:::stem
假设主机通过 HTTP/1.1（流水线方式）请求浏览 Web 服务器 S 上的 Web 页 `rfc.html`。`rfc.html` 引用了同目录下的三个 JPEG
小图像，且只有在收到 `rfc.html` 后才能发送引用图像的请求。一次请求—响应的时间为 $\mathrm{RTT}$，忽略其他时延，不考虑拥塞控制和流量控制。则从发出
HTTP 请求报文开始到收到全部内容为止，所耗费的时间是（ ）。
:::
:::choices{choice-columns="4"}
- $2\mathrm{RTT}$
- $2.5\mathrm{RTT}$
- $4\mathrm{RTT}$
- $4.5\mathrm{RTT}$
:::
:::answer
A
:::
:::solution

计时从发出 HTTP 请求开始，**TCP 连接已经建立**：

1. 第一个 $\mathrm{RTT}$：请求并收到 `rfc.html`；
2. 收到 HTML 后，连续发送三个图像请求；
3. 第二个 $\mathrm{RTT}$：收到三个图像。

因此

$$
T=\mathrm{RTT}_{\mathrm{HTML}}+\mathrm{RTT}_{\mathrm{images}}
=2\mathrm{RTT}.
$$

流水线表示无须等待前一响应即可继续发送请求，不表示多个请求在链路上物理并行。若从建立 TCP
连接开始计时，还需增加 $1\mathrm{RTT}$。
:::
::::

::::exercise{type="single" source="2024 统考真题"}
:::stem
若浏览器不支持并行 TCP 连接，使用非持续的 HTTP/1.0 协议请求浏览一个 Web 页，该页中引用同一网站上的七个小图像文件，则从浏览器为传输
Web 页请求建立 TCP 连接开始，到接收完所有内容为止，所需要的往返时间 RTT 数至少是（ ）。
:::
:::choices{choice-columns="4"}
- $4$
- $9$
- $14$
- $16$
:::
:::answer
D
:::
:::solution

基础 HTML 与七个图像共八个对象。每个对象分别支付

$$
\underbrace{1\mathrm{RTT}}_{\text{TCP 建连}}
+\underbrace{1\mathrm{RTT}}_{\text{HTTP 请求—响应}}
=2\mathrm{RTT}.
$$

浏览器不支持并行 TCP 连接，八个对象只能串行获取：

$$
T_{\min}=8\times2\mathrm{RTT}=16\mathrm{RTT}.
$$

这里的“至少”只统计 RTT 组成，未计入对象传输时延。
:::
::::
:::::
::::::

## 四、综合时延{#DNS与HTTP综合时延}

::::::exercise-set
:::::exercise-group{start="8"}
::::exercise{type="single"}
:::stem
主机通过超链接 `http://www.cskaoyan.com/index.html` 请求浏览 Web 页 `index.html`，浏览器使用流水线方式的 HTTP/1.1 协议。该
Web 页引用同一网站上的七个小图像文件。假设主机到本地域名服务器和互联网上各服务器的往返时延均为 $1\mathrm{RTT}$
；本地域名服务器只提供递归查询服务，其他域名服务器只提供迭代查询服务。忽略其他时延，则从点击超链接开始到浏览器接收到所有内容为止，所需的
RTT 数最多是（ ）。
:::
:::choices{choice-columns="4"}
- $5$
- $6$
- $7$
- $8$
:::
:::answer
C
:::
:::solution

缓存全部未命中时，DNS 阶段包括：

$$
\underbrace{1\mathrm{RTT}}_{\text{主机与本地域名服务器}}
+\underbrace{3\mathrm{RTT}}_{\text{根、.com 顶级、权威服务器}}
=4\mathrm{RTT}.
$$

HTTP/1.1 持续连接流水线阶段包括：

$$
\underbrace{1\mathrm{RTT}}_{\text{TCP 建连}}
+\underbrace{1\mathrm{RTT}}_{\text{基础 HTML}}
+\underbrace{1\mathrm{RTT}}_{\text{流水线请求七个图像}}
=3\mathrm{RTT}.
$$

所以

$$
T_{\max}=4\mathrm{RTT}+3\mathrm{RTT}=7\mathrm{RTT}.
$$

七个请求是在同一连接上连续发送，而不是同时占用链路。
:::
::::

::::exercise{type="single" source="2020 统考真题" keep-together="false"}
:::stem
假设下图网络中的本地域名服务器只提供递归查询服务，其他域名服务器都只提供迭代查询服务。局域网内主机访问 Internet
上各服务器的往返时间均为 $10\mathrm{ms}$，忽略其他时延。若主机 H 通过超链接 `http://www.abc.com/index.html` 请求浏览纯文本
Web 页 `index.html`，则从单击超链接开始到浏览器接收到页面为止，所需的最短时间与最长时间分别是（ ）。

<Image {...dnsHttpDelayTopologyImage} />
:::
:::choices{choice-columns="2"}
- $10\mathrm{ms},\ 40\mathrm{ms}$
- $10\mathrm{ms},\ 50\mathrm{ms}$
- $20\mathrm{ms},\ 40\mathrm{ms}$
- $20\mathrm{ms},\ 50\mathrm{ms}$
:::
:::answer
D
:::
:::solution

最短情况下已有可用 DNS 缓存，不访问 Internet 上的 DNS 服务器。TCP 建连和 HTTP 请求—响应各需一个 RTT：

$$
T_{\min}=2\mathrm{RTT}=20\mathrm{ms}.
$$

最长情况下缓存全部未命中。本地域名服务器依次访问根域名服务器、`.com` 顶级域名服务器和 `abc.com` 权威域名服务器：

$$
T_{\mathrm{DNS,max}}=3\mathrm{RTT}=30\mathrm{ms}.
$$

取得地址后，再以 $2\mathrm{RTT}$ 建连并获取页面：

$$
T_{\max}=3\mathrm{RTT}+2\mathrm{RTT}
=5\mathrm{RTT}=50\mathrm{ms}.
$$

题目忽略主机与本地域名服务器之间的局域网时延，因此该段不计入最短或最长时间。
:::
::::
:::::
::::::
