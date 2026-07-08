---
title: Python 基础语法速览
date: 2026-07-02T00:00:00
tags: [ Python ]
pinned: false
collection: 深入理解 Python
outline:
  - title: 1. 基础数据类型
    slug: 基础数据类型
  - title: 1.1 对象模型
    slug: 对象模型
    level: 1
  - title: 1.2 运算类型
    slug: 运算类型
    level: 1
  - title: 1.3 字符串编码与格式化
    slug: 字符串编码与格式化
    level: 1
  - title: 2. list、tuple、dict、set
    slug: listtupledictset
  - title: 2.1 容器语义
    slug: 容器语义
    level: 1
  - title: 2.2 切片
    slug: 切片
    level: 1
  - title: 3. 控制流
    slug: 控制流
  - title: 3.1 条件判断
    slug: 条件判断
    level: 1
  - title: 3.2 match / case
    slug: matchcase
    level: 1
  - title: 3.3 for / while
    slug: forwhile
    level: 1
  - title: 4. 函数
    slug: 函数
  - title: 4.1 定义与返回
    slug: 定义与返回
    level: 1
  - title: 4.2 参数模型
    slug: 参数模型
    level: 1
  - title: 4.3 类型注解
    slug: 类型注解
    level: 1
  - title: 5. 错误处理
    slug: 错误处理
  - title: 5.1 异常对象
    slug: 异常对象
    level: 1
  - title: 5.2 捕获异常
    slug: 捕获异常
    level: 1
  - title: 5.3 抛出异常
    slug: 抛出异常
    level: 1
  - title: 5.4 调试
    slug: 调试
    level: 1
  - title: 5.5 测试
    slug: 测试
    level: 1
head:
  - - meta
    - name: description
      content: Python 复习系列第一篇，在已有编程基础的前提下快速回顾对象模型、基本数据类型、字符串与编码、list/tuple/dict/set、控制流、函数定义、参数模型、类型注解、错误处理、调试与测试。
  - - meta
    - name: keywords
      content: Python, 基础, 数据类型, str, bytes, list, tuple, dict, set, 切片, match, 函数参数, 类型注解, type hints, 错误处理, 异常处理, unittest, doctest
---

Python 基础速览，为后续迭代器、生成器、装饰器、模块、OOP、并发和网络编程提供共同起点。

---

由于本文集是Python进阶相关笔记整理，因此本文将变量、循环、函数调用等概念简单带过。

## 1. 基础数据类型{#基础数据类型}

### 1.1 对象模型{#对象模型}

Python 的变量是名字绑定，不是固定类型的存储槽。赋值语句让名字指向对象，之后重新赋值只是让名字指向另一个对象。

```python
a = 123        # a 指向 int 对象
a = 'ABC'      # a 改为指向 str 对象

b = [1, 2]
c = b
b.append(3)    # c 也能看到 [1, 2, 3]

print(a, type(a).__name__)  # ABC str
print(c)                    # [1, 2, 3]
```

基础类型先按语义分组：

| 类型        | 示例                          | 要点                 |
|-----------|-----------------------------|--------------------|
| `int`     | `123`, `0xff`, `10_000_000` | 任意精度整数，不按机器字长溢出    |
| `float`   | `1.23`, `1.2e-5`            | 双精度浮点数，有舍入误差       |
| `bool`    | `True`, `False`             | 首字母大写，是布尔对象        |
| `None`    | `None`                      | 空值对象，常作哨兵值         |
| `complex` | `1 + 2j`                    | 内置复数类型             |
| `str`     | `'中文'`                      | Unicode 文本         |
| `bytes`   | `b'ABC'`                    | 字节序列，用于文件、网络和二进制数据 |

可变对象与不可变对象是后续容器、默认参数和并发语义的基础：

| 对象    | 示例                  | 修改语义               |
|-------|---------------------|--------------------|
| 不可变对象 | `int`、`str`、`tuple` | 操作通常产生新对象          |
| 可变对象  | `list`、`dict`、`set` | 原地修改会影响所有引用同一对象的名字 |

### 1.2 运算类型{#运算类型}

数值运算里需要单独记住几处差异：

| 运算   | 示例        | 结果语义          |
|------|-----------|---------------|
| `/`  | `10 / 3`  | 浮点除法          |
| `//` | `10 // 3` | 整除，向下取整       |
| `%`  | `-10 % 3` | 模运算，余数符号与除数一致 |
| `**` | `2 ** 10` | 幂运算           |

