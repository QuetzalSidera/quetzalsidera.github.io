---
title: 1.1 - 机构学的通用数学基础
date: 2026-05-15T00:00:00
tags: [ 机器人, 机构学, 数学基础 ]
pinned: false
collection: 机器人机构学
outline:
  - title: 1. 向量
    slug: 向量
  - title: 1.1 点的坐标表示
    slug: 点的坐标表示
    level: 1
  - title: 1.2 加法与数乘
    slug: 加法与数乘
    level: 1
  - title: 1.3 点积
    slug: 点积
    level: 1
  - title: 1.4 叉积
    slug: 叉积
    level: 1
  - title: 2. 矩阵
    slug: 矩阵
  - title: 2.1 矩阵类型
    slug: 矩阵类型
    level: 1
  - title: 2.2 矩阵运算
    slug: 矩阵运算
    level: 1
  - title: 2.3 线性空间
    slug: 线性空间
    level: 1
  - title: 2.4 雅可比
    slug: 雅可比
    level: 1
head:
  - - meta
    - name: description
      content: 机器人机构学系列第一篇，介绍机构学分析的数学基础——三维向量运算、矩阵与线性空间。
  - - meta
    - name: keywords
      content: 机器人机构学, 数学基础, 向量运算, 点积, 叉积, 矩阵, 线性空间, 雅可比, 线几何, $Plücker$坐标, 格拉斯曼线几何, 旋量, 旋量系
---

点、直线、平面是几何学中最基本的元素。如何表征它们，进而描述其运动，是不同几何理论研究的基础。

---


本章为全书后续各章提供数学基础——从三维向量与矩阵出发，经线几何过渡到旋量与旋量系。

## 1. 向量<a id=向量></a>

### 1.1 点的坐标表示<a id=点的坐标表示></a>

空间直角坐标系中，点 $P$ 的位置用坐标原点指向该点的向量 $\boldsymbol{P}$ 表示：

$$
\boldsymbol{P} = P_x \boldsymbol{i} + P_y \boldsymbol{j} + P_z \boldsymbol{k}
$$

其中 $\boldsymbol{i}$、$\boldsymbol{j}$、$\boldsymbol{k}$ 分别为平行于 $x$、$y$、$z$ 轴的单位向量；$P_x$、$P_y$、$P_z$
为向量在各轴方向的投影。

写成列向量形式：

$$
\boldsymbol{P} = \begin{bmatrix} P_x \\ P_y \\ P_z \end{bmatrix}
$$

### 1.2 加法与数乘<a id=加法与数乘></a>

向量是既有大小又有方向的量。$n$ 维向量是 $n$ 个有序数组成的数组，写成一行称**行向量**
$\boldsymbol{a}^{\mathrm{T}} = (a_1, a_2, \ldots, a_n)$，写成一列称**列向量**。

两三维向量 $\boldsymbol{u} = u_x \boldsymbol{i} + u_y \boldsymbol{j} + u_z \boldsymbol{k}$
和 $\boldsymbol{v} = v_x \boldsymbol{i} + v_y \boldsymbol{j} + v_z \boldsymbol{k}$ 的加减法：

$$
\boldsymbol{u} \pm \boldsymbol{v} = (u_x \pm v_x)\boldsymbol{i} + (u_y \pm v_y)\boldsymbol{j} + (u_z \pm v_z)\boldsymbol{k}
$$

加减法满足封闭性，遵循平行四边形或三角形法则。

### 1.3 点积<a id=点积></a>

向量的点积（内积）：$\boldsymbol{u} \cdot \boldsymbol{v} = u_x v_x + u_y v_y + u_z v_z$，满足交换律。

几何意义：$\boldsymbol{u} \cdot \boldsymbol{v} = \|\boldsymbol{u}\| \|\boldsymbol{v}\| \cos\theta$
，其中 $\|\boldsymbol{u}\| = \sqrt{u_x^2+u_y^2+u_z^2}$ 为向量的范数（模）。

