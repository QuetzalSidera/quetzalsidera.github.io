---
title: 3.2 - 机构学的群论应用
date: 2026-05-24T01:00:00
tags: [ 机器人, 机构学, 数学基础 ]
pinned: false
collection: 机器人机构学
outline:
  - title: 1. SE(3) 的子群结构
    slug: SE3-的子群结构
  - title: 1.1 SE(3)、SO(3)、T(3)
    slug: SE3-SO3-T3
    level: 1
  - title: 1.2 位移子群
    slug: 位移子群
    level: 1
  - title: 1.3 齐次矩阵表示
    slug: 齐次矩阵表示
    level: 1

  - title: 2. 运动副的群表示
    slug: 运动副的群表示

  - title: 3. 交：并联约束
    slug: 交并联约束

  - title: 4. 乘积：串联运动链
    slug: 乘积串联运动链
  - title: 4.1  乘积的交换性
    slug: 乘积的交换性
    level: 1

  - title: 5. 位移子流形
    slug: 位移子流形

  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 机器人机构学系列第八篇，将群论应用于机构分析——SE(3)的12种位移子群分类与齐次表示、运动副的群表示方法、位移子群的交运算（并联约束）与乘积运算（串联运动链）、位移子流形的概念与分类。
  - - meta
    - name: keywords
      content: 位移子群, 位移子流形, 运动副, 转动副, 移动副, 螺旋副, 圆柱副, 球面副, 平面副, SE(3), 运动链, 群论应用, 机器人机构学
---

群论在机构学中的核心应用：将刚体的每一种基本运动对应为 $SE(3)$ 的一个位移子群，将运动副的组合对应为子群的交与乘积运算。

---

本文承接[群论基础](./robot-kinematics-06-group.md)，将群论的五种运算应用于机构分析：$SE(3)$ 的全部 12
种位移子群及其齐次矩阵表示、运动副与位移子群的对应关系、交运算对并联约束的建模、乘积运算对串联运动链的建模、以及乘积不封闭时产生的位移子流形。

## 1. SE(3) 的子群结构 {#SE3-的子群结构}

### 1.1 SE(3)、SO(3)、T(3) {#SE3-SO3-T3}

三种群是机构学中最基本的群结构：

| 群       | 元素      | 齐次矩阵形式                                                                                                                                                                        | 维数 |
|---------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----|
| $SO(3)$ | 三维旋转矩阵  | $\begin{bmatrix} \boldsymbol{R} & \boldsymbol{0} \\ \boldsymbol{0} & 1 \end{bmatrix}$，$\boldsymbol{R}^{\mathrm{T}}\boldsymbol{R} = \boldsymbol{I},\ \det(\boldsymbol{R}) = 1$ | 3  |
| $T(3)$  | 三维平移向量  | $\begin{bmatrix} \boldsymbol{I} & \boldsymbol{t} \\ \boldsymbol{0} & 1 \end{bmatrix}$，$\boldsymbol{t} \in \mathbb{R}^3$                                                       | 3  |
| $SE(3)$ | 旋转 + 平移 | $\begin{bmatrix} \boldsymbol{R} & \boldsymbol{t} \\ \boldsymbol{0} & 1 \end{bmatrix}$，$\boldsymbol{R} \in SO(3),\ \boldsymbol{t} \in \mathbb{R}^3$                            | 6  |

$SE(3)$ 是描述刚体空间运动的 6 维李群，$SO(3)$ 与 $T(3)$ 是其两个基本子群。三者通过以下运算关联：

| 关系          | 表达式                                    | 运算                  |
|-------------|----------------------------------------|---------------------|
| $SE(3)$ 的构造 | $SE(3) = SO(3) \ltimes T(3)$           | 半直积                 |
| $SO(3)$ 的提取 | $SO(3) \cong SE(3) / T(3)$             | 商                   |
| $T(3)$ 的提取  | $T(3) \cong SE(3) / SO(3)$             | 商（$T(3)$ 是正则子群时才成立） |
| 交集          | $SO(3) \cap T(3) = \{\boldsymbol{I}\}$ | 交                   |

