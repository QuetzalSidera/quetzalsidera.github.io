---
title: 1.2 - 位形空间与刚体运动
date: 2026-05-22T00:00:00
tags: [ 机器人, 机构学, 数学基础 ]
pinned: false
collection: 机器人机构学
outline:
  - title: 1. 位形空间
    slug: 位形空间
  - title: 1.1 拓扑空间结构
    slug: 拓扑空间结构
    level: 1
  - title: 1.2 显式与隐式参数化
    slug: 显式与隐式参数化
    level: 1
  - title: 1.3 闭环方程与 Pfaffian 约束
    slug: 闭环方程与pfaffian约束
    level: 1

  - title: 2. 描述对象
    slug: 描述对象
  - title: 2.1 自由矢量与线矢量
    slug: 自由矢量与线矢量
    level: 1
  - title: 2.2 刚体位姿
    slug: 刚体位姿
    level: 1


  - title: 3. 旋转矩阵
    slug: 旋转矩阵
  - title: 3.1 定义与性质
    slug: 旋转矩阵定义与性质
    level: 1
  - title: 3.2 应用
    slug: 旋转矩阵的应用
    level: 1
  - title: 3.3 旋转算子
    slug: 旋转算子
    level: 1
  - title: 3.4 旋转算子的指数坐标
    slug: 旋转算子的指数坐标
    level: 1

  - title: 4. 齐次矩阵
    slug: 齐次矩阵
  - title: 4.1 定义
    slug: 定义
    level: 1
  - title: 4.2 复合规则
    slug: 复合规则
    level: 1

  - title: 5. 欧拉角
    slug: 欧拉角
  - title: 5.1 动轴欧拉角
    slug: 动轴欧拉角
    level: 1
  - title: 5.2 定轴欧拉角（R-P-Y 角）
    slug: 定轴欧拉角
    level: 1
  - title: 5.3 奇异性
    slug: 欧拉角奇异性
    level: 1

  - title: 6. 等效轴-角
    slug: 等效轴角
  - title: 6.1 Rodrigues 公式
    slug: rodrigues公式
    level: 1
  - title: 6.2 由姿态矩阵反求等效轴与转角
    slug: 反求等效轴角
    level: 1

  - title: 7. 单位四元数
    slug: 单位四元数
  - title: 7.1 定义与运算法则
    slug: 四元数定义与运算
    level: 1
  - title: 7.2 四元数与姿态表示
    slug: 四元数姿态表示
    level: 1

  - title: 8. 相互关系
    slug: 相互关系
  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 机器人机构学系列第二篇，介绍位形空间的拓扑结构与解析表达，刚体位姿的四种数学描述——旋转矩阵（方向余弦矩阵）、欧拉角（动轴/定轴）、等效轴-角与Rodrigues公式、单位四元数及其相互映射关系。
  - - meta
    - name: keywords
      content: 位形空间, 拓扑空间, Pfaffian约束, 旋转矩阵, 方向余弦矩阵, 齐次变换, 欧拉角, RPY角, 等效轴角, Rodrigues公式, 单位四元数
---

刚体运动学是机器人结构学与运动学的基础，核心在于描述刚体的位姿及杆件之间的相对运动。

---
本文承接[机构学的数学基础](./robot-kinematics-01-basic.md)
，先介绍机器人的位形空间与刚体位姿的基本概念，再聚焦刚体姿态的四种数学描述（旋转矩阵、欧拉角、等效轴-角、单位四元数）及其相互映射关系。本篇不讨论速度层面的正/逆运动学，相关内容后续展开。

## 1. 位形空间 {#位形空间}

机器人的**位形**（`configuration`）是机器人上每个点位的全体集合。包含所有可能位形的 $n$ 维空间称为**位形空间**（`C-space`，
`configuration space`）。机器人的位形用 C-space 中的一个特征点表示。

### 1.1 拓扑空间结构 {#拓扑空间结构}

C-space 的拓扑结构是空间本身的基本几何属性，与参考坐标系的选择无关。四种典型的拓扑空间结构：

| 符号                                   | 含义                  | 示例                                      |
|--------------------------------------|---------------------|-----------------------------------------|
| $\mathbb{R}^n$                       | $n$ 维欧几里得空间         | 平面上动点的 C-space：$\mathbb{R}^2$           |
| $S^n$                                | $n+1$ 维空间内的 $n$ 维球面 | 球面上一点的 C-space：$S^2$                    |
| $T^n = S^1 \times S^1 \times \cdots$ | $n$ 维环面             | 2R 机器人的 C-space：$T^2 = S^1 \times S^1$  |
| 正交积形式                                | 低维空间组合              | 平面刚体的 C-space：$\mathbb{R}^2 \times S^1$ |

判断机器人 C-space 的方法：列出所有独立的位置参数及其取值范围，识别每个参数对应的拓扑结构，最后取正交积。

### 1.2 显式与隐式参数化 {#显式与隐式参数化}

C-space 的解析表示有两种形式：

