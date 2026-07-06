---
title: Python 迭代与生成器
date: 2026-07-05T01:00:00
tags: [ Python ]
pinned: false
collection: 深入理解 Python
outline:
  - title: 1. 迭代协议
    slug: 迭代协议
  - title: 1.1 可迭代对象与迭代器
    slug: 可迭代对象与迭代器
    level: 1
  - title: 1.2 迭代入口与取值函数
    slug: 迭代入口与取值函数
    level: 1
  - title: 1.3 循环语句的执行模型
    slug: 循环语句的执行模型
    level: 1
  - title: 2. 内建可迭代对象
    slug: 内建可迭代对象
  - title: 2.1 内建容器类型
    slug: 内建容器类型
    level: 1
  - title: 2.2 解包
    slug: 解包
    level: 1
  - title: 2.3 索引枚举
    slug: 索引枚举
    level: 1
  - title: 3. 序列转换工具
    slug: 序列转换工具
  - title: 3.1 map/filter
    slug: 映射与过滤
    level: 1
  - title: 3.2 reduce
    slug: 归约
    level: 1
  - title: 3.3 sort
    slug: 排序
    level: 1
  - title: 4. 自定义可迭代对象
    slug: 自定义可迭代对象
  - title: 4.1 列表推导式
    slug: 列表推导式
    level: 1
  - title: 4.2 生成器表达式
    slug: 生成器表达式
    level: 1
  - title: 4.3 yield与生成器函数
    slug: yield与生成器函数
    level: 1
  - title: 4.4 自定义迭代器
    slug: 自定义迭代器
    level: 1
  - title: 4.5 状态保持
    slug: 状态保持
    level: 1
  - title: 5. 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: Python 复习系列第二篇，整理 Iterable、Iterator、iter/next、for in 执行模型、内建可迭代类型、推导式、map/filter/reduce/sorted、generator 与自定义迭代器。
  - - meta
    - name: keywords
      content: Python, 迭代, Iterable, Iterator, __iter__, __next__, next, generator, yield, 列表生成式, map, filter, reduce, sorted
---

本篇整理 Python 中可迭代对象（`Iterable`）与迭代器（`Iterator`）的关系，以及 `for ... in ...` 背后的协议。

---

Python 的 `for ... in ...` 迭代先通过 `iter()` 交出迭代器（iterator），再由 `next()` 不断取下一个值，直到 `StopIteration` 结束。

## 1. 迭代协议{#迭代协议}

### 1.1 可迭代对象与迭代器{#可迭代对象与迭代器}

可迭代对象的英文原文是 `Iterable`，表示对象可以交出迭代器。它的核心接口是 `__iter__()`，该方法应该返回一个 `Iterator`。

```python
class Iterable(metaclass=ABCMeta):
    @abstractmethod
    def __iter__(self):
        while False:
            yield None  
```

迭代器的英文原文是 `Iterator`，表示对象本身就是一个数据流。它同时实现两个接口：

```python
class Iterator(Iterable):
    @abstractmethod
    def __next__(self):
        'Return the next item from the iterator. When exhausted, raise StopIteration'
        raise StopIteration

    def __iter__(self):
        return self
```

| 接口           | 作用                                                          |
|--------------|-------------------------------------------------------------|
| `__iter__()` | 返回`Iterator`实例，在`Iterator`中返回自身，使`Iterator`也能作为`Iterable`使用 |
| `__next__()` | 返回下一个元素；没有元素时抛出 `StopIteration`                             |

`Iterator` 一定是 `Iterable`，因为它能返回自身作为迭代入口；`Iterable` 不一定是 `Iterator`，因为它可能只负责创建一个新的
iterator。

```python
from collections.abc import Iterable, Iterator

data = [1, 2, 3] # Python 中的 list 是 Iterable
stream = iter(data) # 使用 __iter__() 将 Iterable 转化为 Iterator

print(isinstance(data, Iterable))    # True
print(isinstance(data, Iterator))    # False
print(isinstance(stream, Iterable))  # True
print(isinstance(stream, Iterator))  # True
```

> #### 补充
> `Iterable`/`Iterator` 是**协议类**，也就是说
>
> - 只要实现了`__iter__`方法，便是一个`Iterable`
> - 只要实现了`__iter__`方法与`__next__`方法，便是一个`Iterator`
>
> 例如，如下代码中，第一个`print`将输出`True`，但第二个`print`输出`False`，即使`B`类型并没有继承自`Iterable`。
>
> ```python
> from collections.abc import Iterable
> 
> class A:
>     num: int = 0
> 
> class B:
>     num: int = 0
> 
>     def __iter__(self):
>         pass
> 
> print(isinstance(B(), Iterable))  # True
> print(isinstance(B(), A))         # False
> ```

