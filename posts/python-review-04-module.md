---
title: Python 模块与包
date: 2026-07-05T03:00:00
tags: [ Python ]
pinned: false
collection: 深入理解 Python
outline:
  - title: 1. 模块
    slug: 模块
  - title: 1.1 模块对象
    slug: 模块对象
    level: 1
  - title: 1.2 模块成员
    slug: 模块成员
    level: 1
  - title: 1.3 顶层代码
    slug: 顶层代码
    level: 1
  - title: 1.4 导入时机
    slug: 导入时机
    level: 1
  - title: 1.5 使用方式
    slug: 使用方式
    level: 1
  - title: 2. 包
    slug: 包
  - title: 2.1 目录结构
    slug: 目录结构
    level: 1
  - title: 2.2 入口文件
    slug: 入口文件
    level: 1
  - title: 2.3 包级导出
    slug: 包级导出
    level: 1
  - title: 2.4 导入缓存
    slug: 导入缓存
    level: 1
  - title: 3. 导入语法
    slug: 导入语法
  - title: 3.1 模块导入
    slug: 模块导入
    level: 1
  - title: 3.2 包导入
    slug: 包导入
    level: 1
  - title: 3.3 成员导入
    slug: 成员导入
    level: 1
  - title: 3.4 过程式导入
    slug: 过程式导入
    level: 1
  - title: 4. 搜索路径
    slug: 搜索路径
  - title: 4.1 路径来源
    slug: 路径来源
    level: 1
  - title: 4.2 运行期修改
    slug: 运行期修改
    level: 1
  - title: 4.3 导入冲突
    slug: 导入冲突
    level: 1
  - title: 5. 小结
    slug: 小结
  - title: 附录
    slug: 附录
head:
  - - meta
    - name: description
      content: Python 系列第四篇，整理模块对象、模块成员、顶层代码、模块使用方法、包目录、__init__.py、包级导出、导入语法、importlib 与 sys.path 搜索路径。
  - - meta
    - name: keywords
      content: Python, 模块, 包, module, package, import, importlib, sys.path, PYTHONPATH, sys.modules, __name__, __main__, __all__, __init__.py
---

本篇整理 Python 模块与包的组织方式。

---

模块解决单个文件的命名空间问题，包解决多个模块的目录组织问题。

## 1. 模块{#模块}

### 1.1 模块对象{#模块对象}

一个普通 `.py` 文件就是一个 module。导入模块后，当前命名空间会得到一个指向模块对象的名字。

```python
import sys

print(type(sys).__name__)         # module
print(isinstance(sys.argv, list)) # True
```

`import sys` 之后，`sys` 是模块对象。访问 `sys.argv`、`sys.path` 这类成员时，实际是在访问 `sys` 模块命名空间里的变量。

### 1.2 模块成员{#模块成员}

模块成员就是定义在模块命名空间里的名字。函数、类、常量、导入进来的对象和运行时特殊变量都可以成为模块成员。

```python
"""Greeting module."""

__author__ = 'qianshuang'
DEFAULT_NAME = 'world'

def greeting(name: str = DEFAULT_NAME) -> str:
    return f'Hello, {name}!'

print(__doc__)          # Greeting module.
print(__author__)       # qianshuang
print(greeting('Ada'))  # Hello, Ada!
```

模块顶层的第一个字符串字面量会成为模块文档字符串，即 `__doc__`。`__author__`、`__version__` 这类名字只是普通变量，但常用于记录模块元数据。

`__name__` 是模块使用方式的标记。模块被导入时，`__name__` 通常是模块导入名；文件被直接作为顶层脚本运行时，`__name__` 是
`'__main__'`。

```python
print(__name__)  # __main__
```

常见特殊成员如下：

| 成员         | 含义                        |
|------------|---------------------------|
| `__name__` | 当前模块名；直接运行时为 `'__main__'` |
| `__doc__`  | 模块文档字符串                   |
| `__file__` | 模块文件路径                    |
| `__spec__` | 模块导入规格，包含来源、加载器等信息        |

