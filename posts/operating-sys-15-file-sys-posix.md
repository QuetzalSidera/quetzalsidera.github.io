---
title: 3.5 - 虚拟文件系统及POSIX API
date: 2026-05-08T00:00:00
tags: [ Unix, C,POSIX, 操作系统 ]
pinned: false
collection: Unix操作系统
outline:
  - title: 虚拟文件系统
    slug: 虚拟文件系统
  - title: 1. 概述
    slug: vfs-概述
    level: 1
  - title: 2. VFS 对象
    slug: vfs-的四类对象
    level: 1
  - title: 3. 打开文件表
    slug: 打开文件表
    level: 1
  - title: 4. 数据与操作表
    slug: 数据与操作
    level: 1

  - title: 文件系统 API
    slug: 文件系统-api
  - title: 1. mount、umount
    slug: mount-umount
    level: 1
  - title: 2. statfs、fstatfs
    slug: statfs-fstatfs
    level: 1

  - title: 目录 API
    slug: 目录-api
  - title: 1. mkdir、rmdir、rename
    slug: mkdir-rmdir-rename
    level: 1
  - title: 2. opendir、readdir、closedir
    slug: opendir-readdir-closedir
    level: 1

  - title: 文件元数据 API
    slug: 文件元数据-api
  - title: 1. stat、fstat、lstat
    slug: stat-fstat-lstat
    level: 1
  - title: 2. chmod、fchmod、umask
    slug: chmod-fchmod-umask
    level: 1
  - title: 3. truncate、ftruncate
    slug: truncate-ftruncate
    level: 1

  - title: 文件数据 API
    slug: 文件数据-api
  - title: 1. open、creat、close
    slug: open-creat-close
    level: 1
  - title: 2. read、write、pread、pwrite
    slug: read-write-pread-pwrite
    level: 1
  - title: 3. lseek、fsync、fdatasync
    slug: lseek-fsync-fdatasync
    level: 1

  - title: 链接 API
    slug: 链接-api
  - title: 1. link、unlink
    slug: link-unlink
    level: 1
  - title: 2. symlink、readlink
    slug: symlink-readlink
    level: 1

  - title: 描述符控制 API
    slug: 描述符控制-api
  - title: 1. dup、dup2、dup3
    slug: dup-dup2-dup3
    level: 1
  - title: 2. fcntl、ioctl
    slug: fcntl-ioctl
    level: 1

  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 一篇围绕虚拟文件系统与 POSIX 文件系统 API 展开的 Unix 笔记，介绍 VFS 对象、打开文件表，以及文件、目录、链接和元数据相关接口。
  - - meta
    - name: keywords
      content: Unix, POSIX, VFS, open, read, write, stat, mkdir, link, fcntl
---

一篇围绕虚拟文件系统与 POSIX 文件系统 API 展开的学习笔记。

---

前面的几篇已经分别讨论了文件系统的抽象、硬件基础和保护机制。接下来需要回答两个更靠近程序员的问题：操作系统怎样把多种文件系统统一成同一套访问模型，以及用户态最常用的文件系统接口究竟围绕哪些对象展开。

这篇文章先讨论操作系统对文件系统的抽象，即虚拟文件系统（`VFS`，`Virtual File System`）；
再按数据类型和对象层级整理最常见的一组文件系统 POSIX API。

## 虚拟文件系统{#虚拟文件系统}

### 1. 概述{#vfs-概述}

现代操作系统往往同时支持多种文件系统：本地磁盘文件系统、可移动介质文件系统、网络文件系统，甚至内存文件系统。
如果每种文件系统都直接暴露自己独立的接口，那么上层程序就必须为每种文件系统进行适配 —— 这显然不现实。

因此，操作系统会在应用程序和具体文件系统实现之间插入一层统一抽象：

```text
应用程序 -> VFS -> 具体文件系统实现
```

`VFS` 的核心作用有两点：

| 作用   | 含义                                     |
|------|----------------------------------------|
| 统一接口 | 上层程序只看到 `open/read/write/close` 这类通用操作 |
| 隔离实现 | 具体文件系统自己负责这些操作在本地磁盘或远程文件系统上的真正实现       |

也就是说，应用程序访问的是"文件系统接口"，而不是某个具体文件系统的内部方法。

### 2. VFS 对象{#vfs-的四类对象}

Linux 的 `VFS` 一般围绕四类对象组织：

| 对象                  | 含义                               |
|---------------------|----------------------------------|
| `superblock object` | 表示一个已经挂载的文件系统                    |
| `dentry object`     | 表示单个目录项，即文件名到 `inode object` 的映射 |
| `inode object`      | 表示一个文件对象的元数据                     |
| `file object`       | 表示一个已经打开的文件实例                    |

其中最容易混淆的是 `inode object` 和 `file object`：

| 对象             | 关注点                  |
|----------------|----------------------|
| `inode object` | 文件本身的属性，如大小、权限、块位置   |
| `file object`  | 一次打开实例的状态，如当前偏移、打开方式 |

`file object` 是一个瞬时对象，在文件打开时建立，关闭时销毁。
同一个文件可以被多个进程同时打开，因此对于同一个文件，可以创建多个`file object`，并具有相互独立的`offset`。

除此之外，文件名只是目录中用于索引 inode 的可读名称，而并不是文件元数据或数据的一部分。

### 3. 打开文件表{#打开文件表}

用户进程只能够访问文件描述符表（`fd`表），但内核还维护内核文件打开表：