| 特例                                         | 表达式                                                                   | 意义                           |
|--------------------------------------------|-----------------------------------------------------------------------|------------------------------|
| $\boldsymbol{v}$ 为单位向量（如 $\boldsymbol{i}$） | $\boldsymbol{u} \cdot \boldsymbol{i} = \|\boldsymbol{u}\| \cos\theta$ | $\boldsymbol{u}$ 在 $x$ 轴上的投影 |
| 两者均为单位向量                                   | $\boldsymbol{i} \cdot \boldsymbol{j} = \cos 90^\circ = 0$             | 方向余弦，正交时点积为零                 |

### 1.4 叉积<a id=叉积></a>

两向量的叉积生成一个新向量，垂直于两向量张成的平面，方向符合右手定则：

$$
\boldsymbol{u} \times \boldsymbol{v} =
\begin{vmatrix}
\boldsymbol{i} & \boldsymbol{j} & \boldsymbol{k} \\
u_x & u_y & u_z \\
v_x & v_y & v_z
\end{vmatrix}
= (u_y v_z - u_z v_y)\boldsymbol{i} + (u_z v_x - u_x v_z)\boldsymbol{j} + (u_x v_y - u_y v_x)\boldsymbol{k}
$$

几何意义：$\|\boldsymbol{u} \times \boldsymbol{v}\| = \|\boldsymbol{u}\| \|\boldsymbol{v}\| \sin\theta$，等于两向量围成的平行四边形面积。

叉积可借助反对称矩阵 $[\boldsymbol{u}]$ 表达为矩阵乘法：

$$
[\boldsymbol{u}] =
\begin{bmatrix}
0 & -u_z & u_y \\
u_z & 0 & -u_x \\
-u_y & u_x & 0
\end{bmatrix},
\quad \boldsymbol{u} \times \boldsymbol{v} = [\boldsymbol{u}]\boldsymbol{v}
$$

运动学中的关键关系：角速度矢量与位置矢量叉积生成线速度矢量——$\boldsymbol{v} = \boldsymbol{\omega} \times \boldsymbol{r}$。

运算律总结：

| 运算 | 交换律                                                                            | 结合律 | 分配律 |
|----|--------------------------------------------------------------------------------|-----|-----|
| 点积 | $\boldsymbol{u} \cdot \boldsymbol{v} = \boldsymbol{v} \cdot \boldsymbol{u}$    | —   | ✓   |
| 叉积 | $\boldsymbol{u} \times \boldsymbol{v} = -\boldsymbol{v} \times \boldsymbol{u}$ | ✗   | ✓   |

常用叉积公式：

| 公式                                                                                                                                                                         | 说明         |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------|
| $\boldsymbol{u} \times \boldsymbol{u} = \boldsymbol{0}$                                                                                                                    | 自叉为零       |
| $\boldsymbol{u} \times (\boldsymbol{v} \times \boldsymbol{w}) = (\boldsymbol{u} \cdot \boldsymbol{w})\boldsymbol{v} - (\boldsymbol{u} \cdot \boldsymbol{v})\boldsymbol{w}$ | 三重叉积（左展开）  |
| $(\boldsymbol{u} \times \boldsymbol{v}) \times \boldsymbol{w} = (\boldsymbol{u} \cdot \boldsymbol{w})\boldsymbol{v} - (\boldsymbol{v} \cdot \boldsymbol{w})\boldsymbol{u}$ | 三重叉积（右展开）  |
| $\|\boldsymbol{u} \times \boldsymbol{v}\|^2 = \|\boldsymbol{u}\|^2\|\boldsymbol{v}\|^2 - (\boldsymbol{u} \cdot \boldsymbol{v})^2$                                          | 拉格朗日恒等式    |
| $[\boldsymbol{u}]^{\mathrm{T}} = -[\boldsymbol{u}]$                                                                                                                        | 反对称矩阵的反对称性 |
| $[\boldsymbol{u}]\boldsymbol{v} = -[\boldsymbol{v}]\boldsymbol{u}$                                                                                                         | 交换反号       |

