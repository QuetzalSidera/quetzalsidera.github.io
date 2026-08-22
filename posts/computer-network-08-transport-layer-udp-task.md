---
title: 传输层与 UDP 习题课
date: 2026-08-21T10:00:00
tags: [ 计算机网络, 传输层, UDP, 习题 ]
pinned: false
collection: 计算机网络
kind: exercise
exerciseFont: kai
outline:
  - title: 一、端口号
    slug: 端口号习题
  - title: 1. 熟知端口
    slug: 熟知端口
    level: 1

  - title: 二、UDP
    slug: UDP习题
  - title: 1. UDP特点
    slug: UDP特点
    level: 1
  - title: 2. UDP首部
    slug: UDP首部
    level: 1


head:
  - - meta
    - name: description
      content: 传输层概述与 UDP 配套习题，涉及熟知端口、UDP 应用、伪首部、反码校验和及 NAT 转换。
  - - meta
    - name: keywords
      content: 计算机网络习题, 传输层, 端口号, UDP, 伪首部, Internet校验和, NAT
---

```ts image-setup
import { path as miscellaneousImagePath } from '@public/Image/Miscellaneous/path'

const udpChecksumCalculationImage = {
  src: miscellaneousImagePath['UDP习题-反码加法'],
  alt: '两个十六位二进制数执行反码加法，最高位进位回卷到最低位，最后逐位取反',
  align: 'center',
  wrap: false,
  maxHeight: '13rem',
  caption: '原答案中的反码加法过程：进位回卷后再逐位取反',
} as const
```

本文整理传输层概述与 UDP 的配套习题。参考笔记见[传输层与 UDP](./computer-network-06-transport-layer-udp.md)。

---

## 一、端口号{#端口号习题}

### 1. 熟知端口{#熟知端口}

端口题先判断端口范围，再核对应用协议的传输层协议与服务器端口。

::::::exercise-set
:::::exercise-group{start="1"}
::::exercise{type="single"}
:::stem
在（ ）范围内的端口号被称为熟知端口号并限制使用，这些端口号是为 FTP、HTTP 等常用应用层协议保留的。
:::
:::choices{choice-columns="4"}

