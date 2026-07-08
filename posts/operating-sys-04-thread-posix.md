---
title: 1.2.A - POSIX线程API
date: 2026-04-20T00:00:00
tags: [ Unix, C,POSIX, 操作系统 ]
pinned: false
collection: Unix操作系统
outline:
  - title: Pthreads 概述
    slug: pthreads概述
  - title: 1. Pthreads 定义
    slug: pthreads-的定义
    level: 1
  - title: 2. 头文件与返回值约定
    slug: 头文件与返回值约定
    level: 1
  - title: 3. 线程生命周期
    slug: 线程生命周期
    level: 1

  - title: 创建与退出
    slug: 线程建立与退出
  - title: 1. pthread_create
    slug: pthread_create
    level: 1
  - title: 2. 线程函数
    slug: 线程函数参数与返回值
    level: 1
  - title: 3. pthread_exit 与 return
    slug: pthread_exit-与-return
    level: 1
  - title: 4. 创建线程示例
    slug: 示例创建一个线程并等待结束
    level: 1

  - title: 线程回收
    slug: 线程回收
  - title: 1. 进程与线程生命周期
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
  - title: 5. 多线程回收示例
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
  - title: 4. 延迟撤销示例
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

在 [线程基础](./operating-sys-03-thread.md) 中已介绍线程的理论部分。本篇聚焦线程***生命周期***相关的 POSIX API：

- 线程建立：`pthread_create`
- 线程回收：`pthread_join`、`pthread_detach`
- 线程退出：`pthread_exit`
- 线程取消：`pthread_cancel`、`pthread_setcancelstate`、`pthread_setcanceltype`、`pthread_testcancel`

## Pthreads 概述{#pthreads概述}

### 1. Pthreads 定义{#pthreads-的定义}

Pthreads（POSIX Threads）是 POSIX 定义的线程 API 规范，规定一组统一接口，使程序可在支持 POSIX 的 Unix-like 系统上用一致方式进行线程编程。

生命周期相关的核心接口：

| 生命周期动作 | Pthreads API     |
|--------|------------------|
| 创建线程   | `pthread_create` |
| 等待线程结束 | `pthread_join`   |
| 主动退出线程 | `pthread_exit`   |
| 分离线程   | `pthread_detach` |
| 请求取消线程 | `pthread_cancel` |

### 2. 头文件与返回值约定{#头文件与返回值约定}

```c
#include <pthread.h>
```

Pthreads 函数成功时返回 `0`，失败时返回错误码（而非像系统调用那样返回 `-1` 并设 `errno`）：

```c
int ret = pthread_create(&tid, NULL, worker, NULL);
if (ret != 0) {
    /* ret 本身就是错误码 */
}
```

### 3. 线程生命周期{#线程生命周期}

| 问题     | API                                          | 说明                        |
|--------|----------------------------------------------|---------------------------|
| 创建线程   | `pthread_create`                             | 创建新线程并开始执行线程函数            |
| 结束线程   | `return` / `pthread_exit` / `pthread_cancel` | 正常返回、主动退出或被取消             |
| 等待线程结束 | `pthread_join`                               | 对可连接线程执行等待并取退出值           |
| 资源释放   | `pthread_join` / 自动释放                        | 可连接线程由 `join` 回收，分离线程自动回收 |

需区分两个概念：”线程结束”表示线程不再执行；”资源回收”表示线程控制块、线程栈、退出值等运行时资源被释放。可连接线程（`joinable`
）需通过 `pthread_join` 回收，分离线程（`detached`）结束后系统自动回收。

在主流 Unix-like 系统（Linux、macOS、FreeBSD）上，`pthread_create` 创建出的线程采用一对一映射——每个 Pthreads
线程对应一个内核可见、由调度器直接调度的执行实体。线程的运行顺序和 CPU 分配由操作系统调度器决定，与 `pthread_create`
的调用顺序无关。

## 创建与退出{#线程建立与退出}

### 1. pthread_create{#pthread_create}

`pthread_create` 创建一个新线程。

```c
#include <pthread.h>

int pthread_create(
    pthread_t *thread,
    const pthread_attr_t *attr,
    void *(*start_routine)(void *),
    void *arg
);
```

| 参数              | 含义                |
|-----------------|-------------------|
| `thread`        | 输出参数，返回新线程 ID     |
| `attr`          | 线程属性，`NULL` 为默认属性 |
| `start_routine` | 线程入口函数            |
| `arg`           | 传给入口函数的参数         |

