---
title: 传输层与 UDP
date: 2026-08-19T08:00:00
tags: [ 计算机网络, 传输层, UDP ]
pinned: false
collection: 计算机网络
outline:
  - title: 1. 传输层概述
    slug: 传输层概述
  - title: 1.1 简介与功能
    slug: 传输层简介与功能
    level: 1
  - title: 1.2 复用、分用与端口号
    slug: 复用分用与端口号
    level: 1
  - title: 1.3 差错检测
    slug: 差错检测
    level: 1

  - title: 2. UDP——无连接的不可靠服务
    slug: UDP
  - title: 2.1 基本功能
    slug: UDP基本功能
    level: 1
  - title: 2.2 特点
    slug: UDP特点
    level: 1
  - title: 2.3 首部格式
    slug: UDP首部格式
    level: 1

head:
  - - meta
    - name: description
      content: 传输层的进程间通信、复用与分用、端口号和差错检测，以及 UDP 的服务特点与首部格式。
  - - meta
    - name: keywords
      content: 计算机网络, 传输层, UDP, 端口号, Socket, 复用, 分用, Internet校验和, UDP首部
---

```ts image-setup
import { path as miscellaneousImagePath } from '@public/Image/Miscellaneous/path'

const transportLayerScopeImage = {
  src: miscellaneousImagePath['传输层通信范围'],
  alt: '两个端系统中的应用层、传输层和网络层，以及只处理网络层转发的中间路由器',
  align: 'right',
  wrap: false,
  maxHeight: '26rem',
  caption: '网络层提供主机到主机的交付，传输层将其扩展为端系统间的进程到进程通信',
} as const

const portMultiplexingImage = {
  src: miscellaneousImagePath['端口复用与分用'],
  alt: '发送主机将多个应用进程的数据复用到网络层，接收主机再按端口分用给对应进程',
  align: 'right',
  wrap: false,
  maxHeight: '29rem',
  caption: '发送端复用与接收端分用',
} as const

const udpChecksumImage = {
  src: miscellaneousImagePath['UDP校验和范围'],
  alt: 'IPv4 伪首部、UDP 首部和数据共同参与十六位反码求和的计算流程',
  align: 'right',
  wrap: false,
  maxHeight: '22rem',
  caption: 'IPv4 UDP 校验和的覆盖范围；伪首部只参与计算，不随 UDP 数据报发送',
} as const

const ipv4PseudoHeaderImage = {
  src: miscellaneousImagePath['IPv4伪首部格式'],
  alt: 'IPv4 伪首部由源地址、目的地址、全零字段、协议号和传输层长度组成',
  align: 'center',
  wrap: false,
  maxHeight: '24rem',
  caption: 'IPv4 伪首部格式；UDP 协议号为 17，TCP 协议号为 6',
} as const

const udpHeaderImage = {
  src: miscellaneousImagePath['UDP首部格式'],
  alt: 'UDP 数据报由源端口、目的端口、长度、校验和四个十六位字段及应用数据组成',
  align: 'right',
  wrap: false,
  maxHeight: '25rem',
  caption: 'UDP 首部固定为 8 B，四个字段均为 2 B',
} as const
```

本篇介绍传输层概述与UDP，可靠传输原理与TCP位于 [下一节](./computer-network-07-transport-layer-tcp.md)中。

---

网络层负责主机到主机的交付；传输层在端系统中完成进程到进程的交付。

## 1. 传输层概述{#传输层概述}

### 1.1 简介与功能{#传输层简介与功能}

::::flow{mode="float" side="right" media-width="56%" min-text-width="18rem"}
:::media
<Image {...transportLayerScopeImage} />
:::
:::body
传输层协议只在端系统中实现。发送端接收应用进程的数据并交给网络层，接收端再把网络层载荷交给对应进程；中间路由器不处理应用进程的传输层状态。
:::
::::

::::flow{mode="float" side="right" media-width="46%" min-text-width="18rem"}
:::media
| 功能 | 作用 |
|------|--------------------|
| 复用分用 | 在主机之上实现进程间通信 |
| 差错检测 | 使用校验算法（如校验和）检验比特差错 |
:::
:::body
传输层在网络层上至少增加复用/分用与差错检测。前者区分同一主机中的应用进程，后者判断传输层报文是否可能发生比特差错。
:::
::::