| 形式          | 做法                                            | 优点                 | 缺点              |
|-------------|-----------------------------------------------|--------------------|-----------------|
| 显式参数化（局部坐标） | 用 $n$ 个独立参数直接表示 $n$ 维空间                       | 参数少，无冗余            | 难以对闭链机构建模；易产生奇异 |
| 隐式参数化（全局坐标） | 将 $n$ 维空间嵌入 $m$ 维欧氏空间（$m > n$），附加 $m-n$ 个约束方程 | 容易建模（只需写出约束方程）；无奇异 | 参数冗余            |

以单位球面为例：显式参数化用经纬度 $(\varphi, \theta)$ 两个独立参数；隐式参数化用三维坐标 $(x,y,z)$
外加约束方程 $x^2 + y^2 + z^2 = 1$。

### 1.3 闭环方程与 Pfaffian 约束 {#闭环方程与pfaffian约束}

对于 $n$ 自由度的单环或多环机器人，C-space 可隐式表示为列向量 $\boldsymbol{q} = (q_1, q_2, \ldots, q_n)^{\mathrm{T}}$
，其 $k$ 个独立位移约束方程的展开形式为：

$$
\boldsymbol{f}(\boldsymbol{q}) =
\begin{bmatrix}
f_1(q_1, q_2, \ldots, q_n) \\
f_2(q_1, q_2, \ldots, q_n) \\
\vdots \\
f_k(q_1, q_2, \ldots, q_n)
\end{bmatrix}
= \boldsymbol{0}, \quad k \leq n
$$

此即**闭环方程**（`loop-closure equations`）。每个方程 $f_i(\boldsymbol{q}) = 0$
约束一个由关节运动链闭合形成的位移关系。这类可直接写成 $\boldsymbol{f}(\boldsymbol{q}) = \boldsymbol{0}$ 形式的约束称为
**完整约束**（`holonomic constraints`）——它直接限制 C-space 中的位形，将独立自由度数从 $n$ 降为 $n-k$。

对闭环方程两边关于关节参数 $\boldsymbol{q}$ 求微分，由链式法则展开得：

$$
\frac{\partial \boldsymbol{f}}{\partial \boldsymbol{q}} \dot{\boldsymbol{q}} =
\begin{bmatrix}
\frac{\partial f_1}{\partial q_1} & \frac{\partial f_1}{\partial q_2} & \cdots & \frac{\partial f_1}{\partial q_n} \\
\frac{\partial f_2}{\partial q_1} & \frac{\partial f_2}{\partial q_2} & \cdots & \frac{\partial f_2}{\partial q_n} \\
\vdots & \vdots & \ddots & \vdots \\
\frac{\partial f_k}{\partial q_1} & \frac{\partial f_k}{\partial q_2} & \cdots & \frac{\partial f_k}{\partial q_n}
\end{bmatrix}
\begin{bmatrix} \dot{q}_1 \\ \dot{q}_2 \\ \vdots \\ \dot{q}_n \end{bmatrix}
= \boldsymbol{0}
$$

记 $\boldsymbol{A}(\boldsymbol{q}) = \frac{\partial \boldsymbol{f}}{\partial \boldsymbol{q}} \in \mathbb{R}^{k \times n}$
，得速度层面的约束方程：

$$
\boldsymbol{A}(\boldsymbol{q})\dot{\boldsymbol{q}} = \boldsymbol{0}
$$

形如 $\boldsymbol{A}(\boldsymbol{q})\dot{\boldsymbol{q}} = \boldsymbol{0}$ 的速度约束方程统称为 **Pfaffian 约束**
。Pfaffian 约束按是否可积分为两类：

| 类型                            | 判别条件                                                                                                                                             | 特征                                                                                   |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| **可积 Pfaffian 约束**（完整约束的速度形式） | $\boldsymbol{A}(\boldsymbol{q})$ 是某个 $\boldsymbol{f}(\boldsymbol{q})$ 的雅可比矩阵（即 $\boldsymbol{A} = \partial\boldsymbol{f}/\partial\boldsymbol{q}$） | 速度约束可积回位移约束 $\boldsymbol{f}(\boldsymbol{q}) = \boldsymbol{0}$；既减少速度维数，也减少 C-space 维数 |
| **不可积 Pfaffian 约束**（非完整约束）    | 不存在 $\boldsymbol{f}(\boldsymbol{q})$ 使 $\boldsymbol{A} = \partial\boldsymbol{f}/\partial\boldsymbol{q}$ 恒成立                                      | 速度约束不可积分为纯位移约束；只减少速度维数，不减少 C-space 维数                                                |

硬币在平面上无滑动的纯滚动是典型的非完整约束：位形参数 $\boldsymbol{q} = (x, y, \phi, \theta)^{\mathrm{T}}$（C-space
为 $\mathbb{R}^2 \times T^2$，四维）。无滑动条件要求接触点速度为零：

$$
\dot{x} = r\dot{\theta}\cos\phi,\quad \dot{y} = r\dot{\theta}\sin\phi
$$

写成 Pfaffian 形式：

$$
\begin{bmatrix}
1 & 0 & 0 & -r\cos\phi \\
0 & 1 & 0 & -r\sin\phi
\end{bmatrix}
\begin{bmatrix} \dot{x} \\ \dot{y} \\ \dot{\phi} \\ \dot{\theta} \end{bmatrix}
= \boldsymbol{0}
$$

