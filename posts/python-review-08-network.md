---
title: Python 网络编程
date: 2026-07-08T08:00:00
tags: [ Python ]
pinned: false
collection: 深入理解 Python
outline:
  - title: 1. 套接字 API
    slug: 套接字API
  - title: 1.1 套接字对象
    slug: 套接字对象
    level: 1
  - title: 1.2 地址与端口
    slug: 地址与端口
    level: 1
  - title: 1.3 阻塞与超时
    slug: 阻塞与超时
    level: 1

  - title: 2. TCP 流程
    slug: TCP流程
  - title: 2.1 客户端流程
    slug: 客户端流程
    level: 1
  - title: 2.2 服务端流程
    slug: 服务端流程
    level: 1
  - title: 2.3 消息分帧
    slug: 消息分帧
    level: 1

  - title: 3. UDP 流程
    slug: UDP流程
  - title: 3.1 收发流程
    slug: 收发流程
    level: 1
  - title: 3.2 数据报语义
    slug: 数据报语义
    level: 1

  - title: 4. 异步网络 API
    slug: 异步网络API
  - title: 4.1 异步流
    slug: 异步流
    level: 1
  - title: 4.2 异步客户端
    slug: 异步客户端
    level: 1
  - title: 4.3 异步服务端
    slug: 异步服务端
    level: 1
  - title: 4.4 超时与连接池
    slug: 超时与连接池
    level: 1

  - title: 5. 接口选择
    slug: 接口选择
head:
  - - meta
    - name: description
      content: Python 复习系列第八篇，整理 socket、TCP、UDP、asyncio streams 与 aiohttp，说明套接字对象、客户端与服务端流程、TCP 消息分帧、UDP 数据报语义、异步 HTTP 客户端与服务端。
  - - meta
    - name: keywords
      content: Python, 网络编程, socket, TCP, UDP, asyncio streams, aiohttp, ClientSession, web.Application, HTTP, network programming
---

本篇整理 Python 网络编程：`socket`、TCP 流程、UDP 流程、`asyncio` 异步流和 `aiohttp`。

---

操作系统文集已经从 OS
视角整理了 [I/O 系统](./operating-sys-16-IO-sys.md)、[Linux 示例](./operating-sys-17-linux-example.md)
和 [POSIX IPC](./operating-sys-08-ipc-posix.md) 中的 socket。本篇从 Python API 进入：`socket` 直接操作网络端点，
`asyncio` 把网络 I/O 接入事件循环，`aiohttp` 在其上提供 HTTP 客户端和服务端。

## 1. 套接字 API{#套接字API}

### 1.1 套接字对象{#套接字对象}

套接字（socket）是网络通信端点。Python 的 `socket.socket` 对象封装了操作系统 socket 文件描述符；除 `makefile()`
外，大多数方法都直接对应底层 socket 系统调用。

创建 socket 时最重要的两个参数是地址族和 socket 类型：

| 参数       | 常见值                  | 含义                        |
|----------|----------------------|---------------------------|
| `family` | `socket.AF_INET`     | IPv4 地址族                  |
| `family` | `socket.AF_INET6`    | IPv6 地址族                  |
| `family` | `socket.AF_UNIX`     | Unix domain socket，本机进程通信 |
| `type`   | `socket.SOCK_STREAM` | 字节流 socket，常用于 TCP        |
| `type`   | `socket.SOCK_DGRAM`  | 数据报 socket，常用于 UDP        |

`socket.socket()` 只创建本地端点。客户端继续调用 `connect()` 建立连接；服务端继续调用 `bind()`、`listen()` 和
`accept()`。

### 1.2 地址与端口{#地址与端口}

IPv4 TCP/UDP socket 的地址通常写成 `(host, port)`：

| 地址          | 作用                           |
|-------------|------------------------------|
| `127.0.0.1` | 本机回环地址，只接受本机连接               |
| `0.0.0.0`   | 绑定所有 IPv4 网卡地址，外部机器可通过可达网卡访问 |
| `localhost` | 主机名，通常解析到本机地址                |
| 域名          | 通过 DNS 解析为一个或多个 IP 地址        |

端口用于区分同一主机上的不同服务。Unix-like 系统上，小于 `1024` 的端口通常需要管理员权限；开发和测试服务通常使用大于 `1024`
的端口。

`bind(('127.0.0.1', 0))` 表示让操作系统分配一个临时可用端口。分配后可以用 `getsockname()` 读取真实端口。

