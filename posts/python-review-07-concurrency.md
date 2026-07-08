---
title: Python 并发编程
date: 2026-07-08T07:00:00
tags: [ Python ]
pinned: false
collection: 深入理解 Python
outline:
  - title: 1. 前置概念
    slug: 前置概念
  - title: 1.1 执行实体
    slug: 执行实体
    level: 1
  - title: 1.2 调度
    slug: 调度
    level: 1
  - title: 1.3 GIL
    slug: GIL
    level: 1
  - title: 1.4 事件循环
    slug: 事件循环
    level: 1

  - title: 2. 多进程
    slug: 多进程
  - title: 2.1 进程对象
    slug: 进程对象
    level: 1
  - title: 2.2 启动方式
    slug: 启动方式
    level: 1
  - title: 2.3 进程池
    slug: 进程池
    level: 1
  - title: 2.4 进程通信
    slug: 进程通信
    level: 1
  - title: 2.4.1 Pipe
    slug: Pipe
    level: 2
  - title: 2.4.2 Queue
    slug: Queue
    level: 2
  - title: 2.4.3 Array
    slug: Array
    level: 2

  - title: 3. 多线程
    slug: 多线程
  - title: 3.1 线程对象
    slug: 线程对象
    level: 1
  - title: 3.2 线程池
    slug: 线程池
    level: 1
  - title: 3.3 线程局部数据
    slug: 线程局部数据
    level: 1

  - title: 4. 协程
    slug: 协程
  - title: 4.1 生成器协程
    slug: 生成器协程
    level: 1
  - title: 4.2 异步函数
    slug: 异步函数
    level: 1
  - title: 4.3 任务对象
    slug: 任务对象
    level: 1
  - title: 4.4 避免同步阻塞
    slug: 避免同步阻塞
    level: 1
  - title: 4.5 协程上下文
    slug: 协程上下文
    level: 1

  - title: 5. 模型选择
    slug: 模型选择
head:
  - - meta
    - name: description
      content: Python 复习系列第七篇，结合操作系统中的进程、线程、调度、同步和 IPC，整理 CPython GIL、事件循环、multiprocessing、subprocess、threading、ThreadPoolExecutor、asyncio、ContextVar 与模型选择。
  - - meta
    - name: keywords
      content: Python, 并发编程, multiprocessing, Process, Pool, Queue, Pipe, subprocess, threading, Thread, Lock, ThreadPoolExecutor, ThreadLocal, GIL, coroutine, asyncio, async, await, contextvars, POSIX, fork, exec, pipe, pthread
---

本篇整理 Python 并发编程：多进程、多线程和协程。

---

操作系统文集已经从 OS
视角整理了 [进程基础](./operating-sys-01-process.md)、[POSIX 进程 API](./operating-sys-02-process-posix.md)、[线程基础](./operating-sys-03-thread.md)、[调度](./operating-sys-05-scheduling.md)、[同步](./operating-sys-06-synchronize.md)、[POSIX 同步 API](./operating-sys-07-synchronize-posix.md)
和 [POSIX IPC](./operating-sys-08-ipc-posix.md)。本篇从 Python API 反向连接这些对象：`multiprocessing` 创建进程，
`threading` 创建线程，`asyncio` 在事件循环中调度用户态任务。

## 1. 前置概念{#前置概念}

### 1.1 执行实体{#执行实体}

Python 并发代码涉及三层执行实体：进程、线程和协程。前两者是操作系统对象，协程是 Python 运行时对象。

| 对象 | 所在层级       | 主要内容                         | 调度者  |
|----|------------|------------------------------|------|
| 进程 | 操作系统       | 地址空间、代码段、数据段、堆、文件描述符表、信号处理配置 | 操作系统 |
| 线程 | 操作系统       | 程序计数器、寄存器现场、线程栈、调度状态         | 操作系统 |
| 协程 | Python 运行时 | coroutine 对象、局部状态、等待点、上下文变量  | 事件循环 |

进程是资源容器，线程是 CPU 调度和执行的基本单位。一个进程可以包含多个线程；一个线程上可以运行一个事件循环；一个事件循环可以管理多个协程任务。
因此，创建和调度成本通常是：进程 > 线程 > 协程。

Python 标准库的常用入口也按这三类对象组织：

| 执行单元 | 标准库                              | 核心对象                                     | 作用                            |
|------|----------------------------------|------------------------------------------|-------------------------------|
| 进程   | `multiprocessing`                | `Process`、`Pool`、`Queue`、`Pipe`          | 创建 Python 子进程，跨进程执行 Python 函数 |
| 线程   | `threading`、`concurrent.futures` | `Thread`、`Lock`、`ThreadPoolExecutor`     | 在当前进程内创建线程或线程池                |
| 协程   | `asyncio`、`contextvars`          | coroutine、`Task`、event loop、`ContextVar` | 在事件循环中调度协作式任务                 |

### 1.2 调度{#调度}

调度分为两层：操作系统调度进程/线程，Python 事件循环调度协程。

| 层级             | 调度对象               | 调度方式 |
|----------------|--------------------|------|
| OS 调度器         | 进程、线程              | 抢占式  |
| `asyncio` 事件循环 | coroutine / `Task` | 协作式  |

