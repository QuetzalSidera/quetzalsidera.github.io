---
title: 可靠传输与 TCP 习题课
date: 2026-08-21T11:00:00
tags: [ 计算机网络, 传输层, TCP, 习题 ]
pinned: false
collection: 计算机网络
kind: exercise
exerciseFont: kai
outline:
  - title: 一、TCP 基础
    slug: TCP基础习题
  - title: 1. TCP 特点
    slug: TCP服务特点习题
    level: 1
  - title: 2. TCP 首部
    slug: TCP首部与效率
    level: 1

  - title: 二、传输性能与工作过程
    slug: TCP性能与工作过程
  - title: 1. 吞吐率计算
    slug: TCP窗口吞吐率计算
    level: 1
  - title: 2. TCP 工作过程
    slug: TCP连接管理习题
    level: 1

  - title: 三、序号与时延
    slug: TCP序号与时延
  - title: 1. 序号计算
    slug: TCP序号与确认习题
    level: 1
  - title: 2. 时延计算
    slug: TCP时延计算习题
    level: 1

  - title: 四、窗口计算
    slug: TCP窗口计算
  - title: 1. 窗口演化
    slug: TCP窗口演化
    level: 1
  - title: 2. 序号窗口综合计算
    slug: TCP序号窗口综合计算
    level: 1

head:
  - - meta
    - name: description
      content: TCP 配套习题，覆盖服务与首部、吞吐率、工作过程、序号、时延、窗口演化及综合计算。
  - - meta
    - name: keywords
      content: 计算机网络习题, TCP, TCP首部, 滑动窗口, TCP序号, 三次握手, 四次挥手, 流量控制, 拥塞控制
---

```ts image-setup
import { path as miscellaneousImagePath } from '@public/Image/Miscellaneous/path'

const tcp2016TopologyImage = {
  src: miscellaneousImagePath['TCP习题-2016综合拓扑'],
  alt: 'Web 服务器 S 经过三台路由器连接到包含交换机、集线器和主机 H3 的局域网拓扑',
  align: 'center',
  wrap: false,
  maxHeight: '25rem',
  caption: '2016 年统考综合题原图；本题只使用 H3 与 Web 服务器 S 之间的 TCP 条件',
} as const

const tcp2021ReceiveWindowImage = {
  src: miscellaneousImagePath['TCP习题-2021接收窗口时序'],
  alt: '主机甲发送序号 501 且含 200 字节数据的报文段，随后收到确认号 501 和接收窗口 500 字节的报文段',
  align: 'center',
  wrap: false,
  maxHeight: '20rem',
  caption: '2021 年统考题原图：确认号、已发送数据与接收窗口共同决定可用窗口',
} as const

const tcp2025SendWindowImage = {
  src: miscellaneousImagePath['TCP习题-2025发送窗口时序'],
  alt: '主机甲连续发送序号 2001 和 3001 的两个 1000 字节报文段，随后收到确认号 3001 和接收窗口 4000 字节的报文段',
  align: 'center',
  wrap: false,
  maxHeight: '25rem',
  caption: '2025 年统考题原图：新确认推进窗口，同时仍有一个报文段未确认',
} as const

const tcpThroughput05Image = {
  src: miscellaneousImagePath['TCP吞吐率-题库大题05'],
  alt: 'TCP 窗口吞吐率时序：发送 60 个报文段后等待确认，标出报文传输时延与 RTT',
  align: 'center',
  wrap: false,
  maxHeight: '20rem',
  caption: '题库大题 05 解析图：一个窗口的发送周期为 RTT 加单个报文段传输时延',
} as const

```

本文整理可靠传输与 TCP 的配套习题。参考笔记见[可靠传输与 TCP](./computer-network-07-transport-layer-tcp.md)。

---

除题目另有说明外，拥塞窗口题采用配套笔记中的经典 Reno 离散轮次模型：初始 `cwnd=1 MSS`，发送窗口取 `min(rwnd, cwnd)`。

## 一、TCP 基础{#TCP基础习题}

### 1. TCP 特点{#TCP服务特点习题}

::::::exercise-set
:::::exercise-group{start="1"}
::::exercise{type="single"}
:::stem
下列描述中，不是 TCP 服务特点的是（ ）。
:::
:::choices{choice-columns="4"}

- 字节流
- 全双工
- 可靠
- 支持广播

:::
:::answer
D
:::
:::solution
TCP 提供点对点、全双工的可靠字节流，一条连接只有两个端点，即：**TCP 不支持广播**，故选 D。
:::
::::
:::::
::::::

### 2. TCP 首部{#TCP首部与效率}

::::::exercise-set
:::::exercise-group{start="2"}
::::exercise{type="single"}
:::stem
下列关于 TCP 首部格式的描述中，错误的是（ ）。
:::
:::choices{choice-columns="1"}

- 首部长度为 `20`～`60 B`，固定部分为 `20 B`
- 端口号字段依次表示源端口号与目的端口号
- 首部长度总是 `4 B` 的整数倍
- TCP 校验和伪首部中的 IP 协议字段为 `17`