### 1.3 阻塞与超时{#阻塞与超时}

普通 socket 默认是阻塞式 I/O。`connect()`、`accept()`、`recv()` 都可能阻塞当前线程：

| 调用                     | 可能阻塞的原因        |
|------------------------|----------------|
| `connect(address)`     | 等待 TCP 握手完成或失败 |
| `accept()`             | 等待客户端建立连接      |
| `recv(bufsize)`        | 等待对端发送数据或关闭连接  |
| `send()` / `sendall()` | 等待内核发送缓冲区可写    |

阻塞式 socket 代码应设置超时，避免网络异常时无限等待：

```python
import socket

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client:
    client.settimeout(3.0)
    print(client.gettimeout()) # 3.0
```

事件循环下的 socket 通常会被设置为非阻塞。应用层通常通过 `asyncio` 或更高层的网络库通信。

## 2. TCP 流程{#TCP流程}

传输控制协议（TCP, Transmission Control Protocol）建立连接后提供双向字节流：对端收到的是有序字节序列，应用层需要自己组织消息格式。

### 2.1 客户端流程{#客户端流程}

TCP 客户端的基本流程是：创建 socket，连接服务端，发送字节，接收字节，关闭连接。

| 步骤   | API                                   | 作用                    |
|------|---------------------------------------|-----------------------|
| 创建端点 | `socket.socket(AF_INET, SOCK_STREAM)` | 创建 TCP socket         |
| 建立连接 | `connect((host, port))`               | 发起 TCP 握手             |
| 发送数据 | `sendall(data)`                       | 尽量发送完整字节序列            |
| 接收数据 | `recv(bufsize)`                       | 从连接中读取最多 `bufsize` 字节 |
| 关闭连接 | `close()` / `with`                    | 释放 socket 资源          |

`send()` 返回实际写入内核缓冲区的字节数，可能小于传入数据长度；`sendall()` 会循环发送直到全部提交或抛出异常。因此，简单客户端优先使用
`sendall()`。

### 2.2 服务端流程{#服务端流程}

TCP 服务端的基本流程是：创建监听 socket，绑定地址，进入监听状态，接受连接，再用 `accept()` 返回的新 socket 处理这个客户端。

| 阶段        | API                                   | 操作对象      | 阻塞情况              | 作用                          |
|-----------|---------------------------------------|-----------|-------------------|-----------------------------|
| 创建监听端点    | `socket.socket(AF_INET, SOCK_STREAM)` | 监听 socket | 无网络等待             | 创建 TCP 监听端点                 |
| 绑定地址      | `bind((host, port))`                  | 监听 socket | 通常立即返回，地址不可用时抛出异常 | 绑定本地 IP 与端口                 |
| 进入监听状态    | `listen(backlog)`                     | 监听 socket | 通常立即返回            | 让内核维护等待连接队列                 |
| 接受连接      | `accept()`                            | 监听 socket | 没有新连接时阻塞          | 返回连接 socket 和客户端地址          |
| 接收字节      | `conn.recv(bufsize)`                  | 连接 socket | 没有数据且连接未关闭时阻塞     | 读取最多 `bufsize` 字节           |
| 发送字节      | `conn.sendall(data)`                  | 连接 socket | 发送缓冲区暂时不可写时阻塞     | 提交完整字节序列，失败时抛出异常            |
| 关闭连接或监听端点 | `close()` / `with`                    | 任意 socket | 释放本地资源            | 关闭文件描述符，并触发对应 TCP 关闭流程或资源回收 |

> #### 补充： `listen(backlog:int)`
> 当服务器调用 `listen()` 将一个 socket 设置为监听状态时，backlog 参数决定了服务器可以同时处理的连接请求数量。TCP
> 建立连接需要经历三次握手，在此过程中，连接会经历以下两个队列：
> 1. SYN 队列：存储处于半连接状态的请求（即 SYN_RECEIVED 状态）。
> 2. Accept 队列：存储已完成三次握手的连接（即 ESTABLISHED 状态）。
>
> backlog 参数主要用于限制 Accept 队列 的最大长度。如果队列已满，新连接请求可能会被拒绝或丢弃。
>
> 在 Linux 系统中，TCP 协议栈采用两个队列的实现方式：
> 1. SYN 队列 的长度由系统参数 /proc/sys/net/ipv4/tcp_max_syn_backlog 决定。
> 2. Accept 队列 的长度由 backlog 参数和系统参数 /proc/sys/net/core/somaxconn 的较小值决定。
>
> 当 Accept 队列已满时，服务器可能会：丢弃新连接请求或根据 /proc/sys/net/ipv4/tcp_abort_on_overflow 的设置，发送 RST
> 包通知客户端连接被拒绝。

