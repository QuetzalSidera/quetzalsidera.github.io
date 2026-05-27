---
title: 4.1 - 自由度分析
date: 2026-05-25T00:00:00
tags: [ 机器人, 机构学, 自由度 ]
pinned: false
collection: 机器人机构学
outline:
  - title: 1. 机构的基本组成
    slug: 机构的基本组成
  - title: 1.1 构件
    slug: 构件
    level: 1
  - title: 1.2 运动副
    slug: 运动副
    level: 1
  - title: 1.3 运动链
    slug: 运动链
    level: 1

  - title: 2. 自由度基本概念
    slug: 自由度基本概念
  - title: 2.1 自由度与约束
    slug: 自由度与约束
    level: 1
  - title: 2.2 自由度与活动度
    slug: 自由度与活动度
    level: 1
  - title: 2.3 局部自由度
    slug: 局部自由度
    level: 1
  - title: 2.4 公共约束与冗余约束
    slug: 公共约束与冗余约束
    level: 1
  - title: 2.5 机构的阶数与分类
    slug: 机构的阶数与分类
    level: 1

  - title: 3. 自由度计算公式
    slug: 自由度计算公式
  - title: 3.1 平面自由度公式
    slug: 平面自由度公式
    level: 1
  - title: 3.2 G-K 公式
    slug: G-K-公式
    level: 1
  - title: 3.3 计算示例
    slug: 计算示例
    level: 1

  - title: 4. 旋量分析法
    slug: 旋量分析法
  - title: 4.1 运动与约束旋量系
    slug: 运动与约束旋量系
    level: 1
  - title: 4.2 公共约束与冗余约束
    slug: 旋量-公共约束与冗余约束
    level: 1
  - title: 4.3 并联机构分析步骤
    slug: 并联机构分析步骤
    level: 1

head:
  - - meta
    - name: description
      content: 机器人机构学系列第三篇，介绍机构的基本组成（构件、运动副、运动链），自由度的基本概念（约束、活动度、局部自由度、冗余约束、公共约束），$Grübler$-$Kutzbach$ 公式及其修正形式，以及基于互易旋量系的自由度与过约束系统分析方法。
  - - meta
    - name: keywords
      content: 机器人机构学, 机构组成, 构件, 运动副, 转动副, 移动副, 运动链, 自由度, $Grübler$-$Kutzbach$公式, 局部自由度, 冗余约束, 公共约束, 过约束, 运动旋量系, 约束旋量系, 互易旋量法, 并联机构自由度分析
---

机构是机器人的骨架——它既是结构本体，也构成驱动、传动与执行系统的基础。前面建立了旋量数学工具与刚体运动描述，从本篇起进入机构本身。

---

<script setup lang="ts">
import {path as miscellaneousImagePath} from '@Miscellaneous/path' 
import Image from '../.vitepress/theme/components/shared/Image.vue'

const table4_1 = {
  src: miscellaneousImagePath['table4-1'],
  alt: 'table4-1',
  align: 'center',
  wrap: false,
  maxHeight: '26rem',
  caption: '运动副',
} as const

const table4_1_2 = {
  src: miscellaneousImagePath['table4-1(2)'],
  alt: 'table4-1(2)',
  align: 'center',
  wrap: false,
  maxHeight: '26rem',
  caption: '运动副（续表）',
} as const

const openClose = {
  src: miscellaneousImagePath['open-close'],
  alt: '开链与闭链机构示例',
  align: 'right',
  wrap: true,
  maxHeight: '28rem',
  caption: '开链与闭链机构示例',
} as const

const scottRussell = {
  src: miscellaneousImagePath['Scott-Russell'],
  alt: 'Scott-Russell机构',
  align: 'right',
  wrap: true,
  maxHeight: '15rem',
  caption: 'Scott-Russell机构',
} as const

const threeR = {
  src: miscellaneousImagePath['3R'],
  alt: '3R并联机器人',
  align: 'right',
  wrap: true,
  maxHeight: '8rem',
  caption: '3R并联机器人',
} as const

const threeRRR = {
  src: miscellaneousImagePath['3-RRR'],
  alt: '3-RRR并联机构',
  align: 'right',
  wrap: true,
  maxHeight: '8rem',
  caption: '3-RRR并联机构',
} as const

