---
title: 2.1.A - POSIX内存API
date: 2026-04-25T00:00:00
tags: [ Unix, C, POSIX, 操作系统 ]
pinned: false
collection: Unix操作系统
outline:
  - title: 内存API概述
    slug: 内存api概述
  - title: 1. 两条路径：映射与分配
    slug: 两条路径映射与分配
    level: 1
  - title: 2. 接口分层
    slug: 接口分层
    level: 1
  - title: 3. 本篇范围
    slug: 本篇范围
    level: 1

  - title: 内存映射接口
    slug: 内存映射接口
  - title: 1. mmap
    slug: mmap
    level: 1
  - title: 2. munmap
    slug: munmap
    level: 1
  - title: 3. mprotect
    slug: mprotect
    level: 1
  - title: 4. msync
    slug: msync
    level: 1
  - title: 5. 示例：匿名映射
    slug: 示例匿名映射
    level: 1
  - title: 6. 示例：文件映射
    slug: 示例文件映射
    level: 1

  - title: 用户态分配接口
    slug: 用户态分配接口
  - title: 1. malloc 与 free
    slug: malloc-与-free
    level: 1
  - title: 2. calloc 与 realloc
    slug: calloc-与-realloc
    level: 1
  - title: 3. 分配器如何管理块
    slug: 分配器如何管理块
    level: 1
  - title: 4. 分配器如何向内核申请内存
    slug: 分配器如何向内核申请内存
    level: 1
  - title: 5. 示例：动态扩容缓冲区
    slug: 示例动态扩容缓冲区
    level: 1

  - title: 映射与分配的边界
    slug: 映射与分配的边界
  - title: 1. malloc 不是系统调用
    slug: malloc-不是系统调用
    level: 1
  - title: 2. malloc 与 mmap 的关系
    slug: malloc-与-mmap-的关系
    level: 1
  - title: 3. 何时直接使用 mmap
    slug: 何时直接使用-mmap
    level: 1

  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 一篇围绕 Unix 用户态内存接口展开的笔记，介绍 mmap、munmap、mprotect、msync，以及 malloc、calloc、realloc、free 与分配器的基本工作方式。
  - - meta
    - name: keywords
      content: Unix, POSIX, mmap, munmap, mprotect, msync, malloc, calloc, realloc, free, brk, sbrk
---

一篇围绕 Unix 用户态内存接口展开的学习笔记。

---

在 [内存基础](./operating-sys-9-memory.md) 里，已经从操作系统视角讨论了分页、页表、`TLB`、交换和内存映射。接下来把这些概念落到用户态最常碰到的一组接口上。

这一篇会同时覆盖两条路径：

1. `mmap` 这类***映射接口***，直接让进程地址空间和某个内核对象建立映射。
2. `malloc` 这类***分配接口***，由用户态分配器在进程内部管理可用内存块。

这两条路径经常一起出现，但层级并不相同。`mmap` 更接近内核提供的虚拟内存接口；`malloc` 则属于 `libc`
分配器。理解它们的边界，比记住单个函数原型更重要。

## 内存API概述<a id=内存api概述></a>

### 1. 两条路径：映射与分配<a id=两条路径映射与分配></a>

从用户态看，程序拿到一段可用内存通常有两种方式：

| 路径 | 代表接口            | 核心对象     | 典型用途             |
|----|-----------------|----------|------------------|
| 映射 | `mmap`、`munmap` | 虚拟内存映射区  | 文件映射、共享内存、大块匿名内存 |
| 分配 | `malloc`、`free` | 分配器管理的堆块 | 普通动态数据结构         |

二者的区别不在“都能返回一个指针”，而在于这段指针背后是谁在管理。

### 2. 接口分层<a id=接口分层></a>

这一组接口实际上跨了三层：