抢占式调度下，执行流可能在临界区中途被切走，因此共享可变状态需要同步。协作式调度下，切换点更明确，但只要共享状态跨越多个
`await`，仍然要考虑其他任务插入执行。

### 1.3 GIL{#GIL}

CPython 执行 Python 代码时，会先将源码编译为字节码，再由 Python 解释器执行这些字节码。

每个 Python 进程拥有独立的解释器实例、解释器状态、模块对象以及堆内存对象。同一个进程内创建的多个 Python
线程共享该进程中的解释器状态、模块对象和堆内存，因此需要额外的同步机制保证解释器内部数据的一致性。

在常见的默认 CPython 构建中，线程在执行 Python 字节码前需要先获得全局解释器锁（GIL, Global Interpreter Lock）。GIL
是解释器内部的一把互斥锁，用于保护 CPython 运行时状态，确保同一时刻只有一个线程能够执行 Python
字节码，也就是同一时刻只有一个线程能够访问/修改解释器内部状态。

> GIL锁并非在所有解释器上都存在，一些CPython的替代解释器，如Jython、IronPython等，不同程度上规避了GIL的存在。

因此，即使运行在多核 CPU 上，同一个 Python 进程中的多个线程也无法同时执行 Python 字节码。这导致对于 CPU
密集型任务，多线程程序通常无法充分利用多核 CPU 性能，甚至可能由于线程切换和锁竞争产生额外开销。

例如：

```python
import threading

def count():
    x = 0
    for i in range(1000):
        x += i

for _ in range(5):
    threading.Thread(target=count).start()
```

虽然主线程创建了 5 个线程，但由于 GIL 的限制，同一时刻只有一个线程能够执行 Python 字节码。因此，这类 CPU
密集型任务中的多线程并不会实现真正的并行计算。

而对于：

```python
import requests
import threading

def download(url):
    res=requests.get(url) # IO操作
    print(res.json())

for _ in range(5):
    threading.Thread(
        target=download,
        args=("https://httpbin.org/get",)
    ).start()
```

由于`requests.get`在等待网络IO时，会释放GIL锁，因此单个线程的IO不会阻塞所有线程，等待IO的同时，其它线程仍然能够执行字节码，实现异步IO。

因此，对于CPU密集型任务，GIL的存在会导致每时刻只有一个线程执行字节码，多线程表现和单一线程几乎一样，甚至因为线程创建/调度而更加耗时。

对于IO密集型任务，线程发起IO时，阻塞自身并释放GIL锁，其它线程仍然能够被正常调度，因此一个线程发起IO不会阻塞整个Python解释器进程，相对于单线程执行有显著优化。

> #### 补充：是否真的需要多线程
>
> 对于一系列可以并行的CPU密集操作，且CPU是多核的（通常指有多个逻辑处理器，而不是多个物理核心），那么在 CPython
> 上应该使用多进程而不是多线程（并且进程数目约等于CPU核心数目）。
> 只有多进程才能够克服GIL的限制，使得多个任务在不同核心上并行。
>
> 对于一系列可以并行的CPU密集操作，且CPU是单核的（只有一个逻辑处理器），那么单进程上的单线程执行是最好的结果，因为没有线程创建与调度的开销。即使有多个线程（进程），单一时刻也只会有一个线程（进程）实际使用CPU。
>
> 若一系列可以并行的操作中包含IO，无论CPU是单核还是多核，都应该使用多个执行流以避免一次IO阻塞整个执行流，
> 且使用多进程/多线程/协程都是可取的，但创建与调度开销：进程 > 线程 > 协程。
>
> 进程不共享内存空间，需要解决相互通信问题；线程由于可以访问同一内存空间，且是抢占式调度，因此需要解决并发问题。
>
> 相比之下，协程在单一线程上使用任务循环进行调度，并且是协作式的，因此：
> 1. 不用解决跨进程相互通信问题
> 2. 相比线程，并发问题通常更容易控制，因为切换点更加明确
> 3. 相比进程与线程更加轻量
>
> 于是在绝大多数情况下，Python多线程都不是必需的，对于CPU密集型任务，首选应该是多进程，对于IO密集型任务，协程是更好的选择。

### 1.4 事件循环{#事件循环}

事件循环（event loop）是协程模型中的用户态调度器，通常运行在单一线程之上，负责管理和调度 `asyncio.Task`。

在以下代码中：

```python
import asyncio

async def step(name: str) -> str:
    await asyncio.sleep(0)
    return f'{name}:done'

async def main() -> None:
    task = asyncio.create_task(step('job'))
    print(await task) # job:done

asyncio.run(main())
```

`asyncio.run()` 创建事件循环，并阻塞运行至事件循环结束，`main()` 是事件循环中的第一个任务。

调用 `async def` 函数时，并不会立即执行函数体，而是返回一个 coroutine 对象：

```python
coro = step('job')
```

此时，coroutine 对象并没有被事件循环管理，不会被调度执行。

`asyncio.create_task()` 将 coroutine 包装为 `Task` 对象，并将该任务提交给事件循环调度。此时任务进入事件循环的调度体系，等待获得执行机会。

