---
title: CMake 笔记
date: 2026-08-17
tags: [ CMake, C, C++ ]
pinned: false
collection: C/C++复习
outline:
  - title: 1. CMake 的位置
    slug: CMake的位置
  - title: 1.1 CMake 与原生构建工具
    slug: CMake与原生构建工具
    level: 1
  - title: 1.2 配置、生成与构建
    slug: 配置生成与构建
    level: 1
  - title: 1.3 源码树与构建树
    slug: 源码树与构建树
    level: 1

  - title: 2. 最小项目
    slug: 最小项目
  - title: 2.1 CMakeLists.txt
    slug: CMakeLists-txt
    level: 1
  - title: 2.2 项目声明
    slug: 项目声明
    level: 1
  - title: 2.3 配置与构建命令
    slug: 配置与构建命令
    level: 1
  - title: 2.4 生成器
    slug: 生成器
    level: 1

  - title: 3. 目标模型
    slug: 目标模型
  - title: 3.1 可执行目标与库目标
    slug: 可执行目标与库目标
    level: 1
  - title: 3.2 目标属性与使用要求
    slug: 目标属性与使用要求
    level: 1
  - title: 3.3 作用域关键字
    slug: 作用域关键字
    level: 1
  - title: 3.4 编译要求
    slug: 编译要求
    level: 1

  - title: 4. 多目录项目
    slug: 多目录项目
  - title: 4.1 子目录组织
    slug: 子目录组织
    level: 1
  - title: 4.2 目录作用域
    slug: 目录作用域
    level: 1

  - title: 5. 变量与配置
    slug: 变量与配置
  - title: 5.1 普通变量与列表
    slug: 普通变量与列表
    level: 1
  - title: 5.2 缓存变量与选项
    slug: 缓存变量与选项
    level: 1
  - title: 5.3 条件判断
    slug: 条件判断
    level: 1
  - title: 5.4 生成器表达式
    slug: 生成器表达式
    level: 1
  - title: 5.5 构建配置
    slug: 构建配置
    level: 1

  - title: 6. 外部依赖
    slug: 外部依赖
  - title: 6.1 包查找
    slug: 包查找
    level: 1
  - title: 6.2 导入目标
    slug: 导入目标
    level: 1

  - title: 7. 测试与安装
    slug: 测试与安装
  - title: 7.1 CTest
    slug: CTest
    level: 1
  - title: 7.2 安装规则
    slug: 安装规则
    level: 1

  - title: 8. 完整示例
    slug: 完整示例
  - title: 8.1 项目文件
    slug: 项目文件
    level: 1
  - title: 8.2 构建、测试与安装
    slug: 构建测试与安装
    level: 1
  - title: 8.3 常见边界
    slug: 常见边界
    level: 1

  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 接续 Makefile 笔记，整理 CMake 的配置与生成流程、目标模型、依赖传播、多目录组织、构建配置、外部包、CTest 和安装规则。
  - - meta
    - name: keywords
      content: CMake, C语言, C++, 构建系统, CMakeLists, target, find_package, CTest, install
---

本篇接续 Makefile 笔记，整理 CMake 如何把项目描述转换为原生构建系统，以及现代 CMake 如何围绕目标组织源码、编译要求和依赖关系。

---

文中的完整示例使用 C17 和 CMake 3.20，可在 Unix shell 中配置、构建、测试并安装到临时目录。CMake 也能生成 Ninja、Xcode 和
Visual
Studio 等构建系统；不同生成器的配置方式会在对应章节说明。

## 1. CMake 的位置{#CMake的位置}

CMake 读取 `CMakeLists.txt`，根据项目配置和当前平台生成另一套构建系统。编译器仍负责把源码变成目标文件，Make、Ninja、Xcode 或
Visual
Studio 仍负责调度具体构建命令。

```text
CMakeLists.txt + 配置选项 + 外部包
                  │
                  ▼
          CMake 配置与生成
                  │
        Makefile / build.ninja / IDE 工程
                  │
                  ▼
             原生构建工具
                  │
                  ▼
          编译器、汇编器与链接器
                  │
                  ▼
        可执行文件、静态库与共享库
```

### 1.1 CMake 与原生构建工具{#CMake与原生构建工具}

上一篇直接用 Makefile 描述目标、依赖和 recipe。CMake 则在更高一层描述项目目标及其属性，再为选定的原生构建工具生成规则。

