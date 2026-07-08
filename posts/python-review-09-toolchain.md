---
title: Python 环境与工具链
date: 2026-07-08T09:00:00
tags: [ Python ]
pinned: false
collection: 深入理解 Python
outline:
  - title: 1. 环境组成
    slug: 环境组成
  - title: 1.1 解释器
    slug: 解释器
    level: 1
  - title: 1.2 标准库
    slug: 标准库
    level: 1
  - title: 1.3 第三方包
    slug: 第三方包
    level: 1

  - title: 2. 命令行
    slug: 命令行
  - title: 2.1 执行入口
    slug: 执行入口
    level: 1
  - title: 2.2 常用选项
    slug: 常用选项
    level: 1
  - title: 2.3 模块入口
    slug: 模块入口
    level: 1

  - title: 3. 虚拟环境
    slug: 虚拟环境
  - title: 3.1 目录结构
    slug: 目录结构
    level: 1
  - title: 3.2 激活脚本
    slug: 激活脚本
    level: 1
  - title: 3.3 环境重建
    slug: 环境重建
    level: 1

  - title: 4. pip
    slug: pip
  - title: 4.1 解释器绑定
    slug: 解释器绑定
    level: 1
  - title: 4.2 依赖文件
    slug: 依赖文件
    level: 1
  - title: 4.3 项目元数据
    slug: 项目元数据
    level: 1

  - title: 5. uv
    slug: uv
  - title: 5.1 工具定位
    slug: 工具定位
    level: 1
  - title: 5.2 Python 版本命令
    slug: Python版本命令
    level: 1
  - title: 5.3 虚拟环境与 pip 兼容命令
    slug: 虚拟环境与pip兼容命令
    level: 1
  - title: 5.4 项目命令
    slug: 项目命令
    level: 1
  - title: 5.5 锁文件
    slug: 锁文件
    level: 1
  - title: 5.6 运行命令
    slug: 运行命令
    level: 1

  - title: 6. 工作流选择
    slug: 工作流选择
head:
  - - meta
    - name: description
      content: Python 复习系列最后一篇，整理 Python 环境组成、python 命令行入口、venv 虚拟环境、pip 依赖管理、pyproject.toml 与 uv 工具链。
  - - meta
    - name: keywords
      content: Python, 环境, 工具链, python, venv, pip, uv, pyproject.toml, virtual environment, package management
---

本篇整理 Python 环境与工具链：解释器、标准库、第三方包、命令行入口、虚拟环境、`pip` 和 `uv`。

---

前面的文章关注语言机制和标准库接口。最后一篇回到工程入口：一段 Python 代码最终由哪个解释器运行、从哪里导入模块、包安装到哪里、命令行工具绑定到哪个环境。

## 1. 环境组成{#环境组成}

一个可运行的 Python 环境由解释器、标准库、模块搜索路径、第三方包和脚本入口组成。运行同一段代码时，先确定“哪个解释器启动”，再确定“从哪些路径导入模块”，最后才是包管理工具如何把依赖写入对应环境。

| 对象        | 典型位置或变量                       | 作用                        |
|-----------|-------------------------------|---------------------------|
| 解释器       | `sys.executable`              | 执行 Python 字节码，决定运行时版本     |
| 环境前缀      | `sys.prefix`                  | 定位当前环境的库目录和脚本目录           |
| 基础 Python | `sys.base_prefix`             | 记录虚拟环境背后的基础 Python 安装     |
| 模块搜索路径    | `sys.path`                    | 决定 `import` 从哪里查找模块       |
| 标准库       | `lib/pythonX.Y`               | 跟随 Python 版本提供内置模块        |
| 第三方包      | `site-packages`               | 保存由 `pip` / `uv` 安装的包     |
| 可执行脚本     | `.venv/bin` / `.venv\Scripts` | 保存 `pytest`、`ruff` 等命令行入口 |

### 1.1 解释器{#解释器}

