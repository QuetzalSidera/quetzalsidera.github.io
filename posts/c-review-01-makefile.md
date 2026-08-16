---
title: Makefile 笔记
date: 2026-04-08
tags: [ Makefile, C, C++ ]
pinned: false
collection: C/C++复习
outline:
  - title: 1. C/C++ 编译过程
    slug: C-C++编译过程
  - title: 1.1 预处理、编译、汇编与链接
    slug: 预处理编译汇编与链接
    level: 1
  - title: 1.1.1 预处理
    slug: 预处理
    level: 2
  - title: 1.1.2 编译
    slug: 编译
    level: 2
  - title: 1.1.3 汇编
    slug: 汇编
    level: 2
  - title: 1.1.4 链接
    slug: 链接
    level: 2
  - title: 1.2 编译器驱动的一步构建
    slug: 编译器驱动的一步构建
    level: 1
  - title: 1.3 常用 GCC 选项
    slug: 常用GCC选项
    level: 1

  - title: 2. Makefile
    slug: Makefile
  - title: 2.1 规则
    slug: 规则
    level: 1
  - title: 2.1.1 隐式规则
    slug: 隐式规则
    level: 2
  - title: 2.1.2 模式规则
    slug: 模式规则
    level: 2
  - title: 2.2 变量、条件与函数
    slug: 变量条件与函数
    level: 1
  - title: 2.2.1 变量赋值
    slug: 变量赋值
    level: 2
  - title: 2.2.2 条件判断
    slug: 条件判断
    level: 2
  - title: 2.2.3 内置函数
    slug: 内置函数
    level: 2
  - title: 2.3 命令回显与错误处理
    slug: 命令回显与错误处理
    level: 1
  - title: 2.4 伪目标
    slug: 伪目标
    level: 1
  - title: 2.5 依赖识别
    slug: 依赖识别
    level: 1
  - title: 2.5.1 时间戳与目标重建
    slug: 时间戳与目标重建
    level: 2
  - title: '2.5.2 头文件依赖与 `.d` 文件'
    slug: 头文件依赖与-d-文件
    level: 2
  - title: 2.5.3 自动依赖的接入方式
    slug: 自动依赖的接入方式
    level: 2
  - title: '2.5.4 传统 `%.d: %.c` 规则'
    slug: 传统-d-c-规则
    level: 2
  - title: 2.5.5 被包含 makefile 的重建
    slug: 被包含makefile的重建
    level: 2
  - title: 2.5.6 两种依赖生成流程
    slug: 两种依赖生成流程
    level: 2
  - title: 2.5.7 完整示例
    slug: 完整示例
    level: 2

  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 从 C/C++ 编译产物出发，整理 GNU Make 的规则、变量、条件、隐式规则、模式规则、增量构建与头文件依赖生成。
  - - meta
    - name: keywords
      content: Makefile, GNU Make, GCC, C语言, C++, 构建系统, 增量编译, 依赖管理
---

本篇从 C/C++ 编译产物出发，整理 GNU Make 如何用规则描述构建图，以及它如何依据时间戳和头文件依赖完成增量构建。

---

文中的命令均可以在 Unix shell、GNU Make 和 GCC 兼容编译器上运行。

## 1. C/C++ 编译过程{#C-C++编译过程}

C/C++ 构建中，每个翻译单元（.c/.cpp等）先生成目标文件（.o），链接器再把目标文件和库组合成最终产物（可执行文件或库文件）。Makefile
描述的正是这些产物之间的依赖关系。

### 1.1 预处理、编译、汇编与链接{#预处理编译汇编与链接}

以最小的 `main.c` 为例：

```c
#include <stdio.h>

int main(void)
{
    printf("Hello, C!\n");
    return 0;
}
```

从源码到可执行文件通常经过四个阶段：

| 阶段  | 主要输入          | 主要输出                | GCC 选项  |
|-----|---------------|---------------------|---------|
| 预处理 | `.c` / `.cpp` | 展开后的源码 `.i` / `.ii` | `-E`    |
| 编译  | 预处理结果         | 汇编代码 `.s`           | `-S`    |
| 汇编  | 汇编代码          | 目标文件 `.o`           | `-c`    |
| 链接  | 目标文件与库        | 可执行文件或库             | 不指定停止选项 |

