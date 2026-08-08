---
title: JavaScript 异步编程
date: 2026-07-14
tags: [ TypeScript, JavaScript ]
pinned: false
collection: 深入理解 Ts/Js
outline:
  - title: 1. JavaScript 执行模型
    slug: JavaScript执行模型
  - title: 1.1 单线程
    slug: 单线程
    level: 1
  - title: 1.2 执行上下文与调用栈
    slug: 执行上下文与调用栈
    level: 1
  - title: 1.3 任务、微任务与事件循环
    slug: 任务微任务与事件循环
    level: 1

  - title: 2. Promise
    slug: Promise
  - title: 2.1 Promise 概要
    slug: Promise概要
    level: 1
  - title: 2.2 Promise 构造
    slug: Promise构造
    level: 1
  - title: 2.3 Promise 链式调用
    slug: Promise链式调用
    level: 1
  - title: 2.4 Promise 组合方法
    slug: Promise组合方法
    level: 1
  - title: 2.5 Promise 时序
    slug: Promise时序
    level: 1

  - title: 3. async 与 await
    slug: async与await
  - title: 3.1 async 函数
    slug: async函数
    level: 1
  - title: 3.2 await
    slug: await
    level: 1
  - title: 3.3 错误处理
    slug: async错误处理
    level: 1
  - title: 3.4 异步栈
    slug: 异步栈
    level: 1
  - title: 3.5 顶层 await
    slug: 顶层await
    level: 1

head:
  - - meta
    - name: description
      content: TypeScript 与 JavaScript 复习系列第三篇，整理 Worker 与 agent、执行上下文、任务与微任务、事件循环、Promise 以及 async/await 的运行机制。
  - - meta
    - name: keywords
      content: JavaScript, TypeScript, Web Worker, agent, execution context, call stack, event loop, task, microtask, Promise, async, await
---

本篇整理 JavaScript 的执行模型、Promise 的状态与控制流，并解释 `async` / `await` 如何建立在 Promise 之上。

---

Promise 和 `async` / `await` 规定异步结果如何传递以及后续代码何时恢复。

## 1. JavaScript 执行模型{#JavaScript执行模型}

### 1.1 单线程{#单线程}

浏览器页面的 JavaScript 通常运行在主线程中。主线程还负责处理用户事件、操作 DOM 以及更新页面；长时间执行 JavaScript
会同时阻塞这些工作。

[Web Worker](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers)
允许脚本在 **后台线程** 的独立全局环境中运行。Worker 不能直接操作 DOM，也不能访问页面的 `window`；页面与 Worker 通过
`postMessage()` 发送消息。

ECMAScript 使用执行代理（agent）描述一套 JavaScript 运行设施。一个 agent 持有执行上下文栈与待执行的代码，并且同一时刻只执行一个
JavaScript 执行上下文。“JavaScript 是单线程的”指的是这条 agent 内部的执行流，不表示整个浏览器只有一个线程。

Promise、`async` 和 `await` 都不会创建 Worker 或新的 agent。Promise 构造函数的 executor 仍在当前执行流中同步运行：

```js
console.log('before')

new Promise((resolve) => {
  console.log('executor')
  resolve()
})

console.log('after')

// before
// executor
// after
```

### 1.2 执行上下文与调用栈{#执行上下文与调用栈}

[执行上下文](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth)
是保存当前代码执行状态的规范记录。脚本或模块开始求值时会建立顶层上下文；每次调用函数都会建立本次调用的函数上下文。

正在执行的上下文按调用关系组成执行上下文栈，开发工具通常将它显示为调用栈。调用函数时，新上下文压入栈顶；函数返回或抛出异常时，
对应上下文出栈，控制权回到调用者。递归调用每次都会压入独立上下文，因此会持续消耗栈空间。

异步回调不会插入当前调用栈。当前代码退出后，运行时才会调度回调并使其重新入栈。

### 1.3 任务、微任务与事件循环{#任务微任务与事件循环}

浏览器通过任务队列和微任务队列安排 JavaScript 工作：

| 队列    | 常见来源                      | 处理方式                               |
|-------|---------------------------|------------------------------------|
| 任务队列  | 程序初始化、事件回调、`setTimeout()` | 事件循环将从中选择一项并将它运行到完成                |
| 微任务队列 | Promise 处理器、`await` 后的续体  | 每次当一个任务退出且执行上下文栈为空的时候，依次运行到微任务队列为空 |