```python
print(10 / 3)    # 3.3333333333333335
print(10 // 3)   # 3
print(-10 // 3)  # -4
print(-10 % 3)   # 2
```

比较运算可以链式书写：`1 < x < 10` 等价于 `1 < x and x < 10`，但 `x` 只求值一次。

逻辑运算返回参与运算的对象本身，不强制转成 `bool`：

```python
print(0 or 'default')  # default
print('hi' and 'bye')  # bye
print([] or [1, 2])    # [1, 2]
```

常见 falsy 值包括 `False`、`None`、数值零、空字符串、空容器。赋值语句没有表达式值，不能写成 C 风格的 `if (x = get_value())`。

### 1.3 字符串编码与格式化{#字符串编码与格式化}

`str` 表示文本，内存语义是 Unicode；`bytes` 表示字节序列。文件与网络边界上经常需要显式编码和解码。

```python
raw = '中文'.encode('utf-8')

print(raw)                                                  # b'\xe4\xb8\xad\xe6\x96\x87'
print(raw.decode('utf-8'))                                  # 中文
print(b'\xe4\xb8\xad\xff'.decode('utf-8', errors='ignore')) # 中
```

`len()` 的对象不同，计数单位也不同：

```python
print(len('中文'))                  # 2
print(len('中文'.encode('utf-8')))  # 6
```

单个字符与 `Unicode` 码点用 `ord()` / `chr()` 转换：

```python
print(ord('A'))  # 65
print(chr(65))   # A
```

格式化方式保留三类：`%`、`str.format()`、f-string。新代码优先使用 f-string。

```python
name = 'World'
n = 42

print('Hello, %s. Answer: %d' % (name, n))                  # Hello, World. Answer: 42
print('Hello, {name}. Answer: {n}'.format(name=name, n=n))  # Hello, World. Answer: 42
print(f'Hello, {name}. Answer: {n}')                        # Hello, World. Answer: 42
print(f'pi = {3.14159:.2f}')                                # pi = 3.14
```

> 值得注意的是，`str` 是不可变对象，`replace()`、`strip()` 等方法都返回新字符串，不会修改原对象。

## 2. list、tuple、dict、set{#listtupledictset}

### 2.1 容器语义{#容器语义}

Python 常用容器如下：

| 类型      | 顺序     | 可变 | 核心用途            |
|---------|--------|----|-----------------|
| `list`  | 有序     | 是  | 可变序列            |
| `tuple` | 有序     | 否  | 固定结构、多返回值、可哈希组合 |
| `dict`  | 插入顺序保留 | 是  | key-value 映射    |
| `set`   | 无业务顺序  | 是  | 去重与集合运算         |

`list` 是可变序列：

```python
items = ['a', 'b', 'c']
items.append('d')
items.insert(1, 'x')
last = items.pop()

print(last)       # d
print(items)      # ['a', 'x', 'b', 'c']
print(items[-1])  # c
```

`tuple` 的不可变指元素引用不可变，不保证引用对象内部不可变：

```python
t = ('a', 'b', ['A', 'B'])
t[2][0] = 'X'  # 合法，修改的是内部 list

print(t)  # ('a', 'b', ['X', 'B'])

try:
    t[2] = ['X']
except TypeError as error:
    print(type(error).__name__)  # TypeError
```

单元素 tuple 必须写尾逗号：`(1,)` 是 tuple，`(1)` 只是整数表达式。

`dict` 与 `set` 底层依赖哈希。key 或 set 元素必须是 hashable 对象，`list` 不能作为 key，`tuple` 只有在内部元素全部可哈希时才能作为
key。

```python
d = {'a': 1, 'b': 2}
d['c'] = 3
missing = d.get('x', -1)
removed = d.pop('a')
has_b = 'b' in d

s = {1, 2, 3}
s.add(4)
s.remove(1)

print(missing, removed, has_b, d)  # -1 1 True {'b': 2, 'c': 3}
print(s & {2, 4})                  # {2, 4}
print(s | {5})                     # {2, 3, 4, 5}
```

### 2.2 切片{#切片}

切片语法是 `seq[start:stop:step]`，左闭右开，适用于 `list`、`tuple`、`str` 等序列类型。