GCC 命令既能调用具体编译阶段，也能作为驱动程序把多个阶段串起来。

#### 1.1.1 预处理{#预处理}

预处理器处理 `#include`、`#define` 和条件编译指令，并移除注释。

```bash
gcc -E main.c -o main.i
```

`#include` 引入的头文件内容会进入当前翻译单元，宏会在这一阶段展开，注释与被条件编译排除的区域会在这一阶段被移除。

#### 1.1.2 编译{#编译}

编译阶段将预处理后的 C/C++ 代码编译为为汇编代码。

```bash
gcc -S main.i -o main.s
```

编译器在这一阶段完成语法与语义检查、优化和指令选择，并输出面向目标架构的汇编代码。

#### 1.1.3 汇编{#汇编}

汇编器把汇编代码转换为目标文件。目标文件已经包含机器指令、符号表和重定位信息，但其中的外部符号尚未解析，因此通常不能直接运行。

```bash
gcc -c main.s -o main.o
```

`-c` 选项可以接受源文件输入，一并执行预处理、编译和汇编，在生成 `main.o` 后停止。

```bash
gcc -c main.c -o main.o
```

#### 1.1.4 链接{#链接}

链接器合并目标文件和库，解析符号引用并处理重定位，最终生成可执行文件。多文件程序的链接命令会同时接收多个目标文件：

```bash
gcc main.o print.o -o main
```

C++ 程序通常用 `g++` 完成最终链接，因为它会自动加入 C++ 运行时和标准库：

```bash
g++ main.o print.o -o main
```

### 1.2 编译器驱动的一步构建{#编译器驱动的一步构建}

```bash
gcc main.c print.c -o main
g++ main.cpp print.cpp -o main
```

没有停止选项时，编译器驱动会依次调用预处理器、编译器、汇编器和链接器。不同停止选项将生成不同产物：

| 选项    | 执行到    | 是否链接 |
|-------|--------|------|
| `-E`  | 预处理结果  | 否    |
| `-S`  | 汇编代码   | 否    |
| `-c`  | 目标文件   | 否    |
| 无停止选项 | 最终链接产物 | 是    |

多文件项目保留独立 `.o` 文件后，未修改的翻译单元可以跳过预处理、编译与汇编阶段，只参与最后链接，这也是增量构建的基础。

### 1.3 常用 GCC 选项{#常用GCC选项}

编译选项应按生效阶段区分。`-I`、`-D` 影响预处理，`-Wall`、`-O2` 主要影响编译，`-g` 生成的信息会保留到目标文件和链接产物中，
`-L`、`-l` 则用于链接。

| 类别 | 常用选项 | 作用 | 影响阶段 |
|------|---------|-----|---------|
| 语言模式 | `-std=c17`、`-std=c++20` | 选择语言标准，并改变部分预定义宏 | 预处理、编译 |
| 警告 | `-Wall`、`-Wextra`、`-Werror` | 启用警告，或把警告提升为错误 | 编译 |
| 优化 | `-O0`、`-Og`、`-O2`、`-O3` | 控制优化级别 | 编译 |
| 调试信息 | `-g` | 生成并保留供调试器使用的信息 | 编译、汇编；链接产物保留 |
| 头文件与宏 | `-I<dir>`、`-DNAME=value` | 添加头文件目录或定义宏 | 预处理 |
| 目标架构 | `-march=<arch>` | 选择可用指令集和目标特性 | 编译 |
| 库搜索 | `-L<dir>`、`-l<name>` | 添加库目录并链接 `lib<name>` | 链接 |
| 位置无关代码 | `-fPIC` | 生成适合共享库使用的位置无关代码 | 编译 |
| 共享库 | `-shared` | 生成共享库而非普通可执行文件 | 链接 |
| 依赖生成 | `-MMD`、`-MP`、`-MF <file>` | 输出 Makefile 可读取的头文件依赖 | 预处理 |

## 2. Makefile{#Makefile}

下面的小项目包含两个翻译单元：

```text
.
├── Makefile
├── main.c
├── print.c
└── print.h
```

`main.c`：

```c
#include "print.h"

int main(void)
{
    print_number(1);
    return 0;
}
```

`print.c`：

```c
#include "print.h"

#include <stdio.h>

void print_number(int value)
{
    printf("%d\n", value);
}
```

`print.h`：