一个 Python 版本包含 `python` 可执行文件、标准库和支撑文件。命令行里运行的 `python`、`python3`、`python3.12`
首先是一个解释器入口，它决定当前进程使用哪套运行时。

```python
import sys

print(sys.executable.endswith('python') or 'python' in sys.executable) # True
print(sys.version_info.major >= 3) # True
```

常见路径：

| 对象                | 含义                      |
|-------------------|-------------------------|
| `sys.executable`  | 当前 Python 进程对应的解释器可执行文件 |
| `sys.prefix`      | 当前环境前缀；在虚拟环境中指向虚拟环境目录   |
| `sys.base_prefix` | 创建当前环境所用的基础 Python 前缀   |
| `sys.path`        | 模块搜索路径                  |
| `site-packages`   | 第三方包安装目录                |

虚拟环境中 `sys.prefix != sys.base_prefix`；系统环境中二者通常相等。

```python
import sys

print(isinstance(sys.path, list)) # True
print(sys.prefix == sys.base_prefix or sys.prefix != sys.base_prefix) # True
```

### 1.2 标准库{#标准库}

标准库随 Python 版本安装，提供 `pathlib`、`json`、`asyncio`、`venv` 等模块。它不通过项目内的 `pip install` 单独安装；升级标准库通常意味着更换
Python 解释器版本。

```python
import json
import pathlib

print(json.__name__)              # json
print(pathlib.Path('.').exists()) # True
```

标准库在 `sys.path` 中通常对应几类路径：

| 路径类型                        | 说明                      |
|-----------------------------|-------------------------|
| `pythonXY.zip`              | 标准库的压缩包入口；存在与否取决于具体安装方式 |
| `lib/pythonX.Y`             | 标准库 Python 源码目录         |
| `lib/pythonX.Y/lib-dynload` | 标准库 C 扩展二进制模块目录         |

导入模块时，解释器按 `sys.path` 顺序从前到后搜索。解释器启动时会把几类路径放入 `sys.path`：

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

### 1.3 第三方包{#第三方包}

第三方包来自 PyPI、私有索引、本地 wheel 或源码目录，由 `pip`、`uv` 等工具安装到当前环境的 `site-packages`。

包管理工具安装分发包（distribution package），代码里导入导入包（import
package）。两者名称经常相同，但分别属于安装层和导入层。例如有的分发包会提供多个导入包，也有的导入名与分发名不同。

第三方包除了提供可导入模块，还可能安装命令行脚本。脚本通常被放到当前环境的脚本目录中：

| 平台            | 脚本目录            |
|---------------|-----------------|
| macOS / Linux | `.venv/bin`     |
| Windows       | `.venv\Scripts` |

安装 `ruff`、`pytest`、`black` 这类工具后，命令行能直接执行 `ruff` 或 `pytest`，是因为使用虚拟环境时，激活脚本会把虚拟环境的脚本目录放到
`PATH` 前面，从而优先命中当前项目的工具版本。

可执行脚本的入口通常来自 `pyproject.toml` 的 `[project.scripts]`：

```toml
[project.scripts]
spam-cli = "spam:main"
```

安装该项目后，环境里会出现 `spam-cli` 命令；执行它时会导入 `spam` 模块并调用 `main`。

## 2. 命令行{#命令行}

### 2.1 执行入口{#执行入口}

Python 命令行的基本形态是：

```bash
python [options] [script | -m module-name] [args]
```

常见入口：

| 写法                         | 作用                          | `sys.argv[0]` |
|----------------------------|-----------------------------|---------------|
| `python`                   | 进入交互模式                      | `''`          |
| `python script.py`         | 执行文件                        | 脚本路径          |
| `python -m package.module` | 按导入机制定位模块，并作为 `__main__` 执行 | 模块文件路径        |

`script.py` 和 `-m package.module` 的差异主要在模块定位方式。直接执行文件时，脚本所在目录会进入 `sys.path`；`-m`
先按导入机制查找模块，再把该模块作为顶层模块运行。

脚本或模块入口后的参数会进入 `sys.argv[1:]`，由应用代码自行解析。