| 层次        | 含义            |
|-----------|---------------|
| 进程 `fd` 表 | 每个进程自己的文件描述符表 |
| 内核文件打开表   | 记录真正的打开文件状态   |

`fd`表项往往指向内核文件打开表中的某个条目，与此同时，内核打开文件表维护引用计数，以确定是否有进程使用此文件。

这样的好处在于，多个进程先后打开同一个文件，无需反复进行磁盘寻址，只需要修改`fd`表，使其指向内核打开文件表的对应条目即可。

二者关系可以表述为：

```text
进程 -> fd表项 -> 内核打开文件表条目 -> inode / dentry / superblock
```

这也是为什么两个进程都能打开同一个文件，但各自的 `fd` 号仍然不同：`fd` 是进程私有索引，而不是文件对象本身。

除此之外，操作系统还会维护缓存层。传统上，文件系统缓存和内存映射 I/O 可能分开管理；
而现代 Unix 系统一般倾向于使用统一页面缓存（`unified page cache`），避免在内存中同时维护两份文件映像。

### 4. 数据与操作表{#数据与操作}

如果把 POSIX 文件系统接口按操作对象分类，可以得到下面这张表：

| 层级    | 操作对象                | 句柄           | 常见 API                                 |
|-------|---------------------|--------------|----------------------------------------|
| 文件系统  | `superblock object` | `char* path` | `mount`、`umount`、`statfs`              |
| 目录    | `dentry object`     | `DIR* dir`   | `mkdir`、`opendir`、`readdir`、`closedir` |
| 文件元数据 | `inode object`      | `int fd`     | `stat`、`chmod`、`truncate`、`umask`      |
| 文件数据  | `file object`       | `int fd`     | `open`、`read`、`write`、`lseek`、`fsync`  |

因此，文件系统POSIX API实际上是针对不同数据的特定操作。本文也将按照这个层级，对文件系统POSIX API进行分类整理。

本篇最常出现的头文件如下：

```c
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>
#include <dirent.h>
#include <sys/ioctl.h>
```

文件系统接口的返回值风格大体如下：

| 接口类型        | 成功返回      | 失败返回             |
|-------------|-----------|------------------|
| 生成 `fd` 的接口 | 非负文件描述符   | `-1`，并设置 `errno` |
| 一般操作接口      | `0` 或非负结果 | `-1`，并设置 `errno` |
| 读取接口        | 实际读取字节数   | `-1`，并设置 `errno` |

因此，对这类接口最常见的判断模式是：

```c
int fd = open("a.txt", O_RDONLY);
if (fd < 0) {
    /* error */
}
```

## 文件系统 API{#文件系统-api}

### 1. mount、umount{#mount-umount}

`mount`与`umount`分别用于挂载与取消挂载文件系统

```c
#include <sys/mount.h>

int mount(const char *source, const char *target,
          const char *filesystemtype, unsigned long mountflags,
          const void *data);
int umount(const char *target);
int umount2(const char *target, int flags);
```

`mount` 将一个文件系统挂载到指定目录：

| 项                | 含义                                                       |
|------------------|----------------------------------------------------------|
| `source`         | 源设备路径，如 `"/dev/sda1"`；对于 `tmpfs`、`proc` 等虚拟文件系统可为 `NULL` |
| `target`         | 挂载点目录路径                                                  |
| `filesystemtype` | 文件系统类型名称，如 `"ext4"`、`"nfs"`、`"tmpfs"`                    |
| `mountflags`     | 挂载选项，按位或组合                                               |
| `data`           | 文件系统特有数据，通常传 `NULL`                                      |
| 成功返回             | `0`                                                      |
| 失败返回             | `-1`，并设置 `errno`                                         |

常用 `mountflags`：

| 标志               | 含义                              |
|------------------|---------------------------------|
| `MS_RDONLY`      | 只读挂载                            |
| `MS_NOSUID`      | 忽略 set-user-ID 和 set-group-ID 位 |
| `MS_NODEV`       | 禁止访问该文件系统上的设备文件                 |
| `MS_NOEXEC`      | 禁止执行该文件系统上的程序                   |
| `MS_SYNCHRONOUS` | 所有写入立即同步到磁盘                     |
| `MS_REMOUNT`     | 重新挂载已挂载的文件系统                    |
| `MS_BIND`        | 绑定挂载，将已挂载点镜像到另一处                |

`umount` 卸载已挂载的文件系统：

| 项        | 含义               |
|----------|------------------|
| `target` | 挂载点路径            |
| 成功返回     | `0`              |
| 失败返回     | `-1`，并设置 `errno` |

`umount2` 额外支持 `flags` 参数，常用 `MNT_FORCE`（强制卸载）、`MNT_DETACH`（延迟卸载）。`umount` 要求目标没有进程正在使用，否则返回
`EBUSY`。

### 2. statfs、fstatfs{#statfs-fstatfs}

`statfs`与`fstatfs`用于获取文件系统属性

```c
#include <sys/statfs.h>

int statfs(const char *path, struct statfs *buf);
int fstatfs(int fd, struct statfs *buf);
```

`statfs` 获取路径所在文件系统的统计信息；`fstatfs` 通过已打开的 `fd` 获取。参数与返回值：

| 接口        | 第一参数      | 第二参数                   | 成功返回 | 失败返回             |
|-----------|-----------|------------------------|------|------------------|
| `statfs`  | `path` 路径 | `buf` 接收文件系统统计信息的结构体指针 | `0`  | `-1`，并设置 `errno` |
| `fstatfs` | `fd` 描述符  | 同上                     | `0`  | `-1`，并设置 `errno` |