双下划线包围的名字通常是 Python 运行时约定的特殊名字。业务代码不应该随意发明新的 `__xxx__` 名字，避免和语言或工具约定冲突。

### 1.3 顶层代码{#顶层代码}

模块顶层代码是文件中不在函数体、类体内部的代码。不只是赋值语句，位于顶层的函数定义、类定义、赋值语句和 `import` 等都属于顶层代码。

```python
import math

VALUE = math.sqrt(16)

def get_value() -> float:
    return VALUE

print(get_value())  # 4.0
```

顶层代码在模块第一次被导入，或文件作为顶层脚本运行时执行。一般用于配置模块元数据、定义常量和初始化。

### 1.4 导入时机{#导入时机}

`import` 是普通语句，可以出现在模块顶层、函数体、`if` 分支、循环体等位置。代码执行到该语句时，才会触发导入流程。

```python
def calculate(enabled: bool) -> float:
    if enabled:
        import math
        return math.sqrt(16)
    return 0.0

print(calculate(False))  # 0.0
print(calculate(True))   # 4.0
```

`calculate(False)` 没有执行到 `import math`，因此这个调用不会触发导入；`calculate(True)` 执行到分支内部时才会导入 `math`。

### 1.5 使用方式{#使用方式}

同一个 `.py` 模块有两种常见使用方式：被其他模块导入，或直接作为顶层模块运行。`if __name__ == '__main__':` 用来区分这两种路径。

```python
# hello.py
import sys

def greeting(argv: list[str]) -> str:
    if len(argv) == 1:
        return 'Hello, world!'
    if len(argv) == 2:
        return f'Hello, {argv[1]}!'
    return 'Too many arguments!'

def main(argv: list[str]) -> None:
    print(greeting(argv))

def init() -> None:
    print('init')  # init

init()

if __name__ == '__main__':
    def test() -> None:
        assert greeting(['hello.py']) == 'Hello, world!'
        assert greeting(['hello.py', 'Michael']) == 'Hello, Michael!'

    test()
    main(sys.argv)

# python hello.py -> 先输出 init，再输出 Hello, world!
# python hello.py Michael -> 先输出 init，再输出 Hello, Michael!
```

导入 `hello` 时，顶层的 `import sys`、函数定义和 `init()` 会执行；`if __name__ == '__main__':` 分支不会执行。直接运行
`hello.py` 时，顶层代码和入口分支都会执行。

## 2. 包{#包}

### 2.1 目录结构{#目录结构}

package 是包含多个模块的目录。对于一个python项目，里面的每一个文件夹都可以认为是一个package。常规 package 里会放一个
`__init__.py` 作为包入口，目录结构定义了包和模块的导入名。
例如，对于以下包，`acme/config.py` 对应 `acme.config`，`acme/utils/text.py` 对应 `acme.utils.text`：

```bash
(pythonrelearn) qianshuang@qianshuangdeMacBook-Air PythonRelearn % tree acme/              
acme/
├── __init__.py
├── config.py
├── service.py
└── utils
    └── text.py

```

### 2.2 入口文件{#入口文件}

首次导入包时，`__init__.py` 会执行。一般用于配置包元数据与导出成员，初始化逻辑放在下属模块中。

`__init__.py` 本身也是模块文件，所以它也可以定义变量、函数、导入语句和特殊成员。常见成员如下：

| 成员            | 作用                                |
|---------------|-----------------------------------|
| `__all__`     | 控制 `from package import *` 暴露哪些名字 |
| `__version__` | 记录包版本                             |
| `__author__`  | 记录作者或维护者                          |
| 包级导入          | 把子模块里的常用对象提升到 package 命名空间        |

下面的示例演示 `__all__` 对星号导入的影响。

```bash
$ tree acme
acme
└── __init__.py
```

```python
# acme/__init__.py
__all__ = ['public_name']

public_name = 'visible'
_private_name = 'hidden'
```

```python
# main.py
from acme import *

print(public_name)                    # visible
print('_private_name' in globals())    # False
```