| 层级            | 接口                                 | 对象     | 备注                       |
|---------------|------------------------------------|--------|--------------------------|
| POSIX / 系统调用层 | `mmap`、`munmap`、`mprotect`、`msync` | 虚拟内存映射 | 直接和内核中的映射区打交道            |
| C 标准库层        | `malloc`、`calloc`、`realloc`、`free` | 用户态堆块  | 由 `libc` 分配器维护           |
| 历史扩展接口        | `brk`、`sbrk`                       | 数据段末端  | 常用于解释分配器实现，但不属于 POSIX 主干 |

因此，这篇虽然叫“POSIX内存 API”，但会把 `malloc` 家族一起写进来，因为它正好位于“内存理论”和“实际写程序”之间。

### 3. 本篇范围<a id=本篇范围></a>

本篇聚焦下面三件事：

1. `mmap` 及其相关接口如何控制映射、权限和同步。
2. `malloc` 家族如何向程序提供动态内存。
3. 用户态分配器和内核虚拟内存接口之间如何衔接。

本篇不展开 `shm_open`、`MAP_SHARED` 上的进程间通信细节；那部分已经在 [POSIX进程间通信](./operating-sys-8-ipc-posix.md)
里讨论过。

## 内存映射接口<a id=内存映射接口></a>

### 1. mmap<a id=mmap></a>

`mmap` 用来在当前进程地址空间建立一段映射：

```c
#include <sys/mman.h>
void *mmap(void *addr, size_t length, int prot,
           int flags, int fd, off_t offset);
```

参数与返回值如下：

| 项        | 含义                                                      |
|----------|---------------------------------------------------------|
| `addr`   | 期望映射到的起始地址；通常传 `NULL`，由内核决定                             |
| `length` | 映射长度，单位为字节                                              |
| `prot`   | 访问权限，如 `PROT_READ`、`PROT_WRITE`、`PROT_EXEC`、`PROT_NONE` |
| `flags`  | 映射类型和附加行为，如 `MAP_SHARED`、`MAP_PRIVATE`、`MAP_ANONYMOUS`  |
| `fd`     | 文件描述符；匿名映射时通常传 `-1`                                     |
| `offset` | 从文件哪个偏移开始映射；通常要求按页对齐                                    |
| 成功返回     | 映射区起始地址                                                 |
| 失败返回     | `MAP_FAILED`，并设置 `errno`                                |

最常见的几组组合如下：

| 组合                            | 含义                |
|-------------------------------|-------------------|
| `MAP_PRIVATE + 文件fd`          | 私有文件映射，写入对其他进程不可见 |
| `MAP_SHARED + 文件fd`           | 共享文件映射，修改可回写到后备文件 |
| `MAP_PRIVATE\| MAP_ANONYMOUS` | 私有匿名映射，没有文件后备对象   |

如果只从对象关系看，`mmap` 做的事可以压缩成一句话：
***在进程虚拟地址空间里新增一段映射区，并把它绑定到文件、共享内存对象或匿名页。***

### 2. munmap<a id=munmap></a>

`munmap` 用来撤销映射：

```c
#include <sys/mman.h>
int munmap(void *addr, size_t length);
```

参数与返回值如下：

| 项        | 含义               |
|----------|------------------|
| `addr`   | 要解除映射的起始地址       |
| `length` | 解除映射的长度          |
| 成功返回     | `0`              |
| 失败返回     | `-1`，并设置 `errno` |

`munmap` 的语义比 `free` 更“硬”：它直接撤销虚拟地址映射。调用成功后，这段地址不再属于当前进程地址空间，继续访问会触发异常。

### 3. mprotect<a id=mprotect></a>

`mprotect` 用来修改一段已有映射的访问权限：

```c
#include <sys/mman.h>
int mprotect(void *addr, size_t len, int prot);
```

参数与返回值如下：

