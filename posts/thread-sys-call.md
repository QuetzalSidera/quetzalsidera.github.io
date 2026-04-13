---
title: Unix 进程通信入门
date: 2026-04-09
tags: [ Unix, C语言, 系统调用, 进程 ]
pinned: false
outline:
  - title: 1. 进程的基本属性
    slug: 进程的基本属性
  - title: 1.1 pid 与父子进程关系
    slug: pid与父子进程关系
    level: 1
  - title: 1.2 文件描述符表
    slug: 文件描述符表
    level: 1
  - title: 1.3 进程的内存区域
    slug: 进程的内存区域
    level: 1

  - title: 2. 引例：管道输出
    slug: 引例

  - title: 3. fork：创建子进程
    slug: fork创建子进程
  - title: 3.1 基本作用
    slug: 基本作用
    level: 1
  - title: 3.2 返回值语义
    slug: 返回值语义
    level: 1
  - title: 3.3 一个最小例子
    slug: 一个最小例子
    level: 1
  - title: 3.4 fork 复制了什么
    slug: fork-复制了什么
    level: 1

  - title: 4. wait 与 waitpid 等待子进程结束
    slug: wait-与-waitpid等待子进程结束
  - title: 4.1 wait
    slug: wait
    level: 1
  - title: 4.2 waitpid
    slug: waitpid
    level: 1
  - title: 4.3 status 使用方法
    slug: status
    level: 1
  - title: 4.4 例子：父进程等孩子跑完
    slug: 父进程等孩子跑完
    level: 1

  - title: 5. exec 把当前进程替换成另一个程序
    slug: exec把当前进程替换成另一个程序
  - title: 5.1 常见成员
    slug: 常见成员
    level: 1
  - title: 5.2 exec 常和 fork 搭配使用
    slug: exec-常和-fork-搭配使用
    level: 1
  - title: 5.3 例子：子进程执行 `ls`
    slug: 例子子进程执行-ls
    level: 1

  - title: 6. open close dup2 pipe：修改fd表
    slug: 修改fd表
  - title: 6.1 open：向fd表加入条目
    slug: open向fd表加入条目
    level: 1
  - title: 6.2 close：删除(置空)一个表项
    slug: close删除置空一个表项
    level: 1
  - title: 6.3 用 open + close 做重定向
    slug: 用-open-close-做重定向
    level: 1
  - title: 6.4 dup2：在同一张表内复制表项
    slug: dup2在同一张表内复制表项
    level: 1
  - title: 6.5 pipe： 一张表内建立相同两项
    slug: pipe-一张表内建立相同两项
    level: 1
  - title: 6.6 使用 open/dup2 把 `ls` 输出写入文件
    slug: 使用-open-dup2-把-ls-输出写入文件
    level: 1
  - title: 6.7. 使用pipe创建进程之间的单向管道
    slug: 使用pipe创建进程之间的单向管道
    level: 1

  - title: 7. fork + exec + pipe：Shell 管道的本质
    slug: Shell管道的本质
  - title: 7.1 `ls | wc -l` 到底做了什么
    slug: ls-wc--l-到底做了什么
    level: 1
  - title: 7.2 例子：实现 `ls | wc -l`
    slug: 例子实现-ls-wc--l
    level: 1
head:
  - - meta
    - name: description
      content: 一篇面向初学者的 Unix C 语言系统调用笔记，整理 fork、wait、waitpid、exec、文件描述符、open/close、dup2 与 pipe 的基本概念和典型例子。
  - - meta
    - name: keywords
      content: Unix, C语言, fork, wait, waitpid, exec, pipe, dup2, 文件描述符, 进程通信
---

一篇围绕 Unix 进程控制与进程间通信展开的学习笔记，主要整理 `fork`、`wait`、`waitpid`、`exec`、文件描述符、`open` / `close`、
`dup2` 与 `pipe` 的基本概念和常见使用方式。

---

这些内容在平时写 C 程序时看起来比较分散，但如果从 Shell 命令和进程执行流程的角度串起来看，会清晰很多。

例如，一条看似简单的命令：

```bash
ls | wc -l
```

背后其实就涉及：