:::
:::answer
D
:::
:::solution
**TCP 的 IP 协议号为 `6`，`17` 是 UDP 的协议号**，故 D 错误。数据偏移字段以 4 B 为单位，取值 `5`～`15`，所以 TCP 首部为
`20`～`60 B` 且总是 4 B 的整数倍。

:::
::::

::::exercise{type="single"}
:::stem
TCP 报文段标志字段中的（ ）置 `1` 时，表示必须释放连接并重新建立连接。
:::
:::choices{choice-columns="4"}

- `URG`
- `RST`
- `ACK`
- `FIN`

:::
:::answer
B
:::
:::solution
**`RST=1` 表示复位连接**，常用于异常或不存在的连接状态。`FIN=1` 只关闭本端的发送方向，不等于立即复位整条连接。

> 参见[控制位](./computer-network-07-transport-layer-tcp.md#TCP首部格式)
:::
::::

::::exercise{type="single" source="2021 统考真题"}
:::stem
若大小为 `12 B` 的应用层数据分别通过 1 个 UDP 数据报和 1 个 TCP 段传输，则该 UDP 数据报和 TCP 段实现的有效载荷（应用层数据）最大传输效率分别是（ ）。
:::
:::choices{choice-columns="2"}

- `37.5%`，`16.7%`
- `37.5%`，`37.5%`
- `60.0%`，`16.7%`
- `60.0%`，`37.5%`

:::
:::answer
D
:::
:::solution
不使用选项时，UDP 首部为 `8 B`，TCP 首部最短为 `20 B`：

$$
\eta_{UDP}=\frac{12}{12+8}=60\%,\qquad
\eta_{TCP}=\frac{12}{12+20}=37.5\%.
$$
:::
::::
:::::
::::::

## 二、传输性能与工作过程{#TCP性能与工作过程}

### 1. 吞吐率计算{#TCP窗口吞吐率计算}

窗口限制每个 RTT 内可保持在途的数据量。信道足够快且忽略其他限制时，吞吐率上界为 $W/RTT$。

::::::exercise-set
:::::exercise-group{start="5"}
::::exercise{type="calculation" answer-lines="6"}
:::stem
TCP 发送窗口的最大尺寸为 `64 KB`，网络平均往返时间为 `20 ms`。只考虑单向传输且假设信道带宽不受限，TCP 可获得的最大数据传输速率是多少？
:::
:::answer
约 `26.2 Mb/s`。
:::
:::solution
一个 RTT 最多确认一个窗口的数据：

$$
R_{\max}=\frac{64\times1024\times8}{20\times10^{-3}}
=26.2144\times10^6\ \mathrm{bit/s}
\approx26.2\ \mathrm{Mb/s}.
$$
:::
::::

::::exercise{type="calculation" answer-lines="8"}
:::stem
一个 TCP 连接的信道带宽为 `100 Mb/s`，单个报文大小为 `1000 B`，发送窗口固定为 `60` 个报文，单向端到端时延为 `20 ms`
。只考虑单向传输，忽略确认报文的发送时延和各层首部开销。TCP 最大平均数据传输速率和信道利用率分别是多少？
:::
:::answer
最大平均速率约为 `11.98 Mb/s`，信道利用率约为 `11.98%`。
:::
:::solution
<Image {...tcpThroughput05Image} />

单个报文的传输时延为
$$
T_D=\frac{1000\times8}{100\times10^6}=0.08\ \mathrm{ms},
$$

而 $RTT=2\times20=40\ \mathrm{ms}$。从发送首个报文到收到其确认的周期为

$$
T=T_D+RTT=40.08\ \mathrm{ms}.
$$

窗口内的 60 个报文段连续发送只需 $60T_D=4.8\ \mathrm{ms}$；下一窗口仍需等待首段确认，因此周期按 $RTT+T_D$ 计算。

一个窗口共 `60 000 B`：

$$
R=\frac{60\times1000\times8}{40.08\times10^{-3}}
\approx11.98\ \mathrm{Mb/s},\qquad
U=\frac{11.98}{100}\approx11.98\%.
$$
:::
::::

::::exercise{type="calculation" answer-lines="7"}
:::stem
TCP 报文段载荷为 `1500 B`，最大分组存活时间为 `120 s`。为使 TCP 序号不会在旧报文仍可能存活时循环回来并发生重叠，不考虑帧长限制，线路允许的最快有效载荷速率是多少？
:::
:::answer
应小于约 `286.3 Mb/s`，即约 `35.8 MB/s`。
:::
:::solution
TCP 序号按字节编号，32 位序号空间包含 $2^{32}$ 个字节。序号空间的使用时间应不少于 MSL：

$$
R<\frac{2^{32}\times8}{120}
\approx2.8633\times10^8\ \mathrm{bit/s}
=286.3\ \mathrm{Mb/s}.
$$

按报文段计算时，约发送 $2^{32}/1500$ 个满载报文段后回绕；报文段数再乘每段 `1500 B`，载荷长度相消，因此结果仍由 $2^{32}$
字节的序号空间决定。TCP 首部不消耗数据序号。
:::
::::
:::::
::::::

### 2. TCP 工作过程{#TCP连接管理习题}

::::::exercise-set
:::::exercise-group{start="8"}
::::exercise{type="single"}
:::stem
下列关于 TCP 工作过程的描述中，错误的是（ ）。
:::
:::choices{choice-columns="1"}

- TCP 建立连接需要三次握手
- 连接建立后，两端应用进程进行全双工字节流传输
- 只有客户端可以主动提出释放连接的请求
- 典型 TCP 连接释放需要四次挥手

:::
:::answer
C
:::
:::solution
连接任一端都可以主动关闭，客户端与服务器身份不限制关闭发起方，故 C 错误。
:::
::::

::::exercise{type="single" source="2021 统考真题"}
:::stem
若客户首先向服务器发送 `FIN` 段请求断开 TCP 连接，则当客户收到服务器发送的 `FIN` 段并向服务器发送 `ACK` 段后，客户的 TCP 状态转换为（ ）。
:::
:::choices{choice-columns="2"}

- `CLOSE_WAIT`
- `TIME_WAIT`
- `FIN_WAIT_1`
- `FIN_WAIT_2`

:::
:::answer
B
:::
:::solution
主动关闭方发送最终 ACK 后进入 `TIME-WAIT`，等待 `2MSL` 后才进入 `CLOSED`。
:::
::::

::::exercise{type="single"}
:::stem
TCP 使用滑动窗口实现流量控制。发送方收到对方的零窗口通知后，应启动（ ）计时器；计时器超时后发送零窗口探测报文段。
:::
:::choices{choice-columns="4"}

- 重传
- 保活
- 时间等待
- 持续
:::
:::answer
D
:::
:::solution
零窗口触发持续计时器。若探测后的确认仍通告零窗口，发送方重新设置持续计时器，避免非零窗口更新丢失后双方永久等待。

> **保活计时器**用于关闭长期空闲的 TCP 连接，避免持续占据资源。**持续计时器**用于零窗口探测。
:::
::::

:::::
::::::

## 三、序号与时延{#TCP序号与时延}

### 1. 序号计算{#TCP序号与确认习题}

::::::exercise-set
:::::exercise-group{start="11"}
::::exercise{type="single"}
:::stem
主机 A 与 B 建立 TCP 连接。A 首个 SYN 报文段的 `seq=211`；释放连接时，A 向 B 发送的第四次挥手报文段的 `seq=985`。本次通信中
A 向 B 共发送了（ ）字节数据。
:::
:::choices{choice-columns="4"}

- `771`
- `772`
- `773`
- `774`

:::
:::answer
B
:::
:::solution
SYN 消耗序号 `211`，首个数据字节从 `212` 开始。最终纯 ACK 使用 `seq=985`，说明最后一个 `FIN` 使用 `seq=984`，因此最后一字节数据对应
`seq=983`。则数据长度为 $L$：

$$
L=983-212+1=772
$$

> 计算数据长度的题目，**关键在于计算出数据第一块 $seq_{begin}$ 与最后一块 $seq_{end}$ 的序号**，数据长度 $L$ 等于
> $$
> L=seq_{end}-seq_{begin}+1
> $$
:::
::::

::::exercise{type="single"}
:::stem
某客户与服务器建立 TCP 连接，当连接断开时，客户先向服务器发送一个标志 `FIN=1`
的报文段 A，此报文段中 `seq` 值为 $x$、`ack` 值为 $y$。一段时间后，客户收到了服务器发来
的一个标志 `FIN=1` 的报文段 B，则下列关于报文段 B 的说法中，正确的是（ ）。
:::
:::choices{choice-columns="2"}

- B 的 `seq` 一定为 $y$
- B 的 `seq` 一定为 $y+1$
- B 的 `ack` 一定为 $x$
- B 的 `ack` 一定为 $x+1$

:::
:::answer
D
:::
:::solution
按题库默认的 FIN 不携带数据，A 中的 FIN 消耗一个序号，所以服务器确认该方向时使用 `ack=x+1`。服务器在半关闭期间仍可继续发送数据，其 FIN 的 `seq`
取决于实际发送量，不一定为 $y$ 或 $y+1$。（若 FIN 携带数据，确认号还需再加上其负载长度。）
:::
::::

::::exercise{type="calculation" answer-lines="4"}
:::stem
仍设 A 的 `FIN=1` 报文段为 `seq=x`、`ack=y`。若服务器在半关闭期间发送数据后，以 `seq=z` 的 `FIN=1` 报文段结束发送（FIN 单独发送且不携带数据），求服务器在半关闭期间发送的数据量；若未给出 MSS，能否确定报文段数？
:::
:::answer
可以确定发送了 `z-y` B 数据，但无法仅据此确定报文段数。
:::
:::solution
服务器收到 A 的 FIN 后，发送方向的下一个序号从 `y` 开始；服务器发送的数据占用 `y`～`z-1`，而 `seq=z` 的 FIN 占用下一个序号。因此数据长度为
$$
L=z-y.
$$
报文段数还取决于 MSS 和实际分段方式，题干未给出，不能由序号差唯一确定。
:::
::::

::::exercise{type="single" source="2013 统考真题"}
:::stem
主机甲与主机乙之间已建立一个 TCP 连接，双方持续有数据传输，且数据无差错与丢失。若甲收到一个来自乙的 TCP 段，
该段的序号为 `1913`、确认序号为 `2046`、有效载荷为 `100 B`，则甲立即发送给乙的 TCP 段的序号和确认序号分别是（ ）。
:::
:::choices{choice-columns="2"}

- `2046`，`2012`
- `2046`，`2013`
- `2047`，`2012`
- `2047`，`2013`
:::
:::answer
B
:::
:::solution
收到的 `ack=2046` 表示乙期望甲下次从序号 `2046` 发送，所以甲的 `seq=2046`。乙的 100 B 数据覆盖 `1913`～`2012`，甲应确认下一个字节
`2013`：

$$
ack=1913+100=2013.
$$
:::
::::

::::exercise{type="single" source="2011 统考真题"}
:::stem
主机甲与主机乙之间已建立一个 TCP 连接，主机甲向主机乙发送了 3 个连续的 TCP 段，分别包含 `300 B`、`400 B` 和 `500 B` 的有效载荷，第 3 个段的序号为
`900`。若主机乙仅正确接收到第 1 个段和第 3 个段，则主机乙发送给主机甲的确认序号是（ ）。
:::
:::choices{choice-columns="4"}

- `300`
- `500`
- `1200`
- `1400`

:::
:::answer
B
:::
:::solution
第 3 个段的 `seq=900`，所以第 2 个段的结束序号为 `899`。第 2 个段携带 `400 B`，起始序号为

$$
900-400=500.
$$

乙未收到第 2 个段，只能确认第 1 个段及其之前的连续字节；下一期望序号为 `500`，故选 B。
:::
::::

:::::
::::::

### 2. 时延计算{#TCP时延计算习题}

::::::exercise-set
:::::exercise-group{start="16"}
::::exercise{type="single"}
:::stem
TCP 客户与服务器的通信已经结束，端到端往返时间为 $RTT$。时刻 $t$ 客户请求断开连接，从 $t$
起服务器释放该连接的最短时间是（ ）。
:::
:::choices{choice-columns="4"}

- $0.5RTT$
- $RTT$
- $1.5RTT$
- $2RTT$

:::
:::answer
C
:::
:::solution
客户 FIN 在 $0.5RTT$ 后到达服务器。最短情况下服务器没有剩余数据，将 ACK 与自身 FIN 合并发送；客户收到后立即发送最终 ACK，该
ACK 再用 $0.5RTT$ 到达服务器。因此服务器在

$$
0.5RTT+0.5RTT+0.5RTT=1.5RTT
$$

后进入 `CLOSED`。
:::
::::

::::exercise{type="single" source="2024 统考真题" keep-together="false"}
:::stem
假设主机 H 通过 TCP 向服务器发送长度为 `3000 B` 的报文，往返时间 `RTT=10 ms`，最长报文段寿命 `MSL=30 s`，最大报文段长度 `MSS=1000 B`，忽略 TCP 段的传输时延，
报文传输结束后 H 首先请求断开连接，则从 H 请求建立 TCP 连接时刻起，到 H 进入 `CLOSED`
状态为止，所需的时间至少是（ ）。
:::
:::choices{choice-columns="2"}

- `30.03 s`
- `30.04 s`
- `60.03 s`
- `60.04 s`

:::
:::answer
D
:::
:::solution
按本题采用的经典初始窗口 `1 MSS`：

1. $t=0$ 发送 SYN，$t=1RTT$ 收到 SYN + ACK；第三次握手携带首个 `1000 B`；
2. $t=2RTT$ 收到首段 ACK，`cwnd` 增至 `2 MSS`，发送剩余 `2000 B`；
3. $t=3RTT$ 收到剩余数据的 ACK，立即发送 FIN；
4. 服务器立即合并回复 ACK + FIN，H 在 $t=4RTT$ 收到 FIN、回复 ACK 并进入 `TIME-WAIT`。

因此

$$
T_{\min}=4RTT+2MSL
=4\times10\ \mathrm{ms}+60\ \mathrm{s}
=60.04\ \mathrm{s}.
$$

现代 TCP 的初始拥塞窗口可能大于 `1 MSS`；本题结论依赖题库采用的经典慢启动模型。
:::
::::
:::::
::::::

## 四、窗口计算{#TCP窗口计算}

### 1. 窗口演化{#TCP窗口演化}

> **窗口演化题的固定步骤：** 将每条边写成
> $(cwnd_1,rwnd_1)\xrightarrow[\text{发送量}]{\text{时间}}(cwnd_2,rwnd_2)$，节点表示一个发送轮次开始时的状态；箭头上方标注时长或事件，下面标注该轮发送量。先用当前状态计算
> $W=\min(cwnd,rwnd)$ 和本轮发送量，收到确认后按拥塞控制规则更新 `cwnd`。接收缓存只存入数据时，`rwnd` 还要扣除本轮已到达的数据量。
> 式中的 $\infty$ 仅表示解题时可忽略 `rwnd`，并非接收方实际通告了无限窗口；若后续需要跟踪 `rwnd` 而其初值未知，则标作问号。

先求 $W=\min(rwnd,cwnd)$，再扣除已发送但尚未确认的数据，得到当前可用窗口。

::::::exercise-set
:::::exercise-group{start="18"}
::::exercise{type="single"}
:::stem
A 与 B 建立 TCP 连接，$MSS=1\ \mathrm{KB}$。某时 `ssthresh=2 KB`、`cwnd=4 KB`；下一 RTT 内 A 发送 `4 KB` 数据并全部得到确认，确认报文通告
`rwnd=2 KB`。再下一个 RTT 内，A 最多能发送（ ）数据。
:::
:::choices{choice-columns="4"}

- `2 KB`
- `8 KB`
- `5 KB`
- `4 KB`

:::
:::answer
A
:::
:::solution
状态与发送量单位均为 KB：

$$
(4,?)
\xrightarrow[\text{发送 }4]{1\,\mathrm{RTT}}
(5,2).
$$

当前处于拥塞避免阶段，全部确认后 `cwnd` 增至 `5 KB`；接收方只通告 `rwnd=2 KB`。因此发送窗口为

$$
W=\min(5,2)=2\ \mathrm{KB}.
$$
:::
::::

::::exercise{type="single" source="2010 统考真题"}
:::stem
主机甲和主机乙之间已建立一个 TCP 连接，TCP 最大段长为 `1000 B`。
若主机甲的当前拥塞窗口为 `4000 B`，在主机甲向主机乙连续发送两个最大段后，成功收到
主机乙发送的第一个段的确认段，确认段中通告的接收窗口大小为 `2000 B`，则此时主机甲
还可以向主机乙发送的最大字节数是（ ）。
:::
:::choices{choice-columns="4"}

- `1000`
- `2000`
- `3000`
- `4000`
:::
:::answer
A
:::
:::solution
状态与发送量单位均为 B。题干未给出初始 `rwnd`，也不足以确定收到 ACK 后 `cwnd` 的精确值；但新 ACK 不会使其低于 `4000 B`：

$$
(4000,?)
\xrightarrow[\text{发送 }2\times1000]{\text{首段 ACK 到达}}
(cwnd',2000),
\qquad cwnd'\ge 4000.
$$

总发送窗口为

$$
W=\min(cwnd',2000)=2000\ \mathrm{B}.
$$

第二个 `1000 B` 报文段仍未确认并占用窗口，所以可用窗口为 $2000-1000=1000\ \mathrm{B}$。
:::
::::


::::exercise{type="single" source="2015 统考真题"}
:::stem
主机甲和主机乙新建一个 TCP 连接，甲的拥塞控制初始阈值为 `32 KB`，
甲始终向乙以 $MSS=1\ \mathrm{KB}$ 大小的段发送数据，并一直有数据发送；乙为该连接分配
`16 KB` 接收缓存，并对每个数据段进行确认，忽略段传输延迟。若乙收到的数据全部
存入缓存，不被取走，则甲从连接建立成功时刻起，未出现发送超时的情况下，经过 `4RTT` 后，
甲的发送窗口是（ ）。
:::
:::choices{choice-columns="4"}

- `1 KB`
- `8 KB`
- `16 KB`
- `32 KB`
:::
:::answer
A
:::
:::solution
状态与发送量单位均为 KB：

$$
\begin{aligned}
(1,16)&\xrightarrow[\text{发送 }1]{1\,\mathrm{RTT}}(2,15),\\
(2,15)&\xrightarrow[\text{发送 }2]{1\,\mathrm{RTT}}(4,13),\\
(4,13)&\xrightarrow[\text{发送 }4]{1\,\mathrm{RTT}}(8,9),\\
(8,9)&\xrightarrow[\text{发送 }8]{1\,\mathrm{RTT}}(16,1).
\end{aligned}
$$

四轮慢启动分别发送 `1`、`2`、`4`、`8 KB`，累计写入接收缓存 `15 KB`。此时

$$
rwnd=16-15=1\ \mathrm{KB},\qquad cwnd=16\ \mathrm{KB},
$$

故发送窗口为 `1 KB`。
:::
::::

::::exercise{type="single"}
:::stem
甲向乙发起 TCP 连接，$MSS=1\ \mathrm{KB}$。乙每个确认段均通告 `rwnd=10 KB`。时刻 $t$ 发生超时，此时 `cwnd=16 KB`；此后不再超时。经过
`10RTT`，甲的发送窗口是（ ）。
:::
:::choices{choice-columns="4"}

- `10 KB`
- `12 KB`
- `14 KB`
- `15 KB`

:::
:::answer
A
:::
:::solution
按 Reno，超时后 `ssthresh=8 KB`、`cwnd` 重置为 `1 MSS`。接收窗口始终为 `10 KB`。

状态与发送量单位均为 KB。前 `5RTT` 为

$$
\begin{aligned}
(1,10)&\xrightarrow[\text{发送 }1]{1\,\mathrm{RTT}}(2,10),\\
(2,10)&\xrightarrow[\text{发送 }2]{1\,\mathrm{RTT}}(4,10),\\
(4,10)&\xrightarrow[\text{发送 }4]{1\,\mathrm{RTT}}(8,10),\\
(8,10)&\xrightarrow[\text{发送 }8]{1\,\mathrm{RTT}}(9,10),\\
(9,10)&\xrightarrow[\text{发送 }9]{1\,\mathrm{RTT}}(10,10).
\end{aligned}
$$

后 `5RTT` 为

$$
\begin{aligned}
(10,10)&\xrightarrow[\text{发送 }10]{1\,\mathrm{RTT}}(11,10),\\
(11,10)&\xrightarrow[\text{发送 }10]{1\,\mathrm{RTT}}(12,10),\\
(12,10)&\xrightarrow[\text{发送 }10]{1\,\mathrm{RTT}}(13,10),\\
(13,10)&\xrightarrow[\text{发送 }10]{1\,\mathrm{RTT}}(14,10),\\
(14,10)&\xrightarrow[\text{发送 }10]{1\,\mathrm{RTT}}(15,10).
\end{aligned}
$$

第 `10 RTT` 结束时状态为 `(15，10)`：`cwnd` 继续增长，但发送量始终受 `rwnd=10 KB` 限制。

$$
W=\min(rwnd,cwnd)=10\ \mathrm{KB}.
$$
:::
::::

::::exercise{type="single"}
:::stem
TCP 的 `ssthresh` 初始为 `8` 个报文段；`cwnd` 上升到 `12` 时发生超时，随后重新执行慢启动与拥塞避免。第 13 次传输时 `cwnd`
为（ ）个报文段。
:::
:::choices{choice-columns="4"}

- `4`
- `6`
- `7`
- `8`

:::
:::answer
C
:::
:::solution
窗口与发送量的单位均为报文段数。超时前第 1～4 轮为

$$
\begin{aligned}
(1,\infty)&\xrightarrow[\text{发送 }1]{1\,\mathrm{RTT}}(2,\infty),\\
(2,\infty)&\xrightarrow[\text{发送 }2]{1\,\mathrm{RTT}}(4,\infty),\\
(4,\infty)&\xrightarrow[\text{发送 }4]{1\,\mathrm{RTT}}(8,\infty),\\
(8,\infty)&\xrightarrow[\text{发送 }8]{1\,\mathrm{RTT}}(9,\infty).
\end{aligned}
$$

第 5～8 轮为

$$
\begin{aligned}
(9,\infty)&\xrightarrow[\text{发送 }9]{1\,\mathrm{RTT}}(10,\infty),\\
(10,\infty)&\xrightarrow[\text{发送 }10]{1\,\mathrm{RTT}}(11,\infty),\\
(11,\infty)&\xrightarrow[\text{发送 }11]{1\,\mathrm{RTT}}(12,\infty),\\
(12,\infty)&\xrightarrow[\text{发送 }12]{1\,\mathrm{RTT}\ \text{后超时}}(1,\infty).
\end{aligned}
$$

超时后 `ssthresh=12/2=6`、`cwnd=1`。第 9～12 轮为

$$
\begin{aligned}
(1,\infty)&\xrightarrow[\text{发送 }1]{1\,\mathrm{RTT}}(2,\infty),\\
(2,\infty)&\xrightarrow[\text{发送 }2]{1\,\mathrm{RTT}}(4,\infty),\\
(4,\infty)&\xrightarrow[\text{发送 }4]{1\,\mathrm{RTT}}(6,\infty),\\
(6,\infty)&\xrightarrow[\text{发送 }6]{1\,\mathrm{RTT}}(7,\infty).
\end{aligned}
$$

因此第 13 次传输开始时 `cwnd=7`。
:::
::::

::::exercise{type="single"}
:::stem
甲、乙刚建立 TCP 连接，$MSS=2\ \mathrm{KB}$。乙及时清空缓存，使 `rwnd` 始终为 `20 KB`；`ssthresh=16 KB`，$RTT=10\ \mathrm{ms}$
，忽略发送时延且不发生拥塞。甲的发送窗口第一次达到 `20 KB` 需要（ ）。
:::
:::choices{choice-columns="4"}

- `40 ms`
- `50 ms`
- `60 ms`
- `70 ms`

:::
:::answer
B
:::
:::solution
状态与发送量单位均为 KB：

$$
\begin{aligned}
(2,20)&\xrightarrow[\text{发送 }2]{1\,\mathrm{RTT}}(4,20),\\
(4,20)&\xrightarrow[\text{发送 }4]{1\,\mathrm{RTT}}(8,20),\\
(8,20)&\xrightarrow[\text{发送 }8]{1\,\mathrm{RTT}}(16,20),\\
(16,20)&\xrightarrow[\text{发送 }16]{1\,\mathrm{RTT}}(18,20),\\
(18,20)&\xrightarrow[\text{发送 }18]{1\,\mathrm{RTT}}(20,20).
\end{aligned}
$$

`cwnd` 经慢启动三轮达到 `16 KB`，再以每 RTT `2 KB` 的速度增长到 `20 KB`。共需

$$
5RTT=50\ \mathrm{ms}.
$$
:::
::::

::::exercise{type="single"}
:::stem
一个 TCP 连接的 $MSS=1\ \mathrm{KB}$。`cwnd=34 KB` 时收到 3 个冗余 ACK；接下来 `4RTT` 内报文段传输均成功。全部报文段得到确认后，
`cwnd` 是（ ）。
:::
:::choices{choice-columns="4"}

- `8 KB`
- `16 KB`
- `20 KB`
- `21 KB`

:::
:::answer
D
:::
:::solution
按题目采用的简化 Reno，3 个冗余 ACK 触发窗口调整；状态单位为 KB：

$$
(34,\infty)
\xrightarrow{\text{3 个冗余 ACK}}
(17,\infty).
$$

$$
ssthresh=cwnd=\frac{34}{2}=17\ \mathrm{KB}.
$$

随后四轮为

$$
\begin{aligned}
(17,\infty)&\xrightarrow[\text{发送 }17]{1\,\mathrm{RTT}}(18,\infty),\\
(18,\infty)&\xrightarrow[\text{发送 }18]{1\,\mathrm{RTT}}(19,\infty),\\
(19,\infty)&\xrightarrow[\text{发送 }19]{1\,\mathrm{RTT}}(20,\infty),\\
(20,\infty)&\xrightarrow[\text{发送 }20]{1\,\mathrm{RTT}}(21,\infty).
\end{aligned}
$$

$$
cwnd=17+4=21\ \mathrm{KB}.
$$

严格 Reno 在快恢复期间会临时令 `cwnd=ssthresh+3 MSS`；本题按教辅简化模型计算。
:::
::::


::::exercise{type="single"}
:::stem
甲向乙发起 TCP 连接，$MSS=1\ \mathrm{KB}$、$RTT=3\ \mathrm{ms}$。乙的接收缓存为 `16 KB`，且只存入数据而不取出。甲从连接建立成功到发送窗口达到
`8 KB` 的最短时间，以及此时乙接收缓存的可用空间分别是（ ）。
:::
:::choices{choice-columns="2"}

- `3 ms`，`15 KB`
- `9 ms`，`9 KB`
- `6 ms`，`13 KB`
- `12 ms`，`8 KB`

:::
:::answer
B
:::
:::solution
状态与发送量单位均为 KB：

$$
\begin{aligned}
(1,16)&\xrightarrow[\text{发送 }1]{1\,\mathrm{RTT}}(2,15),\\
(2,15)&\xrightarrow[\text{发送 }2]{1\,\mathrm{RTT}}(4,13),\\
(4,13)&\xrightarrow[\text{发送 }4]{1\,\mathrm{RTT}}(8,9).
\end{aligned}
$$

三轮慢启动耗时 `3RTT=9 ms`，累计发送

$$
1+2+4=7\ \mathrm{KB},
$$

接收缓存还剩 $16-7=9\ \mathrm{KB}$。此时发送窗口为 $\min(8,9)=8\ \mathrm{KB}$。
:::
::::


::::exercise{type="single" source="2009 统考真题"}
:::stem
一个 TCP 连接总以 `1 KB` 的最大段长发送 TCP 段，发送方有足够多的数据要发送，
当拥塞窗口为 `16 KB` 时发生了超时，若接下来的 `4RTT` 时间内的 TCP 段的传输都是成功的，
则当第 4 个 RTT 时间内发送的所有 TCP 段都得到肯定应答时，拥塞窗口大小是（ ）。
:::
:::choices{choice-columns="4"}

- `7 KB`
- `8 KB`
- `9 KB`
- `16 KB`

:::
:::answer
C
:::
:::solution
超时后 `ssthresh=8 KB`、`cwnd=1 KB`。状态与发送量单位均为 KB：

$$
\begin{aligned}
(1,\infty)&\xrightarrow[\text{发送 }1]{1\,\mathrm{RTT}}(2,\infty),\\
(2,\infty)&\xrightarrow[\text{发送 }2]{1\,\mathrm{RTT}}(4,\infty),\\
(4,\infty)&\xrightarrow[\text{发送 }4]{1\,\mathrm{RTT}}(8,\infty),\\
(8,\infty)&\xrightarrow[\text{发送 }8]{1\,\mathrm{RTT}}(9,\infty).
\end{aligned}
$$

前三轮执行慢启动，第四轮进入拥塞避免；确认完成后 `cwnd=9 KB`，故选 C。
:::
::::
:::::
::::::

### 2. 序号窗口综合计算{#TCP序号窗口综合计算}

::::::exercise-set
:::::exercise-group{start="27"}
::::exercise{type="single" source="2021 统考真题" keep-together="false"}
:::stem
设主机甲通过 TCP 向主机乙发送数据，部分过程如下图所示。甲在 $t_0$ 时刻发送一个序号
`seq=501`、封装 `200 B` 数据的段，在 $t_1$ 时刻收到乙发送的序号
`seq=601`、确认序号 `ack_seq=501`、接收窗口 `rcvwnd=500 B` 的段，则甲在未收到新的确认
段之前，可以继续向乙发送的数据序号范围是（ ）。

<Image {...tcp2021ReceiveWindowImage} />
:::
:::choices{choice-columns="2"}

- `501`～`1000`
- `601`～`1100`
- `701`～`1000`
- `801`～`1100`

:::
:::answer
C
:::
:::solution
`ack=501`、`rwnd=500 B` 给出的窗口覆盖序号 `501`～`1000`。甲已发送的 200 B 覆盖 `501`～`700`，因此还能发送 `701`～`1000`，共
`300 B`。

> **需要注意题干说明是“继续发送”，还是“可以发送”**。“继续发送”只统计当前尚未发送的序号；已经发送但尚未确认的字节仍占用发送窗口，不能再次计入。
:::
::::

::::exercise{type="calculation" source="2016 统考真题" answer-lines="14" keep-together="false"}
:::stem
假定下图中的 H3 访问 Web 服务器 S 时，S 为新建的 TCP 连接分配了 `20 KB`（`K=1024`）的接收缓存，最大段长
`MSS=1 KB`，平均往返时间 `RTT=200 ms`。H3 建立连接时的初始序号为 `100`，且持续以 MSS 大小的段向 S 发送数据，
拥塞窗口初始阈值为 `32 KB`；S 对收到的每个段进行确认，并通告新的接收窗口。假定 TCP 连接建立完成后，S 端的
TCP 接收缓存仅有数据存入而无数据取出。请回答下列问题：

<Image {...tcp2016TopologyImage} />
:::
:::parts{start="1"}

1. 在 TCP 连接建立过程中，H3 收到的 S 发送过来的第二次握手 TCP 段的 SYN 和 ACK 标志位的值分别是多少？确认序号是多少？
2. H3 收到的第 8 个确认段所通告的接收窗口是多少？此时 H3 的拥塞窗口变为多少？H3 的发送窗口变为多少？
3. H3 的发送窗口等于 `0` 时，下一个待发送的数据段序号是多少？H3 从发送第 1 个数据段到发送窗口等于 `0` 时刻为止，平均数据传输速率是多少？（忽略段的传输时延。）
4. 若 H3 与 S 之间的通信已经结束，在 $t$ 时刻 H3 请求断开该连接，则从 $t$ 时刻起，S 释放该连接的最短时间是多少？
:::
:::answer
① `SYN=1`、`ACK=1`、`ack=101`；② `rwnd=12 KB`、`cwnd=9 KB`、发送窗口 `9 KB`；③ `seq=20581`，平均速率 `163.84 kb/s`；④
`300 ms`。
:::
:::solution
**① 第二次握手。** H3 的 SYN 使用 `seq=100` 并消耗一个序号，故 S 回复

$$
SYN=1,\quad ACK=1,\quad ack=100+1=101.
$$

**② 第 8 个确认。** S 已缓存 `8 KB`，剩余空间为

$$
rwnd=20-8=12\ \mathrm{KB}.
$$

经典慢启动从 `1 MSS` 开始，每个新 ACK 增加 `1 MSS`；收到第 8 个确认后 `cwnd=9 KB`。因此

$$
W=\min(12,9)=9\ \mathrm{KB}.
$$

**③ 零窗口。** 缓存填满时共接收 `20 KB`。首个数据字节序号为 `101`，故

$$
seq_{next}=101+20\times1024=20581.
$$

五轮发送量依次为 `1`、`2`、`4`、`8`、`5 KB`，共用 $5RTT=1\ \mathrm{s}$：

$$
R=\frac{20\times1024\times8}{1}
=163.84\ \mathrm{kb/s}.
$$

**④ 服务器释放。** H3 的 FIN 经 $0.5RTT$ 到达 S；最短情况下 S 合并回复 ACK + FIN，该报文经 $0.5RTT$ 到达 H3，H3 的最终 ACK
再经 $0.5RTT$ 到达 S。因此

$$
T_{S,\min}=1.5RTT=300\ \mathrm{ms}.
$$
:::
::::

::::exercise{type="single" source="2025 统考真题" keep-together="false"}
:::stem
主机甲通过 TCP 向主机乙发送数据的部分过程如下图所示，`seq` 为序号，`ack_seq` 为确认序号，`rcvwnd` 为接收窗口。
甲在 $t_0$ 时刻的拥塞窗口和发送窗口均为 `2000 B`，拥塞控制阈值为 `8000 B`，$MSS=1000\ \mathrm{B}$，
甲始终以 MSS 大小发送 TCP 段。若甲在 $t_1$ 时刻收到如图所示的确认段，则甲在未收到新的确认段之前，还可继续向乙发送的 TCP
段数是（ ）。

<Image {...tcp2025SendWindowImage} />
:::
:::choices{choice-columns="4"}

- `2`
- `3`
- `4`
- `5`
:::
:::answer
A
:::
:::solution
`ack=3001` 确认了序号 `2001`～`3000`。当前处于慢启动，收到一个新 ACK 后

$$
cwnd=2000+1000=3000\ \mathrm{B}.
$$

接收窗口为 `4000 B`，故发送窗口为 `3000 B`。序号 `3001`～`4000` 的一个报文段仍未确认，占用 `1000 B`；可用窗口为 `2000 B`，还能发送
`2` 个 MSS。

> 慢启动状态下，**收到一个 ACK 后，增加一个 MSS，而一个 RTT 翻倍只是推论，不可机械套入。**
:::
::::
:::::
::::::
