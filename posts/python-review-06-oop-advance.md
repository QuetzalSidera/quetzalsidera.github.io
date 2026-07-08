---
title: Python 面向对象进阶
date: 2026-07-07T05:00:00
tags: [ Python ]
pinned: false
collection: 深入理解 Python
outline:
  - title: 1. 方法修饰器
    slug: 方法修饰器
  - title: 1.1 property
    slug: property
    level: 1
  - title: 1.2 classmethod 与 staticmethod
    slug: classmethod与staticmethod
    level: 1
  - title: 1.3 abstractmethod
    slug: abstractmethod
    level: 1
  - title: 2. 双下划线成员
    slug: 双下划线成员
  - title: 2.1 __dict__
    slug: __dict__
    level: 1
  - title: 2.2 __class__、__name__、__base__ 与 __mro__
    slug: class-name-base-mro
    level: 1
  - title: 2.3 __slots__
    slug: __slots__
    level: 1
  - title: 2.4 __str__ 与 __repr__
    slug: strrepr
    level: 1
  - title: 2.5 __len__ 与 __getitem__
    slug: lengetitem
    level: 1
  - title: 2.6 动态成员
    slug: 动态成员
    level: 1
  - title: 3. 枚举与元类
    slug: 枚举与元类
  - title: 3.1 枚举
    slug: 枚举
    level: 1
  - title: 3.2 元类
    slug: 元类
    level: 1
  - title: 4. 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: Python 复习系列第六篇，整理 property、classmethod、staticmethod、abstractmethod、__dict__、__slots__、特殊方法、枚举、type 动态创建类与元类。
  - - meta
    - name: keywords
      content: Python, 面向对象进阶, OOP, property, classmethod, staticmethod, abstractmethod, __dict__, __slots__, __getitem__, __getattr__, __call__, Enum, ABCMeta, metaclass
---

本篇整理 Python 面向对象进阶：方法修饰器、双下划线成员、特殊方法、枚举和元类。

---

基础篇讨论类、实例、成员、继承和对象检查。本篇继续整理会改变成员访问、类创建过程或对象协议的机制。

## 1. 方法修饰器{#方法修饰器}

类中常见的 `@xxx` 写法本质上仍然是装饰器。装饰器在类体执行时生效，把原始函数对象替换成另一种成员对象。

| 修饰器                  | 作用                             |
|----------------------|--------------------------------|
| `@property`          | 把方法包装成可读成员                     |
| `@{property}.setter` | 为同一个 `property` 增加写入逻辑         |
| `@classmethod`       | 让方法绑定到类对象，第一个参数通常是 `cls`       |
| `@staticmethod`      | 把函数放进类命名空间，但不绑定实例或类            |
| `@abstractmethod`    | 标记抽象方法，配合 `ABCMeta` 阻止未实现子类实例化 |

### 1.1 property{#property}

`property` 把方法包装成属性访问形式。调用方写 `obj.score`，类内部仍然可以执行校验、计算或只读控制。

```python
class Student:
    def __init__(self, name: str) -> None:
        self.name = name
        self._score = 0

    @property
    def score(self) -> int:
        return self._score

    @score.setter
    def score(self, value: int) -> None:
        if not isinstance(value, int):
            raise TypeError('score must be an integer')
        if value < 0 or value > 100:
            raise ValueError('score must between 0 and 100')
        self._score = value

    @property
    def passed(self) -> bool:
        return self._score >= 60

s = Student('Lisa')
s.score = 99

print(s.score)   # 99
print(s.passed)  # True
```

`passed` 只有 getter，没有 setter，因此是只读属性。

`property` 的方法名不要和后备字段重名。下面这种写法会在读取 `birth` 时递归调用自身：

```python
class Student:
    @property
    def birth(self) -> int:
        return self.birth
```

常见写法是公开属性名用 `score`，后备字段用 `_score`。

### 1.2 classmethod 与 staticmethod{#classmethod与staticmethod}

普通实例方法通过实例访问时会绑定 `self`。`classmethod` 改为绑定类对象，`staticmethod` 不做绑定，只是把函数放在类的命名空间里。