| 层次     | 典型工具或文件                        | 职责                 |
|--------|--------------------------------|--------------------|
| 项目描述   | `CMakeLists.txt`               | 声明目标、源码、依赖、测试和安装规则 |
| 构建系统生成 | CMake                          | 检测工具链与外部包，生成原生构建系统 |
| 构建调度   | Make、Ninja、Xcode、Visual Studio | 判断并执行需要更新的构建步骤     |
| 编译与链接  | GCC、Clang、MSVC                 | 生成目标文件、库和可执行文件     |

以 `Unix Makefiles` 生成器为例，CMake 会在构建目录中生成 Makefile。这个文件是派生产物，不应手工修改；项目规则应回到
`CMakeLists.txt` 中修改，再由 CMake 重新生成。

### 1.2 配置、生成与构建{#配置生成与构建}

CMake 工作流分为三个阶段：

| 阶段             | 主要工作                        | 典型产物或结果                         |
|----------------|-----------------------------|---------------------------------|
| 配置 `configure` | 读取 CMake 脚本、检测编译器、解析选项、查找依赖 | 内存中的目标图、`CMakeCache.txt`        |
| 生成 `generate`  | 计算目标属性和生成器表达式，写出原生构建规则      | Makefile、`build.ninja` 或 IDE 工程 |
| 构建 `build`     | 调用原生构建工具，执行编译与链接命令          | 可执行文件和库                         |

第一次执行配置命令时，配置和生成通常连续完成：

```bash
cmake -S . -B build
```

`-S` 指定源码树，`-B` 指定构建树。随后使用统一入口调用原生构建工具：

```bash
cmake --build build --parallel
```

对于 `Unix Makefiles`，后一条命令的作用近似于在构建目录执行 `make`；对于 Ninja 或 IDE 生成器，它会改为调用相应工具。修改
`CMakeLists.txt` 后，生成的构建系统通常会在下一次构建前自动触发 CMake，但显式重新运行配置命令同样安全。

### 1.3 源码树与构建树{#源码树与构建树}

源码树保存需要版本控制的输入，构建树保存特定工具链和配置对应的派生产物：

```text
project/                 # 源码树
├── CMakeLists.txt
├── include/
├── src/
└── build/               # 构建树，不纳入版本控制
    ├── CMakeCache.txt
    ├── CMakeFiles/
    └── Makefile
```

把构建树放在源码树之外或源码树下的独立目录，称为 out-of-source build。它有三个直接结果：

- 清理构建产物时只处理构建目录，不需要从源码中筛选生成文件；
- 同一源码树可以同时使用 `build-debug`、`build-release` 等多个构建树；
- 每个构建树拥有独立缓存，可以绑定不同的生成器、编译器和选项。

`CMakeCache.txt` 记录配置结果和缓存变量。它属于构建树，不应提交，也不适合作为日常配置文件手工编辑。

## 2. 最小项目{#最小项目}

最小项目只需一个 `CMakeLists.txt` 和一个源文件：

```text
.
├── CMakeLists.txt
└── main.c
```

`main.c`：

```c
#include <stdio.h>

int main(void)
{
    printf("Hello, CMake!\n");
    return 0;
}
```

### 2.1 CMakeLists.txt{#CMakeLists-txt}

根目录的 `CMakeLists.txt`：

```cmake
cmake_minimum_required(VERSION 3.20)
project(hello VERSION 1.0.0 LANGUAGES C)

add_executable(hello main.c)
```

CMake 命令使用 `command(argument...)` 形式。命令名不区分大小写，但项目通常统一写成小写；变量名和目标名则区分大小写。

### 2.2 项目声明{#项目声明}

三个命令分别建立版本边界、项目上下文和构建目标：

| 命令                                         | 作用                                   |
|--------------------------------------------|--------------------------------------|
| `cmake_minimum_required(VERSION 3.20)`     | 拒绝过旧的 CMake，并为相应版本设置策略行为             |
| `project(hello VERSION 1.0.0 LANGUAGES C)` | 声明项目名与版本，只启用 C 语言并检测 C 编译器           |
| `add_executable(hello main.c)`             | 创建名为 `hello` 的可执行目标，并把 `main.c` 作为源码 |

`project()` 会设置 `PROJECT_NAME`、`PROJECT_VERSION` 等变量。`LANGUAGES` 应只列出项目实际使用的语言；例如同时使用 C 和 C++
时写成：

```cmake
project(example LANGUAGES C CXX)
```

启用语言会触发对应编译器检测，因此纯 C 项目无需额外启用 C++。

### 2.3 配置与构建命令{#配置与构建命令}

在项目根目录执行：