> 在每一次新的事件循环开始迭代的时候，运行时都会对任务进行排队，并执行队列中的每个任务。
>
> 对于中途加入的任务，即在每次迭代开始之后加入到队列中的任务，在下一次迭代开始之后才会被执行。
>
> 对于中途加入的微任务，由于微任务将执行直到微任务队列为空，微任务队列被执行期间加入的新微任务，会在下一项任务开始前运行。

ECMAScript 把 Promise 处理器和 `await` 续体这类语言层工作称为作业（Job）。浏览器与 Node.js 会把 Promise 作业安排到
微任务队列中，因此这些处理器异步运行，但通常不必等待下一项任务。

一次典型的事件循环按以下顺序推进：

1. 从任务队列选择一项可运行的任务，并运行到完成。
2. 调用栈清空后，处理微任务直到微任务队列为空。
3. 浏览器根据需要更新动画、样式、布局与绘制。
4. 继续选择下一项任务。

同步代码与微任务都占用当前 agent 的线程。长时间同步执行或无界微任务链会阻塞页面响应；CPU 密集计算需要移出主线程时，应使用
Worker。

## 2. Promise{#Promise}

[Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Using_promises)
是表示异步操作最终完成或失败的对象。调用方可以先取得 Promise，再注册处理器接收结果，不必把后续逻辑直接交给异步 API。

### 2.1 Promise 概要{#Promise概要}

Promise 的状态只有三种：

| 状态          | 含义   | 关联结果                   |
|-------------|------|------------------------|
| `pending`   | 尚未敲定 | 暂无最终结果                 |
| `fulfilled` | 已兑现  | 兑现值（fulfillment value） |
| `rejected`  | 已拒绝  | 拒绝原因（rejection reason） |

兑现（`fulfilled`） 和 拒绝（`rejected`） 合称 敲定（`settled`）。Promise 一旦敲定就不会再改变状态。

### 2.2 Promise 构造{#Promise构造}

Promise 的三个基础构造入口如下：

| 入口                       | 主要用途                       |
|--------------------------|----------------------------|
| `new Promise(executor)`  | 使用回调创建 Promise             |
| `Promise.resolve(value)` | 创建兑现值为 `value` 的 Promise   |
| `Promise.reject(reason)` | 创建拒绝原因为 `reason` 的 Promise |

> 其中，`executor` 的参数形式是 `executor: (resolve, reject) => any`

```js
function wait(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(ms), ms) // 调用 resolve 将 ms 作为此 Promise 的兑现值
  })
}

wait(10).then((ms) => console.log(`${ms}ms`)) // 10ms
```

#### 2.3.1 `new Promise(executor)`

若使用 `new Promise(executor)` 的形式，构造函数会立即、同步调用 executor。

```js
function wait(ms) {

  const ret = new Promise((resolve, reject) => {
    console.log('begin waiting') // 创建 Promise 时同步执行
    setTimeout(() => resolve(ms), ms)
  })
  console.log('promise created')

  return ret
}

wait(10).then((ms) => console.log(`waited for ${ms}ms`))

// begin waiting
// promise created
// waited for 10ms
```

| executor 中的行为                       | 当前 Promise 的结果                  |
|-------------------------------------|---------------------------------|
| `resolve(value)`/`resolve(promise)` | 普通值使其兑现；另一个 Promise 使其采用对方的最终结果 |
| `reject(reason)`                    | 直接以 `reason` 拒绝                 |
| 在结果锁定前同步 `throw error`              | 转换为 `reject(error)`             |
| `return value`                      | 返回值被忽略                          |
| 多次调用 `resolve` / `reject`           | 第一次调用锁定结果，之后的调用无效               |

> 值得注意的是，在 `then` 附加的处理器中，使用 `return value` 将会传递 `value` 到后续处理器
> ```js
> function wait(ms) {
>     return new Promise((resolve) => {
>         setTimeout(() => resolve(ms), ms) // executor 中的 resolve(value) 将传递兑现值到下级处理器
>         return 100 // executor 中的 return value 将被忽略
>     })
> }
> 
> wait(10).then((ms) => {
>     console.log(`waited for ${ms}ms`)
>     return ms // 回调函数 中的 return value 将传递兑现值到下级处理器
> }).then((value) => {
>     console.log(`receive value: ${value}`)
> })
> 
> // waited for 10ms
> // receive value: 10
> ```


调用 `resolve()` 或 `reject()` 不会像 `return` 一样终止 executor，后面的同步语句仍会执行。需要停止时应显式 `return`。

#### 2.3.2 `Promise.resolve(value)` 与 `Promise.reject(reason)`

`Promise.resolve(value)` 遇到普通值时创建并返回以该值兑现的 Promise；遇到原生 Promise 时直接返回它。