### 1.2 迭代入口与取值函数{#迭代入口与取值函数}

迭代入口函数是 `iter()`，取值函数是 `next()`。`iter(iterable)` 向 iterable 请求 iterator，实际上调用对象的`__iter__()`方法；
`next(iterator)` 向 iterator 请求下一个值，实际上调用对象的
`__next__()`方法。

```python
it = iter(['A', 'B'])

print(next(it))  # A
print(next(it))  # B
```

当 iterator 耗尽时，`next()` 会抛出 `StopIteration`：

```python
it = iter([1])

print(next(it))  # 1

try:
    next(it)
except StopIteration:
    print('empty')  # empty
```

`Iterator` 是一次性对象。被消费过的元素不会重新出现；需要重新遍历时要重新调用 `iter()` 或重新创建 iterator。

### 1.3 循环语句的执行模型{#循环语句的执行模型}

这里的循环语句指 `for ... in ...`。它会先把右侧对象转换为 iterator，然后不断调用 `next()` 直到尾部：

```python
for value in [1, 2, 3]:
    print(value)  # 依次输出 1、2、3
```

等价于

```python
it = iter([1, 2, 3])  # 转化为 Iterator

while True:
    try:
        value = next(it) # 不断调用 next()
    except StopIteration:
        break
    print(value)  # 依次输出 1、2、3
```

因此，`for` 循环只要求它是一个`Iterable`，能通过 `iter()` 交出一个 iterator，然后使用 `next()` 遍历直到尾部。

## 2. 内建可迭代对象{#内建可迭代对象}

### 2.1 内建容器类型{#内建容器类型}

这里以内建容器类型 `list`、`tuple`、`str`、`dict` 为例。常见内建容器都是 `Iterable`：

```python
from collections.abc import Iterable

print(isinstance([1, 2], Iterable))      # True
print(isinstance((1, 2), Iterable))      # True
print(isinstance('AB', Iterable))        # True
print(isinstance({'a': 1}, Iterable))    # True
print(isinstance(123, Iterable))         # False
```

但不一定是`Iterator`：

```python
from collections.abc import Iterator

print(isinstance([1, 2], Iterator))      # False
print(isinstance((1, 2), Iterator))      # False
print(isinstance('AB', Iterator))        # False
print(isinstance({'a': 1}, Iterator))    # False
print(isinstance(123, Iterator))         # False
```

`str` 迭代字符：

```python
for ch in 'ABC':
    print(ch)  # 依次输出 A、B、C
```

`dict` 默认迭代 key；要迭代 value 或 key-value 对，需要显式使用 `.values()` 或 `.items()`。

```python
d = {'a': 1, 'b': 2}

for key in d:
    print(key)  # 依次输出 a、b

for key, value in d.items():
    print(key, value)  # 依次输出 a 1、b 2
```

### 2.2 解包{#解包}

多个变量的迭代依赖解包，元素结构要与变量个数匹配：

```python
pairs = [(1, 1), (2, 4), (3, 9)]

for x, y in pairs:
    print(x, y)  # 依次输出 1 1、2 4、3 9
```

`dict.items()` 返回的就是可迭代的二元组序列，因此可以直接写成 `for key, value in ...`。

```python
items = {'a': 1, 'b': 2}.items()

for key, value in items:
    print(key, value)  # 依次输出 a 1、b 2
```

解包不是 `for` 循环的专属语法，普通赋值也可以使用：

```python
x, y = (10, 20)
print(x, y)  # 10 20
```

### 2.3 索引枚举{#索引枚举}

`for ... in ...` 本身不返回下标，只返回 `next()` 方法产出的值：

```python
for value in ['A', 'B', 'C']:
    print(value)  # 依次输出 A、B、C
```

需要下标时使用索引枚举函数 `enumerate()`：

```python
for index, value in enumerate(['A', 'B', 'C']):
    print(index, value)  # 依次输出 0 A、1 B、2 C
```

`enumerate(iterable)` 会返回一个 iterator ，`next()` 每次产出 `tuple[int, T]`。`for index, value in ...` 再把这个二元组解包成
`index` 与 `value`。

```python
from collections.abc import Iterable, Iterator
from typing import TypeVar

T = TypeVar('T')

class Enumerate(Iterator[tuple[int, T]]):
    def __init__(self, iterable: Iterable[T], start: int = 0):
        self.index = start
        self.iterator = iter(iterable)

    def __next__(self) -> tuple[int, T]:
        value = next(self.iterator)
        current = self.index
        self.index += 1
        return current, value

print(list(Enumerate(['A', 'B'])))  # [(0, 'A'), (1, 'B')]
```