`__all__` 并非权限控制。调用方仍然可以写 `import acme` 后访问 `acme._private_name`；单下划线只是“不应依赖”的约定。

### 2.3 包级导出{#包级导出}

包级导出把子模块中的常用对象绑定到 package 命名空间，让调用方可以从 package 直接导入。

```bash
$ tree acme
acme
├── __init__.py
└── config.py
```

```python
# acme/config.py
class Settings:
    debug = True
```

```python
# acme/__init__.py
from .config import Settings

__all__ = ['Settings']
```

```python
# main.py
import acme  

print(acme.Settings.debug)  # True
print(acme.config.Settings.debug)  # True

```

这种写法会将子模块对象绑定到 package 命名空间，避免引用时写复杂的前缀。

### 2.4 导入缓存{#导入缓存}

包也是模块对象，也会进入 `sys.modules`。首次导入 package 时，Python 会执行 package 的 `__init__.py`，然后把包对象缓存到
`sys.modules['package']`。再次导入同一个 package 时，通常直接复用这个包对象，不会重新执行 `__init__.py`。

导入子模块时，Python 会先确保父 package 已加载；如果父 package 尚未加载，会先执行父 package 的 `__init__.py`，再执行子模块文件。父
package 和子模块会分别缓存。

```bash
$ tree acme
acme
├── __init__.py
└── config.py
```

```python
# acme/__init__.py
print('loading acme package')
name = 'acme'
```

```python
# acme/config.py
print('loading acme.config')
debug = True
```

```python
# main.py
import sys

import acme          # 打印 loading acme package
import acme          # 复用缓存，无输出
print(acme is sys.modules['acme'])  # True

import acme.config  # 打印 loading acme.config
import acme.config  # 复用缓存，无输出
print('acme.config' in sys.modules)  # True
print(acme.config is sys.modules['acme.config'])  # True

print(acme.config.debug)             # True
```

`import acme.config` 和 `from acme import config` 都会让父 package `acme` 先完成加载。包缓存与模块缓存在`sys.modules`
中相互隔离，并且重复导入会使用缓存，不会再次执行`__init__.py`或模块顶层代码。

此外，由于顶层的`import`是模块顶层代码的一部分，因此导入时，会按顺序递归执行。

```python
# acme/__init__.py
from .config import debug 

__all__ = ['debug']
print('loading acme package')
name = 'acme'

```

```python
# acme/config.py
print('loading acme.config')
debug = True
```

```python
# main.py
import sys

import acme          # 打印 loading acme.config, 打印 loading acme package
import acme          # 复用缓存，无输出
```

在上例中，由于`from .config import debug`在`print('loading acme package')`之前，因此，`loading acme.config`被优先打印。

## 3. 导入语法{#导入语法}

### 3.1 模块导入{#模块导入}

模块导入保留命名空间。`import math` 后，通过 `math.sqrt` 访问成员，调用点能看出成员来自哪个模块。

```python
import math
import pathlib as path

print(math.sqrt(16))           # 4.0
print(path.Path('posts').name) # posts
```

别名适合模块名较长或社区有稳定约定的场景。

### 3.2 包导入{#包导入}

包导入先得到包对象，再通过包对象访问已经加载的子模块或包级导出。`import package` 只导入包本身；它会执行包的 `__init__.py`
，但不会自动导入包目录下的所有子模块（除非`__init__.py`中包含了对子模块的引用）。

```python
# acme/__init__.py
name = 'acme'
```

```python
# acme/config.py
debug = True
```

```python
# main.py
import acme

print(acme.name)               # acme
print(hasattr(acme, 'config')) # False

import acme.config
print(acme.config.debug)       # True

from acme import config
print(config is acme.config)   # True （复用缓存，因此是同一个对象）
```

`import acme.config` 绑定的是顶层名字 `acme`，调用时写 `acme.config.debug`。`from acme import config` 会把 `config`
直接绑定到当前命名空间，调用时写 `config.debug`。

### 3.3 成员导入{#成员导入}

成员导入把模块里的名字直接绑定到当前命名空间。`from math import sqrt` 之后，当前作用域里有一个 `sqrt` 名字，但从调用点看不出它来自哪个模块。