```js
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(ms), ms)
  })
}

const innerPromise = wait(10);
const outerPromise = Promise.resolve(innerPromise);

console.log(innerPromise === outerPromise); // true
```

> 值得注意的是，不应该将 `Promise.resolve(value)`、`Promise.reject(reason)` 与 executor 中的 resolve、reject
> 参数混淆，前两者是静态方法，用于构造新的Promise，后者用于改变当前 Promise 的状态。

`Promise.reject(reason)` 始终创建新的拒绝 Promise，并保留 `reason` 本身作为拒绝原因。

### 2.3 Promise 链式调用{#Promise链式调用}

`then()`、`catch()` 和 `finally()` 注册处理器，并且始终返回新的 Promise：

| 方法                              | 处理时机             | 作用             |
|---------------------------------|------------------|----------------|
| `then(onFulfilled, onRejected)` | 原 Promise 兑现或拒绝后 | 处理结果并把返回值传给下一环 |
| `catch(onRejected)`             | 前一环 Promise 拒绝后  | 处理或继续传播错误      |
| `finally(onFinally)`            | 原 Promise 兑现或拒绝后 | 执行与结果无关的清理     |

处理器的完成方式决定新 Promise 的结果：

| 处理器行为            | 新 Promise 的结果        |
|------------------|----------------------|
| `return value`   | 以 `value` 兑现         |
| 没有 `return`      | 以 `undefined` 兑现     |
| `return promise` | 采用返回 `promise` 的最终结果 |
| `throw error`    | 以 `error` 拒绝         |

```js
Promise.resolve(2)
  .then((value) => value * 2) // return value, 以 value 兑现
  .then((value) => Promise.resolve(value + 1)) // return promise, 采用 promise 的最终结果
  .finally(() => console.log('cleanup'))
  .then((value) => console.log(value)) // 5
  .catch((error) => console.error(error))

// cleanup
// 5
```

> 值得注意的是，在传统的 `try-catch-finally` 中， `finally` 不应该返回任何值，否则将会覆盖前面 `return` 在栈上写入的返回值
> ```js
> function wait(ms) {
>     try {
>         return new Promise(resolve => setTimeout(resolve, ms));
>     } finally {
>         return ms
>     }
> }
> 
> console.log(wait(1000) === 1000); // true
> ```
> 在 Promise 链式调用中也是如此，但 `.finally(onFinally)`中的返回值将会被忽略，后续 `then` 将使用前序 `then` 或 `catch`
> 中的返回值
>
> ```js
> Promise.resolve(2)
>     .then((value) => value * 2 + 1) // return 5
>     .finally(() => {
>         console.log('cleanup')
>         return 10 // finally 中的返回值将被忽略
>     })
>     .then((value) => {
>             console.log(value) // 5 
>             throw new Error()
>         },
>     )
>     .catch((error) => {
>         console.error(error)
>         return 100
>     })
>     .then((value) => console.log(value)) // 100
> ```

每个 `return promise` 都会先解决新创建的 Promise。下游依赖某个异步操作时，处理器必须返回该操作的 Promise；遗漏 `return`
会使链过早以 `undefined` 继续执行。

```js
Promise.resolve('https://example.com/')
  .then((url) => {
    // fetch(url) 前缺少 `return` 关键字。
    fetch(url)
      .then((res) => res.text())
  })
  .then((textData) => {
    console.log(textData)
    // textData 永远为 undefined ，因为 fetch 请求还没有完成。
  })

// undefined
```

`catch(onRejected)` 会调用 `then(undefined, onRejected)`。当某回调（含构造时的`executor`）抛出异常或返回被拒绝的 Promise
时，拒绝将沿链向后传播，直到遇到拒绝处理器。没有被处理的拒绝会冒泡到栈顶，并由运行时报告。

```js
Promise.resolve()
  .then(() => {
    throw new Error('Not implemented')
  })
  .catch((e) => {
    console.log(e.message)
  }) // Error 被 catch 捕获，后续 then 将继续执行
  .then(() => {
    console.log('Done')
  })

// Not implemented
// Done
```

若在 `finally()` 或 `catch(onRejected)` 再次抛出异常或返回被拒绝的 Promise ，新的拒绝将沿链向下传递，新的拒绝原因会覆盖原结果。

```js
Promise.resolve()
  .then(() => {
    throw new Error('Not implemented');
  })
  .catch((e) => {
    console.log(e.message)
    return Promise.reject("New Exception");
  })
  .then(() => {
    console.log('Done')
  })
  .catch((e) => {
    console.log(e)
  })

// Not implemented
// New Exception
```