| 项      | 含义                                                     |
|--------|--------------------------------------------------------|
| `addr` | 目标地址区间起始地址                                             |
| `len`  | 目标区间长度                                                 |
| `prot` | 新权限，如 `PROT_READ`、`PROT_WRITE`、`PROT_EXEC`、`PROT_NONE` |
| 成功返回   | `0`                                                    |
| 失败返回   | `-1`，并设置 `errno`                                       |

它常用于三类场景：

| 场景     | 用途                       |
|--------|--------------------------|
| 代码页控制  | 区分可写和可执行                 |
| 保护页    | 把某页设为 `PROT_NONE`，用于捕获越界 |
| 分阶段初始化 | 先写入数据，再改成只读              |

### 4. msync<a id=msync></a>

`msync` 只对***文件后备的共享映射***有意义，用来控制映射区修改何时同步到文件：

```c
#include <sys/mman.h>
int msync(void *addr, size_t length, int flags);
```

参数与返回值如下：

| 项        | 含义                                          |
|----------|---------------------------------------------|
| `addr`   | 目标映射区起始地址                                   |
| `length` | 需要同步的字节数                                    |
| `flags`  | 同步方式，如 `MS_SYNC`、`MS_ASYNC`、`MS_INVALIDATE` |
| 成功返回     | `0`                                         |
| 失败返回     | `-1`，并设置 `errno`                            |

若映射本身是匿名映射，或者是 `MAP_PRIVATE` 私有映射，那么“回写到底层文件”这件事就不成立，`msync` 的语义也随之失去核心意义。

### 5. 示例：匿名映射<a id=示例匿名映射></a>

下面是一个最小匿名映射例子：

```c
#include <stdio.h>
#include <sys/mman.h>
#include <unistd.h>

int main(void) {
    size_t len = 4096;
    int *buf = mmap(NULL, len,
                    PROT_READ | PROT_WRITE,
                    MAP_PRIVATE | MAP_ANONYMOUS,
                    -1, 0);
    if (buf == MAP_FAILED) {
        perror("mmap");
        return 1;
    }

    for (int i = 0; i < 8; ++i) {
        buf[i] = i * i;
    }

    for (int i = 0; i < 8; ++i) {
        printf("%d\n", buf[i]);
    }

    if (munmap(buf, len) != 0) {
        perror("munmap");
        return 1;
    }
    return 0;
}
```

这个例子里没有文件对象，`mmap` 只是向内核要了一段匿名页，并把它映射到当前进程地址空间。

### 6. 示例：文件映射<a id=示例文件映射></a>

文件映射通常长这样：

```c
#include <fcntl.h>
#include <stdio.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>

int main(void) {
    int fd = open("data.txt", O_RDONLY);
    if (fd < 0) {
        perror("open");
        return 1;
    }

    struct stat st;
    if (fstat(fd, &st) != 0) {
        perror("fstat");
        close(fd);
        return 1;
    }

    char *p = mmap(NULL, st.st_size, PROT_READ, MAP_PRIVATE, fd, 0);
    if (p == MAP_FAILED) {
        perror("mmap");
        close(fd);
        return 1;
    }

    write(STDOUT_FILENO, p, st.st_size);

    munmap(p, st.st_size);
    close(fd);
    return 0;
}
```

它和 `read` 的区别是：程序不再显式把文件内容“拷贝进一个用户缓冲区”，而是直接把文件页纳入地址空间，再按普通内存读取。

## 用户态分配接口<a id=用户态分配接口></a>

### 1. malloc 与 free<a id=malloc-与-free></a>

最常见的一组动态分配接口如下：

```c
#include <stdlib.h>
void *malloc(size_t size);
void free(void *ptr);
```

`malloc` 的参数与返回值如下：

| 项      | 含义         |
|--------|------------|
| `size` | 申请的字节数     |
| 成功返回   | 指向可用内存块的指针 |
| 失败返回   | `NULL`     |

`free` 的参数与返回值如下：

| 项     | 含义          |
|-------|-------------|
| `ptr` | 之前由分配器返回的指针 |
| 返回值   | 无           |