当执行 `await task` 时，如果 task 尚未完成，当前运行的任务（main）会挂起，并将控制权交还给事件循环；事件循环随后可以调度其他处于就绪状态的任务。当
task 完成后，main 会恢复执行并获取任务结果。

操作系统调度器并不知道 `asyncio.Task` 的存在，它只看到运行事件循环的线程。线程本身由操作系统调度，而线程内部的多个协程任务则由事件循环负责调度。

协程调度是协作式的（cooperative scheduling），而不是抢占式的（preemptive
scheduling）。事件循环无法像操作系统调度线程一样强制暂停正在运行的协程，任务切换通常发生在协程主动挂起并让出控制权的位置，如
`await` 处。

因此，如果某个协程长时间执行纯 CPU 计算，并且没有执行任何 await 或其他让出控制权的操作，如：

```python
async def blocking_task():
    while True:
        pass
```

那么该协程会持续占用事件循环线程，使同一事件循环中的其他任务无法获得执行机会。

## 2. 多进程{#多进程}

多进程（multiprocessing）适合 CPU 密集任务、故障隔离和需要独立资源环境的场景。它的代价是进程创建、解释器初始化、对象序列化和
IPC 开销。

### 2.1 进程对象{#进程对象}

`multiprocessing.Process` 是 Python 对 OS 进程生命周期的封装。创建 `Process` 对象仅描述子进程；调用 `start()` 才会真正创建
OS 子进程。

```python
import multiprocessing
import os

def work(name: str, output) -> None:
    output.put((name, os.getpid()))

if __name__ == '__main__':
    output = multiprocessing.Queue()
    process = multiprocessing.Process(target=work, args=('job', output))
    process.start()
    name, child_pid = output.get()
    process.join()

    print(name)               # job
    print(child_pid != os.getpid()) # True
    print(process.exitcode)   # 0
```

`Process` 构造函数常用形式：

```python
def __init__(self, target=None, name=None, args=(), kwargs=None, *, daemon=None)
```

| 参数       | 含义                  |
|----------|---------------------|
| `target` | 子进程启动后执行的可调用对象      |
| `name`   | 进程名                 |
| `args`   | 传给 `target` 的位置参数   |
| `kwargs` | 传给 `target` 的关键字参数  |
| `daemon` | 是否是守护进程（不随父进程退出而终止） |

常用方法与属性：

| 接口                   | 作用             | OS 层含义                      |
|----------------------|----------------|-----------------------------|
| `start()`            | 启动子进程          | 根据启动方式创建进程，并在子进程中执行 `run()` |
| `run()`              | 执行 `target` 方法 | 简单方法调用                      |
| `join(timeout=None)` | 等待子进程结束        | 类似 `waitpid`，等待子进程状态变化      |
| `is_alive()`         | 检查子进程是否仍在运行    | 查询子进程状态                     |
| `terminate()`        | 请求终止子进程        | Unix 上通常发送 `SIGTERM`        |
| `kill()`             | 强制终止子进程        | Unix 上通常发送 `SIGKILL`        |
| `pid`                | 子进程 PID        | OS 进程标识                     |
| `exitcode`           | 退出码            | `0` 表示正常结束，非零或负值表示异常结束/信号终止 |

> 注：`process.run()` 只是当前进程内的普通方法调用；`process.start()` 才会创建新的 OS 进程。
> ```python
> def run(self):
>   if self._target:
>     self._target(*self._args, **self._kwargs)
> ```

子进程不能直接访问父进程地址空间中的 Python 对象。上例中的 `output = multiprocessing.Queue()` 能跨进程使用，是因为
`multiprocessing.Queue` 创建队列的同时创建了进程间通信需要的管道（Unix实现）。

```python
class Queue(object):
    def __init__(self, maxsize=0, *, ctx):
        ...
        self._reader, self._writer = connection.Pipe(duplex=False)
        ...
```

### 2.2 启动方式{#启动方式}

`multiprocessing` 支持多种启动方式（start method）。不同平台和 Python 版本的默认值可能不同，代码可以用
`multiprocessing.get_start_method()` 查看。

```python
import multiprocessing as mp

if __name__ == '__main__':
    mp.set_start_method('spawn')  # 'fork', 'spawn', 'forkserver'
    print(mp.get_start_method() in {'fork', 'spawn', 'forkserver'})  # True
```

| 启动方式         | Unix 底层关系                        | 特点                     |
|--------------|----------------------------------|------------------------|
| `fork`       | 父进程调用 `fork()`，子进程从 fork 返回点继续   | 快；子进程继承父进程的全部资源，内存写时复制 |
| `spawn`      | 启动新的 Python 解释器，再导入主模块           | 启动时重新导入模块，安全隔离性强但开销大   |
| `forkserver` | 先启动单线程 fork server，后续由它 fork 子进程 | 避免从复杂多线程父进程直接 fork     |