`struct statfs` 常用字段：

| 字段          | 类型           | 含义            |
|-------------|--------------|---------------|
| `f_type`    | `long`       | 文件系统类型 ID     |
| `f_bsize`   | `long`       | 最优传输块大小（字节）   |
| `f_blocks`  | `fsblkcnt_t` | 文件系统总数据块数     |
| `f_bfree`   | `fsblkcnt_t` | 空闲块数          |
| `f_bavail`  | `fsblkcnt_t` | 非特权用户可用空闲块数   |
| `f_files`   | `fsfilcnt_t` | 文件节点总数（inode） |
| `f_ffree`   | `fsfilcnt_t` | 空闲文件节点数       |
| `f_namelen` | `long`       | 最大文件名长度       |

`statfs` 常用于查询磁盘剩余空间：

```c
#include <sys/statfs.h>
#include <stdio.h>

int main(void) {
    struct statfs stfs;
    if (statfs("/", &stfs) != 0) {
        perror("statfs");
        return 1;
    }
    unsigned long long free_bytes = (unsigned long long)stfs.f_bsize * stfs.f_bavail;
    printf("available: %llu bytes\n", free_bytes);
    return 0;
}
```

## 目录 API{#目录-api}

### 1. mkdir、rmdir、rename{#mkdir-rmdir-rename}

`mkdir`与`rmdir`分别用于创建和删除目录，`rename`用于修改目录表项中文件名

```c
#include <sys/stat.h>
#include <unistd.h>

int mkdir(const char *path, mode_t mode);
int rmdir(const char *path);
int rename(const char *oldpath, const char *newpath);
```

`mkdir` 的参数与返回值：

| 项      | 含义                   |
|--------|----------------------|
| `path` | 新目录的路径名              |
| `mode` | 初始权限位，同样受 `umask` 影响 |
| 成功返回   | `0`                  |
| 失败返回   | `-1`，并设置 `errno`     |

`rmdir` 的参数与返回值：

| 项      | 含义               |
|--------|------------------|
| `path` | 要删除的目录路径；目录必须为空  |
| 成功返回   | `0`              |
| 失败返回   | `-1`，并设置 `errno` |

`rename` 的参数与返回值：

| 项         | 含义               |
|-----------|------------------|
| `oldpath` | 旧路径名             |
| `newpath` | 新路径名             |
| 成功返回      | `0`              |
| 失败返回      | `-1`，并设置 `errno` |

几个注意事项：

- `rename` 操作的是目录项，而不是"修改 inode 内部名字"。Unix 文件对象本身并不直接把"文件名"存在 inode 里，名字存在目录项中。
- `rename` 在同一个文件系统内是原子操作——无论中间是否发生崩溃，目录结构不会出现"新旧路径各有一份"或"两个路径都消失"的中间态。
- 如果 `newpath` 已存在且是文件，`rename` 会原子地替换它（旧 `newpath` 被删除）。
- `rmdir` 要求目录为空（只含 `.` 和 `..`），这与 `unlink` 不能删除目录形成对称。

### 2. opendir、readdir、closedir{#opendir-readdir-closedir}

`opendir`、`readdir`与`closedir`用于操作目录

```c
#include <dirent.h>

DIR *opendir(const char *name);
struct dirent *readdir(DIR *dirp);
int closedir(DIR *dirp);
```

`opendir` 的参数与返回值：

| 项      | 含义                 |
|--------|--------------------|
| `name` | 目录路径               |
| 成功返回   | `DIR *` 目录流句柄      |
| 失败返回   | `NULL`，并设置 `errno` |

`readdir` 的参数与返回值：

| 项      | 含义                                                            |
|--------|---------------------------------------------------------------|
| `dirp` | `opendir` 返回的目录流句柄                                            |
| 成功返回   | 指向下一个目录项的 `struct dirent *`；到达目录末尾时返回 `NULL`，但**不设置** `errno` |
| 出错返回   | `NULL`，并设置 `errno`                                            |

因此，区分"读完"与"出错"的方法是：调用前把 `errno` 置 0，调用后检查 `errno`。

`closedir` 的参数与返回值：

| 项      | 含义               |
|--------|------------------|
| `dirp` | 要关闭的目录流句柄        |
| 成功返回   | `0`              |
| 失败返回   | `-1`，并设置 `errno` |

`struct dirent` 常用字段：

| 字段       | 类型              | 含义                                |
|----------|-----------------|-----------------------------------|
| `d_ino`  | `ino_t`         | inode 编号                          |
| `d_name` | `char[]`        | 目录项名称（文件名）                        |
| `d_type` | `unsigned char` | 文件类型（非 POSIX 标准，但 Linux/BSD 普遍支持） |

`opendir` / `readdir` / `closedir` 示例：

```c
#include <dirent.h>
#include <errno.h>
#include <stdio.h>

int main(void) {
    DIR *dir = opendir("/tmp");
    if (dir == NULL) {
        perror("opendir");
        return 1;
    }

    struct dirent *entry;
    errno = 0;
    while ((entry = readdir(dir)) != NULL) {
        printf("%s (inode: %lu)\n", entry->d_name, (unsigned long)entry->d_ino);
        errno = 0;
    }
    if (errno != 0) {
        perror("readdir");
    }

    closedir(dir);
    return 0;
}
```

目录虽然在文件系统层面是一种特殊文件，但在 POSIX 用户态接口里通常通过 `DIR *` 这一层包装访问，而不是直接用 `read(fd, ...)`
解析目录格式。

