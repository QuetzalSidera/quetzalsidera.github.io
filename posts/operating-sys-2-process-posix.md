---
title: Unix操作系统3 - POSIX进程API
date: 2026-04-17
tags: [ Unix, POSIX, C语言, 系统调用, 进程 ]
pinned: false
collection: 计科笔记
outline:
  - title: POSIX概述
    slug: posix概述
  - title: 1. 什么是 POSIX
    slug: 什么是-posix
    level: 1
  - title: 2. POSIX、系统调用、ISO C、C 标准库的关系
    slug: POSIX-系统调用-ISO-C-C-标准库的关系
    level: 1
  - title: 3. 为什么需要学习POSIX API
    slug: 为什么需要学习-POSIX-API
    level: 1

  - title: 一些基础API
    slug: 一些基础-API
  - title: 1. 文件描述符表
    slug: 文件描述符表
    level: 1
  - title: 2. open：注册表项
    slug: open-注册表项
    level: 1
  - title: 3. read / write：读写文件描述符
    slug: read-write-读写文件描述符
    level: 1
  - title: 4. close：关闭文件描述符
    slug: close-关闭文件描述符
    level: 1
  - title: 5. 一个最小例子：把字符串写入文件
    slug: 一个最小例子把字符串写入文件
    level: 1

  - title: POSIX 进程 API
    slug: posix-进程-API
  - title: 1. getpid 与 getppid
    slug: getpid-与-getppid
    level: 1
  - title: 2. fork：创建子进程
    slug: fork-创建子进程
    level: 1
  - title: 3. wait 与 waitpid：等待子进程结束
    slug: wait-与-waitpid等待子进程结束
    level: 1
  - title: 4. exec：替换当前进程
    slug: exec-替换当前进程
    level: 1
  - title: 5. _exit 与 exit：退出程序
    slug: _exit-与-exit-退出程序
    level: 1

  - title: 示例：fork + exec + wait
    slug: 示例-fork-exec-wait

  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 一篇面向初学者的 Unix 进程 API 笔记，先概述 POSIX，再介绍 open、read、write、close 等基础接口，并进一步介绍 fork、exec、wait 等进程相关 API。
  - - meta
    - name: keywords
      content: Unix, POSIX, C语言, 系统调用, open, write, fork, exec, wait
---

一篇围绕 Unix 进程相关 POSIX 接口展开的学习笔记。

---

在 [进程基础](./operating-sys-1-process.md) 里，已经从操作系统视角介绍了进程是什么、PCB 如何组织进程、以及调度如何让多个进程共享
CPU。

接下来就可以从程序员视角往下走一步：当我们在 Unix 系统上写 C 程序时，究竟通过哪些接口去“碰到”这些操作系统概念？

这篇文章是操作系统部分的第一篇 POSIX 文章，因此先对POSIX做一些概述：

- 介绍什么是 POSIX，以及它和 Unix 编程的关系
- 介绍一些后续文章会不断用到的基础 API，例如 `open`、`read`、`write`、`close`
- 介绍最核心的一组进程 API，例如 `fork`、`exec`、`wait`、`waitpid`

## POSIX概述<a id=posix概述></a>

### 1. 什么是 POSIX<a id=什么是-posix></a>

[Wiki]("https://en.wikipedia.org/wiki/POSIX")

POSIX是IEEE为要在各种UNIX操作系统上运行的软件而定义的一系列API标准的总称，它的名字来自 Portable Operating System
Interface of UNIX，其正式称呼为IEEE 1003，而国际标准名称为ISO/IEC 9945。

1974年，贝尔实验室正式对外发布Unix。因为涉及到反垄断等各种原因，加上早期的Unix不够完善，于是贝尔实验室以慷慨的条件向学校提供源代码，所以Unix在大专院校里获得了很多支持并得以持续发展。

于是出现了好些独立开发的与Unix基本兼容但又不完全兼容的OS，通称Unix-like OS。

为了提高兼容性和应用程序的可移植性，阻止这种趋势， IEEE(电气和电子工程师协会)开始努力标准化Unix的开发，后来由 Richard
Stallman命名为“Posix”。