const stewart = {
  src: miscellaneousImagePath['Stewart'],
  alt: 'Scott-Russell机构',
  align: 'right',
  wrap: true,
  maxHeight: '8rem',
  caption: 'Stewart机构',
} as const

const sarrus = {
  src: miscellaneousImagePath['Sarrus'],
  alt: 'Sarrus机构',
  align: 'right',
  wrap: true,
  maxHeight: '8rem',
  caption: 'Sarrus机构',
} as const

</script>



本文介绍机构的基本组成元素（构件、运动副、运动链）与自由度（`Degree of Freedom, DoF`）的概念和计算方法。
## 1. 机构的基本组成{#机构的基本组成}

机构由构件（`link`）和运动副（`kinematic pair`）两类基本元素组成：构件是运动单元体，运动副是构件间的活动连接。

### 1.1 构件{#构件}

构件是机械系统中能够进行独立运动的单元体。机器人中的构件多为刚性连杆，简称为**杆**。机构中固定不动的构件称为**机架**或
**基座**。

本书主要研究刚性杆，不考虑构件的弹性或柔性变形。

### 1.2 运动副{#运动副}

运动副是两构件既保持接触又有相对运动的活动连接，在机器人学中常称为**关节**。机器人的运动学特性主要由运动副类型及其空间布局决定。

机器人中常用的七种运动副：

<Image v-bind="table4_1"/>
<Image v-bind="table4_1_2"/>

> 表中 V 级、IV 级、III 级指运动副引入的约束数（V 级 = 5 约束，IV 级 = 4 约束，III 级 = 3 约束）。R 表示转动自由度，T 表示移动自由度。

转动副和移动副是机器人中最常用的两类运动副。机器人中通常只选用低副（面接触），包括 R、P、H、C、U、E、S 七类。

### 1.3 运动链{#运动链}

两个或两个以上的构件通过运动副连接而成的可动系统称为**运动链**（`kinematic chain`）。

| 类型     | 定义            | 对应的机器人类型 |
|--------|---------------|----------|
| 开链（开环） | 各构件构成首末不封闭的系统 | 串联机器人    |
| 闭链（闭环） | 各构件构成首末封闭的系统  | 并联机器人    |
| 混链     | 既含闭链又含开链      | 混联机器人    |

<Image v-bind="openClose"/>

串联机器人的所有关节按顺序串联，工作空间大、灵巧性高；并联机器人的动平台通过多条支链与基座连接，刚度高、承载能力强；混联机器人兼具二者的特点。

## 2. 自由度基本概念{#自由度基本概念}

### 2.1 自由度与约束{#自由度与约束}

**自由度** $f$：确定机械系统位形（或位姿）所需的独立变量（广义坐标）数。空间中一个自由刚体最多具有 6
个自由度——沿三个坐标轴的 3 个移动和绕三个轴线的 3 个转动。

**约束** $c$：两构件通过运动副连接后，各自的运动会受到限制，这种限制即为约束。被约束的自由度数目称为**约束度**。

根据 Maxwell 理论，空间中任何物体的自由度 $f$ 与约束度 $c$ 满足：

$$
f + c = 6 \qquad \text{(空间)}
$$

平面运动中则为：

$$
f + c = 3 \qquad \text{(平面)}
$$

对刚性机构而言，运动副的本质就是约束——每个运动副在提供相对运动自由度的同时引入约束。

### 2.2 自由度与活动度{#自由度与活动度}

机构的**自由度**与**活动度**（`mobility`）是两个相关但不可混淆的概念：

| 概念  | 定义              | 适用对象       |
|-----|-----------------|------------|
| 自由度 | 机构位形具有的独立参数数目   | 机构整体或末端执行器 |
| 活动度 | 构件相对于机架的最大独立变量数 | 机构中所有运动构件  |

绝大多数情况下二者数值一致，但存在例外：

| 情况          | 活动度 | 自由度 | 原因             |
|-------------|-----|-----|----------------|
| 7 关节串联冗余机器人 | 7   | 6   | 末端执行器的自由度上限为 6 |
| 6 移动副串联机器人  | 6   | 3   | 末端仅能做三维移动      |

对串联机器人，自由度指末端执行器相对基座的自由度；对并联机器人，自由度指动平台的自由度。

### 2.3 局部自由度{#局部自由度}

**局部自由度**（`passive DoF` / `idle DoF`）是某些构件中存在的、不影响其他构件（尤其是输出构件）运动的自由度。