## 3. 序列转换工具{#序列转换工具}

### 3.1 map/filter{#映射与过滤}

。`map(func, iterable)` 把函数应用到每个元素，返回惰性 iterator。

```python
def square(x: int) -> int:
    return x * x

mapped = map(square, [1, 2, 3])

print(type(mapped).__name__)  # map
print(list(mapped))           # [1, 4, 9]
```

`filter(func, iterable)` 根据谓词函数的真假值保留元素，也返回惰性 iterator。

```python
def is_odd(x: int) -> bool:
    return x % 2 == 1

filtered = filter(is_odd, [1, 2, 3, 4, 5])
print(list(filtered))  # [1, 3, 5]
```

清理空字符串时，谓词函数返回 truthy/falsy 值即可：

```python
def not_empty(value: str | None) -> bool:
    return bool(value and value.strip())

items = filter(not_empty, ['A', '', 'B', None, '  ', 'C'])
print(list(items))  # ['A', 'B', 'C']
```

`map` 和 `filter` 的结果都是 iterator，被 `list()` 消费一次后就没有剩余元素。

```python
def is_even(x: int) -> bool:
    return x % 2 == 0

filtered = filter(is_even, [1, 2, 3, 4, 5])
print(list(filtered))  # [2, 4]
print(next(filtered)) # 抛出 StopIteration 异常
```

### 3.2 reduce{#归约}

`reduce(func, iterable)` 把二元函数连续应用到累计值和下一个元素上，最终得到单个结果。

```python
from functools import reduce

def combine(acc: int, next: int) -> int:
    return acc * 10 + next

print(reduce(combine, [1, 3, 5, 7, 9]))  # 13579
```

`reduce` 适合表达累计折叠。普通求和直接用 `sum()` 更清楚；需要自定义累计状态时再考虑 `reduce`。

```python
from functools import reduce

digits = {'0': 0, '1': 1, '2': 2, '3': 3}

def char_to_num(ch: str) -> int:
    return digits[ch]

def str_to_int(text: str) -> int:
    return reduce(lambda x, y: x * 10 + y, map(char_to_num, text))

print(str_to_int('123'))  # 123
```

### 3.3 sort{#排序}

`sorted(iterable)` 返回新 list（而不是iterator），不修改原对象。`key` 方法负责把每个元素映射为排序依据。

```python
nums = [36, 5, -12, 9, -21]

print(sorted(nums))           # [-21, -12, 5, 9, 36]
print(sorted(nums, key=abs))  # [5, 9, -12, -21, 36]
print(nums)                   # [36, 5, -12, 9, -21]
```

字符串默认按码点排序，大小写会影响结果。忽略大小写时传入 `str.lower`：

```python
names = ['bob', 'about', 'Zoo', 'Credit']

print(sorted(names))                              # ['Credit', 'Zoo', 'about', 'bob']
print(sorted(names, key=str.lower))               # ['about', 'bob', 'Credit', 'Zoo']
print(sorted(names, key=str.lower, reverse=True)) # ['Zoo', 'Credit', 'bob', 'about']
```

对结构化数据排序时，`key` 应直接指向排序字段：

```python
students = [('Bob', 75), ('Adam', 92), ('Bart', 66), ('Lisa', 88)]

print(sorted(students, key=lambda item: item[0]))               # [('Adam', 92), ('Bart', 66), ('Bob', 75), ('Lisa', 88)]
print(sorted(students, key=lambda item: item[1], reverse=True)) # [('Adam', 92), ('Lisa', 88), ('Bob', 75), ('Bart', 66)]
```

## 4. 自定义可迭代对象{#自定义可迭代对象}

### 4.1 列表推导式{#列表推导式}

列表推导式的英文原文是 list comprehension。它把“从一个 iterable 映射出一个 list”的模式压缩成表达式，类似于 `filter` 与
`map` 的组合。

```python
squares = [x * x for x in range(1, 6)]
print(squares)  # [1, 4, 9, 16, 25]
```

`for` 后面的 `if` 是过滤条件：

```python
even_squares = [x * x for x in range(1, 11) if x % 2 == 0]
print(even_squares)  # [4, 16, 36, 64, 100]
```

`for` 前面的 `if ... else ...` 是映射表达式，决定每个输入元素映射成什么：

```python
items = [x if x % 2 == 0 else -x for x in range(1, 6)]
print(items)  # [-1, 2, -3, 4, -5]
```

多层循环按从左到右的嵌套顺序展开：

```python
items = [m + n for m in 'AB' for n in 'XY']
print(items)  # ['AX', 'AY', 'BX', 'BY']
```

