---
title: 1.2 - 表、栈与队列
date: 2026-05-10T00:00:00
tags: [ 算法, 数据结构 ]
pinned: false
collection: 数据结构与算法复习
outline:

  - title: 1. 表 ADT
    slug: 表adt
  - title: 1.1 链表模型
    slug: 链表模型
    level: 1
  - title: 1.2 链表操作
    slug: 链表操作
    level: 1
  - title: 1.3 常见错误
    slug: 常见错误
    level: 1
  - title: 1.4 双链表与循环链表
    slug: 双链表与循环链表
    level: 1
  - title: 1.5 应用示例
    slug: 表的应用
    level: 1

  - title: 2. 栈 ADT
    slug: 栈adt
  - title: 2.1 栈模型
    slug: 栈模型
    level: 1
  - title: 2.2 链表实现
    slug: 栈的链表实现
    level: 1
  - title: 2.3 数组实现
    slug: 栈的数组实现
    level: 1
  - title: 2.4 应用
    slug: 栈的应用
    level: 1

  - title: 3. 队列 ADT
    slug: 队列adt
  - title: 3.1 队列模型
    slug: 队列模型
    level: 1
  - title: 3.2 数组实现
    slug: 队列的数组实现
    level: 1

  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 数据结构与算法复习第二篇，介绍抽象数据类型（ADT）概念，以及表（链表、双链表、循环链表）、栈（LIFO）与队列（FIFO）三种基本数据结构的定义、多种实现方案与典型应用。
  - - meta
    - name: keywords
      content: 数据结构, 算法, ADT, 抽象数据类型, 链表, 双链表, 循环链表, 栈, 队列, 后缀表达式, 逆波兰, 基数排序
---

表、栈与队列是三种最基本的数据结构——每个有意义的程序至少显式使用其中一种，栈则在程序中总是被间接使用。

本篇承接[上一篇](algorithm-01-basic.md)的复杂度分析框架，先引入抽象数据类型（`Abstract Data Type`,
ADT）的概念，再逐一展开表、栈、队列的定义、实现方案与典型应用。

抽象数据类型是一组操作的集合，是数学层面的抽象——在 ADT 的定义中不涉及如何实现这些操作。它直接体现模块化设计的核心原则：操作只在程序中编写一次，任何需要该
ADT 的部分通过调用对应函数完成，实现细节的改变对程序其余部分透明。

表、栈、队列是 ADT 最基本的三个例子。

## 1. 表 ADT<a id=表adt></a>

### 1.1 链表模型<a id=链表模型></a>

表是形如 $A_1, A_2, \ldots, A_N$ 的元素序列。$N$ 为表的大小，$N=0$ 时为空表。对非空表，$A_{i+1}$ 是 $A_i$ 的后继，$A_{i-1}$
是 $A_i$ 的前驱（$i>1$）。$A_1$ 无前驱，$A_N$ 无后继。

表 ADT 的标准操作集合：

| 操作          | 功能           |
|-------------|--------------|
| `Find`      | 返回关键字首次出现的位置 |
| `FindKth`   | 返回指定位置上的元素   |
| `Insert`    | 在指定位置插入元素    |
| `Delete`    | 删除指定关键字      |
| `PrintList` | 遍历并输出全表      |

数组实现中，`FindKth` 为 $O(1)$，但 `Insert` 和 `Delete` 的最坏情况为 $O(N)$（需移动整个数组），平均也需移动一半元素。$N$
次连续插入构建表的开销为 $O(N^2)$。频繁插入/删除的场景不适用数组实现。

链表（`linked list`）由一系列在内存中不必连续的结构体组成，每个结构体含表元素和指向后继节点的 `Next` 指针，最后一个节点的
`Next` 指向 `NULL`。

```c
typedef struct Node {
    int data;
    struct Node *next;
} Node;

typedef struct List {
    Node *head;   /* 表头结点 */
} List;
```

| 操作        | 复杂度    | 说明              |
|-----------|--------|-----------------|
| `Find`    | $O(N)$ | 需要遍历链表到包含指定值的节点 |
| `FindKth` | $O(i)$ | 需显式遍历到第 $i$ 个位置 |
| `Insert`  | $O(i)$ | 需显式遍历到第 $i$ 个位置 |
| `Delete`  | $O(N)$ | 需要遍历链表到包含指定值的节点 |

