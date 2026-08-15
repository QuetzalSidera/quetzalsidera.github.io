---
title: 1.A - 计算机网络概述习题课
date: 2026-08-16T10:00:00
tags: [ 计算机网络, 习题 ]
pinned: false
collection: 计算机网络
outline:
  - title: 一、分层与 OSI 参考模型
    slug: 分层与OSI参考模型
  - title: 1. 概念辨析
    slug: 概念辨析
    level: 1
  - title: 二、交换方式与时延
    slug: 交换方式与时延
  - title: 1. 端到端时延计算
    slug: 端到端时延计算
    level: 1
  - title: 三、端到端吞吐量
    slug: 端到端吞吐量
  - title: 1. 路径瓶颈
    slug: 路径瓶颈
    level: 1
head:
  - - meta
    - name: description
      content: 计算机网络概述的配套习题，辨析 OSI 分层概念，并计算电路交换、报文交换、分组交换中的端到端时延与路径吞吐量。
  - - meta
    - name: keywords
      content: 计算机网络习题, OSI, 分组交换, 存储转发, 传输时延, 传播时延, 时延带宽积, 吞吐量
---

```ts image-setup
import { path as miscellaneousImagePath } from '@public/Image/Miscellaneous/path'

const packetProcessingDelayImage = {
  src: miscellaneousImagePath['习题11-处理时延'],
  alt: '主机 A 经过单处理器路由器连接到主机 B，两段链路均为 1 Mb/s',
  align: 'center',
  wrap: false,
  maxHeight: '13rem',
  caption: '题目拓扑：路由器处理单个分组需要 10 ms',
} as const

const packetProcessingTimelineImage = {
  src: miscellaneousImagePath['习题11-处理时延时序'],
  alt: '两个分组依次经历传输、等待、处理和再次传输的时间线',
  align: 'center',
  wrap: false,
  maxHeight: '17rem',
  caption: '解题时序：第二个分组在路由器等待 2 ms，最终于 36 ms 传输完毕',
} as const

const switchingMethodsImage = {
  src: miscellaneousImagePath['习题12-交换方式'],
  alt: '电路交换直连模型以及经过一台路由器的报文交换和分组交换模型',
  align: 'center',
  wrap: false,
  maxHeight: '16rem',
  caption: '电路交换需要先建立连接，另外两种方式需要经过一台路由器存储转发',
} as const

const packetPipelineImage = {
  src: miscellaneousImagePath['习题13-分组流水线'],
  alt: '主机 H1 到 H2 的最短路径经过两台交换机和三段 100 Mb/s 链路',
  align: 'center',
  wrap: false,
  maxHeight: '18rem',
  caption: '最短路径经过两台交换机，共包含三段链路',
} as const

const propagationDelayImage = {
  src: miscellaneousImagePath['习题15-传播时延'],
  alt: '主机 H1 和 H2 经过一台路由器连接，两段链路均为 100 Mb/s',
  align: 'center',
  wrap: false,
  maxHeight: '14rem',
  caption: '两段链路的传输速率和单向传播时延均相同',
} as const

const pathThroughputImage = {
  src: miscellaneousImagePath['习题16-吞吐量'],
  alt: '主机 H1 和 H2 之间有三条内部路径，两端公共链路均为 10 Mb/s',
  align: 'center',
  wrap: false,
  maxHeight: '20rem',
  caption: '三条内部路径共享两端各 10 Mb/s 的链路',
} as const
```

本文整理计算机网络概述中的配套习题，涉及分层概念、交换方式、时延和吞吐量。

---

本文的参考笔记位于[计算机网络概述](./computer-network-01-overview.md)。题目标题中的年份标记表示对应年份的统考真题。

## 一、分层与 OSI 参考模型{#分层与OSI参考模型}

### 1. 概念辨析{#概念辨析}

此类题目的关键是先确定对象或功能的作用范围，再定位层次。实体、协议、接口与服务描述的对象不同；流量控制等功能则可能出现在多个层次，不能只凭功能名称判断。