该约束矩阵 $\boldsymbol{A}(\boldsymbol{q})$ 不满足可积条件（不存在 $\boldsymbol{f}(x,y,\phi,\theta)$
使 $\partial\boldsymbol{f}/\partial\boldsymbol{q} = \boldsymbol{A}$）。因此硬币虽然瞬时只能沿 $(\cos\phi, \sin\phi)$
方向移动，但通过 $\phi$ 的转动仍可到达平面上任意 $(x, y)$ ——速度维数从 4 降为 2，C-space 维数仍为
4。轮式移动机器人的运动学正是非完整约束的典型应用。

## 2. 描述对象 {#描述对象}

### 2.1 自由矢量与线矢量 {#自由矢量与线矢量}

刚体运动描述中，两类矢量的变换规则有本质区别：

| 类型                  | 特征                                     | 变换规则                                                                                        | 示例                                             |
|---------------------|----------------------------------------|---------------------------------------------------------------------------------------------|------------------------------------------------|
| 自由矢量（`free vector`） | 只有大小和方向，无固定作用线                         | 只旋转，不平移：$\boldsymbol{v}' = R\,\boldsymbol{v}$                                               | 角速度 $\boldsymbol{\omega}$、力偶矩 $\boldsymbol{m}$ |
| 线矢量（`line vector`）  | 有大小、方向与固定作用线（需指定线上一点 $\boldsymbol{r}$） | 旋转且随线上点平移：$\boldsymbol{v}' = R\,\boldsymbol{v} + \boldsymbol{t} \times (R\,\boldsymbol{v})$ | 力 $\boldsymbol{f}$、线速度                         |

线矢量含有位置属性，变换时位置向量的偏移通过叉积贡献附加项。这一区别直接引出了后续旋量理论中原部与对偶部的坐标变换规则。

### 2.2 刚体位姿 {#刚体位姿}

刚体的位姿（`pose`）由**位置**与**姿态**两部分组成。

**位置描述**：空间一点 $P$ 在世界坐标系 $\{A\}$ 中的位置用三维向量表示：

$$
{}^A\boldsymbol{P} = \begin{bmatrix} P_x \\ P_y \\ P_z \end{bmatrix}
$$

其三个分量分别为该点在 $\{A\}$ 三个单位坐标轴上的投影：$P_x = {}^A\boldsymbol{P} \cdot \boldsymbol{x}_A$ 等。

**姿态描述**：在物体 $\{B\}$ 上固连一物体坐标系，通过 $\{B\}$ 相对 $\{A\}$ 的姿态来描述刚体姿态。$\{B\}$
的三个单位坐标轴 $\boldsymbol{x}_B, \boldsymbol{y}_B, \boldsymbol{z}_B$ 在 $\{A\}$ 中的坐标构成姿态矩阵，即旋转矩阵。

**位姿描述**：将位置与姿态组合，用集合 $\{ {}^A_B R,\ {}^A\boldsymbol{P}_{B\text{ORG}} \}$ 或齐次变换矩阵 ${}^A_B T$（见第
5 节）表示。

## 3. 旋转矩阵 {#旋转矩阵}

### 3.1 定义与性质 {#旋转矩阵定义与性质}

$\{B\}$ 的三个单位坐标轴在 $\{A\}$ 中的投影组成旋转矩阵：

$$
{}^A_B R = \begin{bmatrix}
{}^A\boldsymbol{x}_B & {}^A\boldsymbol{y}_B & {}^A\boldsymbol{z}_B
\end{bmatrix} =
\begin{bmatrix}
r_{11} & r_{12} & r_{13} \\
r_{21} & r_{22} & r_{23} \\
r_{31} & r_{32} & r_{33}
\end{bmatrix}
$$

各元素均为两坐标系各坐标轴夹角的余弦，故又称**方向余弦矩阵**（`direction cosine matrix`）。

旋转矩阵 $R \in \mathbb{R}^{3 \times 3}$ 的基本性质：

| 性质  | 表达式                                       | 含义              |
|-----|-------------------------------------------|-----------------|
| 正交性 | $R R^{\mathrm{T}} = R^{\mathrm{T}} R = I$ | 列（行）向量均为单位正交向量  |
| 行列式 | $\det(R) = 1$                             | 右手系→右手系，排除了反射变换 |

由正交性可推出：
- **逆等于转置**：$R^{-1} = R^{\mathrm{T}}$
- **保长性**：$\|R\boldsymbol{x}\| = \|\boldsymbol{x}\|$（正交变换保持向量长度）
- **封闭性**：$R_1 R_2$ 也是旋转矩阵
- **不满足交换律**：$R_1 R_2 \neq R_2 R_1$（一般情况）

9 个元素中仅 3 个独立——正交性提供 6 个约束方程（$r_{i1}^2 + r_{i2}^2 + r_{i3}^2 = 1$
三条，$\boldsymbol{r}_i \cdot \boldsymbol{r}_j = 0\;(i \neq j)$ 三条）。

所有旋转矩阵的集合构成**三维旋转群** $SO(3)$（`3D rotation group`）：

$$
SO(3) = \{ R \in \mathbb{R}^{3 \times 3} : RR^{\mathrm{T}} = I,\ \det(R) = 1 \}
$$

### 3.2 应用 {#旋转矩阵的应用}