> **拉格朗日恒等式**：由 $\|\boldsymbol{u} \times \boldsymbol{v}\| = \|\boldsymbol{u}\|\|\boldsymbol{v}\|\sin\theta$
> 平方，代入 $\sin^2\theta = 1 - \cos^2\theta$
> ，结合 $\boldsymbol{u} \cdot \boldsymbol{v} = \|\boldsymbol{u}\|\|\boldsymbol{v}\|\cos\theta$ 即得。
>
> **三重叉积（左展开）**：取分量验证。$x$
> 分量：
> $[\boldsymbol{u} \times (\boldsymbol{v} \times \boldsymbol{w})]_x = u_y(v_x w_y - v_y w_x) - u_z(v_z w_x - v_x w_z)$
> ，整理为
> $v_x(u_x w_x+u_y w_y+u_z w_z) - w_x(u_x v_x+u_y v_y+u_z v_z) = v_x(\boldsymbol{u} \cdot \boldsymbol{w}) - w_x(\boldsymbol{u} \cdot \boldsymbol{v})$
> 。其余分量同理。右展开可通过将左展开中 $\boldsymbol{u}$ 与 $\boldsymbol{w}$ 交换并取反号得到。

混合积：$\boldsymbol{u} \cdot (\boldsymbol{v} \times \boldsymbol{w}) = \boldsymbol{v} \cdot (\boldsymbol{w} \times \boldsymbol{u}) = \boldsymbol{w} \cdot (\boldsymbol{u} \times \boldsymbol{v}) = \det(\boldsymbol{u}, \boldsymbol{v}, \boldsymbol{w})$

## 2. 矩阵<a id=矩阵></a>

### 2.1 矩阵类型<a id=矩阵类型></a>

由 $m \times n$ 个数排成的 $m$ 行 $n$ 列数表称为矩阵。矩阵 $A$ 可看作由 $m$ 个 $n$ 维行向量组成，或由 $n$ 个 $m$ 维列向量组成。

| 类型         | 定义                                      | 记法                                                        |
|------------|-----------------------------------------|-----------------------------------------------------------|
| 方阵         | $m = n$                                 | $A_{n \times n}$                                          |
| 对角矩阵       | 仅主对角线存在非零元素                             | $A = \operatorname{diag}(a_{11}, a_{22}, \ldots, a_{nn})$ |
| 零矩阵 / 单位矩阵 | 全为零 / 对角全为 1                            | $O$ / $I$                                                 |
| 对称矩阵       | $A = A^{\mathrm{T}}$                    | -                                                         |
| 反对称矩阵      | $A = -A^{\mathrm{T}}$                   | -                                                         |
| 奇异矩阵       | $\det(A) = 0$                           | -                                                         |
| 正交矩阵       | $AA^{\mathrm{T}} = A^{\mathrm{T}}A = I$ | 列向量均为单位正交向量                                               |
| 正定矩阵       | 实对称且特征值全为正                              | -                                                         |

### 2.2 矩阵运算<a id=矩阵运算></a>

| 运算  | 性质                                                                                                 |
|-----|----------------------------------------------------------------------------------------------------|
| 加法  | 交换律、结合律：$A+B = B+A$，$(A+B)+C = A+(B+C)$                                                            |
| 数乘  | $\lambda(\mu A) = (\lambda\mu)A$；$(\lambda+\mu)A = \lambda A + \mu A$                              |
| 乘法  | 结合律、分配律，**不满足交换律**：$AB \neq BA$                                                                    |
| 转置  | $(AB)^{\mathrm{T}} = B^{\mathrm{T}}A^{\mathrm{T}}$                                                 |
| 行列式 | $\|A^{\mathrm{T}}\| = \|A\|$；$\|\lambda A\| = \lambda^n \|A\|$；$\|AB\| = \|A\|\|B\|$               |
| 逆   | $(AB)^{-1} = B^{-1}A^{-1}$；$(A^{-1})^{\mathrm{T}} = (A^{\mathrm{T}})^{-1}$；$\|A^{-1}\| = 1/ \|A\|$ |

