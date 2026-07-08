---
title: Python 面向对象基础
date: 2026-07-06T04:00:00
tags: [ Python ]
pinned: false
collection: 深入理解 Python
outline:
  - title: 1. 类与实例
    slug: 类与实例
  - title: 1.1 类对象
    slug: 类对象
    level: 1
  - title: 1.2 实例对象
    slug: 实例对象
    level: 1
  - title: 1.3 方法绑定
    slug: 方法绑定
    level: 1
  - title: 2. 成员
    slug: 成员
  - title: 2.1 实例成员
    slug: 实例成员
    level: 1
  - title: 2.2 类成员
    slug: 类成员
    level: 1
  - title: 2.3 访问约定
    slug: 访问约定
    level: 1
  - title: 3. 继承与多态
    slug: 继承与多态
  - title: 3.1 继承关系
    slug: 继承关系
    level: 1
  - title: 3.2 方法覆盖
    slug: 方法覆盖
    level: 1
  - title: 3.3 结构协议
    slug: 结构协议
    level: 1
  - title: 3.4 多重继承
    slug: 多重继承
    level: 1
  - title: 4. 对象检查
    slug: 对象检查
  - title: 4.1 type 与 isinstance
    slug: type与isinstance
    level: 1
  - title: 4.2 dir 与 getattr
    slug: dir与getattr
    level: 1
  - title: 5. 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: Python 复习系列第五篇，整理类对象、实例对象、成员访问、继承、多态、结构协议、Mixin、type、isinstance、dir 与 getattr。
  - - meta
    - name: keywords
      content: Python, 面向对象基础, OOP, class, object, instance, attribute, isinstance, duck typing, Protocol, Mixin
---

本篇整理 Python 面向对象基础：类对象、实例对象、成员访问、继承多态和对象检查。

---

在 Python 中，类本身也是运行期对象，实例成员默认是动态绑定。基础篇先关注类、实例、成员和继承关系；方法修饰器、双下划线成员、枚举和元类放到《Python
面向对象进阶》。

## 1. 类与实例{#类与实例}

### 1.1 类对象{#类对象}

`class` 语句执行后会创建一个类对象，并把类名绑定到这个对象上。类对象可以被调用，调用结果是实例对象。

```python
class Student:
    pass

s = Student()

print(type(Student).__name__)  # type
print(type(s).__name__)        # Student
print(Student.__name__)        # Student
```

在 Python 3 中，不显式写父类时，类也默认继承自 `object`。

```python
class Student:
    pass

print(issubclass(Student, object))  # True
print(isinstance(Student, object))  # True
print(isinstance(Student, type))    # True
print(isinstance(Student(), object)) # True
```

类对象的类型是 `type`。普通实例由类创建，普通类默认继承自 `object`；类对象通常由 `type` 创建，如果指定元类，则由 `type`
的子类创建。

### 1.2 实例对象{#实例对象}

实例是类调用后的结果。`__init__()` 在实例创建后初始化实例状态，第一个参数通常命名为 `self`，指向当前实例。

```python
class Student:
    def __init__(self, name: str, score: int) -> None:
        self.name = name
        self.score = score

    def grade(self) -> str:
        if self.score >= 90:
            return 'A'
        if self.score >= 60:
            return 'B'
        return 'C'

bart = Student('Bart', 59)
lisa = Student('Lisa', 99)

print(bart.name, bart.grade())  # Bart C
print(lisa.name, lisa.grade())  # Lisa A

bart.age = 8

print(bart.__dict__)         # {'name': 'Bart', 'score': 59, 'age': 8}
print(hasattr(lisa, 'age'))  # False
```

`self.name` 和 `self.score` 是实例成员。不同实例持有各自的成员字典，互不共享。

### 1.3 方法绑定{#方法绑定}

定义在类中的函数，通过实例访问时会变成绑定方法（bound method）。绑定方法已经记住了实例，所以调用时不需要手动传入 `self`。

```python
class Counter:
    def __init__(self) -> None:
        self.value = 0

    def add(self, step: int = 1) -> int:
        self.value += step
        return self.value

counter = Counter()
method = counter.add

print(method.__self__ is counter)  # True
print(method(2))                   # 2
print(Counter.add(counter, 3))     # 5
```

`counter.add(2)` 和 `Counter.add(counter, 2)` 的结果一致。前者由解释器完成方法绑定，后者把实例显式传给类函数。

## 2. 成员{#成员}

Python 文档中常用 attribute 表示对象上的名字。本文用“成员”指代对象可通过点号访问的变量、方法和受控访问入口。

### 2.1 实例成员{#实例成员}

普通实例默认带有 `__dict__`，动态保存实例成员。赋值语句会向实例成员字典写入名字。

```python
class User:
    def __init__(self, name: str) -> None:
        self.name = name

user = User('Ada')
user.role = 'admin'

print(user.__dict__)  # {'name': 'Ada', 'role': 'admin'}
```