已知插入/删除位置时链表操作均为 $O(1)$——这是链表相对于数组的核心优势。`FindKth` 的 $O(i)$ 界是保守的，连续调用
`FindKth(L,2)`、`FindKth(L,3)` 可通过对表的一次扫描同时完成。

### 1.2 链表操作<a id=链表操作></a>

以下例程均假设表带有表头（`header` / `dummy node`）：表头是位于位置 0 的哨兵节点，不存数据。引入表头使空表和非空表的边界处理统一——
`FindPrevious` 删除首元素时返回表头位置而非 `NULL`，在表前端插入也无须特殊处理。

**Find**——返回关键字 `x` 在表中首次出现的位置，未找到返回 `NULL`：

```c
Node *Find(const List *list, int x) {
    Node *p = list->head->next;
    while (p != NULL && p->data != x)
        p = p->next;
    return p;
}
```

**FindPrevious**——返回关键字 `x` 的前驱位置，供 `Delete` 使用：

```c
Node *FindPrevious(const List *list, int x) {
    Node *p = list->head;
    while (p->next != NULL && p->next->data != x)
        p = p->next;
    return p;
}
```

**Delete**——删除 `x` 的首次出现；若 `x` 不存在则无操作：

```c
int Delete(List *list, int x) {
    Node *prev = FindPrevious(list, x);
    if (prev->next == NULL) return LIST_NOT_FOUND;

    Node *tmp = prev->next;
    prev->next = tmp->next;  /* 绕过被删节点 */
    free(tmp);
    return LIST_OK;
}
```

**Insert**——在位置 `pos` 之后插入元素 `x`：

```c
void Insert(List *list, Node *pos, int x) {
    Node *node = malloc(sizeof(Node));
    node->data = x;
    node->next = pos->next;
    pos->next = node;
}
```

### 1.3 常见错误<a id=常见错误></a>

释放链表时直接 `free(p); p=p->next`，正确的链表释放——先保存 `next`，再释放当前节点：

```c
void FreeList(List *list) {
    Node *p = list->head;
    while (p != NULL) {
        Node *next = p->next;
        free(p);
        p = next;
    }
}
```

遍历时的常见错误：

| 情形         | 正确做法                                          | 错误做法                             |
|------------|-----------------------------------------------|----------------------------------|
| 有表头，遍历数据节点 | `p = list->head->next`                        | `p = list->head`（会包含表头的数据域）      |
| 无表头，空表遍历   | 先判断 `list == NULL`                            | 直接访问 `list->data` 或 `list->next` |
| 删除后继续遍历    | 先保存 `next = p->next`，再 `free(p)`，再 `p = next` | `free(p); p = p->next`（访问已释放内存）  |

### 1.4 双链表与循环链表<a id=双链表与循环链表></a>

| 变体                           | 结构                | 优势                            | 代价                      |
|------------------------------|-------------------|-------------------------------|-------------------------|
| 双链表（`doubly linked list`）    | 每个节点增加 `prev` 指针  | 逆序遍历、删除时不需前驱                  | 空间增加一个指针域，插入/删除需调整更多指针  |
| 循环链表（`circular linked list`） | 尾节点的 `next` 指向头节点 | 可从任意节点遍历全表；配合尾指针可实现 $O(1)$ 尾插 | 边界判断由 `NULL` 改为判断是否回到起点 |

双链表的删除操作直接利用 `prev` 指针，不再需要 `FindPrevious`：

```c
void DeleteAt(Node *head, int index) {
    Node *p = GetAt(head, index);
    if (p == NULL) return;
    p->prev->next = p->next;
    if (p->next != NULL)
        p->next->prev = p->prev;
    free(p);
}
```

循环链表常配合尾指针（`tail`）使用：`InsertAtEnd` 将新节点插在 `tail` 之后，更新 `tail`，即 $O(1)$ 完成尾插。

### 1.5 应用示例<a id=表的应用></a>

**多项式**。一元多项式 $P(X) = \sum A_i X^{e_i}$ 可用两种方式表示：

| 实现方式 | 适用场景           | 类型                                              |
|------|----------------|-------------------------------------------------|
| 数组   | 稠密多项式（大部分系数非零） | `int CoeffArray[MaxDegree+1]; int HighPower;`   |
| 链表   | 稀疏多项式（大部分系数为零） | 每个节点存 `coefficient`、`exponent` 和 `next`，按指数降序排列 |