特征值与特征向量：$A\boldsymbol{u} = \lambda \boldsymbol{u}$，则 $\lambda$ 为 $A$ 的特征值，$\boldsymbol{u}$
为对应特征向量。$n$ 阶方阵 $A$ 的特征值满足 $\sum \lambda_i = \operatorname{tr}(A)$，$\prod \lambda_i = \det(A)$。

相似矩阵与相似变换：若存在可逆矩阵 $P$ 使得 $B = PAP^{-1}$，则 $A$ 与 $B$ 的特征值相同。对实对称矩阵，必存在正交矩阵 $P$
使得 $A = P\Lambda P^{\mathrm{T}}$（对角化）。

矩阵指数：$e^A = \sum_{n=0}^{\infty} \frac{A^n}{n!}$。仅当 $AB = BA$ 时才有 $e^A e^B = e^{A+B}$。

### 2.3 线性空间<a id=线性空间></a>

**线性空间**：设 $V$ 为非空集合，$R$
为实数域。若加法和数乘运算封闭且满足八条线性运算法则（交换律、结合律、零元素、负元素、单位元素、数乘结合律、数乘分配律×2），则 $V$
为线性空间。

若 $V$ 中存在 $n$ 个线性无关的元素 $\boldsymbol{a}_1, \ldots, \boldsymbol{a}_n$ 可线性表示 $V$ 中任一元素，则它们构成 $V$
的一组**基**，$n$ 为 $V$ 的维数，$(x_1, \ldots, x_n)^{\mathrm{T}}$ 为对应坐标。

**线性变换**：设 $T$ 为从线性空间 $V$ 到 $U$
的映射，满足 $T(\boldsymbol{a}_1+\boldsymbol{a}_2) = T(\boldsymbol{a}_1)+T(\boldsymbol{a}_2)$
且 $T(\lambda \boldsymbol{a}) = \lambda T(\boldsymbol{a})$，则 $T$ 为线性变换。若 $P$
为正交矩阵，线性变换 $\boldsymbol{y} = P\boldsymbol{x}$ 称**正交变换**——保持向量长度不变。

### 2.4 雅可比<a id=雅可比></a>

设 $x_i = f_i(q_1, q_2, \ldots, q_n)$（$i=1, \ldots, n$
），写成列向量 $\boldsymbol{X} = [f_1(\boldsymbol{q}), \ldots, f_n(\boldsymbol{q})]^{\mathrm{T}}$。对 $\boldsymbol{q}$
求微分(全微分)：

$$
\delta\boldsymbol{X} = \boldsymbol{J}(\boldsymbol{q})\,\delta\boldsymbol{q}
$$

其中 $\boldsymbol{J}$ 为**雅可比矩阵**（`Jacobian`）：

$$
\boldsymbol{J} = \frac{\partial \boldsymbol{X}}{\partial \boldsymbol{q}} =
\begin{bmatrix}
\frac{\partial f_1}{\partial q_1} & \cdots & \frac{\partial f_1}{\partial q_n} \\
\vdots & \ddots & \vdots \\
\frac{\partial f_n}{\partial q_1} & \cdots & \frac{\partial f_n}{\partial q_n}
\end{bmatrix}
$$

两端同时乘以 $\delta\boldsymbol{q}/\delta t$，得到速度映射：

$$
\dot{\boldsymbol{X}} = \boldsymbol{J}(\boldsymbol{q})\,\dot{\boldsymbol{q}}
$$

在机器人学中，若 $\boldsymbol{X}$ 为位置矢量，该式反映关节速度到末端速度的映射。
