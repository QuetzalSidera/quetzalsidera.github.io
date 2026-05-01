---
title: 2.1.A - POSIX内存API
date: 2026-04-26T00:00:00
tags: [ Unix, C, POSIX, 操作系统 ]
pinned: false
collection: Unix操作系统
outline:
  - title: 内存API概述
    slug: 内存api概述
  - title: 1. 进程地址空间
    slug: 进程地址空间
    level: 1
  - title: 2. 系统调用与用户库函数
    slug: 系统调用与用户库函数
    level: 1

  - title: 系统调用
    slug: 系统调用
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
  - title: 5. brk 与 sbrk
    slug: brk-与-sbrk
    level: 1
  - title: 6. 示例：匿名映射
    slug: 示例匿名映射
    level: 1
  - title: 7. 示例：文件映射
    slug: 示例文件映射
    level: 1

  - title: 用户库函数
    slug: 用户库函数
  - title: 1. malloc 与 free
    slug: malloc-与-free
    level: 1
  - title: 2. calloc 与 realloc
    slug: calloc-与-realloc
    level: 1
  - title: 3. 分配器如何管理块
    slug: 分配器如何管理块
    level: 1
  - title: 4. 示例：动态扩容缓冲区
    slug: 示例动态扩容缓冲区
    level: 1

  - title: 相互关系
    slug: 相互关系

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

这一篇主要分成两部分：

1. 更接近系统调用的一组内存接口，如 `mmap`、`munmap`、`mprotect`、`msync`。
2. 用户态库提供的动态内存分配接口，如 `malloc`、`calloc`、`realloc`、`free`。

二者都和“申请内存”有关，但层级不同。前者直接改变进程地址空间，后者由 `libc` 分配器在用户态管理堆块。

## 内存API概述<a id=内存api概述></a>

### 1. 进程地址空间<a id=进程地址空间></a>

从高地址到低地址，进程地址空间常见的组成如下：

| 区域   | 作用                       |
|------|--------------------------|
| 内核空间 | 内核映射和特权地址范围，用户态不可直接访问    |
| 栈    | 函数调用现场、局部变量              |
| 映射空间 | `mmap` 建立的文件映射、匿名映射、共享库等 |
| 堆    | 用户态分配器主要管理的动态内存区域        |
| 数据区  | 全局变量、静态变量                |
| 代码区  | 程序指令和只读常量                |

这和本篇的接口正好对应：

| 接口                                       | 操作对象      |
|------------------------------------------|-----------|
| `mmap` / `munmap` / `mprotect` / `msync` | 映射空间      |
| `brk` / `sbrk`                           | 堆（`heap`） |
| `malloc` / `calloc` / `realloc` / `free` | 堆 / 映射空间  |

### 2. 系统调用与用户库函数<a id=系统调用与用户库函数></a>

| 层级    | 代表接口                               | 操作对象      | 备注        |
|-------|------------------------------------|-----------|-----------|
| 系统调用  | `mmap`、`munmap`、`mprotect`、`msync` | 映射空间      | -         |
| 系统调用  | `brk`、`sbrk`                       | 堆         | 用于改变堆大小   |
| 用户库函数 | `malloc`、`calloc`、`realloc`、`free` | 分配器维护的内存块 | 在用户态完成块管理 |

共享内存相关系统调用参见 [POSIX进程间通信](./operating-sys-8-ipc-posix.md)。

## 系统调用<a id=系统调用></a>

### 1. mmap<a id=mmap></a>

`mmap` 用来在当前进程地址空间建立一段映射：

