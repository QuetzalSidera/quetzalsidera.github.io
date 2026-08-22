---
title: 可靠传输与 TCP
date: 2026-08-21T08:00:00
tags: [ 计算机网络, 传输层, TCP, ARQ ]
pinned: false
collection: 计算机网络
outline:
  - title: 1. 可靠传输原理
    slug: 可靠传输原理
  - title: 1.1 组成机制
    slug: 可靠传输组成机制
    level: 1
  - title: 1.2 滑动窗口与序号
    slug: 滑动窗口与序号
    level: 1
  - title: 1.3 ARQ
    slug: ARQ
    level: 1
  - title: 1.4 信道利用率
    slug: ARQ信道利用率
    level: 1

  - title: 2. TCP
    slug: TCP
  - title: 2.1 服务与特点
    slug: TCP服务与特点
    level: 1
  - title: 2.2 首部格式
    slug: TCP首部格式
    level: 1
  - title: 2.3 序号、确认与重传
    slug: TCP序号确认与重传
    level: 1
  - title: 2.3.1 序号
    slug: TCP序号
    level: 2
  - title: 2.3.2 确认与重传
    slug: TCP确认
    level: 2
  - title: 2.4 连接建立
    slug: TCP连接建立
    level: 1
  - title: 2.5 连接释放
    slug: TCP连接释放
    level: 1
  - title: 2.6 流量控制
    slug: TCP流量控制
    level: 1
  - title: 2.7 拥塞控制
    slug: TCP拥塞控制
    level: 1
  - title: 2.8 TCP 与 UDP
    slug: TCP与UDP
    level: 1

head:
  - - meta
    - name: description
      content: 可靠传输中的滑动窗口、停等、GBN、SR 与信道利用率，以及 TCP 的首部、可靠字节流、连接管理、流量控制和经典拥塞控制。
  - - meta
    - name: keywords
      content: 计算机网络, 传输层, 可靠传输, ARQ, 滑动窗口, GBN, SR, TCP首部, 三次握手, 四次挥手, 流量控制, 拥塞控制
---

```ts image-setup
import { path as miscellaneousImagePath } from '@public/Image/Miscellaneous/path'

const arqComparisonImage = {
  src: miscellaneousImagePath['ARQ协议对比'],
  alt: '停等、GBN 与 SR 的发送窗口、接收窗口、确认语义、计时器和丢包重传范围对比',
  align: 'right',
  wrap: false,
  maxHeight: '52rem',
  caption: '三种 ARQ 的核心差异：窗口大小、ACK 语义、接收缓存和重传范围',
} as const

const arqUtilizationImage = {
  src: miscellaneousImagePath['ARQ信道利用率'],
  alt: '停等协议发送一个数据分组后等待确认，以及窗口大小为四的流水线连续发送四个分组的时序',
  align: 'right',
  wrap: false,
  maxHeight: '38rem',
  caption: '无差错条件下，流水线通过增加一个周期内的发送时间提高信道利用率',
} as const

const arqWindowImage = {
  src: miscellaneousImagePath['ARQ发送接收窗口'],
  alt: '发送方与接收方的离散报文序号，两行之间用数据和确认箭头连接，并标出发送窗口、接收窗口及四类报文',
  align: 'right',
  wrap: false,
  maxHeight: '42rem',
  caption: '两个窗口，四个区域',
} as const

const tcpHeaderImage = {
  src: miscellaneousImagePath['TCP首部格式'],
  alt: 'TCP 经典首部按三十二位分行，包含端口、序号、确认号、控制位、窗口、校验和、紧急指针与选项',
  align: 'right',
  wrap: false,
  maxHeight: '36rem',
  caption: 'TCP 经典首部格式：固定部分 20 B，含选项时最多 60 B',
} as const

const tcpHandshakeImage = {
  src: miscellaneousImagePath['TCP三次握手'],
  alt: '客户端和服务端通过 SYN、SYN ACK、ACK 三个报文段同步初始序号并进入已建立状态',
  align: 'right',
  wrap: false,
  maxHeight: '43rem',
  caption: 'TCP 三次握手中的状态、标志位、序号和确认号',
} as const

const tcpTeardownImage = {
  src: miscellaneousImagePath['TCP四次挥手'],
  alt: '客户端主动关闭 TCP 连接，双方分别关闭发送方向，客户端最终进入两倍 MSL 的时间等待状态',
  align: 'right',
  wrap: false,
  maxHeight: '52rem',
  caption: 'TCP 典型四次挥手；半关闭期间被动关闭方仍可继续发送数据',
} as const

const tcpSendWindowImage = {
  src: miscellaneousImagePath['TCP发送窗口'],
  alt: 'TCP 字节序号空间中的已确认、已发送未确认、可立即发送和暂不可发送区域，以及零窗口探测流程',
  align: 'right',
  wrap: false,
  maxHeight: '38rem',
  caption: 'TCP 发送窗口按字节计量，其上限同时受接收窗口与拥塞窗口约束',
} as const

const tcpCongestionControlImage = {
  src: miscellaneousImagePath['TCP拥塞控制'],
  alt: '经典 TCP Reno 教学模型中拥塞窗口经过慢启动、拥塞避免、超时和三个冗余确认后的变化',
  align: 'right',
  wrap: false,
  maxHeight: '41rem',
  caption: '经典 Reno 教学模型中的慢启动、拥塞避免、快速重传与快速恢复',
} as const
```