与生命周期相关的线程属性：

| 属性   | 作用                               |
|------|----------------------------------|
| 分离状态 | 指定线程创建后为 `joinable` 或 `detached` |
| 栈大小  | 指定线程栈空间大小                        |
| 栈地址  | 指定线程使用的栈空间                       |

属性对象配套函数：

```c
int pthread_attr_init(pthread_attr_t *attr);
int pthread_attr_destroy(pthread_attr_t *attr);
int pthread_attr_setdetachstate(pthread_attr_t *attr, int detachstate);
```

创建分离线程的最小示例：

```c
pthread_t tid;
pthread_attr_t attr;

pthread_attr_init(&attr);
pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);
pthread_create(&tid, &attr, worker, NULL);
pthread_attr_destroy(&attr);  /* 销毁属性对象，非线程 */
```

`pthread_create` 成功后新线程从 `start_routine(arg)` 开始执行。父线程和子线程并发执行，返回后哪个先运行无固定顺序。

### 2. 线程函数{#线程函数参数与返回值}

线程函数原型必须为：

```c
void *worker(void *arg);
```

| 部分           | 含义            |
|--------------|---------------|
| `void *arg`  | 线程入口参数，任意指针类型 |
| `void *` 返回值 | 线程结束时的返回指针    |

线程函数中的常见操作：将 `void *arg` 转回原类型；通过 `return` 或 `pthread_exit` 返回结果指针。不需要返回值时返回 `NULL`。

返回结果时需注意生命周期——不能返回局部变量地址（线程函数返回后已失效）：

```c
void *worker(void *arg) {
    int result = 42;
    return &result;   /* 错误 */
}
```

正确做法：创建者预分配结果对象并传地址，或线程内动态分配后由 `pthread_join` 释放。

### 3. pthread_exit 与 return{#pthread_exit-与-return}

`pthread_exit` 主动结束当前线程，退出值传给后续的 `pthread_join`。

```c
#include <pthread.h>

void pthread_exit(void *retval);
```

在线程函数内，`return ptr;` 与 `pthread_exit(ptr);` 等价。

### 4. 创建线程示例{#示例创建一个线程并等待结束}

线程计算 `1+2+...+upper`，主线程等待完成后通过共享结构体字段读取结果。

```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* 主线程与工作线程共享的参数结构体 */
struct thread_arg
{
    int upper;   /* 输入：求和上限 */
    int result;  /* 输出：计算结果 */
};

void* runner(void* arg)
{
    struct thread_arg* p = (struct thread_arg*)arg;
    int sum = 0;

    for (int i = 1; i <= p->upper; i++)
        sum += i;

    p->result = sum;  /* 结果写回共享结构体 */
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

    /* 准备参数 */
    arg.upper = atoi(argv[1]);
    arg.result = 0;

    /* 创建线程 */
    int ret = pthread_create(&tid, NULL, runner, &arg);
    if (ret != 0)
    {
        fprintf(stderr, "pthread_create: %s\n", strerror(ret));
        return 1;
    }

    /* 等待线程结束 */
    ret = pthread_join(tid, NULL);
    if (ret != 0)
    {
        fprintf(stderr, "pthread_join: %s\n", strerror(ret));
        return 1;
    }

    /* join 返回后 arg.result 已就绪 */
    printf("sum = %d\n", arg.result);
    return 0;
}
```

关键点：`arg` 由主线程在栈上分配，`pthread_join` 返回后 `arg` 仍存活，因此读取 `arg.result` 安全。

## 线程回收{#线程回收}

本节聚焦等待线程结束并回收资源，不涉及互斥锁、条件变量等并发控制同步。

### 1. 进程与线程生命周期{#进程与线程生命周期的关联}

“结束线程”与”结束进程”的区别：

| 动作                | 结果                         |
|-------------------|----------------------------|
| `exit`            | 结束整个进程，所有线程一起终止            |
| `pthread_exit`    | 只结束当前线程                    |
| `main` 中 `return` | 等价于 `exit`，结束整个进程          |
| 线程函数中 `return`    | 等价于 `pthread_exit`，只结束当前线程 |

