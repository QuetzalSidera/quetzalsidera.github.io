---
title: 1.2.A - POSIX线程API
date: 2026-04-20T00:00:00
tags: [ Unix, C,POSIX, 操作系统 ]
pinned: false
collection: Unix操作系统
outline:
  - title: Pthreads概述
    slug: pthreads概述
  - title: 1. 什么是 Pthreads
    slug: 什么是-pthreads
    level: 1
  - title: 2. 头文件与返回值约定
    slug: 头文件与返回值约定
    level: 1
  - title: 3. 线程生命周期
    slug: 线程生命周期
    level: 1

  - title: 线程建立与退出
    slug: 线程建立与退出
  - title: 1. 创建 - pthread_create
    slug: pthread_create
    level: 1
  - title: 2. 执行 - 线程函数、参数与返回值
    slug: 线程函数参数与返回值
    level: 1
  - title: 3. 退出 - pthread_exit 与 return
    slug: pthread_exit-与-return
    level: 1
  - title: 4. 示例：创建一个线程并等待结束
    slug: 示例创建一个线程并等待结束
    level: 1

  - title: 线程同步与回收
    slug: 线程同步与回收
  - title: 1. 进程与线程生命周期的关联
    slug: 进程与线程生命周期的关联
    level: 1
  - title: 2. pthread_join
    slug: pthread_join
    level: 1
  - title: 3. 可连接线程与分离线程
    slug: 可连接线程与分离线程
    level: 1
  - title: 4. pthread_detach
    slug: pthread_detach
    level: 1
  - title: 5. 示例：等待多个线程并汇总结果
    slug: 示例等待多个线程并汇总结果
    level: 1

  - title: 线程取消
    slug: 线程取消
  - title: 1. pthread_cancel
    slug: pthread_cancel
    level: 1
  - title: 2. 撤销状态与撤销类型
    slug: 撤销状态与撤销类型
    level: 1
  - title: 3. pthread_testcancel
    slug: pthread_testcancel
    level: 1
  - title: 4. 示例：延迟撤销
    slug: 示例延迟撤销
    level: 1

  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 一篇面向初学者的 Unix 线程 API 笔记，介绍 Pthreads 中与线程生命周期直接相关的 API，包括创建、等待、退出、分离与取消。
  - - meta
    - name: keywords
      content: Unix, POSIX, Pthreads, pthread_create, pthread_join, pthread_exit, pthread_detach, pthread_cancel
---

一篇围绕 POSIX 线程生命周期 API 展开的学习笔记。

---

在 [线程基础](./operating-sys-3-thread.md) 中，已经介绍了线程的理论部分。

那么当在 Unix 系统上使用 POSIX 线程时，究竟通过哪些 API 来创建线程、等待线程、结束线程和取消线程？

这篇文章将讨论线程***生命周期***相关的 POSIX API，重点包括：

- 线程建立：`pthread_create`
- 线程同步与回收：`pthread_join`、`pthread_detach`
- 线程退出：`pthread_exit`
- 线程取消：`pthread_cancel`、`pthread_setcancelstate`、`pthread_setcanceltype`、`pthread_testcancel`

## Pthreads概述<a id=pthreads概述></a>

### 1. 什么是 Pthreads<a id=什么是-pthreads></a>

Pthreads 是 POSIX 定义的线程 API 规范，标准名通常写作 POSIX Threads。

它的重点不是“某一个具体实现”，而是规定一组统一接口，使得程序可以在支持 POSIX 的 Unix-like 系统上用相近方式进行线程编程。

在线程生命周期这个主题里，最重要的几组接口分别对应：

| 生命周期动作 | Pthreads API     |
|--------|------------------|
| 创建线程   | `pthread_create` |
| 等待线程结束 | `pthread_join`   |
| 主动退出线程 | `pthread_exit`   |
| 分离线程   | `pthread_detach` |
| 请求取消线程 | `pthread_cancel` |

