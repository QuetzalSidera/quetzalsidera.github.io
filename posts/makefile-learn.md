---
title: Makefile 学习笔记
date: 2026-04-08
tags: [ 笔记, Makefile, C语言 ,C++ ]
pinned: false
collection: 计科笔记
outline:
  - title: C/C++ 编译过程
    slug: compile-flow
  - title: 1. 预处理 编译 汇编 链接
    slug: preprocessing-compiling-assembling-linking
    level: 1
  - title: 1.1 预处理（Preprocessing）
    slug: 1-预处理preprocessing
    level: 2
  - title: 1.2 编译（Compiling）
    slug: 2-编译compiling
    level: 2
  - title: 1.3 汇编（Assembling）
    slug: 3-汇编assembling
    level: 2
  - title: 1.4 链接（Linking）
    slug: 4-链接linking
    level: 2
  - title: 2. 一步到位
    slug: 一步到位
    level: 1
  - title: 3. 常见 GCC Flag
    slug: gcc-flags
    level: 1
  - title: Makefile
    slug: makefile-intro
  - title: 1. 规则（Rule）
    slug: rules
    level: 1
  - title: 1.1 隐式规则
    slug: implicit-rules
    level: 2
  - title: 1.2 模式规则
    slug: pattern-rules
    level: 2
  - title: 2. 变量与条件
    slug: variables
    level: 1
  - title: 2.1 Makefile 内置函数
    slug: make-functions
    level: 2
  - title: 2.2 变量赋值方式
    slug: variable-assignments
    level: 2
  - title: 2.3 条件判断
    slug: conditionals
    level: 2
  - title: 3. 隐藏命令输出
    slug: 隐藏命令输出
    level: 1
  - title: 4. 伪目标
    slug: phony-targets
    level: 1
  - title: 5. 依赖识别
    slug: dependency-tracking
    level: 1
  - title: 5.1 Make 如何判断要不要重建
    slug: make-如何判断要不要重建
    level: 2
  - title: '5.2 只写 `.c` 依赖的问题'
    slug: 只写-c-依赖的问题
    level: 2
  - title: '5.3 解决办法：让编译器顺手生成依赖文件 `.d`'
    slug: 解决办法让编译器顺手生成依赖文件-d
    level: 2
  - title: 5.4 常见写法
    slug: 常见写法
    level: 2
  - title: '5.5 传统 `%.d: %.c` 写法与原理'
    slug: 传统-d-c-写法与原理
    level: 2
  - title: '5.6 为什么本次重新生成的 `.d` 仍然会影响结果'
    slug: 为什么本次重新生成的-d-仍然会影响结果
    level: 2
  - title: 5.7 整个流程串起来看
    slug: 整个流程串起来看
    level: 2
  - title: 5.8 一个更接近实战的小模板
    slug: 一个更接近实战的小模板
    level: 2
  - title: 小结
    slug: summary
head:
  - - meta
    - name: description
      content: 一篇面向初学者的 Makefile 学习笔记，整理了 C/C++ 编译流程、Makefile 基本规则、变量、条件、内置函数、GCC 常用 Flag 与依赖识别。
  - - meta
    - name: keywords
      content: Makefile, GCC, C语言, C++, 构建系统, 增量编译, 依赖管理, 学习笔记
---

一篇从 C/C++ 编译流程入手，系统整理 Makefile 规则、变量、条件判断、内置函数、GCC Flag 与头文件依赖处理的学习笔记。

---

# Makefile 学习笔记

Makefile 在初学阶段经常给人一种“不太直观”的感觉：语法很简短，但背后牵涉到编译流程、依赖关系和增量构建等概念。

如果先把这些概念拆开来看，再回头理解 Makefile，整体会清晰很多。

可以先把它理解成一份“构建说明书”：

- `main.c`、`print.c` 是源文件
- `.o` 文件是编译后的目标文件
- 最终的可执行文件 `main` 是链接后的结果
- `make` 负责根据依赖关系决定哪些内容需要重新构建

这篇笔记按“编译过程 -> Makefile 基本写法 -> 依赖识别”的顺序整理。

---

## 一、C/C++ 编译过程 <a id="compile-flow"></a>

### 1. 预处理 编译 汇编 链接 <a id=preprocessing-compiling-assembling-linking></a>