- 创建子进程
- 执行新程序
- 重定向标准输入输出
- 用管道在进程之间传递数据
- 等待子进程结束

这篇笔记按“先建立整体认识，再拆解单个系统调用”的顺序整理。

---

# 1. 进程的基本属性 <a id=进程的基本属性></a>

在进入 `fork`、`exec`、`pipe` 这些系统调用之前，先对“进程”本身建立一个基本认识会更容易一些。

可以先把进程理解成“一个正在运行的程序实例”。同一个可执行文件可以启动多个进程，而每个进程都有自己独立的一组运行状态。

通常来说，一个进程至少可以从下面几个方面来观察：

- 它的身份信息，例如 `pid`
- 它当前打开了哪些文件和 I/O 对象，例如 `fd` 表
- 它的内存布局，例如代码区、数据区、堆、栈
- 它当前执行到哪里，以及寄存器里保存了什么现场

## 1.1 pid 与父子进程关系 <a id=pid与父子进程关系></a>

每个进程都有一个进程 ID，也就是 `pid`。

它可以看成是操作系统为这个进程分配的唯一编号。平时调用：

```c
pid_t getpid();
```

就可以拿到当前进程的 `pid`。

除了自己的 `pid` 之外，进程通常还会有一个父进程 ID，也就是 `ppid`：

```c
pid_t getppid();
```

这表示“是谁创建了我”。在后面介绍 `fork` 时，父子进程关系会变得非常重要，因为 `fork` 调用完成后，原来的进程是父进程，新创建出来的那个就是子进程。

一般而言，函数返回类型`pid_t`是一个32位int类型，如在darwin平台上有以下定义

```c
typedef int __int32_t;
typedef __int32_t __darwin_pid_t; 
typedef __darwin_pid_t pid_t;
```

## 1.2 文件描述符表 <a id=文件描述符表></a>

每个进程内部都维护着一张文件描述符表，表里的每一项都对应一个整数编号，也就是文件描述符 `fd`。

这张表可以指向很多不同类型的对象，例如：

- 普通文件
- 终端
- 管道
- socket
- 设备文件

程序启动时，通常已经默认打开了这 3 个：

| 名称       | fd  | 默认指向        |
|----------|-----|-------------|
| `stdin`  | `0` | 标准输入，默认来自键盘 |
| `stdout` | `1` | 标准输出，默认是终端  |
| `stderr` | `2` | 标准错误，默认是终端  |

后面介绍重定向和管道时，本质上就是在修改这张表里的指向。

## 1.3 进程的内存区域<a id=进程的内存区域></a>

从学习角度看，可以先把一个进程的地址空间粗略理解为下面几个部分：

- 代码区：存放程序指令
- 数据区：存放全局变量、静态变量等
- 堆：通常用于动态内存分配，例如 `malloc`
- 栈：通常用于函数调用过程中的局部变量、返回地址、参数等

例如下面这段代码里：

```c
int global_var = 10;

int main(void) {
    int local_var = 20;
    int *p = malloc(sizeof(int));
    return 0;
}
```

可以粗略理解为：

- `global_var` 位于数据区，生存期与进程一致
- `local_var` 位于栈上，具有函数生存期
- `malloc` 申请出来的那块空间位于堆上，生存期直到进程结束（除非手动释放）

`fork` 时，子进程会继承父进程的大部分运行现场，其中也包括当时的内存区域副本。

---

# 2. 引例: 管道输出 <a id=引例></a>

先看一条终端里很常见的命令：

```bash
ls | wc -l
```

它统计了当前目录有多少行输出，但操作系统背后大概做了这些事：

1. 先调用 `pipe` 创建一个内核缓冲区
2. `fork` 出一个子进程执行 `ls`
3. 再 `fork` 出另一个子进程执行 `wc -l`
4. 用 `dup2` 把 `ls` 的标准输出接到管道写端
5. 用 `dup2` 把 `wc` 的标准输入接到管道读端
6. 父进程关闭自己不用的管道口
7. 父进程 `wait` 两个孩子结束

从结果上看，这条命令可以理解为：

- `ls` 负责产生输出
- `wc -l` 负责读取输入并统计行数
- 父进程负责创建管道、派生子进程并等待它们结束