> #### 补充
>在 `spawn` 下，子进程启动新的解释器进程，目标函数、参数等对象需要序列化（Pickle）后传给子进程，
> 不支持不可序列化的资源（如lambda方法、闭包）跨进程传递，因此目标函数通常需要定义为模块级对象，在新进程中将通过导入进行使用，而不是参数传递。
>
> 如以下代码：
> ```python
> import multiprocessing
> import os
>
> if __name__ == '__main__':
> multiprocessing.set_start_method('spawn', force=True)
>
>     target = lambda name, output: output.put((name, os.getpid()))
>     output = multiprocessing.Queue()
>
>     process = multiprocessing.Process(target=target, args=('job', output))
>     process.start()
>```
> 直接运行将导致序列化错误 `_pickle.PicklingError`

### 2.3 进程池{#进程池}

进程创建和销毁开销较高：内核要创建进程控制结构，Python 要启动解释器或完成 fork 后的运行时整理，子进程还可能重新导入模块。

进程池复用已有进程，把多次任务提交摊到同一批进程上。解决进程的生命周期开销。

```python
from multiprocessing import Pool

def square(n: int) -> int:
    return n * n

if __name__ == '__main__':
    with Pool(processes=2) as pool:
        result = pool.map(square, [1, 2, 3, 4])

    print(result) # [1, 4, 9, 16]
```

`Pool` 的常用接口：

| 接口                           | 作用              | 结果顺序                              |
|------------------------------|-----------------|-----------------------------------|
| `map(func, iterable)`        | 阻塞提交一批任务并等待全部完成 | 与输入顺序一致                           |
| `imap(func, iterable)`       | 懒加载地返回迭代器       | 与输入顺序一致                           |
| `apply(func, args=())`       | 在池中执行单个任务并等待结果  | 单个结果                              |
| `apply_async(func, args=())` | 异步提交一个任务        | 通过 `AsyncResult` 获取               |
| `close()`                    | 不再接收新任务         | 只影响任务提交                           |
| `join()`                     | 等待 worker 进程退出  | 必须在 `close()` 或 `terminate()` 后调用 |
| `terminate()`                | 立即终止 worker     | 未完成任务会丢失                          |

`map()` 给出输入集合，并按输入顺序一次性取回全部结果：

```python
from multiprocessing import Pool

def square(n: int) -> int:
    return n * n

if __name__ == '__main__':
    with Pool(processes=2) as pool:
        result = pool.map(square, [1, 2, 3, 4])

    print(result)  # [1, 4, 9, 16]
```

`imap()` 返回迭代器，适合边生产边消费结果。结果仍按输入顺序产出，但不要求一次性构造完整结果列表：

```python
from multiprocessing import Pool

def square(n: int) -> int:
    return n * n

if __name__ == '__main__':
    with Pool(processes=2) as pool:
        iterator = pool.imap(square, [1, 2, 3, 4])
        # 值得注意的是，imap返回的懒迭代器需要在线程池释放前消费
        first_two = [next(iterator), next(iterator)]

    print(first_two)  # [1, 4]
```

`apply_async()` 适合异步提交少量任务，调用方可以稍后通过 `AsyncResult.get()` 等待结果，或通过 `callback` 参数消费结果：

```python
from multiprocessing import Pool

def add(a: int, b: int) -> int:
    return a + b

if __name__ == '__main__':
    with Pool(processes=2) as pool:
        result = pool.apply_async(add, args=(20, 22), callback=print) # 42
        print(result.get())  # 42

```

进程池内部通常由父进程维护任务队列和结果队列，worker 进程循环从任务队列取任务、执行、把结果或异常序列化后写回结果队列。这个模型与
OS 文集中的“消息传递 IPC”对应。

> 值得注意的是，`with` 块退出后，已有的任务将被终止，因此应该在线程池释放前确保已经得到结果。

### 2.4 进程通信{#进程通信}

进程地址空间默认隔离，因此进程间通信（IPC, Inter-Process
Communication）必须通过内核对象或显式共享内存完成。参见 [POSIX IPC](./operating-sys-08-ipc-posix.md)，Python 标准库常见选择如下：

| Python 接口                       | IPC 模型 | 底层关系                                             |
|---------------------------------|--------|--------------------------------------------------|
| `multiprocessing.Pipe`          | 消息传递   | 返回两个连接端点，适合一对一通信                                 |
| `multiprocessing.Queue`         | 消息传递   | 通常基于管道/套接字端点、锁、后台 feeder，把 Python 对象 pickle 成字节流 |
| `multiprocessing.Value`、`Array` | 共享内存   | 创建可被多个相关进程访问的共享 ctypes 对象                        |

#### 2.4.1 Pipe{#Pipe}

`Pipe` 适合两个端点之间的直接消息传递：

```python
from multiprocessing import Pipe, Process

def child(conn) -> None:
    value = conn.recv()
    conn.send(value * 2)
    conn.close()

if __name__ == '__main__':
    parent_conn, child_conn = Pipe()
    process = Process(target=child, args=(child_conn,))
    process.start()

    parent_conn.send(21)
    print(parent_conn.recv()) # 42

    process.join()
```

`Pipe(duplex=True)` 返回一对 `Connection` 对象。默认是双向管道，两端都可以 `send()` 和 `recv()`。

