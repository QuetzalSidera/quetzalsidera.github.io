---
title: 1.4.A - POSIX同步API
date: 2026-04-23T04:00:00
tags: [ Unix, C,POSIX, 操作系统 ]
pinned: false
collection: Unix操作系统
outline:
  - title: POSIX同步概述
    slug: posix同步概述
  - title: 1. 同步对象概览
    slug: 同步对象概览
    level: 1
  - title: 2. 头文件与返回值约定
    slug: 头文件与返回值约定
    level: 1
  - title: 3. 线程同步与进程同步的边界
    slug: 线程同步与进程同步的边界
    level: 1

  - title: 互斥锁
    slug: 互斥锁
  - title: 1. pthread_mutex_t
    slug: pthread_mutex_t
    level: 1
  - title: 2. lock、unlock 与 trylock
    slug: lock-unlock-与-trylock
    level: 1
  - title: 3. 示例：用互斥锁保护 counter
    slug: 示例用互斥锁保护-counter
    level: 1

  - title: 条件变量
    slug: 条件变量
  - title: 1. 条件变量的作用
    slug: 条件变量的作用
    level: 1
  - title: 2. pthread_cond_wait、signal 与 broadcast
    slug: pthread_cond_waitsignal-与-broadcast
    level: 1
  - title: 3. 示例：并发循环队列
    slug: 示例并发循环队列
    level: 1

  - title: 信号量
    slug: 信号量
  - title: 1. 无名信号量与命名信号量
    slug: 无名信号量与命名信号量
    level: 1
  - title: 2. 示例：限制同时进入的线程数
    slug: 示例限制同时进入的线程数
    level: 1

  - title: 读写锁
    slug: 读写锁
  - title: 1. pthread_rwlock_t
    slug: pthread_rwlock_t
    level: 1
  - title: 2. 示例：读多写少场景
    slug: 示例读多写少场景
    level: 1

  - title: 死锁与加锁顺序
    slug: 死锁与加锁顺序
  - title: 1. 典型场景
    slug: 典型场景
    level: 1
  - title: 2. 固定抢锁顺序
    slug: 固定抢锁顺序
    level: 1
  - title: 2. 原子化抢锁
    slug: 原子化抢锁
    level: 1

  - title: 经典同步问题实现
    slug: 经典同步问题实现
  - title: 1. 有界缓冲区：信号量实现
    slug: 有界缓冲区信号量实现
    level: 1
  - title: 2. 有界缓冲区：管程实现
    slug: 有界缓冲区管程实现
    level: 1
  - title: 3. 读者写者：信号量实现
    slug: 读者写者信号量实现
    level: 1
  - title: 4. 读者写者：读写锁实现
    slug: 读者写者读写锁实现
    level: 1
  - title: 5. 哲学家就餐：限制最大并发实现
    slug: 哲学家就餐限制最大并发实现
    level: 1
  - title: 6. 哲学家就餐：锁排序实现
    slug: 哲学家就餐锁排序实现
    level: 1

  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 一篇围绕 POSIX 同步接口展开的 Unix 笔记，介绍互斥锁、条件变量、信号量、读写锁，以及若干经典同步问题的 C 语言实现。
  - - meta
    - name: keywords
      content: Unix, POSIX, pthread_mutex_t, pthread_cond_t, sem_t, pthread_rwlock_t, semaphore, synchronization
---

一篇围绕 POSIX 同步接口展开的学习笔记。

---

在 [进程（线程）同步](./operating-sys-6-synchronize.md) 里，已经介绍了竞争条件、执行顺序约束、锁、信号量、条件变量和死锁这些理论问题。接下来把这些概念落实到
Unix 用户态最常用的一组同步接口上。

这篇文章默认以 `C + POSIX` 为背景，重点放在线程同步；同时也会指出哪些接口可以扩展到进程间同步。

## POSIX同步概述<a id=posix同步概述></a>

### 1. 同步对象概览<a id=同步对象概览></a>

在 POSIX 用户态编程里，最常见的几类同步对象如下：

| 工具                 | 典型用途         |
|--------------------|--------------|
| `pthread_mutex_t`  | 保护临界区，提供互斥   |
| `pthread_cond_t`   | 表达“条件不满足就等待” |
| `sem_t`            | 表达计数资源或先后顺序  |
| `pthread_rwlock_t` | 读共享、写独占      |

如果把它们和理论篇里的概念对应起来，可以压缩如下：

