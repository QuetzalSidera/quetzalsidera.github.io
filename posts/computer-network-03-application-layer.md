---
title: 应用层
date: 2026-08-16T14:00:00
tags: [ 计算机网络, DNS, HTTP ]
pinned: false
collection: 计算机网络
outline:
  - title: 0. 网络应用
    slug: 网络应用体系结构
  - title: 0.1 客户—服务器
    slug: 客户服务器体系结构
    level: 1
  - title: 0.2 P2P
    slug: P2P体系结构
    level: 1

  - title: 1. DNS
    slug: 域名系统DNS
  - title: 1.1 域名空间与区
    slug: 域名空间与区
    level: 1
  - title: 1.2 服务器层次
    slug: 域名服务器的层次
    level: 1
  - title: 1.3 资源记录
    slug: 资源记录
    level: 1
  - title: 1.4 解析过程
    slug: 域名解析过程
    level: 1
  - title: 1.4.1 冷缓存查询
    slug: 冷缓存查询
    level: 2
  - title: 1.4.2 递归与迭代查询
    slug: 递归查询与迭代查询
    level: 2
  - title: 1.5 缓存
    slug: DNS缓存
    level: 1
  - title: 1.6 传输与报文
    slug: DNS传输协议与报文
    level: 1
  - title: 1.6.1 传输协议
    slug: DNS传输协议
    level: 2
  - title: 1.6.2 报文格式
    slug: DNS报文格式
    level: 2
  - title: 1.7 查询时延
    slug: DNS查询时延
    level: 1
  - title: 1.7.1 时延模型
    slug: DNS时延模型
    level: 2
  - title: 1.7.2 查询链计算
    slug: DNS查询链计算
    level: 2

  - title: 2. FTP
    slug: 文件传输协议FTP
  - title: 2.1 控制与数据连接
    slug: 控制连接与数据连接
    level: 1
  - title: 2.2 传输过程
    slug: 文件传输过程
    level: 1
  - title: 2.3 主动与被动模式
    slug: 主动模式与被动模式
    level: 1

  - title: 3. 电子邮件
    slug: 电子邮件
  - title: 3.1 组成与投递
    slug: 系统组成与投递过程
    level: 1
  - title: 3.2 SMTP
    slug: SMTP
    level: 1
  - title: 3.3 格式与 MIME
    slug: 邮件格式与MIME
    level: 1
  - title: 3.4 POP3 与 IMAP
    slug: POP3与IMAP
    level: 1
  - title: 4. Web 与 URI
    slug: 万维网与资源标识
  - title: 4.1 URI、URL 与 URN
    slug: URI-URL与URN
    level: 1
  - title: 4.2 URI 组成
    slug: URI的组成
    level: 1

  - title: 5. HTTP
    slug: 超文本传输协议HTTP
  - title: 5.1 请求—响应
    slug: HTTP请求响应过程
    level: 1
  - title: 5.2 报文
    slug: HTTP报文
    level: 1
  - title: 5.2.1 请求报文
    slug: HTTP请求报文
    level: 2
  - title: 5.2.2 响应报文
    slug: HTTP响应报文
    level: 2
  - title: 5.3 请求方法
    slug: HTTP请求方法
    level: 1
  - title: 5.4 状态码
    slug: HTTP状态码
    level: 1
  - title: 5.5 常见首部
    slug: 常见首部
    level: 1
  - title: 5.6 连接、流水线与复用
    slug: 连接复用流水线与多路复用
    level: 1
  - title: 5.7 时延分析
    slug: HTTP时延分析
    level: 1
  - title: 5.7.1 组成与假设
    slug: HTTP时延组成与假设
    level: 2
  - title: 5.7.2 非持续连接
    slug: 非持续连接串行与并行
    level: 2
  - title: 5.7.3 持续连接
    slug: 持续连接时延
    level: 2
  - title: 5.7.4 综合计算
    slug: HTTP综合时延
    level: 2

  - title: 6. 默认端口
    slug: 默认端口
  - title: 7. 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 计算机网络应用层笔记，整理 C/S 与 P2P 体系结构，以及 DNS、FTP、电子邮件、Web 与 HTTP 的对象关系、协议过程、默认端口和时延计算。
  - - meta
    - name: keywords
      content: 计算机网络, 应用层, C/S, P2P, DNS, FTP, SMTP, IMAP, POP3, Web, URI, URL, HTTP, HTTP时延
---

```ts image-setup
import { path as miscellaneousImagePath } from '@public/Image/Miscellaneous/path'

const clientServerModelImage = {
  src: miscellaneousImagePath['C:S模型'],
  alt: '多台客户端主机分别与一台中心服务器通信',
  align: 'right',
  wrap: false,
  maxHeight: '16rem',
  caption: '客户—服务器模型',
} as const

const peerToPeerModelImage = {
  src: miscellaneousImagePath['P2P模型'],
  alt: '多台对等主机彼此直接连接并交换数据',
  align: 'right',
  wrap: false,
  maxHeight: '16rem',
  caption: 'P2P 模型',
} as const

const dnsServerTypesImage = {
  src: miscellaneousImagePath['各种DNS服务器'],
  alt: '请求主机经本地域名服务器依次查询根服务器、TLD 服务器和权威域名服务器',
  align: 'right',
  wrap: true,
  maxHeight: '20rem',
  caption: '根服务器、TLD 服务器、权威域名服务器与本地域名服务器的查询关系',
} as const

const dnsQueryModesImage = {
  src: miscellaneousImagePath['迭代查询与递归查询'],
  alt: '本地域名服务器采用递归查询和迭代查询时的报文路径对比',
  align: 'center',
  wrap: false,
  maxHeight: '18rem',
  caption: '递归查询与迭代查询',
} as const

const emailDeliveryFlowImage = {
  src: miscellaneousImagePath['电子邮件完整链路'],
  alt: '邮件从发件人用户代理经提交、传输、投递和访问代理到达收件人用户代理',
  align: 'center',
  wrap: false,
  maxHeight: '24rem',
  caption: '电子邮件从提交、中继、投递到访问的完整链路',
} as const

const httpNonPersistentSerialTimelineImage = {
  src: miscellaneousImagePath['HTTP时延-非持续串行'],
  alt: '客户端获取基础 HTML 后，为每个引用对象重新建立 TCP 连接并依次传输',
  align: 'right',
  wrap: false,
  maxHeight: '42rem',
  caption: '非持续连接串行获取基础 HTML 与引用对象的时序',
} as const

const httpNonPersistentParallelTimelineImage = {
  src: miscellaneousImagePath['HTTP时延-非持续并行'],
  alt: '客户端获取基础 HTML 后，以至多 K 条新 TCP 连接按固定批次并行获取引用对象',
  align: 'right',
  wrap: false,
  maxHeight: '42rem',
  caption: '非持续连接以至多 K 条连接分批获取引用对象的时序',
} as const

const httpPersistentNonPipelineTimelineImage = {
  src: miscellaneousImagePath['HTTP时延-持续非流水线'],
  alt: '客户端只建立一条 TCP 连接，等待前一对象完整到达后再请求下一个对象',
  align: 'right',
  wrap: false,
  maxHeight: '42rem',
  caption: '持续连接以非流水线方式依次获取对象的时序',
} as const

const httpPersistentPipelineTimelineImage = {
  src: miscellaneousImagePath['HTTP时延-持续流水线'],
  alt: 'HTTP 1.1 流水线连续发送请求，各对象的首字节箭头与数据阴影按响应顺序排列',
  align: 'right',
  wrap: false,
  maxHeight: '42rem',
  caption: 'HTTP/1.1 流水线连续发送请求并按序发送完整响应',
} as const


const httpPersistentPipelineTimelineImage_Center = {
  src: miscellaneousImagePath['HTTP时延-持续流水线'],
  alt: 'HTTP 1.1 流水线连续发送请求，各对象的首字节箭头与数据阴影按响应顺序排列',
  align: 'center',
  wrap: false,
  maxHeight: '42rem',
  caption: 'HTTP/1.1 流水线连续发送请求并按序发送完整响应',
} as const


const http2MultiplexingTimelineImage = {
  src: miscellaneousImagePath['HTTP时延-HTTP2分帧'],
  alt: 'HTTP 2 将不同对象映射到多个流，首字节箭头汇合，数据帧合并为总面积不变的分色阴影',
  align: 'center',
  wrap: false,
  maxHeight: '42rem',
  caption: 'HTTP/2 将多个流的首字节箭头与数据帧合并交错',
} as const
```