- `0`～`127`
- `0`～`255`
- `0`～`511`
- `0`～`1023`
  :::
  :::answer
  D
  :::
  :::solution
  熟知端口的范围为 `0`～`1023`，故选 D。端口 `0` 保留，不作为普通服务端口；`1024`～`49151` 为用户端口，`49152`～`65535`
  为动态或私有端口。参见[端口号分类](./computer-network-06-transport-layer-udp.md#复用分用与端口号)。
  :::
  ::::

::::exercise{type="single"}
:::stem
下列 TCP 熟知端口号中，错误的是（ ）。
:::
:::choices{choice-columns="4"}

- TELNET：`23`
- SMTP：`25`
- HTTP：`80`
- FTP：`24`
  :::
  :::answer
  D
  :::
  :::solution
  FTP 控制连接使用 TCP/21；经典主动模式的数据连接由服务器使用 TCP/20 作为源端口。TCP/24 不是 FTP 的熟知端口，故选 D。

> 常见周知端口号如下表
> | 服务器端口 | 传输层协议 | 应用协议 |
> |----------:|---------|-----------------------|
> |      `21` | TCP | FTP 控制连接 |
> |      `22` | TCP | SSH |
> |      `25` | TCP | SMTP |
> |      `53` | UDP、TCP | DNS |
> | `67`、`68` | UDP | DHCP 服务器、客户端 |
> |      `80` | TCP | HTTP |
> |     `110` | TCP | POP3 |
> |     `143` | TCP | IMAP |
> |     `443` | TCP、UDP | HTTPS；HTTP/3 通常使用 UDP |

:::
::::
:::::
::::::

## 二、UDP{#UDP习题}

### 1. UDP特点{#UDP特点}

::::::exercise-set
:::::exercise-group{start="3"}
::::exercise{type="single"}
:::stem
下列网络应用中，不适合使用 UDP 的是（ ）。
:::
:::choices{choice-columns="2"}

- 客户端/服务器应用
- 语音通话
- 实时多媒体应用
- 远程登录
  :::
  :::answer
  D
  :::
  :::solution
  远程登录要求可靠、有序的双向字节流，Telnet 和 SSH 均使用 TCP。实时媒体更重视时效，远程调用也可在应用层实现超时与重传，因此二者可以使用
  UDP。

“客户端/服务器”描述应用体系结构，并不直接决定传输层协议；本题按题库所列典型短请求场景判断。
:::
::::
:::::
::::::

### 2. UDP首部{#UDP首部}

::::::exercise-set
:::::exercise-group{start="4"}
::::exercise{type="single"}
:::stem
下列关于 UDP 校验的描述中，错误的是（ ）。
:::
:::choices{choice-columns="1"}

- UDP 校验和字段是可选的；若源主机不计算校验和，则将其置为全 `0`
- 计算校验和时需要生成伪首部，源主机还要把伪首部发送给目的主机
- 校验失败的 UDP 数据报通常被丢弃，不交付给应用进程
- UDP 校验和还能检验 IP 数据报的源 IP 地址与目的 IP 地址
  :::
  :::answer
  B
  :::
  :::solution
  伪首部只在端点本地参与校验和计算，不属于 UDP 数据报，也不会发送，故 B 错误。伪首部包含源 IP 与目的 IP，因此这些地址会间接参与校验。

> 选项 A 只适用于 IPv4 的普通 UDP；IPv6 UDP 除规范明确的少数隧道例外，必须使用有效校验和。

:::
::::

::::exercise{type="single" source="2024 统考真题"}
:::stem
UDP 在计算校验和时，已得到中间结果 `1011 1001 1011 0110`，还需加上最后一个 16 位数 `0110 0101 1100 0101`。最终校验和是（ ）。
:::
:::choices{choice-columns="2"}

- `0001 1111 0111 1011`
- `0001 1111 0111 1100`
- `1110 0000 1000 0011`
- `1110 0000 1000 0100`

:::
:::answer
C
:::
:::solution
普通二进制加法得到 17 位结果：

$$
\mathtt{1011\ 1001\ 1011\ 0110}
+\mathtt{0110\ 0101\ 1100\ 0101}
=\mathtt{1\ 0001\ 1111\ 0111\ 1011}.
$$

将最高位进位回卷到最低位：

$$
\mathtt{0001\ 1111\ 0111\ 1011}+1
=\mathtt{0001\ 1111\ 0111\ 1100}.
$$

最后逐位取反，得到

$$
\boxed{\mathtt{1110\ 0000\ 1000\ 0011}}.
$$

<Image {...udpChecksumCalculationImage} />
:::
::::

::::exercise{type="multiple" source="2025 统考真题改编"}
:::stem
（多选）假设路由器实现 NAT 功能，内网主机 H 的 IP 地址为 `192.168.1.5/24`。H 向 Internet 发送一个 UDP 报文段，路由器转发承载该报文段的
IP 数据报时，下列 UDP 首部字段中会被修改的是（ ）。
:::
:::choices{choice-columns="2"}

- 源端口号
- 目的端口号
- 总长度
- 校验和
  :::
  :::answer
  A、D
  :::
  :::solution
  按题设采用常见 NAPT/PAT：路由器改写源 IP 与 UDP 源端口，因此 A 改变；目的端口和 UDP 总长度不变。UDP 校验和覆盖包含源 IP
  的伪首部，源 IP 改写后必须重新计算校验和，因此 D 也改变。

原题截图缺少组合选项，本题改为多选并直接列出判断项。若只是纯地址 NAT，端口未必改变；IPv4 UDP 校验和原本为 `0`
时也保持未启用。本题采用统考答案隐含的 NAPT 且校验和有效条件。
:::
::::
:::::
::::::