### 2. 头文件与返回值约定<a id=头文件与返回值约定></a>

使用 Pthreads 时，最基本的头文件是：

```c
#include <pthread.h>
```

这里有一个很容易和系统调用风格混淆的点：大多数 Pthreads 函数成功时返回 `0`，失败时返回一个错误码，而不是返回 `-1`。

例如：

```c
int ret = pthread_create(&tid, NULL, worker, NULL);
if (ret != 0) {
    /* ret 本身就是错误码 */
}
```

因此，Pthreads 代码里判断错误时，通常检查“返回值是否为 0”，而不是检查“是否等于 -1”。

### 3. 线程生命周期<a id=线程生命周期></a>

从使用角度看，一个线程的生命周期里，至少有 3 个彼此不同的问题：

| 问题          | 典型 API                                       | 含义                           |
|-------------|----------------------------------------------|------------------------------|
| 如何创建线程      | `pthread_create`                             | 创建一个新线程并开始执行线程函数             |
| 如何结束线程      | `return` / `pthread_exit` / `pthread_cancel` | 线程正常返回、主动退出或被取消              |
| 其他线程能否等待它结束 | `pthread_join`                               | 对可连接线程执行等待，并取得退出值            |
| 线程结束后资源何时释放 | `pthread_join` / 自动释放                        | 可连接线程由 `join` 回收，分离线程结束后自动回收 |

这里要特别区分两件事：

- “线程结束”表示线程不再继续执行
- “线程资源被回收”表示与这个线程相关的运行时资源被清理

这里的“回收”主要指线程运行时相关资源被释放，例如线程控制块、线程栈以及线程退出值这类与该线程绑定的运行时状态不再保留。