### 2.2 常用选项{#常用选项}

日常更常用的是这些选项：

| 选项                 | 作用          |
|--------------------|-------------|
| `-V` / `--version` | 输出版本号       |
| `-VV`              | 输出更详细的构建信息  |
| `-m module`        | 按模块名执行      |
| `-c command`       | 执行字符串代码     |
| `-i`               | 执行脚本后进入交互模式 |

```bash
python -V # Python 3.x.x
```

### 2.3 模块入口{#模块入口}

`python -m` 是工具链中最重要的命令行习惯。它把“使用哪个解释器”和“执行哪个工具模块”绑定在一起。

```bash
python -m pip --version
python -m venv .venv
python -m http.server 8000
python -m unittest
```

直接运行 `pip install ...` 时，命中的 `pip` 来自当前 `PATH`；运行 `python -m pip install ...` 时，`pip` 明确来自这个
`python` 解释器所在的环境。多 Python 版本共存时，后者更不容易装错环境。

模块入口和上一篇的模块知识是同一件事：`python -m package` 会执行 `package.__main__`；`python -m package.module` 会把对应模块作为
`__main__` 执行。

## 3. 虚拟环境{#虚拟环境}

虚拟环境（virtual environment）把一个项目的第三方包、脚本入口和解释器前缀隔离出来。它的隔离范围限于 Python
环境目录。当前 Python 进程会优先使用该环境目录下的解释器、脚本和 `site-packages`。

### 3.1 目录结构{#目录结构}

标准库 `venv` 创建虚拟环境：

```bash
python -m venv .venv
```

典型结构：

```txt
.venv/
├── pyvenv.cfg
├── bin/              # Windows 为 Scripts/
└── lib/pythonX.Y/site-packages/
```

核心文件与目录：

| 路径                                  | 作用                                    |
|-------------------------------------|---------------------------------------|
| `pyvenv.cfg`                        | 记录基础 Python 位置和是否包含系统 `site-packages` |
| `bin/python` / `Scripts\python.exe` | 虚拟环境解释器入口，通常是复制或符号链接                  |
| `bin/pip` / `Scripts\pip.exe`       | 当前环境的 pip 入口                          |
| `site-packages`                     | 当前环境安装的第三方包                           |

创建虚拟环境时，除非指定 `--without-pip`，`venv` 会通过 `ensurepip` 在环境中引导安装 `pip`。

### 3.2 激活脚本{#激活脚本}

激活虚拟环境的作用范围是当前 shell。激活脚本主要修改 `PATH` 和提示符，让命令行优先找到 `.venv` 中的
`python`、`pip` 和脚本。

```bash
source .venv/bin/activate      # macOS / Linux
.venv\Scripts\Activate.ps1     # Windows PowerShell
```

不激活也可以直接使用虚拟环境解释器：

```bash
.venv/bin/python -m pip install requests
.venv/bin/python script.py
```

这种写法在脚本、CI 和文档中更稳定，因为它不依赖当前 shell 是否已经激活环境。

### 3.3 环境重建{#环境重建}

虚拟环境是可重建产物，不应提交到仓库。项目应该提交依赖声明和锁定结果，而非提交 `.venv`。

| 文件                 | 作用            | 是否通常提交   |
|--------------------|---------------|----------|
| `.venv/`           | 本地虚拟环境目录      | 否        |
| `requirements.txt` | pip 依赖输入或冻结结果 | 是        |
| `constraints.txt`  | 约束依赖版本，但不触发安装 | 是        |
| `pyproject.toml`   | 项目元数据、依赖、工具配置 | 是        |
| `uv.lock`          | uv 锁定的完整解析结果  | 应用项目通常提交 |

普通脚本项目可以用 `requirements.txt` 重建；现代项目更适合用 `pyproject.toml` 声明依赖，再用锁文件固定解析结果。

## 4. pip{#pip}

`pip` 是 Python 生态最基础的包安装器。它负责从索引、本地文件、wheel 或源码目录安装分发包，并把包文件、元数据和脚本入口写入当前环境。