下面的示例把服务端和客户端放在同一个脚本中，使用后台线程只处理一次连接，便于直接运行：

```python
import socket
import threading

def serve_once(server: socket.socket) -> None:
    conn, addr = server.accept()
    with conn:
        data = conn.recv(1024)
        conn.sendall(b'echo:' + data)
    server.close()

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(('127.0.0.1', 0))
server.listen()

host, port = server.getsockname()
thread = threading.Thread(target=serve_once, args=(server,))
thread.start()

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as client:
    client.connect((host, port))
    client.sendall(b'hello')
    print(client.recv(1024).decode()) # echo:hello

thread.join()
```

监听 socket 只负责接受连接。真正收发数据的是 `accept()` 返回的连接 socket。真实服务端通常会循环 `accept()`
，并把每个连接交给线程、进程池、事件循环或专门的服务器框架处理。

连接 socket 是全双工字节流。连接建立后，两端都可以在同一条连接上执行 `send()` / `sendall()` 和 `recv()`；发送方向和接收方向相互独立，
但应用代码仍要自己安排读写顺序，避免双方同时等待对方先发数据。

阻塞式 TCP socket 的读写由内核缓冲区状态决定：

| 调用              | 返回条件                              |
|-----------------|-----------------------------------|
| `accept()`      | 有客户端连接完成握手，或发生超时/错误               |
| `recv(bufsize)` | 读到至少 1 字节、对端关闭连接返回 `b''`，或发生超时/错误 |
| `send(data)`    | 至少部分数据写入发送缓冲区，或发生超时/错误            |
| `sendall(data)` | 全部数据写入发送缓冲区，或发生超时/错误              |

TCP socket 传递的是字节。`send()`、`sendall()` 接收 `bytes`、`bytearray`、`memoryview` 等字节类对象；`recv()` 返回
`bytes`。如果要传递 Python 对象，需要应用层先编码，例如 JSON、MessagePack、Protocol Buffers 或自定义二进制格式。

### 2.3 消息分帧{#消息分帧}

TCP 是字节流协议。一次 `recv(1024)` 可能只读到半条消息，也可能读到多条消息拼在一起。应用层协议需要定义消息分帧规则。

常见分帧方式：

| 方式   | 示例                                        | 适用场景       |
|------|-------------------------------------------|------------|
| 固定长度 | 每条消息固定 32 字节                              | 控制协议、二进制小包 |
| 分隔符  | 一行一条，以 `\n` 结尾                            | 文本协议、日志流   |
| 长度前缀 | 先发 4 字节长度，再发正文                            | 二进制协议、RPC  |
| 上层协议 | HTTP header 中的 `Content-Length` 或 chunked | Web 服务     |

下面用换行作为消息分隔符：

```python
message = b'PING\nPONG\n'
first, second, rest = message.partition(b'\n')

print(first.decode())  # PING
print(second)          # b'\n'
print(rest.decode())   # PONG
```

`recv()` 返回 `b''` 表示对端已经关闭连接，字节流已经结束。

## 3. UDP 流程{#UDP流程}

用户数据报协议（UDP, User Datagram Protocol）无需建立连接，发送方只要知道目标地址就能发送数据报；它不保证到达、顺序或去重。

### 3.1 收发流程{#收发流程}

UDP 服务端绑定地址后直接用 `recvfrom()` 接收数据。返回值包含数据和发送方地址，服务端可以用 `sendto()` 回复。

```python
import socket
import threading

def serve_once(server: socket.socket) -> None:
    data, addr = server.recvfrom(1024)
    server.sendto(b'echo:' + data, addr)
    server.close()

server = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
server.bind(('127.0.0.1', 0))

host, port = server.getsockname()
thread = threading.Thread(target=serve_once, args=(server,))
thread.start()

with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as client:
    client.sendto(b'hello', (host, port))
    data, addr = client.recvfrom(1024)
    print(data.decode()) # echo:hello

thread.join()
```