先准备一个最简单的 `main.c`：

```c
#include <stdio.h>

int main() {
    printf("Hello, Ubuntu C!\n");
    return 0;
}
```

一个 C/C++ 源文件变成可执行文件，通常会经历 4 个阶段：

1. 预处理
2. 编译
3. 汇编
4. 链接

可以先简单理解为：

- 预处理：展开头文件和宏
- 编译：把源码转换成汇编代码
- 汇编：把汇编代码转换成目标文件
- 链接：把多个目标文件和库组合成可执行文件

### 1.1 预处理（Preprocessing）<a id=1-预处理preprocessing></a>

```bash
gcc -E main.c -o main_c.i
g++ -E main.cpp -o main_cpp.i
```

`-E` 的意思是：只做预处理，先别往下走。

预处理主要做这些事：

- 展开 `#include`
- 替换 `#define`
- 处理 `#if`、`#ifdef` 之类的条件编译
- 删除注释

生成的文件一般是 `.i`，可以把它理解成“展开后的源码”。

比如：

```c
#include <stdio.h>
#define PI 3.14

int main() {
    printf("PI = %f\n", PI);
    return 0;
}
```

执行：

```bash
gcc -E test.c -o test.i
```

执行后可以看到 `PI` 已经被替换成 `3.14`，头文件内容也会被展开。

常见搭配：

```bash
gcc -E file.c | less
gcc -E -P file.c -o file.i
gcc -E -dM file.c
```

- 第一条：看看预处理结果
- 第二条：去掉那些 `#` 开头的行号信息
- 第三条：查看当前所有宏定义

### 1.2 编译（Compiling）<a id=2-编译compiling></a>

```bash
gcc -S main_c.i -o main_c.s
g++ -S main_cpp.i -o main_cpp.s
```

`-S` 表示：把代码编译成汇编代码，然后停下。

生成的 `.s` 文件就是汇编代码，它比 C 语言更接近底层机器指令。

常见写法：

```bash
gcc -S hello.c
gcc -S hello.c -o my_asm.s
gcc -S -O2 hello.c
gcc -S -march=armv7-a hello.c
```

- `-O2`：开启优化
- `-march=...`：指定目标架构

这个阶段常用于学习编译结果、分析优化效果，或者观察不同平台下生成的汇编代码。

### 1.3 汇编（Assembling）<a id=3-汇编assembling></a>

```bash
gcc -c main_c.s -o main_c.o
g++ -c main_cpp.s -o main_cpp.o
```

`-c` 表示：编译到目标文件为止，不要链接。

生成的 `.o` 文件是目标文件，它已经完成单个源文件的编译，但还没有和其他目标文件链接在一起。

更常见的写法其实是直接从 `.c` 到 `.o`：

```bash
gcc -c main.c -o main.o
gcc -c print.c -o print.o
```

虽然中间仍然会经过“预处理 -> 编译 -> 汇编”，但 GCC 会自动把这些步骤串起来完成。

多文件项目里，这一步特别重要，因为只改了一个 `.c` 文件时，不需要把整个项目从头做一遍。

### 1.4 链接（Linking）<a id=4-链接linking></a>

```bash
gcc main_c.o -o main_c
g++ main_cpp.o -o main_cpp
```

链接阶段会把多个 `.o` 文件以及依赖的库文件组合起来，形成最终可运行的程序。

### 2.一步到位 <a id=一步到位></a>

平时我们最常见的是直接这么写：

```bash
gcc main.c -o main_c
g++ main.cpp -o main_cpp
```

这相当于让 GCC 把前面的 4 个阶段都自动跑完。

### 3.常见 GCC Flag <a id="gcc-flags"></a>

在实际开发中，`gcc` 很少只写最基础的 `-c` 或 `-o`，通常还会搭配一组常用选项控制警告、优化、调试信息和头文件搜索路径。

下面是一些最常见的选项：

```bash
gcc -Wall -Wextra -O2 -g main.c -o main
```

这条命令里常见选项的含义如下：