```python
L = list(range(100))

print(L[:5])            # [0, 1, 2, 3, 4]
print(L[-3:])           # [97, 98, 99]
print(L[10:15])         # [10, 11, 12, 13, 14]
print(L[:10:2])         # [0, 2, 4, 6, 8]
print('ABCDEFG'[:3])    # ABC
print('ABCDEFG'[::-1])  # GFEDCBA
```

切片返回同类序列：切 `tuple` 得到 `tuple`，切 `str` 得到 `str`。`L[:]` 只复制外层容器，内部对象仍共享引用。

## 3. 控制流{#控制流}

### 3.1 条件判断{#条件判断}

`if / elif / else` 从上到下匹配，命中一个分支后不再检查后续分支。Python 用缩进定义代码块，空块用 `pass` 占位。

```python
x = 0

if x > 0:
    result = 'positive'
elif x == 0:
    result = 'zero'
else:
    result = 'negative'

birth_text = '1999'
birth = int(birth_text)
label = '00前' if birth < 2000 else '00后'

print(result)  # zero
print(label)   # 00前
```

条件表达式写成 `a if cond else b`。`input()` 返回 `str`，参与数值比较前要显式转换；上面的 `birth_text` 可以理解为一次输入结果。

### 3.2 match / case{#matchcase}

`match / case` 是结构化模式匹配，不是简单的 C 风格 `switch`。它不会 fall-through，`case _` 表示兜底匹配。

```python
def parse_command(args):
    match args:
        case ['gcc']:
            return 'gcc: missing source file'
        case ['gcc', file1, *files]:
            return f'compile: {file1}, {files}'
        case ['clean']:
            return 'clean'
        case _:
            return 'invalid'

print(parse_command(['gcc']))                   # gcc: missing source file
print(parse_command(['gcc', 'main.c', 'util.c'])) # compile: main.c, ['util.c']
print(parse_command(['clean']))                 # clean
```

常用模式：

| 写法                            | 含义                       |
|-------------------------------|--------------------------|
| `case _`                      | 匹配任意值                    |
| `case 11 \| 12 \| 13`         | 匹配多个字面值                  |
| `case x if x < 10`            | 绑定变量并附加守卫条件              |
| `case ['gcc', file1, *files]` | 匹配序列结构，并把剩余元素打包到 `files` |

### 3.3 for / while{#forwhile}

Python 的 `for` 面向可迭代对象，Python 无 C 风格的三段式循环。

```python
items = ['a', 'b', 'c']

for item in items:
    print(item)  # 依次输出 a、b、c

for i in range(3):  # 0..2
    print(i)     # 依次输出 0、1、2
```

`while` 用条件控制循环退出：

```python
n = 3
while n > 0:
    print(n)  # 依次输出 3、2、1
    n -= 1
```

`range(start, stop, step)` 不包含 `stop`。`break` 终止当前循环，`continue` 跳过本轮。

`for` 和 `while` 都支持 `else` 子句：循环没有被 `break` 中断时执行。

```python
for n in range(2, 10):
    for x in range(2, n):
        if n % x == 0:
            break
    else:
        print(f'{n} is prime')  # 依次输出 2、3、5、7 is prime
```

循环 `else` 容易被误读，只在“搜索失败后处理”这类场景保留，普通循环不必强行使用。

## 4. 函数{#函数}

### 4.1 定义与返回{#定义与返回}

函数用 `def` 定义，`return` 结束函数并返回结果。没有显式 `return` 时返回 `None`。

```python
def add(a, b):
    return a + b

print(add(1, 2))  # 3
```

返回多个值本质是返回一个 tuple，只是语法上允许直接拆包：

```python
def divmod_custom(a, b):
    return a // b, a % b

q, r = divmod_custom(10, 3)
print(q, r)                  # 3 1
print(divmod_custom(10, 3))  # (3, 1)
```

函数名本身是对象引用，可以赋值、传参，也可以在必要时用 `isinstance()` 做显式参数检查。

```python
def my_abs(x):
    if not isinstance(x, (int, float)):
        raise TypeError('bad operand type')
    return x if x >= 0 else -x

print(my_abs(-3.5))  # 3.5

try:
    my_abs('x')
except TypeError as error:
    print(error)     # bad operand type
```

### 4.2 参数模型{#参数模型}

Python 函数参数的定义顺序固定为：位置参数、默认参数、可变位置参数、命名关键字参数、可变关键字参数。