## 文件元数据 API{#文件元数据-api}

### 1. stat、fstat、lstat{#stat-fstat-lstat}

`stat`、`fstat`与`lstat`用于读取文件元数据

```c
#include <sys/stat.h>

int stat(const char *path, struct stat *buf);
int fstat(int fd, struct stat *buf);
int lstat(const char *path, struct stat *buf);
```

参数与返回值：

| 接口      | 第一参数      | 第二参数              | 成功返回 | 失败返回             |
|---------|-----------|-------------------|------|------------------|
| `stat`  | `path` 路径 | `buf` 接收元数据的结构体指针 | `0`  | `-1`，并设置 `errno` |
| `fstat` | `fd` 描述符  | 同上                | `0`  | `-1`，并设置 `errno` |
| `lstat` | `path` 路径 | 同上                | `0`  | `-1`，并设置 `errno` |

三者的区别：

| 接口      | 根据什么定位对象  | 符号链接是否跟随     |
|---------|-----------|--------------|
| `stat`  | 路径        | 是，返回目标文件的信息  |
| `fstat` | 已打开的 `fd` | 不涉及路径解析      |
| `lstat` | 路径        | 否，返回符号链接自身信息 |

`struct stat` 常用字段：

| 字段           | 类型          | 含义           |
|--------------|-------------|--------------|
| `st_dev`     | `dev_t`     | 所在设备的设备号     |
| `st_ino`     | `ino_t`     | inode 编号     |
| `st_mode`    | `mode_t`    | 文件类型与权限位     |
| `st_nlink`   | `nlink_t`   | 硬链接计数        |
| `st_uid`     | `uid_t`     | 所有者用户 ID     |
| `st_gid`     | `gid_t`     | 所有者组 ID      |
| `st_size`    | `off_t`     | 文件大小（字节）     |
| `st_blksize` | `blksize_t` | 首选 I/O 块大小   |
| `st_blocks`  | `blkcnt_t`  | 已分配的 512B 块数 |
| `st_atime`   | `time_t`    | 最后访问时间       |
| `st_mtime`   | `time_t`    | 最后修改时间       |
| `st_ctime`   | `time_t`    | 最后状态变更时间     |

`st_mode` 既编码文件类型，也编码权限位。判断文件类型应使用 POSIX 宏而非直接位运算：

| 宏                | 含义         |
|------------------|------------|
| `S_ISREG(mode)`  | 是否为普通文件    |
| `S_ISDIR(mode)`  | 是否为目录      |
| `S_ISLNK(mode)`  | 是否为符号链接    |
| `S_ISFIFO(mode)` | 是否为命名管道    |
| `S_ISSOCK(mode)` | 是否为 socket |
| `S_ISBLK(mode)`  | 是否为块设备     |
| `S_ISCHR(mode)`  | 是否为字符设备    |

`stat` 示例：

```c
#include <sys/stat.h>
#include <stdio.h>

int main(void) {
    struct stat st;
    if (stat("/tmp/os_demo.txt", &st) != 0) {
        perror("stat");
        return 1;
    }
    printf("size: %lld, inode: %llu, nlink: %lu\n",
           (long long)st.st_size, (unsigned long long)st.st_ino,
           (unsigned long)st.st_nlink);
    return 0;
}
```

### 2. chmod、fchmod、umask{#chmod-fchmod-umask}

`chmod`与`fchmod`用于修改文件权限位，`umask`用于修改进程的屏蔽位

```c
#include <sys/stat.h>

int chmod(const char *path, mode_t mode);
int fchmod(int fd, mode_t mode);
mode_t umask(mode_t cmask);
```

`chmod` 的参数与返回值：

| 项      | 含义               |
|--------|------------------|
| `path` | 目标文件路径           |
| `mode` | 新的权限位，如 `0644`   |
| 成功返回   | `0`              |
| 失败返回   | `-1`，并设置 `errno` |

`fchmod` 的参数与返回值：

| 项      | 含义                         |
|--------|----------------------------|
| `fd`   | 已打开的文件描述符，用于代替 `path` 定位文件 |
| `mode` | 同 `chmod`                  |
| 成功返回   | `0`                        |
| 失败返回   | `-1`，并设置 `errno`           |

`umask` 的参数与返回值：

| 项       | 含义                                   |
|---------|--------------------------------------|
| `cmask` | 要设置的权限屏蔽位，如 `022`                    |
| 返回值     | 调用前的旧 `umask` 值（无论成功与否，`umask` 不会失败） |

`umask` 的作用域是进程，一个进程只有一个 `umask`：

- 同一进程中的所有线程共享 umask
- 子进程会继承父进程的 umask
- exec 不会重置 umask

文件创建时的最终权限由 `open(..., mode)` 与 `umask` 共同决定：

```c
final_mode = requested_mode & ~umask
```

也就是说，对于已经屏蔽的位，将会始终填入`0`

若 `umask` 为 `022`，`open(..., 0666)` 创建出的文件实际权限是 `0644`。

`umask` 示例：

```c
#include <sys/stat.h>
#include <fcntl.h>
#include <stdio.h>

int main(void) {
    mode_t old = umask(0);             // 暂不屏蔽任何权限位
    int fd = open("/tmp/os_umask_test", O_CREAT | O_WRONLY, 0666);
    umask(old);                        // 恢复原 umask
    close(fd);

    struct stat st;
    stat("/tmp/os_umask_test", &st);
    printf("mode: %o\n", st.st_mode & 0777);  // 输出 666
    unlink("/tmp/os_umask_test");
    return 0;
}
```