理解这个整体流程后，再看单个系统调用的作用会更容易一些。

---

# 3. fork：创建子进程 <a id=fork创建子进程></a>

## 3.1 基本作用  <a id=基本作用></a>

`fork()` 用来创建一个新进程。

调用成功后，原来的进程会“复制”出一个子进程，于是接下来会有两份几乎一样的执行流同时往下跑。

函数原型：

```c
#include <unistd.h>

pid_t fork(void);
```

## 3.2 返回值语义  <a id=返回值语义></a>

| 返回值   | 含义                      |
|-------|-------------------------|
| `< 0` | 创建失败                    |
| `= 0` | 当前代码运行在子进程里             |
| `> 0` | 当前代码运行在父进程里，返回值是子进程 PID |

同一行 `fork()`，父进程和子进程看到的返回值不同，这是理解 `fork` 时最关键的一点。

## 3.3 一个最小例子 <a id=一个最小例子></a>

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(void) {
    pid_t rc = fork();

    if (rc < 0) {
        perror("fork");
        exit(1);
    }

    if (rc == 0) {
        //子进程代码...
        printf("child: pid=%d, ppid=%d\n", getpid(), getppid());
    } else {
        //父进程代码...
        printf("parent: pid=%d, child pid=%d\n", getpid(), rc);
    }

    return 0;
}
```

运行后通常会看到两行输出，但先后顺序不一定固定，因为父子进程是并发执行的，调度顺序由操作系统决定。

## 3.4 fork 复制了什么 <a id=fork-复制了什么></a>

子进程得到了父进程的以下内容：

- 子进程会得到父进程的大部分“运行现场”，包括代码、数据、栈、环境变量、当前工作目录
- 文件描述符表(fd表)也会被复制

关于fd表复制，更准确地说是：

- 父子进程各自有一张 初始内容相同 但 彼此保持独立 的fd表
- 与此同时，父进程每个条目中的文件偏移量等状态也被复制的，这也是为什么子进程的文件偏移量不会从0开始

这对管道和重定向尤其重要，因为父子进程很多时候正是通过继承下来的 fd 来建立连接关系。

---

# 4. wait 与 waitpid：等待子进程结束 <a id=wait-与-waitpid等待子进程结束></a>

子进程在执行结束后会暂时保留退出信息，父进程此时可以读取子进程返回状态，并标记子进程已结束，交由操作系统进行清理。

所以父进程通常要调用：

- `wait()`
- `waitpid()`

来等待子进程结束，并获取退出状态。

## 4.1 wait <a id=wait></a>

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

## 4.2 waitpid <a id=waitpid></a>

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

## 4.3 status 使用方法 <a id=status></a>

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

## 4.4 例子：父进程等孩子跑完 <a id=父进程等孩子跑完></a>

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main(void) {
    pid_t rc = fork();

    if (rc < 0) {
        perror("fork");
        exit(1);
    }

    if (rc == 0) {
        printf("child: start working\n");
        sleep(2);
        printf("child: finish\n");
        exit(42);
    } else {
        int status;
        pid_t done = waitpid(rc, &status, 0);

        if (done < 0) {
            perror("waitpid");
            exit(1);
        }

        if (WIFEXITED(status)) {
            printf("parent: child exit code = %d\n", WEXITSTATUS(status));
        }
    }

    return 0;
}
```

这个例子里，父进程在 `waitpid` 返回后，不仅知道子进程已经结束，还可以进一步拿到它的退出码。

---

# 5. exec：把当前进程替换成另一个程序 <a id=exec把当前进程替换成另一个程序></a>

`exec` 家族最容易记的一句话是：

**它不会创建新进程，而是用一个新程序替换当前进程的执行内容。**

也就是说：

- PID 通常不变
- 还是原来的那个进程
- 但代码段、数据段、栈等会被新程序替换

可以把它理解成：进程本身还在，但它执行的程序已经被完全替换成了新的内容。因此，exec后续的代码一般不会执行，除非exec失败，此时exec返回-1。

## 5.1 常见成员 <a id=常见成员></a>