### 4.1 解释器绑定{#解释器绑定}

优先使用 `python -m pip`：

```bash
python -m pip install requests
python -m pip list
python -m pip show requests
python -m pip uninstall requests
```

这样写能确保包安装到当前 `python` 对应的环境。多版本共存时，下面两条命令可能指向不同环境：

```bash
pip install requests
python -m pip install requests
```

安装目标也可以是本地 wheel、源码目录、带 extras 的包或版本约束：

```bash
python -m pip install "aiohttp[speedups]"
python -m pip install "django>=5,<6"
python -m pip install ./dist/example-0.1.0-py3-none-any.whl
```

### 4.2 依赖文件{#依赖文件}

`requirements.txt` 本质上是一组 `pip install` 参数。它可以手写直接依赖，也可以保存某个环境的完整冻结结果。

```txt
requests==2.32.5
aiohttp>=3.12,<4
```

按依赖文件安装：

```bash
python -m pip install -r requirements.txt
```

`pip freeze` 输出当前环境中已安装分发包的版本固定结果，格式可直接交给 `pip install -r`：

```bash
python -m pip freeze
python -m pip freeze > requirements.lock.txt
python -m pip install -r requirements.lock.txt
```

`freeze` 记录的是环境快照。它会把直接依赖和传递依赖一起列出。例如项目只主动安装 `requests`，冻结结果中还会出现 `urllib3`、
`certifi`
等由 `requests` 引入的包：

```txt
certifi==2026.6.1
charset-normalizer==3.4.4
idna==3.11
requests==2.32.5
urllib3==2.5.0
```

`freeze` 的适用场景：

| 场景             | 用法                                             |
|----------------|------------------------------------------------|
| 保存脚本或应用当前可运行环境 | `python -m pip freeze > requirements.lock.txt` |
| 复现一次问题现场       | 提交或附带 freeze 输出，便于重建相同包版本                      |
| 从旧项目迁移         | 先 freeze 当前环境，再逐步整理直接依赖                        |

`freeze` 的限制：

| 限制              | 影响                               |
|-----------------|----------------------------------|
| 不区分直接依赖和传递依赖    | 很难看出项目主动依赖了哪些包                   |
| 不表达 Python 版本要求 | 需要另用 `requires-python`、文档或运行环境声明 |
| 不表达构建系统和项目元数据   | 发布项目仍应使用 `pyproject.toml`        |
| 会记录当前环境状态       | 环境中临时安装的调试包也可能进入输出               |

因此，应用项目可以提交锁定结果以重建部署环境；库项目应在 `pyproject.toml` 中声明兼容范围，让使用方在自己的依赖图中解析。

`constraints.txt` 只限制版本，不主动触发安装：

```bash
python -m pip install -r requirements.txt -c constraints.txt
```

例如 `requirements.txt` 写 `requests`，`constraints.txt` 写 `urllib3<3`，安装时会安装 `requests`，并把它依赖的 `urllib3`
限制在
`<3` 范围内。

### 4.3 项目元数据{#项目元数据}

现代 Python 项目通常用 `pyproject.toml` 描述项目。承载构建系统、项目元数据和工具配置。

```toml
[build-system]
requires = ["hatchling >= 1.26"]
build-backend = "hatchling.build"

[project]
name = "example"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
  "requests>=2.32",
]

[project.optional-dependencies]
dev = [
  "pytest",
  "ruff",
]
```

关键表：

| 表                                 | 作用                                 |
|-----------------------------------|------------------------------------|
| `[build-system]`                  | 声明构建后端和构建依赖                        |
| `[project]`                       | 声明项目名称、版本、Python 版本要求、运行依赖         |
| `[project.optional-dependencies]` | 声明 extras，例如 `example[dev]`        |
| `[project.scripts]`               | 声明安装后生成的命令行入口                      |
| `[tool.xxx]`                      | 放置工具私有配置，例如 `ruff`、`mypy`、`pytest` |

