---
title: 1.5 - POSIX进程间通信
date: 2026-04-24T00:00:00
tags: [ Unix, C,POSIX, 操作系统 ]
pinned: false
collection: Unix操作系统
outline:
  - title: IPC 概述
    slug: IPC概述
  - title: 1. 基本方式
    slug: 基本模型
    level: 1
  - title: 2. 观察维度
    slug: 观察维度
    level: 1
  - title: 3. POSIX IPC
    slug: POSIX-IPC
    level: 1

  - title: 共享内存
    slug: 共享内存
  - title: 1. shm_open
    slug: shm_open
    level: 1
  - title: 2. ftruncate
    slug: ftruncate
    level: 1
  - title: 3. mmap 与 munmap
    slug: mmap-munmap
    level: 1
  - title: 4. shm_unlink
    slug: shm_unlink
    level: 1
  - title: 5. 生命周期
    slug: 共享内存生命周期
    level: 1
  - title: 6. 同步
    slug: 同步
    level: 1
  - title: 7. 共享内存示例
    slug: 共享内存示例
    level: 1

  - title: 管道
    slug: 管道
  - title: 1. pipe
    slug: pipe
    level: 1
  - title: 2. 匿名管道示例
    slug: 匿名管道示例
    level: 1
  - title: 3. mkfifo
    slug: mkfifo
    level: 1
  - title: 4. 命名管道示例
    slug: 命名管道示例
    level: 1
  - title: 5. 生命周期
    slug: 管道生命周期
    level: 1
  - title: 6. 管道对比
    slug: 管道对比
    level: 1

  - title: 信号
    slug: 信号
  - title: 1. 信号通知
    slug: 信号通知
    level: 1
  - title: 2. kill 与 sigaction
    slug: kill-sigaction
    level: 1
  - title: 3. SIGUSR1 示例
    slug: SIGUSR1示例
    level: 1

  - title: socket
    slug: socket
  - title: 1. 地址族
    slug: 地址族
    level: 1
  - title: 2. 核心 API
    slug: socket核心API
    level: 1
  - title: 3. AF_UNIX 示例
    slug: AF_UNIX示例
    level: 1

  - title: 小结
    slug: 小结
  - title: 附注：常见信号宏
    slug: 常见信号宏
    level: 1
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

[进程基础](./operating-sys-01-process.md)
中已讨论进程彼此隔离的地址空间，[POSIX同步 API](./operating-sys-07-synchronize-posix.md) 讨论了多执行流如何协调访问共享资源。本篇聚焦
***进程间通信***：彼此独立的进程如何交换数据。

通信部分的理论主干相对集中，因此将基本模型与 POSIX 接口合并为同一篇，重点放在共享内存、匿名管道、FIFO 与 socket。

## IPC 概述{#IPC概述}

### 1. 基本方式{#基本模型}

进程间通信（`IPC`，`Inter-Process Communication`）有两种基本模型：

| 模型   | 核心思路                          | 特点                |
|------|-------------------------------|-------------------|
| 共享内存 | 多个进程把同一段内存映射到各自地址空间，再直接读写这段内存 | 建立后访问开销低          |
| 消息传递 | 进程通过内核维护的通信通道交换消息或字节流         | 可能使用中断，通信开销比共享内存高 |

共享内存只负责把同一段数据暴露给多个进程；至于何时写、何时读、谁先谁后、是否会并发覆盖，都需要通信双方协商。消息传递则把“通道”交给内核管理，进程通过接口完成通信，消息单位或字节流顺序由具体
IPC 机制决定。

### 2. 观察维度{#观察维度}

理解一种 IPC 机制时，先回答以下问题：