- `-Wall`：开启一组常见警告
- `-Wextra`：开启更多额外警告
- `-Werror`：把警告当成错误处理
- `-O0`：不优化，便于调试
- `-O1`、`-O2`、`-O3`：逐步增强优化
- `-Og`：兼顾调试体验和一定优化
- `-g`：生成调试信息，便于 `gdb` 等工具使用
- `-I<dir>`：添加头文件搜索目录
- `-L<dir>`：添加库文件搜索目录
- `-l<name>`：链接某个库，例如 `-lm`
- `-DNAME=value`：定义一个宏
- `-std=c11`、`-std=c17`：指定 C 语言标准
- `-std=c++17`、`-std=c++20`：指定 C++ 标准
- `-fPIC`：生成位置无关代码，常用于构建动态库
- `-shared`：生成动态库
- `-MMD -MP`：生成头文件依赖信息，后面 Makefile 会用到

几个典型例子：

```bash
gcc -Wall -Wextra -g main.c -o main
gcc -O2 main.c -o main
gcc -Iinclude -c src/main.c -o main.o
gcc main.o print.o -L./lib -lmylib -o main
gcc -DDEBUG=1 main.c -o main
```

如果按用途分类，可以简单记成下面几组：

- 调试相关：`-g`、`-O0`、`-Og`
- 警告相关：`-Wall`、`-Wextra`、`-Werror`
- 优化相关：`-O1`、`-O2`、`-O3`
- 头文件和库相关：`-I`、`-L`、`-l`
- 依赖生成相关：`-MMD`、`-MP`

---

# 二、Makefile <a id="makefile-intro"></a>

现在看一个稍微像样一点的小项目：

```text
.
├── main.c
├── print.c
└── print.h
```

`main.c`：

```c
#include <stdio.h>
#include "print.h"

int main()
{
    printf("Start\n");
    for (int i = 1; i <= 5; i++)
    {
        print(i);
    }
    printf("End\n");
    return 0;
}
```

`print.c`：

```c
#include "print.h"
#include <stdio.h>

void print(const int a)
{
    printf("%d\n", a);
}
```

`print.h`：

```c
#ifndef MAKEFILELEARN_PRINT_H
#define MAKEFILELEARN_PRINT_H

void print(const int a);

#endif
```

这个项目的编译过程可以理解成：

1. `main.c + print.h -> main.o`
2. `print.c + print.h -> print.o`
3. `main.o + print.o -> main`

对应的命令大概是：

```bash
gcc -c main.c -o main.o
gcc -c print.c -o print.o
gcc main.o print.o -o main
```

当项目文件变多后，手动维护这些命令会变得低效且容易出错，这也是 Makefile 出现的原因。

Makefile 本质上就是在告诉 `make`：

- 我要生成什么
- 它依赖谁
- 真要生成时，该执行什么命令

### 1.规则（Rule） <a id="rules"></a>

Makefile 的核心就是规则，基本格式如下：

```makefile
target: prerequisites
	command1
	command2
```

注意这里的命令前面通常要用 **Tab** 缩进，而不是空格。这是 Makefile 中最容易出错的细节之一。

对应到上面的项目，可以写成：

```makefile
main: main.o print.o
	cc main.o print.o -o main

main.o: main.c
	cc -c main.c -o main.o

print.o: print.c
	cc -c print.c -o print.o
```

执行 `make`：

```bash
cc -c main.c -o main.o
cc -c print.c -o print.o
cc main.o print.o -o main
```

如果不显式指定目标，`make` 默认会执行第一个目标，也就是这里的 `main`。

你也可以只构建某个局部目标：

```bash
make main.o
```

### 1.1 隐式规则 <a id="implicit-rules"></a>

有时候会发现：即使没有显式写出 `main.o` 和 `print.o` 的规则，`make` 仍然可以完成编译。

比如下面这个 Makefile：

```makefile
main: print.o main.o
	cc print.o main.o -o main
```

为什么它还能工作？

这是因为 `make` 内置了一些默认规则，这些规则称为 **隐式规则**（Implicit Rule）。

比如它大致知道：

```makefile
xyz.o: xyz.c
	cc -c -o xyz.o xyz.c
```

也就是说，当 `make` 发现需要 `main.o`，但没有找到显式规则时，它会尝试查找是否存在 `main.c`，再根据隐式规则完成编译。

### 1.2 模式规则 <a id="pattern-rules"></a>

如果你不想完全依赖隐式规则，也不想一个 `.o` 写一条规则，就可以用模式规则。

```makefile
%.o: %.c
	cc -c $< -o $@
```