数组实现的乘法运行时间为 $O(MN)$。对于 $P_1(X) = 10X^{1000} + 5X^{14} + 1$ 和 $P_2(X) = 3X^{1990} - 2X^{1492} + 11X + 5$
，数组法将花费大量时间处理零系数和遍历不存在的项——链表实现按指数降序存储，只处理实际存在的非零项。

**基数排序**（`radix sort`）。基数排序是多趟桶式排序（`bucket sort`）的推广。桶式排序在 $M = \Theta(N)$ 时可在 $O(N)$
时间内对 $N$ 个范围在 $1$ 到 $M$ 的整数完成排序。

基数排序的思路：对 $N$ 个范围在 $0$ 到 $N^p-1$ 的数，使用最低位优先（`least significant digit first`）策略进行 $p$
趟桶式排序。每趟按当前位将元素分布到 $B$ 个桶中，落入同一桶的数用链表组织；收集阶段按桶的顺序依次取出，形成下一趟的输入。由于前一趟保证了低位有序，下一趟针对高位排序时不会破坏低位的顺序。

```c
#define RADIX 10

void RadixSort(int a[], int n) {
    Node *buckets[RADIX];
    for (int i = 0; i < RADIX; i++)
        buckets[i] = CreateEmptyList();

    int max = a[0];
    for (int i = 1; i < n; i++)
        if (a[i] > max) max = a[i];

    /* 按最低位优先进行多趟桶式排序 */
    for (int exp = 1; max / exp > 0; exp *= RADIX) {
        /* 分散：按当前位将数组元素放入对应桶 */
        for (int i = 0; i < n; i++) {
            int digit = (a[i] / exp) % RADIX;
            AppendTail(buckets[digit], a[i]);
        }
        /* 收集：按桶的顺序将元素送回数组 */
        int idx = 0;
        for (int i = 0; i < RADIX; i++) {
            Node *p = buckets[i]->head->next;
            while (p != NULL) {
                a[idx++] = p->data;
                p = p->next;
            }
            MakeEmpty(buckets[i]);
        }
    }
}
```

运行时间为 $O(P(N+B))$，其中 $P$ 为趟数，$B$ 为桶数。当 $B = \Theta(N)$ 时，可实现 $O(N)$
线性时间排序——但链表附加的常数开销使其在常数因子上可能劣于 $O(N \log N)$ 的比较排序。

## 2. 栈 ADT<a id=栈adt></a>

### 2.1 栈模型<a id=栈模型></a>

栈（`stack`）是限制插入和删除只能在一端进行的表，该端称为栈顶（`top`）。栈为 **LIFO**（`Last-In First-Out`，后进先出）结构。

| 操作     | 功能         |
|--------|------------|
| `Push` | 将元素压入栈顶    |
| `Pop`  | 弹出栈顶元素     |
| `Top`  | 返回栈顶元素但不弹出 |

对空栈执行 `Pop` 或 `Top` 是 ADT 错误；`Push` 时空间不足是实现错误，非 ADT 错误。

### 2.2 链表实现<a id=栈的链表实现></a>

栈的链表实现通过在表前端（栈顶）进行插入和删除完成，`Top` 和 `Pop` 调用前必须检查栈是否为空。

```c
typedef struct Node {
    int data;
    struct Node *next;
} Node;

int IsEmpty(const Stack *s) {
    return s->head->next == NULL;
}

void Push(Stack *s, int x) {
    Node *node = malloc(sizeof(Node));
    node->data = x;
    node->next = s->head->next;
    s->head->next = node;
}

int Top(const Stack *s) {
    if (IsEmpty(s)) return STACK_EMPTY;
    return s->head->next->data;
}

void Pop(Stack *s) {
    if (IsEmpty(s)) return;
    Node *top = s->head->next;
    s->head->next = top->next;
    free(top);
}
```

所有操作均为 $O(1)$。`malloc` 和 `free` 调用带来额外开销，可通过维护第二个空闲栈缓解——`Pop` 时将弹出的单元放入第二个栈而非
`free`，`Push` 时优先从第二个栈取用。