UDP 客户端可以不调用 `connect()`，直接 `sendto(data, address)`。UDP socket 也支持 `connect(address)`，但这里的 `connect`
不会建立握手，只记录默认对端地址，并让后续 `send()` / `recv()` 使用该地址。

### 3.2 数据报语义{#数据报语义}

UDP 按数据报收发。一次 `sendto()` 对应一个数据报；一次 `recvfrom()` 最多取一个数据报。

| 对比项  | TCP            | UDP                     |
|------|----------------|-------------------------|
| 连接   | 需要握手建立连接       | 无连接                     |
| 数据形态 | 字节流            | 数据报                     |
| 消息处理 | 应用层自行分帧        | 单次接收最多返回一个数据报           |
| 可靠性  | 保证有序、可靠交付      | 不保证到达、顺序或去重             |
| 常见用途 | HTTP、SSH、数据库连接 | DNS、实时音视频、广播发现、自定义低延迟协议 |

同一个数字端口可以同时被 TCP 和 UDP 使用，因为它们属于不同传输协议。比如 TCP `9999` 与 UDP `9999` 是两组不同的端口绑定。

UDP 的可靠性由应用层决定。如果业务需要确认、重传、去重、排序和拥塞控制，就要在应用层实现，或直接使用
TCP / QUIC 等更高层方案。

## 4. 异步网络 API{#异步网络API}

阻塞式 socket 在当前线程上阻塞等待。异步网络接口把 socket 交给事件循环，当 socket 可读或可写时再恢复对应 coroutine。

常见层级如下：

| 层级        | Python 对象                                          | 作用               |
|-----------|----------------------------------------------------|------------------|
| 低层 socket | `socket.socket`                                    | 直接操作网络端点         |
| 异步字节流     | `asyncio.StreamReader` / `StreamWriter`            | 在事件循环中读写 TCP 字节流 |
| HTTP 客户端  | `aiohttp.ClientSession` / `ClientResponse`         | 复用连接池、发送请求、解析响应  |
| HTTP 服务端  | `aiohttp.web.Application` / `Request` / `Response` | 路由请求并返回响应        |

### 4.1 异步流{#异步流}

`asyncio.open_connection()` 创建客户端连接，返回 `StreamReader` 和 `StreamWriter`。`asyncio.start_server()` 创建 TCP
服务端，每个连接到达时调用处理函数。

异步流主流程：

| 阶段      | API / 对象                                          | 作用                                |
|---------|---------------------------------------------------|-----------------------------------|
| 建立客户端连接 | `asyncio.open_connection(host, port, ...)`        | 返回 `(StreamReader, StreamWriter)` |
| 启动服务端   | `asyncio.start_server(callback, host, port, ...)` | 返回 `asyncio.Server`               |
| 处理连接    | `callback(reader, writer)`                        | 每个连接由一个 handler coroutine 处理      |
| 写入数据    | `StreamWriter.write(data)`                        | 写入发送缓冲区                           |
| 等待发送推进  | `await StreamWriter.drain()`                      | 等待写缓冲区回落，配合流量控制                   |
| 关闭连接    | `StreamWriter.close()`                            | 发起关闭当前连接                          |
| 等待连接关闭  | `await StreamWriter.wait_closed()`                | 等待当前连接关闭完成                        |
| 停止服务端   | `asyncio.Server.close()`                          | 停止接收新连接                           |
| 等待服务端关闭 | `await asyncio.Server.wait_closed()`              | 等待监听 socket 关闭完成                  |

读取接口：

| API                                 | 读取方式                                      |
|-------------------------------------|-------------------------------------------|
| `StreamReader.read(n)`              | 读取最多 `n` 字节；对端关闭且缓冲区为空时返回 `b''`           |
| `StreamReader.readline()`           | 读取一行，返回包含换行符的 `bytes`，或返回已读到的部分数据         |
| `StreamReader.readexactly(n)`       | 读取恰好 `n` 字节；字节不足时抛出 `IncompleteReadError` |
| `StreamReader.readuntil(separator)` | 读取直到指定分隔符；适合文本协议或自定义分隔符协议                 |

下面是单文件异步 echo 示例：

```python
import asyncio

async def handle(reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
    data = await reader.read(100)
    writer.write(b'echo:' + data)
    await writer.drain()
    writer.close()
    await writer.wait_closed()

async def main() -> None:
    server = await asyncio.start_server(handle, '127.0.0.1', 0)
    host, port = server.sockets[0].getsockname()[:2]

    reader, writer = await asyncio.open_connection(host, port)
    writer.write(b'hello')
    await writer.drain()

    print((await reader.read(100)).decode()) # echo:hello

    writer.close()
    await writer.wait_closed()
    server.close()
    await server.wait_closed()

asyncio.run(main())
```