这里有几个常见自动变量：

- `$@`：当前目标
- `$<`：第一个依赖
- `$^`：所有依赖

比如对于 `main.o: main.c` 这条规则：

- `$@` 就是 `main.o`
- `$<` 就是 `main.c`

于是可以把 Makefile 写得更简洁：

```makefile
TARGET = main
SRCS = main.c print.c
OBJS = $(SRCS:.c=.o)

$(TARGET): $(OBJS)
	cc $^ -o $@

%.o: %.c
	cc -c $< -o $@
```

这里链接那一行用 `$^` 很合适，因为它确实需要“所有依赖的 `.o` 文件”。

而编译 `.c -> .o` 时，用 `$<` 更准确，因为这里只需要第一个依赖，也就是对应的那个 `.c` 文件。

### 2.变量与条件 <a id="variables"></a>

当文件越来越多时，直接把文件名写死在 Makefile 中会比较繁琐，这时可以通过变量减少重复。

定义变量：

```makefile
VARIABLE_NAME = value
```

使用变量：

```makefile
$(VARIABLE_NAME)
```

例如：

```makefile
TARGET = main
SRCS = main.c print.c
OBJS = $(SRCS:.c=.o)

$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $(TARGET)
```

这里最值得注意的是：

```makefile
OBJS = $(SRCS:.c=.o)
```

它的意思是：把 `SRCS` 里每个文件名的 `.c` 后缀替换成 `.o`。

所以：

```makefile
main.c print.c
```

会变成：

```makefile
main.o print.o
```

这是一种很常见的后缀替换写法。

### 2.1 Makefile 内置函数<a id="make-functions"></a>

除了简单的后缀替换，Makefile 还内置了不少字符串和列表处理函数。文件一多时，这些函数会非常实用。

基本形式如下：

```makefile
$(function arguments)
```

下面列几个最常用的例子。

#### `addprefix`

给列表中的每一项添加统一前缀：

```makefile
FILES = main.c print.c
SRCS = $(addprefix src/,$(FILES))
```

结果是：

```makefile
src/main.c src/print.c
```

如果源文件都放在 `src/` 目录下，这个函数会比手动逐个拼接更方便。

#### `addsuffix`

给列表中的每一项添加统一后缀：

```makefile
NAMES = main print
OBJS = $(addsuffix .o,$(NAMES))
```

结果是：

```makefile
main.o print.o
```

#### `subst`

做简单字符串替换：

```makefile
SRCS = src/main.c src/print.c
OBJS = $(subst .c,.o,$(SRCS))
```

结果是：

```makefile
src/main.o src/print.o
```

#### `patsubst`

按模式做替换，比 `subst` 更灵活：

```makefile
SRCS = src/main.c src/print.c
OBJS = $(patsubst %.c,%.o,$(SRCS))
```

结果是：

```makefile
src/main.o src/print.o
```

#### `wildcard`

按通配符查找文件：

```makefile
SRCS = $(wildcard src/*.c)
```

如果 `src/` 下有多个 `.c` 文件，这个写法可以自动收集它们。

#### `dir` 和 `notdir`

用于拆分路径：

```makefile
SRCS = src/main.c src/print.c
DIRS = $(dir $(SRCS))
FILES = $(notdir $(SRCS))
```

结果分别类似于：

```makefile
src/ src/
main.c print.c
```

#### `basename` 和 `suffix`

用于获取文件名主体或后缀：

```makefile
FILES = main.c print.h
BASES = $(basename $(FILES))
SUFS = $(suffix $(FILES))
```

结果分别是：

```makefile
main print
.c .h
```

#### `filter` 和 `filter-out`

用于筛选列表：

```makefile
FILES = main.c print.c print.h
CSRCS = $(filter %.c,$(FILES))
HEADERS = $(filter %.h,$(FILES))
NON_C = $(filter-out %.c,$(FILES))
```

#### `sort`

排序并去重：

```makefile
FILES = print.c main.c print.c
SORTED = $(sort $(FILES))
```

结果是：

```makefile
main.c print.c
```

#### `foreach`

按列表逐项展开：

```makefile
DIRS = src include lib
FLAGS = $(foreach d,$(DIRS),-I$(d))
```

结果是：

```makefile
-Isrc -Iinclude -Ilib
```

#### `shell`