本篇介绍了可靠传输机制的抽象，并说明了 TCP 如何在不可靠的 IP 服务上提供可靠字节流。

---

[前篇](./computer-network-06-transport-layer-udp.md)整理了传输层的复用、分用、差错检测与 UDP。

## 1. 可靠传输原理{#可靠传输原理}

### 1.1 组成机制{#可靠传输组成机制}

可靠传输要求接收方最终得到无损坏、无缺口、不重复且按序的数据。底层信道仍可能发生比特差错、丢失、重复、失序和过度时延，协议通过端点状态与冗余信息处理这些问题。

ARQ协议，即自动重传请求（Automatic Repeat-reQuest），是OSI模型中的错误纠正协议之一。
它通过使用确认和重传这两个机制，在不可靠服务的基础上实现可靠的信息传输。

可靠传输的组成部分

1. **差错检测：** 使用校验和等机制检出报文中的比特差错。
2. **确认报文与序号：** `ACK` 确认已正确接收的数据；`NAK` 可选，用于显式报告损坏或缺失；序号用于识别顺序、缺口和重复。
3. **发送窗口与接收窗口：** 分别限制发送端可发送和接收端可接受的序号范围，并配合缓存管理在途或失序数据。
4. **重传机制：** 通过计时器检测确认超时，并重传未确认数据。