语义可以压缩成一句话：`malloc` 从***分配器管理的空闲块集合***里找一块合适的内存返回给程序，`free` 再把这块内存交还给分配器。

这里要注意一点：`free` 的目标是***归还给分配器***，不是保证***立刻归还给内核***。

### 2. calloc 与 realloc<a id=calloc-与-realloc></a>

另外两个常见接口是 `calloc` 和 `realloc`：

```c
#include <stdlib.h>
void *calloc(size_t nmemb, size_t size);
void *realloc(void *ptr, size_t size);
```

`calloc` 的参数与返回值如下：

| 项       | 含义           |
|---------|--------------|
| `nmemb` | 元素个数         |
| `size`  | 每个元素大小       |
| 成功返回    | 指向一块零填充内存的指针 |
| 失败返回    | `NULL`       |

`realloc` 的参数与返回值如下：

| 项      | 含义                       |
|--------|--------------------------|
| `ptr`  | 旧指针；也可传 `NULL`           |
| `size` | 新大小                      |
| 成功返回   | 指向新内存块的指针，可能与原地址相同，也可能不同 |
| 失败返回   | `NULL`；失败时旧指针仍然有效        |

两者最核心的区别如下：

| 接口        | 核心语义          |
|-----------|---------------|
| `calloc`  | 分配并清零         |
| `realloc` | 调整已有块大小，必要时搬迁 |

`realloc` 最容易写错的点有两个：

1. 成功后旧指针就不应再使用。
2. 失败时旧指针还在，不能因为返回 `NULL` 就把原指针丢掉。

### 3. 分配器如何管理块<a id=分配器如何管理块></a>

从程序员视角看，`malloc` 只是返回一个指针；从分配器视角看，它维护的是一组***块***（`chunk`）。

最常见的组织方式可以抽象成：

```text
+---------+----------------------+
| header  | user payload         |
+---------+----------------------+
          ^
          malloc 返回给程序的位置
```

也就是说，程序看到的是 `payload`，而分配器通常会在前面放一段元数据。块头里常见的信息包括：

| 元数据  | 作用                  |
|------|---------------------|
| 块大小  | 确定该块覆盖范围            |
| 使用状态 | 区分已分配块和空闲块          |
| 链接信息 | 当块空闲时，挂到空闲链表或 bin 上 |

分配器的核心动作通常只有三类：

| 动作            | 含义                       |
|---------------|--------------------------|
| 分裂 `split`    | 大空闲块切成“已分配部分 + 剩余空闲部分”   |
| 合并 `coalesce` | 相邻空闲块重新合并，减少碎片           |
| 复用 `reuse`    | 新申请优先复用已有空闲块，而不是立刻向内核要内存 |

因此，`malloc` / `free` 的本质不是“每次都向系统申请和释放”，而是在用户态先维护一套更细粒度的块管理。

### 4. 分配器如何向内核申请内存<a id=分配器如何向内核申请内存></a>

当用户态分配器手里没有足够空闲块时，才需要向内核扩张可管理的地址空间。传统上常见两条路径：

| 路径    | 代表接口         | 对象           | 特点         |
|-------|--------------|--------------|------------|
| 扩张数据段 | `brk`、`sbrk` | 进程 `heap` 顶端 | 线性扩张，历史上常见 |
| 新建映射区 | `mmap`       | 独立映射区        | 粒度更大，回收更直接 |

若只为理解传统 `heap` 的增长方式，可以记住下面两个历史接口：

```c
#include <stdint.h>
#include <unistd.h>
int brk(void *addr);
void *sbrk(intptr_t increment);
```

| 接口     | 作用                     | 成功返回        | 失败返回                     |
|--------|------------------------|-------------|--------------------------|
| `brk`  | 把 program break 设到指定位置 | `0`         | `-1`，并设置 `errno`         |
| `sbrk` | 按增量移动 program break    | 旧的 break 地址 | `(void *)-1`，并设置 `errno` |