执行一条 shell 命令，并获取结果：

```makefile
CURRENT_DIR = $(shell pwd)
```

这个函数很方便，但不建议滥用。因为它会让 Makefile 依赖外部命令执行结果，复杂度也会随之增加。

一个更接近实战的例子：

```makefile
SRC_DIR = src
SRCS = $(wildcard $(SRC_DIR)/*.c)
OBJS = $(patsubst %.c,%.o,$(SRCS))
DEPS = $(patsubst %.c,%.d,$(SRCS))
INCLUDES = $(addprefix -I,include third_party/include)
```

这里分别使用了：

- `wildcard` 收集源文件
- `patsubst` 生成 `.o` 和 `.d`
- `addprefix` 生成一组 `-I` 头文件参数

### 2.2 变量赋值方式 <a id="variable-assignments"></a>

Makefile 中常见的赋值方式不止 `=` 一种，不同写法的行为略有区别。

#### `=`

递归展开赋值。变量在真正使用时才展开右侧内容。

```makefile
CC = gcc
CFLAGS = $(COMMON_FLAGS) -O2
COMMON_FLAGS = -Wall -Wextra
```

最终 `CFLAGS` 会展开成：

```makefile
-Wall -Wextra -O2
```

#### `:=`

立即展开赋值。变量在定义时就完成右侧展开。

```makefile
COMMON_FLAGS = -Wall
CFLAGS := $(COMMON_FLAGS) -O2
COMMON_FLAGS = -Wall -Wextra
```

此时 `CFLAGS` 仍然是：

```makefile
-Wall -O2
```

因为它在赋值那一刻就已经确定了。

#### `?=`

条件赋值。只有变量此前没有定义时，才会进行赋值。

```makefile
CC ?= gcc
CFLAGS ?= -O2
```

这个写法在写可复用 Makefile 时很常见，因为它允许用户从命令行覆盖变量：

```bash
make CC=clang CFLAGS="-O0 -g"
```

如果命令行已经传入 `CC` 或 `CFLAGS`，那么 `?=` 这一行就不会再覆盖它。

#### `+=`

追加赋值：

```makefile
CFLAGS = -Wall
CFLAGS += -Wextra
CFLAGS += -O2
```

结果会变成：

```makefile
-Wall -Wextra -O2
```

一个常见组合如下：

```makefile
CC ?= gcc
CFLAGS ?= -O2
CFLAGS += -Wall -Wextra
```

这种写法比较适合做默认配置：既给出推荐值，又保留用户覆盖空间。

### 2.3 条件判断 <a id="conditionals"></a>

Makefile 也支持简单条件判断，常见写法有 `ifeq`、`ifneq`、`ifdef`、`ifndef`。

#### `ifeq`

判断两个值是否相等：

```makefile
CC ?= gcc

ifeq ($(CC),gcc)
    CFLAGS += -Wall
endif
```

如果 `CC` 是 `gcc`，就追加 `-Wall`。

也常用于区分构建模式：

```makefile
BUILD ?= release

ifeq ($(BUILD),debug)
    CFLAGS += -O0 -g
else
    CFLAGS += -O2
endif
```

#### `ifneq`

判断两个值是否不相等：

```makefile
ifneq ($(wildcard config.mk),)
    include config.mk
endif
```

这里的意思是：如果 `config.mk` 存在，就把它包含进来。

#### `ifdef`

判断变量是否已定义：

```makefile
ifdef DEBUG
    CFLAGS += -O0 -g
endif
```

命令行这样执行：

```bash
make DEBUG=1
```

就会启用调试选项。

#### `ifndef`

判断变量是否未定义：

```makefile
ifndef CC
    CC = gcc
endif
```

这个写法和 `CC ?= gcc` 的用途很接近，不过 `?=` 通常更简洁。

一个综合例子如下：

```makefile
CC ?= gcc
BUILD ?= release

CFLAGS += -Wall -Wextra

ifeq ($(BUILD),debug)
    CFLAGS += -O0 -g
else ifeq ($(BUILD),release)
    CFLAGS += -O2
endif

ifdef SANITIZE
    CFLAGS += -fsanitize=address
endif
```

执行时可以这样传参：

```bash
make BUILD=debug
make BUILD=debug SANITIZE=1
```