| 类型      | 语法        | 函数内部对象  | 作用        |
|---------|-----------|---------|-----------|
| 位置参数    | `a`       | 参数对象本身  | 按位置传入     |
| 默认参数    | `a=1`     | 参数对象本身  | 调用时可省略    |
| 可变位置参数  | `*args`   | `tuple` | 接收额外位置实参  |
| 命名关键字参数 | `*, city` | 参数对象本身  | 只能按关键字传入  |
| 可变关键字参数 | `**kw`    | `dict`  | 接收额外关键字实参 |

```python
def f(a, b=0, *args, city='Shanghai', **kw):
    return a, b, args, city, kw

print(f(1, city='Beijing'))                          # (1, 0, (), 'Beijing', {})
print(f(1, 2, 3, 4, city='Hangzhou', debug=True))     # (1, 2, (3, 4), 'Hangzhou', {'debug': True})
```

**默认参数**用于给低频变化项提供缺省值，**命名关键字参数**用于指定赋值的目标参数：

```python
def connect(host, port=5432, *, timeout=3, ssl=False):
    return {
        'host': host,
        'port': port,
        'timeout': timeout,
        'ssl': ssl,
    }

print(connect('localhost'))                           # {'host': 'localhost', 'port': 5432, 'timeout': 3, 'ssl': False}
print(connect('localhost', 15432, timeout=10, ssl=True)) # {'host': 'localhost', 'port': 15432, 'timeout': 10, 'ssl': True}
```

**默认参数**只在函数定义时求值一次。**可变对象不应该直接作为默认值**：

```python
def bad(values=[]):
    values.append('END')
    return values

print(bad())  # ['END']
print(bad())  # ['END', 'END']
```

> 由于默认参数只在函数定义时求值一次，因此代码中应该将其作为**只读**的变量使用。

而应该使用 `None` 做哨兵值：

```python
def good(values=None):
    if values is None:
        values = []
    values.append('END')
    return values

print(good())            # ['END']
print(good())            # ['END']
print(good(['BEGIN']))   # ['BEGIN', 'END']
```

`*` 和 `**` 在函数定义与函数调用时方向相反：

| 场景   | 写法             | 含义               |
|------|----------------|------------------|
| 定义函数 | `def f(*args)` | 把多余位置实参打包成 tuple |
| 定义函数 | `def f(**kw)`  | 把多余关键字实参打包成 dict |
| 调用函数 | `f(*items)`    | 把可迭代对象展开为位置实参    |
| 调用函数 | `f(**config)`  | 把 dict 展开为关键字实参  |

```python
def calc(a, b, c):
    return a + b + c

def person(name, age, **profile):
    return name, age, profile

nums = [1, 2, 3]
print(calc(*nums))  # 6

config = {'city': 'Beijing', 'job': 'Engineer'}
print(person('Jack', 24, **config))  # ('Jack', 24, {'city': 'Beijing', 'job': 'Engineer'})
```

### 4.3 类型注解{#类型注解}

类型注解（`type hints`）是给静态检查器、IDE 和文档使用的类型元数据。Python 解释器默认不按注解做运行时类型检查。

| 写法               | 含义                               |
|------------------|----------------------------------|
| `x: int`         | 变量或参数期望是 `int`                   |
| `-> str`         | 函数期望返回 `str`                     |
| `str \| None`    | 值可能是 `str`，也可能是 `None`           |
| `list[int]`      | 元素类型为 `int` 的 list               |
| `dict[str, int]` | key 为 `str`、value 为 `int` 的 dict |
| `Iterable[int]`  | 可遍历出 `int` 的对象，不要求一定是 list       |

```python
def add(x: int, y: int) -> int:
    return x + y

print(add(1, 2))        # 3
print(add('a', 'b'))    # ab
print(add.__annotations__)  # {'x': <class 'int'>, 'y': <class 'int'>, 'return': <class 'int'>}
```

上例里 `add('a', 'b')` 仍能运行，因为 `+` 对字符串也有定义。类型注解不会在运行时起作用。

变量和容器也可以加注解：

```python
name: str = 'Alice'
age: int = 20
scores: dict[str, int] = {'math': 95, 'english': 88}
point: tuple[float, float] = (1.0, 2.0)
tags: set[str] = {'python', 'note'}

print(scores['math'])  # 95
```

`|` 表示联合类型，常用于“可能返回 `None`”的接口：

```python
def find_user(user_id: int) -> str | None:
    if user_id == 0:
        return 'root'
    return None

print(find_user(0))  # root
print(find_user(1))  # None
```