| 维度   | 要回答的问题                                           | 典型对象或行为                                 |
|------|--------------------------------------------------|-----------------------------------------|
| 命名方式 | 通信双方如何找到同一个通信对象                                  | 继承 fd、路径名、socket 地址、共享内存对象名、进程号         |
| 读写方法 | 读写调用是阻塞等待，还是能用非阻塞/ready 检查方式推进                   | `read` / `write`、`send` / `recv`、`poll` |
| 缓冲区  | 数据是否进入内核缓冲区或共享内存；满时写入等待、失败还是丢弃；空时读取等待、失败还是返回 EOF | pipe buffer、socket buffer、共享内存映射        |
| 方向   | 单向、半双工、全双工；双向通信是否需要成对通道                          | 一条 pipe 单向；socket 默认双向                  |
| 并发控制 | 内核是否只保证单次系统调用安全；跨多个操作的业务一致性是否需要锁、信号量或协议约定        | POSIX 信号量、pthread mutex、文件锁             |
| 数据组织 | 传的是字节流、固定大小记录、显式消息，还是共享内存中的结构                    | 管道字节流、socket 字节流、共享内存结构体                |
| 生命周期 | 谁创建、谁打开、何时关闭、名字何时删除、对象何时真正释放                     | `close`、`unlink`、`shm_unlink`           |

教材里常说的“直接/间接通信、阻塞/非阻塞、零容量/有界容量/无界容量”可以放入这张表中：

| 教材维度              | 在上表中的位置 |
|-------------------|---------|
| 直接通信 / 间接通信       | 命名方式    |
| 阻塞 / 非阻塞          | 读写方法    |
| 零容量 / 有界容量 / 无界容量 | 缓冲区     |

例如匿名管道、FIFO、socket 通常都有内核缓冲区，因此它们的写入行为取决于缓冲区状态；共享内存没有内核消息队列，读写冲突主要由进程之间的同步协议解决。

### 3. POSIX IPC{#POSIX-IPC}

本篇聚焦下面四类 POSIX/Unix 常见 IPC：

| 类型     | 典型 API                                      | 适合场景          |
|--------|---------------------------------------------|---------------|
| 共享内存   | `shm_open`、`ftruncate`、`mmap`               | 大块数据交换、低开销共享  |
| 匿名管道   | `pipe`、`read`、`write`                       | 亲缘进程之间的单向字节流  |
| 命名管道   | `mkfifo`、`open`、`read`、`write`              | 不相关进程之间的本地字节流 |
| signal | `kill`、`sigaction`、`pause`                  | 相关联进程间的通信     |
| socket | `socket`、`bind`、`listen`、`accept`、`connect` | 本地或网络上的双向通信   |

POSIX 还提供消息队列等 IPC 机制，但本篇先聚焦与教材主线最贴近、同时在 Unix 编程里最常见的这四类接口。

## 共享内存{#共享内存}

共享内存涉及三层概念：

| 层级     | 对象                   | 说明                    |
|--------|----------------------|-----------------------|
| 内核对象   | shm object           | 由 `shm_open` 创建，系统级唯一 |
| 进程fd表项 | file descriptor (fd) | 每个进程独立持有              |
| 虚拟内存   | mmap 映射              | 每个进程各自映射              |

### 1. shm_open{#shm_open}

`shm_open` 在内核中创建或打开一个共享内存对象，并返回文件描述符：

```c
#include <sys/mman.h>
int shm_open(const char *name, int oflag, mode_t mode);
```

`shm_open` 的参数与返回值如下：

| 项       | 含义                              |
|---------|---------------------------------|
| `name`  | 共享内存对象名，通常写成形如 `"/os_demo_shm"` |
| `oflag` | 打开方式，例如 `O_CREAT                | O_RDWR` |
| `mode`  | 权限位，例如 `0666`                   |
| 成功返回    | 非负文件描述符                         |
| 失败返回    | `-1`，并设置 `errno`                |

`shm_open` 成功后返回的是一个文件描述符。它还不是可直接使用的“共享区”，只是一个可被映射的内核对象。

这里要强调一点：Unix 下的 POSIX 共享内存，本质上是通过内存映射文件这条路径暴露给用户进程的。若与普通文件对比，关系会更清楚：

| 普通文件        | POSIX 共享内存  | 含义                |
|-------------|-------------|-------------------|
| `open`      | `shm_open`  | 打开一个内核对象，并得到文件描述符 |
| `ftruncate` | `ftruncate` | 设定对象大小            |
| `mmap`      | `mmap`      | 把对象映射进当前进程地址空间    |

也就是说，共享内存不是“脱离文件描述符体系的特殊内存”；它更接近一个可被 `mmap` 的内核对象。后面的管道虽然不能 `mmap`
，但同样通过文件描述符进入用户态。

### 2. ftruncate{#ftruncate}

`shm object`创建之后，`ftruncate`给`shm object`分配空间