这种写法在需要区分调试版、发布版和附加构建选项时很常见。

### 3. 隐藏命令输出<a id=隐藏命令输出></a>

默认情况下，`make` 会把每条执行的命令先打印一遍。

如果不希望命令在执行前被打印出来，可以在命令前加 `@`：

```makefile
main: main.o print.o
	@cc main.o print.o -o main
```

### 4. 伪目标 <a id="phony-targets"></a>

有些目标并不是为了生成同名文件，而是为了执行一个动作，例如：

- `clean`
- `all`
- `test`

这类目标通常叫 **伪目标**（Phony Target）。

例如：

```makefile
.PHONY: clean

clean:
	rm -f $(OBJS)
```

为什么要写 `.PHONY`？

因为如果目录里刚好存在一个名为 `clean` 的真实文件，`make` 可能会认为该目标已经满足，不再执行对应命令。加上 `.PHONY` 是为了明确告诉
`make`：这是一个命令标签，而不是文件。

一个更完整一点的版本：

```makefile
TARGET = main
SRCS = main.c print.c
OBJS = $(SRCS:.c=.o)

.PHONY: all clean

all: $(TARGET)

clean:
	rm -f $(OBJS) $(TARGET)

$(TARGET): $(OBJS)
	cc $^ -o $@

%.o: %.c
	cc -c $< -o $@
```

运行：

```bash
make clean
make all
```

### 5.依赖识别<a id="dependency-tracking"></a>

Makefile 最重要的能力之一，是它可以只重新编译真正受影响的部分。

原因在于：**依赖关系**。

`make` 在执行时会先判断：

- 这个目标依赖谁？
- 依赖有没有更新？
- 如果依赖比目标“更新”，那就说明目标过期了，要重做

### 5.1 Make 如何判断要不要重建 <a id=make-如何判断要不要重建></a>

还是这个例子：

```makefile
main: main.o print.o
	cc main.o print.o -o main

main.o: main.c
	cc -c main.c -o main.o

print.o: print.c
	cc -c print.c -o print.o
```

`make` 大致会建立这样一棵依赖关系树：

```text
main
├── main.o
│   └── main.c
└── print.o
    └── print.c
```

执行 `make` 时，它会从目标开始一路往下看时间戳：

1. 先看 `main` 依赖 `main.o`、`print.o`
2. 再看 `main.o` 依赖 `main.c`
3. 再看 `print.o` 依赖 `print.c`
4. 如果依赖文件比目标文件新，就重新执行对应命令

比如：

- 如果你改了 `main.c`
- 那么 `main.c` 的时间戳会比 `main.o` 新
- `make` 就会重新生成 `main.o`
- 接着发现 `main.o` 比 `main` 新
- 于是再重新链接出新的 `main`

但 `print.c` 没动，所以 `print.o` 不需要重编。

这就是增量编译。

它的核心思想是：只重建已经过期的目标，不重复处理未发生变化的部分。

### 5.2 只写 `.c` 依赖的问题 <a id=只写-c-依赖的问题></a>

上面的规则看起来已经不错了，但还藏着一个经典坑：

```makefile
main.o: main.c
print.o: print.c
```

这里 `.o` 只依赖对应的 `.c` 文件，却没有把头文件 `.h` 算进去。

问题在于：

假设你修改了 `print.h`，比如把函数声明改了：

```c
void print(int a, int b);
```

这时候：

- `main.c` 实际上受到了影响，因为它 `#include "print.h"`
- `print.c` 也受到了影响
- 但 Makefile 并不知道这件事

因为在它眼里：

- `main.o` 只看 `main.c`
- `print.o` 只看 `print.c`

于是当头文件发生变化时，`make` 可能不会重新编译对应的 `.o` 文件，最终得到一个并不完整的构建结果。

### 5.3 解决办法：让编译器顺手生成依赖文件 `.d` <a id=解决办法让编译器顺手生成依赖文件-d></a>

为了让 `make` 知道：

- `main.o` 不只依赖 `main.c`
- 还依赖它包含的头文件，比如 `print.h`

我们通常会让编译器在编译 `.c` 的同时，额外生成一个 `.d` 文件。

`.d` 文件可以理解成“依赖清单”，专门记录某个 `.o` 文件依赖了哪些头文件。

比如编译器可能会生成这样的内容：