```python
class User:
    default_role = 'member'

    def __init__(self, name: str, role: str) -> None:
        self.name = name
        self.role = role

    @classmethod
    def guest(cls) -> 'User':
        return cls('guest', cls.default_role)

    @staticmethod
    def normalize_name(name: str) -> str:
        return name.strip().title()

user = User.guest()

print(user.name, user.role)                  # guest member
print(User.normalize_name(' ada lovelace ')) # Ada Lovelace
```

`classmethod` 常用于替代构造器、从配置创建对象、在继承场景下保留具体子类类型。`staticmethod` 常用于和类语义相关、但不需要访问
`self` 或 `cls` 的辅助函数。

### 1.3 abstractmethod{#abstractmethod}

`abstractmethod` 标记抽象方法，通常和 `abc.ABC` 一起使用。`ABC` 是 Abstract Base Class
的缩写，即抽象基类。类仍然是普通类，但没有实现全部抽象方法时不能实例化。

```python
from abc import ABC, abstractmethod

class Storage(ABC):
    @abstractmethod
    def read(self, key: str) -> str:
        ...

try:
    Storage()
except TypeError as exc:
    print(type(exc).__name__)  # TypeError

class MemoryStorage(Storage):
    def read(self, key: str) -> str:
        return f'value:{key}'

storage = MemoryStorage()

print(storage.read('user'))          # value:user
print(isinstance(storage, Storage))  # True
```

抽象类表达的是名义类型约束：`MemoryStorage` 明确继承自 `Storage`。

## 2. 双下划线成员{#双下划线成员}

双下划线成员分两类：一类是运行时提供的内置信息，例如 `__dict__`、`__class__`、`__mro__`；另一类是特殊方法，例如 `__len__()`、
`__getitem__()`、`__call__()`，用于把自定义对象接入 Python 语法和内建函数。

### 2.1 \_\_dict\_\_{#\_\_dict\_\_}

普通实例默认用 `__dict__` 保存实例成员。动态赋值本质上是在这个字典里增加或修改键值。

```python
class User:
    def __init__(self, name: str) -> None:
        self.name = name

user = User('Ada')
user.role = 'admin'

print(user.__dict__)          # {'name': 'Ada', 'role': 'admin'}
print(user.__dict__['name'])  # Ada

user.__dict__['active'] = True

print(user.active)            # True
```

类对象也有自己的 `__dict__`，保存类命名空间里的成员。

```python
class User:
    kind = 'normal'

    def greeting(self) -> str:
        return 'hello'

print(User.__dict__['kind'])                # normal
print(callable(User.__dict__['greeting']))  # True
```

实例 `__dict__` 和类 `__dict__` 是两个不同的命名空间。实例没有某个成员时，才会继续到类和父类上查找。

### 2.2 \_\_class\_\_、\_\_name\_\_、\_\_base\_\_ 与 \_\_mro\_\_{#class-name-base-mro}

类对象会暴露一组描述自身和继承关系的双下划线成员。

```python
class Animal:
    pass

class Dog(Animal):
    pass

dog = Dog()

print(dog.__class__.__name__)             # Dog
print(Dog.__name__)                       # Dog
print(Dog.__base__.__name__)              # Animal
print([cls.__name__ for cls in Dog.__mro__]) # ['Dog', 'Animal', 'object']
```

这些成员由 Python 运行时维护。代码可以读取它们做调试、框架适配或对象检查，但不要随意发明新的 `__xxx__` 名字，避免和语言协议冲突。

### 2.3 \_\_slots\_\_{#\_\_slots\_\_}

`__slots__` 限制当前类实例可绑定的成员名。没有额外声明 `__dict__` 时，实例不再为任意动态成员保留普通成员字典。

```python
class Point:
    __slots__ = ('x', 'y')

    def __init__(self, x: int, y: int) -> None:
        self.x = x
        self.y = y

p = Point(1, 2)

print(hasattr(p, '__dict__'))  # False

try:
    p.z = 3
except AttributeError as exc:
    print(type(exc).__name__)  # AttributeError

class ColoredPoint(Point):
    pass

cp = ColoredPoint(1, 2)
cp.color = 'red'

print(cp.__dict__)  # {'color': 'red'}
```

`__slots__` 不是继承链上的全局限制。子类如果没有定义 `__slots__`，子类实例仍会重新拥有 `__dict__`。