```c
#ifndef PRINT_H
#define PRINT_H

void print_number(int value);

#endif
```

构建产物的关系是：

```text
main.c  ─┐
print.h ─┴─> main.o   ─┐
                       ├─> main
print.c ─┐             │
print.h ─┴─> print.o ──┘
```

Makefile 用规则表达这张有向依赖图，`make` 负责按图选择并执行必要的命令。

### 2.1 规则{#规则}

规则由目标、依赖和构建命令组成：

```makefile
target: prerequisites
	command
```

| 部分              | 含义                 |
|-----------------|--------------------|
| `target`        | 要生成或更新的文件，也可以是动作名称 |
| `prerequisites` | 生成目标所需的文件或其他目标     |
| `command`       | 目标过期时执行的 `recipe`  |

`recipe` 默认以 Tab 开头。普通空格不会被当作 `recipe` 前缀，这是 Makefile 中常见的语法错误来源。

显式写出示例项目的规则：

```makefile
main: main.o print.o
	cc main.o print.o -o main

main.o: main.c print.h
	cc -c main.c -o main.o

print.o: print.c print.h
	cc -c print.c -o print.o
```

不指定目标时，`make` 默认构建第一个普通目标；这里是 `main`。也可以直接请求局部目标：

```bash
make main.o
```

每条 recipe 行通常由独立的 shell 进程执行。需要共享 shell 状态的命令应写在同一 recipe 行，或使用反斜杠续行。

后续规则会用到两类替换语法。普通变量先定义再通过 `$(变量名)` 引用：

```makefile
CC = gcc

main: main.o print.o
	$(CC) main.o print.o -o main
```

自动变量由 `make` 根据当前规则提供，只在 recipe 执行时有值：

| 自动变量 | 含义 |
|---------|-----|
| `$@` | 当前目标 |
| `$<` | 第一个依赖 |
| `$^` | 去重后的全部依赖 |
| `$?` | 比目标新的依赖 |
| `$*` | 模式规则匹配到的主干 |

例如在 `main.o: main.c` 的 recipe 中，`$@` 是 `main.o`，`$<` 是 `main.c`。变量的展开时机与赋值方式在 2.2 节继续说明。

#### 2.1.1 隐式规则{#隐式规则}

GNU Make 内置了一组隐式规则。即使 Makefile 只写链接规则，`make` 也可能根据同名的 `.c` 文件生成缺失的 `.o`：

```makefile
main: main.o print.o
	$(CC) $^ -o $@
```

内置的 C 编译规则会读取 `CC`、`CPPFLAGS` 和 `CFLAGS` 等变量。简单项目可以借此省略 `.c` 到 `.o` 的 recipe；需要明确控制命令时则应写出模式规则。

#### 2.1.2 模式规则{#模式规则}

模式规则用 `%` 表示可变化的文件主干：

```makefile
%.o: %.c
	$(CC) $(CPPFLAGS) $(CFLAGS) -c $< -o $@
```

`main.o: main.c` 与 `print.o: print.c` 都能匹配这条规则。在这条模式规则中：

- `$<` 展开为匹配到的 `.c` 文件；
- `$@` 展开为当前要生成的 `.o` 文件。

链接规则与模式规则可以组合为：

```makefile
CC = gcc
CPPFLAGS =
CFLAGS = -Wall -Wextra -O2
LDFLAGS =
LDLIBS =

TARGET = main
OBJS = main.o print.o

$(TARGET): $(OBJS)
	$(CC) $(LDFLAGS) $^ $(LDLIBS) -o $@

%.o: %.c
	$(CC) $(CPPFLAGS) $(CFLAGS) -c $< -o $@
```

链接命令把 `LDFLAGS` 放在目标文件之前，把 `LDLIBS` 放在目标文件之后。这样的顺序同时表达了链接器选项与库依赖的不同角色。

### 2.2 变量、条件与函数{#变量条件与函数}

前面只使用了变量最基本的定义和引用。本节继续整理变量的展开时机、解析期条件，以及建立文件列表时常用的内置函数。Make 变量保存文本；文件列表看起来像数组，但本质上仍是由空白分隔的字符串，因此包含空格的文件名不适合直接放入常规文件列表。

定义和引用变量：

```makefile
TARGET = main
SRCS = main.c print.c
OBJS = $(SRCS:.c=.o)
```