```makefile
main.o: main.c print.h
print.o: print.c print.h
```

这就对了。以后只要 `print.h` 一改，`make` 就知道应该把相关的 `.o` 重新编译。

### 5.4 常见写法 <a id=常见写法></a>

一个很常见的做法是使用 `-MMD -MP`：

```makefile
CC = gcc
TARGET = main
SRCS = main.c print.c
OBJS = $(SRCS:.c=.o)
DEPS = $(SRCS:.c=.d)

.PHONY: all clean

all: $(TARGET)

clean:
	rm -f $(OBJS) $(DEPS) $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $^ -o $@

%.o: %.c
	$(CC) -MMD -MP -c $< -o $@

-include $(DEPS)
```

这个版本可以作为一个比较实用的入门模板。

各部分的作用

```makefile
DEPS = $(SRCS:.c=.d)
```

把 `main.c print.c` 变成 `main.d print.d`。

```makefile
$(CC) -MMD -MP -c $< -o $@
```

这条命令在编译 `.o` 的同时，也生成对应的 `.d` 文件。

其中：

- `-MMD`：生成用户头文件的依赖信息
- `-MP`：为头文件生成伪目标，避免头文件被删除时 `make` 直接炸掉

```makefile
-include $(DEPS)
```

这一行的意思是：把这些 `.d` 文件也读进来，当成 Makefile 的补充规则。

前面的 `-` 很关键，它表示：如果这些 `.d` 文件暂时还不存在，也不要因此报错。

为什么一开始会不存在？

因为第一次编译前，这些 `.d` 文件通常还不存在。

### 5.5 传统 `%.d: %.c` 写法与原理 <a id=传统-d-c-写法与原理></a>

除了 `-MMD -MP` 这种直接在编译 `.o` 时顺手生成 `.d` 的做法，还有一种更传统的写法，是把 `.d` 文件的生成单独写成规则：

```makefile
%.d: %.c
	rm -f $@; \
	$(CC) -MM $< > $@.tmp; \
	sed 's,\($*\)\.o[ :]*,\1.o $@ : ,g' < $@.tmp > $@; \
	rm -f $@.tmp
```

这段规则看起来比较绕，但它其实只做了三件事。

#### a. 先让编译器输出原始依赖

```makefile
$(CC) -MM $< > $@.tmp
```

这里的 `-MM` 会让编译器分析当前 `.c` 文件依赖了哪些用户头文件，并输出类似下面的内容：

```makefile
main.o: main.c print.h
```

这里输出的是 `main.o` 的依赖关系，但还没有把 `main.d` 自己写进去。

#### b. 再把输出结果改写成同时描述 `.o` 和 `.d`

```makefile
sed 's,\($*\)\.o[ :]*,\1.o $@ : ,g' < $@.tmp > $@
```

这一步是整段规则的关键。

假设当前目标是 `main.d`，那么：

- `$*` 表示模式匹配中的主干部分，也就是 `main`
- `$@` 表示当前目标，也就是 `main.d`

原始内容：

```makefile
main.o: main.c print.h
```

经过 `sed` 改写后会变成：

```makefile
main.o main.d: main.c print.h
```

这样处理的意义在于：

- `main.o` 依赖 `main.c` 和 `print.h`
- `main.d` 自己也依赖 `main.c` 和 `print.h`

于是当头文件变化时，不仅 `main.o` 会过期，`main.d` 也会过期，Make 就知道应该重新生成这份依赖文件。

#### c. 用临时文件避免写到一半的中间状态

```makefile
rm -f $@.tmp
```

中间先写到 `$@.tmp`，再生成最终的 `$@`，是为了避免依赖文件写了一半时被 `make` 读到不完整内容。

#### ?. 为什么要写成这种形式

传统写法的核心目的，是让 `.d` 文件本身也有正确的依赖关系。

如果只生成：

```makefile
main.o: main.c print.h
```

那么 `make` 只知道 `main.o` 依赖头文件，却不知道 `main.d` 也应该在头文件变化时更新。

改写成：

```makefile
main.o main.d: main.c print.h
```

之后，`.d` 文件和 `.o` 文件就会一起随着头文件变化而重新生成。

这也是这类 `sed` 写法长期存在的原因。它看起来不够直观，但目的非常明确。