`requirements.txt` 记录安装清单；`pyproject.toml` 记录项目声明。应用项目通常还需要锁文件固定解析结果；库项目通常声明兼容范围，让使用方在自己的环境中解析。

## 5. uv{#uv}

### 5.1 工具定位{#工具定位}

`uv` 是用 Rust 编写的 Python 包与项目管理工具。它把多个工具链角色合并到一个 CLI 中：Python 版本管理、虚拟环境、pip
兼容安装、项目依赖、锁文件、脚本运行和命令行工具安装。

它有两条主线：

| 主线        | 命令                                                       | 适用对象                                |
|-----------|----------------------------------------------------------|-------------------------------------|
| pip 兼容工作流 | `uv venv`、`uv pip install`、`uv pip freeze`、`uv pip sync` | 已有 `requirements.txt` 项目            |
| 项目工作流     | `uv init`、`uv add`、`uv lock`、`uv sync`、`uv run`          | 使用 `pyproject.toml` 和 `uv.lock` 的项目 |

### 5.2 Python 版本命令{#Python版本命令}

`uv` 可以发现系统已有 Python，也可以安装 uv 管理的 Python。项目可以通过 `.python-version` 文件固定默认版本。

```bash
uv python list
uv python install 3.12
uv python pin 3.12
uv venv --python 3.12
```

`.python-version` 记录版本请求，虚拟环境目录仍由 `.venv/` 或其他环境目录保存：

```txt
3.12
```

`uv` 在项目命令中还会读取 `pyproject.toml` 的 `requires-python`。如果没有找到合适解释器，`uv` 可以按需要下载受管理的
Python 版本。

常用命令：

| 命令                       | 作用                        |
|--------------------------|---------------------------|
| `uv python list`         | 列出可用或可安装的 Python 版本       |
| `uv python install 3.12` | 安装 uv 管理的 Python 3.12     |
| `uv python pin 3.12`     | 在当前项目写入 `.python-version` |
| `uv venv --python 3.12`  | 用指定 Python 创建虚拟环境         |

### 5.3 虚拟环境与 pip 兼容命令{#虚拟环境与pip兼容命令}

已有 `requirements.txt` 项目可以先用 pip 兼容模式：

```bash
uv venv
uv pip install -r requirements.txt
uv pip install ruff
```

`uv` 默认会查找当前目录或父目录中的 `.venv`。如果已经激活其他虚拟环境，它也会识别 `VIRTUAL_ENV`。

pip 兼容命令不要求项目存在 `pyproject.toml`：

| 命令                                   | 作用                         |
|--------------------------------------|----------------------------|
| `uv venv`                            | 创建 `.venv` 虚拟环境            |
| `uv venv --python 3.12`              | 指定 Python 版本创建虚拟环境         |
| `uv pip install requests`            | 向当前环境安装包                   |
| `uv pip install -r requirements.txt` | 按依赖文件安装                    |
| `uv pip freeze`                      | 以 requirements 格式列出当前环境包版本 |
| `uv pip sync requirements.txt`       | 将环境同步到依赖文件描述的结果            |

`uv pip sync` 适合把环境修正到文件指定状态。临时调试包如果不在依赖文件中，下一次 sync 会被移除。

### 5.4 项目命令{#项目命令}

新项目可以使用项目模式：

```bash
uv init example-app
cd example-app
uv add requests
uv run python main.py
uv lock
uv sync
```

项目命令围绕 `pyproject.toml`、`uv.lock` 和 `.venv/` 工作：

| 命令                      | 作用              | 常用选项                                        |
|-------------------------|-----------------|---------------------------------------------|
| `uv init [PATH]`        | 创建新项目           | `--app`、`--lib`、`--package`、`--bare`        |
| `uv add requests`       | 添加运行依赖          | `--dev`、`--optional`、`--group`、`--editable` |
| `uv remove requests`    | 删除依赖            | 可指定普通依赖或依赖组                                 |
| `uv sync`               | 按锁文件同步 `.venv/` | `--locked`、`--frozen`、`--inexact`           |
| `uv run python main.py` | 在项目环境中运行命令      | `--with`、`--group`、`--no-sync`              |