旋转矩阵有两类根本不同的应用——区分"谁在变"是关键。

**a. 坐标系变换**：同一点在不同坐标系下的坐标转换（点不动，坐标系换）。设 $\{B\}$ 相对 $\{A\}$ 的姿态为 ${}^A_B R$，点 $P$
在 $\{B\}$ 中的坐标 ${}^B\boldsymbol{p}$ 变换到 $\{A\}$ 中：

$$
{}^A\boldsymbol{p} = {}^A_B R \; {}^B\boldsymbol{p}
$$

左乘旋转矩阵，将 $\{B\}$ 下的坐标"映射"到 $\{A\}$ 下。

**b. 运动描述**：同一坐标系内向量的旋转（坐标系不变，点运动）。刚体 $\{B\}$ 相对 $\{A\}$ 的旋转矩阵为 $R$，对 $\{B\}$
上的一点 ${}^A\boldsymbol{p}$ 施加与 $\{B\}$ 相同的旋转：

$$
{}^A\boldsymbol{p}' = R \; {}^A\boldsymbol{p}
$$

> 两类应用的区别：坐标系变换中，$R$ 左乘的是点在 $\{B\}$ 下的坐标；运动描述中，$R$ 左乘的是点在 $\{A\}$
下的坐标。

多次变换的**左乘/右乘规则**：

| 参照系                 | 规则     | 示例                        |
|---------------------|--------|---------------------------|
| 相对固定坐标系 $\{A\}$ 的变换 | **左乘** | $R = R_3 R_2 R_1$（后发生的左乘） |
| 相对动坐标系 $\{B\}$ 的变换  | **右乘** | $R = R_1 R_2 R_3$（后发生的右乘） |

原因：左乘对应固定系算子（作用于当前坐标系），右乘对应动系算子（作用于物体自身）。两者依据的是同一物理事实——每次旋转都是相对当前坐标系的某一轴。

### 3.3 旋转算子 {#旋转算子}

绕固定坐标轴 $x$、$y$、$z$ 旋转 $\theta$ 角的旋转算子：

$$
R_x(\theta) = \begin{bmatrix}
1 & 0 & 0 \\
0 & \cos\theta & -\sin\theta \\
0 & \sin\theta & \cos\theta
\end{bmatrix},\quad
R_y(\theta) = \begin{bmatrix}
\cos\theta & 0 & \sin\theta \\
0 & 1 & 0 \\
-\sin\theta & 0 & \cos\theta
\end{bmatrix},\quad
R_z(\theta) = \begin{bmatrix}
\cos\theta & -\sin\theta & 0 \\
\sin\theta & \cos\theta & 0 \\
0 & 0 & 1
\end{bmatrix}
$$

记忆方法：旋转轴上对应位置为 $1$，该行/列其余为 $0$；右下角 $2 \times 2$ 子矩阵中，$\cos\theta$ 在对角，$-\sin\theta$
在 $\cos\theta$ 右侧，$\sin\theta$ 在 $\cos\theta$ 下方（第三列右侧循环回第一列，第三行下方循环回第一行）。

验证：$R_z$ 的旋转轴是 $z$，因此 $(3,3)$ 处为 $1$；右下角 $2 \times 2$ 子矩阵 $(1:2, 1:2)$ 中，$\cos$ 在 $(1,1)$
和 $(2,2)$，$-\sin$ 在 $(1,2)$（$\cos$ 右侧），$\sin$ 在 $(2,1)$（$\cos$ 下方）。

### 3.4 旋转算子的指数坐标 {#旋转算子的指数坐标}

设刚体以角速度 $\boldsymbol{\omega}$（方向为转轴，大小为角速率）绕固定轴匀速转动，其上一点 $\boldsymbol{p}$ 的速度：

$$
\dot{\boldsymbol{p}}(t) = \boldsymbol{\omega} \times \boldsymbol{p}(t) = [\boldsymbol{\omega}]\,\boldsymbol{p}(t)
$$

该一阶线性微分方程的解为 $\boldsymbol{p}(t) = e^{[\boldsymbol{\omega}] t}\,\boldsymbol{p}(0)$
。指数中的 $[\boldsymbol{\omega}]t$ 是 $3 \times 3$ 反对称矩阵与时间标量的乘积。

将 $\boldsymbol{\omega}$ 单位化——记单位转轴 $\hat{\boldsymbol{\omega}} = \boldsymbol{\omega} / \|\boldsymbol{\omega}\|$
，转过的总角度 $\theta = \|\boldsymbol{\omega}\| t$。则 $\boldsymbol{\omega} t = \hat{\boldsymbol{\omega}} \theta$，代入得：

$$
\boldsymbol{p}(\theta) = e^{[\hat{\boldsymbol{\omega}}] \theta}\,\boldsymbol{p}(0)
$$

矩阵指数 $e^{[\hat{\boldsymbol{\omega}}] \theta}$ 就是旋转矩阵 $R_{\hat{\boldsymbol{\omega}}}(\theta)$，即旋转算子的指数坐标形式。

## 4. 齐次矩阵 {#齐次矩阵}

### 4.1 定义 {#定义}

为将旋转与平移纳入统一的矩阵运算框架，引入齐次坐标：点的齐次坐标在三维坐标后附加 $1$，向量的齐次坐标附加 $0$（向量只旋转不平移）。