注意：`main` 中 `return` 被隐式处理为 `exit`，因此主线程若想”先结束自己但让其他线程继续”，应调用 `pthread_exit(NULL)` 而非从
`main` 返回。进程在以下条件下退出：有线程调用 `exit` 或所有线程均已结束。

### 2. pthread_join{#pthread_join}

等待指定线程结束并回收其退出状态。

```c
#include <pthread.h>

int pthread_join(pthread_t thread, void **retval);
```

| 参数       | 含义                      |
|----------|-------------------------|
| `thread` | 目标线程 ID                 |
| `retval` | 输出参数，接收退出值；`NULL` 表示不关心 |

正常结束（`return`/`pthread_exit`）时 `retval` 收到退出值；被取消时收到 `PTHREAD_CANCELED`。`pthread_join`
同时完成三个职责：等待线程结束、读取退出结果、回收线程资源。

### 3. 可连接线程与分离线程{#可连接线程与分离线程}

| 类型               | 含义                              |
|------------------|---------------------------------|
| 可连接线程 `joinable` | 需其他线程调用 `pthread_join` 回收（默认类型） |
| 分离线程 `detached`  | 结束后资源自动回收，不可 `join`             |

未被 `detach` 也未被 `join` 的线程结束后资源不会回收。

### 4. pthread_detach{#pthread_detach}

`pthread_detach` 将线程标记为分离状态，线程结束后资源自动回收，不可再 `join`。

```c
#include <pthread.h>

int pthread_detach(pthread_t thread);
```

```c
pthread_t tid;
pthread_create(&tid, NULL, worker, NULL);
pthread_detach(tid);  /* 线程结束即自动回收，无需 join */
```

### 5. 多线程回收示例{#示例等待多个线程并汇总结果}

4 个线程分别计算区间部分和，主线程通过循环 `pthread_join` 依次等待，汇总后释放动态分配的结果。

```c
#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>

#define NUM_THREADS 4

struct worker_arg {
    int left;   /* 区间左端点 */
    int right;  /* 区间右端点 */
};

void *worker(void *arg) {
    struct worker_arg *p = (struct worker_arg *)arg;

    /* 动态分配结果，由主线程 join 后释放 */
    int *partial = malloc(sizeof(int));
    if (partial == NULL) return NULL;

    *partial = 0;
    for (int i = p->left; i <= p->right; i++)
        *partial += i;

    return partial;  /* 返回动态分配的结果指针 */
}

int main(void) {
    pthread_t tids[NUM_THREADS];
    struct worker_arg args[NUM_THREADS] = {
        {1, 25}, {26, 50}, {51, 75}, {76, 100}
    };
    int total = 0;

    /* 创建 4 个工作线程 */
    for (int i = 0; i < NUM_THREADS; i++) {
        if (pthread_create(&tids[i], NULL, worker, &args[i]) != 0)
            return 1;
    }

    /* 依次 join 每个线程并汇总结果 */
    for (int i = 0; i < NUM_THREADS; i++) {
        void *retval = NULL;
        if (pthread_join(tids[i], &retval) != 0)
            return 1;

        if (retval != NULL) {
            total += *(int *)retval;
            free(retval);  /* 主线程负责释放线程内 malloc 的内存 */
        }
    }

    printf("sum = %d\n", total);
    return 0;
}
```

关键点：`pthread_join` 循环依次等待多个线程；线程内 `malloc` 的结果由主线程 `join` 后 `free`。

## 线程取消{#线程取消}

### 1. pthread_cancel{#pthread_cancel}

`pthread_cancel` 向目标线程发出取消请求，不等同于立即终止——实际终止时机取决于目标线程的取消状态与取消类型。

```c
#include <pthread.h>

int pthread_cancel(pthread_t thread);
```

### 2. 撤销状态与撤销类型{#撤销状态与撤销类型}

| 概念                  | 作用            |
|---------------------|---------------|
| 撤销状态 `cancel state` | 决定是否响应取消请求    |
| 撤销类型 `cancel type`  | 决定以什么方式响应取消请求 |

`cancel state`：

| 宏                        | 含义           |
|--------------------------|--------------|
| `PTHREAD_CANCEL_ENABLE`  | 允许响应取消请求（默认） |
| `PTHREAD_CANCEL_DISABLE` | 禁止响应取消请求     |

`cancel type`：