参数类型可以写具体容器，也可以写抽象接口（基类型）。只读遍历时用 `Iterable` 这类基类型，能让函数接收更多对象：

```python
from collections.abc import Iterable

def total(values: Iterable[int]) -> int:
    return sum(values)

print(total([1, 2, 3]))      # 6
print(total((1, 2, 3)))      # 6
print(total(range(1, 4)))    # 6
```

复杂类型可以提取成类型别名，避免函数签名过长：

```python
type UserRecord = dict[str, str | int]

def format_user(user: UserRecord) -> str:
    return f"{user['name']} {user['id']}"

print(format_user({'name': 'Alice', 'id': 1}))  # Alice 1
```

## 5. 错误处理{#错误处理}

异常处理（exception handling）用于表达函数无法按正常路径返回结果。调试用于定位错误发生的位置和状态。测试用于把已经确认的行为固定下来，避免后续修改破坏原有约定。

### 5.1 异常对象{#异常对象}

Python 中的异常是对象。内置异常类型都继承自 `BaseException`，业务代码通常捕获或继承 `Exception` 这一支。

```python
def divide(text: str) -> float:
    return 10 / int(text)

def describe_call(text: str) -> str:
    try:
        return f'result={divide(text):g}'
    except Exception as exc:
        return type(exc).__name__

print(describe_call('2')) # result=5
print(describe_call('0')) # ZeroDivisionError
print(describe_call('x')) # ValueError
```

常见异常类型如下：

| 异常类型                | 常见来源                        |
|---------------------|-----------------------------|
| `ValueError`        | 值的类型正确，但内容不合法，例如 `int('x')` |
| `TypeError`         | 参数类型不符合接口要求                 |
| `KeyError`          | 字典缺少指定 key                  |
| `AttributeError`    | 对象缺少指定成员                    |
| `IndexError`        | 序列下标越界                      |
| `ZeroDivisionError` | 除数为 0                       |
| `AssertionError`    | `assert` 条件失败               |

异常没有被当前函数捕获时，会沿调用栈继续向上抛出。最终无人捕获时，解释器打印 traceback 并终止程序。

```python
import traceback

def parse_number(text: str) -> int:
    return int(text)

def calculate(text: str) -> float:
    return 10 / parse_number(text)

try:
    calculate('0')
except Exception:
    lines = traceback.format_exc().splitlines()
    print(lines[-1])                       # ZeroDivisionError: division by zero
    print('calculate' in ''.join(lines))   # True
```

### 5.2 捕获异常{#捕获异常}

`try` 包住可能失败的代码，`except` 处理指定类型的异常。异常一旦发生，`try` 块中后续语句不会继续执行。

```python
def parse_ratio(text: str) -> list[str]:
    events: list[str] = []

    try:
        events.append('try')
        value = 10 / int(text)
        events.append(f'result={value:g}')
    except ValueError:
        events.append('ValueError')
    except ZeroDivisionError:
        events.append('ZeroDivisionError')

    return events

print(parse_ratio('2')) # ['try', 'result=5']
print(parse_ratio('x')) # ['try', 'ValueError']
print(parse_ratio('0')) # ['try', 'ZeroDivisionError']
```

`else` 只在 `try` 块没有抛异常时执行。`finally` 无论是否抛异常都会执行，适合释放资源、恢复状态、关闭连接。

```python
def flow(text: str) -> list[str]:
    events: list[str] = []

    try:
        events.append('try')
        value = 10 / int(text)
    except ValueError:
        events.append('except')
    else:
        events.append(f'else={value:g}')
    finally:
        events.append('finally')

    return events

print(flow('2')) # ['try', 'else=5', 'finally']
print(flow('x')) # ['try', 'except', 'finally']
```

多个 `except` 按顺序检查，父类异常放在前面会遮住子类异常。捕获顺序应从具体到宽泛。

```python
def catch_by_order(exc: Exception) -> str:
    try:
        raise exc
    except ValueError:
        return 'ValueError'
    except UnicodeError:
        return 'UnicodeError'

def catch_precisely(exc: Exception) -> str:
    try:
        raise exc
    except UnicodeError:
        return 'UnicodeError'
    except ValueError:
        return 'ValueError'

print(issubclass(UnicodeError, ValueError)) # True
print(catch_by_order(UnicodeError()))       # ValueError
print(catch_precisely(UnicodeError()))      # UnicodeError
```

业务代码中很少需要直接捕获 `BaseException`，因为它还包含 `KeyboardInterrupt`、`SystemExit` 等不应被普通业务逻辑吞掉的异常。

