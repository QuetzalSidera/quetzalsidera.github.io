---
title: 1.1 - 机构学的数学基础
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
  - title: 3. 线几何
    slug: 线几何
  - title: 3.1 齐次坐标
    slug: 齐次坐标
    level: 1
  - title: 3.2 Plücker 坐标
    slug: plucker坐标
    level: 1

  - title: 4. 旋量
    slug: 旋量
  - title: 4.1 定义与退化
    slug: 定义与退化
    level: 1
  - title: 4.2 基本运算
    slug: 基本运算
    level: 1
  - title: 4.3 旋量系
    slug: 旋量系
    level: 1
  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 机器人机构学系列第一篇，介绍机构学分析的数学基础——三维向量运算、矩阵与线性空间、线几何（$Plücker$ 坐标、格拉斯曼线几何）以及旋量与旋量系的基本概念与运算。
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

## 3. 线几何<a id=线几何></a>

### 3.1 齐次坐标<a id=齐次坐标></a>

在射影几何中，无穷远点视为"理想点"——两条平行直线可看作相交于它们共有的无穷远点；两平行平面可看作相交于其共有的无穷远直线。添加无穷远元素后的三维空间为
**三维射影空间** $P^3$。

在射影空间 $P^3$ 中，点与平面均用**齐次坐标**（`homogeneous coordinate`）表示：

| 元素 | 齐次坐标                                           | 说明                                    |
|----|------------------------------------------------|---------------------------------------|
| 点  | $(P_x, P_y, P_z, 1)$ 或 $(\boldsymbol{P}; P_0)$ | 前三个为位置，末位 $1$ 为比例因子                   |
| 平面 | $(a_x, a_y, a_z, 1)$ 或 $(\boldsymbol{a}; a_0)$ | 前三个为法向量分量, 平面方程为$a_xx+a_yy+a_zz+ 1=0$ |

直线的齐次表示有两种——两点的连线（射线坐标）与两平面的交线（轴线坐标）：

| 构造方式        | Plücker 坐标形式      | 公式                                                                                                                         |
|-------------|-------------------|----------------------------------------------------------------------------------------------------------------------------|
| 两点连线（射线坐标）  | $(L,M,N;\;P,Q,R)$ | $\boldsymbol{l} = \boldsymbol{q} - \boldsymbol{p}$（方向），$\boldsymbol{l}^0 = \boldsymbol{p} \times \boldsymbol{q}$（线矩）       |
| 两平面交线（轴线坐标） | $(P,Q,R;\;L,M,N)$ | $\boldsymbol{l} = \boldsymbol{a} \times \boldsymbol{b}$（方向），$\boldsymbol{l}^0 = a_0\boldsymbol{b} - b_0\boldsymbol{a}$（线矩） |

射线坐标与轴线坐标的区别仅在前三个分量与后三个分量**交换位置**——射线坐标的 $(L,M,N;P,Q,R)$
对应轴线坐标的 $(P,Q,R;L,M,N)$。
[
> 两平面交线推导：设有平面 $\boldsymbol{\pi}_1 = (\boldsymbol{a}; a_0) = (a_x, a_y, a_z, a_0)$
> 和 $\boldsymbol{\pi}_2 = (\boldsymbol{b}; b_0) = (b_x, b_y, b_z, b_0)$。两平面的法向量分别为 $\boldsymbol{a}$
> 和 $\boldsymbol{b}$，交线的方向 $\boldsymbol{l}$ 垂直于两法向量：$\boldsymbol{l} = \boldsymbol{a} \times \boldsymbol{b}$
> 。交线上任一点 $\boldsymbol{r}$ 同时满足两平面方程 $\boldsymbol{a}\cdot\boldsymbol{r} + a_0 = 0$
> 和 $\boldsymbol{b}\cdot\boldsymbol{r} + b_0 = 0$
> ，由此可导出线矩 $\boldsymbol{l}^0 = \boldsymbol{r} \times \boldsymbol{l} = a_0\boldsymbol{b} - b_0\boldsymbol{a}$
> (三重叉积展开)。]()

### 3.2 Plücker 坐标<a id=plucker坐标></a>

空间中一条直线经过两点 $\boldsymbol{p}(p_x, p_y, p_z)$ 和 $\boldsymbol{q}(q_x, q_y, q_z)$
。定义方向矢量 $\boldsymbol{s} = \boldsymbol{q} - \boldsymbol{p}$：