齐次变换矩阵 $T \in SE(3)$ 同时包含旋转与平移：

$$
T = \begin{bmatrix}
R & \boldsymbol{p} \\
\boldsymbol{0} & 1
\end{bmatrix} \in \mathbb{R}^{4 \times 4}
$$

其中 $R \in SO(3)$ 为姿态，$\boldsymbol{p}$ 为 $\{B\}$ 原点在 $\{A\}$ 中的位置向量。$T$ 将 $\{B\}$
下的齐次坐标映射到 $\{A\}$ 下：

$$
\begin{bmatrix} {}^A\boldsymbol{p} \\ 1 \end{bmatrix} =
\begin{bmatrix} {}^A_B R & {}^A\boldsymbol{p}_{B\text{ORG}} \\ \boldsymbol{0} & 1 \end{bmatrix}
\begin{bmatrix} {}^B\boldsymbol{p} \\ 1 \end{bmatrix}
$$

齐次变换矩阵的平移算子与旋转算子（均在固定坐标系下以**左乘**作用）：

| 算子                                                           | 形式                                                                                                               |
|--------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
| 平移算子 $\operatorname{Trans}(d_x, d_y, d_z)$                   | $T = \begin{bmatrix} I_{3\times3} & [d_x, d_y, d_z]^{\mathrm{T}} \\ \boldsymbol{0} & 1 \end{bmatrix}$            |
| 旋转算子 $\operatorname{Rot}(\hat{\boldsymbol{\omega}}, \theta)$ | $T = \begin{bmatrix} R_{\hat{\boldsymbol{\omega}}}(\theta) & \boldsymbol{0} \\ \boldsymbol{0} & 1 \end{bmatrix}$ |

一次完整的齐次变换等价于以定系为参照，先旋转再平移（左乘顺序）：

$$
T = \operatorname{Trans}(d_x, d_y, d_z)\,\operatorname{Rot}(\hat{\boldsymbol{\omega}}, \theta)
$$

### 4.2 复合规则 {#复合规则}

与旋转矩阵一致：相对固定坐标系的变换左乘，相对动坐标系的变换右乘。

| 参照系             | 规则 | 公式                       |
|-----------------|----|--------------------------|
| 相对固定坐标系 $\{A\}$ | 左乘 | $T = T_n \cdots T_2 T_1$ |
| 相对动坐标系 $\{B\}$  | 右乘 | $T = T_1 T_2 \cdots T_n$ |

齐次变换矩阵的逆：

$$
T^{-1} = \begin{bmatrix}
R^{\mathrm{T}} & -R^{\mathrm{T}}\boldsymbol{p} \\
\boldsymbol{0} & 1
\end{bmatrix}
$$

多个坐标系的变换具有递推特性：${}^A_C T = {}^A_B T \; {}^B_C T$，由此可建立含多个坐标系的连续变换链。

## 5. 欧拉角 {#欧拉角}

欧拉角（`Euler angle`）通过三次绕坐标轴的连续旋转描述姿态。连续两次旋转的转轴不平行，共有 $3 \times 2 \times 2 = 12$
种组合。按旋转参照系分为两类：

1. **动轴欧拉角**（相对动坐标系，右乘）
2. **定轴欧拉角**（相对固定坐标系，左乘）


### 5.1 动轴欧拉角 {#动轴欧拉角}

动轴欧拉角每次绕动坐标系的当前轴旋转，遵循**右乘**原则。

**Z-Y-X 欧拉角**：初始时 $\{B\}$ 与 $\{A\}$ 重合，依次绕 $z_B$ 转 $\phi$、新的 $y_B$ 转 $\theta$、新的 $x_B$ 转 $\psi$：

$$
{}^A_B R_{\text{ZYX}} = R_z(\phi) R_y(\theta) R_x(\psi)
$$

**Z-Y-Z 欧拉角**（$\phi$ 进动角、$\theta$ 章动角、$\psi$ 自旋角）：

$$
{}^A_B R_{\text{ZYZ}} = R_z(\phi) R_y(\theta) R_z(\psi)
$$

Z-Y-Z 和 Z-X-Z 组合在工业机器人末端姿态中最常用——与腕部三个垂直正交旋转关节的转角直接对应。

### 5.2 定轴欧拉角（R-P-Y 角） {#定轴欧拉角}

R-P-Y（`Roll-Pitch-Yaw`，横滚-俯仰-偏航）角实质上是一种定轴欧拉角——绕固定坐标系各轴依次旋转，遵循**左乘**
原则。该命名源于船舶姿态：以船行进方向为 $z$ 轴（翻滚），垂直甲板的法线为 $x$ 轴（偏航），$y$ 轴由右手定则确定。

初始时 $\{B\}$ 与 $\{A\}$ 重合，依次绕 $x_A$ 转 $\psi$、$y_A$ 转 $\theta$、$z_A$ 转 $\phi$（X-Y-Z 固定角）：

$$
{}^A_B R_{\text{XYZ}}(\psi, \theta, \phi) = R_z(\phi) R_y(\theta) R_x(\psi)
$$

该展开式与 Z-Y-X 欧拉角完全相同——三次绕定轴左乘的结果等于以相反顺序三次绕动轴右乘的结果。