`$(SRCS:.c=.o)` 是替换引用，把每个单词末尾的 `.c` 换成 `.o`，因此 `OBJS` 的值为 `main.o print.o`。

编译工具链常用变量有明确分工：

| 变量         | 典型内容                  | 使用阶段        |
|------------|-----------------------|-------------|
| `CC`       | `gcc`、`clang`         | C 编译和链接驱动   |
| `CXX`      | `g++`、`clang++`       | C++ 编译和链接驱动 |
| `CPPFLAGS` | `-Iinclude -DDEBUG=1` | 预处理         |
| `CFLAGS`   | `-Wall -Wextra -O2`   | C 编译        |
| `CXXFLAGS` | `-Wall -Wextra -O2`   | C++ 编译      |
| `LDFLAGS`  | `-Llib -Wl,...`       | 链接器选项       |
| `LDLIBS`   | `-lm -lpthread`       | 链接库         |

#### 2.2.1 变量赋值{#变量赋值}

| 运算符  | 展开时机        | 主要用途           |
|------|-------------|----------------|
| `=`  | 引用变量时展开右侧   | 右侧需要读取后续定义或动态值 |
| `:=` | 定义变量时立即展开右侧 | 固定一次计算结果       |
| `?=` | 变量从未定义时才赋值  | 为自定义变量提供默认值    |
| `+=` | 向现有值追加文本    | 累积选项或文件列表      |

递归展开与立即展开的差异：

```makefile
COMMON_FLAGS = -Wall

RECURSIVE = $(COMMON_FLAGS)
IMMEDIATE := $(COMMON_FLAGS)

COMMON_FLAGS = -Wall -Wextra
```

最终 `RECURSIVE` 是 `-Wall -Wextra`，`IMMEDIATE` 仍是 `-Wall`。

`?=` 只检查变量是否已经定义，不检查值是否为空。GNU Make 的内置变量也算已定义，因此下面的写法通常不会把 `CC` 改成 `gcc`：

```makefile
CC ?= gcc
```

GNU Make 默认已经定义 `CC = cc`。需要选择默认编译器时直接写普通赋值即可：

```makefile
CC = gcc
BUILD ?= release
```

命令行变量的优先级高于普通 Makefile 赋值，所以调用方仍然可以覆盖它：

```bash
make CC=clang BUILD=debug
```

#### 2.2.2 条件判断{#条件判断}

`ifeq`、`ifneq`、`ifdef` 和 `ifndef` 是 Makefile 的解析期条件，而非 recipe 命令。条件指令不能以 recipe 的 Tab 开头。

```makefile
BUILD ?= release

ifeq ($(BUILD),debug)
CFLAGS += -O0 -g
else ifeq ($(BUILD),release)
CFLAGS += -O2
else
$(error unsupported BUILD mode: $(BUILD))
endif

ifdef SANITIZE
CFLAGS += -fsanitize=address
LDFLAGS += -fsanitize=address
endif
```

调用方式：

```bash
make BUILD=debug
make BUILD=debug SANITIZE=1
```

`ifdef SANITIZE` 判断的是变量值是否非空，因此 `SANITIZE=0` 也会进入该分支。需要判断具体值时应使用 `ifeq ($(SANITIZE),1)`。

可选配置文件也可以在解析期判断：

```makefile
ifneq ($(wildcard config.mk),)
include config.mk
endif
```

#### 2.2.3 内置函数{#内置函数}

GNU Make 函数使用 `$(函数名 参数)` 形式。参数通常是由空白分隔的单词列表，多个参数之间用逗号分隔。下面以文件列表为主线说明常用函数。

`addprefix` 和 `addsuffix` 分别为列表中的每个单词添加前缀或后缀：

```makefile
FILES := main.c print.c
SRCS := $(addprefix src/,$(FILES))
OBJS := $(addsuffix .o,main print)
```

`SRCS` 得到 `src/main.c src/print.c`，`OBJS` 得到 `main.o print.o`。这两个函数适合为结构一致的文件名批量补齐目录或扩展名。

`subst` 直接替换文本中所有匹配片段，`patsubst` 则按单词匹配模式，其中 `%` 表示可复用的主干：

```makefile
FILES := main.c print.c
OBJS_BY_TEXT := $(subst .c,.o,$(FILES))
OBJS_BY_PATTERN := $(patsubst %.c,%.o,$(FILES))
```