这套标准涵盖了很多方面，不只是Unix系统调用及其C语言接口，还包含shell程序和工具、线程及网络编程等。

### 2. POSIX、系统调用、ISO C、C 标准库的关系 <a id=POSIX-系统调用-ISO-C-C-标准库的关系></a>

这里有一个很容易混淆的问题：POSIX、系统调用、ISO C、C 标准库到底是什么关系？

可以分成下面几层：

- ***POSIX***：一套Unix标准，既定义Unix系统调用的规范接口，又定义其C语言的规范封装（POSIX C）。
- ***系统调用***：是操作系统内核留给应用程序的一个接口，属于 操作系统内核（kernel），***不是***C语言的一部分。
- ***ISO C***：由国际标准组织定义的 C 语言规范，是语言级别的，和操作系统无关。
- ***C 标准库***：ISO C的实现，例如`stdio.h`、`stdlib.h`。

这里提到了POSIX C与ISO C，两者是不同的标准。

例如，要打开一个文件，可以使用在ISO C中的`fopen()`

```c
FILE *fopen(const char *filename, const char *mode)
```

也可以使用POSIX C中的`open()`

```c
int open(const char *, int, ...)
```

前者（ISO C）是C语言规范中打开文件的标准调用，后者（POSIX C）是对系统调用的浅封装。在`glibc`里，`open()`函数最终会调用
`syscall()`发起一个系统调用：

```c
//syscall函数是glibc中的一个特殊函数，是C语言与系统调用的接口
syscall(SYS_open, pathname, flags, mode);
```

与此同时

- ISO C的实现多包含在`std`开头的头文件中，例如，在`glibc`里，`fopen()`位于`stdio.h`，但这并不是必须的，如`<time.h>`
- POSIX C的实现多包含在`sys/`目录下，例如，在`glibc`里，`open()`函数位于`<sys/fcntl.h>`中。

C标准库是ISO C的实现，而不要求实现POSIX C。

例如，在windows上，MSVC的C库（如 MSVCRT），就完全不支持POSIX C，但支持ISO C，在windows上编写C语言时，可以使用`fopen()`，而不能使用
`open()`。
大多Unix系统以及类Unix系统上的C标准库（如Linux的`glibc`，MacOS上的`libSystem`）既实现了ISO C，又同时支持POSIX C。

***系统调用***是***内核***的一部分，而不属于任何语言。`open()`是`glibc`库中的一个函数，属于C语言的范畴，而底层通过
`syscall()`使用`open`这个系统调用。两个`open`
名字相同，但实际上不属于一个层级（前者是后者的C语言浅封装）。

实际上，可以使用任何语言（甚至是手写汇编）发起系统调用，例如在 Rust 中：

```rust
use libc::{syscall, SYS_open};

unsafe {
    let fd = syscall(SYS_open, "a.txt\0".as_ptr(), 0);
}
```

在Go中

```go
import "golang.org/x/sys/unix"

fd, _ := unix.Open("a.txt", unix.O_RDONLY, 0)
```

### 3. 为什么需要学习POSIX API<a id=为什么需要学习-POSIX-API></a>

从学习操作系统的角度看，POSIX 很适合作为“概念”和“代码”之间的连接层，与此同时，操作系统的编程实践也是必不可少的。

前面在理论文章里提到过很多对象：

- 进程创建
- PID
- 文件描述符
- 阻塞与等待

而在实际编程时，这些概念往往会落实成具体接口：

| 操作系统概念     | POSIX API                                |
|------------|------------------------------------------|
| 进程创建(程序替换) | `fork()`, `exec()`                       |
| PID        | `getpid()`, `getppid()`                  |
| 文件 / I/O   | `open()`, `read()`, `write()`, `close()` |
| 等待子进程      | `wait()`, `waitpid()`                    |

因此，学习POSIX的目的在于将概念与实际编码相结合，将理论转化为实际的工程能力。

## 一些基础API<a id=一些基础-API></a>

在进入 `fork`、`exec` 这些进程接口之前，先补一组基础 API。因为后面很多例子都需要靠它们完成输入输出。

### 1. 文件描述符表<a id=文件描述符表></a>