典型实例：

| 场景            | 局部自由度来源        |
|---------------|----------------|
| 平面凸轮机构中的滚子    | 滚子绕自身轴线的转动     |
| S-S 连接（两球副直连） | 连杆绕自身轴线的 1 个转动 |

S-S 连接在理论上有 6 个自由度，实际上绕连杆轴线的转动自由是一个局部自由度，有效自由度仅为 5——因此 S-S 在自由度上与 U-S
等效。

### 2.4 公共约束与冗余约束{#公共约束与冗余约束}

**公共约束**（`common constraint`
）：机构中所有构件都受到的共同约束，例如平面机构共享两个空间旋转约束与一个垂直平面的移动约束。

| 机构类型   | 公共约束数 | 说明           |
|--------|-------|--------------|
| 一般空间机构 | 0     | 无公共约束        |
| 平面机构   | 3     | 所有构件共享三个面外约束 |
| 球面机构   | 3     | 所有构件共享三个移动约束 |

旋量系解释：将机构所有运动副表示为运动旋量组成旋量系，若存在一个与该旋量系中每个旋量均互易（不做功）的反旋量，则该反旋量即为机构的一个公共约束。

**冗余约束**（`redundant constraint`
，也称虚约束）：机构中部分运动副之间满足某种特殊几何条件，使其中的一些约束对机构的运动不起作用。冗余约束在特定几何条件下才成立——不满足这些条件时，冗余约束变为有效约束，机构将不能运动。

> **例：Scott-Russell 机构的冗余约束分析**
>
> <Image v-bind="scottRussell" />
>
> 判断连杆（构件 2）的受力情况：它受到三个平面汇交力线矢的作用，所组成的约束旋量系的维数为 2——即三个约束中只有两个是独立的，存在
1 个冗余约束。
> #


公共约束与冗余约束统称**过约束**（`overconstraint`），相应的机构称为过约束机构。

### 2.5 机构的阶数与分类{#机构的阶数与分类}

机构的**阶数**（`order`）描述机构运动所需运动旋量系的维数（Hunt 定义），数值上：

$$
d = 6 - \lambda
$$

其中 $\lambda$ 为公共约束数。平面机构和球面机构的阶数均为 3（$\lambda = 3$）。

按自由度数目对机构分类：

| 类型      | 自由度数             | 说明                   |
|---------|------------------|----------------------|
| 少自由度机构  | $\text{DoF} < 6$ | 只能实现部分空间运动           |
| 全自由度机构  | $\text{DoF} = 6$ | 可实现空间任意给定运动          |
| 冗余自由度机构 | $\text{DoF} > 6$ | 除末端 6-DoF 外具有额外关节自由度 |

## 3. 自由度计算公式{#自由度计算公式}

### 3.1 平面自由度公式{#平面自由度公式}

平面机构中各构件仅能做平面运动。一个自由构件在平面中有 3 个自由度。设机构由 $N$ 个构件组成，选定一个为机架后：

- 运动构件数：$n = N - 1$
- 运动构件的总活动度：$3n$

用 $g$ 个运动副连接构件。第 $i$ 个运动副的自由度为 $f_i$（在平面中 $0 < f_i \leq 2$），则该运动副引入的约束数为 $3 - f_i$。

机构的自由度
$$F = 所有运动构件的活动度 − 所有运动副的约束度$$
即
$$F = 3(N - 1) − \sum_{i=1}^{g}(3 - f_i)$$
或写成
$$F = 3(N - g - 1) + \sum_{i=1}^{g} f_i$$

按照运动副引入的约束数（$3 - f_i$），将运动副进一步区分为低副和高副。
平面低副（转动副、移动副）引入 2 个约束（$f_i=1$），高副（齿轮副、凸轮副）一般引入 1 个约束（$f_i=2$）：

$$
F = 3(N - 1) - (2P_L + P_H)
$$

其中 $N - 1$ 为活动构件数，$P_L$ 为低副数，$P_H$ 为高副数。

### 3.2 G-K 公式{#G-K-公式}

将平面机构公式推广到空间。空间中一个自由刚体有 6 个自由度，设 $d$ 为机构的阶数，则：

$$
F = d(N - g - 1) + \sum_{i=1}^{g} f_i
$$

此即 **G-K（Grubler-Kutzbach）公式**。