> 校验和只负责检错，计算方法见前篇的[差错检测](./computer-network-06-transport-layer-udp.md#差错检测)。损坏报文可触发
`NAK`
> ，也可直接丢弃并等待发送方超时；后者不需要单独设计 `NAK` 报文。

### 1.2 滑动窗口与序号{#滑动窗口与序号}

**发送窗口**是当前允许发送的连续序号集合。窗口内可同时存在已发送但未确认的数据和尚未发送的数据；收到有效确认后，窗口基序号前移。

**接收窗口**是当前允许接收的连续序号集合。窗口外报文被丢弃；窗口内的失序报文可被暂时缓存。

::::flow{mode="float" side="right" media-width="66%" min-text-width="19rem"}
:::media
<Image {...arqWindowImage} />
:::
:::body
如右图中，$send\_begin$、$send\_end$ 是发送窗口的首、末序号；$recv\_begin$、
$recv\_end$ 是接收窗口的首、末序号。两个窗口将报文序列分为四个区域：

1. **已确认：** $(0, send\_begin)$ 中的报文已发送，发送端也已收到确认。
2. **发送端未接收确认：** $[send\_begin, recv\_begin)$ 中的报文已被接收端确认，但发送端尚未收到确认。
3. **接收端未发送确认：** $[recv\_begin, send\_end]$ 中的报文已发送，但接收端尚未发出确认。
4. **未发送：** $(send\_end, ...)$ 中的报文尚未发送。

:::
::::

发送窗口记为 $W_S$ ，接收窗口记为 $W_R$，则有：

$$
W_S=send\_end-send\_begin+1\\
W_R=recv\_end-recv\_begin+1\\
$$

设 $N_i$ 为区域 $i$ 的报文数。区域 2、3 是发送端尚未收到确认的报文，因此

$$
N_2=recv\_begin-send\_begin\\
N_3=send\_end-recv\_begin+1\\

N_{noack}=N_2+N_3
\le W_S=send\_end-send\_begin+1.
$$

也就是说：**发送端尚未收到确认的报文数量小于等于发送窗口大小**。

设序号字段为 $k$ 位，序号空间 $M$ 大小为：

$$
M=2^k,
$$


所有序号运算均按模 $M$ 进行，即$0\equiv2^k \pmod{M}$。**窗口长度之和必须小于序号空间**，否则序号回绕后，接收方可能无法区分迟到的旧报文与新报文。

即：

$$W_S+W_R\le M$$

::::flow{mode="float" side="right" media-width="58%" min-text-width="18rem"}
:::media
| 协议 | 发送窗口 $W_S$ | 接收窗口 $W_R$ | 序号约束 $W_S+W_R\le M$ |
|---|---:|---:|---|
| 停等 | $1$ | $1$ | $M=2$ 即可 |
| GBN | $>1$ | $1$ | $W_S+1\le M$ |
| SR | $>1$ | $>1$ | $W_S+W_R\le M$ |
:::
:::body
GBN 的接收窗口固定为 `1`。

SR 常取对称窗口：

$$
W_S=W_R\le \frac{M}{2},
$$

既充分使用序号空间，也避免窗口回绕后新旧报文重叠。
:::
::::

发送窗口与接收窗口分别属于发送端与接收端的本地状态。数据和 `ACK` 在途时，两端观察到的进度可能不同。

> #### 小结：窗口与序号关系
>
> **先后关系：** 一般而言，接收端窗口领先于发送端窗口，二者始终相邻，但可能无交集（即恰好 $send\_end= recv\_begin -1$）。
>
> **大小关系：** $W_S+W_R\le M = 2^k $，且一般 $W_S = W_R$。
>
> - 若 $W_S \le W_R$，则会导致无效的接收端缓存分配开销（接收窗口永远填不满）。
> - 若 $W_S \ge W_R$，则会导致无效的发送端流量（乱序报文始终丢弃）。
>
> **序号分界：** 两个窗口将报文序列分为四个区域。

### 1.3 ARQ{#ARQ}

::::flow{mode="float" side="right" media-width="64%" min-text-width="19rem"}
:::media
<Image {...arqComparisonImage} />
:::
:::body
**停止等待协议：**

- **窗口：**$W_S=W_R=1$。发送方每次只发送一个报文，收到确认后才能发送下一个；只需 `0`、`1`
  两个序号区分新报文与重传报文。
- **计时器：** 发送方只为唯一的在途报文计时。

**后退 N 帧（GBN）：**

- **窗口：** $W_S>1$、$W_R=1$。接收方只接收下一个期望报文，丢弃失序报文并发送最近状态的**累计确认**。
- **计时器：**发送方通常只为**最早未确认报文维护一个计时器**
  。累计确认推进窗口后，若仍有未确认报文，则为新的最早未确认报文重新计时，否则停止计时器。最早未确认报文超时后，重传它及其后的全部未确认报文。

**选择重传（SR）：**

- **窗口：** $W_S>1$、$W_R>1$。接收方缓存窗口内正确但失序的报文，并逐个发送**选择确认**。
- **计时器：**发送方为**每个未确认报文维护独立的逻辑计时器**。某个报文超时只重传该报文。窗口基序号得到确认后窗口才前移，不会因此重置其他报文的计时器。
  :::
  ::::

> “`ACK n`”有两种语义：表示“序号 `n` 及之前均已收到”（累计确认），或“序号 `n` 已收到”（选择确认）。TCP 的 `ack=n` 表示“下一个期望序号为
`n`”，属于累计确认的一种变体。

::::flow{mode="float" side="right" media-width="68%" min-text-width="18rem"}
:::media
| 比较项 | 停等 | GBN | SR |
|---|---|---|---|
| 流水线 | 否 | 是 | 是 |
| 确认语义 | 单报文确认 | 累计确认 | 选择确认 |
| 失序报文 | 丢弃 | 丢弃 | 窗口内缓存 |
| 发送端计时器 | 唯一在途报文 | 最早未确认报文 | 每个未确认报文 |
| 超时重传 | 当前报文 | 全部未确认报文 | 仅超时报文 |
| 接收缓存 | 无 | 无 | 至少覆盖接收窗口 |
:::
:::body
停等最简单，但长 RTT 下空闲时间长。GBN 用较小的接收状态换取成批重传；SR 以接收缓存和多个逻辑计时器换取更小的重传范围。
:::
::::

### 1.4 信道利用率{#ARQ信道利用率}

信道利用率是一个发送周期内，发送方实际发送数据的时间占周期总时间的比例。下文按无差错、无重传的理想模型计算。

设数据分组长度为 $L$、发送链路速率为 $R$，数据分组的传输时延为

$$
T_D=\frac{L}{R}.
$$

再设往返传播时延为 $RTT$，确认报文的传输时延为 $T_A$。忽略处理、排队、差错和重传，停止等待的发送周期为 $T_D+RTT+T_A$，信道利用率为

$$
U_{\text{stop}}
=\frac{T_D}{T_D+RTT+T_A}.
$$
::::flow{mode="float" side="right" media-width="66%" min-text-width="18rem"}
:::media
<Image {...arqUtilizationImage} />
:::
:::body
窗口大小为 $N$ 的流水线可在一个周期内连续发送至多 $N$ 个等长分组：

$$
U_{\text{pipe}}
=\min\left(
1,\frac{NT_D}{T_D+RTT+T_A}
\right).
$$

当

$$
NT_D\ge T_D+RTT+T_A
$$

时，首个确认在窗口发送完之前返回，窗口可以持续前移，理想利用率达到 `1`。理想吞吐量上界为 $U R$。
:::
::::

> 信道利用率只比较**发送时间**。发生丢包时，GBN 可能重传整个未确认后缀，SR 通常只重传缺失报文，二者的**有效吞吐量**
> 不再相同；重复传输的字节不能计作有效数据。

## 2. TCP{#TCP}

### 2.1 服务与特点{#TCP服务与特点}

TCP 在 IP 之上提供面向连接的可靠字节流。

::::flow{mode="float" side="right" media-width="54%" min-text-width="18rem"}
:::media
| 特点 | 含义 |
|---|---|
| 面向连接 | 传输前建立状态，结束时释放状态 |
| 可靠交付 | 无损坏、无缺口、不重复并按序交付 |
| 字节流 | 不保留应用一次写入的数据边界 |
| 全双工 | 两个方向各有发送、接收缓存与序号空间 |
| 点对点 | 一条连接只有两个通信端点 |
| 拥塞控制 | 根据路径反馈调节注入网络的数据量 |
:::
:::body
**TCP 连接：** 由 `(源 IP, 源端口, 目的 IP, 目的端口)` 四元组标识。连接状态只保存在两个端系统中；路由器不维护 TCP
连接，因此这种软件连接不同于电路交换预留的物理或逻辑电路。

**TCP 报文段：** 应用的一次写入可以被 TCP 拆成多个报文段，多次写入也可以合并到一个报文段。

TCP 与 UDP 不同，后者将整个应用数据作为一个报文段发送。

TCP 报文段长度受到最大报文段长度 （`MSS`，Maximum Segment Size） 限制，`MSS` 只限制 TCP 报文段的**数据部分**，不包含 TCP 首部。

:::
::::

### 2.2 首部格式{#TCP首部格式}

::::flow{mode="float" side="right" media-width="66%" min-text-width="19rem"}
:::media
<Image {...tcpHeaderImage} />
:::
:::body
TCP 报文段由首部与数据组成。首部固定部分为 `20 B`；选项与填充最多 `40 B`，因此首部总长为 `20`～`60 B`。

**源端口、目的端口（各 16 位）：** 标识两端应用端点。

**序号 `seq`（32 位）：** 本报文段数据部分第一个字节的序号，按模 $2^{32}$ 运算。

**确认号 `ack`（32 位）：** 期望收到对方的下一个字节序号；仅当 `ACK=1` 时有效。

**数据偏移（4 位）：** TCP 首部占用的长度（单位为 4B），取值 `5`～`15`。
:::
::::

**保留位：** 一般占 6 位并置 `0`。现代 TCP 还定义了 ECN 等扩展控制位，本篇不展开。

**控制位：**

- **`URG`：** 紧急位，紧急指针有效，与紧急指针配合使用。
- **`ACK`：** 确认位，确认号有效；连接建立后的正常报文段均置 `ACK=1`，纯 ACK 不消耗序号。
- **`PSH`：** 推送位，尽快向应用交付数据。
- **`RST`：** 复位位，重置或拒绝连接。表示TCP出现严重错误，必须释放连接并重新建立连接。
- **`SYN`：** 同步位，同步序号、建立连接；即使不携带数据也消耗一个序号。
- **`FIN`：** 终止位，关闭本方向；即使不携带数据也消耗一个序号。

**窗口（16 位）：** 接收方窗口余量（`rwnd`），报文发送方作为接收方时，从 `ack` 指向的字节起还能接收的字节数。

**校验和（16 位）：** 覆盖 IP 伪首部、TCP 首部和数据；算法见[差错检测](./computer-network-06-transport-layer-udp.md#差错检测)
。IPv4 伪首部中的协议号为 `6`，TCP 校验和不能关闭。

**紧急指针（16 位）：** `URG=1` 时有效，用于指出紧急数据与一般数据边界，由于紧急数据一般放在一般数据之前，因此也等同于紧急数据的长度（单位为字节）。

**选项与填充：** 常见选项包括 MSS、窗口扩大、SACK 许可和时间戳；填充使首部长度为 4 B 的整数倍。

> 确认信息可以附在反向数据报文段中，这称为**捎带确认**。

> 纯 ACK 报文不占序号，但其 `seq` 等于携带报文时数据首字节的序号。

### 2.3 序号、确认与重传{#TCP序号确认与重传}

#### 2.3.1 序号{#TCP序号}

TCP 对字节编号，而不是对报文段编号。若报文段的 `seq=S`、数据长度为 $d$，则数据覆盖 $S$～$S+d-1$；下一个数据字节的序号为 $S+d$。

SYN 和 FIN 即使不携带数据，也各消耗一个序号；纯 ACK 不消耗序号。一般地，

$$
\operatorname{seq_i}
=seq_{i-1}+dataLen_{i-1}+\operatorname{SYN_{i-1}}+\operatorname{FIN_{i-1}}
\pmod {2^{32}}.\\

\operatorname{ack_i}
=\operatorname{seq_{i+1}}
$$

其中，$\operatorname{seq_i}$ 是发送方第 $i$ 份报文的序号，$\operatorname{ack_i}$ 是接收方对第 $i$ 份报文的确认序号。

#### 2.3.2 确认与重传{#TCP确认}

**TCP 使用累计确认：** `ack=N` 表示序号小于 `N` 的字节已经连续、按序到达，下一份报文期望序号 `N`。

**TCP 通常只维护一个重传计时器**，可视为关联最早未确认数据，计时器超时将触发重传。对同一个报文的多次确认称为冗余 ACK；首次正常
ACK 之后再收到
3 个冗余 ACK，将触发快速重传。

> 每个报文的第一个 `ACK` 不算冗余 `ACK` 。

> 值得注意的是，TCP 对收到的失序数据如何处理留有实现空间，接收方可以暂时缓存，也可以直接丢弃。

> ##### 补充：TCP 重传超时 `RTO`
>
> TCP 根据往返时延样本动态设置重传超时 `RTO`。`SampleRTT` 从某报文段首次发送到其累计确认到达计时；通常一次只抽样一个未确认报文段。重传报文不测量
> RTT，因为收到确认时无法判断它确认原发送还是重传，存在 Karn 歧义。令 $\alpha=1/8$、$\beta=1/4$：
>
> $$
> \begin{aligned}
> EstimatedRTT
> &=(1-\alpha)EstimatedRTT+\alpha SampleRTT,\\
> DevRTT
> &=(1-\beta)DevRTT
> +\beta\lvert SampleRTT-EstimatedRTT\rvert,\\
> RTO&=EstimatedRTT+4DevRTT.
> \end{aligned}
> $$

累计确认与单一计时器具有 GBN 特征；缓存失序数据、超时通常只重传最早未确认报文段，以及 SACK 选择确认又具有 SR 特征。TCP
的差错恢复更准确地说是二者的混合，而不是标准 GBN 或 SR。

### 2.4 连接建立{#TCP连接建立}

TCP 通过三次握手确认双向通信能力，协商相关参数并分配必要资源。

::::flow{mode="float" side="right" media-width="59%" min-text-width="19rem"}
:::media
<Image {...tcpHandshakeImage} />
:::
:::body

1. **连接请求：** 客户端发送 `SYN` 从 `CLOSED` 进入 `SYN-SENT`。
2. **连接接受：** 服务端发送 `SYN ACK`，收到请求后从 `LISTEN` 进入 `SYN-RECEIVED`。
3. **最终确认：** 客户端回复 `ACK` 并进入 `ESTABLISHED`；服务端收到后也进入 `ESTABLISHED`。

:::
::::

前两个 SYN 在本文模型中不携带数据，但各消耗一个序号。第三次握手可以捎带客户端数据；若不携带数据，则其后的首个数据字节仍使用序号
`x+1`。

忽略报文传输、处理和排队时延，从客户端发送 SYN 开始：

- 约 `1 RTT` 后，客户端收到 SYN + ACK，可随第三次握手发送数据；
- 约 `1.5 RTT` 后，服务端收到第三次握手并确认连接建立。

第三次握手使服务端确认自己的 SYN 已到达客户端，避免只凭陈旧或重复的连接请求建立错误状态。

> #### TCP 作图 
> 在 TCP 学习中，作图可以更深刻地理解 TCP 传输过程，作图中各个要素如下所示：
> - **`seq`：** 序号。表示本报文段数据部分第一个字节的序号；`SYN`、`FIN` 即使不携带数据也各占用一个序号。
> - **`ACK`/`ack`：** 确认信息。连接建立后的每个正常报文段均置 `ACK=1`，因此作图时每个报文段都要标出有效的
    >   `ack`；首个 `SYN` 是例外。
> - **其它控制位：** 特别是 `SYN` 与 `FIN`，其他控制位按报文状态标注。
> - **状态标识：** 表示主机状态的短语。如`ESTABLISHED`、`CLOSED`与`FIN-WAIT-1`等。

### 2.5 连接释放{#TCP连接释放}

TCP 是全双工协议，两个发送方向分别关闭。下图以客户端主动关闭、服务端被动关闭为例。

> 此图中，客户端是主动方，服务端是被动方。若服务器是主动方，只需要把图反过来即可。

::::flow{mode="float" side="right" media-width="60%" min-text-width="19rem"}
:::media
<Image {...tcpTeardownImage} />
:::
:::body

1. **主动关闭：** 客户端发送 `FIN`，进入 `FIN-WAIT-1`。FIN 消耗一个序号。
2. **确认 FIN：** 服务端回复 `ACK`，进入 `CLOSE-WAIT`；客户端收到后进入 `FIN-WAIT-2`。
3. **被动方关闭：** 服务端在应用**完成剩余发送**后，发送 `FIN`，进入 `LAST-ACK`。
4. **最终确认：** 客户端回复 `ACK`，进入 `TIME-WAIT`；服务端收到后进入 `CLOSED`。

:::
::::

第一次 FIN 只关闭客户端到服务端的方向。服务端在 `CLOSE-WAIT` 中仍可发送数据，因此第一次 ACK 的 `seq=v` 与随后 FIN 的
`seq=w` 不一定相同；若 $w>v$，则发送了 $w-v$ 字节。

> 一方发送 FIN 后，另一方仍然可以发送数据，此时，称 TCP 连接处于“半关”状态。

> #### TIME-WAIT 与 MSL
>
> 主动关闭方在 `TIME-WAIT` 中等待 `2MSL`（Maximum Segment Lifetime）。若最终 ACK 丢失，被动关闭方会重传
> FIN，主动关闭方仍可再次确认；等待也使旧连接中滞留的报文段从网络中消失，避免污染相同四元组的新连接。

若服务端在 `CLOSE-WAIT` 期间无数据发送，且忽略传输、处理、排队与应用等待，从客户端发送 FIN 起，服务端最早约 `1.5 RTT`
后关闭；客户端约在 `1 RTT` 时进入 `TIME-WAIT`，再等待 `2MSL` 后关闭。

ACK 与 FIN 可以合并，同时关闭也会产生不同状态路径；“四次挥手”描述的是典型的先确认、后关闭过程。

> **保活计时器：** TCP keepalive 是可选机制，客户端和服务端均可启用。连接长期空闲后，端点可发送探测报文；连续探测无响应时关闭连接。

### 2.6 流量控制{#TCP流量控制}

流量控制与拥塞控制都限制发送方，但观察对象不同。

::::flow{mode="float" side="right" media-width="54%" min-text-width="18rem"}
:::media
| 比较项 | 流量控制 | 拥塞控制 |
|---|---|---|
| 保护对象 | 接收端缓存 | 网络路径与共享资源 |
| 状态变量 | `rwnd` | `cwnd`、`ssthresh` |
| 主要反馈 | 接收端通告窗口 | ACK、丢包、ECN 等 |
| 性质 | 端到端速度匹配 | 分布式网络负载调节 |
:::
:::body
接收方根据接收缓存的剩余空间计算 `rwnd`，并在 TCP 首部的窗口字段中通告。
`ack=N`、`rwnd=W` 表示从字节 `N` 起（不含）最多还能接收 `W` 字节。

发送方还要服从拥塞窗口 `cwnd`。在忽略其他限制时，发送端的未确认数据量 $Len_{noack}$ 与发送窗口长度 $W_S$ 满足

$$
Len_{noack} \le W_S = \min(rwnd,cwnd).
$$

:::
::::

TCP 窗口按字节计量，$Len_{noack}$ 与 $W_S$ 同理。在每个报文段恰好承载 `1 MSS` 数据时，可用

$$
\frac{W_S}{MSS}=
\frac{\min(rwnd,cwnd)}{MSS}
$$

计算发送窗口长度（单位为`MSS`）。

> **持续计时器:** 当接收方通告 `rwnd=0` 时，发送方暂停发送新数据并启动**持续计时器**
> 。计时器超时后发送零窗口探测，迫使接收方重新通告窗口；若此前的非零窗口更新丢失，探测可避免双方永久等待。

### 2.7 拥塞控制{#TCP拥塞控制}

TCP 发送方用拥塞窗口 `cwnd` 限制注入网络的未确认数据，并用慢启动门限 `ssthresh` 选择增长方式。`cwnd` 以 MSS 为单位。

::::flow{mode="float" side="right" media-width="64%" min-text-width="19rem"}
:::media
<Image {...tcpCongestionControlImage} />
:::
:::body
**慢启动：** $cwnd < ssthresh$ 时，每收到一个确认新数据的 ACK，$cwnd$ 增加约 $1 MSS$
；一轮中的报文都得到确认后（耗时 $1RTT$），$cwnd$ 翻倍。

**拥塞避免：** $cwnd >= ssthresh$ 后，每个新 ACK 使

$$
cwnd\leftarrow cwnd+\frac{MSS^2}{cwnd},
$$

合计每个 RTT 约增加 $1 MSS$，即**加性增**。

**超时：** 取丢包前 $cwnd$ 的一半作为新 $ssthresh$，将 $cwnd$ 置为 $1 MSS$，重新进入慢启动，即**乘性减**。

**3 个冗余 ACK：** 立即快速重传缺失报文段；令 $ssthresh=cwnd/2$、$cwnd=ssthresh$，直接进入拥塞避免。
:::
::::

> 若 $cwnd<ssthresh<2cwnd$，1RTT， `cwnd` 将等于 `ssthresh`，不越过门限后再翻倍或加一。

拥塞避免不能保证不发生拥塞。它以 ACK 表示路径仍在交付数据，以超时或冗余 ACK 表示可能丢包；稳定阶段呈现“加性增、乘性减”的锯齿变化。

### 2.8 TCP 与 UDP{#TCP与UDP}

TCP 与 UDP 的数据抽象不同：

- **TCP：** 面向连接的可靠字节流。TCP 将应用字节流按 `MSS` 分段为多个报文段，按序重组，并通过确认、重传、流量控制和拥塞控制交付。
- **UDP：** 无连接数据报。一次应用发送对应一个 UDP 数据报，保留报文边界；UDP 不提供确认、重传、排序、流量控制或拥塞控制。

TCP 与 UDP 对比如下：

**开销：**

| 对比维度     | TCP                        | UDP         |
|----------|----------------------------|-------------|
| **首部开销** | 20B ~ 60B（可包含 TCP 选项）      | 固定 8B       |
| **传输效率** | 较低，额外控制机制和较大首部带来开销         | 较高，首部小，处理简单 |
| **实时性**  | 面向连接，需要通过三次握手建立连接，四次挥手释放连接 | 无连接，不需要建立连接 |

**可靠性：**

| 对比维度    | TCP                            | UDP           |
|---------|--------------------------------|---------------|
| **可靠性** | 可靠传输，通过确认（ACK）、超时重传、序号保证数据可靠到达 | 不可靠传输，不保证数据到达 |
| **有序性** | 保证数据按发送顺序交付                    | 不保证数据顺序       |

**报文格式：**

| 对比维度     | TCP                                      | UDP                            |
|----------|------------------------------------------|--------------------------------|
| **数据抽象** | 字节流（Byte Stream），不保留应用层报文边界              | 数据报（Datagram），保留应用层报文边界        |
| **数据分段** | 有。TCP根据 `MSS` 将应用数据流分割成多个 TCP 段（Segment） | 无。UDP 一个应用发送对应一个 UDP 数据报，不主动拆分 |

**工作方式：**

| 对比维度     | TCP                        | UDP                     |
|----------|----------------------------|-------------------------|
| **连接方式** | 面向连接，需要通过三次握手建立连接，四次挥手释放连接 | 无连接，不需要建立连接             |
| **通信模式** | 主要用于点对点通信                  | 支持一对一、一对多、多对多通信（如广播、多播） |

**传输控制：**

| 对比维度     | TCP                             | UDP            |
|----------|---------------------------------|----------------|
| **流量控制** | 有，通过接收窗口（rwnd）限制发送速度，防止接收方缓冲区溢出 | 无，需要应用自行控制发送速率 |
| **拥塞控制** | 有，通过慢启动、拥塞避免、快速重传等机制控制网络负载      | 无，不感知网络拥塞      |
| **确认机制** | 有，接收方通过 ACK 确认数据接收情况            | 无确认机制          |
| **重传机制** | 有，丢失数据会自动重传                     | 无，需要应用层自行实现    |

**适用场景：**

| 对比维度     | TCP                             | UDP                             |
|----------|---------------------------------|---------------------------------|
| **适用场景** | 文件传输、网页访问、邮件、数据库连接等**要求可靠性**的场景 | 音视频直播、在线游戏、DNS、物联网等**要求实时性**的场景 |
| **典型协议** | HTTP/HTTPS、FTP、SSH、SMTP、MySQL   | DNS、DHCP、TFTP、RTP、QUIC底层UDP     |

> #### 补充：MSS
> `MSS` 是 TCP 报文段数据部分的最大长度，不含 TCP 首部。通常按：
> $$MSS= MTU - Len(Head_{IP}) - Len(Head_{TCP})$$
> 估算，并在三次握手时，通过 `MSS` 选项相互协商。
>
> 因为 UDP 是无连接、无握手的，因此没有 `MSS`，不协商 `MSS`，也不按 `MSS` 分段；数据报过大时交由
> IP 层按 IPv4/IPv6 的分片规则处理。

> #### 补充：分段与分片
> 1. 分段（segmentation）是传输层操作，TCP 将字节流拆为多个 TCP 报文段，每段数据部分不超过 `MSS`。
> 2. 分片（fragmentation）是 IP 层操作，IPv4 数据报超过出口链路 `MTU` 时可能被拆为多个 IP 分片（IPv6 仅由源主机分片），接收端在
     > IP 层重组。
>
> UDP 数据报无分段，但同样可能被 IP 分片。