```bash
cmake -S . -B build
cmake --build build --parallel
./build/hello # Hello, CMake!
```

常用入口按阶段区分：

| 命令                                   | 作用                 |
|--------------------------------------|--------------------|
| `cmake -S . -B build`                | 配置并生成 `build` 构建树  |
| `cmake --build build`                | 构建默认目标             |
| `cmake --build build --target hello` | 只请求 `hello` 目标及其依赖 |
| `cmake --build build --parallel`     | 允许原生构建工具并行执行任务     |

`cmake --build` 后的参数由 CMake 转换为对应构建工具的调用方式。确实需要向底层工具传参时，可以放在 `--` 之后，但这些参数不再跨生成器
通用：

```bash
cmake --build build --target hello -- VERBOSE=1
```

上例中的 `VERBOSE=1` 适用于 Makefile 生成器，不应写入需要同时支持 Ninja 或 IDE 的通用脚本。

### 2.4 生成器{#生成器}

生成器决定构建树中写出哪种原生构建系统：

| 生成器                 | 主要产物                           | 后端工具                    |
|---------------------|--------------------------------|-------------------------|
| `Unix Makefiles`    | Makefile                       | Make                    |
| `Ninja`             | `build.ninja`                  | Ninja                   |
| `Xcode`             | Xcode 工程                       | Xcode                   |
| `Visual Studio ...` | Visual Studio solution/project | MSBuild / Visual Studio |

用 `-G` 显式选择生成器：

```bash
cmake -S . -B build -G "Unix Makefiles"
```

`cmake --help` 会列出当前平台可用的生成器。生成器在首次配置时写入缓存，同一个构建目录不能直接切换为另一生成器；需要为新生成器准备新的构建目录。

## 3. 目标模型{#目标模型}

现代 CMake 的核心对象是目标。可执行文件、库以及外部包提供的依赖都表示为目标；源码、头文件目录、语言标准和链接依赖则附着在目标上。

```text
math_utils 目标
├── 源码：src/math_utils.c
├── 自身编译要求：C17、警告选项
└── 对消费者公开的使用要求：include/
             │
             ▼ target_link_libraries
        cmake_demo 目标
```

### 3.1 可执行目标与库目标{#可执行目标与库目标}

创建可执行文件和静态库：

```cmake
add_library(math_utils STATIC src/math_utils.c)
add_executable(cmake_demo app/main.c)

target_link_libraries(cmake_demo PRIVATE math_utils)
```

`target_link_libraries` 不只生成链接器参数，还把两个目标连接到 CMake 的依赖图中：构建 `cmake_demo` 前会先构建
`math_utils`，并计算 `math_utils` 对消费者公开的使用要求。

常见目标类型：

| 创建方式                           | 目标类型      | 构建产物                    |
|--------------------------------|-----------|-------------------------|
| `add_executable(name ...)`     | 可执行目标     | 可执行文件                   |
| `add_library(name STATIC ...)` | 静态库目标     | `.a` 或 `.lib`           |
| `add_library(name SHARED ...)` | 共享库目标     | `.so`、`.dylib` 或 `.dll` |
| `add_library(name MODULE ...)` | 运行时加载的模块库 | 平台对应的动态模块               |
| `add_library(name OBJECT ...)` | 对象库       | 一组目标文件，不单独归档或链接         |
| `add_library(name INTERFACE)`  | 接口库       | 不编译实体，只携带使用要求           |

省略 `STATIC` / `SHARED` 时，普通库类型受缓存变量 `BUILD_SHARED_LIBS` 控制。需要固定产物类型的项目应显式指定。

源码也可以在创建目标后补充：

```cmake
add_library(math_utils)

target_sources(math_utils
    PRIVATE
        src/add.c
        src/subtract.c
)
```

无论源码直接写在 `add_library` 中，还是通过 `target_sources` 添加，最终都归属于同一个目标。

### 3.2 目标属性与使用要求{#目标属性与使用要求}

每个目标同时包含两类信息：

| 信息   | 作用对象      | 示例                       |
|------|-----------|--------------------------|
| 构建要求 | 目标自身      | 编译自己的源码需要哪些头文件目录、宏和选项    |
| 使用要求 | 链接该目标的消费者 | 消费者使用公开头文件或链接接口时必须继承哪些要求 |

例如库的实现文件与公开头文件分别位于 `src/` 和 `include/`：

```cmake
target_include_directories(math_utils
    PUBLIC "${PROJECT_SOURCE_DIR}/include"
    PRIVATE "${CMAKE_CURRENT_SOURCE_DIR}/detail"
)
```