### 3. truncate、ftruncate{#truncate-ftruncate}

`truncate`与`ftruncate`用于修改文件大小

```c
#include <unistd.h>

int truncate(const char *path, off_t length);
int ftruncate(int fd, off_t length);
```

参数与返回值：

| 接口          | 第一参数        | 第二参数                | 成功返回 | 失败返回             |
|-------------|-------------|---------------------|------|------------------|
| `truncate`  | `path` 路径   | `length` 目标文件大小（字节） | `0`  | `-1`，并设置 `errno` |
| `ftruncate` | `fd` 已打开描述符 | 同上                  | `0`  | `-1`，并设置 `errno` |

两者都可缩短文件，也可把文件扩展到更大长度。扩展时新增区域填 `\0`（形成空洞文件）；缩短时超出部分被丢弃。

`ftruncate` 不改变当前文件偏移。此外，`ftruncate` 也用于为 POSIX 共享内存对象设定大小——`shm_open` 返回的 `fd` 传给
`ftruncate` 即可。

## 文件数据 API{#文件数据-api}

### 1. open、creat、close{#open-creat-close}

`open`用于打开/创建文件，`creat`用于创建文件，`close`用于关闭文件

```c
#include <fcntl.h>
#include <unistd.h>

int open(const char *path, int oflag, ...);
int creat(const char *path, mode_t mode);
int close(int fd);
```

`open` 的参数与返回值：

| 项       | 含义                                    |
|---------|---------------------------------------|
| `path`  | 路径名                                   |
| `oflag` | 打开方式与附加标志，由一组 `O_*` 按位或组合             |
| `mode`  | 仅在 `oflag` 含 `O_CREAT` 时有效，指定新文件的初始权限 |
| 成功返回    | 当前进程可用的最小非负 `fd`                      |
| 失败返回    | `-1`，并设置 `errno`                      |

`open` 最常见的标志位：

| 标志           | 含义                          |
|--------------|-----------------------------|
| `O_RDONLY`   | 只读打开                        |
| `O_WRONLY`   | 只写打开                        |
| `O_RDWR`     | 读写打开                        |
| `O_CREAT`    | 文件不存在则创建，此时必须提供第三个参数 `mode` |
| `O_EXCL`     | 与 `O_CREAT` 配合，若文件已存在则失败    |
| `O_TRUNC`    | 打开时截断为 0 长度                 |
| `O_APPEND`   | 每次 `write` 前自动将偏移移到文件末尾     |
| `O_NONBLOCK` | 以非阻塞方式打开                    |
| `O_SYNC`     | 每次 `write` 等待数据与元数据落盘       |

`creat` 的参数与返回值：

| 项      | 含义                        |
|--------|---------------------------|
| `path` | 路径名                       |
| `mode` | 文件初始权限位                   |
| 成功返回   | 当前进程可用的最小非负 `fd`，且以只写方式打开 |
| 失败返回   | `-1`，并设置 `errno`          |

`creat(path, mode)` 等价于 `open(path, O_WRONLY | O_CREAT | O_TRUNC, mode)`。它是早期 Unix 遗留下来的接口，新代码建议直接用
`open`。

`close` 的参数与返回值：

| 项    | 含义               |
|------|------------------|
| `fd` | 要关闭的文件描述符        |
| 成功返回 | `0`              |
| 失败返回 | `-1`，并设置 `errno` |

`close(fd)` 关闭的是当前进程对该打开实例的一个引用。当最后一个引用消失后，内核才真正回收对应的打开文件表条目。

注意 `close` 的返回值在实际代码中经常被忽略，但如果 `fd` 对应的是网络文件系统或有写缓存的场景，`close` 失败可能意味着数据未成功落盘。

`open` / `close` 最小示例：

```c
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int main(void) {
    int fd = open("/tmp/os_demo.txt", O_CREAT | O_RDWR | O_TRUNC, 0644);
    if (fd < 0) {
        perror("open");
        return 1;
    }
    write(fd, "hello", 5);
    close(fd);
    return 0;
}
```

### 2. read、write、pread、pwrite{#read-write-pread-pwrite}

`read`、`write`、`pread`与`pwrite`用于文件的读写

```c
#include <unistd.h>

ssize_t read(int fd, void *buf, size_t count);
ssize_t write(int fd, const void *buf, size_t count);
ssize_t pread(int fd, void *buf, size_t count, off_t offset);
ssize_t pwrite(int fd, const void *buf, size_t count, off_t offset);
```

`read` 的参数与返回值：

| 项       | 含义                         |
|---------|----------------------------|
| `fd`    | 已打开的文件描述符                  |
| `buf`   | 接收数据的缓冲区                   |
| `count` | 期望读取的最大字节数                 |
| 返回 `>0` | 实际读取的字节数；可能小于 `count`（短读取） |
| 返回 `0`  | 读到文件末尾（`EOF`）              |
| 返回 `-1` | 出错，并设置 `errno`             |

`write` 的参数与返回值：

| 项       | 含义                         |
|---------|----------------------------|
| `fd`    | 已打开的文件描述符                  |
| `buf`   | 待写出数据的缓冲区                  |
| `count` | 期望写出的字节数                   |
| 返回 `>0` | 实际写出的字节数；可能小于 `count`（短写入） |
| 返回 `-1` | 出错，并设置 `errno`             |

`pread` / `pwrite` 在 `read` / `write` 基础上增加了一个显式偏移参数 `offset`：