$$
\boldsymbol{s} = (L, M, N)^{\mathrm{T}} =
\begin{bmatrix}
q_x - p_x \\ q_y - p_y \\ q_z - p_z
\end{bmatrix}
$$

令线矩 $\boldsymbol{s}_0 = \boldsymbol{r} \times \boldsymbol{s} = \boldsymbol{p} \times \boldsymbol{s}$（$\boldsymbol{r}$
为直线上任一点的位置矢量），则：

$$
\boldsymbol{s}_0 = (P, Q, R)^{\mathrm{T}} =
\begin{bmatrix}
p_y(q_z-p_z) - p_z(q_y-p_y) \\
p_z(q_x-p_x) - p_x(q_z-p_z) \\
p_x(q_y-p_y) - p_y(q_x-p_x)
\end{bmatrix}
$$

写成矩阵形式：$\boldsymbol{s}_0 = [\boldsymbol{p}]\boldsymbol{s}$，其中 $[\boldsymbol{p}]$ 为反对称矩阵。

由 $\boldsymbol{s} \cdot \boldsymbol{s}_0 = \boldsymbol{s} \cdot (\boldsymbol{r} \times \boldsymbol{s}) = 0$
，得 $LP + MQ + NR = 0$。

定义六维**线矢量**（单位线矢量的 **$Plücker$ 坐标**）：

$$
\hat{\boldsymbol{\$}} = \begin{bmatrix} \hat{\boldsymbol{s}} \\ \hat{\boldsymbol{s}}_0 \end{bmatrix}
= (L, M, N;\; P, Q, R)
$$

其中 $\hat{\boldsymbol{s}}$
为轴向单位矢量（$L^2+M^2+N^2=1$），$\hat{\boldsymbol{s}}_0 = \boldsymbol{r} \times \hat{\boldsymbol{s}}$ 为线矩。六个
$Plücker$ 坐标满足归一化条件 $\hat{\boldsymbol{s}} \cdot \hat{\boldsymbol{s}} = 1$
和正交条件 $\hat{\boldsymbol{s}} \cdot \hat{\boldsymbol{s}}_0 = 0$，因此只有 **4 个独立参数**。

线矢量 $\boldsymbol{\$}$ 可写成单位线矢量与幅值数乘：$\boldsymbol{\$} = \rho \hat{\boldsymbol{\$}}$
，其中 $\rho = \|\boldsymbol{s}\|$。

## 4. 旋量<a id=旋量></a>

### 4.1 定义与退化<a id=定义与退化></a>

Ball 的定义：**旋量是一条具有节距的直线**。单位旋量的 $Plücker$ 坐标形式：

$$
\hat{\boldsymbol{\$}} = (\hat{\boldsymbol{s}};\; \hat{\boldsymbol{s}}^0)
= (\hat{\boldsymbol{s}};\; \boldsymbol{r} \times \hat{\boldsymbol{s}} + h\hat{\boldsymbol{s}})
= (L, M, N;\; P^*, Q^*, R^*)
$$

其中 $h$ 为**节距**（`pitch`），$h = \hat{\boldsymbol{s}} \cdot \hat{\boldsymbol{s}}^0$
。旋量可写成对偶数形式：$\hat{\boldsymbol{\$}} = \hat{\boldsymbol{s}} + \varepsilon \hat{\boldsymbol{s}}^0$（$\hat{\boldsymbol{s}}$
为原部，$\hat{\boldsymbol{s}}^0$ 为对偶部）。

> 对偶数形式中 $\varepsilon$ 是**对偶单位**，类似于虚数单位 $i$, $\varepsilon = 0$, 但 $\varepsilon^2 \neq 0$,
> 表示 $旋转 + \varepsilon \times 平移$, 从而将旋转与平移放进一个代数系统

| 节距           | 退化                                                                                                 | 物理意义      |
|--------------|----------------------------------------------------------------------------------------------------|-----------|
| $h = 0$      | 单位线矢量 $\hat{\boldsymbol{\$}} = (\hat{\boldsymbol{s}}; \boldsymbol{r} \times \hat{\boldsymbol{s}})$ | 纯力或纯转动    |
| $h = \infty$ | 单位偶量 $\hat{\boldsymbol{\$}} = (\boldsymbol{0}; \hat{\boldsymbol{s}})$                              | 纯力偶或纯平动   |
| $h \neq 0$   | -                                                                                                  | 力与力偶的同轴叠加 |