`writer.write()` 只是把数据写入传输层缓冲区；`await writer.drain()` 等待缓冲区回落到合适水位。大量写入时应保留 `drain()`
，否则可能在用户态积累过多待发送数据。

### 4.2 异步客户端{#异步客户端}

`aiohttp` 是基于 `asyncio` 的异步 HTTP 客户端/服务端库。它运行在 `asyncio` 网络 I/O 之上，负责处理 HTTP
协议细节：请求行、响应状态、header、body、连接复用、压缩、重定向和超时。
`aiohttp` 是第三方库，示例运行前需要先安装 `aiohttp`。

客户端核心对象：

| 对象               | 作用                           |
|------------------|------------------------------|
| `ClientSession`  | 应用级 HTTP 客户端，内部持有连接池         |
| `ClientResponse` | 单次 HTTP 响应，包含状态码、响应头和响应体读取方法 |
| `ClientTimeout`  | 控制总超时、连接超时和读取超时              |

客户端主流程：

| 阶段      | API / 对象                               | 作用                            |
|---------|----------------------------------------|-------------------------------|
| 创建会话    | `ClientSession(...)`                   | 创建 HTTP 客户端会话并持有连接池           |
| 发起请求    | `session.request(method, url, ...)`    | 发起通用 HTTP 请求                  |
| 发起 GET  | `session.get(url, ...)`                | 发起 GET 请求，常用 `params` 传查询参数   |
| 发起 POST | `session.post(url, ...)`               | 发起 POST 请求，常用 `data` 或 `json` |
| 进入响应作用域 | `async with session.get(...)`          | 获取 `ClientResponse` 并注册退出清理   |
| 查看响应元数据 | `response.status` / `response.headers` | 读取状态码和响应头                     |
| 退出响应作用域 | 响应对象的 `__aexit__()`                    | 释放响应资源，使连接可以回到连接池             |
| 关闭会话    | `ClientSession.close()` / `async with` | 关闭会话、connector 和连接池           |

响应读取接口：

| API                                   | 读取方式               |
|---------------------------------------|--------------------|
| `await response.text()`               | 读取完整响应体并解码为文本      |
| `await response.json()`               | 读取完整响应体并解析 JSON    |
| `await response.read()`               | 读取完整响应体并返回 `bytes` |
| `response.content.iter_chunked(size)` | 分块读取响应体，适合大文件或流式响应 |

客户端配置对象：

| 对象                   | 作用      | 常用参数                                         |
|----------------------|---------|----------------------------------------------|
| `ClientTimeout(...)` | 设置客户端超时 | `total`、`connect`、`sock_connect`、`sock_read` |
| `TCPConnector(...)`  | 配置连接池   | `limit`、`limit_per_host`、`ttl_dns_cache`     |

基本请求形态如下：

```python
import asyncio
from aiohttp import ClientSession, ClientTimeout, TCPConnector

async def main() -> None:
    timeout = ClientTimeout(total=5)
    connector = TCPConnector(limit=100, limit_per_host=10, ttl_dns_cache=60)

    async with ClientSession(timeout=timeout, connector=connector) as session:
        async with session.get('https://example.com') as response:
            print(response.status)       # 200
            print(len(await response.text()) > 0) # True

asyncio.run(main())
```

> #### 补充：`async with` 与 `with`
>
> 普通 `with` 使用同步上下文管理协议。执行 `with manager as value:` 时，解释器会调用 `manager.__enter__()` 进入资源作用域，离开时调用
> `manager.__exit__(exc_type, exc, tb)` 清理资源：
>
> 1. 计算上下文管理器表达式，得到 `manager`。
> 2. 调用 `value = manager.__enter__()`。
> 3. 执行 `with` 代码块。
> 4. 退出时调用 `manager.__exit__(exc_type, exc, tb)`；如果代码块中抛出异常，异常信息会传入 `__exit__()`。
>
> `async with` 使用异步上下文管理协议，只能写在 `async def` 内。执行 `async with manager as value:` 时，进入和退出阶段分别等待
> `manager.__aenter__()` 与 `manager.__aexit__(exc_type, exc, tb)`：
>
> 1. 计算异步上下文管理器表达式，得到 `manager`。
> 2. 调用并等待 `value = await manager.__aenter__()`。
> 3. 执行 `async with` 代码块。
> 4. 退出时调用并等待 `await manager.__aexit__(exc_type, exc, tb)`；如果代码块中抛出异常，异常信息会传入 `__aexit__()`。
>
> 差异集中在资源进入和释放是否允许挂起。`with` 的 `__enter__()` / `__exit__()` 在当前线程同步执行；`async with` 的
> `__aenter__()` / `__aexit__()` 可以在等待网络、文件描述符或连接池状态时把控制权交还给事件循环。`ClientSession`
> 在退出时关闭会话和连接池，
> `session.get()` 返回的响应对象在退出时释放响应资源，使底层连接可以回到连接池。