两者在这个例子中都得到 `main.o print.o`。处理文件后缀时，`patsubst` 明确要求单词匹配 `%.c`，不会误改文件名中间出现的 `.c` 文本。

`wildcard` 按文件系统中的实际路径展开通配符；`dir`、`notdir`、`basename` 和 `suffix` 负责拆分路径：

```makefile
SRCS := $(wildcard src/*.c)
DIRS := $(dir $(SRCS))
NAMES := $(notdir $(SRCS))
BASES := $(basename $(NAMES))
SUFFIXES := $(suffix $(NAMES))
```

若 `SRCS` 是 `src/main.c src/print.c`，则 `DIRS` 是 `src/ src/`，`NAMES` 是 `main.c print.c`，`BASES` 是 `main print`，
`SUFFIXES` 是 `.c .c`。`wildcard` 只返回展开时已经存在的路径；没有匹配项时返回空文本。

`filter` 和 `filter-out` 按模式保留或排除单词，`sort` 排序的同时去重：

```makefile
FILES := main.c print.c print.h print.c
C_SRCS := $(filter %.c,$(FILES))
HEADERS := $(filter %.h,$(FILES))
NON_C := $(filter-out %.c,$(FILES))
UNIQUE := $(sort $(FILES))
```

这里 `C_SRCS` 保留 C 源文件，`HEADERS` 只保留头文件，`NON_C` 排除 C 源文件；`UNIQUE` 的结果按字典序排列且不含重复项。

`foreach` 对列表逐项展开一段文本，适合根据目录列表生成参数：

```makefile
INCLUDE_DIRS := include third_party/include
CPPFLAGS := $(foreach dir,$(INCLUDE_DIRS),-I$(dir))
```

每次迭代中，临时变量 `dir` 依次取两个目录，因此 `CPPFLAGS` 得到 `-Iinclude -Ithird_party/include`。

`shell` 执行外部命令，并把标准输出转换为 Make 变量中的文本：

```makefile
CURRENT_DIR := $(shell pwd)
```

`shell` 会引入外部进程和环境依赖，并把输出中的换行转换为空格。若把它放在递归展开变量中，每次引用都可能再次执行命令；只需计算一次时应配合 `:=`。

组合这些函数后，可以从源码目录生成目标文件、依赖文件和头文件参数：

```makefile
SRC_DIR := src
SRCS := $(wildcard $(SRC_DIR)/*.c)
OBJS := $(patsubst %.c,%.o,$(SRCS))
DEPS := $(patsubst %.o,%.d,$(OBJS))
CPPFLAGS := $(addprefix -I,include third_party/include)
```

### 2.3 命令回显与错误处理{#命令回显与错误处理}

`make` 默认先打印 recipe，再执行命令。在 recipe 前加 `@` 只关闭这条命令的回显，不会吞掉命令自身的标准输出或错误：

```makefile
main: main.o print.o
	@$(CC) $^ -o $@
```

`make -s` 或 `make --silent` 会关闭整个构建的命令回显。构建失败时，`@` 和 `-s` 都不会忽略退出状态。

`make` 会检查每条 recipe 的退出状态。命令返回非零值时，当前目标构建失败，默认不再执行该目标后续的 recipe：

```makefile
.PHONY: has_error

has_error:
	rm zzz.txt
	echo 'ok'
```

当 `zzz.txt` 不存在时，执行结果类似：

```text
$ make has_error
rm zzz.txt
rm: zzz.txt: No such file or directory
make: *** [has_error] Error 1
```

`rm` 返回非零值后，`echo 'ok'` 不会执行。若某条命令允许失败，可以在 recipe 前加 `-`：

```makefile
.PHONY: ignore_error

ignore_error:
	-rm zzz.txt
	echo 'ok'
```

此时 `make` 仍会报告该命令出错，但会把错误标记为已忽略并继续执行 `echo`。对于“文件不存在也算清理成功”这类预期情况，优先使用命令自身的容错选项：

```makefile
clean:
	rm -f zzz.txt
```

`-rm` 表示由 `make` 忽略任意非零退出状态；`rm -f` 则由 `rm` 把文件不存在视为成功。后者表达的错误边界更具体。

### 2.4 伪目标{#伪目标}

`all`、`clean`、`test` 这类目标表示动作，不对应同名构建产物。应使用 `.PHONY` 声明：