### 2.3 数组实现<a id=栈的数组实现></a>

数组实现下，每个栈维护一个 `top` 索引，指向第一个空位（`top = 0` 时为空栈）。

```c
typedef struct {
    int *data;
    int maxSize;
    int top;          /* 指向第一个空位 */
} Stack;

void Push(Stack *s, int x) {
    if (s->top >= s->maxSize) return;
    s->data[s->top] = x;
    s->top++;
}

void Pop(Stack *s, int *out) {
    if (s->top == 0) return;
    s->top--;
    if (out != NULL) *out = s->data[s->top];
}
```

所有操作均为 $O(1)$ 且常数极小——在带自增/自减寻址的机器上，`Push` 和 `Pop` 可写成单条机器指令。栈是继数组之后计算机科学中最基本的数据结构。

### 2.4 应用<a id=栈的应用></a>

**平衡符号**。编译器使用栈检查括号、方括号、花括号匹配：读到开放符号（`(`、`[`、`{`
）则入栈；读到封闭符号则弹出栈顶比对，不匹配或栈空时报错；文件尾栈非空时报错。算法为线性时间 $O(N)$。

**后缀表达式求值**。后缀（`postfix`）记法又称逆波兰记法（`Reverse Polish Notation`），将运算符置于操作数之后。对比中缀表达式
`6 * (5 + (2 + 3) * 8 + 3)`——需要括号和优先级规则——其后缀形式 `6 5 2 3 + 8 * + 3 + *` 完全消除了括号需求。

后缀表达式的求值过程用栈存储操作数：遇到操作数时入栈，遇到运算符时弹出两个操作数计算后将结果压回。

```c
int EvalPostfix(const char *expr) {
    Stack s; InitStack(&s, strlen(expr));
    for (int i = 0; expr[i] != '\0'; i++) {
        if (isdigit(expr[i])) {
            Push(&s, expr[i] - '0');
        } else {
            int b = 0, a = 0;
            Pop(&s, &b); Pop(&s, &a);
            switch (expr[i]) {
                case '+': Push(&s, a + b); break;
                case '*': Push(&s, a * b); break;
                case '-': Push(&s, a - b); break;
                case '/': Push(&s, a / b); break;
            }
        }
    }
    int result; Pop(&s, &result);
    return result;
}
```

以 `6 5 2 3 + 8 * + 3 + *` 为例，求值过程：

| 输入 | 操作            | 栈（底→顶）     |
|----|---------------|------------|
| 6  | push          | 6          |
| 5  | push          | 6, 5       |
| 2  | push          | 6, 5, 2    |
| 3  | push          | 6, 5, 2, 3 |
| +  | 2+3=5 push    | 6, 5, 5    |
| 8  | push          | 6, 5, 5, 8 |
| *  | 5×8=40 push   | 6, 5, 40   |
| +  | 5+40=45 push  | 6, 45      |
| 3  | push          | 6, 45, 3   |
| +  | 45+3=48 push  | 6, 48      |
| *  | 6×48=288 push | 288        |

**中缀到后缀的转换**。栈可将中缀表达式转换为后缀形式，转换过程中消化运算符优先级。

转换规则：

| 符号类型 | 处理规则                          |
|------|-------------------------------|
| 操作数  | 直接输出                          |
| `(`  | 入栈                            |
| `)`  | 弹出运算符并输出直到遇到 `(`，丢弃 `(`       |
| 运算符  | 弹出栈中优先级更高或相等的运算符并输出，再将当前运算符入栈 |
| 输入结束 | 弹出栈中所有剩余运算符并输出                |

中缀 `a + b * c + (d * e + f) * g` → 后缀 `a b c * + d e * f + g * +` 的逐步转换：

```c
int Precedence(char op) {
    if (op == '+' || op == '-') return 1;
    if (op == '*' || op == '/') return 2;
    return 0;  /* '(' */
}

void InfixToPostfix(const char *infix, char *postfix) {
    Stack s; InitStack(&s, strlen(infix));
    int j = 0;
    for (int i = 0; infix[i] != '\0'; i++) {
        char c = infix[i];
        if (isalnum(c)) {
            postfix[j++] = c;                   /* 操作数直接输出 */
        } else if (c == '(') {
            Push(&s, c);
        } else if (c == ')') {
            while (!IsEmpty(&s) && Top(&s) != '(')
                postfix[j++] = Pop(&s);
            Pop(&s);                            /* 丢弃 '(' */
        } else {                                /* 运算符 */
            while (!IsEmpty(&s) &&
                   Precedence(Top(&s)) >= Precedence(c))
                postfix[j++] = Pop(&s);
            Push(&s, c);
        }
    }
    while (!IsEmpty(&s))
        postfix[j++] = Pop(&s);
    postfix[j] = '\0';
}
```

