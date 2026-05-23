---
title: 2.1.A - 习题课
date: 2026-05-22T10:00:00
tags: [ 机器人, 机构学, 数学基础, 习题 ]
pinned: false
collection: 机器人机构学
outline:
  - title: 一、直线的线矢量
    slug: 直线的线矢量
  - title: 1. 定义类
    slug: 定义类
    level: 1
  - title: 2. 线矢量几何应用
    slug: 线矢量几何应用
    level: 1
  - title: 二、旋量
    slug: 旋量-习题
  - title: 1. 定义类
    slug: 旋量定义类
    level: 1
  - title: 2. 节距 h 的性质
    slug: 节距h的性质
    level: 1
  - title: 3. 轴线位置 r 的性质
    slug: 轴线位置r的性质
    level: 1
  - title: 4. 旋量的运算与互易积
    slug: 旋量的运算与互易积
    level: 1
head:
  - - meta
    - name: description
      content: 机构学旋量基础的配套习题——线矢量的 Plücker 坐标计算与正规化、格拉斯曼条件填空、互易积公式求公垂线距离与交角、旋量节距计算与坐标不变性证明。
  - - meta
    - name: keywords
      content: Plücker坐标, 线矢量, 旋量, 互易积, 节距, 公垂线, 习题
---

机构学旋量基础常见的习题整理

---
本文的参考笔记部分位于[机构学的数学基础](./robot-kinematics-01-basic.md)中

## 一、 直线的线矢量<a id=直线的线矢量></a>

### 1. 定义类<a id=定义类></a>

此类题目多涉及一些基本定义，掌握线矢量的定义即可，与此同时，需要清楚线矢量的本质是旋量的一种退化形式，用来判断线矢量合法性时需要用到。

#### 1.1 题目：证明所有经过坐标原点 $O$ 的线矢量必然满足 $P = Q = R = 0$。

> 直接使用线矩定义 $\boldsymbol{s}^{0} = \boldsymbol{r} \times \boldsymbol{s}$，取 $\boldsymbol{r} = \boldsymbol{0}$ 即可。

**解：**
线矢量的矩 $\boldsymbol{s}^{0} = \boldsymbol{r} \times \boldsymbol{s}$
。若直线过原点，可取线上一点 $\boldsymbol{r} = (0,0,0)$
，则 $\boldsymbol{s}^{0}= (0,0,0)$，即 $P=Q=R=0$。

#### 1.2 题目：计算经过点 $\boldsymbol{r}_1(1,1,0)$ 和 $\boldsymbol{r}_2(-1,1,2)$ 的直线的 Plücker 坐标，并正规化。

> 方向矢量取 $\boldsymbol{r}_2 - \boldsymbol{r}_1$ 后可按比例缩放（不影响直线表示），正规化时除以 $\|\boldsymbol{s}\|$。

**解：**
方向矢量 $\boldsymbol{s} = \boldsymbol{r}_2 - \boldsymbol{r}_1 = (-2, 0, 2)$，可取 $(-1, 0, 1)$。

线矩 $\boldsymbol{s}^{0} = \boldsymbol{r}_1 \times \boldsymbol{s} = (1,1,0) \times (-1,0,1) = (1,-1,1)$。

Plücker 坐标：$(-1,0,1;\;1,-1,1)$。$\|\boldsymbol{s}\| = \sqrt{2}$，正规化：
$$
\boxed{\left(-\frac{1}{\sqrt{2}},\;0,\;\frac{1}{\sqrt{2}};\;\frac{1}{\sqrt{2}},\;-\frac{1}{\sqrt{2}},\;\frac{1}{\sqrt{2}}\right)}
$$

#### 1.3 题目：求经过点 $\boldsymbol{r}_1(1,1,0)$、方向矢量为 $(-1,1,2)$ 的直线的 Plücker 坐标并正规化。

> 此处方向已直接给出，只需计算线矩即可。

**解：**
$\boldsymbol{s} = (-1, 1, 2)$，$\boldsymbol{s}^{0} = \boldsymbol{r}_1 \times \boldsymbol{s} = (1,1,0) \times (-1,1,2) = (2,-2,2)$。

Plücker 坐标：$(-1,1,2;\;2,-2,2)$。$\|\boldsymbol{s}\| = \sqrt{6}$，正规化：

$$
\boxed{\left(-\frac{1}{\sqrt{6}},\;\frac{1}{\sqrt{6}},\;\frac{2}{\sqrt{6}};\;\frac{2}{\sqrt{6}},\;-\frac{2}{\sqrt{6}},\;\frac{2}{\sqrt{6}}\right)}
$$