一般旋量为单位旋量与幅值（$p$）的乘积：$\boldsymbol{\$} = p\hat{\boldsymbol{\$}} = (L, M, N; P^*, Q^*, R^*)$。

从任意旋量的 $Plücker$ 坐标反推节距与轴线位置：

$$
h = \frac{\boldsymbol{s} \cdot \boldsymbol{s}^0}{\boldsymbol{s} \cdot \boldsymbol{s}},\qquad
\boldsymbol{r} = \frac{\boldsymbol{s} \times \boldsymbol{s}^0}{\boldsymbol{s} \cdot \boldsymbol{s}}
$$

> **证明**
> ：由
> $\boldsymbol{\$} = p\hat{\boldsymbol{\$}} = (\boldsymbol{s}; \boldsymbol{s}^0) = p(\hat{\boldsymbol{s}}; \boldsymbol{r}\times\hat{\boldsymbol{s}} + h\hat{\boldsymbol{s}})$
> ，有
> $\boldsymbol{s} = p\hat{\boldsymbol{s}}$，$\boldsymbol{s}^0 = p(\boldsymbol{r}\times\hat{\boldsymbol{s}} + h\hat{\boldsymbol{s}})$。
> 则
> $\boldsymbol{s} \cdot \boldsymbol{s} = p^2$。$\boldsymbol{s} \cdot \boldsymbol{s}^0 = p\hat{\boldsymbol{s}} \cdot p(\boldsymbol{r}\times\hat{\boldsymbol{s}} + h\hat{\boldsymbol{s}}) = p^2[\underbrace{\hat{\boldsymbol{s}} \cdot (\boldsymbol{r}\times\hat{\boldsymbol{s}})}_{=0} + h] = p^2 h$
> ，故
> $h = \frac{\boldsymbol{s} \cdot \boldsymbol{s}^0}{\boldsymbol{s} \cdot \boldsymbol{s}}$。
> 又
> $\boldsymbol{s} \times \boldsymbol{s}^0 = p\hat{\boldsymbol{s}} \times p(\boldsymbol{r}\times\hat{\boldsymbol{s}} + h\hat{\boldsymbol{s}}) = p^2[\hat{\boldsymbol{s}} \times (\boldsymbol{r}\times\hat{\boldsymbol{s}})] = p^2[(\hat{\boldsymbol{s}}\cdot\hat{\boldsymbol{s}})\boldsymbol{r} - (\hat{\boldsymbol{s}}\cdot\boldsymbol{r})\hat{\boldsymbol{s}}] = p^2[\boldsymbol{r} - (\hat{\boldsymbol{s}}\cdot\boldsymbol{r})\hat{\boldsymbol{s}}]$，
> 除以 $\boldsymbol{s} \cdot \boldsymbol{s} = p^2$
> 得 $\boldsymbol{r}_\perp = \boldsymbol{r} - (\hat{\boldsymbol{s}}\cdot\boldsymbol{r})\hat{\boldsymbol{s}}$
> ，即 $\boldsymbol{r}$ 垂直于轴线方向的分量。
>
> 轴线位置 $\boldsymbol{r}$ 可任意选取轴线上一点，只要 $\boldsymbol{r} \times \hat{\boldsymbol{s}}$
> 不变即可（$\boldsymbol{r}$ 沿 $\hat{\boldsymbol{s}}$ 方向平移不改变线矩）。该公式给出的是 $|\boldsymbol{r}|$
> 最小的那个——即原点向轴线作垂线的垂足，它唯一确定了轴线在空间中的位置。

### 4.2 基本运算<a id=基本运算></a>

**加法**
：两旋量的代数和满足交换律和结合律——$\boldsymbol{\$}_{12} = \boldsymbol{\$}_1 + \boldsymbol{\$}_2 = (\boldsymbol{s}_1+\boldsymbol{s}_2) + \varepsilon(\boldsymbol{s}_1^0+\boldsymbol{s}_2^0)$。

**互易积**（`reciprocal product`）：将两旋量的原部与对偶部交换后作点积之和：

$$
\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 = \boldsymbol{s}_1 \cdot \boldsymbol{s}_2^0 + \boldsymbol{s}_2 \cdot \boldsymbol{s}_1^0
$$