### 4.2 生成器表达式{#生成器表达式}

生成器表达式的英文原文是 generator expression。把列表推导式的 `[]` 换成 `()`，得到的就是生成器表达式。它不立即构造完整
list，而是生成一个Iterator对象，按需获取。

```python
from collections.abc import Iterator, Iterable

squares = (x * x for x in range(5)) # Iterator
squaresList = [x * x for x in range(5)] # list

print(isinstance(squares, Iterator))  # True
print(isinstance(squaresList, Iterator))  # False
print(isinstance(squaresList, Iterable))  # True

print(next(squares))                  # 0
print(next(squares))                  # 1
print(list(squares))                  # [4, 9, 16]
```

因为返回的是Iterator对象而非Iterable对象，所以 generator expression 是一次性数据流。已经取出的元素不会重新出现；需要重新遍历时要重新创建。

### 4.3 yield与生成器函数{#yield与生成器函数}

生成器函数的英文原文是 generator function。函数体里出现 `yield`，调用函数时不会整个执行函数体，而是创建一个 Iterator 对象。每次
`next()` 让函数运行到下一个 `yield`，并在该位置暂停。

```python
def odd():
    print('step 1')  # 第一次 next 时输出
    yield 1
    print('step 2')  # 第二次 next 时输出
    yield 3
    print('step 3')  # 第三次 next 时输出
    yield 5

g = odd() # Iterator对象
print(isinstance(g, Iterable)) # True
print(isinstance(g, Iterator)) # True
print(next(g))  # 先输出 step 1，再输出 1
print(next(g))  # 先输出 step 2，再输出 3
print(next(g))  # 先输出 step 3，再输出 5
```

`yield` 保存函数内部状态，下次继续从暂停点向后执行。函数执行到末尾或遇到 `return` 后，后续 `next()` 会触发 `StopIteration`。

```python
g = odd()

while True:
    try:
        print(next(g))  # 依次输出 1、3、5
    except StopIteration:
        print('done')   # generator 耗尽后输出
        break
```

普通 `for` 循环会自动处理 `StopIteration`，因此大多数场景不手动写上面的循环。

### 4.4 自定义迭代器{#自定义迭代器}

直接写迭代器（Iterator）类时，`__iter__()` 返回自身，`__next__()` 推进内部状态。

```python
from collections.abc import Iterator

class Countdown:
    def __init__(self, start: int):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value

counter = Countdown(3)

print(isinstance(counter, Iterable))  # True
print(isinstance(counter, Iterator))  # True
print(list(counter))                  # [3, 2, 1]
print(list(counter))                  # []
```

最后一行为空 list，因为 `counter` 本身就是 iterator，第一次 `list(counter)` 已经把它推进到末尾。

只需要“可重复遍历”的对象时，让 `__iter__()` 每次返回新的 iterator：

```python
class CountdownRange:
    def __init__(self, start: int):
        self.start = start

    def __iter__(self):
        return iter(range(self.start, 0, -1))

numbers = CountdownRange(3)

print(isinstance(numbers, Iterable))  # True
print(isinstance(numbers, Iterator))  # False
print(list(numbers))  # [3, 2, 1]
print(list(numbers))  # [3, 2, 1]
```

### 4.5 状态保持{#状态保持}

生成器适合表达“当前状态可以推导出下一项”的序列。斐波那契数列只需要保存两个相邻值：

```python
def fib(limit: int):
    a, b = 0, 1
    for _ in range(limit):
        a, b = b, a + b
        yield a

print(list(fib(6)))  # [1, 1, 2, 3, 5, 8]
```

杨辉三角每一行由上一行推导得到，也适合写成生成器：

```python
def triangles():
    row = [1]
    while True:
        yield row
        row = [1] + [row[i] + row[i + 1] for i in range(len(row) - 1)] + [1]

g = triangles()
print(next(g))  # [1]
print(next(g))  # [1, 1]
print(next(g))  # [1, 2, 1]
```

这里每次都把 `row` 赋值为新 list，所以已经产出的行不会被后续计算原地改写。若复用同一个 list 并原地修改，就要小心外部保存的引用也会变化。

## 5. 小结{#小结}

本篇主线是 Python 的迭代协议：`Iterable` 通过 `__iter__()` 交出 iterator，`Iterator` 通过 `__next__()` 按需产出值并用
`StopIteration` 表示结束。

内建容器提供了可迭代对象的常见实例；`enumerate()`、推导式、`map/filter/reduce/sorted` 都围绕 `Iterable` 做转换；generator
expression、generator function 和自定义类则是构造 `Iterable` 或 `Iterable` 的常用方式。