#### 1.4 题目：填空，使下列坐标表示一条线矢量。

**(1)** $(1,2,x;\;0,-1,-2)$

$1 \cdot 0 + 2 \cdot (-1) + x \cdot (-2) = 0 \;\Rightarrow\; x = -1$

**(2)** $(2,0,2;\;0,x,0)$

$2 \cdot 0 + 0 \cdot Q + 2 \cdot 0 = 0$，恒成立。$x$ 为**任意实数**。

**(3)** $(1,x,0;\;0,0,0)$

矩为零向量，$\boldsymbol{s} \cdot \boldsymbol{s}^{0}$ 恒为 $0$。$x$ 为**任意实数**。

**(4)** $(1,x,0;\;0,0,1)$

$1 \cdot 0 + x \cdot 0 + 0 \cdot 1 = 0$，恒成立。$x$ 为**任意实数**。

> 线矢量是旋量在$h = 0$时的退化，因此充要条件：$|\boldsymbol{s}| \neq 0$ 且 $\boldsymbol{s} \cdot \boldsymbol{s^{0}} = 0$
> ，即原部与对偶部的点积为0。

### 2. 线矢量几何应用<a id=线矢量几何应用></a>

#### 2.1 题目：确定两线矢量 $L_1$ 与 $L_2$ 的公法线距离 $d$ 与交角 $\theta$。

**(a)** $L_1 = (1,0,-1;\;0,\frac{1}{\sqrt{2}},0)$，$L_2 = (0,0,1;\;b,0,0)$

**解：**
$\boldsymbol{s}_1 = (1,0,-1)$，$\|\boldsymbol{s}_1\| = \sqrt{2}$；$\boldsymbol{s}_2 = (0,0,1)$，$\|\boldsymbol{s}_2\| = 1$。

$\cos\theta = \dfrac{-1}{\sqrt{2}} \;\Rightarrow\; \theta = 135^\circ$。

$\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 = \boldsymbol{s}_1 \cdot \boldsymbol{m}_2 + \boldsymbol{s}_2 \cdot \boldsymbol{m}_1 = (1,0,-1)\cdot(b,0,0) + (0,0,1)\cdot(0,\frac{1}{\sqrt{2}},0) = b$。

由互易积公式：$b = -\sqrt{2} \cdot 1 \cdot d \cdot \sin 135^\circ = -\sqrt{2} \cdot d \cdot \frac{\sqrt{2}}{2} = -d$
，故 $d = |b|$。

**(b)** $L_1 = (-1,0,1;\;0,-\frac{1}{\sqrt{2}},0)$，$L_2 = (0,0,1;\;b,0,0)$

**解：**
$\|\boldsymbol{s}_1\| = \sqrt{2}$，$\|\boldsymbol{s}_2\| = 1$。$\cos\theta = \dfrac{1}{\sqrt{2}} \;\Rightarrow\; \theta = 45^\circ$。

$\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 = (-1,0,1)\cdot(b,0,0) + (0,0,1)\cdot(0,-\frac{1}{\sqrt{2}},0) = -b$。

$-b = -\sqrt{2} \cdot d \cdot \sin 45^\circ = -d$，故 $d = |b|$。

> **线-线关系**可以使用旋量互易积公式
> $\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 = p_1 p_2[(h_1+h_2)\cos\alpha_{12} - a_{12}\sin\alpha_{12}]$
> 。对于线矢量（$h_1 = h_2 = 0$
> ），退化为 $\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 = -p_1 p_2 \cdot a_{12} \sin\alpha_{12}$
> ，其中 $p_i = \|\boldsymbol{s}_i\|$
> , 夹角 $\cos\alpha_{12} = \frac{\boldsymbol{s}_1 \cdot \boldsymbol{s}_2}{\|\boldsymbol{s}_1\|\|\boldsymbol{s}_2\|}$
> 可直接从方向矢量求出。


> 值得注意的是，公式中 $a_{12}$
> 是有向距离（从1指向2，正负取决于公垂线方向与 $\hat{\boldsymbol{s}}_1 \times \hat{\boldsymbol{s}}_2$
> 是否同向），公垂线长度 $d = |a_{12}| = |a_{21}|$。

#### 2.2 题目：已知两平面 $\boldsymbol{\pi}_1 = ((1,0,0); 0)$ 和 $\boldsymbol{\pi}_2 = ((0,1,1); 1)$，求其交线的 Plücker坐标并正规化。

**解**：

$\boldsymbol{l} = \boldsymbol{a} \times \boldsymbol{b} = (1,0,0) \times (0,1,1) = (0,-1,1)$