`math_utils` 自身编译时能搜索两个目录。链接它的 `cmake_demo` 会继承公开的 `include/`，但不会看到实现专用的 `detail/`：

```cmake
target_link_libraries(cmake_demo PRIVATE math_utils)
```

因此应用源码可以直接 `#include "math_utils.h"`，无需再次手工添加同一个头文件目录。依赖关系沿目标传播，代替了调用方复制
`-I`、`-D`
和传递依赖的做法。

### 3.3 作用域关键字{#作用域关键字}

`PRIVATE`、`PUBLIC` 和 `INTERFACE` 描述一项要求是给当前目标使用、给消费者使用，还是两者都使用：

| 关键字         | 当前目标使用 | 消费者继承 | 典型场景                   |
|-------------|--------|-------|------------------------|
| `PRIVATE`   | 是      | 否     | 实现源码、内部头文件、只影响本目标的编译选项 |
| `PUBLIC`    | 是      | 是     | 当前库和消费者都需要的公开头文件目录或依赖  |
| `INTERFACE` | 否      | 是     | 纯头文件库，或只传给消费者的要求       |

这些关键字总是相对于命令的第一个目标判断。它们不是 C/C++ 访问控制，也不表示静态库或共享库类型。

表中的传播关系描述目标接口。`target_link_libraries` 还要保证最终链接完整：静态库的 `PRIVATE` 链接依赖可能以仅链接要求继续出现在下游链接中，
但该依赖的头文件目录和编译定义不会因此成为静态库的公开编译接口。

纯头文件库没有需要编译的源码，所有要求都面向消费者：

```cmake
add_library(math_constants INTERFACE)
target_include_directories(math_constants INTERFACE include)
target_compile_features(math_constants INTERFACE c_std_17)

target_link_libraries(cmake_demo PRIVATE math_constants)
```

`cmake_demo` 对 `math_constants` 的依赖是自身实现细节，所以链接处使用 `PRIVATE`；`math_constants` 自身没有编译步骤，所以它携带的要求使用
`INTERFACE`。两处关键字描述的是两个不同目标的边界。

### 3.4 编译要求{#编译要求}

常用的 target 系列命令分别对应编译器与链接器的不同输入：

| 命令                           | 作用                |
|------------------------------|-------------------|
| `target_sources`             | 添加目标源码            |
| `target_include_directories` | 添加头文件搜索目录         |
| `target_compile_features`    | 声明所需语言特性或标准级别     |
| `target_compile_definitions` | 添加预处理宏，不写 `-D` 前缀 |
| `target_compile_options`     | 添加其他编译选项          |
| `target_link_libraries`      | 链接目标、库或库文件        |
| `target_link_options`        | 添加其他链接器选项         |

例如：

```cmake
target_compile_features(math_utils PUBLIC c_std_17)
target_compile_definitions(math_utils PRIVATE MATH_UTILS_TRACE=1)

target_compile_options(math_utils
    PRIVATE
        $<$<C_COMPILER_ID:GNU,Clang,AppleClang>:-Wall;-Wextra;-Wpedantic>
        $<$<C_COMPILER_ID:MSVC>:/W4>
)
```

`c_std_17` 要求目标使用支持 C17 的编译模式；编译器默认模式不足时，CMake 会添加相应的标准选项。警告选项只影响库自身，并通过生成器表达式区分
GCC/Clang 与 MSVC。

全局的 `include_directories()`、`add_definitions()` 和直接修改 `CMAKE_C_FLAGS` 会影响当前目录及部分子目录，容易形成隐式耦合。能够归属于具体目标的要求，
优先通过 `target_*` 命令声明。

## 4. 多目录项目{#多目录项目}

目录负责拆分 CMake 脚本，目标负责连接构建关系。一个常见布局是由根目录建立项目上下文，再让各子目录定义自己的目标：

```text
.
├── CMakeLists.txt
├── app/
│   ├── CMakeLists.txt
│   └── main.c
├── include/
│   └── math_utils.h
└── src/
    ├── CMakeLists.txt
    └── math_utils.c
```

### 4.1 子目录组织{#子目录组织}

根目录 `CMakeLists.txt`：

```cmake
cmake_minimum_required(VERSION 3.20)
project(cmake_demo LANGUAGES C)

add_subdirectory(src)
add_subdirectory(app)
```

`src/CMakeLists.txt`：

