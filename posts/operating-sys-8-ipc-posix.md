---
title: 1.5 - POSIX进程间通信
date: 2026-04-24T00:00:00
tags: [ Unix, C,POSIX, 操作系统 ]
pinned: false
collection: Unix操作系统
outline:
  - title: IPC概述
    slug: IPC概述
  - title: 1. 两种基本模型
    slug: 两种基本模型
    level: 1
  - title: 2. 消息传递的三个维度
    slug: 消息传递的三个维度
    level: 1
  - title: 3. 本篇讨论的 POSIX IPC
    slug: 本篇讨论的-posix-ipc
    level: 1

  - title: POSIX共享内存
    slug: POSIX共享内存
  - title: 1. shm_open 与 ftruncate
    slug: shm_open-与-ftruncate
    level: 1
  - title: 2. mmap、munmap 与 shm_unlink
    slug: mmapmunmap-与-shm_unlink
    level: 1
  - title: 3. 共享内存与同步的边界
    slug: 共享内存与同步的边界
    level: 1
  - title: 4. 示例：生产者写，消费者读
    slug: 示例生产者写消费者读
    level: 1

  - title: 管道与FIFO
    slug: 管道与FIFO
  - title: 1. pipe：匿名管道
    slug: pipe匿名管道
    level: 1
  - title: 2. 示例：fork + pipe
    slug: 示例fork-pipe
    level: 1
  - title: 3. mkfifo：命名管道
    slug: mkfifo命名管道
    level: 1
  - title: 4. FIFO 与匿名管道的区别
    slug: FIFO-与匿名管道的区别
    level: 1

  - title: 信号
    slug: 信号
  - title: 1. 信号作为进程间通知
    slug: 信号作为进程间通知
    level: 1
  - title: 2. kill 与 sigaction
    slug: kill-与-sigaction
    level: 1
  - title: 3. 示例：父进程向子进程发送 SIGUSR1
    slug: 示例父进程向子进程发送-SIGUSR1
    level: 1

  - title: Socket
    slug: Socket
  - title: 1. AF_UNIX 与 AF_INET
    slug: AF_UNIX-与-AF_INET
    level: 1
  - title: 2. 服务端与客户端的核心 API
    slug: 服务端与客户端的核心-API
    level: 1
  - title: 3. 示例：Unix domain socket
    slug: 示例Unix-domain-socket
    level: 1

  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 一篇围绕 POSIX 进程间通信展开的 Unix 笔记，介绍共享内存、匿名管道、FIFO 与 socket，并给出对应 API 与最小示例。
  - - meta
    - name: keywords
      content: Unix, POSIX, IPC, shm_open, mmap, pipe, mkfifo, socket, AF_UNIX
---

一篇围绕 POSIX 进程间通信展开的学习笔记。

---

在 [进程基础](./operating-sys-1-process.md)
里，已经讨论过进程彼此隔离的地址空间；在 [POSIX同步 API](./operating-sys-7-synchronize-posix.md)
里，又讨论了多个执行流如何协调访问共享资源。接下来要处理的是另一个问题：彼此独立的进程怎样交换数据。

通信部分的理论主干相对集中，因此本篇将***进程间通信***的基本模型和 POSIX 接口合并到同一篇里，重点放在最常见的几类 Unix
进程间通信模型上：共享内存、匿名管道、FIFO 与 socket。

## IPC概述<a id=IPC概述></a>

### 1. 两种基本模型<a id=两种基本模型></a>

进程间通信（`IPC`，`Inter-Process Communication`）有两种基本模型：

| 模型   | 核心思路                          | 特点                |
|------|-------------------------------|-------------------|
| 共享内存 | 多个进程把同一段内存映射到各自地址空间，再直接读写这段内存 | 建立后访问开销低          |
| 消息传递 | 进程通过内核维护的通信通道交换消息或字节流         | 可能使用中断，通信开销比共享内存高 |

这两种模型的差异，不在于“谁更高级”，而在于责任边界。

共享内存只负责把同一段数据暴露给多个进程；至于何时写、何时读、谁先谁后、是否会并发覆盖，都需要通信双方协商。消息传递则把“通道”交给内核管理，进程通过接口完成通信，数据边界更明确，但内核介入更多。

### 2. 消息传递的三个维度<a id=消息传递的三个维度></a>