> 值得注意的是，`throw new Error('Not implemented')` 相当于 `return Promise.reject(new Error('Not implemented'))` 而不是
> return Promise.reject('Not implemented')

### 2.4 Promise 组合方法{#Promise组合方法}

四个组合方法接收一组值或 Promise，并返回一个新的 Promise：

| 方法                     | 兑现条件       | 拒绝条件                         | 兑现值            |
|------------------------|------------|------------------------------|----------------|
| `Promise.all()`        | 全部输入兑现     | 任一输入拒绝                       | 按输入顺序排列的值数组    |
| `Promise.allSettled()` | 全部输入敲定     | 不因输入拒绝而拒绝                    | 按输入顺序排列的状态对象数组 |
| `Promise.any()`        | 任一输入兑现     | 全部输入拒绝，以 `AggregateError` 拒绝 | 第一个兑现值         |
| `Promise.race()`       | 第一个敲定的输入兑现 | 第一个敲定的输入拒绝                   | 该输入的兑现值        |

`Promise.all()` 适合统一等待一组都必须成功的操作：

```js
function task(value, delay) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), delay)
  })
}

Promise.all([
  task('first', 20),
  task('second', 10),
]).then((values) => console.log(values))

// ['first', 'second']
```

上例中，第二项先兑现，但 `Promise.all()` 的值仍按输入顺序排列。

任一输入拒绝只会让 `Promise.all()` 尽早拒绝，但不会停止其他计时器、请求或计算。

```js
function delay(index, delay, rejectReason) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`${index} executing`)
      if (rejectReason) {
        reject(rejectReason)
      } else {
        resolve(index)
      }
    }, delay)
  })
}


Promise.all([
  delay('first', 10, 'first failed'),
  delay('second', 20),
])
  .then((values) => console.log(values))
  .catch((error) => console.log(error))

// first executing
// first failed
// second executing
```

上例中，第一项先拒绝，但 `Promise.all()` 将拒绝，但 `delay('second', 20)` 创建的 Promise 仍然被执行。

当多个 Promise 被拒绝时，第一个被拒绝的Promise将决定 `Promise.all()` 的拒绝状态。

```js
function delay(index, delay, rejectReason) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (rejectReason) {
        reject(rejectReason)
      } else {
        resolve(index)
      }
    }, delay)
  })
}


Promise.all([
  delay('first', 10, 'first failed'),
  delay('second', 20, 'second failed'),
  delay('third', 20, 'third failed'),
])
  .then((values) => console.log(values))
  .catch((error) => console.log(error))

// first failed
```

> `allSettled`、`any` 与 `race` 的状态转换机制与 `all` 大同小异，但值得注意的是，`allSettled`传递给下级回调的是
> `PromiseSettledResult[]`，且 `allSettled` 永远不会被拒绝。
>
>  ```js
> function delay(index, delay, rejectReason) { 
>     return new Promise((resolve, reject) => {
>         setTimeout(() => { 
>             if (rejectReason) {
>                 reject(rejectReason)
>             } else {
>                 resolve(index)
>             }
>         }, delay)
>     })
> }
> 
> Promise.allSettled([
>     delay('first', 10, 'first failed'),
>     delay('second', 20),
> ])
>     .then(
>         (values) => console.log(values),
>         (values) => console.log('this should never be called'),
>     )      
> 
> // [
> //   { status: 'rejected', reason: 'first failed' },
> //   { status: 'fulfilled', value: 'second' }
> // ]
> ```

### 2.5 Promise 时序{#Promise时序}

Promise 构造函数的 executor 同步执行，`then()`、`catch()` 和 `finally()` 的处理器异步执行：

```js
console.log('script:start')

const promise = new Promise((resolve) => {
  console.log('executor')
  resolve('value')
})

promise.then((value) => console.log(`then:${value}`)) // then 回调被作为微任务
setTimeout(() => console.log('timer'), 0) // setTimeout 回调被作为任务

console.log('script:end')

// 1. 同步执行
// script:start
// executor
// script:end

// 2. 调用栈清空，微任务队列执行
// then:value

// 3. 微任务队列清空，选择下一项任务
// timer
```

当前同步代码先运行到完成，因此 executor 的输出位于 `script:end` 之前。`then()`
处理器作为微任务，在调用栈清空后执行；微任务队列清空后，事件循环将选择任务队列中下一项任务，
`setTimeout()` 因此最后执行。

## 3. async 与 await{#async与await}

`async` / `await` 在 Promise 之上提供接近同步代码的控制流。它保留 Promise 的结果传播与微任务时序，不会改变 JavaScript
的执行模型。