$\boldsymbol{l}^0 = a_0\boldsymbol{b} - b_0\boldsymbol{a} = 0 \cdot (0,1,1) - 1 \cdot (1,0,0) = (-1,0,0)$

Plücker 坐标（轴线坐标形式）：$(0,-1,1;\;-1,0,0)$。$\|\boldsymbol{l}\| = \sqrt{2}$，正规化：

$$
\boxed{\left(0,\;-\frac{1}{\sqrt{2}},\;\frac{1}{\sqrt{2}};\;-\frac{1}{\sqrt{2}},\;0,\;0\right)}
$$

> 轴线坐标与射线坐标的区别仅在前三个分量与后三个分量交换位置。此处结果为轴线坐标形式 $(\boldsymbol{l};\boldsymbol{l}^0)$。

> **面-面关系**多用法向量与平面约束关系：对于平面 $\boldsymbol{\pi}_1 = (\boldsymbol{a}; a_0) = (a_x, a_y, a_z, a_0)$
> 和 $\boldsymbol{\pi}_2 = (\boldsymbol{b}; b_0) = (b_x, b_y, b_z, b_0)$。两平面的法向量分别为 $\boldsymbol{a}$
> 和 $\boldsymbol{b}$
>
> 交线垂直于两法向量：
> $$
> \boldsymbol{l} = \boldsymbol{a} \times \boldsymbol{b}
> $$
> 交线上任一点 $\boldsymbol{r}$ 同时满足两平面方程 $\boldsymbol{a}\cdot\boldsymbol{r} + a_0 = 0$
> 和 $\boldsymbol{b}\cdot\boldsymbol{r} + b_0 = 0$，因此线矩
> $$
> \boldsymbol{l}^0 = \boldsymbol{r} \times \boldsymbol{l} = a_0\boldsymbol{b} - b_0\boldsymbol{a}
> $$
>

## 二、 旋量<a id=旋量-习题></a>

### 1. 定义类<a id=旋量定义类></a>

此类题目比较简单，需要注意旋量的基本表达形式，以及节距 $h$ , 轴线位置 $\boldsymbol{r}$ 的计算方法即可
$$
\boldsymbol{\$} = (\boldsymbol{s};\; \boldsymbol{s}^0)
= (\boldsymbol{s};\; \boldsymbol{r} \times \boldsymbol{s} + h\boldsymbol{s})
$$

$$h = \frac{\boldsymbol{s} \cdot \boldsymbol{s}^0}{\boldsymbol{s} \cdot \boldsymbol{s}},\qquad \boldsymbol{r} = \frac{\boldsymbol{s} \times \boldsymbol{s}^0}{\boldsymbol{s} \cdot \boldsymbol{s}}$$

> 旋量的对偶量 $\boldsymbol{s}^0 = \boldsymbol{r} \times \boldsymbol{s} + h\boldsymbol{s}$，其中 $\boldsymbol{r}$
> 是轴线上任意一点的位置矢量。$\boldsymbol{r}$ 沿 $\boldsymbol{s}$ 方向平移不改变 $\boldsymbol{r} \times \boldsymbol{s}$
> ，因此 $\boldsymbol{r}$ **不唯一**
> 。公式 $\boldsymbol{r} = \dfrac{\boldsymbol{s} \times \boldsymbol{s}^0}{\boldsymbol{s} \cdot \boldsymbol{s}}$
> 给出的是 $|\boldsymbol{r}|$ 最小的那个——原点向轴线作垂线的垂足。

单位旋量：
$$
\hat{\boldsymbol{\$}} = (\hat{\boldsymbol{s}};\; \hat{\boldsymbol{s}}^0)
= (\hat{\boldsymbol{s}};\; \boldsymbol{r} \times \hat{\boldsymbol{s}} + h\hat{\boldsymbol{s}})
$$

> 值得注意的是，旋量的对偶量$\boldsymbol{s}^{0}$由两个部分组成，垂直于轴线方向向量的$\boldsymbol{r} \times \boldsymbol{s}$
> 与平行于轴线方向向量的$\boldsymbol{h} \boldsymbol{s}$

#### 1.1 题目：填空，使成为指定节距的旋量。

**(a)** $(1,0,0;\;x,0,0)$，$h=1$

$\|\boldsymbol{s}\| = 1$，$h = x = 1 \;\Rightarrow\; x = 1$。

**(b)** $(1,0,0;\;1,x,0)$，$h=1$