```c
#include <unistd.h>
int ftruncate(int fd, off_t length);
```

`ftruncate` 的参数与返回值如下：

| 项        | 含义               |
|----------|------------------|
| `fd`     | 目标对象对应的文件描述符     |
| `length` | 目标大小，单位为字节       |
| 成功返回     | `0`              |
| 失败返回     | `-1`，并设置 `errno` |

如果不先设定对象大小，后续 `mmap` 就没有明确的映射范围。

### 3. mmap 与 munmap{#mmap-munmap}

`shm object`创建之后，需要使用`mmap`映射到进程地址空间：

```c
#include <sys/mman.h>
void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);
int munmap(void *addr, size_t length);
```

`mmap` 的参数与返回值如下：

| 项        | 含义                                 |
|----------|------------------------------------|
| `addr`   | 期望映射地址；通常传 `NULL`，交给内核选择           |
| `length` | 映射长度，单位为字节                         |
| `prot`   | 映射权限，例如 `PROT_READ`、`PROT_WRITE`   |
| `flags`  | 映射方式，例如 `MAP_SHARED`、`MAP_PRIVATE` |
| `fd`     | 被映射对象对应的文件描述符                      |
| `offset` | 从对象哪个偏移开始映射；通常为 `0`                |
| 成功返回     | 映射起始地址                             |
| 失败返回     | `MAP_FAILED`，并设置 `errno`           |

当 `flags` 为 `MAP_PRIVATE` 时，映射采用***写时复制***；只有 `MAP_SHARED` 映射才会把写入传播到共享对象。

`munmap` 的参数与返回值如下：

| 项        | 含义                      |
|----------|-------------------------|
| `addr`   | 映射起始地址，通常就是 `mmap` 的返回值 |
| `length` | 要解除的映射长度                |
| 成功返回     | `0`                     |
| 失败返回     | `-1`，并设置 `errno`        |

### 4. shm_unlink{#shm_unlink}

`shm_unlink()`的作用是删除共享内存对象的“名字”，让它不再能通过路径访问，但不会立刻销毁内存。

也就是说，`shm_unlink` 不会关闭fd，解除mmap或影响已经映射的进程。等最后一个引用消失后，内核才真正回收`shm object`。

```c
#include <sys/mman.h>
int shm_unlink(const char *name);
```

`shm_unlink` 的参数与返回值如下：

| 项      | 含义               |
|--------|------------------|
| `name` | 共享内存对象名          |
| 成功返回   | `0`              |
| 失败返回   | `-1`，并设置 `errno` |

### 5. 生命周期{#共享内存生命周期}

| 阶段 | 系统调用         | 作用对象              | 作用范围    | 是否必须每进程执行        | 说明                            |
|----|--------------|-------------------|---------|------------------|-------------------------------|
| 1  | `shm_open`   | `shm object` + fd | 系统 + 进程 | 创建者执行创建，后续进程直接打开 | 创建/打开共享内存对象，返回 fd             |
| 2  | `ftruncate`  | `shm object`      | 系统      | 创建者执行一次          | 设置共享内存大小                      |
| 3  | `mmap`       | 虚拟内存映射            | 进程      | 是                | 将`shm object`映射到当前进程地址空间，返回指针 |
| 4  | 读写访问         | 映射内存              | 进程      | 是                | 直接访问共享内存                      |
| 5  | `munmap`     | 虚拟内存映射            | 进程      | 是                | 传入指针解除当前进程映射                  |
| 6  | `close`      | 文件描述符 fd          | 进程      | 是                | 关闭当前进程 fd                     |
| 7  | `shm_unlink` | `shm object`名字    | 系统      | 创建者执行一次          | 删除名字入口，禁止新 shm_open           |

只有当 `shm_unlink` 已调用，并且所有进程都完成 `munmap`、`close(fd)` 后，系统才会释放 `shm object`。

### 6. 同步{#同步}

共享内存只解决“多个进程能看到同一段数据”，不解决“多个进程如何正确地访问这段数据”。

例如，两个进程同时向同一个偏移写数据，仍然会出现覆盖和竞争条件。因此，共享内存通常需要配合额外同步原语使用，例如：

- 进程共享信号量
- 进程共享互斥锁
- 基于协议的单写者 / 单读者约束