| 项        | 含义                                 |
|----------|------------------------------------|
| `offset` | 从文件的哪个字节偏移开始读/写；不依赖也不修改 `fd` 的当前偏移 |

四者的区别如下：

| 接口                 | 使用当前文件偏移 | 是否原子化"寻址 + I/O" |
|--------------------|----------|-----------------|
| `read` / `write`   | 是        | 否               |
| `pread` / `pwrite` | 否        | 是               |

`pread` / `pwrite` 的意义不只是"多一个参数"：它把"读取哪个位置"从打开实例状态中剥离出来，同时保证"定位 + I/O"
是原子的，适合多线程并发读写同一 `fd` 的场景。

这里有两个容易踩的点：

- **短读取 / 短写入**：`read` 和 `write` 不保证一次调用就读满或写满 `count`
  字节。读到多少取决于内核缓冲区状态；写入多少取决于剩余空间。循环读写直到达到目标字节数是常见做法。
- **`O_APPEND` 下的 `pwrite`**：若 `fd` 以 `O_APPEND` 打开，`pwrite` 的 `offset` 参数会被忽略，数据仍然追加到文件末尾。

`read` / `write` 与 `pread` / `pwrite` 对比示例：

```c
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int main(void) {
    int fd = open("/tmp/os_demo.txt", O_CREAT | O_RDWR | O_TRUNC, 0644);

    // write 写入后偏移前移
    write(fd, "AAAA", 4);          // offset → 4

    // pwrite 在指定位置写，不改变当前偏移
    pwrite(fd, "BB", 2, 0);        // offset 仍为 4

    // pread 在指定位置读，不改变当前偏移
    char buf[8] = {0};
    pread(fd, buf, 4, 0);          // buf = "BBAA"，offset 仍为 4
    printf("pread: %s\n", buf);

    // read 从当前偏移继续读
    lseek(fd, 0, SEEK_SET);        // offset → 0
    read(fd, buf, 4);               // buf = "BBAA"，offset → 4
    printf("read:  %s\n", buf);

    close(fd);
    unlink("/tmp/os_demo.txt");
    return 0;
}
```

### 3. lseek、fsync、fdatasync{#lseek-fsync-fdatasync}

`lseek`用于修改文件当前偏移，`fsync`与`fdatasync`用于将修改冲洗到存储设备

```c
#include <unistd.h>

off_t lseek(int fd, off_t offset, int whence);
int fsync(int fd);
int fdatasync(int fd);
```

`lseek` 的参数与返回值：

| 项        | 含义                                      |
|----------|-----------------------------------------|
| `fd`     | 已打开的文件描述符                               |
| `offset` | 相对基准的偏移量，可为负（取决于 `whence`）              |
| `whence` | 偏移基准，取 `SEEK_SET`、`SEEK_CUR`、`SEEK_END` |
| 成功返回     | 新的文件偏移（距文件开头的字节数）                       |
| 失败返回     | `(off_t)-1`，并设置 `errno`                 |

`whence` 的取值：

| `whence`   | 含义       |
|------------|----------|
| `SEEK_SET` | 以文件开头为基准 |
| `SEEK_CUR` | 以当前偏移为基准 |
| `SEEK_END` | 以文件末尾为基准 |

`fsync` 与 `fdatasync` 的参数与返回值：

| 项    | 含义               |
|------|------------------|
| `fd` | 已打开的文件描述符        |
| 成功返回 | `0`              |
| 失败返回 | `-1`，并设置 `errno` |

两者的区别：

| 接口          | 作用                                    |
|-------------|---------------------------------------|
| `fsync`     | 将数据与所有元数据（大小、时间戳等）刷到存储设备              |
| `fdatasync` | 只刷数据与必要元数据（保证后续可读的最小元数据集），不强制刷新非关键元数据 |

如果只调用 `write()`，数据可能仍停留在页面缓存里；只有调用 `fsync()` / `fdatasync()` 后才真正要求内核把相关修改提交到存储设备。
`fdatasync` 比 `fsync` 开销更低，适合不需要更新 inode 元数据的场景（如追加写入数据库日志）。

```c
int fd = open("/tmp/os_demo.txt", O_CREAT | O_WRONLY, 0644);
write(fd, "data", 4);
fsync(fd);   // 确保数据落盘后再做后续操作
close(fd);
```

## 链接 API{#链接-api}

### 1. link、unlink{#link-unlink}

`link`与`unlink`用于在目录中添加/删除inode的引用（也称创建/删除硬链接）

除此之外，`unlink`也是删除文件的系统调用，因为inode引用计数为`0`时，文件本体将被删除。

```c
#include <unistd.h>

int link(const char *existing, const char *newpath);
int unlink(const char *path);
```

`link` 的参数与返回值：

| 项          | 含义               |
|------------|------------------|
| `existing` | 现有文件的路径名         |
| `newpath`  | 新目录项的路径名         |
| 成功返回       | `0`              |
| 失败返回       | `-1`，并设置 `errno` |

`link` 为现有文件增加一个新的硬链接目录项。两个路径名指向同一个 inode，共享一个链接计数。不允许跨文件系统创建硬链接，也不允许对目录创建硬链接（除
root 外）。

`unlink` 的参数与返回值：

| 项      | 含义               |
|--------|------------------|
| `path` | 要删除的目录项路径        |
| 成功返回   | `0`              |
| 失败返回   | `-1`，并设置 `errno` |

`unlink` 删除的是名字到文件对象之间的一条链接。只有当 inode 的链接计数降到 0，且没有进程再持有打开引用时，文件对象才真正可回收。