`uv add` 会修改 `pyproject.toml` 中的依赖声明，并更新 `uv.lock`。默认情况下，它还会同步环境；使用 `--no-sync` 可以只改项目文件。

依赖可以按用途写入不同位置：

| 写法                           | 写入位置                                  | 适用场景          |
|------------------------------|---------------------------------------|---------------|
| `uv add requests`            | `[project].dependencies`              | 运行时依赖         |
| `uv add pytest --dev`        | 开发依赖组                                 | 测试、格式化、类型检查工具 |
| `uv add rich --optional cli` | `[project.optional-dependencies].cli` | extras 依赖     |
| `uv add -r requirements.txt` | 项目依赖声明                                | 从旧依赖文件迁移      |

### 5.5 锁文件{#锁文件}

`uv.lock` 记录完整解析结果：包版本、来源、依赖关系、环境标记和校验信息。它服务于项目环境重建，避免每次安装都重新选择依赖版本。

核心文件：

| 文件                | 作用             | 是否提交     |
|-------------------|----------------|----------|
| `pyproject.toml`  | 项目元数据和直接依赖声明   | 是        |
| `uv.lock`         | 完整解析结果，用于可重复同步 | 应用项目通常提交 |
| `.python-version` | 默认 Python 版本请求 | 通常提交     |
| `.venv/`          | 本地环境目录         | 否        |

锁文件相关命令：

| 命令                  | 作用                     |
|---------------------|------------------------|
| `uv lock`           | 解析依赖并更新 `uv.lock`      |
| `uv lock --check`   | 检查 `uv.lock` 是否已经是最新状态 |
| `uv sync`           | 按 `uv.lock` 同步项目环境     |
| `uv sync --locked`  | 要求锁文件保持不变              |
| `uv sync --frozen`  | 使用现有锁文件同步环境            |
| `uv sync --inexact` | 同步依赖时保留环境中的额外包         |

`uv sync` 默认按锁文件做精确同步，会移除锁文件之外的包。CI 和容器构建适合使用 `uv sync --locked` 或 `uv sync --frozen`；
本地临时实验可以使用 `uv run` 或 `uv sync --inexact`。

### 5.6 运行命令{#运行命令}

`uv run` 在项目环境中执行命令。执行前，uv 会检查项目依赖并准备环境；命令结束后，环境保留在 `.venv/` 中。

```bash
uv run python main.py
uv run -m pytest
uv run --with rich python script.py
```

常用写法：

| 写法                                    | 作用           |
|---------------------------------------|--------------|
| `uv run python main.py`               | 用项目环境运行脚本    |
| `uv run -m pytest`                    | 用项目环境运行模块    |
| `uv run --with rich python script.py` | 临时带上额外包运行脚本  |
| `uv run --locked ...`                 | 运行前要求锁文件保持不变 |
| `uvx ruff --version`                  | 一次性运行命令行工具   |

## 6. 工作流选择{#工作流选择}

工具链选择应先看项目形态：

| 场景          | 推荐工作流                                                                |
|-------------|----------------------------------------------------------------------|
| 单文件脚本，只用标准库 | 直接 `python script.py`                                                |
| 小脚本需要少量第三方包 | `python -m venv .venv` + `python -m pip install -r requirements.txt` |
| 已有 pip 项目   | 继续 `venv + python -m pip`，或迁移到 `uv venv + uv pip`                    |
| 新应用项目       | `uv init` + `uv add` + 提交 `pyproject.toml` 和 `uv.lock`               |
| 发布库         | `pyproject.toml` 声明兼容范围，避免用应用锁文件约束使用方环境                              |
| CI / 容器     | 明确 Python 版本，使用锁文件同步环境，不依赖交互式激活                                      |

Python 工具链的主线是：解释器决定运行时，虚拟环境决定安装位置，`pip` / `uv` 决定如何解析和写入依赖，
`pyproject.toml` 与锁文件决定项目能否被稳定重建。