```c
#include <sys/mman.h>
void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);
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

`mmap` 的核心语义是：在当前进程地址空间建立一段新的映射区，并把它绑定到文件、共享内存对象或匿名页。

#### MAP_SHARED、MAP_PRIVATE 与 MAP_ANONYMOUS<a id=MAP_SHARED-MAP_PRIVATE-与-MAP_ANONYMOUS></a>

`mmap` 最关键的三个标志如下：

| 标志              | 含义   | 典型效果                         |
|-----------------|------|------------------------------|
| `MAP_SHARED`    | 共享映射 | 修改对共享同一映射对象的进程可见，并可同步回后备文件   |
| `MAP_PRIVATE`   | 私有映射 | 写入采用写时复制，对其他进程和底层文件不可见       |
| `MAP_ANONYMOUS` | 匿名映射 | 映射不绑定普通文件，通常与 `fd = -1` 一起使用 |

三者关系实际上是两个层级：

| 标志                           | 说明            |
|------------------------------|---------------|
| `MAP_SHARED` / `MAP_PRIVATE` | 映射共享/私有       |
| `MAP_ANONYMOUS`              | 映射是否有普通文件后备对象 |

因此：

| 组合                             | 含义                 |
|--------------------------------|--------------------|
| `MAP_SHARED + 文件fd`            | 共享文件映射             |
| `MAP_PRIVATE + 文件fd`           | 私有文件映射             |
| `MAP_PRIVATE \| MAP_ANONYMOUS` | 私有匿名映射，是最常见的匿名映射写法 |

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

`munmap` 与 `mmap` 都对应内核地址空间操作。调用成功后，这段内存映射会立刻从当前进程地址空间移除；继续访问该地址会再次陷入内核，并通常以访问异常结束。

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

常见用途如下：

| 场景     | 用途                       |
|--------|--------------------------|
| 代码页控制  | 区分可写和可执行                 |
| 保护页    | 把某页设为 `PROT_NONE`，用于捕获越界 |
| 分阶段初始化 | 先写入数据，再改成只读              |

### 4. msync<a id=msync></a>

`msync` 只对文件后备的共享映射有意义，用来将映射区的数据写入到磁盘：

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

flags:

| 标志              | 含义                                    |
|-----------------|---------------------------------------|
| `MS_ASYNC`      | 调度所有写操作完毕立刻返回，异步写入                    |
| `MS_SYNC`       | 写操作完毕返回，同步写入                          |
| `MS_INVALIDATE` | 使其他映射失效[*](#附注-msync-flags)，并在下次读取前更新 |

若映射是`MAP_ANONYMOUS`或`MAP_PRIVATE`，那么`msync`是无意义的，前者无后备文件，后者不会写入后备文件。

### 5. brk 与 sbrk<a id=brk-与-sbrk></a>

`brk` 和 `sbrk` 改变 program break 的位置。program break 是堆的末端（堆顶），因此这两个接口实际上改变持程序的堆内存大小。

```c
#include <stdint.h>
#include <unistd.h>
int brk(void *addr);
void *sbrk(intptr_t increment);
```

参数与返回值如下：

| 接口     | 作用                     | 成功返回        | 失败返回                     |
|--------|------------------------|-------------|--------------------------|
| `brk`  | 把 program break 设到指定位置 | `0`         | `-1`，并设置 `errno`         |
| `sbrk` | 按增量移动 program break    | 旧的 break 地址 | `(void *)-1`，并设置 `errno` |

### 6. 示例：匿名映射<a id=示例匿名映射></a>

以下示例介绍了匿名映射的基本使用方法：

```c
#include <stdio.h>
#include <sys/mman.h>
#include <unistd.h>