教材里通常用三个维度描述消息传递机制：

| 维度   | 选项                | 含义                               |
|------|-------------------|----------------------------------|
| 命名方式 | 直接通信 / 间接通信       | 是直接指定对端进程，还是通过邮箱、端口、路径名等中间对象通信   |
| 同步方式 | 阻塞 / 非阻塞          | `send` 或 `receive` 调用是否在条件不满足时挂起 |
| 缓冲方式 | 零容量 / 有界容量 / 无界容量 | 通道内部能否暂存消息，以及最多能积压多少             |

把这三组维度压缩后，可以得到几个常见判断：

- 阻塞发送 + 阻塞接收，本质上接近交会（`rendezvous`）
- 匿名管道、FIFO、socket 通常都带有内核缓冲区，因此更接近“有界容量”
- 是否阻塞，不只取决于 IPC 类型，也取决于文件状态标志和具体 API 的使用方式

### 3. 本篇讨论的 POSIX IPC<a id=本篇讨论的-posix-ipc></a>

本篇聚焦下面四类 POSIX/Unix 常见 IPC：

| 类型     | 典型 API                                      | 适合什么场景        |
|--------|---------------------------------------------|---------------|
| 共享内存   | `shm_open`、`ftruncate`、`mmap`               | 大块数据交换、低开销共享  |
| 匿名管道   | `pipe`、`read`、`write`                       | 亲缘进程之间的单向字节流  |
| 命名管道   | `mkfifo`、`open`、`read`、`write`              | 不相关进程之间的本地字节流 |
| socket | `socket`、`bind`、`listen`、`accept`、`connect` | 本地或网络上的双向通信   |

POSIX 还提供消息队列等 IPC 机制，但本篇先聚焦与教材主线最贴近、同时在 Unix 编程里最常见的这四类接口。

## POSIX共享内存<a id=POSIX共享内存></a>

### 1. shm_open 与 ftruncate<a id=shm_open-与-ftruncate></a>

POSIX 共享内存对象通过 `shm_open` 创建或打开：

```c
int shm_open(const char *name, int oflag, mode_t mode);
```

几个关键点如下：

| 参数      | 含义                                 |
|---------|------------------------------------|
| `name`  | 共享内存对象名，通常写成 `"/os_demo_shm"` 这种形式 |
| `oflag` | 打开方式，例如 `O_CREAT\| O_RDWR`         |
| `mode`  | 权限位，例如 `0666`                      |

`shm_open` 成功后返回的是一个文件描述符。它还不是可直接使用的“共享区”，只是一个可被映射的内核对象。

这里要强调一点：Unix 下的 POSIX 共享内存，本质上是通过内存映射文件这条路径暴露给用户进程的。若与普通文件对比，关系会更清楚：

| 普通文件        | POSIX 共享内存  | 含义                |
|-------------|-------------|-------------------|
| `open`      | `shm_open`  | 打开一个内核对象，并得到文件描述符 |
| `ftruncate` | `ftruncate` | 设定对象大小            |
| `mmap`      | `mmap`      | 把对象映射进当前进程地址空间    |

也就是说，共享内存不是“脱离文件描述符体系的特殊内存”；它更接近一个可被 `mmap` 的内核对象。后面的管道虽然不能 `mmap`
，但同样通过文件描述符进入用户态。

创建之后，通常要立刻调用 `ftruncate` 设定大小：

```c
int ftruncate(int fd, off_t length);
```

如果不先设定对象大小，后续 `mmap` 就没有明确的映射范围。

### 2. mmap、munmap 与 shm_unlink<a id=mmapmunmap-与-shm_unlink></a>

共享内存真正进入进程地址空间，要靠 `mmap`：

```c
void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);
int munmap(void *addr, size_t length);
int shm_unlink(const char *name);
```

最常见的组合是：

| 调用                                                     | 作用                 |
|--------------------------------------------------------|--------------------|
| `mmap(..., PROT_READ \|  PROT_WRITE, MAP_SHARED, ...)` | 把共享内存对象映射到当前进程地址空间 |
| `munmap`                                               | 解除当前进程中的映射         |
| `shm_unlink`                                           | 删除共享内存对象的名字        |