当三个姿态角变化很小时（$\cos\delta \approx 1$，$\sin\delta \approx \delta$），结果与转动顺序无关：

$$
R \approx \begin{bmatrix}
1 & -\phi & \theta \\
\phi & 1 & -\psi \\
-\theta & \psi & 1
\end{bmatrix}
$$

### 5.3 奇异性 {#欧拉角奇异性}

无论是动轴欧拉角还是定轴欧拉角，奇异的本质相同：当第一次与第三次旋转轴共线时，自由度数退化。

| 类型            | 奇异条件                           | 后果                       |
|---------------|--------------------------------|--------------------------|
| Z-Y-X / R-P-Y | 第二次转角 $\theta = \pm \pi/2$     | 仅能求 $\phi$ 与 $\psi$ 的和或差 |
| Z-Y-Z         | 第二次转角 $\theta = k\pi\;(k=0,1)$ | 仅能求 $\phi$ 与 $\psi$ 的和或差 |

处于奇异位形时，第一与第三旋转轴重合，失去一个转动自由度。工程上在奇异时一般取 $\phi = 0^\circ$。万向节死锁（`Gimbal Lock`）就是
R-P-Y 角在俯仰角 $\theta = 90^\circ$ 时的典型奇异。

## 6. 等效轴-角 {#等效轴角}

**欧拉定理**：任一旋转矩阵 $R$
总可等效为绕某一固定单位轴 $\hat{\boldsymbol{\omega}} = (\omega_x, \omega_y, \omega_z)^{\mathrm{T}}$ 旋转角度 $\theta$
。等效轴-角（`angle-axis`）用三个参数描述姿态，特别适用于指向机构的姿态描述和轨迹规划。

### 6.1 Rodrigues 公式 {#rodrigues公式}

刚体以单位角速度绕 $\hat{\boldsymbol{\omega}}$ 旋转。由反对称矩阵 $[\hat{\boldsymbol{\omega}}]$
的性质（$[\hat{\boldsymbol{\omega}}]^2 = \hat{\boldsymbol{\omega}}\hat{\boldsymbol{\omega}}^{\mathrm{T}} - I$，$[\hat{\boldsymbol{\omega}}]^3 = -[\hat{\boldsymbol{\omega}}]$
），矩阵指数的 Taylor 级数可闭合为 **Rodrigues 公式**：

$$
R_{\hat{\boldsymbol{\omega}}}(\theta) = e^{[\hat{\boldsymbol{\omega}}]\theta} = I + [\hat{\boldsymbol{\omega}}]\sin\theta + [\hat{\boldsymbol{\omega}}]^2(1 - \cos\theta)
$$

展开为矩阵形式：

$$
R_{\hat{\boldsymbol{\omega}}}(\theta) =
\begin{bmatrix}
\omega_x^2(1 - \cos\theta) + \cos\theta & \omega_x\omega_y(1 - \cos\theta) - \omega_z\sin\theta & \omega_x\omega_z(1 - \cos\theta) + \omega_y\sin\theta \\
\omega_x\omega_y(1 - \cos\theta) + \omega_z\sin\theta & \omega_y^2(1 - \cos\theta) + \cos\theta & \omega_y\omega_z(1 - \cos\theta) - \omega_x\sin\theta \\
\omega_x\omega_z(1 - \cos\theta) - \omega_y\sin\theta & \omega_y\omega_z(1 - \cos\theta) + \omega_x\sin\theta & \omega_z^2(1 - \cos\theta) + \cos\theta
\end{bmatrix}
$$

当 $\hat{\boldsymbol{\omega}}$ 取坐标轴方向时，上式分别退化为 $R_x(\theta)$、$R_y(\theta)$、$R_z(\theta)$。

### 6.2 由姿态矩阵反求等效轴与转角 {#反求等效轴角}

已知 $R = [r_{ij}]$，由 Rodrigues 公式取迹得 $\operatorname{tr}(R) = r_{11} + r_{22} + r_{33} = 1 + 2\cos\theta$：

| 情况                   | 转角                                                                | 转轴                                                                                                                                     |
|----------------------|-------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| $\theta \neq 0, \pi$ | $\theta = \arccos\left(\frac{\operatorname{tr}(R) - 1}{2}\right)$ | $\hat{\boldsymbol{\omega}} = \frac{1}{2\sin\theta}\begin{bmatrix} r_{32} - r_{23} \\ r_{13} - r_{31} \\ r_{21} - r_{12} \end{bmatrix}$ |
| $\theta = 0$         | $\theta = 0$                                                      | $\hat{\boldsymbol{\omega}}$ 任意（无旋转）                                                                                                    |
| $\theta = \pi$       | $\theta = \pi$                                                    | $\hat{\boldsymbol{\omega}}$ 由 $R + I$ 的任意非零列归一化得到                                                                                      |