要让子类也受限制，需要在子类中继续定义 `__slots__`。

### 2.4 \_\_str\_\_ 与 \_\_repr\_\_{#strrepr}

特殊方法让对象接入 Python 的统一协议。调用 `str(obj)` 和 `repr(obj)` 时，解释器会查找对应的双下划线方法。`__str__()`
面向用户可读输出，`__repr__()` 面向调试和开发者输出。

```python
class Student:
    def __init__(self, name: str) -> None:
        self.name = name

    def __str__(self) -> str:
        return f'Student(name={self.name})'

    __repr__ = __str__

s = Student('Michael')

print(str(s))   # Student(name=Michael)
print(repr(s))  # Student(name=Michael)
```

### 2.5 \_\_len\_\_ 与 \_\_getitem\_\_{#lengetitem}

实现 `__len__()` 后，对象可以被 `len()` 使用。实现 `__getitem__()` 后，对象可以按下标或切片读取。下标访问会把整数传给
`__getitem__()`；切片访问会把 `slice` 对象传给 `__getitem__()`。

```python
class Squares:
    def __init__(self, limit: int) -> None:
        self.limit = limit

    def __len__(self) -> int:
        return self.limit

    def __getitem__(self, index: int | slice):
        if isinstance(index, slice):
            start, stop, step = index.indices(self.limit)
            return [
                value * value
                for value in range(start, stop, step)
            ]

        if index < 0:
            index += self.limit
        if index < 0 or index >= self.limit:
            raise IndexError(index)
        return index * index

squares = Squares(5)

print(len(squares))      # 5
print(squares[3])        # 9
print(squares[-1])       # 16
print(squares[1:5:2])    # [1, 9]
print(list(squares))     # [0, 1, 4, 9, 16]
```

`__getitem__()` 的参数由调用形式决定：

| 调用写法             | 传入 `__getitem__()` 的对象    |
|------------------|---------------------------|
| `squares[3]`     | 整数 `3`                    |
| `squares[-1]`    | 整数 `-1`，是否支持负数由类自己决定      |
| `squares[1:5:2]` | `slice(1, 5, 2)`，不是三个独立参数 |

如果对象没有实现 `__iter__()`，但实现了从 `0` 开始的 `__getitem__()`，`for` 和 `list()` 会按 `0, 1, 2...` 连续取值，直到
`__getitem__()` 抛出 `IndexError` 为止。

### 2.6 动态成员{#动态成员}

`__getattr__()` 只在常规成员查找失败时调用，适合做延迟成员、代理对象或链式 API。`__call__()` 让实例本身可以像函数一样调用。

```python
class Chain:
    def __init__(self, path: str = '') -> None:
        self._path = path

    def __getattr__(self, name: str) -> 'Chain':
        return Chain(f'{self._path}/{name}')

    def __call__(self, value: str) -> 'Chain':
        return Chain(f'{self._path}/{value}')

    def __str__(self) -> str:
        return self._path or '/'

    __repr__ = __str__

api = Chain().users('michael').repos

print(api)                    # /users/michael/repos
print(callable(Chain()))      # True
print(callable([1, 2, 3]))    # False
```

不能处理的动态成员应抛出 `AttributeError`，不应该静默返回 `None`。更完整的序列语义还包括 `__setitem__()`、`__delitem__()`、
`__contains__()` 等方法。

## 3. 枚举与元类{#枚举与元类}

### 3.1 枚举{#枚举}

一组相关常量如果直接用整数或字符串表示，调用方容易传错值。枚举（Enum）把常量组织成一个类型，每个成员都是该枚举类的唯一实例。

```python
from enum import Enum, unique

@unique
class Gender(Enum):
    Male = 'male'
    Female = 'female'

class Student:
    def __init__(self, name: str, gender: Gender) -> None:
        if not isinstance(gender, Gender):
            raise TypeError('gender must be Gender')
        self.name = name
        self.gender = gender

bart = Student('Bart', Gender.Male)

print(bart.gender is Gender.Male)     # True
print(Gender.Male.name)               # Male
print(Gender.Male.value)              # male
print(Gender('female') is Gender.Female) # True
print([member.name for member in Gender]) # ['Male', 'Female']
```