本文讨论了 4 种最具代表性的应用层协议——DNS、FTP、SMTP 与
HTTP，并深入探讨了DNS与HTTP的时延，与此同时介绍了HTTP/1.1、HTTP/2与HTTP/3中引入的流水线，分帧与QUIC。

---

应用层协议规定应用进程间报文的格式、语义与交换顺序，并依赖传输层完成进程间通信。

:::mindmap{title="应用层知识结构" height="28rem" print-height="82mm" interactive="true"}
- 应用层
  - 网络应用体系结构
    - 客户—服务器
    - P2P
  - DNS
    - 域名空间与区
    - 域名服务器层次
    - 资源记录
    - 解析、缓存与时延
  - FTP
    - 控制连接
    - 数据连接
    - 主动与被动模式
  - 电子邮件
    - SMTP
      - 提交与中继
    - 邮件格式与 MIME
    - POP3 与 IMAP
      - 邮件访问
  - Web 与 HTTP
    - URI
      - 标识资源
    - 请求—响应与报文
    - 连接复用、流水线与多路复用
    - 时延分析
:::

## 0. 网络应用体系结构{#网络应用体系结构}

两种基本体系结构：客户—服务器（C/S）和对等（P2P）；实际系统可混合使用。

### 0.1 客户—服务器体系结构{#客户服务器体系结构}

::::flow{mode="float" side="right" media-width="38%" min-text-width="24rem" print="block"}
:::media
<Image {...clientServerModelImage} />
:::
:::body

**组成**：服务器通常持续运行，并具有稳定的可定位地址；客户端按需发起请求，客户端之间通常不直接通信。

**优点**：服务状态、权限和数据集中管理。

**缺点**：服务器的计算能力和出口带宽可能成为瓶颈；服务器故障可能影响全部客户端。

**扩展方式**：使用服务器集群、负载均衡和 CDN 扩展容量与可用性。
:::
::::

### 0.2 P2P 体系结构{#P2P体系结构}

::::flow{mode="float" side="right" media-width="38%" min-text-width="24rem" print="block"}
:::media
<Image {...peerToPeerModelImage} />
:::
:::body

**组成**：纯 P2P 无固定中心服务器；对等方既请求资源，也提供资源。

**优点**：节点可贡献带宽、存储和计算能力，具有自扩展性。

**缺点**：节点发现、动态上下线、地址变化、NAT 穿透和安全管理较复杂。

**混合结构**：中心服务负责索引或节点发现，对等方直接交换数据。
:::
::::

## 1. 域名系统 DNS{#域名系统DNS}

域名系统（Domain Name System，DNS）是分布式命名系统，由**域名空间**、**域名服务器**和**解析器**组成。
DNS 以 **资源记录** 的形式保存域名及其地址（A/AAAA 记录）、别名（CNAME 记录）、邮件服务器（MX 记录）和权威服务器（NS 记录）等信息。

> 权威域名服务器是存储特定域名资源记录的最终数据源

### 1.1 域名空间与区{#域名空间与区}

域名空间是所有域名按层级组成的树，根节点记为 `.`，域名、域和区的关系如下：

| 概念 | 含义                         |
|----|----------------------------|
| 域名 | 从目标节点到根路径上的标签序列，按“具体到一般”书写 |
| 域  | 域名空间中以某个节点为根的子树            |
| 区  | 由权威域名服务器管理的一段连续域名空间        |

> **域名**是域名空间的元素，**域**是域名空间的某个层级，**区**是权威域名服务器负责的域名空间

```text
www.example.com.
│   │       │ └─ 根域 root = .
│   │       └─── 顶级域 root = com.
│   └─────────── 二级（子）域 root = example.com.
└─────────────── 域名 www.example.com
```

完全限定域名（Fully Qualified Domain Name，FQDN）给出节点到根的完整路径，如 `www.example.com.`。末尾点表示根，日常书写时通常省略。