引入算子 $\boldsymbol{\Delta} = \begin{bmatrix} \boldsymbol{0} & \boldsymbol{I}_{3 \times 3} \\ \boldsymbol{I}_{3 \times 3} & \boldsymbol{0} \end{bmatrix}$
，互易积可写作 $\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 = \boldsymbol{\$}_1^{\mathrm{T}} \boldsymbol{\Delta} \boldsymbol{\$}_2$。

旋量 $\boldsymbol{\$}_1 = p_1\hat{\boldsymbol{\$}}_1$ 与 $\boldsymbol{\$}_2 = p_2\hat{\boldsymbol{\$}}_2$ 的互易积展开：

$$
\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 =
p_1 p_2\big[(h_1+h_2)\cos\alpha_{12} - a_{12}\sin\alpha_{12}\big]
$$
其中 $a_{12}$ 为两轴线的公垂线距离，$\alpha_{12}$ 为两轴线的夹角。

> **证明**：设两轴线夹角为 $\alpha_{12}$，公垂线距离为 $a_{12}$。为方便计算，将 $\hat{\boldsymbol{s}}_1$ 沿 $z$
> 轴放置，公垂线沿 $x$ 轴，并取公垂线方向与 $\hat{\boldsymbol{s}}_1 \times \hat{\boldsymbol{s}}_2$ 一致：
> $\hat{\boldsymbol{s}}_1=(0,0,1)$，$\boldsymbol{r}_1=(0,0,0)$，$\hat{\boldsymbol{s}}_2=(0, -\sin\alpha_{12}, \cos\alpha_{12})$，$\boldsymbol{r}_2=(a_{12}, 0, 0)$。
> （公垂线方向 $\boldsymbol{r}_2 - \boldsymbol{r}_1 = (a_{12}, 0, 0)$
> 平行于 $\hat{\boldsymbol{s}}_1 \times \hat{\boldsymbol{s}}_2 = (\sin\alpha_{12}, 0, 0)$。）
>
> 代入互易积定义：
> $$
> \begin{aligned}
> \boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 &= \hat{\boldsymbol{s}}_1 \cdot (\boldsymbol{r}_2\times\hat{\boldsymbol{s}}_2 + h_2\hat{\boldsymbol{s}}_2) + \hat{\boldsymbol{s}}_2 \cdot (\boldsymbol{r}_1\times\hat{\boldsymbol{s}}_1 + h_1\hat{\boldsymbol{s}}_1) \\
> &= \hat{\boldsymbol{s}}_1\cdot(\boldsymbol{r}_2\times\hat{\boldsymbol{s}}_2) + (h_1+h_2)\underbrace{(\hat{\boldsymbol{s}}_1\cdot\hat{\boldsymbol{s}}_2)}_{\cos\alpha_{12}} + \underbrace{\hat{\boldsymbol{s}}_2\cdot(\boldsymbol{r}_1\times\hat{\boldsymbol{s}}_1)}_{=0}
> \end{aligned}
> $$
> 计算 $\hat{\boldsymbol{s}}_1\cdot(\boldsymbol{r}_2\times\hat{\boldsymbol{s}}_2)$：
> $$
> \begin{aligned}
> \boldsymbol{r}_2 \times \hat{\boldsymbol{s}}_2 &= (a_{12}, 0, 0) \times (0, -\sin\alpha_{12}, \cos\alpha_{12}) \\
> &= (0,\; -a_{12}\cos\alpha_{12},\; -a_{12}\sin\alpha_{12})
> \end{aligned}
> $$
> $$
> \hat{\boldsymbol{s}}_1 \cdot (\boldsymbol{r}_2 \times \hat{\boldsymbol{s}}_2) = (0,0,1) \cdot (0,\; -a_{12}\cos\alpha_{12},\; -a_{12}\sin\alpha_{12}) = -a_{12}\sin\alpha_{12}
> $$
>
> 因此 $\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 = (h_1+h_2)\cos\alpha_{12} - a_{12}\sin\alpha_{12}$，乘以幅值 $p_1 p_2$
> 即得原式。


互易积与坐标系选取无关。若两旋量的互易积为零（$\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 = 0$），则称它们互为**反旋量**
（互易旋量）。

### 4.3 旋量系<a id=旋量系></a>

