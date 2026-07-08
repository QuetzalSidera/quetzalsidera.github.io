---
title: Python 函数进阶
date: 2026-07-04T02:00:00
tags: [ Python ]
pinned: false
collection: 深入理解 Python
outline:
  - title: 1. 函数对象
    slug: 函数对象
  - title: 1.1 名字绑定
    slug: 名字绑定
    level: 1
  - title: 1.2 元数据
    slug: 元数据
    level: 1
  - title: 2. 装饰器
    slug: 装饰器
  - title: 2.1 替换模型
    slug: 替换模型
    level: 1
  - title: 2.2 包装任意参数
    slug: 包装任意参数
    level: 1
  - title: 2.3 保留函数元数据
    slug: 保留函数元数据
    level: 1
  - title: 3. 带参数装饰器
    slug: 带参数装饰器
  - title: 3.1 三层函数结构
    slug: 三层函数结构
    level: 1
  - title: 3.2 同时支持两种调用形式
    slug: 同时支持两种调用形式
    level: 1
  - title: 4. 偏函数
    slug: 偏函数
  - title: 4.1 固定关键字参数
    slug: 固定关键字参数
    level: 1
  - title: 4.2 固定位置参数
    slug: 固定位置参数
    level: 1
  - title: 5. 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: Python 复习系列第三篇，整理函数对象、装饰器、带参数装饰器、functools.wraps 与 functools.partial 的机制和边界。
  - - meta
    - name: keywords
      content: Python, 函数进阶, 函数对象, decorator, 装饰器, wrapper, functools.wraps, partial, 偏函数
---

本篇整理 Python 函数使用中最常用的两类工具：装饰器和偏函数。

---

装饰器依赖一个前提：函数本身是对象，可以赋值、传参、返回，也可以被另一个函数包装后重新绑定到原来的名字上。偏函数则解决另一个问题：把已有函数的一部分参数预先固定，得到一个更易调用的新函数。

## 1. 函数对象{#函数对象}

### 1.1 名字绑定{#名字绑定}

Python 中函数是对象。`def` 语句创建函数对象，并把函数名绑定到这个对象上；把函数赋值给另一个变量，只是增加了一个新的名字。

```python
def now() -> None:
    print('2026-07-05')

f = now

now()  # 2026-07-05
f()    # 2026-07-05
```

函数对象可以作为参数传入另一个函数，也可以作为返回值返回。装饰器的英文原文是 decorator，本质就是“接收函数，返回函数”的高阶函数。

```python
from collections.abc import Callable

def apply(fn: Callable[[int, int], int], x: int, y: int) -> int:
    return fn(x, y)

def add(x: int, y: int) -> int:
    return x + y

print(apply(add, 2, 3))  # 5
```

### 1.2 元数据{#元数据}

函数对象带有元数据。最常见的是 `__name__`，它记录函数名；调试、日志、路由注册和测试框架经常依赖这些信息。

```python
def now() -> None:
    print('2026-07-05')

f = now

print(now.__name__)  # now
print(f.__name__)    # now
```

## 2. 装饰器{#装饰器}

### 2.1 替换模型{#替换模型}

装饰器（decorator）在不修改原函数定义体的前提下，给函数调用的前后增加额外逻辑，类似于中间件（Middleware），在原有调用的前后添加新逻辑，但不改变原函数本身的逻辑。

```python
from collections.abc import Callable

def log(func: Callable[[], None]) -> Callable[[], None]:
    def wrapper() -> None:
        print(f'call {func.__name__}()')
        func()

    return wrapper

def now() -> None:
    print('2026-07-05')

now = log(now)

now()  # 先输出 call now()，再输出 2026-07-05
```

`@log` 只是上面重新赋值语句的语法糖：

```python
from collections.abc import Callable

def log(func: Callable[[], None]) -> Callable[[], None]:
    def wrapper() -> None:
        print(f'call {func.__name__}()')
        func()

    return wrapper

@log
def today() -> None:
    print('2026-07-05')

today()  # 先输出 call today()，再输出 2026-07-05
```

也就是说，执行完函数定义后，`today` 这个名字不再指向原始函数，而是指向 `log(today)` 返回的 `wrapper`。

### 2.2 包装任意参数{#包装任意参数}

真实装饰器通常不能假设原函数没有参数。包装函数用 `*args` 和 `**kwargs` 接收任意位置参数与关键字参数，再原样转发给原函数。

```python
from collections.abc import Callable
from typing import Any

def log(func: Callable[..., Any]) -> Callable[..., Any]:
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        print(f'call {func.__name__}()')
        return func(*args, **kwargs)

    return wrapper

@log
def add(x: int, y: int) -> int:
    return x + y

print(add(2, 3))  # 先输出 call add()，再输出 5
```

`return func(*args, **kwargs)` 很关键。没有这个 `return`，原函数的返回值会被包装函数吞掉，调用方只能得到 `None`。

### 2.3 保留函数元数据{#保留函数元数据}

直接返回 `wrapper` 会改变函数元数据：

```python
def log(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)

    return wrapper

@log
def add(x: int, y: int) -> int:
    return x + y

print(add.__name__)  # wrapper
```

标准库 `functools.wraps` 用来把原函数的元数据复制到包装函数上。写装饰器时通常都应该加上它。