| 理论概念      | POSIX 对应                           |
|-----------|------------------------------------|
| 互斥锁       | `pthread_mutex_t`                  |
| 条件同步 / 管程 | `pthread_mutex_t + pthread_cond_t` |
| 信号量       | `sem_t`                            |
| 读者写者      | `pthread_rwlock_t` 或信号量组合          |

### 2. 头文件与返回值约定<a id=头文件与返回值约定></a>

这一篇会频繁用到下面两个头文件：

```c
#include <pthread.h>
#include <semaphore.h>
```

这里有一个很容易写错的点：`pthread_*` 函数和 `sem_*` 函数的返回风格并不完全一样。

| API 家族      | 成功时返回什么 | 失败时返回什么          |
|-------------|---------|------------------|
| `pthread_*` | `0`     | 非零错误码            |
| `sem_*`     | `0`     | `-1`，并设置 `errno` |

因此：

```c
int ret = pthread_mutex_lock(&mutex);
if (ret != 0) {
    /* ret 本身就是错误码 */
}
```

而对信号量更常见的写法是：

```c
if (sem_wait(&sem) != 0) {
    perror("sem_wait");
}
```

### 3. 线程同步与进程同步的边界<a id=线程同步与进程同步的边界></a>

`pthread_mutex_t`、`pthread_cond_t` 和 `pthread_rwlock_t` 都是匿名同步对象。程序只有持有该对象所在内存地址时才能访问它，因此：

| 对象                 | 同一进程内线程       | 跨进程                                   |
|--------------------|---------------|---------------------------------------|
| `pthread_mutex_t`  | 可直接共享地址空间中的对象 | 需要放入共享内存，并设置 `PTHREAD_PROCESS_SHARED` |
| `pthread_cond_t`   | 可直接共享地址空间中的对象 | 需要放入共享内存，并设置 `PTHREAD_PROCESS_SHARED` |
| `pthread_rwlock_t` | 可直接共享地址空间中的对象 | 需要放入共享内存，并设置共享属性                      |

也就是说，`pthread_*` 对象若要跨进程使用，前提是多个进程都能访问同一块共享内存，同时还要显式设置“进程共享”属性。这比同一进程内线程直接共享地址空间明显更复杂，因此它们在实践里更常用于线程同步。

`sem_t` 则不同。它既可以是无名信号量，也可以是命名信号量：

| 类型    | 访问方式                              | 典型场景                |
|-------|-----------------------------------|---------------------|
| 无名信号量 | 通过内存中的 `sem_t` 对象访问               | 同一进程内线程，或共享内存中的相关进程 |
| 命名信号量 | 通过 `sem_open("/name", ...)` 按名字打开 | 不相关进程之间同步           |

命名信号量不要求多个进程共享同一块用户态内存，只要约定同一个名字即可访问同一个内核对象。因此，跨进程同步里信号量通常比
`pthread_*` 对象更直接。

## 互斥锁<a id=互斥锁></a>

### 1. pthread_mutex_t<a id=pthread_mutex_t></a>

`pthread_mutex_t` 是 Pthreads 里最基础的同步对象，用来保护临界区。

最常见的生命周期函数如下：

```c
int pthread_mutex_init(pthread_mutex_t *mutex,
                       const pthread_mutexattr_t *attr);
int pthread_mutex_destroy(pthread_mutex_t *mutex);
```

如果不需要自定义属性，可以直接传 `NULL`：

```c
pthread_mutex_t mutex;
pthread_mutex_init(&mutex, NULL);
```

也可以使用静态初始化：

```c
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;
```

### 2. lock、unlock 与 trylock<a id=lock-unlock-与-trylock></a>

围绕互斥锁，最常用的三个操作如下：

```c
int pthread_mutex_lock(pthread_mutex_t *mutex);
int pthread_mutex_unlock(pthread_mutex_t *mutex);
int pthread_mutex_trylock(pthread_mutex_t *mutex);
```

接口语义与返回值如下：

| 接口                      | 作用          | 成功返回 | 失败时            |
|-------------------------|-------------|------|----------------|
| `pthread_mutex_lock`    | 阻塞等待锁       | `0`  | 非零错误码          |
| `pthread_mutex_unlock`  | 释放锁         | `0`  | 非零错误码          |
| `pthread_mutex_trylock` | 非阻塞等待锁，立即返回 | `0`  | `EBUSY` 或其他错误码 |

`trylock` 适合“不想阻塞太久”的场景，但它不是解决死锁的根本手段；如果多个锁的获取顺序不一致，问题仍然在。

### 3. 示例：用互斥锁保护 counter<a id=示例用互斥锁保护-counter></a>