```makefile
.PHONY: all clean

all: main

clean:
	rm -f main main.o print.o
```

伪目标始终被视为需要执行。如果没有 `.PHONY`，目录中一旦出现名为 `clean` 的真实文件，`make clean` 就可能判断目标已经满足而跳过
recipe。

### 2.5 依赖识别{#依赖识别}

增量构建依赖两部分信息：Makefile 中的依赖图，以及文件系统记录的修改时间。依赖图缺失时，即使时间戳准确，`make` 也无法发现受影响的目标。

#### 2.5.1 时间戳与目标重建{#时间戳与目标重建}

`make` 会递归检查目标的依赖。当目标不存在，或任一普通依赖比目标新时，对应 recipe 才会执行。

```makefile
main: main.o print.o
	$(CC) $^ -o $@

main.o: main.c
	$(CC) -c $< -o $@

print.o: print.c
	$(CC) -c $< -o $@
```

依赖图如下：

```text
main
├── main.o
│   └── main.c
└── print.o
    └── print.c
```

修改 `main.c` 后，`main.o` 比依赖旧，因此先重新编译；新的 `main.o` 又比 `main` 新，因此随后重新链接。`print.c` 没有变化时，
`print.o`
会被复用。

Make 比较的是修改时间，不比较文件内容。复制文件、版本控制切换和时钟异常都可能改变时间戳，从而触发额外构建或产生错误判断。

#### 2.5.2 头文件依赖与 `.d` 文件{#头文件依赖与-d-文件}

只写 `main.o: main.c` 会遗漏预处理阶段读入的头文件。示例项目的真实关系是：

```makefile
main.o: main.c print.h
print.o: print.c print.h
```

如果 Makefile 没有记录 `print.h`，修改函数声明后，`make` 可能继续复用旧目标文件。手工列出头文件在小项目中可行，但源码增多后很容易漏掉间接包含关系。

##### 编译器生成依赖文件{#编译器生成依赖文件}

编译器已经掌握每个翻译单元实际包含的头文件，可以在生成 `.o` 的同时输出 Makefile 语法的 `.d` 文件：

```makefile
%.o: %.c
	$(CC) $(CPPFLAGS) $(CFLAGS) -MMD -MP -c $< -o $@
```

| 选项             | 作用                          |
|----------------|-----------------------------|
| `-MMD`         | 生成用户头文件依赖，不记录系统头文件          |
| `-MP`          | 为头文件附加空规则，删除旧头文件后仍可继续解析依赖文件 |
| `-MF <file>`   | 显式指定依赖文件路径                  |
| `-MT <target>` | 显式指定依赖规则中的目标名称              |

编译 `main.c` 后，`main.d` 的内容类似：

```makefile
main.o: main.c print.h

print.h:
```

第一条规则补全 `main.o` 的依赖；第二条空规则来自 `-MP`。它只避免“没有规则可创建旧头文件”的解析错误，不会重新创建已经删除的头文件。

#### 2.5.3 自动依赖的接入方式{#自动依赖的接入方式}

接入自动依赖需要四个部分：

```makefile
SRCS := main.c print.c
OBJS := $(SRCS:.c=.o)
DEPS := $(OBJS:.o=.d)

%.o: %.c
	$(CC) $(CPPFLAGS) $(CFLAGS) -MMD -MP -c $< -o $@

-include $(DEPS)
```

`-include` 把 `.d` 文件作为 Makefile 的补充规则读取。前缀 `-` 允许依赖文件在首次构建前不存在；生成后，后续调用会读取其中的头文件依赖。

清理规则也应删除这些派生产物：

```makefile
clean:
	rm -f $(TARGET) $(OBJS) $(DEPS)
```

#### 2.5.4 传统 `%.d: %.c` 规则{#传统-d-c-规则}

旧项目中还会把 `.d` 作为独立目标生成：

```makefile
%.d: %.c
	@set -e; rm -f $@; \
	$(CC) $(CPPFLAGS) -MM $< > $@.$$$$; \
	sed 's,\($*\)\.o[ :]*,\1.o $@ : ,g' < $@.$$$$ > $@; \
	rm -f $@.$$$$
```

这段规则假设 `.c`、`.o` 和 `.d` 使用相同主干。以 `main.d` 为例：