```cmake
add_library(math_utils STATIC math_utils.c)
target_include_directories(math_utils PUBLIC "${PROJECT_SOURCE_DIR}/include")
```

`app/CMakeLists.txt`：

```cmake
add_executable(cmake_demo main.c)
target_link_libraries(cmake_demo PRIVATE math_utils)
```

`add_subdirectory(src)` 会立即处理 `src/CMakeLists.txt` 并创建 `math_utils`，随后 `app` 子目录可以按目标名引用它。库的路径和编译参数由目标携带，
根目录不需要汇总一份全局源文件列表。

### 4.2 目录作用域{#目录作用域}

普通变量和目录属性具有目录作用域；目标在整个构建树中以名字标识，创建后可以被其他目录引用。

| 变量                         | 指向位置                            |
|----------------------------|---------------------------------|
| `PROJECT_SOURCE_DIR`       | 最近一次 `project()` 对应的源码根目录       |
| `PROJECT_BINARY_DIR`       | 最近一次 `project()` 对应的构建根目录       |
| `CMAKE_CURRENT_SOURCE_DIR` | 当前正在处理的 `CMakeLists.txt` 所在源码目录 |
| `CMAKE_CURRENT_BINARY_DIR` | 当前源码目录对应的构建目录                   |
| `CMAKE_CURRENT_LIST_DIR`   | 当前正在读取的 CMake 列表文件所在目录          |

父目录的普通变量进入子目录时会被复制；子目录中的修改默认不会写回父目录。与其依赖跨目录变量传递编译参数，更稳定的方式是把要求附着到目标，再用
`target_link_libraries` 建立关系。

## 5. 变量与配置{#变量与配置}

CMake 变量主要用于组织脚本和接收配置输入。源码、头文件目录和编译要求一旦能够归属于目标，就不应继续作为全局变量在目录之间传递。

### 5.1 普通变量与列表{#普通变量与列表}

`set()` 创建普通变量，`${name}` 展开变量值：

```cmake
set(APP_SOURCES
    main.c
    cli.c
)

list(APPEND APP_SOURCES version.c)
add_executable(cmake_demo ${APP_SOURCES})
```

CMake 列表内部以分号分隔。上面的 `APP_SOURCES` 等价于 `main.c;cli.c;version.c`；未加引号的变量展开会把列表元素作为多个命令参数。

包含路径或用户输入时应保留为一个参数：

```cmake
set(CONFIG_DIR "${PROJECT_SOURCE_DIR}/config files")
target_include_directories(cmake_demo PRIVATE "${CONFIG_DIR}")
```

环境变量使用 `$ENV{name}` 读取，但环境只影响当前配置过程，不会自动成为稳定的项目配置接口。需要让用户重复选择的选项通常应进入
CMake 缓存。

### 5.2 缓存变量与选项{#缓存变量与选项}

缓存变量保存在构建树的 `CMakeCache.txt` 中，重新配置时继续生效。布尔选项使用 `option()`：

```cmake
option(ENABLE_TRACE "Enable trace output" OFF)
set(MATH_BACKEND "builtin" CACHE STRING "Math backend")
```

调用方通过 `-D` 创建或更新缓存项：

```bash
cmake -S . -B build \
    -DENABLE_TRACE=ON \
    -DMATH_BACKEND=builtin
```

`-Dname=value` 的结果会持久化；下一次只执行 `cmake -S . -B build` 不会自动恢复默认值。查看当前缓存可以使用：

```bash
cmake -S . -B build -LAH
```

生成器、编译器和工具链同样会在首次配置后与构建树绑定。切换 `CMAKE_C_COMPILER` 或工具链文件时，应创建新的构建目录，避免旧缓存与新工具链混合。

### 5.3 条件判断{#条件判断}

`if()` 在配置阶段执行，适合根据选项、平台或探测结果决定是否创建目标或添加属性：

```cmake
if(ENABLE_TRACE)
    target_compile_definitions(math_utils PRIVATE MATH_UTILS_TRACE=1)
endif()

if(BUILD_TESTING)
    add_subdirectory(tests)
endif()

if(CMAKE_C_COMPILER_ID STREQUAL "GNU")
    message(STATUS "Using GCC")
endif()
```

布尔缓存变量直接写为 `if(ENABLE_TRACE)`，字符串比较使用 `STREQUAL`。不要把用户输入直接拼接成命令名或未经引用的路径；CMake
变量是文本，展开后可能成为多个参数。

### 5.4 生成器表达式{#生成器表达式}