若设置`duplex=False`，前者只可读，后者只可写。

```python
import os
from multiprocessing import Pipe, Process


def child(conn) -> None:
    conn.send(f"hello from child: {os.getpid()}")
    conn.close()


if __name__ == '__main__':
    reader, writer = Pipe(duplex=False)
    process = Process(target=child, args=(writer,))
    process.start()

    print(reader.recv())  # hello from child: 51022

    process.join()
```

管道读写均是阻塞的，`recv()` 与 `send()` 在操作完成前均不会返回。

```python
import os
from multiprocessing import Pipe, Process


def child(conn) -> None:
    conn.send(f"hello from child: {os.getpid()}")
    conn.close()


if __name__ == '__main__':
    reader, writer = Pipe(duplex=False)
    process = Process(target=child, args=(writer,), name='child')
    process.start()

    print(reader.recv())  # hello from child: 51541
    print(reader.recv())  # 阻塞
    process.join()
```

在上例中，由于第二次`recv()`时，管道中没有任何消息，因此父进程将始终阻塞。

同样的，当`send()`时内核缓冲区已满，同样也会阻塞。

```python
import os
from multiprocessing import Pipe, Process

def child(conn) -> None:
    conn.send_bytes(bytes(65536)) # 阻塞
    print("sent 65536 bytes")
    conn.send(f"child pid: {os.getpid()}")
    print("pid sent")
    conn.close()

if __name__ == '__main__':
    reader, writer = Pipe(duplex=False)
    process = Process(target=child, args=(writer,), name='child')
    process.start()

    # print(reader.recv()) # 父进程不消费缓冲区数据

    process.join()
```

管道使用序列化传递对象，`send()` 会用 pickle 序列化对象，`recv()` 会反序列化得到新对象，因此，在传递对象的同时需要确保可序列化。

```python
from multiprocessing import Pipe, Process

def child(conn) -> None:
    func = lambda a, b: a + b
    conn.send(func)
    conn.close()

if __name__ == '__main__':
    reader, writer = Pipe(duplex=False)
    process = Process(target=child, args=(writer,), name='child')
    process.start()

    print(reader.recv())

    process.join()
```

直接运行，子进程抛出异常，父进程通过`recv()`读不到任何消息，因此始终阻塞在`recv()`处。

```bash
(pythonrelearn) qianshuang@qianshuangdeMacBook-Air PythonRelearn % uv run main.py
Process child:
Traceback (most recent call last):
  ...
  File "/Users/qianshuang/.local/share/uv/python/cpython-3.14.3-macos-aarch64-none/lib/python3.14/multiprocessing/reduction.py", line 51, in dumps
    cls(buf, protocol).dump(obj)
    ~~~~~~~~~~~~~~~~~~~~~~~^^^^^
_pickle.PicklingError: Can't pickle local object <function child.<locals>.<lambda> at 0x10336ceb0>
```

此外，在Python地Unix实现中，`Pipe(duplex=True)` 实际上在底层使用了两个Unix管道，分别服务于父子进程的两个方向通信。

#### 2.4.2 Queue{#Queue}

`Queue` 适合生产者消费者模型：

```python
from multiprocessing import Process, Queue

def producer(source) -> None:
    for item in ['A', 'B', 'C']:
        source.put(item)
    source.put(None)

def consumer(source, target) -> None:
    values: list[str] = []
    while True:
        item = source.get()
        if item is None:
            break
        values.append(item.lower())
    target.put(values)

if __name__ == '__main__':
    source = Queue()
    target = Queue()
    writer = Process(target=producer, args=(source,))
    reader = Process(target=consumer, args=(source, target))

    writer.start()
    reader.start()
    writer.join()
    reader.join()
    print(target.get())  # ['a', 'b', 'c']
```

在Unix系统上，虽然`multiprocessing.Queue`的底层依赖`Pipe(duplex=False)`，因此`Queue.get()`与`Queue.put()`
均是阻塞的，并且使用序列化传递对象。

#### 2.4.3 Array{#Array}

`Array` 使用共享内存而不是 pipe，创建共享内存中的 ctypes 数组。多个相关进程访问的是同一块共享内存，而非收发序列化消息。默认
`lock=True`
时，返回值带同步包装；若关闭锁，多个进程并发读写时需要自行保证同步。

`Array` 的构造形式如下：

```python
# multiprocessing.Array(typecode_or_type, size_or_initializer, *, lock=True)
```

参数语义如下：