$\|\boldsymbol{s}\| = 1$，$h = (1,0,0)\cdot(1,x,0)\equiv 1$，与 $x$ 无关。$x$ 为**任意实数**。

**(c)** $(1,0,0;\;1,x,0)$，$h=10$

节距固定为 $1$，不可能为 $10$。**无解**。

**(d)** $(1,x,0;\;1,0,0)$，$h=1$

$\|\boldsymbol{s}\|^2 = 1 + x^2$。$h = \dfrac{(1,x,0)\cdot(1,0,0)}{1+x^2} = \dfrac{1}{1+x^2} = 1 \;\Rightarrow\; x = 0$。

> 节距公式 $h = \dfrac{\boldsymbol{s}\cdot\boldsymbol{s}^0}{\boldsymbol{s}\cdot\boldsymbol{s}}$
> 。当 $\|\boldsymbol{s}\|=1$
> 时 $h = \boldsymbol{s}\cdot\boldsymbol{s}^0$。注意 $\boldsymbol{s}^0$ 中与 $\boldsymbol{s}$
> 正交的分量（$\boldsymbol{r} \times \boldsymbol{s}$）不影响节距——节距只取决于 $\boldsymbol{s}^0$ 在 $\boldsymbol{s}$
> 方向上的投影。

### 2. 节距 $h$ 的性质<a id=节距h的性质></a>

#### 2.1 题目：证明旋量的节距与原点选择无关。

**解：**

坐标系平移 $\boldsymbol{a}$，$\boldsymbol{r}' = \boldsymbol{r} - \boldsymbol{a}$。对偶量变化：

$$
\Delta \boldsymbol{s}^{0} =\boldsymbol{s}^{0}{'}-\boldsymbol{s}^{0}= (\boldsymbol{r}'-\boldsymbol{r}) \times \boldsymbol{s} = - \boldsymbol{a} \times \boldsymbol{s}
$$

因此：
$$
\boldsymbol{s}^{0}{'}= \boldsymbol{s}^{0}+\Delta \boldsymbol{s}^{0} = \boldsymbol{s}^{0}- \boldsymbol{a} \times \boldsymbol{s}
$$

$$
h' = \frac{\boldsymbol{s} \cdot \boldsymbol{s}^{0}{'}}{\boldsymbol{s} \cdot \boldsymbol{s}}
= \frac{\boldsymbol{s} \cdot \boldsymbol{s}^{0} - \overbrace{\boldsymbol{s} \cdot (\boldsymbol{a} \times \boldsymbol{s})}^{=0}}{\boldsymbol{s} \cdot \boldsymbol{s}}
= \frac{\boldsymbol{s} \cdot \boldsymbol{s}^{0}}{\boldsymbol{s} \cdot \boldsymbol{s}} = h
$$

> 轴线位置 $\boldsymbol{r}$ 依赖于原点，证明的关键在于 $\boldsymbol{s} \cdot (\boldsymbol{a} \times \boldsymbol{s}) = 0$
> （混合积循环置换后自叉为零）。

### 3. 轴线位置 $\boldsymbol{r}$ 的性质<a id=轴线位置r的性质></a>

#### 3.1 题目：已知旋量 $\boldsymbol{\$} = (1,0,0;\;0,2,0)$，求其轴线位置 $\boldsymbol{r}$，并说明是否唯一。

**解**：

$\boldsymbol{r} = \dfrac{\boldsymbol{s} \times \boldsymbol{s}^0}{\boldsymbol{s} \cdot \boldsymbol{s}} = \dfrac{(1,0,0) \times (0,2,0)}{1} = (0,0,2)$

验证：$\boldsymbol{r} \times \boldsymbol{s} + h\boldsymbol{s} = (0,0,2) \times (1,0,0) + 0 \cdot (1,0,0) = (0,2,0) = \boldsymbol{s}^0$。

轴线上任意一点 $\boldsymbol{r}' = \boldsymbol{r} + t\boldsymbol{s} = (t,\;0,\;2)$（$t \in \mathbb{R}$
）均给出相同的 $\boldsymbol{s}^0$：

$\boldsymbol{r}' \times \boldsymbol{s} = (t,0,2) \times (1,0,0) = (0,2,0) = \boldsymbol{s}^0$。

> 公式 $\boldsymbol{r} = \frac{\boldsymbol{s} \times \boldsymbol{s}^0}{\boldsymbol{s} \cdot \boldsymbol{s}}$
> 给出的 $(0,0,2)$ 正好是原点向轴线作垂线的垂足（$|\boldsymbol{r}| = 2$ 为最小值）。因此 $\boldsymbol{r}$ 可以在用来求空间点到直线的距离.