这里有一个容易混淆的点：`shm_unlink` 删除的是“名字”，不是立刻把对象从所有进程中抹掉。只要还有进程持有打开的文件描述符或映射，该对象仍会继续存在；等最后一个引用消失后，内核才真正回收它。

### 3. 共享内存与同步的边界<a id=共享内存与同步的边界></a>

共享内存只解决“多个进程能看到同一段数据”，不解决“多个进程如何正确地访问这段数据”。

例如，两个进程同时向同一个偏移写数据，仍然会出现覆盖和竞争条件。因此，共享内存通常需要配合额外同步原语使用，例如：

- 进程共享信号量
- 进程共享互斥锁
- 基于协议的单写者 / 单读者约束

从分工上看，`shm_open + mmap` 负责共享，`semaphore / mutex`
负责协调。这一点与上一章的 [POSIX同步 API](./operating-sys-7-synchronize-posix.md) 是衔接关系，而非重复关系。

### 4. 示例：生产者写，消费者读<a id=示例生产者写消费者读></a>

下面给出一个示例：父进程创建共享内存，再 `fork`，子进程读取，父进程写入。

```c
#include <fcntl.h>
#include <stdio.h>
#include <string.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
    const char *name = "/os_demo_shm";
    const size_t size = 4096;

    int fd = shm_open(name, O_CREAT | O_RDWR, 0666);
    ftruncate(fd, size);

    char *ptr = mmap(NULL, size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
    pid_t pid = fork();

    if (pid == 0) {
        sleep(1);
        printf("child read: %s\n", ptr);
        munmap(ptr, size);
        close(fd);
        _exit(0);
    }

    snprintf(ptr, size, "hello from parent");
    wait(NULL);
    munmap(ptr, size);
    close(fd);
    shm_unlink(name);
    return 0;
}
```

这个例子只演示“共享”本身。这里用 `sleep(1)` 只是为了让输出顺序稳定，避免还没写入就先读取；如果是真实并发场景，应改成显式同步，而不是依赖睡眠。

## 管道与FIFO<a id=管道与FIFO></a>

### 1. pipe：匿名管道<a id=pipe匿名管道></a>

匿名管道通过 `pipe` 创建：

```c
int pipe(int fd[2]);
```

创建成功后：

| 描述符     | 含义 |
|---------|----|
| `fd[0]` | 读端 |
| `fd[1]` | 写端 |

匿名管道的几个关键性质如下：

| 性质   | 说明                         |
|------|----------------------------|
| 数据形式 | 字节流                        |
| 方向   | 单向；若要双向通信，通常要建两条管道         |
| 典型关系 | 常用于父子进程，因为 `fork` 会继承文件描述符 |
| 生命周期 | 只在相关进程存活并持有描述符时存在          |

在 Unix 看来，管道也是一个通过文件描述符访问的内核对象，因此它沿用 `read` / `write` 这套 I/O 语义。也正因为如此，关闭未使用端非常重要：

- 读端只有在“所有写端引用都关闭”后，`read` 才会返回 `0`，也就是 `EOF`
- 如果双方都忘记关闭无关端点，程序很容易停在互相等待的位置

管道还有一个边界需要明确：它是字节流，不保留应用层消息边界。若多个写者并发写同一条管道，数据可能交错，因此它适合顺序字节流，不适合直接当作结构化消息队列理解。

### 2. 示例：fork + pipe<a id=示例fork-pipe></a>

下面是最经典的 `fork + pipe` 模式：父进程写，子进程读。

```c
#include <stdio.h>
#include <string.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
    int fd[2];
    pipe(fd);

    pid_t pid = fork();
    if (pid == 0) {
        char buf[128];

        close(fd[1]);
        read(fd[0], buf, sizeof(buf));
        printf("child read: %s\n", buf);
        close(fd[0]);
        _exit(0);
    }

    close(fd[0]);
    write(fd[1], "hello from parent", strlen("hello from parent") + 1);
    close(fd[1]);
    wait(NULL);
    return 0;
}
```

这个例子里，父子进程都先关闭自己不用的那一端。这样数据流方向和 `EOF` 语义才是清晰的。

### 3. mkfifo：命名管道<a id=mkfifo命名管道></a>

命名管道通过 `mkfifo` 创建：

```c
int mkfifo(const char *pathname, mode_t mode);
```