```python
from math import sqrt
from pathlib import Path

print(sqrt(25))        # 5.0
print(Path('a') / 'b') # a/b
```

大量成员导入会让当前命名空间变宽，增加重名风险。

星号导入会把目标模块或包暴露的名字批量放入当前命名空间。普通业务代码不建议使用 `from module import *` 或
`from package import *`；它隐藏来源，也容易覆盖已有名字。

### 3.4 过程式导入{#过程式导入}

`importlib` 提供过程式导入接口，适合在运行期按字符串决定导入哪个模块。普通 `import` 是语句，`importlib.import_module()`
是函数调用，返回模块对象。

```python
import importlib

math = importlib.import_module('math')
sqrt = getattr(math, 'sqrt')

print(math.sqrt(16)) # 4.0
print(sqrt(25))      # 5.0
```

常见声明式导入与过程式写法的关系如下。表中的 `module` 指 package 下的子模块；如果导入的是模块里的普通成员，则从模块对象上取属性。表中涉及
`sys.modules` 的写法需要先 `import sys`。

| 声明式写法                                        | 过程式写法                                                                         |
|----------------------------------------------|-------------------------------------------------------------------------------|
| `import module`                              | `module = importlib.import_module('module')`                                  |
| `import package`                             | `package = importlib.import_module('package')`                                |
| `import package.module`                      | `importlib.import_module('package.module'); package = sys.modules['package']` |
| `import package.module as alias`             | `alias = importlib.import_module('package.module')`                           |
| `from package import module`                 | `module = importlib.import_module('package.module')`                          |
| `from package.module import member`          | `member = getattr(importlib.import_module('package.module'), 'member')`       |
| `from package.module import member as alias` | `alias = getattr(importlib.import_module('package.module'), 'member')`        |

`importlib.reload(module)` 会重新执行已经导入的模块对象，适合少量调试场景。业务代码通常不依赖 reload；长期运行的服务更常见的做法是重启进程。

## 4. 搜索路径{#搜索路径}

### 4.1 路径来源{#路径来源}

模块查找依赖搜索路径。`sys.path` 是一个 list，保存解释器查找模块和包的目录顺序。

```python
import sys

print(isinstance(sys.path, list))   # True
print(isinstance(sys.path[0], str)) # True
```

解释器启动时会把几类路径放入 `sys.path`：

| 来源             | 说明                                |
|----------------|-----------------------------------|
| 脚本目录或当前目录      | 脚本运行时通常是脚本所在目录；交互式环境里常用空字符串表示当前目录 |
| `PYTHONPATH`   | 环境变量指定的搜索路径，会在解释器启动时加入 `sys.path` |
| 标准库目录          | Python 自带模块所在目录                   |
| 第三方包目录         | 虚拟环境或系统环境中的 `site-packages`       |
| `.pth` 文件追加的目录 | `site` 初始化时读取，常由安装工具或开发模式安装写入     |

例如：

```bash
(pythonrelearn) qianshuang@qianshuangdeMacBook-Air PythonRelearn % export PYTHONPATH="Test" && echo "import sys
for path in sys.path:
    print(path)
" > main.py && uv run main.py 

/Users/qianshuang/Project/PythonProject/PythonRelearn # 当前工作目录
/Users/qianshuang/Project/PythonProject/PythonRelearn/Test # PYTHONPATH 环境变量指定的目录
/Users/qianshuang/.local/share/uv/python/cpython-3.14.3-macos-aarch64-none/lib/python314.zip # 标准库的压缩包版本
/Users/qianshuang/.local/share/uv/python/cpython-3.14.3-macos-aarch64-none/lib/python3.14 # 标准库 Python 源码
/Users/qianshuang/.local/share/uv/python/cpython-3.14.3-macos-aarch64-none/lib/python3.14/lib-dynload # 标准库的 C 扩展二进制模块
/Users/qianshuang/Project/PythonProject/PythonRelearn/.venv/lib/python3.14/site-packages # 虚拟环境中的第三方包目录
```