$T(3)$ 是 $SE(3)$ 的正则子群，因此 $SE(3)/T(3) \cong SO(3)$ 构成商群。这一结构是所有位移子群构造的出发点。

### 1.2 位移子群 {#位移子群}

1978 年，法国学者 Hervé 基于刚体位移群的代数结构，枚举了 $SE(3)$ 中存在的全部 12 种**位移子群**（`displacement subgroup`
）。其中 6 种低维子群可作为 6 种基本**低副**（`lower kinematic pair`）的数学表示，称为位移子群的**生成元**（`generator`）：

| 位移子群                         | 维数  | 符号                        | 对应运动副   | 运动描述                                                                    |
|------------------------------|-----|---------------------------|---------|-------------------------------------------------------------------------|
| $\{\boldsymbol{I}\}$         | $0$ | $E$                       | 刚性连接    | 无相对运动                                                                   |
| $R(N, \boldsymbol{u})$       | $1$ | $SO(2)$                   | 转动副 $R$ | 绕过 $N$ 点、方向 $\boldsymbol{u}$ 的轴线转动                                      |
| $T(\boldsymbol{u})$          | $1$ | $T(1)$                    | 移动副 $P$ | 沿方向 $\boldsymbol{u}$ 平移                                                 |
| $H(N, \boldsymbol{u}, \rho)$ | $1$ | $SO_\rho(2)$              | 螺旋副 $H$ | 沿轴线 $(N, \boldsymbol{u})$、螺距 $\rho$ 的螺旋运动                               |
| $T_2(\boldsymbol{w})$        | $2$ | $T(2)$                    | —       | 在法向为 $\boldsymbol{w}$ 的平面内二维平移                                          |
| $C(N, \boldsymbol{u})$       | $2$ | $SO(2) \ltimes T(1)$      | 圆柱副 $C$ | 绕轴线 $(N, \boldsymbol{u})$ 的转动与沿线平移                                      |
| $G(\boldsymbol{w})$          | $3$ | $SE(2)$                   | 平面副 $E$ | 法向为 $\boldsymbol{w}$ 的平面内的一般运动                                          |
| $T_3$                        | $3$ | $T(3)$                    | —       | 空间三维平移                                                                  |
| $S(N)$                       | $3$ | $SO(3)$                   | 球面副 $S$ | 绕中心点 $N$ 的球面转动                                                          |
| $Y(N, \boldsymbol{u}, \rho)$ | $3$ | $SO(2) \ltimes T(2)_\rho$ | —       | 法向为 $\boldsymbol{u}$ 的平面二维平移 + 沿平行于 $\boldsymbol{u}$ 的轴线、螺距为 $\rho$ 的螺旋 |
| $X(\boldsymbol{w})$          | $4$ | $SO(2) \ltimes T(3)$      | —       | 空间三维平移 + 绕平行于 $\boldsymbol{w}$ 的轴线转动                                    |
| $D$                          | $6$ | $SE(3)$                   | —       | 空间一般刚体运动（三维转动 + 三维平移）                                                   |

每一种位移子群都有两种等价符号表达：抽象群记号（如 $SO(2)$）与依赖于几何参数的记号（如 $R(N, \boldsymbol{u})$
）。后者显式标定了轴线位置与方向——这正是机构学分析所必需的几何信息。

位移子群是 $SE(3)$ 的**李子群**，继承 $SE(3)$ 的全部代数特征，因此 [群论基础](./robot-kinematics-06-group.md)
中定义的五种运算均可直接应用于位移子群。

### 1.3 齐次矩阵表示 {#齐次矩阵表示}

每种位移子群在齐次坐标下对应一类 $4 \times 4$ 矩阵的参数化形式。以下列出机构学中最常用的六种：