生成器表达式写成 `$<...>`，在生成阶段或具体构建配置上下文中求值。它适合表达编译器、配置和目标属性相关的要求：

```cmake
target_compile_definitions(cmake_demo
    PRIVATE
        $<$<CONFIG:Debug>:CMAKE_DEMO_DEBUG=1>
)
```

只有 Debug 配置会得到 `CMAKE_DEMO_DEBUG=1`。安装一个库时，源码树和安装树需要不同的头文件路径：

```cmake
target_include_directories(math_utils
    PUBLIC
        "$<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/include>"
        "$<INSTALL_INTERFACE:include>"
)
```

`BUILD_INTERFACE` 在目标从当前构建树使用时生效，`INSTALL_INTERFACE` 在导出的已安装目标中生效。后者通常使用相对于安装前缀的路径。

配置阶段的 `if()` 会立即决定是否执行一段 CMake 命令；生成器表达式则让同一份脚本按构建配置、编译器或目标上下文生成不同属性。

### 5.5 构建配置{#构建配置}

生成器分为单配置和多配置两类：

| 类型  | 常见生成器                                    | 选择配置的时机                  |
|-----|------------------------------------------|--------------------------|
| 单配置 | `Unix Makefiles`、`Ninja`                 | 配置时设置 `CMAKE_BUILD_TYPE` |
| 多配置 | Xcode、Visual Studio、`Ninja Multi-Config` | 构建、测试或安装时选择 `--config`   |

单配置工作流：

```bash
cmake -S . -B build-debug -DCMAKE_BUILD_TYPE=Debug
cmake --build build-debug --parallel
```

多配置工作流：

```bash
cmake -S . -B build-xcode -G Xcode
cmake --build build-xcode --config Debug --parallel
ctest --test-dir build-xcode -C Debug --output-on-failure
```

`CMAKE_BUILD_TYPE` 对多配置生成器不起选择作用；`--config Debug` 也不能替代单配置生成器在配置阶段设置构建类型。项目本身通常不强制覆盖
`CMAKE_BUILD_TYPE`，由调用方、预设或构建环境选择。

## 6. 外部依赖{#外部依赖}

CMake 将“找到依赖”和“获取依赖源码或二进制包”视为不同问题。`find_package()` 查找当前环境已经提供的包信息；系统包管理器、语言包管理器或
`FetchContent` 等机制负责把依赖放到可查找的位置。

### 6.1 包查找{#包查找}

查找线程支持并链接到应用：

```cmake
find_package(Threads REQUIRED)

add_executable(cmake_demo main.c)
target_link_libraries(cmake_demo PRIVATE Threads::Threads)
```

`REQUIRED` 表示找不到依赖时立即终止配置。`find_package` 主要有两种查找方式：

| 模式          | 查找内容                                               | 提供者                |
|-------------|----------------------------------------------------|--------------------|
| Module mode | `Find<Package>.cmake`                              | CMake 自带模块或项目追加的模块 |
| Config mode | `<Package>Config.cmake` / `<package>-config.cmake` | 依赖包自身的安装结果         |

需要明确使用包配置文件时可以写：

```cmake
find_package(fmt CONFIG REQUIRED)
target_link_libraries(cmake_demo PRIVATE fmt::fmt)
```

非标准安装前缀可以在配置时通过 `CMAKE_PREFIX_PATH` 提示；已知某个包配置文件目录时，也可以设置 `<Package>_DIR`：

```bash
cmake -S . -B build -DCMAKE_PREFIX_PATH=/opt/dependencies
cmake -S . -B build -Dfmt_DIR=/opt/fmt/lib/cmake/fmt
```

具体可用的变量和目标由包的查找模块或配置文件定义，不能仅凭包名推断。

### 6.2 导入目标{#导入目标}

`Threads::Threads`、`fmt::fmt` 这类名字通常是导入目标。它们不在当前项目中编译，却能携带已安装库的位置和完整使用要求：

```text
fmt::fmt
├── 库文件位置
├── 公开头文件目录
├── 必需的编译定义
└── 传递链接依赖
```

链接导入目标后，CMake 会把这些信息传播给消费者。现代包同时提供导入目标和旧式 `*_INCLUDE_DIRS`、`*_LIBRARIES` 变量时，优先使用导入目标，
避免调用方重新拼接头文件路径与链接顺序。

`::` 是包命名空间的常见约定。把不存在的 `Package::Target` 传给 `target_link_libraries` 时，CMake 能在配置或生成阶段报告目标缺失，
比把它当作普通 `-l` 名称更容易定位问题。