> #### 补充：域名的长度与编码
> 域名中，单个标签最长 63 字节，域名总长不能超过 255 个字节，包括最后的根域名的“.”符号与存储时需要额外加上根域的 1 字节表示。
> 即：
> $$....(63 B).(63 B).(63 B) + . + 根域的 1 B <= 255 B$$
>
> 域名中`"."`与英文字母均使用ASCII表示，因此均只占一个字节，且英文字母比较不区分大小写。
>
> 域名不限制语言，其它语言在域名中的最大字符数与编码有关，
> 详细参见 [中文域名编码技术要求](https://std.samr.gov.cn/gb/search/gbDetailed?id=234D7936AB48E194E06397BE0A0AA0A9)。

> #### 补充：子域委派
> 当子域由另一权威域名服务器单独管理时，原有的区不再保存其 `A`/`AAAA`/`CNAME`/`MX` 记录，一般将保留一条 `NS`
> 记录指向新的权威域名服务器，与此同时，保留一条`A`/`AAAA`记录指向权威域名服务器的IP地址。
> 例如 `www.example.com.` 由权威域名服务器 `dns.example.com.` 管理，后者负责二级域 `example.com.`下所有域名的解析，并在
> `com.` TLD 服务器中有如下 `NS` 与 `A`/`AAAA` 记录：
> ```text
> NAME              TTL   CLASS     TYPE    RDATA
> example.com.      3600  IN        NS      dns.example.com.
> dns.example.com.  3600  IN        A       [dns.example.com. 的IPv4地址]
> ```
> 一般而言，NS记录将同时存在一条`A`/`AAAA`记录指向权威域名服务器的实际IP地址，以避免递归解析 `dns.example.com.`
>
> 在此情况下，二级域 `example.com.` 与域名 `www.example.com.` 均包含在权威域名服务器 `dns.example.com.`
> 的区中，并在区外包含一条`NS`记录，指向权威域名服务器。

### 1.2 域名服务器的层次{#域名服务器的层次}

域名服务器运行 DNS 服务程序，保存资源记录并回答查询；所有域名服务器共同构成 DNS 分布式数据库。

| 角色      | 典型位置               | 功能                                   |
|---------|--------------------|--------------------------------------|
| 根服务器    | 公网 DNS 层次的根        | 返回目标 TLD 服务器的 `NS`；附加区可携带 `A`/`AAAA` |
| TLD 服务器 | 各顶级域的公网服务          | 返回目标区权威域名服务器的 `NS`；附加区可携带 `A`/`AAAA` |
| 权威域名服务器 | 域名所属组织或 DNS 服务商    | 特定域名资源记录的最终数据源                       |
| 本地域名服务器 | ISP、机构网络或公网 DNS 服务 | 接收主机的递归查询，查询其他域名服务器并缓存结果             |

> 主机上的 DNS 客户端（也称存根解析器）不属于服务器，它把请求交给配置的本地域名服务器。
> 根服务器、TLD 服务器和权威域名服务器构成查询层次；本地域名服务器位于该层次之外，承担代理查询和缓存。

<Image {...dnsServerTypesImage} />

典型冷查询路径：主机 DNS 客户端 => 本地域名服务器 => 根服务器（`NS`） => TLD 服务器（`NS`） => 权威域名服务器（`A`/`AAAA`）。

### 1.3 资源记录{#资源记录}

资源记录（Resource Record，RR）是 DNS 分布式数据库的基本数据项。权威域名服务器以资源记录描述所辖区，本地域名服务器也可缓存查询得到的资源记录。

资源记录格式：

```text
NAME            TTL   CLASS     TYPE    RDATA
bilibili.com.   600   IN        A       139.159.241.37
```

| 字段      | 作用                    |
|---------|-----------------------|
| `NAME`  | 记录所属的域名               |
| `TTL`   | 记录可缓存的最长时间，单位为秒       |
| `CLASS` | 记录类别；Internet 使用 `IN` |
| `TYPE`  | 记录类型，决定 `RDATA` 的解释方式 |
| `RDATA` | 记录数据，结构随 `TYPE` 变化    |

> `TTL` 指定缓存寿命，而不是权威记录的寿命，参见 [DNS 缓存](#DNS缓存)

| 类型      | `NAME` 对应对象 | `RDATA` 的含义          | 示例                                                  |
|---------|-------------|----------------------|-----------------------------------------------------|
| `A`     | 主机名         | IPv4 地址              | `www.example.com. 300 IN A 192.0.2.10`              |
| `AAAA`  | 主机名         | IPv6 地址              | `www.example.com. 300 IN AAAA 2001:db8::10`         |
| `CNAME` | 别名          | 规范名字                 | `blog.example.com. 300 IN CNAME sites.example.net.` |
| `NS`    | 域           | 权威服务器的主机名            | `example.com. 86400 IN NS ns1.example.net.`         |
| `MX`    | 邮件域         | 优先级和邮件服务器主机名；数值越小越优先 | `example.com. 3600 IN MX 10 mail.example.com.`      |

> #### 补充：`NS`、`CNAME`与`MX`记录
> **`NS` 记录**：
>
> 一条典型的 `NS` 记录如下：
> ```text
> NAME              TTL     CLASS       TYPE    RDATA
> bilibili.com.     3600	  IN          NS      ns3.dnsv5.com.
> ```
>
> 本地域名服务器收到 `NS` 时，使用 `RDATA` 中包含的权威服务器的主机名再次查询 `A`/`AAAA` 记录获取权威服务器IP地址。
>
> 响应的附加区可直接提供该地址；但当子区的权威服务器名位于子区内时，父区必须提供胶水记录（glue record），避免解析服务器名时形成循环依赖。
>
> 如上例中，`dns.example.com.` 包含在 `example.com.` 中，若只给出一条NS记录指向 `dns.example.com.`，则再次查询
> `dns.example.com.`的 `A`/`AAAA` 记录将形成无限循环。
>
> **`CNAME` 记录**：
>
> 一条典型的 `CNAME` 记录如下：
> ```text
> NAME              TTL     CLASS   TYPE    RDATA
> www.baidu.com.    900     IN      CNAME   www.a.shifen.com.
> ```
>
> 地址查询收到 `CNAME` 时，本地域名服务器以其规范名称继续查询，直到取得 `A`/`AAAA`；`CNAME` 响应的附加区也可能直接携带 `A`/
> `AAAA` 记录。
>
> **`MX` 记录**：
>
> 一条典型的 `MX` 记录如下：
> ```text
> NAME			TTL	CLASS	TYPE	RDATA
> bilibili.com.		600	IN	MX	10 mgw.bilibili.co.
> ```
> 解析邮件服务器时先查询收件域的 `MX`，选择优先级（preference）数值最小的邮件服务器，再查询该主机名的 `A`/`AAAA`；
> 数值相同时任选，连接失败时再尝试后续记录。`MX` 响应的附加区也可能直接携带 `A`/`AAAA` 记录。

### 1.4 域名解析过程{#域名解析过程}

#### 1.4.1 冷缓存查询{#冷缓存查询}

冷缓存指主机与本地域名服务器都没有本次查询可复用的记录。查询 `www.example.com` 的 `A`/`AAAA`，且 `example.com` 没有下级独立管理区时：

1. **主机 DNS 客户端 => 本地域名服务器**：查询 `www.example.com` 的 `A`/`AAAA`。
2. **本地域名服务器 => 根服务器**：查询 `com.` TLD 服务器的 `NS` 及相关 `A`/`AAAA`。
3. **本地域名服务器 => `com.` TLD 服务器**：TLD 服务器返回 `example.com.` 权威域名服务器的 `NS` 及相关 `A`/`AAAA`。
4. **本地域名服务器 => 权威域名服务器**：取得 `www.example.com` 的 `A`/`AAAA`。
5. **本地域名服务器 => 主机 DNS 客户端**：返回查询结果。

### 1.4.2 递归与迭代查询{#递归查询与迭代查询}

::::flow{mode="split" side="left" media-width="42%" min-text-width="22rem" print="block"}
:::media
| 查询方式 | 服务器的责任       | 客户端的责任     |
|------|--------------|------------|
| 递归查询 | 得到最终答案，再统一返回 | 等待最终结果     |
| 迭代查询 | 返回当前已知的最佳答案  | 根据返回信息继续查询 |
:::
:::body

主机 DNS 客户端 => 本地域名服务器一般是递归查询；

本地域名服务器 => 根服务器、TLD 服务器和权威域名服务器一般是迭代查询。

> 若各级域名服务器都采用递归查询，上级服务器需要代查后续层级，负载和状态开销较大，因此这种递归链除本地域名服务器以外实际几乎不使用。
:::
::::

<Image {...dnsQueryModesImage} />

### 1.5 DNS 缓存{#DNS缓存}

DNS 缓存可位于浏览器等应用、操作系统和本地域名服务器。收到查询结果后，缓存方保存可复用的资源记录；TTL
规定最长缓存时间，到期后必须重新查询，记录也可能因容量限制提前淘汰。

| 回答类型  | 来源               | `AA` 标志 | 含义           |
|-------|------------------|:-------:|--------------|
| 权威回答  | 回答服务器对问题名称具有管理权  |    1    | 依据所辖区的记录直接回答 |
| 非权威回答 | 回答服务器对问题名称不具有管理权 |    0    | 结果可来自已有缓存    |

同一台域名服务器可以对某些区返回权威回答，同时对其他名称提供递归查询或缓存回答；“权威”描述的是服务器与所查名称的关系。

### 1.6 DNS 传输协议与报文{#DNS传输协议与报文}

#### 1.6.1 传输协议{#DNS传输协议}

传统 DNS 查询通常使用 UDP/53，一次查询对应一个回答。

> DNS over TLS（DoT）使用 TCP/853；DNS over HTTPS（DoH）通过 HTTPS 传输。二者加密客户端到解析服务的通信。

#### 1.6.2 报文格式{#DNS报文格式}

DNS 查询与回答使用相同格式：

::::flow{mode="split" side="left" media-width="42%" min-text-width="22rem" print="block"}
:::media
| 区域  | 内容                      |
|-----|-------------------------|
| 首部  | 16 位查询标识、标志位，以及后续各区的条目数 |
| 问题区 | 待查询的域名、类型和类别            |
| 回答区 | 直接回答问题的资源记录             |
| 权威区 | 指向相关权威域名服务器的资源记录        |
| 附加区 | 辅助后续查询的资源记录，如服务器地址      |
:::
:::body

查询标识由客户端生成，服务器复制到回答中，以便客户端匹配查询与回答。`AA` 标志表示回答是否由所查名称的权威域名服务器给出。

DNS 传输方式、报文字段与 Wireshark 抓包分析将在 [应用层协议实验](../ignore/computer-network-04-application-layer-exp.md) 中展开。
:::
::::

### 1.7 DNS 查询时延{#DNS查询时延}

#### 1.7.1 时延模型{#DNS时延模型}

基本假设如下：

1. **仅考虑必要时延：** 忽略处理、排队、丢包与传输时间，并假设各级响应同时提供 `NS` 记录及其可直接使用的 `A`/`AAAA`
   地址（含必要的胶水记录），且没有
   `CNAME`、重传或其他附加查询。
2. **递归与迭代：** 本地域名服务器仅提供递归查询，其他域名服务器仅提供迭代查询。
3. **基本时延表示：** 设主机到本地域名服务器的往返时间为 $RTT_0$，本地域名服务器顺序访问 $n$
   台上游服务器的往返时间为 $RTT_i$：

$$
T_{\mathrm{DNS}}=RTT_0+\sum_{i=1}^{n}RTT_i.
$$

#### 1.7.2 查询链计算{#DNS查询链计算}

以冷缓存查询 `www.example.com` 为例，$RTT_1$、$RTT_2$、$RTT_3$ 分别为本地域名服务器到根服务器、`com` TLD 服务器和
`example.com` 权威域名服务器的 RTT。

冷缓存查询的 RTT 组成如下：

$$
\begin{aligned}
\text{主机} &\xleftrightarrow{\ RTT_0\ } \text{本地域名服务器},\\
\text{本地域名服务器} &\xleftrightarrow{\ RTT_1\ } \text{根服务器},\\
\text{本地域名服务器} &\xleftrightarrow{\ RTT_2\ } \text{TLD 服务器},\\
\text{本地域名服务器} &\xleftrightarrow{\ RTT_3\ } \text{第一级权威域名服务器}.\\
...\\
\text{本地域名服务器} &\xleftrightarrow{\ RTT_n\ } \text{第n-2级权威域名服务器}.

\end{aligned}
$$

| 冷查询目标                                        | 本地域名服务器的顺序查询                                   | 查询时延                            |
|----------------------------------------------|------------------------------------------------|---------------------------------|
| 命中缓存记录                                       | 无上游查询                                          | $RTT_0$                         |
| `www.example.com`                            | 根服务器 => `com` TLD 服务器 => `example.com` 权威域名服务器 | $RTT_0+RTT_1+RTT_2+RTT_3$       |
| `example.com`                                | 同上；最后查询区顶点记录，区域文件中常写作 `@`                      | $RTT_0+RTT_1+RTT_2+RTT_3$       |
| `www.sub.example.com`，`sub` 未单独设区            | 同上；最后查询 `example.com` 区中的 `www.sub`            | $RTT_0+RTT_1+RTT_2+RTT_3$       |
| `www.sub.example.com`，`sub.example.com` 单独设区 | 再查询 `sub.example.com` 权威域名服务器                  | $RTT_0+RTT_1+RTT_2+RTT_3+RTT_4$ |
| 已知目标权威域名服务器                                  | 只查询目标权威域名服务器                                   | $RTT_0+RTT_3$                   |

> 域名标签数只能粗略估计最长查询链（标签数 = 最多迭代查询次数），实际查询次数由区的边界决定。
>
> 常见配置中 `example.com`(`@`)、`www.example.com`(`www`) 和 `www.sub.example.com`(`www.sub`) 都在 `example.com` 区；只有
> `sub.example.com` 子域独立分区(由另一组权威域名服务器管理）时，才增加一次迭代查询。

相互依赖的查询取 RTT 之和，并行的独立查询取最大完成时间。

## 2. 文件传输协议 FTP{#文件传输协议FTP}

FTP 是基于 TCP 的有状态客户—服务器协议；控制命令和文件数据使用独立连接。

### 2.1 控制连接与数据连接{#控制连接与数据连接}

| 比较维度  | 控制连接             | 数据连接                           |
|-------|------------------|--------------------------------|
| 职责    | 登录鉴权、操作请求和状态响应   | 文件内容或目录列表                      |
| 会话状态  | 保存用户身份、当前目录和传输参数 | 不单独登录，关联已有 FTP 会话              |
| 存续时间  | 通常贯穿整个 FTP 会话    | 通常每次传输单独建立和关闭                  |
| 服务器端口 | 固定监听 TCP/21      | 主动模式使用源端口 TCP/20；被动模式监听协商的临时端口 |

控制连接建立后形成 FTP 会话；用户随后在该会话中完成登录与鉴权，后续数据连接在逻辑上归属于该会话。控制信息与数据使用不同的
TCP 连接，称为带外控制（out-of-band control）。

### 2.2 文件传输过程{#文件传输过程}

从建立 FTP 会话到完成一次传输：

1. **控制连接**：客户端连接服务器 TCP/21，建立 FTP 会话。
2. **控制连接**：客户端以 `USER`、`PASS` 登录；服务器在会话中保存用户身份、当前目录和传输类型。
3. **控制连接**：双方以 `PORT`/`EPRT` 或 `PASV`/`EPSV` 协商数据端点；客户端发送 `RETR`、`STOR` 或 `LIST`。
4. **控制连接**：服务器按会话状态检查路径和权限；失败时返回 `550`，接受传输时返回 `150`，数据连接已打开时可返回 `125`。
5. **数据连接**：按主动或被动模式建立或使用独立的 TCP 连接，只传送本次文件或目录数据，完成后关闭。
6. **控制连接**：服务器返回 `226`；控制连接与 FTP 会话继续保留，直至客户端发送 `QUIT`。

### 2.3 主动模式与被动模式{#主动模式与被动模式}

主动、被动只描述数据连接的发起方；控制连接始终由客户端连接服务器 TCP/21。

| 模式   | 建立过程                                  | 服务器数据端口          | 客户端数据端口     |
|------|---------------------------------------|------------------|-------------|
| 主动模式 | 客户端通过 `PORT`/`EPRT` 告知监听端口，服务器主动连接客户端 | 经典模式使用源端口 TCP/20 | 客户端指定并监听的端口 |
| 被动模式 | 服务器通过 `PASV`/`EPSV` 返回监听端口，客户端主动连接服务器 | 服务器选择的临时端口       | 客户端临时源端口    |

被动模式的控制连接和数据连接均由客户端向外发起，更易穿过 NAT 和防火墙。**TCP/20 不适用于被动模式**。

> 传统 FTP 可明文传输命令、口令和数据。FTPS 在 FTP 上加入 TLS；SFTP 基于 SSH（通常使用 TCP/22），不是 FTP 的安全模式，也不使用
> FTP 的双连接结构。
>
> 文本模式（`TYPE A`）按文本表示传输，可转换行结束符；二进制模式（`TYPE I`）按原始八位组传输，适用于图像、压缩包和可执行文件等需要保持字节不变的内容。

## 3. 电子邮件{#电子邮件}

电子邮件采用异步存储转发。SMTP 负责提交和中继；POP3、IMAP 或 HTTPS 负责访问邮箱；DNS `MX` 指向接收邮件服务器。

### 3.1 系统组成与投递过程{#系统组成与投递过程}

| 逻辑角色        | 英文全称                  | 职责                            |
|-------------|-----------------------|-------------------------------|
| 邮件用户代理（MUA） | Mail User Agent       | 撰写、提交、读取和管理邮件                 |
| 邮件提交代理（MSA） | Mail Submission Agent | 接收 MUA 提交，完成语法、身份与策略校验后交给 MTA |
| 邮件传输代理（MTA） | Mail Transfer Agent   | 维护队列、选择下一跳，通过 SMTP 存储转发邮件     |
| 邮件投递代理（MDA） | Mail Delivery Agent   | 将接收方 MTA 接受的邮件投递到本地邮箱         |
| 邮件访问代理（MAA） | Mail Access Agent     | 通过 POP3 或 IMAP 向 MUA 提供邮箱访问   |

五类代理是逻辑角色，可以由同一邮件服务器或软件实现。

::::flow{mode="float" side="right" media-width="46%" min-text-width="24rem" print="block"}
:::media
<Image {...emailDeliveryFlowImage} />
:::
:::body

1. **提交**：发件人 MUA 通过 SMTP submission（TCP/587；TCP/465 为隐式 TLS）向 MSA 提交邮件。
2. **校验与排队**：MSA 校验邮件并交给发送方 MTA；MTA 将其放入外发队列。
3. **寻址**：跨域投递时，发送方 MTA 查询收件域的 `MX`，再解析目标主机的 `A`/`AAAA`。
4. **中继**：发送方 MTA 通过 SMTP（TCP/25）向下一跳 MTA 发送邮件。
5. **投递**：接收方 MTA 接受邮件后，MDA 将其写入收件人邮箱。
6. **访问**：收件人 MUA 通过 MAA，以 POP3 或 IMAP 访问邮箱。

MTA 发送邮件时是 SMTP 客户，接收邮件时是 SMTP 服务器。每一跳中继都是独立的 SMTP 会话；临时失败时保留队列并重试，永久失败时通常生成投递状态通知。
:::
::::

### 3.2 SMTP{#SMTP}

SMTP 是基于 TCP 的推送协议。服务器间中继使用 TCP/25；邮件提交使用 TCP/587，隐式 TLS 提交使用 TCP/465。

1. **连接建立**：SMTP 客户建立 TCP 连接；服务器返回 `220`，客户发送 `EHLO`，服务器以一个或多个 `250` 响应报告能力。
2. **邮件传送**：客户发送 `MAIL FROM`，服务器接受后返回 `250`；客户发送一个或多个 `RCPT TO`，服务器逐一响应；客户发送 `DATA`
   ，收到 `354` 后发送邮件内容，并以 `<CRLF>.<CRLF>` 结束；服务器接受邮件后返回 `250`。
3. **连接释放**：客户发送 `QUIT`，服务器返回 `221` 后关闭连接。

一条 TCP 连接可传送多封邮件，每封邮件重新执行 `MAIL FROM`、`RCPT TO` 和 `DATA`。

### 3.3 邮件格式与 MIME{#邮件格式与MIME}

电子邮件由 **SMTP 信封**与**邮件内容**组成；邮件内容依次为首部、空行和主体。信封由 `MAIL FROM` 与一个或多个 `RCPT TO`
构成并决定投递。

::::flow{mode="split" side="left" media-width="42%" min-text-width="22rem" print="block"}
:::media
| 首部         | 作用           |
|------------|--------------|
| `From:`    | 标识邮件作者或显示发件人 |
| `To:`      | 列出显示的主收件人    |
| `Cc:`      | 列出显示的抄送收件人   |
| `Subject:` | 描述邮件主题       |
| `Date:`    | 记录邮件创建时间     |
:::
:::body

SMTP 信封与邮件首部可以不同；实际投递以信封为准。

邮件地址通常写作 `local-part@domain`；发送方根据 `domain` 的 `MX` 查找接收邮件服务器。

原始 SMTP 只支持 7 位 ASCII 邮件内容，不能直接传输非 ASCII 文本和二进制多媒体。多用途互联网邮件扩展（Multipurpose Internet
Mail Extensions，MIME）通过媒体类型、多部分结构和传输编码扩展邮件内容；MIME 扩展而非替代 SMTP。
:::
::::

常用 MIME 首部字段如下：

| 字段                          | 作用                                 |
|-----------------------------|------------------------------------|
| `MIME-Version`              | 声明所用 MIME 版本                       |
| `Content-Type`              | 指明媒体类型、字符集和多部分边界                   |
| `Content-Transfer-Encoding` | 指明传输编码，如 Base64 或 quoted-printable |
| `Content-ID`                | 标识某个 MIME 实体，常用于引用内嵌资源             |
| `Content-Description`       | 提供内容的人类可读说明                        |
| `Content-Disposition`       | 常见扩展字段；指明内联或附件，并可携带文件名             |

### 3.4 POP3 与 IMAP{#POP3与IMAP}

POP3 和 IMAP 均基于 TCP，用于访问邮箱：

| 比较维度      | POP3             | IMAP                |
|-----------|------------------|---------------------|
| 默认端口      | TCP/110          | TCP/143             |
| 隐式 TLS 端口 | TCP/995          | TCP/993             |
| 主要功能      | 下载邮件，可配置下载后删除或保留 | 以服务器邮箱为主，在多设备间同步状态  |
| 服务器端文件夹   | 不提供              | 支持远程文件夹             |
| 部分获取      | 通常面向整封邮件         | 可只取首部、正文或某个 MIME 部分 |

> #### 补充：Web Mail
>
> Web Mail 以浏览器作为用户代理。浏览器与 Web 邮件服务之间使用 HTTPS 发送和读取邮件；邮件服务器之间仍使用 SMTP。浏览器不直接使用
> SMTP、POP3 或 IMAP。

## 4. 万维网与资源标识{#万维网与资源标识}

Internet 是基于 TCP/IP 的网络基础设施；Web 是其上的应用系统，以 URI 标识资源，以 HTML 组织超文本，以 HTTP 传输资源的表示。Web
页面通常由一个基础 HTML 对象和若干样式表、脚本、字体、图像等引用对象组成；表示可以是 HTML、JSON 或图像等。

### 4.1 URI、URL 与 URN{#URI-URL与URN}

| 缩写  | 英文全称                        | 含义                  | 示例                           |
|-----|-----------------------------|---------------------|------------------------------|
| URI | Uniform Resource Identifier | 统一资源标识符；资源标识的总称     | `https://example.com/docs/1` |
| URL | Uniform Resource Locator    | 统一资源定位符；给出主要访问机制与位置 | `https://example.com/docs/1` |
| URN | Uniform Resource Name       | 统一资源名称；以位置无关的名称标识资源 | `urn:isbn:9780133594140`     |

URL 与 URN 均属于 URI；URL 侧重定位，URN 侧重命名。Web 主要使用 HTTP(S) URL。

### 4.2 URI 的组成{#URI的组成}

URI 的通用结构可简写为：

$$
\mathrm{URI}
=
\underbrace{\mathtt{scheme}}_{\text{方案}}\mathtt{:}
\left[\mathtt{//}\underbrace{\mathtt{authority}}_{\text{授权信息}}\right]
\underbrace{\mathtt{path}}_{\text{路径}}
\left[\mathtt{?}\underbrace{\mathtt{query}}_{\text{查询}}\right]
\left[\mathtt{\#}\underbrace{\mathtt{fragment}}_{\text{片段}}\right].
$$

其中

$$
\mathtt{authority}
=
\left[\mathtt{userinfo@}\right]
\mathtt{host}
\left[\mathtt{:port}\right].
$$

以 `https://www.example.com:443/articles/net?q=dns#records` 为例：

| 部分        | 值                     | 作用                          |
|-----------|-----------------------|-----------------------------|
| scheme    | `https`               | 规定解释和访问该 URI 的方案            |
| authority | `www.example.com:443` | 授权信息；本例由 `host` 和 `port` 组成 |
| host      | `www.example.com`     | 标识目标主机，通常需要 DNS 解析          |
| port      | `443`                 | 标识服务器进程；等于方案默认端口时可以省略       |
| path      | `/articles/net`       | 标识服务器命名空间中的目标               |
| query     | `q=dns`               | 向资源传递查询参数，具体语义由应用定义         |
| fragment  | `records`             | 标识表示内部片段，由客户端处理             |

**请求目标**：浏览器直连源服务器时通常发送 `path?query`；`fragment` 由客户端处理，不随 HTTP 请求发送。

**大小写**：`scheme` 与 `host` 中的 ASCII 字母不区分大小写；其他部分通常区分大小写，具体规则由方案或应用定义。

**百分号编码**：字符先编码为八位组，需要转义的八位组写作 `%HH`。

**相对引用**：相对引用必须结合基础 URI 解析。

## 5. 超文本传输协议 HTTP{#超文本传输协议HTTP}

HTTP 采用客户—服务器请求—响应模型。协议本身无状态；业务状态可保存在服务器或客户端，并通过 Cookie、认证信息或 URI 与请求关联。

HTTP/1.x 和 HTTP/2 通常基于 TCP，HTTP/3 基于 QUIC。HTTP URL 的默认端口为 80，HTTPS URL 的默认端口为 443。

### 5.1 请求—响应过程{#HTTP请求响应过程}

1. **URL 解析**：客户端解析 URL，并按缓存策略决定是否发起网络请求。
2. **DNS 解析**：客户端解析主机名，取得 IP 地址。
3. **连接建立**：HTTP/1.x 和 HTTP/2 建立 TCP 连接，HTTPS 还需协商 TLS；HTTP/3 建立 QUIC 连接。
4. **请求与响应**：客户端发送请求；服务器返回状态码、首部和可选内容。
5. **表示处理**：浏览器处理响应内容；若为 HTML，继续请求其中的引用对象。

### 5.2 HTTP 报文{#HTTP报文}

HTTP 请求报文与响应报文具有相同的整体结构：开始行、首部、空行和可选内容；HTTP/1.1 的行结束符为 CRLF。

| 位置   | 请求报文                | 响应报文                 |
|------|---------------------|----------------------|
| 开始行  | 请求行：方法、请求目标、HTTP 版本 | 状态行：HTTP 版本、状态码、原因短语 |
| 首部   | 请求条件、内容协商、认证等元数据    | 响应内容、缓存、状态等元数据       |
| 空行   | 结束首部                | 结束首部                 |
| 可选内容 | 提交给服务器的表示           | 返回给客户端的表示            |

#### 5.2.1 请求报文{#HTTP请求报文}

```http
GET /notes/network?lang=zh HTTP/1.1
Host: www.example.com
Accept: text/html
If-None-Match: "a1b2c3"

```

#### 5.2.2 响应报文{#HTTP响应报文}

```http
HTTP/1.1 200 OK
Date: Sun, 16 Aug 2026 06:00:00 GMT
Content-Type: text/html; charset=utf-8
Content-Length: 1250
ETag: "d4e5f6"
Cache-Control: max-age=300

<!doctype html>...
```

> #### 补充：示例中的首部
>
> `Host` 是 HTTP/1.1 请求的必需首部，用于区分同一地址上的站点。
>
> `Content-Type` 描述响应内容的媒体类型，与 URL 扩展名无关；`Content-Length` 给出内容长度。

### 5.3 请求方法{#HTTP请求方法}

| 方法        | 默认语义                          |
|-----------|-------------------------------|
| `GET`     | 获取目标资源当前选定的表示                 |
| `HEAD`    | 获取与 `GET` 对应的响应元数据，不返回表示内容    |
| `POST`    | 让目标资源按自身规则处理所附表示，如提交表单或创建下级资源 |
| `PUT`     | 用所附表示创建或完整替换请求 URI 标识的资源状态    |
| `PATCH`   | 对目标资源应用一组部分修改                 |
| `DELETE`  | 请求移除目标 URI 与当前资源的关联           |
| `OPTIONS` | 查询目标或服务器支持的通信选项，也用于 CORS 预检   |
| `CONNECT` | 建立到目标主机和端口的隧道，常供代理转发 TLS      |
| `TRACE`   | 请求服务器回显所见请求以供诊断，实际服务器常禁用      |

### 5.4 状态码{#HTTP状态码}

| 类别    | 含义            | 常见状态码                                                                   |
|-------|---------------|-------------------------------------------------------------------------|
| `1xx` | 临时信息，最终响应尚未完成 | `100 Continue`                                                          |
| `2xx` | 请求已成功处理或接受    | `200 OK`、`201 Created`、`204 No Content`                                 |
| `3xx` | 重定向或缓存复用      | `301 Moved Permanently`、`302 Found`、`303 See Other`、`304 Not Modified`  |
| `4xx` | 客户端错误         | `400 Bad Request`、`401 Unauthorized`、`403 Forbidden`、`404 Not Found`    |
| `5xx` | 服务端错误         | `500 Internal Server Error`、`502 Bad Gateway`、`503 Service Unavailable` |

`304` 用于条件请求且不携带新表示；`401` 要求身份认证，`403` 表示拒绝授权。

> #### 补充：`301`、`302`、`303` 与 `304`
>
> | 状态码                     | 语义            | 后续处理                         |
> |-------------------------|---------------|------------------------------|
> | `301 Moved Permanently` | 资源已永久迁移       | 后续请求应使用 `Location` 指向的新 URI  |
> | `302 Found`             | 本次临时使用另一 URI  | 本次跟随 `Location`，后续仍可使用原 URI  |
> | `303 See Other`         | 结果可从另一 URI 获取 | 使用 `GET` 获取 `Location` 指向的资源 |
> | `304 Not Modified`      | 条件请求验证的表示未变化  | 复用已有缓存；不携带新的表示内容，也不是 URI 重定向 |
>
> `301`、`302` 的历史客户端可能把后续 `POST` 改为 `GET`；需要保持方法和内容时，分别使用 `308`、`307`。

### 5.5 常见首部{#常见首部}

| 用途    | 常见字段                                                                       |
|-------|----------------------------------------------------------------------------|
| 目标与协商 | `Host`、`Accept`、`Accept-Language`、`Accept-Encoding`、`Vary`                 |
| 内容元数据 | `Content-Type`、`Content-Length`、`Content-Encoding`                         |
| 缓存    | `Cache-Control`、`ETag`、`Last-Modified`、`If-None-Match`、`If-Modified-Since` |
| 认证与状态 | `Authorization`、`WWW-Authenticate`、`Cookie`、`Set-Cookie`                   |
| 重定向   | `Location`                                                                 |

`Connection` 是 HTTP/1.1 逐跳字段；HTTP/2 和 HTTP/3 禁止使用。

> #### 补充：条件请求
>
> 1. 响应用 `Cache-Control`/`Expires` 规定新鲜度，用 `ETag`/`Last-Modified` 提供验证器。
> 2. 新鲜缓存直接使用；过期缓存发送 `If-None-Match` 或 `If-Modified-Since`。
> 3. 表示未变时返回 `304 Not Modified`，不携带表示内容；已变时返回 `200 OK` 和新表示。
>
> `If-None-Match` 与 `If-Modified-Since` 同时出现时前者优先。条件请求节省内容传输量，但仍产生网络往返。

> #### 补充：Cookie
>
> 服务器发送 `Set-Cookie: session=abc123; Path=/; Secure; HttpOnly; SameSite=Lax`；浏览器按作用域保存，并在后续请求中发送
`Cookie: session=abc123`。
>
> **`Secure`**：仅经安全连接发送。**`HttpOnly`**：禁止脚本读取。**`SameSite`**：限制跨站请求携带。
>
> Cookie 常只保存会话标识，完整状态位于服务器。

### 5.6 连接复用、流水线与多路复用{#连接复用流水线与多路复用}

| 机制                  | 承载连接            | 请求发送                  | 响应发送                 |
|---------------------|-----------------|-----------------------|----------------------|
| 非持续连接（HTTP/1.0）     | 每个对象使用一条 TCP 连接 | 每条连接只发送一个请求           | 每个对象均需重新建连           |
| 持续连接、非流水线（HTTP/1.1） | 多个对象复用一条 TCP 连接 | 收到前一响应后再发送下一请求        | 请求—响应依次完成            |
| 持续连接、流水线（HTTP/1.1）  | 多个对象复用一条 TCP 连接 | 连续发送完整请求，允许多个请求处于未决状态 | 完整响应按请求顺序发送，响应之间不能交错 |
| 分帧与多路复用（HTTP/2）     | 多个流复用一条 TCP 连接  | 消息映射到流并编码为帧           | 不同流的帧可以交错，同一流内保持顺序   |
| QUIC 多路复用（HTTP/3）   | 多个流复用一条 QUIC 连接 | 消息映射到相互独立的 QUIC 流     | 单个流丢包通常不阻塞其他流的有序交付   |

HTTP/1.0 的经典模型为非持续连接，HTTP/1.1 默认使用持续连接；HTTP/1.1 流水线实际部署较少。

> #### 流水线与分帧
>
> **流水线**连续发送多个完整请求。服务器仍按请求顺序发送完整响应，且不能交错两个响应的字节；当前序响应生成较慢或对象较大时，后续响应即使已经就绪也必须等待，形成应用层队头阻塞。
>
> **分帧**把 HTTP 消息编码为帧，并以流区分请求—响应。调度器可以交错发送不同流的帧，使后续流不必等待前序流完成；同一流内仍保持顺序。帧在一条链路上仍是串行发送，多路复用并非多条字节流同时占用链路。

HTTP/2 使用 HPACK 压缩首部，但底层 TCP 只提供一条有序字节流：一个 TCP 报文段丢失会阻塞其后的所有字节，进而阻塞多个 HTTP/2
流。HTTP/3 改用 QUIC/UDP 和 QPACK；QUIC 流独立排序，隔离了大多数跨流传输层队头阻塞，但各流仍共享拥塞控制。各版本保留方法、状态码和缓存等
HTTP 语义。

### 5.7 HTTP 时延分析{#HTTP时延分析}

#### 5.7.1 时延组成与统一假设{#HTTP时延组成与假设}

页面时延可拆为

$$
T_{\text{页面}}
=
T_{\text{DNS}}
+T_{\text{conn}}
+T_{\text{HTTP}}
+T_{\text{data}}
+T_{\text{other}}.
$$

- $T_{\text{DNS}}$：域名解析时延，按 [DNS 查询时延](#DNS查询时延) 计算；
- $T_{\text{conn}}$：TCP、TLS 或 QUIC 的建连时延；
- $T_{\text{HTTP}}$：发送请求至收到响应首字节的控制时延；
- $T_{\text{data}}$：响应内容的发送时延；
- $T_{\text{other}}$：处理、排队、重传等时延。

以下公式统一假设：

- 页面含一个基础 HTML 对象（$i=0$）及其引用的 $N$ 个对象，$N>0$，且对象均位于同一服务器；
- 取得并解析完整基础 HTML 后才能请求引用对象，各连接的往返时间均为 $RTT$；
- 使用明文 HTTP，TCP 建连需要 $1RTT$，一次请求—首字节响应需要 $1RTT$；
- 请求报文大小可忽略，并忽略处理、排队、丢包、重传和拥塞控制。

若对象长度为 $L_i$，且所有对象经过速率为 $R$ 的同一共享瓶颈，则

$$
T_{\text{data}}
=
\sum_{i=0}^{N}\frac{L_i}{R}.
$$

该式仅适用于单一共享瓶颈，且控制阶段与数据发送不重叠时的总字节近似；存在多个瓶颈或阶段重叠时，应按时间线计算。

#### 5.7.2 非持续连接：串行与并行{#非持续连接串行与并行}

::::flow{mode="float" side="right" media-width="42%" min-text-width="24rem" print="block"}
:::media
<Image {...httpNonPersistentSerialTimelineImage} />
:::
:::body

非持续连接为每个对象新建一条 TCP 连接，共使用 $N+1$ 条连接。

**串行**：取得一个对象后再为下一个对象建连。

$$
T_{\text{非持续，串行}}
=
\underbrace{2RTT}_{\text{基础 HTML：建连与响应}}

+

\underbrace{2NRTT}_{\text{引用对象：逐一建连与响应}}
+T_{\text{数据}}.
$$
:::
::::

::::flow{mode="float" side="right" media-width="42%" min-text-width="24rem" print="block"}
:::media
<Image {...httpNonPersistentParallelTimelineImage} />
:::
:::body

**并行**：取得并解析基础 HTML 后，将小对象按至多 $K$ 个一批请求，其中 $K\in\mathbb N^+$。

$$
T_{\text{非持续，并行}}
=
\underbrace{2RTT}_{\text{基础 HTML}}

+

\underbrace{2\left\lceil\frac{N}{K}\right\rceil RTT}_{\text{引用对象批次}}
+T_{\text{data}}.
$$

该式按固定批次计算。若连接完成后动态补位、对象大小不同，或数据发送与握手重叠，应按依赖关系画时间线，并对并行分支取最大值。
:::
::::

#### 5.7.3 持续连接：非流水线与流水线{#持续连接时延}

持续连接时延默认只使用一条 TCP 连接，不考虑另外建立并行连接。

::::flow{mode="float" side="right" media-width="42%" min-text-width="24rem" print="block"}
:::media
<Image {...httpPersistentNonPipelineTimelineImage} />
:::
:::body

**非流水线**：每次收到完整响应后再发送下一个请求。

$$
T_{\text{持续，非流水线}}
=
\underbrace{RTT}_{\text{conn}}

+

\underbrace{RTT}_{\text{基础 HTML}}

+

\underbrace{NRTT}_{\text{引用对象依次请求}}
+T_{\text{data}}.
$$
:::
::::

::::flow{mode="float" side="right" media-width="42%" min-text-width="24rem" print="block"}
:::media
<Image {...httpPersistentPipelineTimelineImage} />
:::
:::body

**流水线**：取得基础 HTML 后，连续发送全部引用对象请求。

$$
T_{\text{持续，流水线}}
=
\underbrace{RTT}_{\text{conn}}

+

\underbrace{RTT}_{\text{基础 HTML}}

+

\underbrace{RTT}_{\text{引用对象批量请求}}
+T_{\text{data}}.
$$
:::
::::

> #### HTTP/2 分帧与 HTTP/3
>
> **HTTP/1.1 流水线**只能连续发送请求；服务器仍按请求顺序发送完整响应。前序响应较慢或较大时，后续响应必须等待。这被称为“队头阻塞”（Head-of-Line
> blocking）。
>
>
>
> **HTTP/2 分帧**将响应拆成带流标识的帧，并在一条 TCP 连接上交错发送。它解除不同响应必须依次完整发送的约束，缓解应用层队头阻塞。
>
> ::::image-group{columns="2" mobile-columns="1" print-columns="2"}
> <Image {...httpPersistentPipelineTimelineImage_Center} />
>
> <Image {...http2MultiplexingTimelineImage} />
> ::::
>
> 两图的阴影总面积相同，均为引用对象的数据传输量；分帧只改变数据传输的调度方式，并没有减少数据量，因此阴影总面积不变。
> 在上述无丢包、小对象模型中，两者的控制时延均为 $3RTT$。
>
> 与此同时，HTTP/2 仍受 TCP 有序字节流约束：一个 TCP 报文段丢失会阻塞所有流的后续数据。HTTP/3 使用独立的 QUIC
> 流，使单个流的丢包通常不阻塞其他流；若首次
> QUIC 建连按 $1RTT$ 计算，其控制时延仍为 $3RTT$。

#### 5.7.4 综合计算{#HTTP综合时延}

在统一假设下，四种方式的 HTTP 阶段时延（$T_{\text{conn}} + T_{\text{HTTP}} + T_{\text{data}}$）为：

| 方式                 | 建连与请求调度             | 时延                                                               |
|--------------------|---------------------|------------------------------------------------------------------|
| 非持续连接、串行           | 基础 HTML 与每个引用对象分别建连 | $2(N+1)RTT+T_{\text{data}}$                                      |
| 非持续连接、最多 $K$ 条并行连接 | 基础 HTML 后将引用对象分批    | $2\left(1+\left\lceil N/K\right\rceil\right)RTT+T_{\text{data}}$ |
| 持续连接、非流水线          | 建连一次，收到前一响应后再发送下一请求 | $(N+2)RTT+T_{\text{data}}$                                       |
| 持续连接、流水线           | 建连一次，连续发送全部引用对象请求   | $3RTT+T_{\text{data}}$                                           |

例如 $N=6$、$K=3$ 时，四种方式的控制时延依次为 $14RTT$、$6RTT$、$8RTT$、$3RTT$。计算页面总时延时，还需加上
$T_{\text{DNS}}$ 与 $T_{\text{other}}$。若包含 TLS、缓存或多个服务器，应按实际依赖关系重新计算。

## 6. 默认端口{#默认端口}

以下为服务器侧默认端口；客户端通常使用临时源端口。

| 服务    | 传输协议    | 默认端口                | 说明                                   |
|-------|---------|---------------------|--------------------------------------|
| DNS   | UDP、TCP | `53`                | 普通查询多用 UDP；区域传送和截断回退等使用 TCP          |
| FTP   | TCP     | `21`（控制）、`20`（主动数据） | `20` 是经典主动模式的数据连接源端口                 |
| SMTP  | TCP     | `25`                | 邮件服务器之间中继邮件                          |
| HTTP  | TCP     | `80`                | 明文 HTTP                              |
| HTTPS | TCP、UDP | `443`               | TCP 承载 HTTP/1.1、HTTP/2；UDP 承载 HTTP/3 |

FTP 被动模式的数据端口由服务器协商。端口均可配置，不能仅凭端口判断应用协议。

## 7. 小结{#小结}

**DNS**：分布式层次数据库保存域名及其资源记录。解析器通过递归或迭代查询取得结果，并利用缓存减少查询次数与时延。

**FTP**：控制连接保持会话状态，数据连接按传输任务建立。主动模式与被动模式的区别在于数据连接的发起方及服务器端口。

**SMTP 与电子邮件**：SMTP 以推送、存储转发方式完成邮件提交与服务器间中继；MIME 扩展邮件内容，POP3、IMAP 或 Web Mail 用于访问邮箱。

**HTTP**：URI 标识资源，HTTP 以无状态的请求—响应交换资源表示。持续连接减少重复握手，流水线与多路复用进一步压缩可重叠的
RTT；具体时延仍取决于依赖关系与传输条件。