下面是最小互斥示例：

```c
#include <pthread.h>

static long counter = 0;
static pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

void *worker(void *arg) {
    (void)arg;

    for (int i = 0; i < 100000; ++i) {
        pthread_mutex_lock(&mutex);
        counter++;
        pthread_mutex_unlock(&mutex);
    }

    return NULL;
}
```

这段代码的重点不在 `counter++`，而在于把“读-改-写”整个过程包进同一个临界区里。

## 条件变量<a id=条件变量></a>

### 1. 条件变量的作用<a id=条件变量的作用></a>

`mutex` 只能回答“谁能进去”，不能回答“什么时候才能继续做”。

例如，消费者线程进入临界区后，即使互斥做对了，也可能发现队列为空。这时它不是要继续竞争锁，而是要等待“队列非空”这个条件成立。条件变量（
`condition variable`）就是用来表达这种等待关系的。

### 2. pthread_cond_wait、signal 与 broadcast<a id=pthread_cond_waitsignal-与-broadcast></a>

条件变量最常用的接口如下：

```c
int pthread_cond_init(pthread_cond_t *cond,
                      const pthread_condattr_t *attr);
int pthread_cond_destroy(pthread_cond_t *cond);
int pthread_cond_wait(pthread_cond_t *cond,
                      pthread_mutex_t *mutex);
int pthread_cond_signal(pthread_cond_t *cond);
int pthread_cond_broadcast(pthread_cond_t *cond);
```

接口语义如下：

| 接口                       | 参数                             | 作用                                    | 成功返回 | 失败时   |
|--------------------------|--------------------------------|---------------------------------------|------|-------|
| `pthread_cond_wait`      | `cond` 为等待的条件变量，`mutex` 为关联互斥锁 | 释放 `mutex` 并进入等待；被唤醒后重新获得 `mutex` 再返回 | `0`  | 非零错误码 |
| `pthread_cond_signal`    | `cond` 为目标条件变量                 | 唤醒一个等待者                               | `0`  | 非零错误码 |
| `pthread_cond_broadcast` | `cond` 为目标条件变量                 | 唤醒全部等待者                               | `0`  | 非零错误码 |

最关键的是 `pthread_cond_wait` 的语义：

| 动作    | 含义               |
|-------|------------------|
| 进入等待前 | 原子地释放 `mutex`    |
| 被唤醒后  | 重新获取 `mutex` 才返回 |

因此，条件变量必须和互斥锁一起使用。而且等待条件时要用 `while`，不能写成 `if`：

```c
pthread_mutex_lock(&mutex);
while (queue_is_empty()) {
    pthread_cond_wait(&not_empty, &mutex);
}
/* 这里才能安全地取数据 */
pthread_mutex_unlock(&mutex);
```

这样写的原因如下：

- 线程被唤醒时，在未抢到锁前，不能确保条件一直成立。
- 多个等待者被唤醒后，先拿到锁的人可能已经把条件改掉

### 3. 示例：并发循环队列<a id=示例并发循环队列></a>

下面给出一个并发循环队列示例：

```c

#define QUEUE_SIZE 8

typedef struct queue_t
{
    int data[QUEUE_SIZE];
    //头尾指针
    int head;
    int tail;

    int count;
    //锁与条件变量
    pthread_mutex_t mutex;
    pthread_cond_t not_empty;
    pthread_cond_t not_full;
} queue_t;

void queue_push(queue_t* q, int value)
{
    pthread_mutex_lock(&q->mutex);
    while (q->count == QUEUE_SIZE)
    {
        pthread_cond_wait(&q->not_full, &q->mutex);
    }

    q->data[q->tail] = value;
    q->tail = (q->tail + 1) % QUEUE_SIZE;
    q->count++;

    pthread_cond_signal(&q->not_empty);
    pthread_mutex_unlock(&q->mutex);
}

int queue_pop(queue_t* q)
{
    pthread_mutex_lock(&q->mutex);
    while (q->count == 0)
    {
        pthread_cond_wait(&q->not_empty, &q->mutex);
    }

    int value = q->data[q->head];
    q->head = (q->head + 1) % QUEUE_SIZE;
    q->count--;

    pthread_cond_signal(&q->not_full);
    pthread_mutex_unlock(&q->mutex);
    return value;
}

```

这就是典型的“管程式写法”：共享状态、互斥锁和条件变量一起封装。

## 信号量<a id=信号量></a>

### 1. 无名信号量与命名信号量<a id=无名信号量与命名信号量></a>

POSIX 信号量分成两类：