它与匿名管道的核心差别是：FIFO 在文件系统里有名字，因此不要求通信双方有父子关系。创建之后，双方像操作普通文件一样 `open`、
`read`、`write`、`close` 即可。

最小写端：

```c
mkfifo("/tmp/os_fifo", 0666);
int fd = open("/tmp/os_fifo", O_WRONLY);
write(fd, "hello fifo", 11);
close(fd);
```

最小读端：

```c
int fd = open("/tmp/os_fifo", O_RDONLY);
char buf[128];
read(fd, buf, sizeof(buf));
close(fd);
unlink("/tmp/os_fifo");
```

这里还要注意一个行为：若写端以 `O_WRONLY` 打开 FIFO，而暂时没有读端存在，`open` 往往会阻塞；反过来，仅读端打开时也可能等待写端。

### 4. FIFO 与匿名管道的区别<a id=FIFO-与匿名管道的区别></a>

这两者都属于管道，但适用边界不同：

| 维度   | 匿名管道              | FIFO                |
|------|-------------------|---------------------|
| 命名方式 | 无名字，只靠已打开的文件描述符引用 | 有文件系统路径名            |
| 典型关系 | 父子进程              | 不相关进程也可使用           |
| 生命周期 | 跟随进程与描述符          | 跟随文件系统对象，直到显式删除     |
| 通信方向 | 单向                | 语义上可双向，但实践中通常按半双工使用 |

如果只是父子进程之间传一点字节流，匿名管道最直接；如果双方没有亲缘关系，但都在同一台机器上，FIFO 更自然。

## 信号<a id=信号></a>

### 1. 信号作为进程间通知<a id=信号作为进程间通知></a>

信号（`signal`）也可以看作一种进程间通信机制，但它和共享内存、管道、socket 不在同一层次。

前面几类 IPC 的重点是“传输数据”；信号的重点则是“发送通知”。它通常只携带非常有限的信息，常见用途包括：

| 用途      | 例子                           |
|---------|------------------------------|
| 生命周期通知  | 子进程结束后向父进程触发 `SIGCHLD`       |
| 用户自定义通知 | 进程之间发送 `SIGUSR1`、`SIGUSR2`   |
| 控制行为    | `SIGTERM` 请求终止，`SIGINT` 响应中断 |

因此，信号更接近“事件通知”而不是“数据通道”。如果要传输成块数据，仍应优先考虑共享内存、管道或 socket。

### 2. kill 与 sigaction<a id=kill-与-sigaction></a>

发送信号最常见的接口是：

```c
int kill(pid_t pid, int sig);
```

`kill` 这个名字容易误导。它不只用于“杀死进程”，而是向目标进程发送一个指定信号；至于收到信号后发生什么，要看信号类型和接收方的处理方式。

接收方更推荐使用 `sigaction` 安装处理函数：

```c
int sigaction(int signum, const struct sigaction *act, struct sigaction *oldact);
```

这几个接口的分工可以压缩如下：

| 接口          | 作用              |
|-------------|-----------------|
| `kill`      | 向目标进程发送信号       |
| `sigaction` | 为某个信号安装处理方式     |
| `pause`     | 挂起当前进程，直到收到一个信号 |

如果只是想让一个进程提醒另一个进程“某个事件已经发生”，信号是最轻量的方案之一。

### 3. 示例：父进程向子进程发送 SIGUSR1<a id=示例父进程向子进程发送-SIGUSR1></a>

下面给出一个最小示例：父进程 `fork` 出子进程，子进程安装 `SIGUSR1` 处理函数，父进程稍后发送通知。

```c
#include <signal.h>
#include <stdio.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

static void on_sigusr1(int sig) {
    (void)sig;
    write(STDOUT_FILENO, "child got SIGUSR1\n", 18);
}

int main(void) {
    pid_t pid = fork();

    if (pid == 0) {
        struct sigaction sa = {0};
        sa.sa_handler = on_sigusr1;
        sigaction(SIGUSR1, &sa, NULL);

        pause();
        _exit(0);
    }

    sleep(1);
    kill(pid, SIGUSR1);
    wait(NULL);
    return 0;
}
```

这个例子也说明了信号的边界：它适合“通知子进程现在可以做某件事”这类场景，但不适合直接承载业务数据。

## Socket<a id=Socket></a>