int main(void) {
    size_t len = 4096;
    int *buf = mmap(NULL, len, PROT_READ | PROT_WRITE, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
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

这个例子里没有普通文件对象，`mmap` 只是向内核申请了一段匿名页，并把它映射到当前进程地址空间。

### 7. 示例：文件映射<a id=示例文件映射></a>

以下示例介绍了文件映射的基本使用方法：

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

它和 `read` 的区别在于：程序不再显式把文件内容复制到用户缓冲区，而是直接把文件页纳入地址空间，再按普通内存读取。

## 用户库函数<a id=用户库函数></a>

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

其语义如下：`malloc` 从分配器维护的空闲块集合里找出一块合适的内存返回给程序，`free` 再把这块内存交还给分配器。

这里需要明确一点：`free` 的目标是把块归还给分配器，而不是保证立刻归还给内核。

### 2. calloc 与 realloc<a id=calloc-与-realloc></a>

另外两个常见接口是 `calloc` 和 `realloc`：

```c
#include <stdlib.h>
void *calloc(size_t nmemb, size_t size);
void *realloc(void *ptr, size_t size);
```

`calloc`一般用于分配并初始化数组，其参数与返回值如下：

| 项       | 含义           |
|---------|--------------|
| `nmemb` | 元素个数         |
| `size`  | 每个元素大小       |
| 成功返回    | 指向一块零填充内存的指针 |
| 失败返回    | `NULL`       |

`realloc` 用于改变分配内存大小，其参数与返回值如下：

| 项      | 含义                       |
|--------|--------------------------|
| `ptr`  | 旧指针；也可传 `NULL`           |
| `size` | 新大小                      |
| 成功返回   | 指向新内存块的指针，可能与原地址相同，也可能不同 |
| 失败返回   | `NULL`；失败时旧指针仍然有效        |

### 3. 分配器如何管理块<a id=分配器如何管理块></a>

从程序员视角看，`malloc` 只是返回一个指针；从分配器视角看，它维护的是一组块（`chunk`）。

最常见的组织方式如下：

```text
+---------+----------------------+
| header  | user payload         |
+---------+----------------------+
          ^
          malloc 返回给程序的位置
```

程序真正拿到的是 `payload`，而分配器通常会在前面放置元数据。常见元数据包括：

| 元数据  | 作用                  |
|------|---------------------|
| 块大小  | 确定该块覆盖范围            |
| 使用状态 | 区分已分配块和空闲块          |
| 链接信息 | 当块空闲时，挂到空闲链表或 bin 上 |

分配器的动作通常只有三类：

| 动作            | 含义                       |
|---------------|--------------------------|
| 分裂 `split`    | 大空闲块切成“已分配部分 + 剩余空闲部分”   |
| 合并 `coalesce` | 相邻空闲块重新合并，减少碎片           |
| 复用 `reuse`    | 新申请优先复用已有空闲块，而不是立刻向内核要内存 |

因此，`malloc` / `free` 的主要工作是在用户态先维护一套更细粒度的块管理。

### 4. 示例：动态扩容缓冲区<a id=示例动态扩容缓冲区></a>

以下示例展示了 `malloc + realloc` 的用法：

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

## 相互关系<a id=相互关系></a>

当用户态分配器手里没有足够空闲块时，才需要向内核扩张可管理的地址空间。常见路径如下：

| 路径    | 代表接口         | 对象    | 特点      |
|-------|--------------|-------|---------|
| 扩张数据段 | `brk`、`sbrk` | 进程堆顶端 | 线性扩张堆内存 |
| 新建映射区 | `mmap`       | 独立映射区 | 易于回收    |

`malloc` 不是系统调用，但它在必要时会借助更底层的地址空间接口向内核申请新区域。传统堆扩张通常对应 `brk/sbrk`
；而较大的独立区域会使用 `mmap`。如下：

```text
malloc/free
    ↓
用户态分配器：维护 chunk、空闲链表、分裂/合并
    ↓
必要时向内核申请更多地址空间
    ↓
brk/sbrk 或 mmap
```

`mmap` 是系统调用，执行时会陷入内核，开销远远大于`malloc` ，因此更适合如下几类场景：

| 场景     | 原因                     |
|--------|------------------------|
| 文件映射   | 仅`mmap`可映射文件           |
| 共享内存   | 共享内存暴露的接口类似于文件         |
| 大块独立区域 | 希望和普通堆分离，便于独立回收        |
| 权限控制   | 需要 `mprotect` 调整读写执行权限 |

---

# 附注

### 1. `msync`的`flags` <a id=附注-msync-flags></a>

在man手册中，对`msync`及其`flags`描述如下：

```text
msync() flushes changes made to the in-core copy of a file that was mapped into memory using mmap(2) back to disk.
Without use of this call there is no guarantee that changes are written back before munmap(2) is called. 
To be more precise, the part of the file that corresponds to the memory area starting at addr and having length lengthis updated.

The flags argument may have the bits MS_ASYNC, MS_SYNC, and MS_INVALIDATEset, 
but not both MS_ASYNC and MS_SYNC. MS_ASYNC specifies that an update be scheduled, 
but the call returns immediately. MS_SYNC asks for an update and waits for it to complete. 
MS_INVALIDATE asks to invalidate other mappings of the same file (so that they can be updated with the fresh values just written).
```

即：`MS_ASYNC`与`MS_SYNC`指定`msync`调用与实际写入磁盘的时序关系；`MS_INVALIDATE`
把同一个文件的其他内存映射标记为“无效”，这样它们下次访问时会重新从文件中读取最新的数据。

`MS_SYNC` | `MS_INVALIDATE`或`MS_ASYNC` | `MS_INVALIDATE`是合法的，但`MS_ASYNC` | `MS_SYNC`是非法的。