`ClientSession` 不应按请求创建。通常一个应用、一个服务对象或一个目标站点复用同一个 session；每次请求创建 session
会丢失连接池复用，并增加 DNS、握手和连接管理开销。

响应体读取方式按数据规模选择：

| 方法                                    | 返回内容        | 读取方式            |
|---------------------------------------|-------------|-----------------|
| `await response.text()`               | 文本字符串       | 读完整响应体          |
| `await response.json()`               | JSON 反序列化结果 | 读完整响应体，并要求内容可解析 |
| `await response.read()`               | 原始字节        | 读完整响应体          |
| `response.content.iter_chunked(size)` | 异步分块迭代      | 适合大文件或流式下载      |

### 4.3 异步服务端{#异步服务端}

`aiohttp.web` 的服务端 API 由 `Application`、路由和异步 handler 组成。handler 接收 `Request`，返回 `Response`。

服务端主流程：

| 阶段      | API / 对象                                        | 作用                           |
|---------|-------------------------------------------------|------------------------------|
| 创建应用    | `web.Application()`                             | 创建 Web 应用，保存 router、中间件和应用状态 |
| 注册路由    | `app.add_routes(routes)`                        | 把路径、方法和 handler 绑定到 router   |
| 定义 GET  | `web.get(path, handler)`                        | 创建 GET 路由定义                  |
| 定义 POST | `web.post(path, handler)`                       | 创建 POST 路由定义                 |
| 处理请求    | `async def handler(request)`                    | 接收 `Request`，返回 `Response`   |
| 创建响应    | `web.Response(...)` / `web.json_response(data)` | 返回文本、字节或 JSON 响应             |
| 长期运行    | `web.run_app(app, host, port)`                  | 启动服务并托管事件循环和关闭流程             |

手动生命周期接口：

| 阶段          | API / 对象                          | 作用                            |
|-------------|-----------------------------------|-------------------------------|
| 创建 runner   | `web.AppRunner(app)`              | 准备手动管理应用生命周期                  |
| 初始化应用       | `await runner.setup()`            | 初始化应用，创建 site 前调用             |
| 创建监听点       | `web.TCPSite(runner, host, port)` | 绑定 TCP 监听地址                   |
| 复用已有 socket | `web.SockSite(runner, sock)`      | 使用已经绑定的 socket 启动服务           |
| 启动监听        | `await site.start()`              | 开始接收连接                        |
| 清理应用        | `await runner.cleanup()`          | 停止服务并触发 shutdown / cleanup 回调 |

请求读取接口：

| API                    | 读取内容                              |
|------------------------|-----------------------------------|
| `request.match_info`   | 路径变量，例如 `/hello/{name}` 中的 `name` |
| `request.query`        | URL 查询参数                          |
| `request.headers`      | 请求头                               |
| `await request.text()` | 请求体文本                             |
| `await request.json()` | JSON 请求体解析结果                      |

例如：

```python
from aiohttp import web

async def hello(request: web.Request) -> web.Response:
    name = request.match_info.get('name', 'Python')
    return web.Response(text=f'hello {name}')

app = web.Application()
app.add_routes([web.get('/hello/{name}', hello)])

web.run_app(app, host='127.0.0.1', port=8080)
```

为了在一段脚本中同时演示服务端和客户端，可以使用 `AppRunner` 启动应用，再用 `ClientSession` 请求它：