1. `$(CC) -MM main.c` 输出 `main.o: main.c print.h`。
2. `$*` 是主干 `main`，`$@` 是目标 `main.d`。
3. `sed` 把规则改写为 `main.o main.d: main.c print.h`。
4. recipe 先把编译器输出写入带进程号的临时文件，编译器成功后再由 `sed` 生成最终的 `main.d`。

改写后的双目标规则同时说明：

- `main.o` 在源码或头文件变化时过期；
- `main.d` 也在这些依赖变化时过期。

这里 Makefile 中的 `$$` 会传给 shell 一个 `$`，因此 `$$$$` 最终变成 shell 的进程号 `$$`。新项目通常直接采用 `-MMD -MP`
随编译生成依赖，独立 `%.d` 规则主要用于理解和维护旧构建脚本。

#### 2.5.5 被包含 makefile 的重建{#被包含makefile的重建}

`include` 进来的 `.d` 文件属于 makefile 集合。GNU Make 读取完所有 makefile 后，会尝试按现有规则更新它们；只要其中一个被成功重建，GNU
Make 就重新读取整套规则，再开始构建用户请求的目标。

传统 `%.d: %.c` 规则因此按以下顺序工作：

1. 读取主 Makefile 和已有 `.d` 文件。
2. 检查作为 makefile 的 `.d` 是否缺失或过期。
3. 先执行 `%.d: %.c` 更新依赖文件。
4. 重新读取主 Makefile 和新的 `.d`。
5. 按更新后的依赖图构建最终目标。

不要把被包含的 `.d` 文件声明为伪目标；否则它们会在每次检查时都被视为过期，可能导致反复重新读取。

#### 2.5.6 两种依赖生成流程{#两种依赖生成流程}

随编译生成和独立生成 `.d` 的时机不同：

| 场景      | `-MMD -MP` 随 `.o` 生成          | 独立 `%.d: %.c`             |
|---------|-------------------------------|---------------------------|
| 首次构建    | 编译 `.o` 时顺带生成 `.d`            | 构建目标前先生成 `.d`，然后重新读取      |
| 已有头文件变化 | 旧 `.d` 使对应 `.o` 过期；编译时刷新 `.d` | `.d` 先过期并重建；重新读取后再判断 `.o` |
| 新依赖生效   | 本次编译已经重建 `.o`，新 `.d` 供后续调用读取  | 重启解析后在本次调用中生效             |
| 复杂度     | 规则短，通常优先采用                    | 需要维护单独规则和临时文件             |

两种方式都依赖 `include` 把头文件关系并入构建图。差别只在于 `.d` 是编译 `.o` 的副产物，还是可以被 `make` 单独更新的目标。

#### 2.5.7 完整示例{#完整示例}

下面的模板适用于源码和目标文件位于同一目录的小型 C 项目：

```makefile
CC = gcc
CPPFLAGS =
CFLAGS = -std=c17 -Wall -Wextra -O2
LDFLAGS =
LDLIBS =

TARGET := main
SRCS := main.c print.c
OBJS := $(SRCS:.c=.o)
DEPS := $(OBJS:.o=.d)

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(LDFLAGS) $^ $(LDLIBS) -o $@

%.o: %.c
	$(CC) $(CPPFLAGS) $(CFLAGS) -MMD -MP -c $< -o $@

clean:
	rm -f $(TARGET) $(OBJS) $(DEPS)

-include $(DEPS)
```

验证增量构建：

```bash
make
sleep 1
touch print.h
make
make clean
```

首次执行会编译两个翻译单元并链接。示例中的短暂等待用于避开文件系统时间戳粒度造成的同一时刻判断；实际操作时直接修改并保存
`print.h`
即可。更新后，`main.d` 和 `print.d` 都把它列为依赖，因此两个目标文件都会重新编译，随后重新链接 `main`。

## 小结{#小结}

Makefile 的主线是构建图：

1. 编译器把翻译单元变成目标文件，链接器再生成最终产物。
2. Make 规则用目标、依赖和 recipe 描述产物关系。
3. `make` 根据依赖图和时间戳，只重建过期目标。
4. `.d` 文件把预处理阶段发现的头文件关系补入依赖图。
5. `-MMD -MP` 适合在编译目标文件时生成依赖；独立 `%.d: %.c` 规则解释了被包含 makefile 的重建与重新读取机制。