**a. $T(\boldsymbol{u})$ — 平移子群**  （$a \in \mathbb{R}$）：

$$
\begin{bmatrix}
\boldsymbol{I} & a\boldsymbol{u} \\
\boldsymbol{0} & 1
\end{bmatrix}
$$

**b. $R(N, \boldsymbol{u})$ — 转动子群**（$\theta \in [0, 2\pi)$）：

$$
\begin{bmatrix}
e^{[\boldsymbol{u}]\theta} & (\boldsymbol{I} - e^{[\boldsymbol{u}]\theta})\boldsymbol{P}_N \\
\boldsymbol{0} & 1
\end{bmatrix}
$$

其中 $\boldsymbol{P}_N$ 为轴线上一点 $N$ 的位置矢量，$e^{[\boldsymbol{u}]\theta}$
为 [Rodrigues公式](./robot-kinematics-02-space.md) 给出的旋转矩阵。

**c. $H(N, \boldsymbol{u}, \rho)$ — 螺旋子群**（$\theta \in [0, 2\pi)$）：

$$
\begin{bmatrix}
e^{[\boldsymbol{u}]\theta} & (\boldsymbol{I} - e^{[\boldsymbol{u}]\theta})\boldsymbol{P}_N + \rho\theta\boldsymbol{u} \\
\boldsymbol{0} & 1
\end{bmatrix}
$$

螺距 $\rho = 0$ 时退化为转动子群，$\rho \to \infty$ 时退化为平移子群。

**d. $C(N, \boldsymbol{u})$ — 圆柱子群**（$\theta \in [0, 2\pi),\; a \in \mathbb{R}$）：

$$
\begin{bmatrix}
e^{[\boldsymbol{u}]\theta} & (\boldsymbol{I} - e^{[\boldsymbol{u}]\theta})\boldsymbol{P}_N + a\boldsymbol{u} \\
\boldsymbol{0} & 1
\end{bmatrix}
$$

圆柱运动是绕轴转动与沿线平移的叠加——$C(N, \boldsymbol{u}) = R(N, \boldsymbol{u}) \ltimes T(\boldsymbol{u})$
（半直积，因为转动会改变平移方向）。

**e. $T_3$ — 空间平移子群**（$\boldsymbol{Q} \in \mathbb{R}^3$）：

$$
\begin{bmatrix}
\boldsymbol{I} & \boldsymbol{Q} \\
\boldsymbol{0} & 1
\end{bmatrix}
$$

**f. $S(N)$ — 球面子群**（$\boldsymbol{R} \in SO(3)$）：

$$
\begin{bmatrix}
\boldsymbol{R} & (\boldsymbol{I} - \boldsymbol{R})\boldsymbol{P}_N \\
\boldsymbol{0} & 1
\end{bmatrix}
$$

$S(N)$ 与 $SO(3)$ 同构——绕球心的任意旋转。注意球面副虽然也是 $SO(3)$，但与 $R(N, \boldsymbol{u})$ 的维数不同：前者 3
维（任意转轴），后者 1 维（固定转轴）。

## 2. 运动副的群表示 {#运动副的群表示}

机构学中，一个运动副约束了相连两杆件的相对运动，而**允许的相对运动全体构成一个位移子群**。

6 种低副与位移子群的对应关系：