#### 3.2 题目：若旋量 $\boldsymbol{\$}$ 的节距 $h=0$，轴线位置为 $\boldsymbol{r}$。将坐标系平移 $\boldsymbol{a}$，证明新坐标系下公式 $\boldsymbol{r}' = \dfrac{\boldsymbol{s} \times \boldsymbol{s}^{0}{'}}{\boldsymbol{s} \cdot \boldsymbol{s}}$ 给出的仍为目标轴线上的一点（但不一定是平移 $\boldsymbol{a}$ 后的原 $\boldsymbol{r}$ 点）。

**解**：

平移后 $\boldsymbol{s}^{0}{'} = \boldsymbol{s}^0 - \boldsymbol{a} \times \boldsymbol{s}$。代入：

$$
\boldsymbol{r}' = \frac{\boldsymbol{s} \times (\boldsymbol{s}^0 - \boldsymbol{a} \times \boldsymbol{s})}{\boldsymbol{s} \cdot \boldsymbol{s}}
= \frac{\boldsymbol{s} \times \boldsymbol{s}^0}{\boldsymbol{s} \cdot \boldsymbol{s}} - \frac{\boldsymbol{s} \times (\boldsymbol{a} \times \boldsymbol{s})}{\boldsymbol{s} \cdot \boldsymbol{s}}
$$

利用三重叉积：$\boldsymbol{s} \times (\boldsymbol{a} \times \boldsymbol{s}) = |\boldsymbol{s}|^2\boldsymbol{a} - (\boldsymbol{s}\cdot\boldsymbol{a})\boldsymbol{s}$
，代入得：

$$
\boldsymbol{r}' = \boldsymbol{r} - \boldsymbol{a} + \frac{\boldsymbol{s}\cdot\boldsymbol{a}}{|\boldsymbol{s}|^2}\boldsymbol{s}
$$

$\boldsymbol{r} - \boldsymbol{a}$ 正是原 $\boldsymbol{r}$
在新坐标系下的位置。末项 $\frac{\boldsymbol{s}\cdot\boldsymbol{a}}{|\boldsymbol{s}|^2}\boldsymbol{s}$
是沿轴线方向的修正量——公式自动将新坐标系下的轴线点调整到离新原点最近的垂足位置。

### 4. 旋量的运算与互易积<a id=旋量的运算与互易积></a>

#### 4.1 题目：证明自互易旋量只有线矢量和偶量。

**解：**
$\boldsymbol{s}\cdot\boldsymbol{s}^0=h|s|^2$

- 若 $h=0$，为**线矢量**
- 若 $|s|=0$：为**偶量**（有且仅有对偶项）

> 自互易即 $\boldsymbol{\$} \circ \boldsymbol{\$} = 0$，展开得
> $$
> \boldsymbol{s}\cdot\boldsymbol{s}^0=\overbrace{\boldsymbol{s}\cdot(\boldsymbol{r}\times\boldsymbol{s})}^{=0}+\boldsymbol{s}\cdot h\boldsymbol{s}=h|s|^2
> $$
> 即，自互易含两种退化情形。
> $$
> h=0或|s|=0
> $$
>

#### 4.2 题目：证明旋量的互易积与坐标系的选择无关

**解：**

坐标系平移 $\boldsymbol{a}$
后，方向矢量不变，$\boldsymbol{s}_{i}^{0}{'} = \boldsymbol{s}_i - \boldsymbol{a} \times \boldsymbol{s}_i$。

$$
\begin{aligned}
\boldsymbol{\$}_1' \circ \boldsymbol{\$}_2'
&= \boldsymbol{s}_1 \cdot \boldsymbol{s}_{2}^{0}{'} + \boldsymbol{s}_2 \cdot \boldsymbol{s}_{1}^{0}{'} \\
&= \boldsymbol{s}_1 \cdot \boldsymbol{s}_{2}^{0} + \boldsymbol{s}_2 \cdot \boldsymbol{s}_{1}^{0}

- \boldsymbol{s}_1\cdot(\boldsymbol{a}\times\boldsymbol{s}_2) - \boldsymbol{s}_2\cdot(
  \boldsymbol{a}\times\boldsymbol{s}_1)
  \end{aligned}
  $$

由混合积恒等式 $\boldsymbol{s}_2\cdot(\boldsymbol{a}\times\boldsymbol{s}_1) = -\boldsymbol{s}_1\cdot(\boldsymbol{a}\times\boldsymbol{s}_2)$
（交换两个向量的位置），后两项相消。因此互易积在平移下不变。