每个进程通常都有一张文件描述符表，而表中的每个条目都用一个整数 `fd` 表示。

程序刚启动时，通常已经有 3 个默认打开的描述符：

| 名称       | fd  | 含义   |
|----------|-----|------|
| `stdin`  | `0` | 标准输入 |
| `stdout` | `1` | 标准输出 |
| `stderr` | `2` | 标准错误 |

这 3 个描述符后面会频繁出现，因为：

- `read(0, ...)` 可以从标准输入读数据
- `write(1, ...)` 可以向标准输出写数据
- `write(2, ...)` 常用于输出错误信息

### 2. open：注册表项<a id=open-注册表项></a>

`open` 用来打开文件，将fd表中***最小未使用***编号指向此文件，并返回此文件描述符。

原型如下：

```c
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/types.h>

int open(const char *path, int oflag, ...);
```

最常见的使用方式包括：

```c
//打开文件
int fd1 = open("in.txt", O_RDONLY);//fd1 == 3;
//输出重定向
close(STDOUT_FILENO);//关闭标准输出fd 1
int fd2 = open("out.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);//fd2 == 1;
```

`open()`可以使用第二个参数`oflag`标识位来配置一些行为：

| 标志         | 含义         |
|------------|------------|
| `O_RDONLY` | 只读打开       |
| `O_WRONLY` | 只写打开       |
| `O_RDWR`   | 读写打开       |
| `O_CREAT`  | 文件不存在时创建   |
| `O_TRUNC`  | 打开时清空原文件内容 |
| `O_APPEND` | 每次写入都追加到末尾 |