| 宏                             | 含义              |
|-------------------------------|-----------------|
| `PTHREAD_CANCEL_DEFERRED`     | 延迟取消（默认，在安全点取消） |
| `PTHREAD_CANCEL_ASYNCHRONOUS` | 异步取消（立即终止）      |

异步取消风险高：线程可能正持有锁或修改共享数据，被立即打断会留下不一致状态。实际代码通常使用延迟取消。

```c
int pthread_setcancelstate(int state, int *oldstate);
int pthread_setcanceltype(int type, int *oldtype);
```

`oldstate`/`oldtype` 保存修改前的旧值，便于临时改变取消行为后恢复。典型用法：在释放资源等不希望被取消打断的代码前暂时关闭取消，完成后恢复：

```c
int oldstate;
pthread_setcancelstate(PTHREAD_CANCEL_DISABLE, &oldstate);
/* 不希望被取消打断的代码 */
pthread_setcancelstate(oldstate, NULL);
```

### 3. pthread_testcancel{#pthread_testcancel}

```c
#include <pthread.h>

void pthread_testcancel(void);
```

当前线程处于 `PTHREAD_CANCEL_ENABLE` 且 `PTHREAD_CANCEL_DEFERRED` 时，若存在待处理的取消请求，执行到
`pthread_testcancel()` 即在此点终止。

取消退出的退出值为 `PTHREAD_CANCELED`：

| 方式                     | 发起方               | 退出值                | 特点   |
|------------------------|-------------------|--------------------|------|
| `pthread_exit(retval)` | 当前线程              | `retval`           | 主动退出 |
| 到达撤销点响应取消              | 其他线程请求，当前线程在撤销点响应 | `PTHREAD_CANCELED` | 被取消  |

线程可在完成一轮局部工作并释放临时资源后调用 `pthread_testcancel()`，主动选择安全的终止位置。

### 4. 延迟撤销示例{#示例延迟撤销}

主线程创建工作线程，运行 3 秒后发出取消请求；工作线程每轮循环末尾通过 `pthread_testcancel` 建立显式撤销点。

```c
#include <pthread.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

void *worker(void *arg) {
    (void)arg;

    /* 设置为延迟取消模式 */
    pthread_setcancelstate(PTHREAD_CANCEL_ENABLE, NULL);
    pthread_setcanceltype(PTHREAD_CANCEL_DEFERRED, NULL);

    while (1) {
        puts("worker: doing one round of work");
        sleep(1);                /* sleep 是 POSIX 定义的隐式撤销点 */

        pthread_testcancel();    /* 显式撤销点：在此处响应取消请求 */
    }

    return NULL;
}

int main(void) {
    pthread_t tid;
    void *retval = NULL;
    int ret;

    /* 创建工作线程 */
    ret = pthread_create(&tid, NULL, worker, NULL);
    if (ret != 0) {
        fprintf(stderr, "pthread_create: %s\n", strerror(ret));
        return 1;
    }

    sleep(3);                   /* 让工作线程运行一段时间 */

    /* 发出取消请求 */
    ret = pthread_cancel(tid);
    if (ret != 0) {
        fprintf(stderr, "pthread_cancel: %s\n", strerror(ret));
        return 1;
    }

    /* 等待工作线程终止并回收 */
    ret = pthread_join(tid, &retval);
    if (ret != 0) {
        fprintf(stderr, "pthread_join: %s\n", strerror(ret));
        return 1;
    }

    /* 确认线程是被取消结束的 */
    if (retval == PTHREAD_CANCELED)
        puts("worker thread was canceled");

    return 0;
}
```

| API                                 | 职责              |
|-------------------------------------|-----------------|
| `pthread_cancel`                    | 发出取消请求          |
| `pthread_testcancel`                | 提供显式撤销点，响应待处理请求 |
| `pthread_join` + `PTHREAD_CANCELED` | 确认线程已被取消并回收资源   |

## 小结{#小结}

| 生命周期动作  | 主要 API                    |
|---------|---------------------------|
| 创建线程    | `pthread_create`          |
| 等待并回收线程 | `pthread_join`            |
| 主动结束线程  | `return` / `pthread_exit` |
| 请求取消线程  | `pthread_cancel`          |
| 建立显式撤销点 | `pthread_testcancel`      |
| 分离线程    | `pthread_detach`          |

```text
pthread_create → 线程运行 → return / pthread_exit / pthread_cancel
                          → pthread_join 回收 或 pthread_detach 自动回收
```