### 5.6 为什么本次重新生成的 `.d` 仍然会影响结果 <a id=为什么本次重新生成的-d-仍然会影响结果></a>

很多人第一次看到 `include $(DEPS)` 时会有一个疑问：

- `make` 一开始不是已经把 `.d` 文件读进来了吗？
- 如果本次执行过程中 `.d` 文件又被重新生成，那这些新内容怎么还能影响本次构建结果？

关键点在于：**被 `include` 进来的文件，对 `make` 来说也是 makefile 的一部分。**

也就是说，`make` 不只是“读取它们一次就结束”，而是会把这些被包含的文件也当作需要维护的目标来看待。

更准确地说，执行过程通常是这样的：

1. `make` 先读取主 Makefile 和被 `include` 的 `.d` 文件
2. 如果发现某个被包含的 `.d` 文件不存在，或者已经过期，就先尝试把它更新
3. 只要这些被包含的 makefile 文件发生了变化，`make` 会重新启动一次读取过程
4. 第二次读取时，新生成的 `.d` 内容就已经生效了

这也是为什么 `.d` 虽然是通过 `include` 引入的，但它在本次执行中重新生成后，依然能够立刻反映到后续构建结果中。

可以把它理解成：

- 第一次读取：先拿到旧版规则
- 发现依赖说明书过期了，于是先更新说明书
- 说明书更新后，重新读一遍
- 再按照最新版说明书决定接下来要编译什么

因此，`.d` 文件并不是“只在下一次 `make` 才生效”，而是只要它在当前执行中被成功重建，`make` 就会重新读取它。

### 5.7 整个流程串起来看 <a id=整个流程串起来看></a>

现在 `make` 的工作方式就更完整了：

1. 先读取主 Makefile
2. 再尝试读取 `include` 进来的 `.d` 依赖文件
3. 如果某个 `.d` 文件缺失或过期，就先更新它
4. 如果被包含的 makefile 文件发生变化，`make` 会重新读取一次规则
5. 再根据最新依赖关系比较目标和依赖的时间戳
6. 最后只重新编译真正受影响的部分

比如你只改了 `print.h`：

- `make` 通过 `main.d` 知道 `main.o` 依赖 `print.h`
- 通过 `print.d` 知道 `print.o` 也依赖 `print.h`
- 所以会重新编译 `main.o` 和 `print.o`
- 然后重新链接 `main`

这时 Make 才能正确追踪头文件变化带来的影响。

### 5.8 一个更接近实战的小模板 <a id=一个更接近实战的小模板></a>

最后放一个更常见、也更适合抄回去直接改的版本：

```makefile
CC = gcc
CFLAGS = -Wall -Wextra -O2
TARGET = main
SRCS = main.c print.c
OBJS = $(SRCS:.c=.o)
DEPS = $(SRCS:.c=.d)

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $(TARGET)

%.o: %.c
	$(CC) $(CFLAGS) -MMD -MP -c $< -o $@

clean:
	rm -f $(TARGET) $(OBJS) $(DEPS)

-include $(DEPS)
```

---

## 小结 <a id="summary"></a>

### 1. 编译流程

C/C++ 从源文件到可执行文件，通常会经历预处理、编译、汇编和链接四个阶段。理解这一点之后，再看 Makefile 中的 `.c`、`.o`
和最终目标文件，关系会清晰很多。

### 2. Makefile 的基本结构

Makefile 的核心是规则：目标、依赖和命令。`make` 会根据这些规则决定应该构建什么、先构建谁，以及哪些部分可以跳过。

### 3. 变量、函数与条件

变量、内置函数、条件赋值和条件判断，主要解决的是“如何把 Makefile 写得更灵活、更少重复、更便于维护”。

### 4. 增量编译的关键

Make 并不是盲目地全量重编，而是依据依赖关系和时间戳，只重建已经过期的目标。

### 5. `.d` 文件的意义

头文件依赖如果没有被正确描述，增量编译就可能失真。`.d` 文件的价值就在于把这部分隐藏依赖补全。

### 6. 本文的核心结论

理解 Makefile，关键不在于死记语法，而在于建立一套稳定的思路：

1. 目标是什么
2. 它依赖什么
3. 依赖变化后谁会过期
4. 规则何时会被重新读取

只要把这条主线理顺，Makefile 的大部分写法都能找到位置。