```python
import asyncio
import socket
from aiohttp import ClientSession, ClientTimeout, web

async def hello(request: web.Request) -> web.Response:
    name = request.match_info['name']
    return web.json_response({'message': f'hello {name}'})

async def main() -> None:
    app = web.Application()
    app.add_routes([web.get('/hello/{name}', hello)])

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.bind(('127.0.0.1', 0))
    host, port = sock.getsockname()

    runner = web.AppRunner(app)
    await runner.setup()
    site = web.SockSite(runner, sock)
    await site.start()

    try:
        timeout = ClientTimeout(total=5)
        async with ClientSession(timeout=timeout) as session:
            async with session.get(f'http://{host}:{port}/hello/Python') as response:
                print(response.status)      # 200
                print(await response.json()) # {'message': 'hello Python'}
    finally:
        await runner.cleanup()

asyncio.run(main())
```

`web.run_app(app)` 适合命令行启动一个长期运行的服务；`AppRunner` / `SockSite` 适合测试、嵌入式启动或需要自己管理服务生命周期的场景。

### 4.4 超时与连接池{#超时与连接池}

网络代码应显式处理超时。阻塞式 socket 使用 `settimeout()`；`asyncio` 可以用 `asyncio.timeout()` 包住等待；`aiohttp` 客户端使用
`ClientTimeout`。

```python
import asyncio

async def slow_operation() -> str:
    await asyncio.sleep(1)
    return 'done'

async def main() -> None:
    try:
        async with asyncio.timeout(0.01):
            await slow_operation()
    except TimeoutError:
        print('timeout') # timeout

asyncio.run(main())
```

不同层级的超时对象：

| 层级         | 写法                                     | 作用范围                    |
|------------|----------------------------------------|-------------------------|
| 阻塞式 socket | `sock.settimeout(seconds)`             | 当前 socket 的连接、读写等待      |
| asyncio    | `asyncio.timeout(seconds)`             | 当前 `async with` 代码块中的等待 |
| asyncio    | `asyncio.wait_for(awaitable, timeout)` | 单个 awaitable            |
| aiohttp    | `ClientTimeout(total=...)`             | 单次 HTTP 请求总耗时           |
| aiohttp    | `ClientTimeout(connect=...)`           | 获取连接的等待时间，包含连接池排队和新建连接  |
| aiohttp    | `ClientTimeout(sock_connect=...)`      | 新建 TCP 连接的等待时间          |
| aiohttp    | `ClientTimeout(sock_read=...)`         | 相邻两次 socket 读取之间的等待时间   |

`aiohttp` 的连接池由 `ClientSession` 持有，底层通过 connector 管理。默认 `TCPConnector` 会复用 HTTP keep-alive 连接；请求完成后，
连接回到连接池，后续同一目标的请求可以复用它。

```python
import asyncio
from aiohttp import ClientSession, ClientTimeout, TCPConnector

async def main() -> None:
    timeout = ClientTimeout(total=10, connect=3, sock_connect=3, sock_read=5)
    connector = TCPConnector(limit=100, limit_per_host=10, ttl_dns_cache=60)

    async with ClientSession(timeout=timeout, connector=connector) as session:
        ...

asyncio.run(main())
```

`TCPConnector(limit=100)` 限制所有目标的总连接数；`limit_per_host=10` 限制同一 `(host, port, is_ssl)` 目标的并发连接数。
当连接数达到限制时，新的请求会等待已有连接释放。长期运行的服务应在应用启动时创建 session，在关闭时释放 session；短脚本则用
`async with ClientSession()` 让上下文管理器自动关闭。

## 5. 接口选择{#接口选择}

网络编程的层级选择从目标和协议开始：

| 场景                    | 优先接口                       | 原因                     |
|-----------------------|----------------------------|------------------------|
| 学习 TCP/UDP、实现自定义二进制协议 | `socket`                   | 直接操作连接、数据报和字节收发        |
| 单线程管理大量 TCP 连接        | `asyncio` streams          | 事件循环调度，避免一连接一线程        |
| 异步访问 HTTP API         | `aiohttp.ClientSession`    | HTTP 解析、连接池、超时和流式响应    |
| 编写异步 HTTP 服务          | `aiohttp.web` 或其他异步 Web 框架 | 路由、请求对象、响应对象和生命周期管理完整  |
| CPU 密集型网络服务           | 多进程 + 异步网络                 | 网络等待由协程处理，计算用多进程绕开 GIL |

底层 socket 负责“把字节送到对端”。TCP/UDP 决定传输语义；`asyncio` 决定等待期间如何调度 coroutine；
`aiohttp` 把这些机制组合成面向 HTTP 的客户端和服务端接口。