[可连接线程](#可连接线程与分离线程) `joinable thread` 结束后，通常还要再经过一次 `pthread_join` 才算完成回收；分离线程
`detached thread`
则在结束后由系统自动回收。

从实现层再往下看，POSIX 规定的是线程 API 规范，本身并不强制要求底层一定采用用户线程还是内核线程。

不过在主流 Unix-like 系统里，`pthread_create` 创建出的线程通常是内核可见、由内核调度器直接调度的线程，常见实现是“一对一”映射：

| 层次       | 含义                          |
|----------|-----------------------------|
| Pthreads | 用户态看到的标准线程接口                |
| 内核线程     | 真正被内核调度到 CPU 或逻辑处理器上运行的执行实体 |

因此，在 Linux、macOS、FreeBSD 这类系统上，`pthread_create` 创建出的线程通常会参与内核调度。哪个线程先运行、运行在哪个核心或逻辑处理器上，由操作系统调度器决定，而不是由
`pthread_create` 的调用顺序决定。

## 线程建立与退出<a id=线程建立与退出></a>

### 1. 创建 - pthread_create<a id=pthread_create></a>

`pthread_create` 用来创建一个新线程。

函数原型如下：

```c
#include <pthread.h>

int pthread_create(
    pthread_t *thread,
    const pthread_attr_t *attr,
    void *(*start_routine)(void *),
    void *arg
);
```

参数含义：

| 参数              | 含义                     |
|-----------------|------------------------|
| `thread`        | 输出参数，返回新线程的线程标识符       |
| `attr`          | 线程属性，传 `NULL` 表示使用默认属性 |
| `start_routine` | 线程入口函数                 |
| `arg`           | 传给线程入口函数的参数            |

这里的 `attr` 用来传入线程属性；若传 `NULL`，表示采用默认属性。

与线程生命周期最相关的属性通常有下面几类：

| 属性   | 作用                                |
|------|-----------------------------------|
| 分离状态 | 指定线程创建后是 `joinable` 还是 `detached` |
| 栈大小  | 指定线程栈空间大小                         |
| 栈地址  | 指定线程使用哪块栈空间                       |

围绕属性对象，最常见的配套函数如下：

```c
/* 初始化线程属性对象 */
int pthread_attr_init(pthread_attr_t *attr);
/* 销毁线程属性对象 */
int pthread_attr_destroy(pthread_attr_t *attr);
/* 设置线程分离状态 */
int pthread_attr_setdetachstate(pthread_attr_t *attr, int detachstate);
```

最小用法如下：

```c
pthread_t tid;
pthread_attr_t attr;

/* 初始化属性对象 */
pthread_attr_init(&attr);
/* 将新线程设为 detached */
pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);
/* 使用自定义属性创建线程 */
pthread_create(&tid, &attr, worker, NULL);
/* 属性对象用完后销毁 */
pthread_attr_destroy(&attr);
```

这段代码表示：创建线程时不使用默认属性，而是显式把它设为分离线程。这里 `pthread_attr_destroy` 销毁的是属性对象本身，不是线程。

调用成功后，新线程会从 `start_routine(arg)` 开始执行。

需要注意的是，`pthread_create` 创建成功后，父线程和子线程是并发执行的。也就是说，调用返回后，哪个线程先继续运行，并没有固定顺序。

### 2. 执行 - 线程函数、参数与返回值<a id=线程函数参数与返回值></a>

Pthreads 要求线程函数的原型满足下面这种形式：

```c
void *worker(void *arg);
```

这里有两个直接含义：

| 部分           | 含义               |
|--------------|------------------|
| `void *arg`  | 线程入口参数，允许传任意指针类型 |
| `void *` 返回值 | 线程结束时返回一个指针结果    |

因此，线程函数里最常见的两件事分别是：

- 把 `void *arg` 转回原来的参数类型
- 在退出时通过 `return` 或 `pthread_exit` 返回结果指针

如果线程不需要返回值，可以直接返回 `NULL`。

如果线程需要返回一块结果数据，通常要注意返回对象的生命周期。例如，不能把局部变量地址直接返回给 `pthread_join`
，因为线程函数返回后，这个局部变量已经失效。

错误示例：

```c
void *worker(void *arg) {
    int result = 42;
    return &result;   /* 错误：返回了局部变量地址 */
}
```

更安全的做法通常有两种：

- 由创建者提前准备好共享结果对象，并把它的地址传给线程
- 在线程内部动态分配结果对象，再由 `pthread_join` 之后释放

### 3. 退出 - pthread_exit 与 return<a id=pthread_exit-与-return></a>

线程结束时，常见方式有两种：

```c
return value_ptr;
```

或者：

```c
pthread_exit(value_ptr);
```

函数原型：

```c
#include <pthread.h>

void pthread_exit(void *retval);
```

在线程函数内部，`return ptr;` 与 `pthread_exit(ptr);` 在效果上可以理解为等价：都是让当前线程结束，并把 `ptr` 作为线程退出值交给后续的
`pthread_join`。

### 4. 示例：创建一个线程并等待结束<a id=示例创建一个线程并等待结束></a>

下面这个例子演示最基本的 `pthread_create + pthread_join` 流程。线程负责计算 `1 + 2 + ... + upper`，主线程等待其完成后输出结果。

```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct thread_arg
{
    int upper;
    int result;
};

void* runner(void* arg)
{
    struct thread_arg* p = (struct thread_arg*)arg;
    int sum = 0;

    for (int i = 1; i <= p->upper; i++)
    {
        sum += i;
    }

    p->result = sum;
    return NULL;
}

int main(const int argc, char* argv[])
{
    if (argc != 2)
    {
        fprintf(stderr, "usage: %s <positive-int>\n", argv[0]);
        return 1;
    }

    pthread_t tid;
    struct thread_arg arg;


    arg.upper = atoi(argv[1]);
    arg.result = 0;
    int ret = pthread_create(&tid, NULL, runner, &arg);
    if (ret != 0)
    {
        fprintf(stderr, "pthread_create: %s\n", strerror(ret));
        return 1;
    }
    ret = pthread_join(tid, NULL);
    if (ret != 0)
    {
        fprintf(stderr, "pthread_join: %s\n", strerror(ret));
        return 1;
    }
    printf("sum = %d\n", arg.result);
    return 0;
}

```

这个例子里有两个点值得注意：

- `arg` 由主线程分配，且是一个栈上变量，但主线程在 `pthread_join` 前不会结束它的生命周期
- 主线程只在 `join` 之后读取 `arg.result`，因此线程执行顺序是可控的

## 线程同步与回收<a id=线程同步与回收></a>

这里的“同步”只指线程生命周期上的同步，即等待另一个线程结束，不涉及互斥锁、条件变量等并发控制同步。

### 1. 进程与线程生命周期的关联<a id=进程与线程生命周期的关联></a>

在线程同步之前，需要先区分“结束一个线程”和“结束整个进程”。

| 动作                 | 结果                        |
|--------------------|---------------------------|
| 调用 `exit`          | 结束整个进程，所有线程一起终止           |
| 调用 `pthread_exit`  | 只结束当前线程                   |
| `main` 函数 `return` | 等价于 `exit`，结束整个进程         |
| 在线程函数中 `return`    | 等价于`pthread_exit`，只结束当前线程 |

这里最容易混淆的是：在线程函数里的 `return`，和在 `main` 里的 `return`，语义并不一样。

- 在线程函数里 `return`，只是当前线程结束
- 由于`main`是主线程，因此，`return 0`被隐式处理为 `exit(0)`，后者会结束整个进程

因此，如果主线程想“先结束自己，但让别的线程继续运行”，不能直接从 `main` 返回，而应该调用：

```c
int main(void) {
    pthread_create(...);
    pthread_exit(NULL);
}
```

这段代码里，主线程会在 `pthread_exit(NULL)` 处结束自己，但整个进程不会立刻因为主线程结束而退出。进程会继续保留，直到：

- 某个线程调用 `exit`
- 或者所有线程都已经结束

### 2. pthread_join<a id=pthread_join></a>

`pthread_join` 用来等待指定线程结束，并回收它的退出状态。

函数原型：

```c
#include <pthread.h>

int pthread_join(pthread_t thread, void **retval);
```

参数含义如下：

| 参数       | 含义                           |
|----------|------------------------------|
| `thread` | 目标线程 ID                      |
| `retval` | 输出参数，用来接收线程退出值；不需要时可传 `NULL` |

若线程是通过 `return ptr;` 或 `pthread_exit(ptr);` 结束的，那么 `retval` 会收到同一个 `ptr`。

如果线程是被取消结束的，那么 `retval` 会得到特殊值 `PTHREAD_CANCELED`。这也是为什么 `pthread_join`
不只是“等一下”，它还承担了“读取退出结果”和“回收线程资源”的作用。

### 3. 可连接线程与分离线程<a id=可连接线程与分离线程></a>

从回收方式看，Pthreads 线程可以分成两类：

| 类型               | 含义                               |
|------------------|----------------------------------|
| 可连接线程 `joinable` | 线程结束后，需要其他线程调用 `pthread_join` 回收 |
| 分离线程 `detached`  | 线程结束后，资源自动回收，不能再 `join`          |

默认情况下，新创建的线程通常是可连接线程。

因此，若一个线程既没有被 `detach`，又没有被 `join`，那么它结束后相关资源就不会及时回收。这和进程里“结束后还需要 wait
回收”的思路非常接近。

### 4. pthread_detach<a id=pthread_detach></a>

`pthread_detach` 用来把一个线程标记为分离状态。

函数原型：

```c
#include <pthread.h>

int pthread_detach(pthread_t thread);
```

调用成功后：

- 该线程结束时会自动回收资源
- 之后不能再对它调用 `pthread_join`

最小用法如下：

```c
pthread_t tid;

pthread_create(&tid, NULL, worker, NULL);
pthread_detach(tid);
```

### 5. 示例：等待多个线程并汇总结果<a id=示例等待多个线程并汇总结果></a>

下面这个例子创建 4 个线程，分别计算一段区间的部分和，主线程通过 `pthread_join` 逐个等待它们结束，并把结果汇总起来。

```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>

#define NUM_THREADS 4

struct worker_arg {
    int left;
    int right;
};

void *worker(void *arg) {
    struct worker_arg *p = (struct worker_arg *)arg;
    int *partial = malloc(sizeof(int));
    if (partial == NULL) {
        return NULL;
    }

    *partial = 0;
    for (int i = p->left; i <= p->right; i++) {
        *partial += i;
    }

    return partial;
}

int main(void) {
    pthread_t tids[NUM_THREADS];
    struct worker_arg args[NUM_THREADS] = {
        {1, 25}, {26, 50}, {51, 75}, {76, 100}
    };
    int total = 0;

    for (int i = 0; i < NUM_THREADS; i++) {
        if (pthread_create(&tids[i], NULL, worker, &args[i]) != 0) {
            return 1;
        }
    }

    for (int i = 0; i < NUM_THREADS; i++) {
        void *retval = NULL;
        if (pthread_join(tids[i], &retval) != 0) {
            return 1;
        }

        if (retval != NULL) {
            total += *(int *)retval;
            free(retval);
        }
    }

    printf("sum = %d\n", total);
    return 0;
}
```

这个例子强调的是两件事：

- `pthread_join` 可以放在循环里依次等待多个线程
- 线程返回给 `join` 的动态分配结果，需要由主线程负责释放

## 线程取消<a id=线程取消></a>

### 1. pthread_cancel<a id=pthread_cancel></a>

`pthread_cancel` 用来向目标线程发出取消请求。

函数原型：

```c
#include <pthread.h>

int pthread_cancel(pthread_t thread);
```

这里要特别注意“请求”二字：调用 `pthread_cancel` 并不等于目标线程立刻终止。它只是发出一个取消请求，目标线程什么时候真正结束，还取决于它当前的取消状态与取消类型。

### 2. 撤销状态与撤销类型<a id=撤销状态与撤销类型></a>

线程取消里最重要的两个概念分别是：

| 概念                  | 作用              | 
|---------------------|-----------------|
| 撤销状态 `cancel state` | 决定线程当前是否响应取消请求  |   
| 撤销类型 `cancel type`  | 决定线程以什么方式响应取消请求 |   

`cancel state`:

| 宏                        | 含义             |
|--------------------------|----------------|
| `PTHREAD_CANCEL_ENABLE`  | 允许线程响应取消请求（默认） |
| `PTHREAD_CANCEL_DISABLE` | 禁止线程响应取消请求     |

`cancel type`:

| 宏                             | 含义             |
|-------------------------------|----------------|
| `PTHREAD_CANCEL_DEFERRED`     | 延迟取消（默认，安全点取消） |
| `PTHREAD_CANCEL_ASYNCHRONOUS` | 异步取消（立刻终止）     |

异步取消虽然直接，但风险很高。因为线程可能正在持有锁、修改共享数据或管理某些资源，若被立即打断，就可能留下不一致状态。因此在实际代码里，更常见的做法是使用延迟取消。

相关函数原型如下：

```c
int pthread_setcancelstate(int state, int *oldstate);
int pthread_setcanceltype(int type, int *oldtype);
```

这里的 `oldstate` 和 `oldtype` 不是多余参数。它们的作用是保存修改之前的旧设置，方便线程临时改变取消行为，再恢复原值。

典型场景是：线程即将进入一小段不希望被取消打断的代码，例如释放资源、更新局部状态或做收尾工作。这时可以先暂时关闭取消，做完后再恢复：

```c
int oldstate;

pthread_setcancelstate(PTHREAD_CANCEL_DISABLE, &oldstate);
/* 执行一小段不希望被取消打断的代码 */
pthread_setcancelstate(oldstate, NULL);
```

`pthread_setcanceltype` 的 `oldtype` 也是同样的用法。

### 3. pthread_testcancel<a id=pthread_testcancel></a>

`pthread_testcancel` 用来显式建立一个撤销点。

函数原型：

```c
#include <pthread.h>

void pthread_testcancel(void);
```

如果当前线程存在待处理的取消请求，并且线程处于：

- `PTHREAD_CANCEL_ENABLE`
- `PTHREAD_CANCEL_DEFERRED`

那么执行到 `pthread_testcancel()` 时，线程就会在这个点上终止。

这里的“终止”不是普通的 `return`，也不是程序员显式调用 `pthread_exit`。它更接近一种“由取消请求触发的线程退出”：

| 方式                     | 谁发起                 | 退出值                | 特点    |
|------------------------|---------------------|--------------------|-------|
| `pthread_exit(retval)` | 当前线程自己              | `retval`           | 主动退出  |
| 到达撤销点并响应取消             | 其他线程先发请求，当前线程在撤销点响应 | `PTHREAD_CANCELED` | 被取消结束 |

因此，如果线程因为 `pthread_testcancel()` 响应取消而结束，那么后续 `pthread_join` 收到的退出值通常是 `PTHREAD_CANCELED`
，而不是线程自己指定的普通返回值。

这使得程序可以主动选择“哪些位置是安全的终止位置”。例如，线程可以先完成一轮局部工作，释放临时资源，再调用
`pthread_testcancel()` 检查是否需要退出。

### 4. 示例：延迟撤销<a id=示例延迟撤销></a>

下面这个例子演示一个典型的延迟取消流程。主线程创建工作线程，运行一段时间后发出取消请求；工作线程每轮循环末尾调用
`pthread_testcancel()`，作为显式撤销点。

```c
#include <pthread.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

void *worker(void *arg) {
    (void)arg;

    pthread_setcancelstate(PTHREAD_CANCEL_ENABLE, NULL);
    pthread_setcanceltype(PTHREAD_CANCEL_DEFERRED, NULL);

    while (1) {
        puts("worker: doing one round of work");
        sleep(1);

        /* 显式撤销点 */
        pthread_testcancel();
    }

    return NULL;
}

int main(void) {
    pthread_t tid;
    void *retval = NULL;
    int ret;

    ret = pthread_create(&tid, NULL, worker, NULL);
    if (ret != 0) {
        fprintf(stderr, "pthread_create: %s\n", strerror(ret));
        return 1;
    }

    sleep(3);

    ret = pthread_cancel(tid);
    if (ret != 0) {
        fprintf(stderr, "pthread_cancel: %s\n", strerror(ret));
        return 1;
    }

    ret = pthread_join(tid, &retval);
    if (ret != 0) {
        fprintf(stderr, "pthread_join: %s\n", strerror(ret));
        return 1;
    }

    if (retval == PTHREAD_CANCELED) {
        puts("worker thread was canceled");
    }

    return 0;
}
```

这个例子里有三个关键点：

| 点                                   | 说明            |
|-------------------------------------|---------------|
| `pthread_cancel`                    | 只负责发请求        |
| `pthread_testcancel`                | 提供一个明确的撤销点    |
| `pthread_join` + `PTHREAD_CANCELED` | 用来确认线程是被取消结束的 |

## 小结<a id=小结></a>

本篇讨论了 Pthreads 中与线程生命周期直接相关的接口。

可以把主线压缩成下面这样：

| 生命周期动作  | 主要 API                    |
|---------|---------------------------|
| 创建线程    | `pthread_create`          |
| 等待并回收线程 | `pthread_join`            |
| 主动结束线程  | `return` / `pthread_exit` |
| 请求取消线程  | `pthread_cancel`          |
| 建立显式撤销点 | `pthread_testcancel`      |
| 分离线程    | `pthread_detach`          |

如果只记一个执行流程，可以记成：

```text
pthread_create -> 线程运行 -> return / pthread_exit / pthread_cancel
                              -> pthread_join 回收 或 pthread_detach 自动回收
```