| 参数    | 含义                                |
|-------|-----------------------------------|
| $F$   | 机构自由度                             |
| $d$   | 机构的阶数（一般空间机构 $d=6$，平面/球面机构 $d=3$） |
| $N$   | 构件总数（含机架）                         |
| $g$   | 运动副数目                             |
| $f_i$ | 第 $i$ 个运动副的自由度                    |

传统 G-K 公式（取 $d=6$ 或 $d=3$）在计算涉及**局部自由度**与**过约束**时会得出错误结果。

考虑公共约束（$\lambda$）、冗余约束（$\nu$）和局部自由度（$\xi$），G-K 公式修正为：

$$
F = d(N - g - 1) + \sum_{i=1}^{g} f_i + \nu - \xi
$$

| 参数    | 含义                      | 对 $F$ 的影响                                                                    |
|-------|-------------------------|------------------------------------------------------------------------------|
| $d$   | 机构的阶数，$d = 6 - \lambda$ | $\lambda \uparrow \;\Rightarrow\; d \downarrow \;\Rightarrow\; F \downarrow$ |
| $\nu$ | 冗余约束数                   | $\nu \uparrow \;\Rightarrow\; F \uparrow$                                    |
| $\xi$ | 局部自由度数                  | $\xi \uparrow \;\Rightarrow\; F \downarrow$                                  |

修正 G-K 公式是统一的机构自由度计算公式。正确计算的关键在于确定公共约束、冗余约束和局部自由度三个参数。

### 3.3 计算示例{#计算示例}

#### 例 1（平面 3R 开链机器人）
$N = 4$，$g = 3$，$\sum f_i = 3$，$d = 3$。
<Image v-bind="threeR"/>
$$
F = 3(4 - 3 - 1) + 3 = 3
$$

#### 例 2（平面 3-RRR 并联机器人）
$N = 8$，$g = 9$，$\sum f_i = 9$，$d = 3$。
<Image v-bind="threeRRR"/>

$$
F = 3(8 - 9 - 1) + 9 = 3
$$

#### 例 3（6-SPS Stewart 平台，局部自由度）
$N = 14$，$g = 18$，$\sum f_i = 42$。
<Image v-bind="stewart"/>

传统 G-K 公式（$d = 6$）：

$$
F = 6(14 - 18 - 1) + 42 = 12
$$

计算结果为 12，但动平台最多只有 6 个自由度。多余的 6 个自由度源于每条 S-P-S 支链中连杆绕自身轴线的转动——这是**局部自由度**
。使用修正公式（$d = 6$，$\nu = 0$，$\xi = 6$）：

$$
F = 6(14 - 18 - 1) + 42 + 0 - 6 = 6
$$

#### 例 4（Sarrus 折展机构，过约束）
$N = 6$，$g = 6$，$\sum f_i = 6$。
<Image v-bind="sarrus"/>

传统 G-K 公式（$d = 6$）：

$$
F = 6(6 - 6 - 1) + 6 = 0
$$

$F = 0$ 意味着机构被完全锁定，但该机构实际上可以运动。错误原因在于机构的特殊几何配置产生了公共约束（$\lambda = 3$
），阶数应为 $d = 3$ 而非 $d = 6$。使用修正公式（$d = 3$，$\nu = 0$，$\xi = 0$）：

$$
F = 3(6 - 6 - 1) + 6 = 3
$$

例 3 和例 4 表明：忽视局部自由度会导致 $F$ 偏大，忽视公共约束会导致 $F$ 偏小（甚至错误地判定机构不可动）。修正 G-K
公式通过显式引入 $\nu$ 和 $\xi$ 两项将两类影响纳入统一框架。

## 4. 旋量分析法{#旋量分析法}

修正 G-K 公式引入了 $\lambda$ 与 $\nu$，但未解决：**如何系统化地求出 $\lambda$ 与 $\nu$**
。本节利用[旋量理论基础](./robot-kinematics-03-spinor-basic.md)中的互易旋量系工具给出答案。

### 4.1 运动与约束旋量系{#运动与约束旋量系}

机构中每个单自由度运动副对应一个单位**运动副旋量**（KP 旋量）。$g$ 个运动副的 KP 旋量张成机构的**运动旋量系**$\mathcal{S}$：

$$
\mathcal{S} = \operatorname{span}\{\boldsymbol{\$}_1, \boldsymbol{\$}_2, \ldots, \boldsymbol{\$}_g\}
$$