| 类型    | API                                     | 适用场景                  |
|-------|-----------------------------------------|-----------------------|
| 无名信号量 | `sem_init` / `sem_destroy`              | 同一进程内线程，或放在共享内存中的相关进程 |
| 命名信号量 | `sem_open` / `sem_close` / `sem_unlink` | 不相关进程之间共享             |

无名信号量生命周期接口：

```c
int sem_init(sem_t *sem, int pshared, unsigned int value);
int sem_destroy(sem_t *sem);
```

其中 `pshared` 含义如下：

| `pshared` | 含义               |
|-----------|------------------|
| `0`       | 仅供同一进程内线程共享      |
| 非 `0`     | 放在共享内存中，可供多个进程共享 |

一个初始化为 `1` 的信号量，效果类似二进制信号量；若初始化为更大的值，就更接近“有 `n` 个资源实例”的模型。

命名信号量生命周期接口：

```c
sem_t *sem_open(const char *name, int oflag, ...);
int sem_close(sem_t *sem);
int sem_unlink(const char *name);
```

使用`sem_open`在创建命名信号量时可以给出初值

| `sem_open`参数 | 是否必须 | 含义                   |   
|--------------|------|----------------------|
| `name`       | 必须   | 命名信号量的名字（必须以 `/` 开头） |
| `oflag`      | 必须   | 打开方式                 |    
| `mode`       | 条件必须 | 权限（仅在 `O_CREAT` 时生效） | 
| `value`      | 条件必须 | 初始值（仅在第一次创建时生效）      | 

对于使用`sem_open`打开的信号量，不需要再调用`sem_init`

值得注意的是`sem_close`与`sem_unlink`的区别

| 方法           | 含义                              |
|--------------|---------------------------------|
| `sem_close`  | 关闭当前进程对信号量的“使用”                 |
| `sem_unlink` | 从系统中“删除”这个命名信号量，类似于系统调用`unlink` |

无名信号量通过 `pshared` 决定“只在线程间共享”还是“放入共享内存后在进程间共享”；命名信号量则直接通过名字访问同一个内核对象，更适合不相关进程之间同步。

等待信号量/触发信号量：

```c
int sem_wait(sem_t *sem);
int sem_post(sem_t *sem);
```

示例如下：

```c
#include <fcntl.h>
#include <semaphore.h>


sem_t *sem = sem_open("/my_sem", O_CREAT, 0644, 1);
/* use sem_wait / sem_post */
sem_close(sem);
sem_unlink("/my_sem");
```