$m$ 个单位旋量的集合 $S = \{\hat{\boldsymbol{\$}}_1, \hat{\boldsymbol{\$}}_2, \ldots, \hat{\boldsymbol{\$}}_m\}$。若 $S$
中存在 $n$ 个线性无关的旋量构成一组基，且其他旋量均为这 $n$ 个旋量的线性组合，则这些旋量组成**旋量系**（`screw system`），$n$
为旋量系的**阶数**（$n = \operatorname{rank}(S)$）。

判断线性相关性：将旋量的 $Plücker$ 坐标排成 $m \times 6$ 矩阵，求秩：

$$
S = \begin{bmatrix}
L_1 & M_1 & N_1 & P_1 & Q_1 & R_1 \\
\vdots & \vdots & \vdots & \vdots & \vdots & \vdots \\
L_m & M_m & N_m & P_m & Q_m & R_m
\end{bmatrix}
$$

三维空间中线性无关的旋量数最多为 6（对应刚体运动的 6 个自由度）。旋量系按阶数分为 1~6 阶。

六阶旋量系的标准基（六个线性无关的单位线矢量）：

$$
\begin{aligned}
\hat{\boldsymbol{\$}}_1 &= (1,0,0;\;0,0,0) & \hat{\boldsymbol{\$}}_4 &= (0,0,0;\;1,0,0) \\
\hat{\boldsymbol{\$}}_2 &= (0,1,0;\;0,0,0) & \hat{\boldsymbol{\$}}_5 &= (0,0,0;\;0,1,0) \\
\hat{\boldsymbol{\$}}_3 &= (0,0,1;\;0,0,0) & \hat{\boldsymbol{\$}}_6 &= (0,0,0;\;0,0,1)
\end{aligned}
$$

前三为沿坐标轴的纯转动（线矢量，$h=0$），后三为沿坐标轴的纯平动（偶量，$h=\infty$）。

格拉斯曼线几何中的各类线簇实质上都是由线性无关的线矢量所组成的低阶旋量系。

## 小结<a id=小结></a>

旋量、线矢量与偶量的关系是本章的核心结论：

| 对象  | $h$      | Plücker 坐标                                                                                                        | 物理意义       |
|-----|----------|-------------------------------------------------------------------------------------------------------------------|------------|
| 旋量  | 任意       | $(\boldsymbol{s};\; \boldsymbol{s}^0) = (\boldsymbol{s};\; \boldsymbol{r}\times\boldsymbol{s} + h\boldsymbol{s})$ | 转动与平动的同轴耦合 |
| 线矢量 | $0$      | $(\boldsymbol{s};\; \boldsymbol{r}\times\boldsymbol{s})$                                                          | 纯转动或纯力     |
| 偶量  | $\infty$ | $(\boldsymbol{0};\; \boldsymbol{s})$                                                                              | 纯平动或纯力偶    |

线矢量是旋量在 $h=0$ 时的退化——此时对偶部仅有线矩（$\boldsymbol{r}\times\boldsymbol{s}$）；偶量是 $h=\infty$
时的退化——此时原部消失，仅剩方向矢量。一般旋量可分解为同轴的线矢量与偶量之和：$\boldsymbol{\$} = (\boldsymbol{s}; \boldsymbol{r}\times\boldsymbol{s}) + (\boldsymbol{0}; h\boldsymbol{s})$。

其余知识要点：

| 主题         | 核心内容                                                                                                    |
|------------|---------------------------------------------------------------------------------------------------------|
| 向量运算       | 点积（投影、方向余弦）、叉积（反对称矩阵、线速度生成）、三重叉积、拉格朗日恒等式                                                                |
| 矩阵         | 十种特殊类型、运算性质表、特征值分解、矩阵指数                                                                                 |
| 线性空间与雅可比   | 基与维数、正交变换保持长度；$\delta\boldsymbol{X} = \boldsymbol{J}\delta\boldsymbol{q}$ → 速度映射                        |
| 齐次坐标       | 点与平面均用 $(x,y,z,1)$ 表示；直线用射线坐标（两点连线）或轴线坐标（两平面交线）表示                                                       |
| Plücker 坐标 | 六维 $(L,M,N;P,Q,R)$，满足 $LP+MQ+NR=0$，仅 4 个独立参数                                                            |
| 旋量系        | $m \times 6$ Plücker 矩阵的秩 = 阶数；最高 6 阶（刚体 6 自由度）                                                         |
| 互易积        | $\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 = (h_1+h_2)\cos\alpha_{12} - a_{12}\sin\alpha_{12}$，为零时互为反旋量 |