## 7. 测试与安装{#测试与安装}

CMake 负责生成测试和安装规则，CTest 负责发现并运行已注册的测试。两者都依赖先完成配置；安装还要求相关构建产物已经生成。

### 7.1 CTest{#CTest}

在顶层 `CMakeLists.txt` 中引入 CTest：

```cmake
include(CTest)

if(BUILD_TESTING)
    add_subdirectory(tests)
endif()
```

`include(CTest)` 创建默认开启的缓存选项 `BUILD_TESTING`，并在选项开启时调用 `enable_testing()`。测试目录创建测试程序并注册测试：

```cmake
add_executable(test_math_utils test_math_utils.c)
target_link_libraries(test_math_utils PRIVATE math_utils)

add_test(NAME math_utils.unit COMMAND test_math_utils)
```

`COMMAND` 中的 `test_math_utils` 是可执行目标名，CMake 会替换为对应配置下的实际程序路径。配置、构建和运行测试：

```bash
cmake -S . -B build -DBUILD_TESTING=ON
cmake --build build --parallel
ctest --test-dir build --output-on-failure
```

CTest 根据测试进程的退出状态判断成败；`--output-on-failure` 只在失败时显示测试输出。关闭测试目标可以重新配置同一个构建树：

```bash
cmake -S . -B build -DBUILD_TESTING=OFF
```

### 7.2 安装规则{#安装规则}

`GNUInstallDirs` 提供跨平台的标准安装目录变量：

```cmake
include(GNUInstallDirs)

install(TARGETS math_utils cmake_demo
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
)

install(FILES include/math_utils.h
    DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}
)
```

| 产物类别      | 示例                         | 目标目录变量                     |
|-----------|----------------------------|----------------------------|
| `RUNTIME` | 可执行文件、Windows DLL          | `CMAKE_INSTALL_BINDIR`     |
| `LIBRARY` | 非 Windows 共享库、模块库          | `CMAKE_INSTALL_LIBDIR`     |
| `ARCHIVE` | 静态库、Windows import library | `CMAKE_INSTALL_LIBDIR`     |
| 公开头文件     | `.h` / `.hpp`              | `CMAKE_INSTALL_INCLUDEDIR` |

`DESTINATION` 使用相对目录时会拼接安装前缀。先构建，再安装到临时位置：

```bash
cmake --build build --parallel
cmake --install build --prefix "$PWD/stage"
```

多配置生成器还需指定要安装的配置：

```bash
cmake --install build --config Release --prefix "$PWD/stage"
```

这些规则能够安装二进制和头文件，但还不会自动形成可被下游 `find_package()` 查找的 CMake 包。可复用包还需要导出目标并安装包配置文件。

## 8. 完整示例{#完整示例}

下面把目标传播、多目录、CTest 和安装规则组合为一个可运行的 C 项目：

```text
.
├── CMakeLists.txt
├── app/
│   ├── CMakeLists.txt
│   └── main.c
├── include/
│   └── math_utils.h
├── src/
│   ├── CMakeLists.txt
│   └── math_utils.c
└── tests/
    ├── CMakeLists.txt
    └── test_math_utils.c
```

### 8.1 项目文件{#项目文件}

根目录 `CMakeLists.txt` 先创建库和应用，再按 `BUILD_TESTING` 决定是否加入测试，最后声明安装规则：

```cmake
cmake_minimum_required(VERSION 3.20)
project(cmake_demo VERSION 1.0.0 LANGUAGES C)

include(GNUInstallDirs)

add_subdirectory(src)
add_subdirectory(app)

include(CTest)
if(BUILD_TESTING)
    add_subdirectory(tests)
endif()

install(TARGETS math_utils cmake_demo
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
)

install(FILES include/math_utils.h
    DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}
)
```

`src/CMakeLists.txt` 定义静态库。构建树和安装树使用不同的公开头文件路径；语言标准随 `PUBLIC` 接口传播给消费者，警告选项只作用于库自身：

```cmake
add_library(math_utils STATIC math_utils.c)

target_include_directories(math_utils
    PUBLIC
        "$<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/include>"
        "$<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}>"
)

target_compile_features(math_utils PUBLIC c_std_17)

target_compile_options(math_utils
    PRIVATE
        $<$<C_COMPILER_ID:GNU,Clang,AppleClang>:-Wall;-Wextra;-Wpedantic>
        $<$<C_COMPILER_ID:MSVC>:/W4>
)
```

`app/CMakeLists.txt` 只声明直接关系。`math_utils` 的公开头文件目录和 C17 要求会自动传给 `cmake_demo`：