这也是"删除一个正在被进程打开的文件仍然可以继续读写"的原因：`unlink` 只移除目录项，数据块仍在。

`link` / `unlink` 示例：

```c
#include <fcntl.h>
#include <unistd.h>
#include <sys/stat.h>
#include <stdio.h>

int main(void) {
    int fd = open("/tmp/os_link_orig", O_CREAT | O_WRONLY, 0644);
    write(fd, "data", 4);
    close(fd);

    link("/tmp/os_link_orig", "/tmp/os_link_copy");  // 创建硬链接

    struct stat st;
    stat("/tmp/os_link_orig", &st);
    printf("nlink after link: %lu\n", (unsigned long)st.st_nlink);  // 2

    unlink("/tmp/os_link_copy");                     // 删除链接

    stat("/tmp/os_link_orig", &st);
    printf("nlink after unlink: %lu\n", (unsigned long)st.st_nlink); // 1

    unlink("/tmp/os_link_orig");
    return 0;
}
```

### 2. symlink、readlink{#symlink-readlink}

`symlink`与`readlink`用于创建/读取软链接；软链接本身是文件，其删除可以使用`unlink`。

```c
#include <unistd.h>

int symlink(const char *target, const char *linkpath);
ssize_t readlink(const char *path, char *buf, size_t bufsiz);
```

`symlink` 的参数与返回值：

| 项          | 含义               |
|------------|------------------|
| `target`   | 符号链接指向的目标路径      |
| `linkpath` | 新符号链接的路径名        |
| 成功返回       | `0`              |
| 失败返回       | `-1`，并设置 `errno` |

`readlink` 的参数与返回值：

| 项        | 含义                     |
|----------|------------------------|
| `path`   | 符号链接的路径                |
| `buf`    | 接收目标路径内容的缓冲区           |
| `bufsiz` | 缓冲区大小                  |
| 返回 `>0`  | 写入 `buf` 的字节数（不含 `\0`） |
| 返回 `-1`  | 出错，并设置 `errno`         |

`symlink` 与 `link` 的关键区别：

| 维度    | 硬链接 (`link`)      | 符号链接 (`symlink`)      |
|-------|-------------------|-----------------------|
| 本质    | 新增目录项，指向同一个 inode | 创建独立的文件对象，内容为目标路径字符串  |
| 跨文件系统 | 不支持               | 支持                    |
| 指向目录  | 不支持（root 除外）      | 支持                    |
| 目标删除后 | 数据仍在，可通过剩余链接访问    | 链接变成悬空链接（broken link） |
| inode | 与目标共享             | 独立，不与目标共享             |

`readlink` 不会在 `buf` 末尾自动追加 `\0`，调用者需要根据返回值手动添加。

`symlink` / `readlink` 示例：

```c
#include <unistd.h>
#include <sys/stat.h>
#include <stdio.h>

int main(void) {
    symlink("/tmp/os_link_orig", "/tmp/os_symlink");

    char buf[256] = {0};
    ssize_t n = readlink("/tmp/os_symlink", buf, sizeof(buf) - 1);
    if (n != -1) {
        buf[n] = '\0';
        printf("symlink target: %s\n", buf);
    }

    struct stat st;
    lstat("/tmp/os_symlink", &st);              // lstat 获取符号链接自身信息
    printf("is symlink: %d\n", S_ISLNK(st.st_mode));

    unlink("/tmp/os_symlink");
    return 0;
}
```

## 描述符控制 API{#描述符控制-api}

### 1. dup、dup2、dup3{#dup-dup2-dup3}

`dup`、`dup2`与`dup3`用于在同一个进程中拷贝fd表项

```c
#include <unistd.h>

int dup(int oldfd);
int dup2(int oldfd, int newfd);
int dup3(int oldfd, int newfd, int flags);
```

`dup` 的参数与返回值：

| 项       | 含义                                  |
|---------|-------------------------------------|
| `oldfd` | 要复制的已有描述符                           |
| 成功返回    | 当前进程可用的最小非负 `fd`，与 `oldfd` 指向同一打开实例 |
| 失败返回    | `-1`，并设置 `errno`                    |

`dup2` 的参数与返回值：

| 项       | 含义                                  |
|---------|-------------------------------------|
| `oldfd` | 要复制的已有描述符                           |
| `newfd` | 期望分配的描述符号；若 `newfd` 已打开，会先原子地关闭它再复制 |
| 成功返回    | `newfd`                             |
| 失败返回    | `-1`，并设置 `errno`                    |

`dup3` 在 `dup2` 基础上增加 `flags` 参数：

| 项       | 含义                                                      |
|---------|---------------------------------------------------------|
| `flags` | 目前只支持 `O_CLOEXEC`（`exec` 时自动关闭此 `fd`），传 `0` 则行为同 `dup2` |

复制后的多个 `fd` 共享同一个内核打开文件表条目，因此共享文件偏移和打开状态。

`dup` / `dup2` 示例：验证共享偏移：

```c
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int main(void) {
    int fd = open("/tmp/os_dup_test", O_CREAT | O_RDWR | O_TRUNC, 0644);
    int fd2 = dup(fd);

    write(fd, "A", 1);        // fd offset → 1; fd2 共享同一打开实例，offset 也为 1
    write(fd2, "B", 1);       // 接着写，文件内容 "AB"

    char buf[8] = {0};
    lseek(fd, 0, SEEK_SET);
    read(fd, buf, 2);
    printf("content: %s\n", buf);  // "AB"

    close(fd2);
    close(fd);
    unlink("/tmp/os_dup_test");
    return 0;
}
```