实际上，信号量是一个强大的工具，互斥锁、条件变量、读写锁都可以用它实现，参见[附注](#信号量实现锁-条件变量-读写锁)。

### 2. 示例：限制同时进入的线程数<a id=示例限制同时进入的线程数></a>

下面的例子用信号量限制“同时最多只有 3 个线程进入某段代码”：

```c
#include <semaphore.h>

static sem_t slots;

void *worker(void *arg) {
    (void)arg;

    sem_wait(&slots);

    /* 这里最多只有 3 个线程并发执行 */

    sem_post(&slots);
    return NULL;
}

int main(void) {
    sem_init(&slots, 0, 3);
    /* create threads ... */
    sem_destroy(&slots);
    return 0;
}
```

这类问题如果用普通 `mutex` 就表达不出来，因为 `mutex` 只能表示“同一时刻只能进入一个线程”。

## 读写锁<a id=读写锁></a>

### 1. pthread_rwlock_t<a id=pthread_rwlock_t></a>

读写锁直接对应理论篇里的读者写者问题。它允许：

- 多个读者同时持有读锁
- 写者独占持有写锁

常用接口如下：

```c
int pthread_rwlock_init(pthread_rwlock_t *rwlock, const pthread_rwlockattr_t *attr);
int pthread_rwlock_destroy(pthread_rwlock_t *rwlock);

int pthread_rwlock_rdlock(pthread_rwlock_t *rwlock);
int pthread_rwlock_wrlock(pthread_rwlock_t *rwlock);
int pthread_rwlock_unlock(pthread_rwlock_t *rwlock);
```

### 2. 示例：读多写少场景<a id=示例读多写少场景></a>

如果共享数据“读远多于写”，读写锁通常比普通互斥锁更合适：

```c
static pthread_rwlock_t rwlock = PTHREAD_RWLOCK_INITIALIZER;
static int shared_value = 0;

int read_value(void) {
    int value;

    pthread_rwlock_rdlock(&rwlock);
    value = shared_value;
    pthread_rwlock_unlock(&rwlock);
    return value;
}

void write_value(int value) {
    pthread_rwlock_wrlock(&rwlock);
    shared_value = value;
    pthread_rwlock_unlock(&rwlock);
}
```

这里多个读取线程可以并发执行，但写线程必须独占。

## 死锁与加锁顺序<a id=死锁与加锁顺序></a>

### 1. 典型场景<a id=典型场景></a>

如果两个线程对同一组锁采用不同的获取顺序，就可能出现最典型的互斥锁死锁：

```c
pthread_mutex_t first_mutex = PTHREAD_MUTEX_INITIALIZER;
pthread_mutex_t second_mutex = PTHREAD_MUTEX_INITIALIZER;

void *thread_one(void *arg) {
    (void)arg;
    pthread_mutex_lock(&first_mutex);
    pthread_mutex_lock(&second_mutex);
    /* work */
    pthread_mutex_unlock(&second_mutex);
    pthread_mutex_unlock(&first_mutex);
    return NULL;
}

void *thread_two(void *arg) {
    (void)arg;
    pthread_mutex_lock(&second_mutex);
    pthread_mutex_lock(&first_mutex);
    /* work */
    pthread_mutex_unlock(&first_mutex);
    pthread_mutex_unlock(&second_mutex);
    return NULL;
}
```

如果 `thread_one` 拿到第一把锁，`thread_two` 同时拿到第二把锁，死锁就产生了。

从死锁四个必要条件看，这个例子里真正容易动手破坏的，通常是“占有并等待”和“循环等待”。前者可以通过原子化获取多把锁来避免，后者可以通过统一加锁顺序来避免。

### 2. 固定抢锁顺序<a id=固定抢锁顺序></a>

固定顺序是一种做法：给所有锁建立统一顺序，任何线程都按相同顺序获取。

```c
void lock_both(pthread_mutex_t *a, pthread_mutex_t *b) {
    if (a < b) {
        pthread_mutex_lock(a);
        pthread_mutex_lock(b);
    } else {
        pthread_mutex_lock(b);
        pthread_mutex_lock(a);
    }
}

void unlock_both(pthread_mutex_t *a, pthread_mutex_t *b) {
    pthread_mutex_unlock(a);
    pthread_mutex_unlock(b);
}
```

这里的关键不是比较地址本身，而是“所有线程共享同一个全序规则”。

### 3. 原子化抢锁<a id=原子化抢锁></a>

如果要针对“占有并等待”下手，可以把“获取多把锁”变成一个原子化阶段。常见写法是再引入一把总控锁，把多锁申请过程串行化：

```c
pthread_mutex_t acquire_guard = PTHREAD_MUTEX_INITIALIZER;

void lock_both_atomically(pthread_mutex_t *a, pthread_mutex_t *b) {
    pthread_mutex_lock(&acquire_guard);
    pthread_mutex_lock(a);
    pthread_mutex_lock(b);
    pthread_mutex_unlock(&acquire_guard);
}

void unlock_both_atomically(pthread_mutex_t *a, pthread_mutex_t *b) {
    pthread_mutex_lock(&acquire_guard);
    pthread_mutex_unlock(b);
    pthread_mutex_unlock(a);
    pthread_mutex_unlock(&acquire_guard);
}
```

这种做法的前提是：相关锁的申请都必须经过同一把 `acquire_guard`。它牺牲了一部分并发性，但避免了两个线程各自持有一把锁、再去等待另一把锁的中间状态。

## 经典同步问题实现<a id=经典同步问题实现></a>

进入代码之前，先说明一个边界：有界缓冲区、读者写者和哲学家就餐都不只是互斥问题，还包含条件同步或资源分配约束。因此，纯 `mutex`
往往不够，实际 POSIX 实现通常会用：

| 问题    | 更自然的 POSIX 工具            |
|-------|--------------------------|
| 有界缓冲区 | 信号量，或 `mutex + cond`     |
| 读者写者  | 信号量，或 `pthread_rwlock_t` |
| 哲学家就餐 | 信号量，或统一锁顺序               |

### 1. 有界缓冲区：信号量实现<a id=有界缓冲区信号量实现></a>

这个实现中：`empty` 表示空槽数，`full` 表示满槽数，`mutex` 保护缓冲区本身。

```c
#define N 8

static int buffer[N];
static int in = 0;
static int out = 0;

static sem_t empty_slots;
static sem_t full_slots;
static pthread_mutex_t buffer_mutex = PTHREAD_MUTEX_INITIALIZER;

void produce(int item) {
    sem_wait(&empty_slots);
    pthread_mutex_lock(&buffer_mutex);

    buffer[in] = item;
    in = (in + 1) % N;

    pthread_mutex_unlock(&buffer_mutex);
    sem_post(&full_slots);
}

int consume(void) {
    int item;

    sem_wait(&full_slots);
    pthread_mutex_lock(&buffer_mutex);

    item = buffer[out];
    out = (out + 1) % N;

    pthread_mutex_unlock(&buffer_mutex);
    sem_post(&empty_slots);
    return item;
}
```

### 2. 有界缓冲区：管程实现<a id=有界缓冲区管程实现></a>

POSIX 里没有一个直接叫“管程”的类型，但 `共享状态 + mutex + cond` 的封装写法本质上就是管程式实现。

```c

typedef struct queue_t
{
    int data[BUFFER_SIZE];
    //头尾指针
    int head;
    int tail;

    int count;
    //锁与条件变量
    pthread_mutex_t mutex;
    pthread_cond_t not_empty;
    pthread_cond_t not_full;

    void (*push)(struct queue_t* q, int value);
    int (*pop)(struct queue_t* q);
} queue_t;

void queue_push(queue_t* q, int value)
{
    pthread_mutex_lock(&q->mutex);
    while (q->count == BUFFER_SIZE)
    {
        pthread_cond_wait(&q->not_full, &q->mutex);
    }

    q->data[q->tail] = value;
    q->tail = (q->tail + 1) % BUFFER_SIZE;
    q->count++;

    pthread_cond_signal(&q->not_empty);
    pthread_mutex_unlock(&q->mutex);
}

int queue_pop(queue_t* q)
{
    pthread_mutex_lock(&q->mutex);
    while (q->count == 0)
    {
        pthread_cond_wait(&q->not_empty, &q->mutex);
    }

    int value = q->data[q->head];
    q->head = (q->head + 1) % BUFFER_SIZE;
    q->count--;

    pthread_cond_signal(&q->not_full);
    pthread_mutex_unlock(&q->mutex);
    return value;
}

//初始化
queue_t* init()
{
    queue_t* q = (queue_t*)malloc(sizeof(queue_t));
    q->push = queue_push;
    q->pop = queue_pop;
    q->tail = 0;
    q->head = 0;
    q->count = 0;

    pthread_mutex_init(&q->mutex, NULL);
    pthread_cond_init(&q->not_empty, NULL);
    pthread_cond_init(&q->not_full, NULL);
    return q;
}
//析构
int deinit(queue_t* queue)
{
    pthread_mutex_destroy(&queue->mutex);
    pthread_cond_destroy(&queue->not_empty);
    pthread_cond_destroy(&queue->not_full);
    free(queue);
    return 0;
}

```

### 3. 读者写者：信号量实现<a id=读者写者信号量实现></a>

这是教材里的第一读者写者问题写法。`rw_mutex` 控制作者独占，`mutex` 保护 `read_count`。

```c
static sem_t rw_mutex;
static sem_t count_mutex;
static int read_count = 0;

void reader_enter(void) {
    sem_wait(&count_mutex);
    read_count++;
    if (read_count == 1) {
        //第一个读者申请锁
        sem_wait(&rw_mutex);
    }
    sem_post(&count_mutex);
}

void reader_exit(void) {
    sem_wait(&count_mutex);
    read_count--;
    if (read_count == 0) {
        //最后一个读者释放锁
        sem_post(&rw_mutex);
    }
    sem_post(&count_mutex);
}

void writer_enter(void) {
    sem_wait(&rw_mutex);
}

void writer_exit(void) {
    sem_post(&rw_mutex);
}
```

### 4. 读者写者：读写锁实现<a id=读者写者读写锁实现></a>

如果直接用 POSIX 提供的读写锁，实现会更自然：

```c
static pthread_rwlock_t rwlock = PTHREAD_RWLOCK_INITIALIZER;

void reader(void) {
    pthread_rwlock_rdlock(&rwlock);
    /* read shared data */
    pthread_rwlock_unlock(&rwlock);
}

void writer(void) {
    pthread_rwlock_wrlock(&rwlock);
    /* write shared data */
    pthread_rwlock_unlock(&rwlock);
}
```

这也是为什么读写锁经常被看作“读者写者问题的 API 级抽象”。

### 5. 哲学家就餐：限制最大并发实现<a id=哲学家就餐限制最大并发实现></a>

一个常见做法是增加一个“房间容量”信号量，保证同时尝试拿筷子的人最多只有 `n-1` 个：

```c
static sem_t room;//room初始化为4
static sem_t chopstick[5];

void philosopher(int i) {
    int left = i;
    int right = (i + 1) % 5;

    sem_wait(&room);
    sem_wait(&chopstick[left]);
    sem_wait(&chopstick[right]);

    /* eat */

    sem_post(&chopstick[right]);
    sem_post(&chopstick[left]);
    sem_post(&room);

    /* think */
}
```

它的核心思路是：主动破坏“每个人都先拿起一根筷子”的局面。

### 6. 哲学家就餐：锁排序实现<a id=哲学家就餐锁排序实现></a>

另一种更通用的工程解法，是统一资源获取顺序。每位哲学家都先拿编号小的筷子，再拿编号大的筷子：

```c
#define MIN(x,y) ((x) < (y) ? (x) : (y))
#define MAX(x,y) ((x) > (y) ? (x) : (y))
static pthread_mutex_t chopstick[5];

void philosopher(int i)
{
    int left = i;
    int right = (i + 1) % 5;
    int first = MIN(left, right);
    int second = MAX(left, right);

    pthread_mutex_lock(&chopstick[first]);
    pthread_mutex_lock(&chopstick[second]);

    /* eat */

    pthread_mutex_unlock(&chopstick[second]);
    pthread_mutex_unlock(&chopstick[first]);
}
```

这和前面“按固定顺序获取两把锁”是同一个思路：只要全局顺序一致，就不会形成循环等待。

## 小结<a id=小结></a>

本章介绍了 POSIX 用户态最核心的同步工具：`mutex` 负责互斥，`cond` 负责等待条件，`semaphore` 负责资源计数，`rwlock` 负责读共享写独占。

如果只是保护一小段共享数据，先想到 `pthread_mutex_t`；如果要表达“等待条件”，就要配合 `pthread_cond_t`
；如果问题天然是“有几个槽位”“资源计数”，`sem_t` 更直接；若场景是读写分离，`pthread_rwlock_t` 更合适。

---

# 附注

### 1. 使用信号量实现锁、条件变量、读写锁<a id=信号量实现锁-条件变量-读写锁></a>

简单的互斥锁可以使用二值信号量实现

```c
#include<semaphore.h>

typedef struct
{
    sem_t mutex;
} sem_mutex_t;

int sem_mutex_init(sem_mutex_t* sem_mutex)
{
    return sem_init(&sem_mutex->mutex, 0, 1);
}

int sem_mutex_lock(sem_mutex_t* sem_mutex)
{
    return sem_wait(&sem_mutex->mutex);
}

int sem_mutex_unlock(sem_mutex_t* sem_mutex)
{
    return sem_post(&sem_mutex->mutex);
}

int sem_mutex_destroy(sem_mutex_t* sem_mutex)
{
    return sem_destroy(&sem_mutex->mutex);
}
```

使用信号量实现简单的条件变量

```c
#include <semaphore.h>

typedef struct
{
    sem_t cond;
} sem_cond_t;

int sem_cond_init(sem_cond_t* sem_cond)
{
    //cond初始化为0
    return sem_init(&sem_cond->cond, 0, 0);
}

int sem_cond_wait(sem_cond_t* sem_cond)
{
    return sem_wait(&sem_cond->cond);
}

int sem_cond_signal(sem_cond_t* sem_cond)
{
    return sem_post(&sem_cond->cond);
}


int sem_cond_destroy(sem_cond_t* sem_cond)
{
    return sem_destroy(&sem_cond->cond);
}

```

值得注意的是，由于`sem_wait`时不支持像`pthread_cond_wait`那样休眠时同时释放锁的功能，因此，`sem_cond_broadcast`无法完美实现。
如下代码展示了一个使用`waiters`实现的包含broadcast方法的条件变量，可能造成丢唤醒。

```c
#include <pthread.h>
#include<semaphore.h>

typedef struct
{
    sem_t cond;
    int waiters;
    //waiters的锁
    sem_t mutex;
} sem_cond_t;

int sem_cond_init(sem_cond_t* sem_cond)
{
    //mutex初始化为1 cond初始化为0
    if (sem_init(&sem_cond->mutex, 0, 1) != 0)return -1;
    if (sem_init(&sem_cond->cond, 0, 0) != 0)return -1;
    return 0;
}

int sem_cond_wait(sem_cond_t* sem_cond)
{
    sem_wait(&sem_cond->mutex);
    sem_cond->waiters++;
    sem_post(&sem_cond->mutex);
    //waiters++与sem_wait在此处存在时差
    //且sem_wait(&sem_cond->cond);不能移到mutex内部（死锁）
    sem_wait(&sem_cond->cond);
    return 0;
}

int sem_cond_signal(sem_cond_t* sem_cond)
{
    sem_wait(&sem_cond->mutex);
    if (sem_cond->waiters > 0)
    {
        sem_cond->waiters--;
        sem_post(&sem_cond->cond);
    }
    sem_post(&sem_cond->mutex);
    return 0;
}


int sem_cond_broadcast(sem_cond_t* sem_cond)
{
    sem_wait(&sem_cond->mutex);
    for (int i = 0; i < sem_cond->waiters; i++)
    {
        sem_post(&sem_cond->cond);
    }
    sem_cond->waiters = 0;
    sem_post(&sem_cond->mutex);
    return 0;
}


int sem_cond_destroy(sem_cond_t* sem_cond)
{
    if (sem_destroy(&sem_cond->mutex) != 0)return -1;
    if (sem_destroy(&sem_cond->cond) != 0)return -1;
    return 0;
}

```

使用信号量实现简单的读写锁

```c
#include<semaphore.h>

typedef struct
{
    sem_t mutex;

    sem_t reader_count_mutex;
    uint reader_count;
} sem_rwlock_t;

int sem_rwlock_init(sem_rwlock_t* sem_rw_lock)
{
    sem_rw_lock->reader_count = 0;
    if (sem_init(&sem_rw_lock->mutex, 0, 1) != 0) return -1;
    if (sem_init(&sem_rw_lock->reader_count_mutex, 0, 1) != 0) return -1;
    return 0;
}

int sem_rwlock_rdlock(sem_rwlock_t* sem_rw_lock)
{
    sem_wait(&sem_rw_lock->reader_count_mutex);
    sem_rw_lock->reader_count++;
    if (sem_rw_lock->reader_count == 1)
    {
        sem_wait(&sem_rw_lock->mutex);
    }
    sem_post(&sem_rw_lock->reader_count_mutex);
    return 0;
}

int sem_rwlock_rdunlock(sem_rwlock_t* sem_rw_lock)
{
    sem_wait(&sem_rw_lock->reader_count_mutex);
    sem_rw_lock->reader_count--;
    if (sem_rw_lock->reader_count == 0)
    {
        sem_post(&sem_rw_lock->mutex);
    }
    sem_post(&sem_rw_lock->reader_count_mutex);
    return 0;
}


int sem_rwlock_wrlock(sem_rwlock_t* sem_rw_lock)
{
    return sem_wait(&sem_rw_lock->mutex);
}

int sem_rwlock_wrunlock(sem_rwlock_t* sem_rw_lock)
{
    return sem_post(&sem_rw_lock->mutex);
}

int sem_rwlock_destroy(sem_rwlock_t* sem_rw_lock)
{
    if (sem_destroy(&sem_rw_lock->mutex) != 0) return -1;
    if (sem_destroy(&sem_rw_lock->reader_count_mutex) != 0) return -1;
    return 0;
}

```

### 2. 使用锁与条件变量实现信号量<a id=信号量实现锁-条件变量-读写锁></a>

```c
#include <pthread.h>

typedef struct
{
    pthread_mutex_t mutex;
    pthread_cond_t cond;
    unsigned int value;
} mutex_cond_sem_t;

int mutex_cond_sem_init(mutex_cond_sem_t* sem, unsigned int value)
{
    sem->value = value;
    if (pthread_mutex_init(&sem->mutex, NULL) != 0) return -1;
    if (pthread_cond_init(&sem->cond, NULL) != 0) return -1;
    return 0;
}

int mutex_cond_sem_wait(mutex_cond_sem_t* sem)
{
    pthread_mutex_lock(&sem->mutex);
    while (sem->value == 0)
    {
        pthread_cond_wait(&sem->cond, &sem->mutex);
    }
    sem->value--;
    pthread_mutex_unlock(&sem->mutex);
    return 0;
}

int mutex_cond_sem_post(mutex_cond_sem_t* sem)
{
    pthread_mutex_lock(&sem->mutex);
    sem->value++;
    pthread_cond_signal(&sem->cond);
    pthread_mutex_unlock(&sem->mutex);
    return 0;
}

int mutex_cond_sem_destroy(mutex_cond_sem_t* sem)
{
    if (pthread_mutex_destroy(&sem->mutex) != 0) return -1;
    if (pthread_cond_destroy(&sem->cond) != 0) return -1;
    return 0;
}

```