> 当 $\theta = \pi$ 时，Rodrigues 公式退化为 $R = I + 2[\hat{\boldsymbol{\omega}}]^2$
。由 $[\hat{\boldsymbol{\omega}}]^2 = \hat{\boldsymbol{\omega}}\hat{\boldsymbol{\omega}}^{\mathrm{T}} - I$
得 $R + I = 2\hat{\boldsymbol{\omega}}\hat{\boldsymbol{\omega}}^{\mathrm{T}}$。右侧为向量 $\hat{\boldsymbol{\omega}}$
的外积（秩为 1 的对称矩阵），因此 $R + I$ 的任意非零列向量均与 $\hat{\boldsymbol{\omega}}$ 共线，归一化即得转轴方向。

等效轴-角也存在奇异：当 $\sin\theta = 0$（$\theta = 0$ 或 $\pi$）时，无法用标准公式唯一确定 $\hat{\boldsymbol{\omega}}$。

## 7. 单位四元数 {#单位四元数}

欧拉角和等效轴-角均存在奇异问题；旋转矩阵无奇异但参数冗余。单位四元数（`unit quaternion`）既无奇异性，参数也紧凑（4 个参数 + 1
个约束）。

### 7.1 定义与运算法则 {#四元数定义与运算}

四元数由哈密尔顿（`Hamilton`）于 1843 年提出，形式为一个实数与一个三维向量的组合：

$$
q = q_0 + \boldsymbol{q} = q_0 + q_1 i + q_2 j + q_3 k
$$

算子 $i, j, k$ 满足 $i^2 = j^2 = k^2 = ijk = -1$，$ij = k = -ji$，$jk = i = -kj$，$ki = j = -ik$。

令 $p = (p_0, \boldsymbol{p})$，$q = (q_0, \boldsymbol{q})$，基本运算法则：

| 运算 | 定义              | 公式                                                                                                                                    |
|----|-----------------|---------------------------------------------------------------------------------------------------------------------------------------|
| 加法 | 分量相加            | $p + q = (p_0 + q_0,\ \boldsymbol{p} + \boldsymbol{q})$                                                                               |
| 乘法 | $\mathbb{H}$ 乘法 | $pq = (p_0 q_0 - \boldsymbol{p} \cdot \boldsymbol{q},\ p_0\boldsymbol{q} + q_0\boldsymbol{p} + \boldsymbol{p} \times \boldsymbol{q})$ |
| 共轭 | 向量部取反           | $q^* = (q_0, -\boldsymbol{q})$                                                                                                        |
| 模  | 欧氏范数            | $\|q\| = \sqrt{q_0^2 + q_1^2 + q_2^2 + q_3^2}$                                                                                        |
| 逆  | 共轭除以模方          | $q^{-1} = q^* / \|q\|^2$                                                                                                              |

模为 $1$ 的四元数称为**单位四元数**，此时 $q^{-1} = q^*$。

### 7.2 四元数与姿态表示 {#四元数姿态表示}

设刚体绕单位轴 $\hat{\boldsymbol{\omega}} = (\omega_x, \omega_y, \omega_z)^{\mathrm{T}}$ 旋转 $\theta$ 角，对应的单位四元数为：

$$
\varepsilon = \varepsilon_0 + \varepsilon_1 i + \varepsilon_2 j + \varepsilon_3 k = \cos\frac{\theta}{2} + \hat{\boldsymbol{\omega}} \sin\frac{\theta}{2}
$$

> **推导**：将等效轴-角参数代入单位四元数定义式 $(3.4\text{-}53)$
即得上式。这四个参数 $\varepsilon_0, \varepsilon_1, \varepsilon_2, \varepsilon_3$ 称为**欧拉参数**（`Euler parameters`
），满足 $\varepsilon_0^2 + \varepsilon_1^2 + \varepsilon_2^2 + \varepsilon_3^2 = 1$。

**旋转矩阵 → 四元数**：

$$
\varepsilon_0 = \frac{1}{2}\sqrt{1 + r_{11} + r_{22} + r_{33}},\quad
\varepsilon_1 = \frac{r_{32} - r_{23}}{4\varepsilon_0},\quad
\varepsilon_2 = \frac{r_{13} - r_{31}}{4\varepsilon_0},\quad
\varepsilon_3 = \frac{r_{21} - r_{12}}{4\varepsilon_0}
$$

分母 $\varepsilon_0$ 永不为零（$r_{11}+r_{22}+r_{33} \geq -1$，平方根内 $\geq 0$），该转换不存在奇异。

**四元数 → 等效轴-角**：

$$
\theta = 2\arccos\varepsilon_0,\quad
\hat{\boldsymbol{\omega}} = \frac{(\varepsilon_1, \varepsilon_2, \varepsilon_3)^{\mathrm{T}}}{\sin(\theta/2)}
$$

**向量旋转**：四元数相乘，$\boldsymbol{p}' = \varepsilon \boldsymbol{p} \varepsilon^*$（$\boldsymbol{p}$
视为纯四元数 $(0, \boldsymbol{p})$）。

连续旋转用四元数乘法复合：$(\varepsilon_2 \varepsilon_1) \boldsymbol{p} (\varepsilon_2 \varepsilon_1)^*$。两个四元数乘法涉及
16 次乘法 + 12 次加法，相较两个旋转矩阵乘法的 27 次乘法 + 18 次加法，计算效率更高。

## 8. 相互关系 {#相互关系}

四种姿态描述方法的对比：