$\mathcal{S}$ 的互易旋量系即为**约束旋量系**$\mathcal{S}^r$
——其中的每个基旋量表示一个对机构不做功的约束力（线矢量）或约束力偶（偶量）：

$$
\mathcal{S} \boldsymbol{\Delta} (\mathcal{S}^r)^{\mathrm{T}} = \boldsymbol{0}, \qquad \dim(\mathcal{S}) + \dim(\mathcal{S}^r) = 6
$$

常用运动副的 KP 旋量（以轴线上一点 $\boldsymbol{r}$ 和单位方向矢量 $\boldsymbol{u}$ 表达）：

| 运动副 | 符号 | 自由度数 | KP 旋量                                                                                                                                                                                              |
|-----|:--:|:----:|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 移动副 | P  |  1   | $\boldsymbol{\$}_P = (\boldsymbol{0};\; \boldsymbol{u})$                                                                                                                                           |
| 转动副 | R  |  1   | $\boldsymbol{\$}_R = (\boldsymbol{u};\; \boldsymbol{r} \times \boldsymbol{u})$                                                                                                                     |
| 螺旋副 | H  |  1   | $\boldsymbol{\$}_H = (\boldsymbol{u};\; \boldsymbol{r} \times \boldsymbol{u} + h\boldsymbol{u})$                                                                                                   |
| 圆柱副 | C  |  2   | $\{(\boldsymbol{u};\; \boldsymbol{r} \times \boldsymbol{u}),\; (\boldsymbol{0};\; \boldsymbol{u})\}$                                                                                               |
| 万向铰 | U  |  2   | $\{(\boldsymbol{u};\; \boldsymbol{r} \times \boldsymbol{u}),\; (\boldsymbol{v};\; \boldsymbol{r} \times \boldsymbol{v})\}$（$\boldsymbol{u} \perp \boldsymbol{v}$）                                  |
| 球面副 | S  |  3   | $\{(\boldsymbol{e}_x;\; \boldsymbol{r} \times \boldsymbol{e}_x),\; (\boldsymbol{e}_y;\; \boldsymbol{r} \times \boldsymbol{e}_y),\; (\boldsymbol{e}_z;\; \boldsymbol{r} \times \boldsymbol{e}_z)\}$ |

> 多自由度运动副（C、U、S）拆分为若干单自由度分量，每个分量对应一个独立 KP 旋量。此表是旋量法分析机构自由度的基础。

### 4.2 公共约束与冗余约束{#旋量-公共约束与冗余约束}

公共约束的旋量表达：**公共约束**是与机构中**每一个**运动副的 KP 旋量均互易的约束旋量。
> 在并联机构中，**公共约束**即是各支链约束旋量系的交集。

设全部 KP 旋量张成机构总运动旋量系 $\mathcal{S}_m$，则公共约束旋量系 $\mathcal{S}^c$ 为 $\mathcal{S}_m$ 的互易旋量系：

$$
\mathcal{S}^c = \{\boldsymbol{\$}^c \mid \boldsymbol{\$}_i \circ \boldsymbol{\$}^c = 0,\; \forall \boldsymbol{\$}_i \in \mathcal{S}_m\}
$$

公共约束数
$$\lambda = \dim(\mathcal{S}^c)$$
机构的阶数
$$d = 6 - \lambda$$

公共约束的旋量表达：**冗余约束**的判断在去除公共约束后进行。将剩余 $t$ 个约束旋量构成旋量系，设其秩为 $k$。若 $k < t$
，多余约束即为冗余：

$$
\nu = t - k
$$

物理含义：$t$ 个约束中仅 $k$ 个线性无关，其余 $t-k$ 个虽存在但对机构运动不产生额外限制。

将旋量法求得的 $\lambda$（进而 $d = 6 - \lambda$）与 $\nu$ 代入修正 G-K 公式：

$$
F = d(N - g - 1) + \sum_{i=1}^{g} f_i + \nu - \xi
$$

### 4.3 并联机构分析步骤{#并联机构分析步骤}