### 1. AF_UNIX 与 AF_INET<a id=AF_UNIX-与-AF_INET></a>

socket 是通信端点。它既可以用于网络通信，也可以用于同一台机器上的本地进程通信。

最常见的两个地址族如下：

| 地址族       | 作用        | 地址形式                      |
|-----------|-----------|---------------------------|
| `AF_UNIX` | 同机 IPC    | 文件系统路径，如 `"/tmp/os.sock"` |
| `AF_INET` | IPv4 网络通信 | IP 地址 + 端口                |

从 API 形态看，这两类 socket 的主线是相同的；差别主要在地址结构不同。由于本篇聚焦 IPC，后面示例采用 `AF_UNIX`
。如果要跨主机通信，只需把地址族换成 `AF_INET`，并改用 IP/端口地址结构。

### 2. 服务端与客户端的核心 API<a id=服务端与客户端的核心-API></a>

socket 通信通常是客户端 / 服务端模型。

服务端主线：

| API      | 作用                |
|----------|-------------------|
| `socket` | 创建套接字对象           |
| `bind`   | 绑定本地地址            |
| `listen` | 把流式 socket 置为监听状态 |
| `accept` | 接受一个新连接           |

客户端主线：

| API       | 作用        |
|-----------|-----------|
| `socket`  | 创建套接字对象   |
| `connect` | 发起到服务端的连接 |

建立连接后，双方都可以使用：

| API              | 作用                 |
|------------------|--------------------|
| `read` / `write` | 按字节流收发数据           |
| `send` / `recv`  | 更贴近 socket 语义的收发接口 |
| `close`          | 关闭套接字              |

与管道相比，`SOCK_STREAM` socket 默认是双向的，因此更适合长连接和请求 / 响应模式。

### 3. 示例：Unix domain socket<a id=示例Unix-domain-socket></a>

下面给出一个最小的 `AF_UNIX + SOCK_STREAM` 示例。这个例子不经过网络协议栈，而是在同一台机器上按“本地路径名”建立连接。

服务端：

```c
#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>

int main(void) {
    int server_fd = socket(AF_UNIX, SOCK_STREAM, 0);
    struct sockaddr_un addr = {0};

    addr.sun_family = AF_UNIX;
    strncpy(addr.sun_path, "/tmp/os_demo.sock", sizeof(addr.sun_path) - 1);

    unlink(addr.sun_path);
    bind(server_fd, (struct sockaddr *)&addr, sizeof(addr));
    listen(server_fd, 5);

    int conn_fd = accept(server_fd, NULL, NULL);
    char buf[128];

    read(conn_fd, buf, sizeof(buf));
    printf("server got: %s\n", buf);
    write(conn_fd, "hello from server", strlen("hello from server") + 1);

    close(conn_fd);
    close(server_fd);
    unlink(addr.sun_path);
    return 0;
}
```

客户端：

```c
#include <stdio.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <unistd.h>

int main(void) {
    int fd = socket(AF_UNIX, SOCK_STREAM, 0);
    struct sockaddr_un addr = {0};
    char buf[128];

    addr.sun_family = AF_UNIX;
    strncpy(addr.sun_path, "/tmp/os_demo.sock", sizeof(addr.sun_path) - 1);

    connect(fd, (struct sockaddr *)&addr, sizeof(addr));
    write(fd, "hello from client", strlen("hello from client") + 1);
    read(fd, buf, sizeof(buf));
    printf("client got: %s\n", buf);

    close(fd);
    return 0;
}
```

这个例子展示了 socket 相对于管道的两个重要特点：

- 它天然是双向通信
- 它的编程模型可以平滑扩展到网络通信，只需更换地址族和地址结构

## 小结<a id=小结></a>

IPC 的主干其实很清楚：共享内存负责把同一段数据暴露给多个进程，消息传递负责通过内核维护的通道交换数据。

落到 POSIX 接口上，`shm_open + mmap` 适合低开销共享，`pipe` 适合父子进程间的单向字节流，`mkfifo` 把这种字节流扩展到不相关进程，
`socket` 则进一步提供了双向、可扩展到网络的通信模型。真正选型时，判断标准通常不是“哪个 API
更高级”，而是“是否需要共享同一段内存、是否有亲缘关系、是否需要双向通信、是否可能跨主机”。