从分工上看，`shm_open + mmap` 负责共享，`semaphore / mutex`
负责协调。这一点与上一章的 [POSIX同步 API](./operating-sys-07-synchronize-posix.md) 是衔接关系，而非重复关系。

### 7. 共享内存示例{#共享内存示例}

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
    const char* sem_name = "/tmp/sem";
    sem_t* sem = sem_open(sem_name, O_CREAT, 0666, 0);
    
    const char *name = "/tmp/os_demo_shm";
    const size_t size = 4096;

    //此处 O_RDWR 是必须的，否则无权限读写
    int fd = shm_open(name, O_CREAT | O_RDWR, 0666);
    ftruncate(fd, size);

    char *ptr = mmap(NULL, size, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
    //fork复制了进程的地址空间，因此只需要在父进程fork之前mmap
    pid_t pid = fork();

    if (pid == 0) {
        sem_wait(sem);
        printf("child read: %s\n", ptr);
        
        //每个进程需要各自munmap，close以删除引用
        munmap(ptr, size);
        close(fd);
        
        exit(0);
    }

    snprintf(ptr, size, "hello from parent");
    sem_post(sem);
    
    munmap(ptr, size);
    close(fd);
    
    //shm_unlink只需调用一次
    shm_unlink(name);
    return 0;
}
```

## 管道{#管道}

管道涉及两层概念：

| 层级       | 对象                                     | 说明                         |
|----------|----------------------------------------|----------------------------|
| 内核对象     | pipe buffer / FIFO inode + pipe buffer | 内核维护的管道缓冲区（或 FIFO 对应的内核对象） |
| 进程 fd 表项 | file descriptor (fd)                   | 每个进程独立持有的读端/写端 fd          |

在 Unix 看来，管道也是一个通过文件描述符访问的内核对象，因此它沿用 `read` / `write` 这套 I/O 语义。

| API                          | 关键参数                          | 成功返回                    | 失败返回             |
|------------------------------|-------------------------------|-------------------------|------------------|
| `open(pathname, flags, ...)` | `pathname` 为路径名，`flags` 为打开方式 | 非负文件描述符                 | `-1`，并设置 `errno` |
| `read(fd, buf, count)`       | 从 `fd` 读取至多 `count` 字节到 `buf` | 实际读取字节数；若为 `0` 表示 `EOF` | `-1`，并设置 `errno` |
| `write(fd, buf, count)`      | 向 `fd` 写出 `count` 字节          | 实际写出字节数                 | `-1`，并设置 `errno` |
| `close(fd)`                  | 关闭描述符                         | `0`                     | `-1`，并设置 `errno` |

也正因为管道沿用`read`/`write`这套I/O语义，关闭未使用端非常重要：

- 对读端而言，只有当所有写端文件描述符都被关闭后，`read`才会返回 `0`（`EOF`）。
- 对写端而言，只要仍然存在至少一个读端文件描述符，`write`才能正常写入；若所有读端都已关闭，则写操作会失败并触发`SIGPIPE`或返回
  `EPIPE`。

分析管道时可以固定看四件事：

| 维度   | POSIX 管道语义                                                    |
|------|---------------------------------------------------------------|
| 读写方法 | 默认是同步阻塞 I/O；通过 `O_NONBLOCK` 可改成非阻塞访问                          |
| 缓冲区  | 内核维护 pipe buffer；空时读端等待数据或等待所有写端关闭；满时写端等待缓冲区释放空间              |
| 方向   | 单个 pipe / FIFO 是单向字节流；双向通信通常创建两条管道，或改用 `socketpair`           |
| 并发控制 | 内核维护管道缓冲区的并发访问；应用层无需为单次 `read` / `write` 加普通互斥锁，跨多步业务协议仍需额外同步 |

管道不会因为缓冲区满而丢弃已有字节。阻塞写会等待空间；非阻塞写在无法立即写入时返回 `-1` 并设置 `errno=EAGAIN`。
当所有读端关闭后，继续写入会触发 `SIGPIPE`；如果进程忽略或处理了该信号，`write` 返回 `-1` 并设置 `errno=EPIPE`。
当缓冲区为空且仍有写端打开时，阻塞读会等待；当所有写端关闭且缓冲区已空时，`read` 返回 `0`。

### 1. pipe{#pipe}

匿名管道通过 `pipe` 创建，同时将修改进程fd表项：

```c
int pipe(int fd[2]);
```

`pipe` 的参数与返回值如下：

| 项    | 含义                           |
|------|------------------------------|
| `fd` | 长度为 `2` 的整型数组，用于接收读端和写端文件描述符 |
| 成功返回 | `0`，并写入 `fd[0]` 与 `fd[1]`    |
| 失败返回 | `-1`，并设置 `errno`             |

创建成功后：

| 描述符     | 含义 |
|---------|----|
| `fd[0]` | 读端 |
| `fd[1]` | 写端 |

匿名管道的几个关键性质如下：

| 性质   | 说明                         |
|------|----------------------------|
| 单工   | 若要双向通信，通常要建两条管道            |
| 双方关系 | 常用于父子进程，因为 `fork` 会继承文件描述符 |
| 生命周期 | 只在相关进程存活并持有描述符时存在          |

匿名管道的读写返回条件：

| 调用                         | 阻塞模式下的返回条件                              | 非阻塞模式下的失败条件                 |
|----------------------------|-----------------------------------------|-----------------------------|
| `read(fd[0], buf, count)`  | 读到至少 1 字节；或所有写端关闭且缓冲区为空时返回 `0`          | 缓冲区为空且仍有写端打开时返回 `-1/EAGAIN` |
| `write(fd[1], buf, count)` | 至少写入部分字节；或所有读端关闭时触发 `SIGPIPE` / `EPIPE` | 缓冲区无可用空间时返回 `-1/EAGAIN`     |

多个进程同时向同一管道写入时，POSIX 保证不超过 `PIPE_BUF` 字节的单次写入具有原子性；更大的写入可能与其他写入交错。
因此，管道能保证内核缓冲区状态一致，不能替应用层设计消息分帧和多步事务。

### 2. 匿名管道示例{#匿名管道示例}

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

### 3. mkfifo{#mkfifo}

命名管道通过 `mkfifo` 创建，但***不会***修改进程fd表项：

```c
int mkfifo(const char *pathname, mode_t mode);
```

`mkfifo` 的参数与返回值如下：

| 项          | 含义               |
|------------|------------------|
| `pathname` | FIFO 在文件系统中的路径名  |
| `mode`     | 权限位，例如 `0666`    |
| 成功返回       | `0`              |
| 失败返回       | `-1`，并设置 `errno` |

`mkfifo`并不会像`pipe`那样创建管道时修改进程的fd表，因此创建后还需要使用管道名称调用`open`。

命名管道通过 `unlink` 删除，用于移除文件系统中的名字，但***不会***直接影响已打开的文件描述符：

```c
int unlink(const char *pathname);
```

`unlink` 的参数与返回值如下：

| 项          | 含义               |
|------------|------------------|
| `pathname` | 要删除的 FIFO 路径名    |
| 成功返回       | `0`              |
| 失败返回       | `-1`，并设置 `errno` |

`unlink` 只删除文件系统中的“名字”（目录项），不会立即销毁 FIFO 内核对象：

只有当：所有 fd 都被 `close`，且命名管道已被 `unlink`时，才会被删除

写端：

```c
//写前创建
mkfifo("/tmp/os_fifo", 0666);