| 函数       | 参数形式 | 会不会使用 PATH 环境变量搜索 | 能不能自定义环境变量 |
|----------|------|-------------------|------------|
| `execl`  | 列表形式 | 否                 | 否          |
| `execlp` | 列表形式 | 是                 | 否          |
| `execv`  | 数组形式 | 否                 | 否          |
| `execvp` | 数组形式 | 是                 | 否          |
| `execle` | 列表形式 | 否                 | 是          |
| `execve` | 数组形式 | 否                 | 是          |

可以这样记：

- `l` = list，参数一个一个写
- `v` = vector，参数放数组里
- `p` = 会去 `PATH` 里找程序
- `e` = 可以自己传环境变量

## 5.2  exec 常和 fork 搭配使用 <a id=exec-常和-fork-搭配使用></a>

常见用法是：

1. 先 `fork`
2. 子进程里 `exec`
3. 父进程继续保留原来的逻辑

这就是 Shell 执行外部命令时的常见做法。

## 5.3 例子：子进程执行 `ls` <a id=例子子进程执行-ls></a>

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

---

# 6. open close dup2 pipe：修改fd表 <a id=修改fd表></a>

## 6.1 open：向fd表加入条目 <a id=open向fd表加入条目-ls></a>

函数原型：

```c
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/types.h>

int open(const char *pathname, int flags, ...);
```

例如：

```c
int fd = open("out.txt", O_CREAT | O_WRONLY | O_TRUNC, 0644);
```

意思是：

- 不存在就创建
- 只写打开
- 如果原来有内容就清空
- 权限设为 `0644`

### open 的一个重要规则

`open()` 将会把新条目加入当前进程的fd表，返回值是当前最小的未使用fd。

比如：

- fd表中 `0、1、2` 已经被占了
- 那下一次 `open()` 返回 `3`
- 此时 fd表中 `3` 指向打开的文件

如果先 `close(1)`，再 `open(...)`，那么新文件就占到 `1` 这个位置，而 `1` 被视为标准输出，这就是最基础的重定向思路。

## 6.2 close：删除(置空)一个表项 <a id=close删除置空一个表项></a>

函数原型：

```c
#include <unistd.h>

int close(int fd);
```

关闭后，这个编号位置就空出来了，可以被后续 `open` 再利用。

## 6.3 用 open + close 做重定向 <a id=用-open-close-做重定向></a>

下面这段代码把标准输出改到文件里：

```c
close(STDOUT_FILENO);
open("out.txt", O_CREAT | O_WRONLY | O_TRUNC, 0644);
printf("hello\n");
```

因为 `STDOUT_FILENO` 也就是 `1` 被关闭后，下一次 `open` 正好拿到 `1`，于是 `printf` 的内容就不再输出到终端，而是写进
`out.txt`。

这种写法可以工作，但更常见、也更明确的方式是使用 `dup2`。

## 6.4 dup2：在同一张表内复制表项  <a id=dup2在同一张表内复制表项></a>

函数原型：

```c
#include <unistd.h>

int dup2(int oldfd, int newfd);
```

它的作用是让 `newfd` 指向和 `oldfd` 相同的打开对象。

如果 `newfd` 原来开着，会先被关闭。

于是：

```c
dup2(newfd, STDOUT_FILENO);
```

这就等于把标准输出指向修改为 `newfd` 对应的文件。

这比先 `close(1)` 再 `open()` 更明确，也更常见。

## 6.5 pipe: 一张表内建立相同两项 <a id=pipe-一张表内建立相同两项></a>

函数原型：

```c
#include <unistd.h>
int pipe(int fd[2]);
```

调用成功后，`fd` 数组里会得到两个端口：

| fd      | 含义     |
|---------|--------|
| `fd[0]` | pipe读端 |
| `fd[1]` | pipe写端 |

调用成功后，进程的fd表中，最小的未使用两项将分别置为同一指向的读写端

| 名称       | fd  | 备注   |
|----------|-----|------|
| `stdin`  | `0` | 标准输入 |
| `stdout` | `1` | 标准输出 |
| `stderr` | `2` | 标准错误 |
| pipe读端   | `3` | -    |
| pipe写端   | `4` | -    |