#### 1.1 题目：OSI 参考模型中的实体指的是（ ）

**选项：**

A. 实现各层功能的规则  
B. 上下层之间进行交互时所要的信息  
C. 各层中实现该层功能的软件或硬件  
D. 同一节点中相邻两层相互作用的地方

**解：** C。在 OSI 参考模型中，实体指各层中实现该层功能的软件或硬件，参见[分层结构与实体](./computer-network-01-overview.md#分层结构与实体)。

实体（entity）是层中的活动元素，可以由软件或硬件实现，例如程序、模块、进程或设备。不同节点中处于同一层并承担相应功能的实体互为对等实体。

选项 A 描述协议；选项 D 描述层间接口或服务访问点（Service Access Point，SAP）；选项 B 只描述相邻层交互时传递的信息。

#### 1.2 题目（2013 统考真题）：在 OSI 参考模型中，功能需由应用层的相邻层实现的是（ ）

**选项：**

A. 对话管理  
B. 数据格式转换  
C. 路由选择  
D. 可靠数据传输

**解：** B。OSI 模型中应用层是第 7 层，其相邻下层是第 6 层表示层。表示层处理通信双方数据表示方式的差异，典型功能包括字符集或编码转换、数据格式转换、数据压缩以及加密和解密。

对话管理属于会话层；路由选择属于网络层；端到端的可靠数据传输通常由传输层提供，在单段链路范围内也可能由数据链路层的可靠传输机制提供，但都不是表示层的功能。

> 此题需要先由“应用层的相邻层”定位到表示层，再由功能反推层次，参见 [OSI 七层模型](./computer-network-01-overview.md#OSI七层模型)。

#### 1.3 题目（2022 统考真题）：在 ISO/OSI 参考模型中，实现两个相邻节点间流量控制功能的是（ ）

**选项：**

A. 物理层  
B. 数据链路层  
C. 网络层  
D. 传输层

**解：** B。流量控制可能出现在多个层次，题干中的限定词是“相邻节点”，它把控制范围限定在一段链路上。数据链路层以帧为数据单位，负责相邻节点之间的数据传输，并可在这一范围内实施差错控制与流量控制。

传输层的流量控制面向端系统中的通信端点，作用范围是端到端；网络层关注分组在网络中的转发，并可能参与网络范围的流量调节与拥塞控制；物理层负责在信道上传输比特，不负责帧级流量控制。

> 判断此类题目的关键是作用范围：相邻节点对应数据链路层，端到端通信对应传输层，参见 [OSI 七层模型](./computer-network-01-overview.md#OSI七层模型)。

## 二、交换方式与时延{#交换方式与时延}

### 1. 端到端时延计算{#端到端时延计算}

设分组长度为 $L$、链路传输速率为 $R$，单个分组在该链路上的传输时延为

$$
d_{\mathrm{trans}}=\frac{L}{R}.
$$

若 $P$ 个等长分组连续通过 $N$ 段等速链路，采用存储转发，并且忽略传播、处理、排队、丢包与重传，则分组流水线的端到端完成时间为

$$
T_{\text{message}}=(P+N-1)d_{\mathrm{trans}}.
$$

存在额外处理资源竞争、链路速率不同或传播时延时，需要把这些条件单独计入，不能直接套用该式。

#### 1.1 题目：在采用存储转发方式的分组交换网中，主机 A 向 B 连续发送两个长度为 $1000\ \mathrm{B}$ 的分组。路由器处理单个分组的时延为 $10\ \mathrm{ms}$，同时最多只能处理一个分组；处理期间到达的新分组进入缓存区，处理器与输出链路可并行工作。忽略传播时延，两段链路的传输速率均为 $1\ \mathrm{Mb/s}$。求从 A 开始发送到 B 接收完两个分组的最短时间

<Image {...packetProcessingDelayImage} />

**解：**

先计算每段链路的传输时延，再按“完整接收—等待处理器—处理—再次发送”的顺序排列两个分组。每个分组在每段链路上的传输时延为

$$
d_{\mathrm{trans}}
=\frac{1000\times 8\ \mathrm{bit}}{1\times10^6\ \mathrm{bit/s}}
=8\ \mathrm{ms}.
$$

<Image {...packetProcessingTimelineImage} />

分组 2 在 $16\ \mathrm{ms}$ 时已经到达路由器，但分组 1 要到 $18\ \mathrm{ms}$ 才处理完，因此产生 $2\ \mathrm{ms}$ 的排队时延。处理器与输出链路是两个资源，所以分组 2 的处理可以和分组 1 在第二段链路上的发送重叠。主机 B 在 $36\ \mathrm{ms}$ 时接收完两个分组。

> 处理与排队可能改变流水线节拍。以第一个分组开始发送的时刻为计时起点，即 $s_1=0$；设第 $p$ 个分组从源端开始发送的时刻为 $s_p$，则其到达目的端的时刻为
>
> $$
> A_p=s_p+\sum_{i=1}^{N}\left(\frac{L}{R_i}+d_{\mathrm{prop},i}\right)
> +\sum_{j=1}^{N-1}\left(d_{\mathrm{proc},p,j}+d_{\mathrm{queue},p,j}\right).
> $$
>
> 整个报文的完成时间为 $T_{\text{message}}=\max_{1\le p\le P}A_p$。各分组的处理与排队时延应按实际时间线确定，不能把单个分组的时延直接乘以分组数。

#### 1.2 题目：主机 H1 和 H2 之间可采用电路交换、报文交换或分组交换。电路交换的建连时间为 $2\ \mathrm{s}$；报文交换和分组交换经过一台路由器连接的两段链路，分组长度为 $5\ \mathrm{kb}$。三种方式的传输速率均为 $2.5\ \mathrm{kb/s}$。忽略传播时延、分组开销和其他线路延迟，推导三种交换方式的完成时间，并分别计算数据量为 $5\ \mathrm{kb}$、$10\ \mathrm{kb}$、$15\ \mathrm{kb}$ 和 $500\ \mathrm{kb}$ 时的结果

<Image {...switchingMethodsImage} />

**解：**

电路交换只支付一次建连时间；报文交换必须在两段链路上各发送一遍完整报文；分组交换则可在两段链路之间形成流水线。设数据量为 $M$，链路速率 $R=2.5\ \mathrm{kb/s}$，分组长度 $L=5\ \mathrm{kb}$，建连时间 $t_{\mathrm{setup}}=2\ \mathrm{s}$，且题目中的数据量均能被 $L$ 整除。三种方式的时间分别为

$$
\begin{aligned}
d_{\mathrm{circuit}}&=t_{\mathrm{setup}}+\frac{M}{R},\\
d_{\mathrm{message}}&=2\frac{M}{R},\\
d_{\mathrm{packet}}&=\left(\frac{M}{L}+1\right)\frac{L}{R}
=\frac{M}{R}+\frac{L}{R}.
\end{aligned}
$$

代入四组数据：

| 数据量 $M$            |              电路交换 |              报文交换 |              分组交换 |
|--------------------|------------------:|------------------:|------------------:|
| $5\ \mathrm{kb}$   |   $4\ \mathrm{s}$ |   $4\ \mathrm{s}$ |   $4\ \mathrm{s}$ |
| $10\ \mathrm{kb}$  |   $6\ \mathrm{s}$ |   $8\ \mathrm{s}$ |   $6\ \mathrm{s}$ |
| $15\ \mathrm{kb}$  |   $8\ \mathrm{s}$ |  $12\ \mathrm{s}$ |   $8\ \mathrm{s}$ |
| $500\ \mathrm{kb}$ | $202\ \mathrm{s}$ | $400\ \mathrm{s}$ | $202\ \mathrm{s}$ |

$M=5\ \mathrm{kb}$ 时三者相同；其余三种数据量下，分组交换与电路交换用时相同，均短于报文交换。

> 对包含 $k$ 段等速链路的路径，若报文被拆成 $P$ 个长度为 $L$ 的分组，忽略处理、排队和重传，则
>
> $$
> \begin{aligned}
> T_{\mathrm{circuit}}&=t_{\mathrm{setup}}+\frac{M}{R}+\sum_{i=1}^{k}d_{\mathrm{prop},i},\\
> T_{\mathrm{message}}&=k\frac{M}{R}+\sum_{i=1}^{k}d_{\mathrm{prop},i},\\
> T_{\mathrm{packet}}&=(P+k-1)\frac{L}{R}+\sum_{i=1}^{k}d_{\mathrm{prop},i}.
> \end{aligned}
> $$
>
> 三式分别体现建连时间、完整报文的逐跳传输和分组流水线。题干中的小写 $\mathrm{b}$ 表示比特；数据量和速率统一使用 $\mathrm{kb}$ 与 $\mathrm{kb/s}$ 时，可以直接相除。

#### 1.3 题目（2010 统考真题）：在采用存储转发方式的分组交换网络中，所有链路的传输速率均为 $100\ \mathrm{Mb/s}$。分组长度为 $1000\ \mathrm{B}$，其中首部为 $20\ \mathrm{B}$。主机 H1 向 H2 发送一个大小为 $980000\ \mathrm{B}$ 的文件，不考虑分组拆装时间和传播时延。求从 H1 开始发送到 H2 接收完文件的最短时间

<Image {...packetPipelineImage} />

**解：**

分组大小包含首部，需要先由有效载荷计算分组数，再选择链路数最少的路径计算存储转发流水线的总时间。每个分组携带的文件数据为

$$
1000-20=980\ \mathrm{B},
$$

因此分组数为

$$
P=\frac{980000}{980}=1000.
$$

最短路径经过两台交换机，共有 $N=3$ 段链路。每个完整分组在一段链路上的传输时延为

$$
d_{\mathrm{trans}}
=\frac{1000\times8\ \mathrm{bit}}{100\times10^6\ \mathrm{bit/s}}
=0.08\ \mathrm{ms}.
$$

第一个分组需要 $3$ 个发送时隙才能到达 H2，此后每隔一个发送时隙到达一个分组。总时间为

$$
T_{\text{message}}
=(P+N-1)d_{\mathrm{trans}}
=(1000+3-1)\times0.08\ \mathrm{ms}
=80.16\ \mathrm{ms}.
$$

> 设文件有效数据量为 $M$、完整分组长度为 $L$、首部长度为 $H$，则分组数为
>
> $$
> P=\left\lceil\frac{M}{L-H}\right\rceil.
> $$
>
> 当所有分组均按长度 $L$ 传输、路径包含 $N$ 段等速链路，并忽略传播、处理与排队时延时，
>
> $$
> T_{\text{message}}=(P+N-1)\frac{L}{R}.
> $$
>
> 首部影响有效载荷和分组数；包含首部的完整分组长度才用于计算传输时延。若前 $P-1$ 个分组的长度均为 $L$，最后一个分组不补齐且实际长度为 $L_{\mathrm{last}}<L$，则在上述条件下
>
> $$
> T_{\text{message}}
> =\frac{(P+N-2)L+L_{\mathrm{last}}}{R}.
> $$

#### 1.4 题目（2023 统考真题）：在分组交换网络中，主机 H1 和 H2 通过路由器互连，两段链路的带宽均为 $100\ \mathrm{Mb/s}$，时延带宽积（单向传播时延 $\times$ 带宽）均为 $1000\ \mathrm{b}$。若 H1 向 H2 发送一个大小为 $1\ \mathrm{MB}$ 的文件，分组长度为 $1000\ \mathrm{B}$，求从 H1 开始发送到 H2 接收完文件的最短时间（注：$1\ \mathrm{M}=10^6$）

<Image {...propagationDelayImage} />

**解：**

时延带宽积给出链路中正在传播的比特数，由它反求单向传播时延。传输时延和传播时延来源不同，需要分别计算。文件被划分为

$$
P=\frac{10^6\ \mathrm{B}}{1000\ \mathrm{B}}=1000
$$

个分组。单个分组在每段链路上的传输时延为

$$
d_{\mathrm{trans}}
=\frac{1000\times8\ \mathrm{bit}}{100\times10^6\ \mathrm{bit/s}}
=0.08\ \mathrm{ms}.
$$

每段链路的单向传播时延为

$$
d_{\mathrm{prop}}
=\frac{1000\ \mathrm{bit}}{100\times10^6\ \mathrm{bit/s}}
=0.01\ \mathrm{ms}.
$$

第一个分组经过两次发送和两次传播后到达 H2，其余 $999$ 个分组以 $0.08\ \mathrm{ms}$ 为间隔流出流水线，因此

$$
\begin{aligned}
T_{\text{message}}
&=2(d_{\mathrm{trans}}+d_{\mathrm{prop}})
+(P-1)d_{\mathrm{trans}}\\
&=2(0.08+0.01)+999\times0.08\\
&=80.10\ \mathrm{ms}.
\end{aligned}
$$

> 设一段链路的时延带宽积为 $\mathrm{BDP}$，则其单向传播时延为
>
> $$
> d_{\mathrm{prop}}=\frac{\mathrm{BDP}}{R}.
> $$
>
> 对 $P$ 个等长分组和 $N$ 段等速链路，若忽略处理与排队时延，则
>
> $$
> T_{\text{message}}
> =(P+N-1)\frac{L}{R}+\sum_{i=1}^{N}d_{\mathrm{prop},i}.
> $$
>
> 时延带宽积中的“时延”只指单向传播时延，不包含把分组推入链路的传输时延。

## 三、端到端吞吐量{#端到端吞吐量}

### 1. 路径瓶颈{#路径瓶颈}

忽略其他流量和协议开销时，一条路径的稳态吞吐量受路径上最慢链路限制。存在多条候选路径且一次仅使用一条路径时，先求每条路径的瓶颈带宽，再选择其中最大者；所有路径共享的链路还会形成共同的上界。

#### 1.1 题目（2024 统考真题）：某分组交换网络及每段链路的带宽如下图所示，求 H1 到 H2 的最大吞吐量，并指出可选路径与公共链路中的瓶颈

<Image {...pathThroughputImage} />

**解：**

忽略其他流量与协议开销时，单条端到端路径的吞吐量等于该路径上各段链路带宽的最小值。分别计算三条候选路径的瓶颈：

| 路径   | 依次经过的链路带宽                        |                路径瓶颈 |
|------|----------------------------------|--------------------:|
| 上方路径 | $10,1000,1000,10\ \mathrm{Mb/s}$ | $10\ \mathrm{Mb/s}$ |
| 中间路径 | $10,1,10\ \mathrm{Mb/s}$         |  $1\ \mathrm{Mb/s}$ |
| 下方路径 | $10,100,100,10\ \mathrm{Mb/s}$   | $10\ \mathrm{Mb/s}$ |

上方路径和下方路径都能达到约 $10\ \mathrm{Mb/s}$，因此 H1 到 H2 的最大吞吐量约为 $10\ \mathrm{Mb/s}$。

> 对一条路径 $\pi$，忽略其他流量和协议开销时，其稳态吞吐量为
>
> $$
> \Gamma_\pi=\min_{i\in\pi}R_i.
> $$
>
> 在候选路径集合 $\mathcal P$ 中，单路径最大吞吐量为 $\Gamma_{\max}=\max_{\pi\in\mathcal P}\Gamma_\pi$。若允许多条路径并发，聚合吞吐量通常还要结合流量分配与共享链路容量计算，不能直接套用该式。本题两端各有一段所有路径共享的 $10\ \mathrm{Mb/s}$ 链路，因此聚合吞吐量也不可能超过 $10\ \mathrm{Mb/s}$；选择上方或下方路径即可达到该上界。