> 差错检测不等于可靠交付。校验和不能纠错，也不能处理丢失、重复和失序。

### 1.2 复用、分用与端口号{#复用分用与端口号}

::::flow{mode="float" side="right" media-width="58%" min-text-width="18rem"}
:::media
<Image {...portMultiplexingImage} />
:::
:::body
**复用**发生在发送端：传输层接收多个应用进程的数据，添加传输层首部后交给网络层。**分用**发生在接收端：传输层根据网络层地址和传输层首部字段，把载荷交给匹配的
Socket。

端口号是 16 位无符号数，范围为 `0`～`65535`。它是一种传输层协议名字空间中的标识；端口号与 IP 地址共同组成 Socket 地址。
:::
::::

::::flow{mode="float" side="right" media-width="52%" min-text-width="18rem"}
:::media
| 范围 | IANA 分类 | 用途 |
|----------------:|---------|----------------|
|             `0` | 保留 | 不能作为普通服务端口 |
|      `1`～`1023` | 系统端口 | 周知端口，分配给通用网络服务 |
|  `1024`～`49151` | 用户端口 | 可登记给特定应用或服务 |
| `49152`～`65535` | 动态/私有端口 | 常用于客户端临时端口 |
:::
:::body
IANA 按用途划分端口号。系统端口通常对应固定服务，动态端口通常由客户端临时使用。

> UDP 源端口不需要回复时可填 `0`
:::
::::

::::flow{mode="float" side="right" media-width="62%" min-text-width="17rem"}
:::media
| 服务器端口 | 传输层协议 | 应用协议 |
|----------:|---------|-----------------------|
|      `21` | TCP | FTP 控制连接 |
|      `22` | TCP | SSH |
|      `25` | TCP | SMTP |
|      `53` | UDP、TCP | DNS |
| `67`、`68` | UDP | DHCP 服务器、客户端 |
|      `80` | TCP | HTTP |
|     `110` | TCP | POP3 |
|     `143` | TCP | IMAP |
|     `443` | TCP、UDP | HTTPS；HTTP/3 通常使用 UDP |
:::
:::body
常见周知端口如右表。

:::
::::


> TCP 与 UDP 的端口名字空间相互独立。例如，TCP 端口 `53` 与 UDP 端口 `53` 是两个名字空间中的标识，可以分别绑定不同的
> Socket。

> **Socket。** Socket 是应用访问传输层通信端点的内核对象，应用通过文件描述符或运行库句柄操作它。Socket 地址由 IP
> 地址和端口号组成。TCP 连接由本地与远端的一对 Socket 地址标识，即源 IP、源端口、目的 IP、目的端口组成的四元组；这不表示一个连接等于两个文件描述符。

### 1.3 差错检测{#差错检测}

::::flow{mode="float" side="right" media-width="58%" min-text-width="18rem"}
:::media
<Image {...udpChecksumImage} />
:::
:::body
UDP 与 TCP 使用 16 位 Internet 校验和。它对一组 16 位字执行反码加法，再对结果逐位取反。

发送端按以下顺序计算：

1. **字段置零，附伪首部：** 将传输层首部中的校验和字段置为 `0`，并在计算数据前附加伪首部；
2. **反码求和，进位回卷：** 按网络字节序把校验范围切分为 16 位字；总字节数为奇数时，在计算副本末尾补一个全 `0` 字节；执行反码加法，将每次
   16 位加法产生的进位回卷到最低位；
3. **取反码：** 对回卷后的 16 位结果逐位取反，将所得校验和写入首部。

:::
::::

最后一步的逐位取反不能省略。校验和启用时，接收端保留收到的校验和，把它与伪首部、传输层首部和数据共同执行反码加法；回卷后的结果应为
`0xffff`。结果不同表示检出差错，结果相同也不能排除校验和未检出的错误模式。