并联机构由动平台通过 $p$ 条支链与基座连接。将[4.2节](#旋量-公共约束与冗余约束)的判定方法组织为可操作的两套步骤。

#### a. 自由度分析

| 步骤 | 操作                               | 方法                                                                                                     |
|:--:|----------------------------------|--------------------------------------------------------------------------------------------------------|
| 1  | 判断局部自由度数目 $\xi$                  | 检查 S-S、S-E、E-E 等含局部自由度的运动链                                                                             |
| 2  | 建立各分支运动旋量系 $\mathcal{S}_{bi}$    | 写出分支中每个运动副的 KP 旋量，$i = 1,\ldots,p$                                                                     |
| 3  | 求各分支约束旋量系 $\mathcal{S}^{r}_{bi}$ | 求解 $\mathcal{S}_{bi} \boldsymbol{\Delta} \boldsymbol{\$}^r = \boldsymbol{0}$                           |
| 4  | 合成动平台约束旋量系 $\mathcal{S}^r$       | $\mathcal{S}^r = \mathcal{S}^{r}_{b1} \cup \mathcal{S}^{r}_{b2} \cup \cdots \cup \mathcal{S}^{r}_{bp}$ |
| 5  | 求动平台运动旋量系 $\mathcal{S}_f$        | 求解 $\mathcal{S}^r \boldsymbol{\Delta} \boldsymbol{\$} = \boldsymbol{0}$                                |
| 6  | 确定自由度性质                          | 从 $\mathcal{S}_f$ 的基旋量判断各自由度的运动类型与方向                                                                   |
| 7  | 全周性验证                            | 改变机构位形，重复 2-6；若自由度性质不变则为全周自由度                                                                          |

动平台自由度数 $F = \dim(\mathcal{S}_f)$。

#### b. 公共约束分析

| 步骤 | 操作                         | 方法                                                                                         |
|:--:|----------------------------|--------------------------------------------------------------------------------------------|
| 1  | 合成机构总运动旋量系 $\mathcal{S}_m$ | $\mathcal{S}_m = \mathcal{S}_{b1} \cup \mathcal{S}_{b2} \cup \cdots \cup \mathcal{S}_{bp}$ |
| 2  | 求机构总约束旋量系 $\mathcal{S}^c$  | 求解 $\mathcal{S}_m \boldsymbol{\Delta} \boldsymbol{\$}^c = \boldsymbol{0}$                  |
| 3  | 公共约束数                      | $\lambda = \dim(\mathcal{S}^c)$，$d = 6 - \lambda$                                          |

#### c. 冗余约束分析

| 步骤 | 操作                                      | 方法                                                                                                                                  |
|:--:|-----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| 1  | 建立分支约束旋量集 $\langle\mathcal{S}^r\rangle$ | $\langle\mathcal{S}^r\rangle = \mathcal{S}^{r}_{b1} \oplus \mathcal{S}^{r}_{b2} \oplus \cdots \oplus \mathcal{S}^{r}_{bp}$（直和，保留重复） |
| 2  | 合成机构总运动旋量系 $\mathcal{S}_m$              | $\mathcal{S}_m = \mathcal{S}_{b1} \cup \mathcal{S}_{b2} \cup \cdots \cup \mathcal{S}_{bp}$                                          |
| 3  | 求机构总约束旋量系 $\mathcal{S}^c$               | 求解 $\mathcal{S}_m \boldsymbol{\Delta} \boldsymbol{\$}^c = \boldsymbol{0}$                                                           |
| 4  | 求动平台补约束旋量系 $\mathcal{S}^r_c$            | $\mathcal{S}^r = \mathcal{S}^c \cup \mathcal{S}^r_c$                                                                                |
| 5  | 求补约束旋量集 $\langle\mathcal{S}^r_c\rangle$ | 根据$\langle\mathcal{S}^r\rangle = \mathcal{S}^c \oplus \langle\mathcal{S}^r_c\rangle$，求得动平台补约束旋量集$\langle\mathcal{S}^r_c\rangle$     |
| 6  | 冗余约束数                                   | $\nu = \operatorname{card}(\langle\mathcal{S}^r_c\rangle) - \dim(\mathcal{S}^r_c)$                                                  |


> 值得注意的是，$\langle\mathcal{S}^r\rangle$ 中的尖括号 $\langle\cdot\rangle$ 表示**约束旋量的多重集合**
> ，用于保留不同分支中出现的重复约束旋量。
> 而不带尖括号的
> $\mathcal{S}^r$
> 表示由这些约束旋量张成的**约束旋量系（线性空间）**，其中重复约束会自动合并，仅反映约束的独立方向与维数。