这里要明确两点：

1. `brk` / `sbrk` 更适合用来理解“传统 heap 如何增长”，但它们不是 POSIX 主干接口。
2. 现代分配器通常不会只靠一种路径，而会根据块大小和实现策略混合使用 `brk` 与 `mmap`。

如果只看层级关系，可以压缩成下面这条链路：

```text
malloc/free
    ↓
用户态分配器：维护 chunk、空闲链表、分裂/合并
    ↓
必要时向内核申请更多地址空间
    ↓
brk/sbrk 或 mmap
```

### 5. 示例：动态扩容缓冲区<a id=示例动态扩容缓冲区></a>

下面是一个最小的 `malloc + realloc` 例子：

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void) {
    size_t cap = 8;
    char *buf = malloc(cap);
    if (buf == NULL) {
        perror("malloc");
        return 1;
    }

    strcpy(buf, "unix");

    cap *= 2;
    char *new_buf = realloc(buf, cap);
    if (new_buf == NULL) {
        free(buf);
        perror("realloc");
        return 1;
    }
    buf = new_buf;

    strcat(buf, "-memory");
    puts(buf);

    free(buf);
    return 0;
}
```

这个例子要说明的是：程序只看到了一个可扩容缓冲区；至于底层是“原地扩张”还是“搬到新块再拷贝”，由分配器决定。

## 映射与分配的边界<a id=映射与分配的边界></a>

### 1. malloc 不是系统调用<a id=malloc-不是系统调用></a>

`malloc` 不是系统调用，它首先是 `libc` 提供的函数。多数 `malloc` / `free` 调用并不会直接陷入内核，而是在用户态分配器里完成块查找、分裂、合并和复用。

这也是为什么“申请一小块内存”通常比“直接建立一段映射”更轻：前者很多时候只是在用户态元数据上操作，后者必然要改动进程页表和映射区。

### 2. malloc 与 mmap 的关系<a id=malloc-与-mmap-的关系></a>

`malloc` 和 `mmap` 不是互斥关系，而是上下层关系。

| 维度       | `mmap`          | `malloc`      |
|----------|-----------------|---------------|
| 层级       | 映射接口            | 用户态分配接口       |
| 管理单位     | 页和映射区           | 堆块 `chunk`    |
| 是否每次都进内核 | 是               | 不一定           |
| 回收方式     | `munmap` 直接撤销映射 | `free` 先归还分配器 |
| 典型对象     | 文件、共享内存、匿名页     | 普通动态对象        |

很多实现里，大块分配会直接走 `mmap`，小块分配则更多复用 allocator 已有的堆块。这正好说明：`malloc` 并不和 `mmap` 平行，它经常建立在
`mmap` 之上。

### 3. 何时直接使用 mmap<a id=何时直接使用-mmap></a>

直接使用 `mmap` 通常适合下面几类场景：

| 场景     | 原因                     |
|--------|------------------------|
| 文件映射   | 目标本来就是文件页，而不是普通堆对象     |
| 共享内存   | 需要多个进程映射同一段对象          |
| 大块独立区域 | 希望和普通 heap 分离，便于独立回收   |
| 权限控制   | 需要 `mprotect` 调整读写执行权限 |

而对链表、树、动态数组、字符串缓冲区这类普通用户态对象，`malloc` 家族通常是更合适的入口。

## 小结<a id=小结></a>

这一篇可以收成 4 句话：

1. `mmap` 管理的是***映射区***，`malloc` 管理的是***堆块***。
2. `munmap` 是直接撤销地址空间映射，`free` 只是把块交回用户态分配器。
3. `malloc` 不是系统调用，它通常在需要时才通过 `brk` 或 `mmap` 向内核扩张地址空间。
4. 文件映射、共享内存、权限控制更适合直接走 `mmap`；普通动态对象更适合走 `malloc` 家族。