### 5.3 抛出异常{#抛出异常}

`raise` 用来主动抛出异常。函数发现参数违反契约时，应尽早抛出清晰的异常。

```python
def port_from(text: str) -> int:
    port = int(text)
    if port <= 0 or port > 65535:
        raise ValueError(f'invalid port: {text}')
    return port

print(port_from('8080')) # 8080

try:
    port_from('0')
except ValueError as exc:
    print(str(exc))      # invalid port: 0
```

自定义异常通常继承自 `Exception` 或某个更具体的内置异常。异常类名一般以 `Error` 结尾。

```python
class ConfigError(ValueError):
    pass

def read_timeout(value: str) -> int:
    timeout = int(value)
    if timeout <= 0:
        raise ConfigError(f'invalid timeout: {value}')
    return timeout

try:
    read_timeout('-1')
except ConfigError as exc:
    print(type(exc).__name__) # ConfigError
    print(str(exc))           # invalid timeout: -1
```

捕获异常后，如果当前层只负责记录，不负责恢复，可以用裸 `raise` 原样抛出当前异常。如果需要把底层异常转换成更贴近当前接口的异常，用
`raise ... from exc` 保留原因链。

```python
class ConfigError(ValueError):
    pass

def load_port(text: str) -> int:
    try:
        return int(text)
    except ValueError as exc:
        raise ConfigError('port must be an integer') from exc

try:
    load_port('abc')
except ConfigError as exc:
    print(type(exc).__name__)           # ConfigError
    print(type(exc.__cause__).__name__) # ValueError
```

### 5.4 调试{#调试}

`logging.exception()` 在 `except` 块中记录异常信息和 traceback。它适合“记录后继续抛出”或“记录后进入降级路径”。

```python
import io
import logging

stream = io.StringIO()
handler = logging.StreamHandler(stream)
logger = logging.getLogger('demo-error')
logger.handlers[:] = [handler]
logger.propagate = False
logger.setLevel(logging.ERROR)

try:
    10 / 0
except ZeroDivisionError:
    logger.exception('calculate failed')

log_text = stream.getvalue()

print('calculate failed' in log_text) # True
print('ZeroDivisionError' in log_text) # True
```

`assert` 用来声明开发期不变量。条件为假时抛出 `AssertionError`。

```python
def inverse(n: int) -> float:
    assert n != 0, 'n is zero'
    return 1 / n

print(inverse(2)) # 0.5

try:
    inverse(0)
except AssertionError as exc:
    print(str(exc)) # n is zero
```

`assert` 可以被 `python -O` 关闭，关闭后断言语句不会执行，因此不能替代运行期参数校验。

### 5.5 测试{#测试}

`unittest` 把测试组织成 `TestCase` 类。以 `test_` 开头的方法会被测试运行器识别，异常也是接口契约的一部分，可以用
`assertRaises()` 断言。

```python
import unittest

class Grade:
    def __init__(self, score: int) -> None:
        self.score = score

    def value(self) -> str:
        if self.score < 0 or self.score > 100:
            raise ValueError('score out of range')
        if self.score >= 80:
            return 'A'
        if self.score >= 60:
            return 'B'
        return 'C'

class TestGrade(unittest.TestCase):
    def test_grade(self) -> None:
        self.assertEqual(Grade(80).value(), 'A')
        self.assertEqual(Grade(60).value(), 'B')
        self.assertEqual(Grade(59).value(), 'C')

    def test_invalid_score(self) -> None:
        with self.assertRaises(ValueError):
            Grade(101).value()

suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestGrade)
result = unittest.TestResult()
suite.run(result)

print(result.testsRun)        # 2
print(result.wasSuccessful()) # True
```

测试文件可以直接运行，也可以通过 `python -m unittest` 运行。后一种方式更适合批量执行和持续集成。

```bash
python mydict_test.py
python -m unittest mydict_test
python -m unittest mydict_test.TestDict.test_attr
python -m unittest mydict_test -k attr -v
```

`doctest` 从**文档注释**中提取交互式示例并执行。一般用于短小稳定的调用示例。

```python
import doctest

def absolute(n: int) -> int:
    """
    >>> absolute(1)
    1
    >>> absolute(-1)
    1
    """
    return n if n >= 0 else -n

result = doctest.testmod(verbose=False)

print(result.failed)    # 0
print(result.attempted) # 2
```