| 参数                    | 作用                                                                                                                                                                            |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `typecode_or_type`    | 元素类型，可以是 `ctypes` 类型，例如 `ctypes.c_int`，也可以是 `array` 模块风格的单字符类型码，例如 `'i'`、`'d'`、`'c'`，参见 [ctypes](https://docs.python.org/3/library/ctypes.html#ctypes-fundamental-data-types) |
| `size_or_initializer` | 若传整数，表示数组长度，初始值为零值；若传序列，则用该序列初始化数组，数组长度等于序列长度                                                                                                                                 |
| `lock`                | 只能按关键字传入；`True` 表示自动创建锁，`Lock` / `RLock` 表示使用指定锁，`False` 表示不自动同步访问                                                                                                            |

默认 `lock=True` 时，`Array` 返回的是带同步包装的对象。这个包装保证单次受保护访问经过锁，但并不自动保护跨多步的业务不变量。若一段逻辑需要“读多个元素、计算、再写回”，仍应显式获取同一把锁。

```python
import ctypes
from multiprocessing import Array, Process

def fill(values) -> None:
    for index in range(len(values)):
        values[index] = index * index

if __name__ == '__main__':
    values = Array(ctypes.c_int, 4)
    process = Process(target=fill, args=(values,))
    process.start()
    process.join()

    print(list(values))  # [0, 1, 4, 9]
```

`size_or_initializer` 也可以直接接收初始序列：

```python
import ctypes
from multiprocessing import Array

if __name__ == '__main__':
    values = Array(ctypes.c_int, [1, 2, 3])

    print(list(values))  # [1, 2, 3]
```

字节数组可以使用 `ctypes.c_char`。这类数组额外提供 `value` 和 `raw` 两个属性：`raw` 返回完整字节区，`value` 按 C
字符串语义在首个空字节处截断。

```python
import ctypes
from multiprocessing import Array

if __name__ == '__main__':
    data = Array(ctypes.c_char, b'ab\x00cd')

    print(data.raw)    # b'ab\x00cd'
    print(data.value)  # b'ab'
```

`Queue` 面向多生产者/多消费者的任务流；`Pipe` 面向两个端点之间的直接通信；`Array` / `Value`
面向小规模共享状态，并且需要明确同步边界。

## 3. 多线程{#多线程}

多线程（multithreading）在同一进程内创建多条执行流。线程共享地址空间和大部分进程资源，创建和切换通常比进程便宜；代价是共享状态竞争和同步复杂度。

### 3.1 线程对象{#线程对象}

`threading.Thread` 是 Python 对线程生命周期的封装，对应 OS 文集中的 [线程基础](./operating-sys-03-thread.md)
和 [POSIX 线程 API](./operating-sys-04-thread-posix.md)。

```python
import threading
from queue import Queue

def identify(output: Queue[tuple[str, bool]]) -> None:
    current = threading.current_thread()
    print(f"Children Thread Name {current.name}")
    print(f"Children Thread Ident {current.ident}")
    print(f"Children Thread NativeId {current.native_id}")
    output.put((current.name, current.native_id is not None))

if __name__ == "__main__":
    output: Queue[tuple[str, bool]] = Queue()
    thread = threading.Thread(target=identify, args=(output,), name='worker')

    thread.start()
    thread.join()

    print(output.get())  # ('worker', True)
```

`Thread` 构造函数常用形式：

```python
class Thread:
  def __init__(self, target=None, name=None, args=(), kwargs=None, *, daemon=None):
```

| 参数                | 含义              |
|-------------------|-----------------|
| `target`          | 线程启动后执行的可调用对象   |
| `args` / `kwargs` | 传给 `target` 的参数 |
| `name`            | 线程名，用于日志和调试     |
| `daemon`          | 是否为守护线程         |

常用方法与属性：

| 接口                   | 作用             | OS/Pthreads 对应      |
|----------------------|----------------|---------------------|
| `start()`            | 创建并启动线程        | 类似 `pthread_create` |
| `join(timeout=None)` | 等待线程结束         | 类似 `pthread_join`   |
| `is_alive()`         | 检查线程是否仍在执行     | 线程状态                |
| `ident`              | Python 内部线程 ID | -（仅在解释器内部使用）        |
| `native_id`          | OS 线程 ID       | 内核可见的线程 ID          |

现代 CPython 的 `threading.Thread` 使用原生 OS 线程。Unix-like 系统上底层通常经由 Pthreads 创建内核线程；线程调度由 OS
调度器负责，运行顺序与 `start()` 调用顺序无固定关系。

### 3.2 线程池{#线程池}

任务数量多于固定线程数时，线程池负责复用已有线程并分发任务。`ThreadPoolExecutor` 的接口与进程池相近，但任务运行在同一进程中，共享地址空间，因此不需要跨进程序列化
Python 对象。

`ThreadPoolExecutor` 的常用接口：

| 接口                            | 作用                 | 结果顺序                |
|-------------------------------|--------------------|---------------------|
| `submit(fn, *args, **kwargs)` | 提交单个任务，返回 `Future` | 由调用方决定何时取结果         |
| `map(func, *iterables)`       | 批量提交任务并返回结果迭代器     | 与输入顺序一致             |
| `shutdown(wait=True)`         | 关闭线程池              | `wait=True` 时等待任务完成 |
| `Future.result(timeout=None)` | 等待并返回任务结果          | 单个结果                |
| `Future.done()`               | 判断任务是否完成           | 单个任务状态              |
| `as_completed(futures)`       | 按完成顺序迭代 `Future`   | 与输入顺序无关             |

`map()` 按输入顺序批量取回结果：

```python
from concurrent.futures import ThreadPoolExecutor

def square(n: int) -> int:
    return n * n

with ThreadPoolExecutor(max_workers=2) as executor:
    result = list(executor.map(square, [1, 2, 3, 4]))

print(result) # [1, 4, 9, 16]
```

`submit()` 返回 `Future`，按需取结果：

```python
from concurrent.futures import ThreadPoolExecutor

def add(a: int, b: int) -> int:
    return a + b

with ThreadPoolExecutor(max_workers=2) as executor:
    future = executor.submit(add, 20, 22)
    print(future.result())  # 42
```

`as_completed()` 按完成顺序迭代，先完成先处理：

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
from time import sleep

def label(n: int) -> str:
    sleep(1 / n)
    return f'task-{n}'

with ThreadPoolExecutor(max_workers=2) as executor:
    futures = [executor.submit(label, n) for n in range(1, 4)]
    result = [future.result() for future in as_completed(futures)]

print(result)  # ['task-2', 'task-3', 'task-1']
```

在上例中，由于提交顺序是`[1, 2, 3]`，而最大线程数目是`max_workers=2`，因此 `task-1`、`task-2` 将先被执行，在 `task-2` 执行完毕后，
`task-3` 才被执行且快于 `task-1`，因此完成顺序是`[2, 3, 1]`而不是实际任务耗时`[3, 2, 1]`。

### 3.3 线程局部数据{#线程局部数据}

`threading.local()` 创建线程局部数据（thread-local storage）。这个对象可以是全局变量，但它的属性在每个线程中各自独立。

```python
import threading
from queue import Queue

local_state = threading.local()
output: Queue[tuple[str, str]] = Queue()

def handle(user: str) -> None:
    local_state.user = user
    output.put((threading.current_thread().name, local_state.user))

threads = [
    threading.Thread(target=handle, args=('Alice',), name='thread-a'),
    threading.Thread(target=handle, args=('Bob',), name='thread-b'),
]

for thread in threads:
    thread.start()

for thread in threads:
    thread.join()

result = sorted(output.get() for _ in threads)

print(result) # [('thread-a', 'Alice'), ('thread-b', 'Bob')]
```

`ThreadLocal` 最常用的地方就是为每个线程绑定HTTP请求，用户身份信息等，这样一个线程的所有调用到的处理函数都可以非常方便地访问这些资源。

但若在线程池中使用，需要注意清理旧值，否则下一次任务可能复用到同一个 worker 线程上的残留上下文。

## 4. 协程{#协程}

协程（coroutine）是用户态协作式任务。它不像进程或线程那样由 OS 抢占式调度，而是在 `yield` 或 `await` 位置主动让出控制权。

### 4.1 生成器协程{#生成器协程}

早期 Python 使用 generator 表达协程。`yield` 不只返回值，也能接收调用者通过 `send()` 发来的值。

```python
def consumer():
    response = ''
    while True:
        item = yield response
        if item is None:
            return
        response = f'handled:{item}'

worker = consumer()
first = next(worker) # 初始化生成器（执行到第一个yield）

print(first == '')       # True
print(worker.send('A'))  # handled:A
print(worker.send('B'))  # handled:B

worker.close()
```

这个例子里，生产者通过 `send()` 把数据交给 `consumer`，`consumer` 处理后通过下一次 `yield` 把结果交回。整个过程在一个线程内完成，没有
OS 线程切换和锁竞争。

生成器协程展示的是“协作式让出”的控制流本质。现代 Python 新代码应优先使用 `async def`、`await` 和 `asyncio`。

### 4.2 异步函数{#异步函数}

`async def` 定义异步函数。调用异步函数不会立刻执行函数体，而是返回 coroutine 对象。coroutine 对象保存了函数入口、参数和运行状态，
但尚未提交给事件循环，也没有进入函数体。

```python
import asyncio

async def hello(name: str) -> str:
    print(f'start {name}') # start Python
    await asyncio.sleep(0)
    print(f'end {name}')   # end Python
    return f'hello {name}'

async def main() -> None:
    coroutine = hello('Python')
    print(type(coroutine).__name__) # coroutine
    print('created')                # created

    result = await coroutine
    print(result) # hello Python

asyncio.run(main())
```

上例先输出 `coroutine` 和 `created`，然后才输出 `start Python`，说明 `hello('Python')` 只是创建 coroutine 对象，不会执行函数体。

`await coroutine` 会执行，是因为当前 coroutine 已经运行在事件循环中。`asyncio.run(main())` 会把 `main()` 交给事件循环；当
`main()` 执行到 `await coroutine` 时，当前任务挂起在这个等待点，事件循环开始沿着这条等待链推进 `hello('Python')`，直到它返回、
抛出异常，或在内部 `await` 处再次挂起。

> 值得注意的是，`asyncio.run(coroutine)`将在调用线程中启动一个事件循环，并将 coroutine 作为事件循环中的第一个事件，此
> `asyncio.run`方法将阻塞等待事件循环结束。一个正在运行事件循环的线程再次调用`asyncio.run`将抛出异常。

coroutine 和 task 的语义不同：

| 写法                                            | 语义                                             |
|-----------------------------------------------|------------------------------------------------|
| `coroutine = hello('Python')`                 | 创建 coroutine 对象，不执行函数体，不提交事件循环                 |
| `await coroutine`                             | 当前任务直接等待并推进这个 coroutine；不会创建独立任务               |
| `task = asyncio.create_task(hello('Python'))` | 把 coroutine 包装成 `Task` 并提交事件循环；任务之后可以与当前任务并发推进 |
| `await task`                                  | 等待已经提交给事件循环的 task 完成，并取得它的结果、异常或取消状态           |

因此，`await coroutine` 语义是“当前任务等待并执行一个尚未提交的 coroutine”，`await task` 语义是“等待一个已经被事件循环调度的任务结果”。
同一个原生 coroutine 对象只能被 `await` 一次；如果需要多处等待同一个异步结果，应该先创建 `Task`，再等待这个 task。

```python
import asyncio

async def hello(name: str) -> str:
    print(f'start {name}') # start Python
    await asyncio.sleep(0)
    print(f'end {name}')   # end Python
    return f'hello {name}'

async def main() -> None:
    coroutine = hello('Python')
    print(type(coroutine).__name__) # coroutine
    print('created')                # created

    result = await coroutine
    result2 = await coroutine # RuntimeError: cannot reuse already awaited coroutine

    print(result) 

asyncio.run(main())
```

### 4.3 任务对象{#任务对象}

`asyncio.gather()` 可以并发等待多个 coroutine，并按传入顺序返回结果。

```python
import asyncio

async def fetch(name: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return f'{name}:ok'

async def main() -> None:
    result = await asyncio.gather(
        fetch('A', 0.02),
        fetch('B', 0.01),
    )
    print(result) # ['A:ok', 'B:ok']

asyncio.run(main())
```

`asyncio.create_task()` 把 coroutine 包装成任务并交给事件循环调度，此时任务开始有机会执行。

```python
import asyncio

async def calculate() -> int:
    await asyncio.sleep(0)
    return 42

async def main() -> None:
    task = asyncio.create_task(calculate())
    print(task.done()) # False
    print(await task)  # 42
    print(task.done()) # True

asyncio.run(main())
```

### 4.4 避免同步阻塞{#避免同步阻塞}

异步函数内部不能随意调用阻塞函数。阻塞函数会占住事件循环所在的线程，使同一事件循环上的其他 coroutine 无法恢复。

在协程中接入同步阻塞函数时，可以用 `asyncio.to_thread()` 把它放到线程池执行：

```python
import asyncio
import time

def blocking_job() -> str:
    time.sleep(0.01) # 同步阻塞
    return 'done'

async def main() -> None:
    result = await asyncio.to_thread(blocking_job)
    print(result) # done

asyncio.run(main())
```

`to_thread()` 适合桥接少量同步 I/O 函数。CPU 密集函数放进线程池通常仍受 CPython 默认 GIL 影响，应该优先考虑进程池或外部计算服务。

### 4.5 协程上下文{#协程上下文}

`threading.local()` 按线程隔离数据。`asyncio` 中多个协程通常运行在同一个线程内，线程局部数据无法区分不同
coroutine。协程内的请求上下文应使用 `contextvars`。

```python
import asyncio
from contextvars import ContextVar

request_id: ContextVar[str] = ContextVar('request_id')

async def handle(name: str) -> str:
    token = request_id.set(name)
    try:
        await asyncio.sleep(0)
        return request_id.get()
    finally:
        request_id.reset(token)

async def main() -> None:
    result = await asyncio.gather(handle('req-a'), handle('req-b'))
    print(result) # ['req-a', 'req-b']

asyncio.run(main())
```

`ContextVar` 的值会随当前上下文传播，适合记录 request id、用户身份、trace id 等协程级上下文。

## 5. 模型选择{#模型选择}

并发（concurrency）表示多个任务在时间上重叠推进；并行（parallelism）表示多个任务真的同时在不同 CPU 核上执行。Python
中三个模型的选择可以从 OS 对象边界开始：

| 模型 | 调度者  | 内存关系      | 切换方式              | 常见用途               |
|----|------|-----------|-------------------|--------------------|
| 进程 | 操作系统 | 进程间默认隔离   | 抢占式               | CPU 密集任务、故障隔离      |
| 线程 | 操作系统 | 同一进程内共享内存 | 抢占式               | 阻塞 I/O、后台任务、和同步库集成 |
| 协程 | 事件循环 | 同一线程内共享内存 | 协作式，在 `await` 处让出 | 高并发 I/O、连接调度、异步服务  |

按任务类型选择：

| 需求       | 优先模型 | 原因                 |
|----------|------|--------------------|
| 跑满多核做计算  | 多进程  | 每个进程有独立解释器和地址空间    |
| 调用阻塞同步库  | 多线程  | 接入成本低，不需要异步化整条调用链  |
| 管理大量网络连接 | 协程   | 单线程承载大量等待中的 I/O 任务 |
| 保持任务故障隔离 | 多进程  | 进程崩溃通常不破坏父进程内存     |
| 共享大量内存对象 | 多线程  | 共享引用方便，但必须同步写操作    |

常见组合是“多进程 + 协程”：每个进程仅一个线程，用多个进程利用多核，用协程处理每个进程内的大量 I/O。