int fd = open("/tmp/os_fifo", O_WRONLY);
write(fd, "hello fifo", 11);
close(fd);
```

读端：

```c
int fd = open("/tmp/os_fifo", O_RDONLY);
char buf[128];
read(fd, buf, sizeof(buf));
close(fd);

//读后unlink
unlink("/tmp/os_fifo");
```

这里还要注意一个行为：若写端以 `O_WRONLY` 打开命名管道，而暂时没有读端存在，`open` 往往会阻塞；反过来，仅读端打开时也可能等待写端。

命名管道打开阶段还受 `O_NONBLOCK` 影响：

| 打开方式                   | 阻塞模式   | 非阻塞模式                        |
|------------------------|--------|------------------------------|
| `open(path, O_RDONLY)` | 等待写端打开 | 通常立即成功；后续 `read` 按缓冲区和写端状态返回 |
| `open(path, O_WRONLY)` | 等待读端打开 | 若没有读端，返回 `-1/ENXIO`          |

FIFO 打开成功后的 `read` / `write` 语义与匿名管道相同：使用内核 pipe buffer，单向传输字节，所有写端关闭后读端读到 `EOF`，
所有读端关闭后写端收到 `SIGPIPE` / `EPIPE`。

### 4. 命名管道示例{#命名管道示例}

以下是一对父子进程通过命名管道通信，并使用命名信号量同步的例子

```c
#include <unistd.h>
#include <sys/fcntl.h>
#include <sys/stat.h>
#include <semaphore.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void)
{
    //命名管道
    const char* name = "/tmp/fifo";
    mkfifo(name, 0666);

    //信号量
    const char* sem_name = "/tmp/fifo_sem";
    sem_t* sem = sem_open(sem_name, O_CREAT, 0666, 0);

    if (fork() == 0)
    {
        int readEnd = open(name, O_RDONLY);

        const size_t buffer_size = 128;
        char buffer[buffer_size] = {0};

        sem_wait(sem);
        
        read(readEnd, buffer, buffer_size);

        printf("read: %s\n", buffer);
        close(readEnd);
        
        //销毁信号量
        sem_close(sem);
        sem_unlink(sem_name);
        
        exit(0);
    }

    int writeEnd = open(name, (O_WRONLY));
    write(writeEnd, "hello", strlen("hello"));

    close(writeEnd);
    sem_post(sem);

    unlink(name);
    
    exit(0);
}