| 低副  | 符号  | 自由度 | 位移子群                         | 构造方式                                                                                                      | 分解                   |
|-----|-----|-----|------------------------------|-----------------------------------------------------------------------------------------------------------|----------------------|
| 转动副 | $R$ | 1   | $R(N, \boldsymbol{u})$       | [生成元](#位移子群)                                                                                              | -                    |
| 移动副 | $P$ | 1   | $T(\boldsymbol{u})$          | 同上                                                                                                        | -                    |
| 螺旋副 | $H$ | 1   | $H(N, \boldsymbol{u}, \rho)$ | 同上                                                                                                        | -                    |
| 圆柱副 | $C$ | 2   | $C(N, \boldsymbol{u})$       | 半直积：$R(N, \boldsymbol{u}) \ltimes T(\boldsymbol{u})$（或直积：$R(N, \boldsymbol{u}) \times T(\boldsymbol{u})$） | 共轴的一个 $R$ 与一个 $P$    |
| 球面副 | $S$ | 3   | $S(N)$                       | 乘积：$\{R(N, \boldsymbol{u})\} \cdot \{R(N, \boldsymbol{v})\} \cdot \{R(N, \boldsymbol{w})\}$               | 汇交于一点、转轴不共面的三个 $R$   |
| 平面副 | $E$ | 3   | $G(\boldsymbol{w})$          | 半直积：$R(\boldsymbol{w}) \ltimes T_2(\boldsymbol{w})$                                                       | 面内两个正交 $P$ + 法向的 $R$ |


注：若运动副包含旋转与平移，且旋转轴与平移方向不平行，则该多自由度副只能用半直积表示（而不是直积）。若转动轴与平移方向平行（如圆柱副），转动不改变平移方向随体坐标，则可以使用直积，也可以使用半直积（第一个操作数是旋转部分）。

## 3. 交：并联约束 {#交并联约束}

当多个运动副同时约束两杆件的相对运动（并联约束），最终允许的运动为各运动副对应子群的**交集**。

**原理**：设两杆件之间有 $k$ 条并联分支，第 $i$ 条分支允许的相对运动对应子群 $G_i$，则两杆件的实际允许运动为：

$$
G = G_1 \cap G_2 \cap \cdots \cap G_k
$$

交运算的封闭性保证了结果仍是位移子群。

> **例 1**
> ：两个轴线平行但不共线的转动副约束同一刚体。$R(N_1, \boldsymbol{u}) \cap R(N_2, \boldsymbol{u}) = \{\boldsymbol{I}\}$
> ——两平行转轴的转动副交集仅为恒等变换，两杆件被完全锁定。平行但不共线的两个转动，各自允许的运动空间不重叠（除恒等变换外）。

> **例 2**：轴线共线的转动副与移动副。$R(N, \boldsymbol{u}) \cap T(\boldsymbol{u}) = \{\boldsymbol{I}\}$
> ——转动与沿轴平移的交集仅为恒等（两者的运动形式完全不同）。

> **例 3**：球面副与过球心的转动副。$S(N) \cap R(N, \boldsymbol{u}) = R(N, \boldsymbol{u})$
——球面子群包含绕 $\boldsymbol{u}$
> 轴的转动，交集即为该转动子群本身。

> **例 4**
> ：两个正交方向平移的交集。
> $T(\boldsymbol{u}) \cap T(\boldsymbol{v}) = \{\boldsymbol{I}\}$（$\boldsymbol{u} \neq \boldsymbol{v}$
> ）——不同方向的平移互不包含，交集仅为恒等。

| 交运算实例                                                                                 | 结果                     | 物理意义                                                        |
|---------------------------------------------------------------------------------------|------------------------|-------------------------------------------------------------|
| $R(N_1, \boldsymbol{u}) \cap R(N_2, \boldsymbol{u})$，$N_1 \neq N_2$                   | $E$                    | 两平行但不同轴的转动互锁——机构被完全约束                                       |
| $R(N, \boldsymbol{u}) \cap R(N, \boldsymbol{v})$，$\boldsymbol{u} \neq \boldsymbol{v}$ | $E$                    | 同一点不同轴的转动交集仅为恒等                                             |
| $R(N, \boldsymbol{u}) \cap R(N, \boldsymbol{u})$                                      | $R(N, \boldsymbol{u})$ | 相同子群的交等于自身                                                  |
| $S(N) \cap G(\boldsymbol{u})$（$\boldsymbol{u}$ 过 $N$）                                 | $R(N, \boldsymbol{u})$ | 球面运动与法向 $\boldsymbol{u}$ 的平面运动的交集：仅保留绕 $\boldsymbol{u}$ 的转动 |
| $T_3 \cap G(\boldsymbol{u})$                                                          | $T_2(\boldsymbol{u})$  | 空间平移与法向为 $\boldsymbol{u}$ 的平面运动的交集：仅保留面内平移                  |

交运算直接用于分析机构的约束状态——如果各分支允许运动的交集为零维（仅恒等），则两构件之间没有相对运动自由度。

## 4. 乘积：串联运动链 {#乘积串联运动链}

串联运动链的末端相对运动为各级运动副对应子群的**乘积**。设串联链中有 $m$ 个运动副，第 $i$ 个对应子群 $G_i$，则末端运动空间为：

$$
G = G_1 G_2 \cdots G_m = \{g_1 g_2 \cdots g_m \mid g_i \in G_i\}
$$

乘积的**顺序**反映串联顺序——从基座到末端依次右乘。

> **例 1**：三个汇交于一点 $N$
> 、转轴线性无关的转动副串联。$R(N, \boldsymbol{u}) \cdot R(N, \boldsymbol{v}) \cdot R(N, \boldsymbol{w}) = S(N)$
> 。三个转动子群的乘积恰好构成球面子群——这是一个**位移子群**（维数：$1+1+1 = 3 = \dim S(N)$），且是**李群**
> （$S(N) \cong SO(3)$
> 是李群）。不是交换群（$SO(3)$ 非 Abel）。

> **例 2**：一个转动副与一个同轴移动副串联。$R(N, \boldsymbol{u}) \cdot T(\boldsymbol{u}) = C(N, \boldsymbol{u})$
> 。乘积构成圆柱子群——
> **是群，是李群，不是交换群**（转动与沿线平移不相交换，为半直积）。

> **例 3**：三个正交的平移副串联。$T(\boldsymbol{e}_1) \cdot T(\boldsymbol{e}_2) \cdot T(\boldsymbol{e}_3) = T_3$
> 。平移子群之间两两可交换，乘积构成 $T(3)$——**是群，是李群，是交换群**（$T(3)$ 是 Abel 群）。

> **例 4**：两个平行但不同轴的转动副串联。$R(N_1, \boldsymbol{u}) \cdot R(N_2, \boldsymbol{u})$，其中 $N_1 \neq N_2$
> 。乘积维数为 $2$，但 $SE(3)$ 中不存在 2 维的转动子群（仅有 $C$ 是 2 维且含转动）。该乘积**不是群**
> ——不满足封闭律（两次绕不同平行轴的转动复合后产生平移分量，无法表示为单次绕某固定轴的转动）。

### 4.1 乘积的交换性 {#乘积的交换性}

两个位移子群乘积是否可交换（即 $G_1 G_2 = G_2 G_1$）：

| $G_1$                    | $G_2$                         | 是否可交换                                        | 条件                                    |
|--------------------------|-------------------------------|----------------------------------------------|---------------------------------------|
| $T(\boldsymbol{u}_1)$    | $T(\boldsymbol{u}_2)$         | 是                                            | 平移始终可交换                               |
| $R(N, \boldsymbol{u})$   | $R(N, \boldsymbol{v})$        | 仅当 $\boldsymbol{u} = \boldsymbol{v}$         | 同轴转动可交换；不同轴的转动 $R_1 R_2 \neq R_2 R_1$ |
| $R(N, \boldsymbol{u})$   | $T(\boldsymbol{v})$           | 仅当 $\boldsymbol{u} \parallel \boldsymbol{v}$ | 转动不改变与其平行的平移分量；垂直分量被旋转改变              |
| $R(N_1, \boldsymbol{u})$ | $R(N_2, \boldsymbol{u})$（平行轴） | 否                                            | 绕不同平行轴的转动不交换，乘积差一个平移                  |

判断交换性的实用准则：若两个运动在空间中互不干扰对方的作用效果，则可交换。平移之间可交换（两个平移的合成与顺序无关）；含转动的组合不可交换（转动改变了后续运动的空间方向），除非两转动同轴或转动与平移共线。

## 5. 位移子流形 {#位移子流形}

并非所有刚体运动都构成位移子群。**位移子流形**（`displacement submanifold`）是不具备群结构的刚体运动集合——运动不能沿固定坐标轴描述，乘积不满足封闭律。

位移子流形在机构学中同样重要：例如万向节的两自由度运动非群运动。$SE(3)$ 中按转动/平移维数分类的完整运动类型：

| 维数  | 转动 + 平移   | 类别       | 运动类型                                                                                                                |
|-----|-----------|----------|---------------------------------------------------------------------------------------------------------------------|
| $6$ | $3R + 3T$ | 位移子群     | $D = SE(3)$                                                                                                         |
| $5$ | $3R + 2T$ | 位移子流形    | $T_2(\boldsymbol{w}) \cdot S(N)$                                                                                    |
| $5$ | $2R + 3T$ | 位移子流形    | $T_3 \cdot R(N_1, \boldsymbol{u}) \cdot R(N_2, \boldsymbol{v})$                                                     |
| $4$ | $3R + 1T$ | 位移子群     | $X(\boldsymbol{w})$                                                                                                 |
| $4$ | $2R + 2T$ | 位移子流形    | $T_2(\boldsymbol{w}) \cdot R(N_1, \boldsymbol{u}) \cdot R(N_2, \boldsymbol{v})$ 或 $T_3 \cdot S(N)$                  |
| $4$ | $1R + 3T$ | 位移子群     | $X(\boldsymbol{w})$                                                                                                 |
| $3$ | $3R$      | 位移子群     | $S(N)$                                                                                                              |
| $3$ | $3T$      | 位移子群     | $T_3$                                                                                                               |
| $3$ | $2R + 1T$ | 位移子流形    | $T(\boldsymbol{w}) \cdot R(N_1, \boldsymbol{u}) \cdot R(N_2, \boldsymbol{v})$                                       |
| $3$ | $1R + 2T$ | 位移子群/子流形 | $G(\boldsymbol{u})$（群）或 $T_2(\boldsymbol{w}) \cdot R(N, \boldsymbol{u})$（非群，$\boldsymbol{w} \neq \boldsymbol{u}$）   |
| $2$ | $2R$      | 位移子流形    | $R(N_1, \boldsymbol{u}) \cdot R(N_2, \boldsymbol{v})$（轴线不共面时）                                                       |
| $2$ | $1R + 1T$ | 位移子群/子流形 | $C(N, \boldsymbol{u})$（群）或 $T(\boldsymbol{v}) \cdot R(N, \boldsymbol{u})$（非群，$\boldsymbol{v} \perp \boldsymbol{u}$） |
| $2$ | $2T$      | 位移子群     | $T_2(\boldsymbol{w})$                                                                                               |
| $1$ | $1R$      | 位移子群     | $R(N, \boldsymbol{u})$                                                                                              |
| $1$ | $1T$      | 位移子群     | $T(\boldsymbol{u})$                                                                                                 |

判断一个运动是否构成位移子群的关键标准：**能否在每个可达位姿下，沿一组固定的坐标轴实现所有允许的运动**。李群运动可以（如 XY
平台在每个位姿下都沿固定 $x$、$y$ 轴平移）；非李群运动不能（如万向节末端不能在每个姿态下都绕初始坐标轴转动）。

## 小结 {#小结}

群论在机构学中的应用归结为三组对应关系：

| 机构学概念           | 群论对应  | 运算                   |
|-----------------|-------|----------------------|
| 并联分支（多约束下的允许运动） | 子群的交  | $\cap$               |
| 串联运动链（末端运动）     | 子群的乘积 | $G_1 G_2 \cdots G_m$ |
| 运动副（允许的相对运动）    | 位移子群  | 生成元及其半直积             |