成员查找会同时涉及实例和类。实例自己的成员优先；实例上找不到时，再到类上查找同名成员。

```python
class User:
    kind = 'normal'

    def __init__(self, name: str) -> None:
        self.name = name

user = User('Ada')

print(user.name)  # Ada
print(user.kind)  # normal

user.kind = 'admin'

print(user.__dict__)  # {'name': 'Ada', 'kind': 'admin'}
print(user.kind)      # admin
print(User.kind)      # normal
```

### 2.2 类成员{#类成员}

类成员定义在类命名空间中，属于类对象。实例没有同名成员时，会沿着类和父类查找。

```python
class Student:
    kind = 'student'

    def __init__(self, name: str) -> None:
        self.name = name

s = Student('Michael')

print(s.kind)        # student
print(Student.kind)  # student

s.kind = 'graduate'

print(s.__dict__)    # {'name': 'Michael', 'kind': 'graduate'}
print(s.kind)        # graduate
print(Student.kind)  # student

del s.kind
print(s.kind)        # student
```

同名实例成员会遮蔽类成员。删除实例成员后，再次访问同名成员时会重新访问到类成员。

类成员如果绑定可变对象，会被所有实例共享。

```python
class Team:
    members: list[str] = []

a = Team()
b = Team()

a.members.append('Ada')

print(b.members)  # ['Ada']
```

如果每个实例都需要自己的列表，应在 `__init__()` 中写 `self.members = []`。

### 2.3 访问约定{#访问约定}

Python 没有真正的私有访问控制。下划线更多是命名约定和名称改写规则。

| 写法         | 含义                                |
|------------|-----------------------------------|
| `name`     | 普通公开成员                            |
| `_name`    | 约定为内部成员，外部不应依赖                    |
| `__name`   | 触发名称改写，类内部会改写为 `_ClassName__name` |
| `__name__` | Python 特殊成员，业务代码不应随意发明新的双下划线协议名   |

双下划线开头且不是双下划线结尾的成员会发生名称改写（name mangling）。它能减少子类误覆盖父类内部成员的概率，但不是安全边界。

```python
class Account:
    def __init__(self) -> None:
        self.public_id = 'A-001'
        self._balance = 100
        self.__token = 'secret'

    def token(self) -> str:
        return self.__token

account = Account()

print(account.public_id)          # A-001
print(account._balance)           # 100
print(account.token())            # secret
print(hasattr(account, '__token')) # False
print(account._Account__token)    # secret
```

需要控制写入时，可以提供显式方法，或使用进阶篇中的 `property` 把校验逻辑放在类内部。

## 3. 继承与多态{#继承与多态}

### 3.1 继承关系{#继承关系}

子类继承父类的成员和方法。`isinstance()` 判断的是对象是否是某个类的实例，或该类子类的实例。

```python
class Animal:
    def run(self) -> str:
        return 'Animal is running'

class Dog(Animal):
    pass

dog = Dog()

print(dog.run())                   # Animal is running
print(isinstance(dog, Dog))        # True
print(isinstance(dog, Animal))     # True
print(isinstance(Animal(), Dog))   # False
print(issubclass(Dog, Animal))     # True
```

继承适合表达稳定的“是一个”（is-a）关系。`Dog` 是一种 `Animal`，所以依赖 `Animal` 的代码可以接收 `Dog`。

### 3.2 方法覆盖{#方法覆盖}

子类定义同名方法时，会覆盖父类方法。调用方只按父类接口调用，实际执行由运行期对象类型决定，这就是多态（polymorphism）。

```python
class Animal:
    def run(self) -> str:
        return 'Animal is running'

class Dog(Animal):
    def run(self) -> str:
        return 'Dog is running'

class Cat(Animal):
    def run(self) -> str:
        return 'Cat is running'

def run_twice(animal: Animal) -> list[str]:
    return [animal.run(), animal.run()]

print(run_twice(Dog()))  # ['Dog is running', 'Dog is running']
print(run_twice(Cat()))  # ['Cat is running', 'Cat is running']
```

新增 `Animal` 子类时，只要实现同一接口，`run_twice()` 不需要修改。

### 3.3 结构协议{#结构协议}

Python 的多态不完全依赖继承链。对象只要提供调用方需要的方法，就能参与运行期调用，这就是鸭子类型（duck typing）。

```python
class Timer:
    def run(self) -> str:
        return 'Timer starts'

def run_twice(obj) -> list[str]:
    return [obj.run(), obj.run()]

print(run_twice(Timer()))  # ['Timer starts', 'Timer starts']
```

类型注解中可以用协议（Protocol）表达这种结构要求。普通 `Protocol` 主要服务于静态类型检查，运行期仍然是普通成员查找和方法调用。