### 3.1 async 函数{#async函数}

调用 async 函数会创建一个新的 Promise，并立即进入函数体。函数体从入口同步执行，直到 `return`、`throw` 或第一个实际执行的
`await`：

```js
const innerPromise = Promise.resolve(42)

async function answer() {
  return innerPromise
}

const outerPromise = answer()
console.log(outerPromise === innerPromise) // false
outerPromise.then((value) => console.log(value)) // 42
```

async 函数始终返回自己创建的 Promise，即使 `return` 的值已经是另一个 Promise：

| async 函数的完成方式    | 返回 Promise 的结果     |
|------------------|--------------------|
| `return value`   | 以 `value` 兑现       |
| `return promise` | 采用 `promise` 的最终结果 |
| 执行到函数末尾          | 以 `undefined` 兑现   |
| `throw reason`   | 以 `reason` 拒绝      |

没有 `await` 的 async 函数体可以同步执行到结束，但调用方附加的 Promise 处理器仍然异步执行。

### 3.2 await{#await}

`await expression` 先同步计算 expression，再按 Promise 解决过程处理结果：

| `await` 输入      | 处理方式                  |
|-----------------|-----------------------|
| pending Promise | 等待它敲定                 |
| 已兑现 Promise     | 恢复时取得兑现值              |
| 已拒绝 Promise     | 恢复时在 `await` 位置抛出拒绝原因 |
| 普通值             | 视为以该值兑现的 Promise      |

执行到 `await` 后，无论输入是 pending Promise、已经敲定的 Promise 还是普通值，当前 async
函数都会暂停，`await` 后的续体不会留在当前同步调用栈中继续执行：

```js
async function example() {
  console.log('before await')

  await new Promise((resolve) => {
    console.log('await')
    resolve()
  })
  console.log('after await')
}

console.log('script:begin')
example()
console.log('script:end')


// script:begin
// before await
// await
// script:end 
// after await
```

暂停与恢复按以下过程进行：

1. 同步计算 `await` 后的表达式，并把结果规范化为 Promise。
2. 保存 async 函数的局部状态，使其暂时退出调用栈。
3. 结果敲定后，把续体安排为[Promise 作业](#任务微任务与事件循环)。
4. 作业运行时恢复 async 函数；兑现值成为 `await` 的值，拒绝原因在该位置抛出。

### 3.3 错误处理{#async错误处理}

`await` 的 Promise 拒绝时，拒绝原因会在 async 函数恢复位置表现为抛出，因此可以使用普通 `try` / `catch` / `finally`：

```js
async function handleLocally() {
  try {
    return await Promise.reject()
  } catch (error) {
    console.log(error.message) // failed
    return 'fallback'
  } finally {
    console.log('cleanup')
  }
}

handleLocally().then((value) => console.log(value)) // fallback
```

`return promise` 与 `return await promise` 对本地错误处理的影响不同：

```js
async function fail() {
  await null
  throw new Error('failed')
}

async function passThrough() {
  try {
    return fail() // 返回时，fail() 创建的 Promise 还未敲定，错误处理推迟给调用者
  } catch {
    return 'not reached'
  }
}

passThrough().catch((error) => console.log(error.message)) // failed
```

`passThrough()` 在 `fail()` 后续拒绝前已经离开 `try` 块，因此本地 `catch` 不参与处理。需要让当前函数的 `catch` 或
`finally`
观察拒绝时，应在它们覆盖的作用域内执行 `await`。

### 3.4 异步栈{#异步栈}

`return await` 也通常能让当前 async 函数出现在引擎生成的异步错误栈中，但错误栈的格式与异步栈拼接属于实现能力，不是
ECMAScript
统一规定的可移植文本。拒绝原因还可以是任意值；非 `Error` 原因可能根本没有可用栈。

选择 `return` 还是 `return await` 应依据本地错误处理、`finally` 时机和栈可读性。

### 3.5 顶层 await{#顶层await}

顶层 `await` 只允许出现在 ECMAScript 模块中，不能直接用于传统 script 或 CommonJS 文件。模块执行到顶层 `await`
时会挂起自身求值，静态依赖它的导入者也要等待，但整个事件循环和无关模块分支仍可继续推进。

```js
// config.mjs
export const config = await Promise.resolve({
  mode: 'production',
})
```

静态依赖该模块的导入者会等待 `config` 完成初始化。缓慢或永不敲定的顶层等待会拖延整条静态依赖链，与循环依赖组合时也更难推断。
非必要 I/O 不应放入模块初始化；需要由调用方管理加载过程时，可以使用返回 Promise 的动态 `import()`。