> #### 补充：伪首部
>
>
> 发送端计算校验和时，在 UDP/TCP 报文前**逻辑拼接**伪首部；接收端根据收到的 IP 数据报重建同一内容。伪首部只参与计算，不属于
> UDP/TCP 首部，不随报文发送，并且在内容上也不同于实际发送报文中的 IP 首部。
> <Image {...ipv4PseudoHeaderImage} />
> IPv4 伪首部固定为 12 B：
>
> - **地址：** 源 IPv4 地址与目的 IPv4 地址，各 32 位；
> - **占位：** 8 位全 `0` 字段；
> - **协议号：** 8 位 IPv4 协议号：UDP 为 `17`（`0x11`），TCP 为 `6`（`0x06`）；
> - **长度：** 16 位传输层长度。等于 TCP/UDP 首部与数据的总长度。
>
> 伪首部是对严格层次独立性的妥协：传输层校验显式依赖网络层字段。因为端口号只在给定主机内标识进程，并不能判断数据报是否发给本机，需要再次结合 IP 地址判断。



> #### 补充：反码加法
> 先按普通二进制加法求和，再把超出 16 位的进位加回低 16 位，直至不再产生进位。这里不需要预先对操作数取反；全部字求和并完成回卷后，才对结果逐位取反。

> #### 二进制计算示例
>
> 空格仅用于按 4 位分组，不属于数值。两个 16 位字的普通二进制和产生了第 17 位进位：
>
> $$
> \begin{aligned}
> w_1 &= \mathtt{0b1111\,0000\,1111\,0000},\\
> w_2 &= \mathtt{0b0011\,0011\,0011\,0011},\\
> w_1+w_2 &= \mathtt{0b1\,0010\,0100\,0010\,0011}.
> \end{aligned}
> $$
>
> 将最高位的 `1` 回卷到低 16 位，再在 16 位范围内逐位取反：
>
> $$
> \begin{aligned}
> S &= \mathtt{0b0010\,0100\,0010\,0011}+\mathtt{0b1}\\
> &= \mathtt{0b0010\,0100\,0010\,0100},\\
> C &= \sim S=\mathtt{0b1101\,1011\,1101\,1011}.
> \end{aligned}
> $$
>
> 接收端保留收到的 $C$；将其与数据的反码和相加，结果为 16 位全 `1`：
>
> $$
> S+C=
> \mathtt{0b0010\,0100\,0010\,0100}
> +\mathtt{0b1101\,1011\,1101\,1011}
> =\mathtt{0b1111\,1111\,1111\,1111}.
> $$


## 2. UDP——无连接的不可靠服务{#UDP}

### 2.1 基本功能{#UDP基本功能}

UDP 向应用提供无连接、不可靠的数据报服务。

### 2.2 特点{#UDP特点}

1. **无连接：** 发送数据前不执行传输层握手，因此没有传输层建连时延；应用协议仍可定义自己的握手。
2. **不可靠交付：** UDP 不保证数据报到达、按序、不重复或在限定时间内到达。校验和启用且检出损坏时，接收端通常丢弃数据报；UDP
   不确认也不重传。校验和可能漏检，损坏数据仍有被交付给应用的可能。
3. **通信关系灵活：** UDP 可借助 IP 单播、IPv4 广播和 IP 组播支持一对一、一对多与多对多通信；组成员管理和应用语义不属于
   UDP。一对多通信将在后续实验中展开。
4. **保留报文边界：** 应用一次提交的数据对应一个 UDP 数据报。UDP 不合并多个应用报文，也不把一次应用发送拆成多个 UDP 数据报；下层
   IPv4 仍可能对承载它的 IP 数据报分片。
5. **无内建拥塞控制：** UDP 不会根据网络拥塞自动降低发送速率。拥塞仍会造成排队、时延和丢包，持续发送的应用应自行实现合适的拥塞控制。

### 2.3 首部格式{#UDP首部格式}

::::flow{mode="float" side="right" media-width="56%" min-text-width="18rem"}
:::media
<Image {...udpHeaderImage} />
:::
:::body
UDP 首部固定为 8 B。

**源端口号（2 B）：** 与源 IP 共同描述源端点；不需要接收回复时可为 `0`。

**目的端口号（2 B）：** 与目的 IP 共同描述目的端点，接收端据此完成分用。

**长度（2 B）：** UDP 首部与数据的总长度。普通 UDP 数据报最小为 `8` B，字段最大可表示 `65535` B。

**校验和（2 B）：** 覆盖伪首部、UDP 首部和数据，计算与验证方法见[差错检测](#差错检测)。IPv4 中全 `0` 表示未启用校验和；若计算结果为
`0x0000`，发送时写为 `0xffff`。IPv6 除少数专门规定的隧道例外，必须使用有效的 UDP 校验和。
:::
::::