`@unique` 会检查枚举值是否重复。若允许重复值，后定义的成员会成为前一个成员的别名，遍历枚举时通常不会作为独立成员出现。

### 3.2 元类{#元类}

类对象默认由 `type` 创建。`type()` 既可以查看对象类型，也可以通过“类名、父类元组、类命名空间字典”动态创建类。

`type(name, bases, namespace)` 的三个参数分别对应类名、父类元组和类命名空间。

| 参数          | 含义                |
|-------------|-------------------|
| `name`      | 新类的 `__name__`    |
| `bases`     | 父类元组，单个父类也要写成元组   |
| `namespace` | 类成员字典，方法和类成员都放在这里 |

```python
def hello(self, name: str = 'world') -> str:
    return f'Hello, {name}'

Person = type(
    'Person',
    (object,),
    {
        'species': 'human',
        'hello': hello,
    },
)

p = Person()

print(Person.__name__)       # Person
print(Person.species)        # human
print(p.hello('Ada'))        # Hello, Ada
print(isinstance(p, Person)) # True
```

上面的过程式写法等价于下面的声明式类定义：

```python
class Person:
    species = 'human'

    def hello(self, name: str = 'world') -> str:
        return f'Hello, {name}'

p = Person()

print(Person.__name__)       # Person
print(Person.species)        # human
print(p.hello('Ada'))        # Hello, Ada
print(isinstance(p, Person)) # True
```

元类（metaclass）是创建类对象的类。类定义语句执行时，解释器会收集类名、父类和类命名空间，然后调用元类创建类对象。自定义元类通常继承
`type`，通过 `__new__()` 检查或改写类命名空间。

```python
class TableMeta(type):
    def __new__(mcls, name, bases, namespace):
        namespace.setdefault('__table__', name.lower())
        return super().__new__(mcls, name, bases, namespace)

class Model(metaclass=TableMeta):
    pass

class User(Model):
    __table__ = 'users'

class Article(Model):
    pass

print(type(User).__name__) # TableMeta
print(User.__table__)      # users
print(Article.__table__)   # article
```

`TableMeta.__new__()` 在类对象真正创建前执行。`User` 明确声明了 `__table__`，所以保留 `users`；`Article` 没有声明，元类用类名小写补上默认值。
`Model` 的子类没有再次写 `metaclass=TableMeta`，但会沿继承关系继续使用同一个元类。

标准库也使用元类。`abc.ABC` 使用 `ABCMeta` 阻止抽象类被直接实例化。

```python
from abc import ABC, abstractmethod

class Repository(ABC):
    @abstractmethod
    def get(self, key: str) -> str:
        ...

print(type(Repository).__name__)  # ABCMeta

try:
    Repository()
except TypeError as exc:
    print(type(exc).__name__)     # TypeError

class MemoryRepository(Repository):
    def get(self, key: str) -> str:
        return f'value:{key}'

repo = MemoryRepository()

print(repo.get('user'))                 # value:user
print(isinstance(repo, Repository))     # True
```

`Repository` 继承自 `ABC` 后，类对象由 `ABCMeta` 创建。`@abstractmethod` 标记的成员会被元类收集；子类没有实现这些抽象成员时，实例化阶段会抛出
`TypeError`。

## 4. 小结{#小结}

Python OOP 进阶内容的核心关系如下：

| 对象          | 关键点                                      |
|-------------|------------------------------------------|
| 方法修饰器       | 在类体执行时替换原始函数，形成 `property`、类方法、静态方法、抽象方法 |
| `__dict__`  | 保存实例或类命名空间，解释动态成员绑定的基础                   |
| `__slots__` | 限制实例成员集合，并改变普通实例的成员存储方式                  |
| 特殊方法        | 把自定义对象接入 `len()`、下标、字符串表示、调用等协议          |
| 枚举          | 把相关常量组织成类型化、可比较的唯一成员                     |
| 元类          | 控制类创建过程，`ABCMeta` 是标准库中的典型例子             |

日常代码优先使用简单类、组合、`property`、枚举和清晰的继承关系。`__getattr__()`、多重继承、`__slots__`
、元类都属于更强的工具，应在确实需要改变对象协议或类创建行为时再使用。