```python
import functools
from collections.abc import Callable
from typing import Any

def log(func: Callable[..., Any]) -> Callable[..., Any]:
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        print(f'call {func.__name__}()')
        return func(*args, **kwargs)

    return wrapper

@log
def add(x: int, y: int) -> int:
    return x + y

print(add.__name__)  # add
print(add(2, 3))     # 先输出 call add()，再输出 5
```

计时装饰器是常见用法。它不改变原函数参数和返回值，只在调用前后插入测量逻辑。

```python
import functools
import time
from collections.abc import Callable
from typing import Any

def metric(func: Callable[..., Any]) -> Callable[..., Any]:
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed_ms = (time.perf_counter() - start) * 1000
        print(f'{func.__name__} executed in {elapsed_ms:.2f} ms')
        return result

    return wrapper

@metric
def multiply(x: int, y: int, z: int) -> int:
    return x * y * z

print(multiply(2, 3, 4))  # 先输出 multiply executed in ... ms，再输出 24
```

## 3. 带参数装饰器{#带参数装饰器}

### 3.1 三层函数结构{#三层函数结构}

装饰器本身需要参数时，要再包一层函数。第一层接收装饰器参数，第二层接收被装饰函数，第三层包装实际调用。

```python
import functools
from collections.abc import Callable
from typing import Any

def log(text: str) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            print(f'{text} {func.__name__}()')
            return func(*args, **kwargs)

        return wrapper

    return decorator

@log('execute')
def now() -> None:
    print('2026-07-05')

now()  # 先输出 execute now()，再输出 2026-07-05
```

`@log('execute')` 等价于先执行 `log('execute')` 得到真正的 decorator，再用这个 decorator 包装函数。用赋值表达出来就是
`now = log('execute')(now)`。

```python
import functools
from collections.abc import Callable
from typing import Any

def log(text: str) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            print(f'{text} {func.__name__}()')
            return func(*args, **kwargs)

        return wrapper

    return decorator

def now() -> None:
    print('2026-07-05')

now = log('execute')(now)

now()  # 先输出 execute now()，再输出 2026-07-05
```

### 3.2 同时支持两种调用形式{#同时支持两种调用形式}

有些装饰器希望同时支持 `@log` 和 `@log('execute')`。这时外层函数需要先判断第一个参数到底是函数对象，还是装饰器配置。

```python
import functools
from collections.abc import Callable
from typing import Any

def log(arg: Callable[..., Any] | str | None = None):
    def decorate(func: Callable[..., Any], text: str = 'call') -> Callable[..., Any]:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            print(f'{text} {func.__name__}()')
            return func(*args, **kwargs)

        return wrapper

    if callable(arg):
        return decorate(arg)

    text = 'call' if arg is None else arg

    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        return decorate(func, text)

    return decorator

@log
def add(x: int, y: int) -> int:
    return x + y

@log('execute')
def multiply(x: int, y: int) -> int:
    return x * y

print(add(2, 3))       # 先输出 call add()，再输出 5
print(multiply(2, 3))  # 先输出 execute multiply()，再输出 6
```

这种写法灵活，但分支更多。普通项目里如果不需要同时支持两种调用形式，拆成两个明确的装饰器更容易维护。

## 4. 偏函数{#偏函数}

### 4.1 固定关键字参数{#固定关键字参数}

偏函数的英文原文是 partial function。Python 中通常指 `functools.partial`：它固定原函数的一部分参数，返回一个新的可调用对象。

`int()` 默认按十进制解析字符串；如果大量处理二进制字符串，每次都写 `base=2` 会让调用变繁琐。

```python
import functools

int2 = functools.partial(int, base=2)

print(int('1000000'))        # 1000000
print(int('1000000', 2))     # 64
print(int2('1000000'))       # 64
print(int2('1000000', base=10))  # 1000000
```

`partial(int, base=2)` 固定的是关键字参数。调用 `int2('10010')` 时，大致等价于：

```python
kwargs = {'base': 2}

print(int('10010', **kwargs))  # 18
```

被固定的关键字参数仍然可以在调用时覆盖。`int2('1000000', base=10)` 会使用新的 `base=10`。

### 4.2 固定位置参数{#固定位置参数}

`partial` 也能固定位置参数。固定的位置参数会被放在后续调用参数的**左侧**。

```python
import functools

max2 = functools.partial(max, 10)

print(max2(5, 6, 7))   # 10
print(max2(20, 6, 7))  # 20
```

上面的 `max2(5, 6, 7)` 大致等价于：

```python
args = (10, 5, 6, 7)

print(max(*args))  # 10
```

偏函数适合给通用函数创建领域内的窄接口。它不会复制原函数逻辑，只是在调用时预先拼接一部分 `args` 和 `kwargs`。

## 5. 小结{#小结}

装饰器围绕“函数对象可以被修饰”展开：`@decorator` 等价于 `func = decorator(func)`。无参数装饰器返回包装函数；带参数装饰器先返回真正的
decorator；实际项目中应使用 `functools.wraps` 保留原函数元数据。

偏函数围绕“预先固定参数”展开：`functools.partial` 接收函数、位置参数和关键字参数，返回一个更具体的新可调用对象。