```cmake
add_executable(cmake_demo main.c)
target_link_libraries(cmake_demo PRIVATE math_utils)
```

`tests/CMakeLists.txt` 创建另一个库消费者，并把它注册到 CTest：

```cmake
add_executable(test_math_utils test_math_utils.c)
target_link_libraries(test_math_utils PRIVATE math_utils)

add_test(NAME math_utils.unit COMMAND test_math_utils)
```

`include/math_utils.h`：

```c
#ifndef MATH_UTILS_H
#define MATH_UTILS_H

int add_ints(int lhs, int rhs);

#endif
```

`src/math_utils.c`：

```c
#include "math_utils.h"

int add_ints(int lhs, int rhs)
{
    return lhs + rhs;
}
```

`app/main.c`：

```c
#include "math_utils.h"

#include <stdio.h>

int main(void)
{
    printf("2 + 3 = %d\n", add_ints(2, 3));
    return 0;
}
```

`tests/test_math_utils.c`：

```c
#include "math_utils.h"

#include <stdio.h>

int main(void)
{
    const int actual = add_ints(2, 3);
    if (actual != 5) {
        fprintf(stderr, "expected 5, got %d\n", actual);
        return 1;
    }

    return 0;
}
```

### 8.2 构建、测试与安装{#构建测试与安装}

使用 Unix Makefiles 建立 Debug 构建树：

```bash
cmake -S . -B build \
    -G "Unix Makefiles" \
    -DCMAKE_BUILD_TYPE=Debug \
    -DBUILD_TESTING=ON
```

构建并运行应用：

```bash
cmake --build build --parallel
./build/app/cmake_demo # 2 + 3 = 5
```

运行测试：

```bash
ctest --test-dir build --output-on-failure
```

最后安装到项目下的临时目录：

```bash
cmake --install build --prefix "$PWD/stage"
find stage -type f | sort
```

在 Unix 平台上，主要结果为：

```text
stage/bin/cmake_demo
stage/include/math_utils.h
stage/lib/libmath_utils.a
```

应用和测试都没有重复声明 `include/`，却都能编译 `#include "math_utils.h"`。这是 `math_utils` 的 `PUBLIC`
使用要求沿两条目标依赖传播的结果。

### 8.3 常见边界{#常见边界}

| 场景                            | 边界                                |
|-------------------------------|-----------------------------------|
| 修改生成的 Makefile 或 IDE 工程       | 这些文件会被再次生成覆盖，应修改 `CMakeLists.txt` |
| 在已有构建树切换生成器或编译器               | 缓存中保留旧工具链信息，应使用新的构建目录             |
| 把所有路径和选项写成全局命令                | 会让无关目标继承配置，应优先使用 `target_*` 命令    |
| 用 `file(GLOB ...)` 自动收集全部源码   | 新增文件未必触发重新配置；稳定项目通常显式维护目标源码列表     |
| 把 `CMAKE_BUILD_TYPE` 当作通用配置入口 | 它只选择单配置生成器的配置，多配置生成器使用 `--config` |
| 认为 `find_package` 会自动下载依赖     | 它主要查找已提供的包信息，依赖获取需要其他工具或流程        |
| 配置完成后直接运行 CTest 或安装           | 测试程序和安装产物必须先构建                    |
| 只安装库文件就让下游使用 `find_package`   | 还需要导出目标并提供包配置文件                   |

CMake 负责生成构建图，不替代编译器、包管理器、测试程序或安装包格式。把这些边界分开后，问题通常可以定位到配置、生成、构建、测试或安装中的具体阶段。

## 小结{#小结}

1. CMake 读取 `CMakeLists.txt`，配置项目并生成 Make、Ninja 或 IDE 使用的原生构建系统。
2. 源码树保存输入，构建树保存缓存和派生产物；不同生成器、工具链和配置应使用独立构建树。
3. 现代 CMake 以目标为中心，源码、编译要求和链接依赖通过 `target_*` 命令附着到目标。
4. `PRIVATE`、`PUBLIC` 与 `INTERFACE` 区分当前目标的构建要求和消费者继承的使用要求。
5. `add_subdirectory` 组织脚本目录，目标依赖负责跨目录传播接口，不需要复制全局路径和选项。
6. 缓存变量接收持久配置，生成器表达式处理与编译器或构建配置相关的目标属性。
7. `find_package` 与导入目标接入外部依赖，CTest 和 `install()` 分别生成测试与安装规则。