```python
from typing import Protocol, runtime_checkable

class Runnable(Protocol):
    def run(self) -> str:
        ...

@runtime_checkable
class RuntimeRunnable(Protocol):
    def run(self) -> str:
        ...

class Animal:
    def run(self) -> str:
        return 'Animal is running'

class Timer:
    def run(self) -> str:
        return 'Timer starts'

def run_twice(obj: Runnable) -> list[str]:
    return [obj.run(), obj.run()]

print(run_twice(Timer()))  # ['Timer starts', 'Timer starts']
print(isinstance(Timer(), Animal))          # False
print(isinstance(Timer(), RuntimeRunnable)) # True
print(issubclass(Timer, RuntimeRunnable))   # True

try:
    print(isinstance(Timer(), Runnable))
except TypeError as exc:
    print(type(exc).__name__)               # TypeError
```

继承关系是名义类型（nominal typing），`isinstance(Timer(), Animal)` 看的是 `Timer` 是否真的继承自 `Animal`
。协议类型看对象是否提供需要的成员，但只有加了 `@runtime_checkable` 的协议才能参与运行期 `isinstance()` / `issubclass()`
判断。

运行期协议检查只检查成员是否存在，不检查参数类型、返回值类型和完整签名。更严格的协议约束应交给静态类型检查器。

### 3.4 多重继承{#多重继承}

Python 支持多重继承。常见做法是保留一条主继承线，再用 Mixin 混入额外能力。

```python
class Animal:
    pass

class Mammal(Animal):
    pass

class FlyableMixin:
    def fly(self) -> str:
        return 'Flying'

class RunnableMixin:
    def run(self) -> str:
        return 'Running'

class Bat(Mammal, FlyableMixin):
    pass

class Dog(Mammal, RunnableMixin):
    pass

print(Bat().fly())                       # Flying
print(Dog().run())                       # Running
print([cls.__name__ for cls in Bat.__mro__]) # ['Bat', 'Mammal', 'Animal', 'FlyableMixin', 'object']
```

`__mro__` 是方法解析顺序（method resolution order）。当多个父类提供同名成员时，Python 按 MRO 查找。Mixin
适合提供小而明确的能力，不适合承载复杂状态。

## 4. 对象检查{#对象检查}

### 4.1 type 与 isinstance{#type与isinstance}

`type(obj)` 返回对象的直接类型。`isinstance(obj, cls)` 会把继承关系纳入判断。

```python
import types

def fn() -> None:
    pass

class Animal:
    pass

class Dog(Animal):
    pass

dog = Dog()

print(type(123) is int)                  # True
print(type(fn) is types.FunctionType)    # True
print(type(dog) is Animal)               # False
print(isinstance(dog, Animal))           # True
print(isinstance([1, 2], (list, tuple))) # True
print(isinstance((1, 2), (list, tuple))) # True
print(isinstance('abc', (list, tuple)))  # False
```

`isinstance(obj, (cls1, cls2))` 表示“`obj` 是 `cls1` 或 `cls2` 的实例”，相当于把多个类型条件做 `or` 判断。`issubclass()`
的第二个参数也支持同样的元组写法。

判断继承层级时优先用 `isinstance()`。判断“必须正好是这个类型，不接受子类”时才使用 `type(obj) is SomeType`。

### 4.2 dir 与 getattr{#dir与getattr}

`dir()` 返回对象可见的成员名列表。`getattr()`、`setattr()`、`hasattr()` 用字符串形式访问成员，适合处理配置、插件、动态字段等场景。

```python
class User:
    def __init__(self, name: str) -> None:
        self.name = name

    def greeting(self) -> str:
        return f'Hi, {self.name}'

user = User('Ada')

print('name' in dir(user))            # True
print(hasattr(user, 'greeting'))      # True
print(getattr(user, 'name'))          # Ada
print(getattr(user, 'missing', None)) # None

method = getattr(user, 'greeting')
print(method())                       # Hi, Ada

setattr(user, 'age', 18)
print(user.age)                       # 18
```

动态访问会把拼写错误推迟到运行期暴露，重构工具也更难追踪。能直接写 `user.name` 时，不要为了“动态”而改成
`getattr(user, 'name')`。

## 5. 小结{#小结}

Python OOP 基础的核心关系如下：

| 对象   | 关键点                                                   |
|------|-------------------------------------------------------|
| 类对象  | 运行期对象，默认由 `type` 创建，可以创建实例                            |
| 实例对象 | 默认动态保存成员，方法调用会自动绑定 `self`                             |
| 成员模型 | 实例成员与类成员分别位于不同命名空间，实例成员会遮蔽同名类成员                       |
| 继承   | 表达名义类型关系，`isinstance()` 会沿继承链判断                       |
| 鸭子类型 | 更关注对象是否提供需要的成员，`Protocol` 可表达结构要求                     |
| 对象检查 | `type()`、`isinstance()`、`dir()`、`getattr()` 用于运行期观察对象 |

基础篇关注对象关系和调用模型。进阶篇继续整理 `property`、`classmethod`、`__dict__`、`__slots__`、特殊方法、枚举和元类。