## 6.6 使用 open/dup2 把 `ls` 输出写入文件 <a id=使用-open-dup2-把-ls-输出写入文件></a>

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/wait.h>

int main(void) {
    pid_t rc = fork();

    if (rc < 0) {
        perror("fork");
        exit(1);
    }

    if (rc == 0) {
       // FdTable[3] -> "out.txt"
        int fd = open("out.txt", O_CREAT | O_WRONLY | O_TRUNC, 0644);
        if (fd < 0) {
            perror("open");
            exit(1);
        }

        // FdTable[1] -> "out.txt"
        dup2(fd, STDOUT_FILENO);
        // FdTable[3] -> NULL
        close(fd);

        execlp("ls", "ls", "-l", NULL);
        perror("execlp");
        exit(1);
    } else {
        waitpid(rc, NULL, 0);
        printf("parent: ls output has been written to out.txt\n");
    }

    return 0;
}
```

这个过程中：

- 先打开文件得到一个可写 fd
- 再把标准输出重定向到这个 fd
- 最后执行 `ls`

这样 `ls` 的输出就会写入文件，而不是显示在终端上。

## 6.7. 使用pipe创建进程之间的单向管道 <a id=使用pipe创建进程之间的单向管道></a>

`pipe`在同一张fd表中创建相同指向的读写端；`fork`将使子进程继承父进程的fd表。因此可以实现父子进程之间的通信。

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>

int main(void) {
    int fd[2];
    if (pipe(fd) < 0) {
        perror("pipe");
        exit(1);
    }

    pid_t rc = fork();
    if (rc < 0) {
        perror("fork");
        exit(1);
    }

    if (rc == 0) {
        // 子进程关闭写端
        close(fd[1]);

        char buf[64] = {0};
        ssize_t n = read(fd[0], buf, sizeof(buf) - 1);
        if (n < 0) {
            perror("read");
            exit(1);
        }

        printf("child read: %s\n", buf);
        close(fd[0]);
    } else {
        // 父进程关闭读端
        close(fd[0]);

        const char *msg = "hello from parent";
        write(fd[1], msg, strlen(msg));
        close(fd[1]);

        waitpid(rc, NULL, 0);
    }

    return 0;
}
```

这个例子展示了最基本的父子进程单向通信方式：父进程写入，子进程读取。

---

# 7. fork + exec + pipe：Shell 管道的本质 <a id=Shell管道的本质></a>

## 7.1 `ls | wc -l` 到底做了什么 <a id=ls-wc--l-到底做了什么></a>

Shell 看到：

```bash
ls | wc -l
```

大概会做下面这些事：

1. 创建一根管道
2. `fork` 第一个子进程
3. 在第一个子进程里，把 `stdout` 重定向到管道写端
4. `exec` 成 `ls`
5. `fork` 第二个子进程
6. 在第二个子进程里，把 `stdin` 重定向到管道读端
7. `exec` 成 `wc -l`
8. 父进程关闭两端并等待两个孩子结束

## 7.2 例子：实现 `ls | wc -l` <a id=例子实现-ls-wc--l></a>

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main(void) {
    int fd[2];
    if (pipe(fd) < 0) {
        perror("pipe");
        exit(1);
    }

    pid_t left = fork();
    if (left < 0) {
        perror("fork left");
        exit(1);
    }

    if (left == 0) {
        close(fd[0]);
        dup2(fd[1], STDOUT_FILENO);
        close(fd[1]);

        execlp("ls", "ls", NULL);
        perror("execlp ls");
        exit(1);
    }

    pid_t right = fork();
    if (right < 0) {
        perror("fork right");
        exit(1);
    }

    if (right == 0) {
        close(fd[1]);
        dup2(fd[0], STDIN_FILENO);
        close(fd[0]);

        execlp("wc", "wc", "-l", NULL);
        perror("execlp wc");
        exit(1);
    }

    close(fd[0]);
    close(fd[1]);

    waitpid(left, NULL, 0);
    waitpid(right, NULL, 0);
    return 0;
}
```

这段代码里可以明确看到分工：

- 第一个子进程负责执行 `ls`
- 第二个子进程负责执行 `wc -l`
- 父进程负责关闭无用 fd 并等待子进程结束