| 项目   | 旋转矩阵         | 三姿态角（欧拉/R-P-Y） | 等效轴-角                | 单位四元数           |
|------|--------------|----------------|----------------------|-----------------|
| 参数数  | 9（仅 3 独立）    | 3              | 3（等效轴方向 + 转角）        | 4（1 约束）         |
| 奇异性  | 无            | 有              | 有（$\theta = 0, \pi$） | 无               |
| 姿态复合 | ✔（矩阵乘法）      | ✗（需转为矩阵）       | ✗（需转为矩阵或四元数）         | ✔（四元数乘法，更快）     |
| 连续插值 | ✔（可能插值到奇异姿态） | ✔（可能插值到奇异姿态）   | ✔                    | ✔（可直接球面线性插值）    |
| 几何意义 | 两坐标系各轴间的投影关系 | 绕坐标轴依次旋转三次的角度  | 绕空间任意轴旋转的角度          | 四维超球面 $S^3$ 上的点 |

> **连续插值**：在两姿态之间平滑过渡。旋转矩阵和欧拉角均可逐元素/逐角插值，但中间值可能恰好落入奇异位形（如欧拉角的万向节死锁）。单位四元数通过球面线性插值（
`Slerp`，`Spherical Linear Interpolation`）在四维超球面 $S^3$ 上沿大圆弧插值，天然避开奇异，是动画和轨迹规划中的首选方案。

各描述方法之间的转换关系（行→列的转换方法）：

| 来源\目标 | 旋转矩阵                                                                                                       | 三姿态角           | 等效轴-角                                                                                                                                                                         | 单位四元数                                                                                                      |
|-------|------------------------------------------------------------------------------------------------------------|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| 旋转矩阵  | —                                                                                                          | 逆解公式（复杂，不实用）   | $\theta = \arccos\frac{\operatorname{tr}(R)-1}{2}$，$\hat{\boldsymbol{\omega}} = \frac{1}{2\sin\theta}\begin{bmatrix}r_{32}-r_{23}\\r_{13}-r_{31}\\r_{21}-r_{12}\end{bmatrix}$ | $\varepsilon_0 = \frac{1}{2}\sqrt{1+\operatorname{tr}(R)}$，$\varepsilon_i = \frac{\cdots}{4\varepsilon_0}$ |
| 三姿态角  | 三次旋转算子依次相乘（动轴右乘/定轴左乘）                                                                                      | —              | 先转为旋转矩阵，再反求等效轴-角                                                                                                                                                              | 先转为旋转矩阵，再求四元数；或先转为等效轴-角再转四元数                                                                               |
| 等效轴-角 | Rodrigues 公式 $R = I + [\hat{\boldsymbol{\omega}}]\sin\theta + [\hat{\boldsymbol{\omega}}]^2(1-\cos\theta)$ | 先转为旋转矩阵，再反解欧拉角 | —                                                                                                                                                                             | $\varepsilon = \cos\frac{\theta}{2} + \hat{\boldsymbol{\omega}}\sin\frac{\theta}{2}$                       |
| 单位四元数 | $R_{\varepsilon}$ 展开式                                                                                      | 先转为旋转矩阵，再反解欧拉角 | $\theta = 2\arccos\varepsilon_0$，$\hat{\boldsymbol{\omega}} = \frac{(\varepsilon_1,\varepsilon_2,\varepsilon_3)^{\mathrm{T}}}{\sin(\theta/2)}$                                | —                                                                                                          |

注：三姿态角指动轴欧拉角与定轴欧拉角（含 R-P-Y 角）；"不实用"指需要分情况讨论奇异且表达式冗长。

## 小结 {#小结}

本文从位形空间出发，建立了刚体姿态的四种数学描述及其相互转换关系：

| 主题    | 核心内容与应用                                                                                |
|-------|----------------------------------------------------------------------------------------|
| 基本概念  | 位形空间的拓扑结构决定了参数化方式（显式/隐式）；自由矢量只旋转、线矢量旋转且受平移影响——是旋量坐标变换规则的前置基础                           |
| 旋转矩阵  | 方向余弦矩阵（9 元素/3 独立），正交性 $\det(R)=1$；核心应用分两类——坐标系变换（同一点跨系映射，左乘）与运动描述（同系内旋转）               |
| 齐次矩阵  | 将旋转与平移统一为 $4 \times 4$ 矩阵，一次齐次变换 = 先旋转再平移（定系左乘）；多次变换可递推建立连续变换链                         |
| 欧拉角   | 动轴（右乘）与定轴/R-P-Y（左乘）；12 种组合，Z-Y-X 与 Z-Y-Z 最常用；适用于需要直观角度输入的场景（如机器人关节角指定）；奇异条件为第一次与第三次轴共线 |
| 等效轴-角 | Rodrigues 公式给出了绕过原点的任意轴旋转的矩阵表达；适用于指向机构、单轴旋转的轨迹规划                                       |
| 单位四元数 | 4 参数 + 1 约束，无奇异；乘法效率高于旋转矩阵；可通过 `Slerp` 在 $S^3$ 上沿大圆弧无奇异地连续插值，是动画与轨迹插值的首选               |

姿态描述方法的选取取决于场景：需要矩阵运算选旋转矩阵，需要直观角度选欧拉角，需要单轴旋转选等效轴-角，需要无奇异高效插值选单位四元数。