`open`的第三个参数`mode`一般是[权限位](#permission-note)，但不是必须的。

`open` 成功时返回一个非负整数文件描述符，失败时返回 `-1`。

### 3. read / write：读写文件描述符<a id=read-write-读写文件描述符></a>

`read` 和 `write` 是 Unix I/O 中最基础的一对接口。

函数原型：

```c
#include <unistd.h>

ssize_t read(int fd, void *buf, size_t count);
ssize_t write(int fd, const void *buf, size_t count);
```

参数语义：

- `read`：从 `fd` 对应对象中读出最多 `count` 字节，放到缓冲区 `buf`
- `write`：把缓冲区 `buf` 中最多 `count` 字节写到 `fd` 对应对象中

返回值语义：

| 接口      | 返回值含义                               |
|---------|-------------------------------------|
| `read`  | 成功返回实际读到的字节数，读到文件末尾返回 `0`，失败返回 `-1` |
| `write` | 成功返回实际写入的字节数，失败返回 `-1`              |

### 4. close：关闭文件描述符<a id=close-关闭文件描述符></a>

`close` 用来关闭一个文件描述符。

```c
#include <unistd.h>

int close(int fd);
```

它的作用可以理解成：把当前进程文件描述符表中的这个表项释放掉。

如果一个文件打开后不再使用，通常应该及时 `close`，否则就会造成文件描述符泄漏。

父子进程在 `fork` 之后会复制fd表，所以在后续做重定向、管道和 IPC 时，经常要显式关闭自己不用的那一端。

## POSIX 进程 API<a id=posix-进程-API></a>

有了前面的基础接口后，再看进程 API 会更自然一些。因为进程创建与程序执行，本身也经常伴随文件描述符的继承、重定向和关闭。

### 1. getpid 与 getppid<a id=getpid-与-getppid></a>

先从两个最简单的进程接口开始：

```c
#include <sys/types.h>
#include <unistd.h>

pid_t getpid(void);
pid_t getppid(void);
```

它们分别返回：

- 当前进程的 `pid`
- 当前进程的父进程 `ppid`

一般而言，函数返回类型`pid_t`是一个32位int类型，如在darwin平台上有以下定义

```c
typedef int __int32_t;
typedef __int32_t __darwin_pid_t; 
typedef __darwin_pid_t pid_t;
```

### 2. fork：创建子进程<a id=fork-创建子进程></a>

`fork` 用来创建一个新进程。

```c
#include <sys/types.h>
#include <unistd.h>

pid_t fork(void);
```

调用成功后，会出现两个几乎相同的执行流：

- 父进程继续从 `fork` 返回处向下执行
- 子进程也从 `fork` 返回处向下执行

它最特别的地方在于：同一个函数调用，会返回两次。

返回值语义如下：

| 返回值    | 含义                    |
|--------|-----------------------|
| `> 0`  | 当前在父进程中，返回值是子进程 `pid` |
| `== 0` | 当前在子进程中               |
| `-1`   | 创建失败                  |

一个例子：

```c
#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>

int main(void) {
    pid_t pid = fork();

    if (pid == -1) {
        return 1;
    }

    if (pid == 0) {
        printf("I'm the child of: ppid=%d\n. My pid: pid=%d", getppid(), getpid());
    } else {
        printf("I'm the parent of: pid=%d\n". My pid: pid=%d, pid, getpid());
    }

    return 0;
}
```

#### fork 复制了什么 <a id=fork-复制了什么></a>

子进程得到了父进程的以下内容：

- 子进程会得到父进程的大部分“运行现场”，包括代码、数据、栈、环境变量、当前工作目录
- 文件描述符表(fd表)也会被复制

关于fd表复制，更准确地说是：

- 父子进程各自有一张 初始内容相同 但 彼此保持独立 的fd表
- 与此同时，父进程每个条目中的文件偏移量等状态也被复制的，这也是为什么子进程的文件偏移量不会从0开始

这对管道和重定向尤其重要，因为父子进程很多时候正是通过继承下来的 fd 来建立连接关系。

### 3. wait 与 waitpid：等待子进程结束<a id=wait-与-waitpid等待子进程结束></a>

子进程在执行结束后会暂时保留退出信息，父进程此时可以读取子进程返回状态，并标记子进程已结束，交由操作系统进行清理。

所以父进程通常要调用：

- `wait()`
- `waitpid()`

来等待子进程结束，并获取退出状态。

#### wait <a id=wait></a>

函数原型：

```c
#include <sys/wait.h>

pid_t wait(int *status);
```

它的作用可以理解为：阻塞等待 ***任意*** 一个子进程结束，并获取它的退出状态。

有的理解是`wait(NULL);`将等待所有子进程结束，但这是错误的。

最简单的使用方法：

```c
wait(NULL);
```

只关心“是否有子进程结束”，不关心退出码。

#### waitpid <a id=waitpid></a>

函数原型：

```c
pid_t waitpid(pid_t pid, int *status, int options);
```

它比 `wait` 更灵活，可以指定等待某一个特定的子进程。

常见写法：

```c
waitpid(child_pid, NULL, 0);
```

表示等待 `child_pid` 对应的那个子进程结束。

#### status 使用方法 <a id=status></a>

`status` 不是简单的“0 或 1”，而是一组经过编码的状态信息，通常要配合宏来解析：

```c
if (WIFEXITED(status)) {
    printf("exit code = %d\n", WEXITSTATUS(status));
}
```

常见宏：

| 宏              | 全称                      | 作用             | 何时为真                      | 返回值含义          |
  |----------------|-------------------------|----------------|---------------------------|----------------|
| `WIFEXITED`    | Wait If EXITED          | 判断是否正常退出       | 子进程调用 `exit()` / `return` | true / false   |
| `WEXITSTATUS`  | Wait EXIT STATUS        | 获取退出码          | **必须先 WIFEXITED 为真**      | `exit(n)` 中的 n |
| `WIFSIGNALED`  | Wait If SIGNALED        | 判断是否被信号终止      | 如 `SIGKILL` / `SIGSEGV`   | true / false   |
| `WTERMSIG`     | Wait Termination Signal | 获取终止信号         | **必须先 WIFSIGNALED 为真**    | 信号编号           |
| `WCOREDUMP`    | Wait CORE DUMP          | 是否产生 core dump | 程序崩溃且生成 core 文件           | true / false   |
| `WIFSTOPPED`   | Wait If STOPPED         | 判断是否被暂停        | 收到 `SIGSTOP` / `SIGTSTP`  | true / false   |
| `WSTOPSIG`     | Wait STOP Signal        | 获取暂停信号         | **必须先 WIFSTOPPED 为真**     | 信号编号           |
| `WIFCONTINUED` | Wait If CONTINUED       | 判断是否恢复运行       | 收到 `SIGCONT`              | true / false   |

### 4. exec：替换当前进程<a id=exec-替换当前进程></a>

`exec`使用用一个新程序替换当前进程的执行内容。

- PID 通常不变
- 但代码段、数据段、栈等会被新程序替换

因此，exec后续的代码一般不会执行，除非exec失败，此时exec返回-1。

#### 常见成员 <a id=常见成员></a>

| 函数       | 参数形式 | 会不会使用 PATH 环境变量搜索 | 能不能自定义环境变量 |
|----------|------|-------------------|------------|
| `execl`  | 列表形式 | 否                 | 否          |
| `execlp` | 列表形式 | 是                 | 否          |
| `execv`  | 数组形式 | 否                 | 否          |
| `execvp` | 数组形式 | 是                 | 否          |
| `execle` | 列表形式 | 否                 | 是          |
| `execve` | 数组形式 | 否                 | 是          |

命名含义如下：

- `l` = list，使用可变参数列表作为参数
- `v` = vector，使用数组作为参数
- `p` = 去 `PATH` 里找程序
- `e` = 可传环境变量

一个例子，子进程执行`ls`：

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <_string.h>
int main(int argc, char* argv[])
{
    if (fork() == 0)
    {
        printf("child pid: %d\n", getpid());
        char* file = "ls";
        char* path = "/bin/ls";
        char* childArgv[2] = {"ls",NULL};
        char* childEnvp[2] = {"ENV=env",NULL};

        //以下调用都是等价的
        
        // execv接受绝对路径与参数向量(以NULL结尾)
        execv(path, childArgv);
        // execl接受绝对路径与参数列表(以NULL结尾)
        execl(path, childArgv[0], childArgv[1]);

        // 名称包含"p"的函数将会使用和Shell一致的文件搜索行为
        // 也就是使用当前进程的PATH环境变量
        execvp(file, childArgv);
        execlp(file, childArgv[0], childArgv[1]);

        // 名称包含"e"的函数将可以给出自定义环境变量(以NULL结尾)
        execve(path, childArgv, childEnvp);
        execle(path, childArgv[0], childArgv[1], childEnvp[0], childEnvp[1]);

        // execvP 可以自定义搜索路径
        execvP(file, "/bin", childArgv);
    }

    wait(NULL);
    printf("parent pid: %d\n", getpid());

    return 0;
}

```

值得注意的是，[man手册](https://www.man7.org/linux/man-pages/man3/exec.3.html)中的如下介绍

```
 execvpe() searches for the program using the value of PATH from
 the caller's environment, not from the envp argument.
```

意味着在`envp`参数中，即使指定环境变量PATH，也不会对`exec`调用时的文件搜索起作用。这是容易理解的，因为调用时的环境变量是继承自当前线程的，
`envp`参数指定的是覆写后的环境变量

### 5. exit与_exit: 退出程序<a id=_exit-与-exit-退出程序></a>

在进程控制里， `exit` 和 `_exit` 经常会一起出现。

`exit()`原型：

```c
#include <stdlib.h>
void exit(int status);
```

`_exit()`原型：

```c
#include <unistd.h>
void _exit(int status);
```

二者均用于退出程序。相比与`main()`函数中的`return`，在C语言中，调用`exit()`函数后任何属于该进程的打开的文件描述符都会被关闭，该进程的子进程由进程
`1` 继承，且会向其父进程发送一个 [SIGCHLD](#SIGCHLD) 信号，用于通知进程结束。

`exit()`函数和`_exit()`函数的参数传递给父进程，父进程可通过`wait(&status)`或`waitpid(pid,&status,option)`使用

除此之外，还需要提到两个函数`atexit()`与`on_exit()`

```c
#include <stdlib.h>

int atexit(void (*func)(void))
int on_exit(typeof(void (int, void *)) *function, void *arg);
```

他们用于注册回调函数，此函数会在进程退出(无论是`exit`还是`return`)时执行

#### `exit()`与`_exit()`区别

exit()执行流程

```text
调用通过atexit()和on_exit()函数注册的回调函数 => 清除文件描述符 => 调用_exit()/_Exit()函数
```

_exit()执行流程

```text
_exit(int status)函数执行调用系统调用syscall(SYS_exit, status) => 中止进程，并将status传至父进程
```

可见，`exit()`依赖`_exit()`实现，后者是`exit`系统调用的封装。

#### 示例

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void child_on_exit(void)
{
    printf("child exit callback\n");
}

int main(void)
{
    if (fork() == 0)
    {
        printf("child fork\n");
        /* 注册终止函数 */
        atexit(child_on_exit);
        printf("child exit\n");
        exit(1);
    }
    int status;
    wait(&status);
    printf("exit code = %d\n", WEXITSTATUS(status));
    return (0);
}

```

## 示例：fork + exec + wait<a id=示例-fork-exec-wait></a>

在 Unix 编程里，非常经典的一套模式就是：

1. 父进程 `fork`
2. 子进程 `exec`
3. 父进程 `wait`

例如，父进程想启动一个 `ls -l` 子程序：

```c
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void) {
    pid_t pid = fork();
    int status;

    if (pid == -1) {
        return 1;
    }

    if (pid == 0) {
        execl("/bin/ls", "ls", "-l", (char *)NULL);
        _exit(1);
    }

    waitpid(pid, &status, 0);

    return 0;
}
```

这段代码体现了 Unix 进程控制里最重要的职责分工：

- `fork` 负责产生新进程
- `exec` 负责让某个进程装载并执行另一个程序
- `waitpid` 负责让父进程等待并回收指定子进程

后面学习 Shell、重定向和管道时，会发现很多复杂行为本质上都是在这套流程外面再叠加文件描述符操作。

## 小结<a id=小结></a>

作为操作系统部分的第一篇 POSIX 文章，本文主要介绍了：

- POSIX 是一套 Unix 风格接口标准，帮助程序在不同系统之间保持可移植性
- `open`、`read`、`write`、`close` 是最基础的一组文件 / I/O 接口
- `getpid`、`fork`、`exec`、`exit`、`wait`、`waitpid` 构成了最核心的进程控制接口

后面的线程、重定向、管道和进程通信内容，都会在这两组基础接口之上继续展开。

---

# 附注

### 1. Unix权限 <a id=permission-note></a>

Unix 文件权限由 9 个 bit 组成，分为三组：

| owner | group | others |
|-------|-------|--------|
| rwx   | rwx   | rwx    |

每一组三位分别是读（read），写（write），执行（execute），使用0或1标识

因此，一组权限可以使用一个八进制数来表示，如 `rw-` 可写为 `06` (前缀`0`表示8进制,前缀`0x`表示16进制)

三组权限可以使用3位八进制数(9-bit 位图)表示，如`rw- r-- r--`可写为`0644`

而`ls -l`上实际使用了10位，最高位用于表示类型(例如`-`表示普通文件，`d`表示目录)

```bash
prompt> ls -l
total 0
drwxr-xr-x  2 userA  staff  64 Apr 17 20:09 testdir
-rw-r--r--  1 userA  staff   0 Apr 17 20:08 testfile
```

在`open()`新建文件时，可以使用第三位`mode`给出权限，给出的权限还需要`umask`进行处理后，才能得到最后的权限。

```c
final_mode = requested_mode & ~umask
```

例如，创建文件(umask=0022)：

```c
open("a.txt", O_CREAT, 0666);
```

最后的权限是`rw- r-- r--`

### 2. SIGCHLD <a id=SIGCHLD></a>

参见[IPC通信](./operating-sys-5-ipc.md)

`SIGCHLD` 信号是指子进程终止或暂停时，内核向其父进程发送的信号，用于通知父进程处理子进程的状态变化。

当父进程通过 `fork()` 创建子进程后，若子进程终止（或暂停），内核会向父进程发送 `SIGCHLD` 信号。此时父进程需通过捕获该信号并调用
`wait()`/`waitpid()` 等函数，才能获取子进程的终止状态并释放资源，避免子进程变成僵尸进程。

父进程可以捕捉该信号，并在捕捉函数中完成子进程状态的回收，这样就不用使用`wait`函数去等待了。