转换同样只需 $O(N)$ 时间，一趟扫描完成。减法/除法纳入时，算法已默认从左到右结合，保证 `a-b-c` → `a b - c -`（而非
`a b c - -`）。

**函数调用**。栈是实现函数调用和递归的基础机制。发生函数调用时，主调例程的局部变量和返回地址作为活动记录（
`activation record`）或称栈帧（`stack frame`）压入调用栈；函数返回时弹出栈帧恢复现场。这与平衡符号问题在结构上等价。

栈空间耗尽（栈溢出）由失控递归（缺失基准情形）或过深的合法递归（如递归打印长链表的尾递归）引起。尾递归可通过机械转换为 `while`
循环消除——部分编译器可自动完成此转换，但不应依赖编译器。

## 3. 队列 ADT<a id=队列adt></a>

### 3.1 队列模型<a id=队列模型></a>

队列（`queue`）是插入在一端（队尾 `rear`）、删除在另一端（队头 `front`）进行的表。队列为 **FIFO**（`First-In First-Out`，先进先出）结构。

| 操作        | 功能        |
|-----------|-----------|
| `Enqueue` | 在队尾插入元素   |
| `Dequeue` | 删除并返回队头元素 |

### 3.2 数组实现<a id=队列的数组实现></a>

队列的数组实现使用循环数组（`circular array`）：当 `head` 或 `tail` 到达数组末尾时通过取模回绕到开头。使用 `emptySlot`
计数追踪空余槽位，避免 `head` 与 `tail` 相交时的满/空歧义。

```c
typedef struct {
    int *data;
    unsigned int maxSize;
    unsigned int emptySlot;
    unsigned int head;    /* 写入位置 */
    unsigned int tail;    /* 读取位置 */
} Queue;

void Enqueue(Queue *q, int x) {
    if (q->emptySlot == 0) return;     /* 满 */
    q->data[q->head] = x;
    q->head = (q->head + 1) % q->maxSize;
    q->emptySlot--;
}

int Dequeue(Queue *q, int *out) {
    if (q->emptySlot == q->maxSize)    /* 空 */
        return QUEUE_EMPTY;
    if (out != NULL) *out = q->data[q->tail];
    q->tail = (q->tail + 1) % q->maxSize;
    q->emptySlot++;
    return QUEUE_OK;
}
```

初始状态：`head = 0`，`tail = 0`，`emptySlot = maxSize`。所有操作均为 $O(1)$。

不使用 `Size` 域的替代方案通过 `head == tail` 判空、`(tail + 1) % maxSize == head` 判满，但满队列时只能存 `maxSize - 1`
个元素。`emptySlot` 法更直观且不牺牲容量。

## 小结<a id=小结></a>

| 结构      | 核心操作复杂度                                      | 关键约束                           |
|---------|----------------------------------------------|--------------------------------|
| 表（数组实现） | `FindKth` $O(1)$，`Insert`/`Delete` $O(N)$    | 需预知大小，适用于静态或查询为主的场景            |
| 表（链表实现） | `Find` $O(N)$，`Insert`/`Delete` $O(1)$（已知位置） | 不支持随机访问，`FindKth` 需 $O(i)$     |
| 栈       | `Push`/`Pop`/`Top` 均为 $O(1)$                 | LIFO，链表/数组实现常数时间相同             |
| 队列      | `Enqueue`/`Dequeue` 均为 $O(1)$                | FIFO，循环数组避免伪满                  |
| 基数排序    | $O(P(N+B))$                                  | 当 $B = \Theta(N)$ 时线性时间，常数因子较大 |
| 后缀表达式求值 | $O(N)$                                       | 一趟扫描，栈深度不超过表达式长度               |
| 中缀转后缀   | $O(N)$                                       | 一趟扫描，运算符优先级在转换时消化              |