各个路径在`sys.path`中的顺序实际上决定了搜索优先级，后续路径仅在前序路径未搜索到的情况下才会被搜索。

### 4.2 运行期修改{#运行期修改}

代码可以动态修改 `sys.path`，这种修改只影响当前解释器进程，并且只影响修改之后发生的导入。

```python
import sys

sys.path.insert(0, '/tmp/project-libs')
print(sys.path[0])  # /tmp/project-libs
sys.path.pop(0)
```

### 4.3 导入冲突{#导入冲突}

导入冲突来自路径顺序。Python 按 `sys.path` 从前到后查找模块，先找到的名字会被加载。当前目录下如果有 `json.py`、`typing.py`
这类文件，`import json` 或 `import typing` 可能先加载本地文件，而不是标准库模块。

排查导入冲突时，先查看模块实际来源：

```python
import json

print(json.__name__)        # json
print(json.__file__)        # 标准库 json 模块的实际路径
print(json.__spec__.origin) # 标准库 json 模块的实际路径
```

常见处理方式是：重命名本地冲突文件或包目录，删除残留的 `__pycache__`，检查 `sys.path` 前几个目录，避免在库代码中随意把项目目录插到搜索路径最前面。

## 5. 小结{#小结}

模块是 `.py` 文件对应的命名空间对象；包是组织多个模块的目录结构。`__name__` 是模块成员之一，用来区分导入使用和直接作为顶层模块运行。

包的 `__init__.py` 是包入口，适合放元数据、`__all__` 和轻量包级导出。导入时，Python 根据 `sys.path` 查找模块或包，执行模块顶层代码，并把模块对象放入
`sys.modules` 缓存。

## 附录

### import package.module 与 print(package.module) 的区别

在python中，`import package.module`后的`package.module`将被`import`作为一个字符串整体对待，而不是通过`package`对象导入
`module`成员。

比如以下代码：

```bash
(pythonrelearn) qianshuang@qianshuangdeMacBook-Air PythonRelearn % tree acme               
acme
├── __init__.py
└── config.py
```

```python
# acme/__init__.py
print('loading acme package')
name = 'acme'
```

```python
# acme/config.py
print('loading acme.config')
debug = True
```

可以看到，`acme`包的`__init__.py`文件并没有保留对子模块`config`的引用，因此如果我们在代码中这样使用

```python
# main.py
import acme

print(acme.config.debug)  #  通过包对象 acme 访问子模块对象 config
```

解释器会抛出错误

```bash
(pythonrelearn) qianshuang@qianshuangdeMacBook-Air PythonRelearn % uv run main.py          
loading acme package
Traceback (most recent call last):
  File "/Users/qianshuang/Project/PythonProject/PythonRelearn/main.py", line 3, in <module>
    print(acme.config.debug)
          ^^^^^^^^^^^
AttributeError: module 'acme' has no attribute 'config'
```

解决方法有两个，一个是在`__init__.py`中保存对子模块的引用，这样一来，在解析`import acme`时，解释器会递归解析对`acme.config`
的导入。

```python
# acme/__init__.py
from .config import debug

print('loading acme package')
name = 'acme'
```

另一种方法是单独再次`import acme.config`

```python
# main.py
import acme
import acme.config

print(acme.config.debug) 
# 实际上等价于 print(sys.modules['acme.config'].debug)
# 而不是 print(sys.modules['acme'].config.debug)
```

这里便有一个很玄学的问题，既然`print(acme.config.debug)`没办法通过`acme`访问到`config`。那为什么`import acme.config`能够成功呢？

这是因为当我们执行`import package.module`时，实际上执行的是`importlib.import_module('package.module')`，而不是
`package.import_module('module')`。
`acme`在`import acme.config`中根本不是`import acme`得到的包对象，而是一个包名称。 因此，`import acme.config`将首先查找包
`acme`，然后找到子模块`config`。

这也说明了，`import package.module`将后面的 `package.module`作为简单的字符串标识符对待，和已定义的变量没有关系。