`dup2` 最常见的用途是实现 I/O 重定向：

```c
int fd = open("output.txt", O_CREAT | O_WRONLY | O_TRUNC, 0644);
dup2(fd, STDOUT_FILENO);  // stdout → output.txt
close(fd);
printf("this goes to file\n");
```

### 2. fcntl、ioctl{#fcntl-ioctl}

`fcntl`是用于控制“文件描述符行为”的通用接口，`ioctl`是I/O设备控制的通用接口

```c
#include <fcntl.h>
#include <sys/ioctl.h>

int fcntl(int fd, int cmd, ...);
int ioctl(int fd, unsigned long request, ...);
```

`fcntl` 的参数与返回值：

| 项     | 含义                                                                                    |
|-------|---------------------------------------------------------------------------------------|
| `fd`  | 目标文件描述符                                                                               |
| `cmd` | 命令，决定 `fcntl` 做什么以及第三参数的类型                                                            |
| `...` | 第三参数，类型取决于 `cmd`：可能是 `int`、`struct flock *` 等                                         |
| 返回值   | 取决于 `cmd`：多数命令成功返回 `0`（或非负值），失败返回 `-1` 并设置 `errno`；`F_DUPFD` 返回新 `fd`；`F_GETFL` 返回标志集 |

`fcntl` 常用命令：

| 命令                            | 作用                 | 第三参数                        |
|-------------------------------|--------------------|-----------------------------|
| `F_DUPFD` / `F_DUPFD_CLOEXEC` | 复制描述符，可指定最小 `fd` 值 | `int` 最小 `fd` 值             |
| `F_GETFD`                     | 获取描述符标志            | 无                           |
| `F_SETFD`                     | 设置描述符标志            | `int` 新标志（目前仅 `FD_CLOEXEC`） |
| `F_GETFL`                     | 获取文件状态标志           | 无                           |
| `F_SETFL`                     | 设置文件状态标志           | `int` 新标志集                  |
| `F_GETLK`                     | 检查文件锁              | `struct flock *`            |
| `F_SETLK`                     | 设置文件锁（非阻塞）         | `struct flock *`            |
| `F_SETLKW`                    | 设置文件锁（阻塞等待）        | `struct flock *`            |

`F_GETFL` 可获取的标志包括 `O_RDONLY`、`O_WRONLY`、`O_RDWR`、`O_APPEND`、`O_NONBLOCK`、`O_SYNC` 等。`F_SETFL` 只能修改
`O_APPEND`、`O_NONBLOCK`、`O_SYNC`等状态标志，不能修改访问方式（`O_RDONLY` / `O_WRONLY` / `O_RDWR`）。

`ioctl` 的参数与返回值：

| 项         | 含义                         |
|-----------|----------------------------|
| `fd`      | 目标文件描述符                    |
| `request` | 设备相关的请求码，定义在对应设备头文件中       |
| `...`     | 第三参数，类型取决于 `request`，通常为指针 |
| 成功返回      | `0` 或非负值，含义取决于 `request`   |
| 失败返回      | `-1`，并设置 `errno`           |

`ioctl` 用于"标准读写不够表达"的设备控制场景（如终端设置、磁盘参数配置等）。

`fcntl` 示例：获取和修改文件状态标志

```c
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int main(void) {
    int fd = open("/tmp/os_fcntl_test", O_CREAT | O_WRONLY, 0644);

    int flags = fcntl(fd, F_GETFL);
    printf("access mode: %d\n", flags & O_ACCMODE);  // O_WRONLY

    // 追加 O_APPEND
    fcntl(fd, F_SETFL, flags | O_APPEND);

    write(fd, "hello", 5);  // 追加到末尾而非当前位置

    close(fd);
    unlink("/tmp/os_fcntl_test");
    return 0;
}
```

## 小结{#小结}

本篇围绕文件系统的数据结构及其相应操作介绍了POSIX API：

文件系统：

| 操作 | API                |
|----|--------------------|
| 挂载 | `mount`、`umount`   |
| 属性 | `statfs` 、`statfs` |

目录：

| 操作 | API                            |
|----|--------------------------------|
| 创建 | `mkdir`                        |
| 修改 | `rename`                       |
| 读取 | `opendir`、`readdir`、`closedir` |
| 删除 | `rmdir`                        |

文件元数据：

| 操作 | API                                              |
|----|--------------------------------------------------|
| 读取 | `stat`、`fstat`、`lstat`                           |
| 修改 | `chmod`、`fchmod`、`umask` 、`truncate`、`ftruncate` |

文件数据：

| 操作    | API                                 |
|-------|-------------------------------------|
| 创建/打开 | `open`、`creat`                      |
| 寻址    | `lseek`                             |
| 修改    | `write`、`write`、`fsync`、`fdatasync` |
| 读取    | `read`、`pread`                      |
| 关闭    | `close`                             | 

同时，对于特殊的链接操作与特殊的链接文件，补充介绍了如下API

| 数据                | 操作                   |
|-------------------|----------------------|
| 硬链接（目录表项中inode引用） | `link`、`unlink`      |
| 软链接（一类特殊文件）       | `symlink`、`readlink` |

在结尾，补充了对于fd控制与通用设备控制的API

| 操作对象   | 操作                  |
|--------|---------------------|
| fd复制   | `dup`、`dup2`、`dup3` |
| fd通用控制 | `fcntl`             |
| 设备     | `ioctl`             |