```

这个例子里，父子进程都先关闭自己不用的那一端。这样数据流方向和 `EOF` 语义才是清晰的。

### 5. 生命周期{#管道生命周期}

匿名管道生命周期：

| 阶段 | 系统调用    | 作用对象               | 作用范围 | 是否必须每进程执行 | 说明               |
|----|---------|--------------------|------|-----------|------------------|
| 1  | `pipe`  | pipe buffer（内核缓冲区） | 系统   | 创建者执行一次   | 在内核中创建匿名管道（无文件名） |
| 2  | `fork`  | fd 表继承             | 进程   | 创建者执行一次   | 子进程继承父进程的读写 fd   |
| 3  | `close` | 文件描述符 fd           | 进程   | 每个进程按需执行  | 关闭不用的读端或写端 fd    |
| 4  | `write` | 内核 pipe buffer     | 进程   | 写端进程执行    | 将数据写入管道缓冲区       |
| 5  | `read`  | 内核 pipe buffer     | 进程   | 读端进程执行    | 从管道缓冲区读取数据       |
| 6  | `close` | 文件描述符 fd           | 进程   | 是         | 关闭管道端口（触发 EOF）   |

命名管道生命周期：

| 阶段 | 系统调用     | 作用对象             | 作用范围 | 是否必须每进程执行      | 说明                    |
|----|----------|------------------|------|----------------|-----------------------|
| 1  | `mkfifo` | FIFO inode（文件节点） | 系统   | 创建者执行一次        | 在文件系统创建一个命名管道（FIFO文件） |
| 2  | `open`   | fd               | 进程   | 每个参与通信进程都需要    | 打开FIFO，生成读端或写端fd      |
| 3  | `write`  | 内核管道缓冲区          | 进程   | 写端进程执行         | 将数据写入FIFO缓冲区          |
| 4  | `read`   | 内核管道缓冲区          | 进程   | 读端进程执行         | 从FIFO缓冲区读取数据          |
| 5  | `close`  | 文件描述符 fd         | 进程   | 是              | 关闭当前进程的FIFO fd        |
| 6  | `unlink` | FIFO inode       | 系统   | 一般由创建者或最后使用者执行 | 删除FIFO文件名，释放路径入口      |

### 6. 管道对比{#管道对比}

这两者都属于管道，但适用场景不同：

| 维度   | 匿名管道              | 命名管道          |
|------|-------------------|---------------|
| 命名方式 | 无名字，只靠已打开的文件描述符引用 | 有文件系统路径名      |
| 典型关系 | 父子进程              | 不相关进程也可使用     |
| 生命周期 | 跟随进程与描述符          | 跟随引用，直到所有引用消失 |
| 通信方向 | 半双工               | 一般为半双工        |

如果只是父子进程之间传一点字节流，匿名管道最直接；如果双方没有亲缘关系，但都在同一台机器上，命名管道更自然。

## 信号{#信号}

### 1. 信号通知{#信号通知}

信号（`signal`）属于进程间通知机制，和共享内存、管道、socket 不在同一层次。

前面几类 IPC 的重点是“传输数据”；信号的重点则是“发送通知”。它通常只携带非常有限的信息，常见用途包括：

| 用途      | 例子                           |
|---------|------------------------------|
| 生命周期通知  | 子进程结束后向父进程触发 `SIGCHLD`       |
| 用户自定义通知 | 进程之间发送 `SIGUSR1`、`SIGUSR2`   |
| 控制行为    | `SIGTERM` 请求终止，`SIGINT` 响应中断 |

因此，信号更接近“事件通知”而不是“数据通道”。如果要传输成块数据，仍应优先考虑共享内存、管道或 socket。

### 2. kill 与 sigaction{#kill-sigaction}

发送信号最常见的接口是：

```c
int kill(pid_t pid, int sig);
```

`kill` 的参数与返回值如下：

| 项     | 含义                  |
|-------|---------------------|
| `pid` | 目标进程 ID             |
| `sig` | 要发送的信号，例如 `SIGUSR1` |
| 成功返回  | `0`                 |
| 失败返回  | `-1`，并设置 `errno`    |

`kill` 这个名字容易误导。它不只用于“杀死进程”，而是向目标进程发送一个指定信号；至于收到信号后发生什么，要看信号类型和接收方的处理方式。

接收方更推荐使用 `sigaction` 安装处理函数：

```c
int sigaction(int signum, const struct sigaction *act, struct sigaction *oldact);
```

`sigaction` 的参数与返回值如下：

| 项        | 含义                       |
|----------|--------------------------|
| `signum` | 要处理的[信号编号](#常见信号宏)  |
| `act`    | 新的处理方式；若为 `NULL`，表示不修改   |
| `oldact` | 用于接收旧的处理方式；若不关心可传 `NULL` |
| 成功返回     | `0`                      |
| 失败返回     | `-1`，并设置 `errno`         |

`pause` 的返回语义如下：

| 项      | 含义                          |
|--------|-----------------------------|
| 参数     | 无参数                         |
| 被信号打断后 | 返回 `-1`，并设置 `errno = EINTR` |

这几个接口的分工可以如下表述：

| 接口          | 作用              |
|-------------|-----------------|
| `kill`      | 向目标进程发送信号       |
| `sigaction` | 为某个信号安装处理方式     |
| `pause`     | 挂起当前进程，直到收到一个信号 |

如果只是想让一个进程提醒另一个进程“某个事件已经发生”，信号是最轻量的方案之一。

### 3. SIGUSR1 示例{#SIGUSR1示例}

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

这个例子也说明了信号的适用范围：它适合“通知子进程现在可以做某件事”这类场景，但不适合直接承载业务数据。

## socket{#socket}

### 1. 地址族{#地址族}

socket 是通信端点。它既可以用于网络通信，也可以用于同一台机器上的本地进程通信。

最常见的两个地址族如下：

| 地址族       | 作用        | 地址形式                      |
|-----------|-----------|---------------------------|
| `AF_UNIX` | 同机 IPC    | 文件系统路径，如 `"/tmp/os.sock"` |
| `AF_INET` | IPv4 网络通信 | IP 地址 + 端口                |

从 API 形态看，这两类 socket 的主线是相同的；差别主要在地址结构不同。由于本篇聚焦 IPC，后面示例采用 `AF_UNIX`
。如果要跨主机通信，只需把地址族换成 `AF_INET`，并改用 IP/端口地址结构。

### 2. 核心 API{#socket核心API}

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

服务端核心 API 的参数与返回值如下：

| API                              | 关键参数                                           | 成功返回      | 失败返回             |
|----------------------------------|------------------------------------------------|-----------|------------------|
| `socket(domain, type, protocol)` | `domain` 为地址族，`type` 为套接字类型，`protocol` 通常为 `0` | 非负套接字描述符  | `-1`，并设置 `errno` |
| `bind(sockfd, addr, addrlen)`    | `sockfd` 为套接字，`addr` 为本地地址结构，`addrlen` 为地址长度   | `0`       | `-1`，并设置 `errno` |
| `listen(sockfd, backlog)`        | `sockfd` 为监听套接字，`backlog` 为等待队列长度              | `0`       | `-1`，并设置 `errno` |
| `accept(sockfd, addr, addrlen)`  | `sockfd` 为监听套接字，后两个参数可用于接收对端地址                 | 新连接对应的描述符 | `-1`，并设置 `errno` |

客户端核心 API 的参数与返回值如下：

| API                              | 关键参数                                         | 成功返回     | 失败返回             |
|----------------------------------|----------------------------------------------|----------|------------------|
| `socket(domain, type, protocol)` | 与服务端相同                                       | 非负套接字描述符 | `-1`，并设置 `errno` |
| `connect(sockfd, addr, addrlen)` | `sockfd` 为套接字，`addr` 为目标地址结构，`addrlen` 为地址长度 | `0`      | `-1`，并设置 `errno` |

连接建立后的常用 I/O API 如下：

| API                             | 关键参数                       | 成功返回                   | 失败返回             |
|---------------------------------|----------------------------|------------------------|------------------|
| `read(fd, buf, count)`          | 从描述符读入至多 `count` 字节到 `buf` | 实际读到的字节数；若为 `0` 表示对端关闭 | `-1`，并设置 `errno` |
| `write(fd, buf, count)`         | 向描述符写出 `count` 字节          | 实际写出的字节数               | `-1`，并设置 `errno` |
| `send(sockfd, buf, len, flags)` | socket 专用发送接口              | 实际发送字节数                | `-1`，并设置 `errno` |
| `recv(sockfd, buf, len, flags)` | socket 专用接收接口              | 实际接收字节数；若为 `0` 表示对端关闭  | `-1`，并设置 `errno` |
| `close(fd)`                     | 关闭文件描述符或套接字                | `0`                    | `-1`，并设置 `errno` |

### 3. AF_UNIX 示例{#AF_UNIX示例}

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

## 小结{#小结}

IPC 的主干其实很清楚：共享内存负责把同一段数据暴露给多个进程，消息传递负责通过内核维护的通道交换数据。

`shm_open + mmap` 适合低开销共享，`pipe` 适合父子进程间的单向字节流，`mkfifo` 把这种字节流扩展到不相关进程，`signal`
多用于简单通知，`socket` 则进一步提供了双向、可扩展到网络的通信模型。

---

# 附注

### 附注：常见信号宏{#常见信号宏}

以下宏定义均位于 `<signal.h>`

| 宏名        | 含义              | 默认行为            | 备注                       |
|-----------|-----------------|-----------------|--------------------------|
| `SIGINT`  | 终端中断信号（Ctrl+C）  | 终止进程            | -                        |
| `SIGTERM` | 终止信号（kill 默认发送） | 终止进程            | -                        |
| `SIGKILL` | 强制终止信号          | 立即终止            | 不能被捕获、阻塞或忽略              |
| `SIGSTOP` | 停止进程            | 暂停执行            | 不能被捕获、阻塞或忽略              |
| `SIGCONT` | 继续执行被停止的进程      | 继续执行            | -                        |
| `SIGQUIT` | 终端退出信号（Ctrl+\）  | 终止并产生 core dump | -                        |
| `SIGHUP`  | 挂起信号（终端断开）      | 终止进程            | -                        |
| `SIGALRM` | 定时器到期信号         | 终止进程            | -                        |
| `SIGCHLD` | 子进程状态改变         | 忽略（默认）          | 常用于`wait / waitpid`回收子进程 |
| `SIGPIPE` | 向无读端的管道写数据      | 终止进程            | -                        |
| `SIGSEGV` | 非法内存访问（段错误）     | 终止并产生 core dump | -                        |
| `SIGBUS`  | 总线错误（内存访问异常）    | 终止并产生 core dump | -                        |
| `SIGFPE`  | 算术异常（如除零）       | 终止并产生 core dump | -                        |
| `SIGUSR1` | 用户自定义信号1        | 终止进程            | -                        |
| `SIGUSR2` | 用户自定义信号2        | 终止进程            | -                        |
| `SIGTRAP` | 调试断点信号          | 终止并产生 core dump | -                        |
| `SIGABRT` | 调用 `abort()` 触发 | 终止并产生 core dump | -                        |
