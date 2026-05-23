---
title: 2.1 - 旋量理论基础
date: 2026-05-20T00:00:00
tags: [ 机器人, 机构学, 数学基础 ]
pinned: false
collection: 机器人机构学
outline:
  - title: 1. 线几何
    slug: 线几何
  - title: 1.1 齐次坐标
    slug: 齐次坐标
    level: 1
  - title: 1.2 Plücker 坐标
    slug: plucker坐标
    level: 1

  - title: 2. 旋量
    slug: 旋量
  - title: 2.1 定义与退化
    slug: 定义与退化
    level: 1
  - title: 2.2 基本运算
    slug: 基本运算
    level: 1
  - title: 2.3 坐标变换
    slug: 坐标变换
    level: 1
  - title: 2.4 旋量互易
    slug: 旋量互易
    level: 1

  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 机器人机构学系列第四篇，介绍机构学分析的旋量基础——线几何（$Plücker$ 坐标、格拉斯曼线几何）以及旋量与旋量系的基本概念与运算。
  - - meta
    - name: keywords
      content: 机器人机构学, 数学基础, 向量运算, 点积, 叉积, 矩阵, 线性空间, 雅可比, 线几何, $Plücker$坐标, 格拉斯曼线几何, 旋量, 旋量系
---

介绍机构学分析的旋量基础——线几何（Plücker 坐标、格拉斯曼线几何）以及旋量与旋量系的基本概念与运算。

---

<script setup lang="ts">
import Image from '../.vitepress/theme/components/shared/Image.vue'
import {path as miscellaneousImagePath} from '@Miscellaneous/path'

const reciprocalScrews = {
  src: miscellaneousImagePath['Reciprocal Screws'],
  alt: 'Reciprocal Screws',
  align: 'center',
  wrap: false,
  maxHeight: '26rem',
  caption: '旋量互异的几何意义',
} as const

</script>


本章为全书后续各章提供数学基础——从三维向量与矩阵出发，经线几何过渡到旋量与旋量系。

## 1. 线几何<a id=线几何></a>

### 1.1 齐次坐标<a id=齐次坐标></a>

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

> #### 两平面交线推导
>
>设有平面 $\boldsymbol{\pi}_1 = (\boldsymbol{a}; a_0) = (a_x, a_y, a_z, a_0)$
> 和 $\boldsymbol{\pi}_2 = (\boldsymbol{b}; b_0) = (b_x, b_y, b_z, b_0)$。两平面的法向量分别为 $\boldsymbol{a}$
> 和 $\boldsymbol{b}$，交线的方向 $\boldsymbol{l}$ 垂直于两法向量：$\boldsymbol{l} = \boldsymbol{a} \times \boldsymbol{b}$
> 。交线上任一点 $\boldsymbol{r}$ 同时满足两平面方程 $\boldsymbol{a}\cdot\boldsymbol{r} + a_0 = 0$
> 和 $\boldsymbol{b}\cdot\boldsymbol{r} + b_0 = 0$
> ，由此可导出线矩 $\boldsymbol{l}^0 = \boldsymbol{r} \times \boldsymbol{l} = a_0\boldsymbol{b} - b_0\boldsymbol{a}$
> (三重叉积展开)。

### 1.2 Plücker 坐标<a id=plucker坐标></a>
#### a. 直线的 Plücker 坐标
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
[\boldsymbol{p}]\boldsymbol{s} =
\begin{bmatrix}
p_y(q_z-p_z) - p_z(q_y-p_y) \\
p_z(q_x-p_x) - p_x(q_z-p_z) \\
p_x(q_y-p_y) - p_y(q_x-p_x)
\end{bmatrix}
$$


定义六维**线矢量**，即是此直线的 Plücker 坐标：
$$
\boldsymbol{\$} = \begin{bmatrix} \boldsymbol{s} \\ \boldsymbol{s}_0 \end{bmatrix}
= (L, M, N;\; P, Q, R)
$$

归一化表达
$$
\boldsymbol{\$} = \rho \hat{\boldsymbol{\$}}, 其中 \rho = \|\boldsymbol{s}\|
$$

#### b. 线矢量的性质

由 $\boldsymbol{s} \cdot \boldsymbol{s}_0 = \boldsymbol{s} \cdot (\boldsymbol{r} \times \boldsymbol{s}) = 0$
，得 $LP + MQ + NR = 0$。

六个 $Plücker$ 坐标满足归一化条件 $\hat{\boldsymbol{s}} \cdot \hat{\boldsymbol{s}} = 1$
和正交条件 $\hat{\boldsymbol{s}} \cdot \hat{\boldsymbol{s}}_0 = 0$，因此只有 **4 个独立参数**。


## 2. 旋量<a id=旋量></a>

### 2.1 定义与退化<a id=定义与退化></a>

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

> **证明**：
>
由 $\boldsymbol{\$} = p\hat{\boldsymbol{\$}} = (\boldsymbol{s}; \boldsymbol{s}^0) = p(\hat{\boldsymbol{s}}; \boldsymbol{r}\times\hat{\boldsymbol{s}} + h\hat{\boldsymbol{s}})$
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

### 2.2 基本运算<a id=基本运算></a>

#### a. 加法

两旋量的代数和满足交换律和结合律——$\boldsymbol{\$}_{12} = \boldsymbol{\$}_1 + \boldsymbol{\$}_2 = (\boldsymbol{s}_1+\boldsymbol{s}_2) + \varepsilon(\boldsymbol{s}_1^0+\boldsymbol{s}_2^0)$。

#### b. 互易积
将两旋量的原部与对偶部交换后作点积之和：

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

### 2.3 坐标变换<a id=坐标变换></a>

设坐标系 $\{A\}$ 到 $\{B\}$ 的齐次变换矩阵为：

$$
\boldsymbol{T}_{AB} = \begin{bmatrix}
\boldsymbol{R} & \boldsymbol{t} \\
\boldsymbol{0}^{\mathrm{T}} & 1
\end{bmatrix}
$$

旋量 $\boldsymbol{\$} = (\boldsymbol{s}; \boldsymbol{s}^0) = (\boldsymbol{s}; \boldsymbol{r} \times \boldsymbol{s} + h\boldsymbol{s})$
在 $\{A\}$、$\{B\}$
中的坐标分别为 $\boldsymbol{\$}_A = (\boldsymbol{s}_A; \boldsymbol{s}_A^0)$、$\boldsymbol{\$}_B = (\boldsymbol{s}_B; \boldsymbol{s}_B^0)$。

#### 分量形式

$$
\boldsymbol{s}_B = \boldsymbol{R}\boldsymbol{s}_A (旋转变换)
$$

$$
\boldsymbol{s}_B^0 = [\boldsymbol{t}]\boldsymbol{R}\boldsymbol{s}_A + \boldsymbol{R}\boldsymbol{s}_A^0 = \boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{s}_A) + \boldsymbol{R}\boldsymbol{s}_A^0 (旋转变换 + 平移变换)
$$

> **推导**：原部 $\boldsymbol{s}$
是自由矢量，与原点位置无关，仅受旋转作用，故 $\boldsymbol{s}_B = \boldsymbol{R}\boldsymbol{s}_A$。
>
> 对偶部 $\boldsymbol{s}^0 = \boldsymbol{r} \times \boldsymbol{s} + h\boldsymbol{s}$。$h\boldsymbol{s}$
是自由矢量，仅受旋转，在 $\{B\}$ 中为 $\boldsymbol{R}(h\boldsymbol{s}_A)$。$\boldsymbol{r} \times \boldsymbol{s}$
是线矩——轴线上一点 $\boldsymbol{r}$ 对坐标系原点的矩；换坐标系后原点变了，$\boldsymbol{r}$
也变了，$\boldsymbol{r}_B = \boldsymbol{R}\boldsymbol{r}_A + \boldsymbol{t}$。在 $\{B\}$ 下的线矩：
> $$
> \boldsymbol{r}_B \times \boldsymbol{s}_B = (\boldsymbol{R}\boldsymbol{r}_A + \boldsymbol{t}) \times (\boldsymbol{R}\boldsymbol{s}_A) = \boldsymbol{R}(\boldsymbol{r}_A \times \boldsymbol{s}_A) + \boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{s}_A)
> $$
> 其中利用了
> $(\boldsymbol{R}\boldsymbol{a}) \times (\boldsymbol{R}\boldsymbol{b}) = \boldsymbol{R}(\boldsymbol{a} \times \boldsymbol{b})$
> 。两项合并，提取公因子 $\boldsymbol{R}$：
> $$
> \begin{aligned}
> \boldsymbol{s}_B^0 &= \boldsymbol{r}_B \times \boldsymbol{s}_B + h\boldsymbol{s}_B \\
> &= \big[\boldsymbol{R}(\boldsymbol{r}_A \times \boldsymbol{s}_A) + \boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{s}_A)\big] + \boldsymbol{R}(h\boldsymbol{s}_A) \\
> &= \boldsymbol{R}(\boldsymbol{r}_A \times \boldsymbol{s}_A + h\boldsymbol{s}_A) + \boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{s}_A) \\
> &= \boldsymbol{R}\boldsymbol{s}_A^0 + \boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{s}_A)
> \end{aligned}
> $$
> $\boldsymbol{R}\boldsymbol{s}_A^0$ 是原对偶部的旋转变换；$\boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{s}_A)$
是坐标系原点平移 $\boldsymbol{t}$ 产生的附加线矩。

#### 矩阵形式
根据分量形式可以整理为：
$$

\begin{bmatrix} \boldsymbol{s}_B \\ \boldsymbol{s}_B^0 \end{bmatrix} =
\begin{bmatrix}
\boldsymbol{R} & \boldsymbol{0}_{3 \times 3} \\
[\boldsymbol{t}]\boldsymbol{R} & \boldsymbol{R}
\end{bmatrix}
\begin{bmatrix} \boldsymbol{s}_A \\ \boldsymbol{s}_A^0 \end{bmatrix}

$$

该 $6 \times 6$ 矩阵称为**伴随变换矩阵**（`adjoint transformation`），记作 $\operatorname{Ad}_{\boldsymbol{T}}$

即
$$\boldsymbol{\$}_B = \operatorname{Ad}_{\boldsymbol{T}_{AB}}\boldsymbol{\$}_A$$

$$\operatorname{Ad}_{\boldsymbol{T}_{AB}}=
\begin{bmatrix}
\boldsymbol{^A_BR} & \boldsymbol{0}_{3 \times 3} \\
[\boldsymbol{^A_Bt}]\boldsymbol{^A_BR} & \boldsymbol{^A_BR}
\end{bmatrix}$$

#### 互易积的坐标不变性
两旋量的互易积在坐标变换下保持不变。

> **验证**
：记变换后 $\boldsymbol{s}_i' = \boldsymbol{R}\boldsymbol{s}_i$，$\boldsymbol{s}_i^{0\prime} = \boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{s}_i) + \boldsymbol{R}\boldsymbol{s}_i^0$（$i=1,2$
），代入互易积定义 $\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 = \boldsymbol{s}_1 \cdot \boldsymbol{s}_2^0 + \boldsymbol{s}_2 \cdot \boldsymbol{s}_1^0$：
> $$
> \begin{aligned}
> \boldsymbol{\$}_1' \circ \boldsymbol{\$}_2'
> &= (\boldsymbol{R}\boldsymbol{s}_1) \cdot
\big[\boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{s}_2) + \boldsymbol{R}\boldsymbol{s}_2^0\big]
> + (\boldsymbol{R}\boldsymbol{s}_2) \cdot
    \big[\boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{s}_1) + \boldsymbol{R}\boldsymbol{s}_1^0\big] \\
    > &= \underbrace{(\boldsymbol{R}\boldsymbol{s}_1) \cdot (\boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{s}_2)) + (
    \boldsymbol{R}\boldsymbol{s}_2) \cdot (\boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{s}_1))}_{\text{互为相反数，相消}}
> + (\boldsymbol{R}\boldsymbol{s}_1) \cdot (\boldsymbol{R}\boldsymbol{s}_2^0) + (\boldsymbol{R}\boldsymbol{s}_2) \cdot (
    \boldsymbol{R}\boldsymbol{s}_1^0) \\
    > &= \boldsymbol{s}_1 \cdot \boldsymbol{s}_2^0 + \boldsymbol{s}_2 \cdot \boldsymbol{s}_1^0 = \boldsymbol{\$}_1 \circ
    \boldsymbol{\$}_2
    > \end{aligned}
    > $$
    > $(\boldsymbol{R}\boldsymbol{s}_1) \cdot (\boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{s}_2)) = -(\boldsymbol{R}\boldsymbol{s}_2) \cdot (\boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{s}_1))$
    （混合积轮换反号），两项相消；$(\boldsymbol{R}\boldsymbol{a}) \cdot (\boldsymbol{R}\boldsymbol{b}) = \boldsymbol{a} \cdot \boldsymbol{b}$
    （旋转保内积）。

互易积不变性保证了互易关系（$\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 = 0$）不依赖坐标系选择，是机构约束与自由度分析中空间不变的判据。


### 2.4 旋量互易<a id=旋量互易></a>

由[2.2节](#基本运算)的互易积展开式
$\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 = p_1p_2\big[(h_1+h_2)\cos\alpha_{12} - a_{12}\sin\alpha_{12}\big]$
，两旋量互易（$\boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 = 0$）的几何条件因节距组合而异。

#### a. 线矢量（$h_1 = h_2 = 0$）

两轴线**共面**时，线矢量互异。


> **证明**：
> 代入 $h_1=h_2=0$，互易积退化为
>
>$$
> \hat{\boldsymbol{\$}}_1 \circ \hat{\boldsymbol{\$}}_2 = -a_{12}\sin\alpha_{12}
> $$
> 互易条件为 $a_{12} = 0$ 或 $\alpha_{12} = 0$，两轴线相交（$a_{12}=0$）或平行（$\alpha_{12}=0$），即轴线**共面**。


#### b. 纯偶量（$h_1, h_2 \to \infty$）

两个纯偶量**始终互易**。

> **证明**：
> 原部为零 $\hat{\boldsymbol{\$}} = (\boldsymbol{0}; \hat{\boldsymbol{s}})$
> ，直接由互易积定义
> $$
> \hat{\boldsymbol{\$}}_1 \circ \hat{\boldsymbol{\$}}_2 = \boldsymbol{0} \cdot \hat{\boldsymbol{s}}_2 + \boldsymbol{0} \cdot \hat{\boldsymbol{s}}_1 = 0
> $$


#### c. 线矢量与偶量（$h_1 = 0, h_2 \to \infty$）
互易条件为 $\hat{\boldsymbol{s}}_1 \cdot \hat{\boldsymbol{s}}_2 = 0$，即两**轴线垂直**。

> **证明**：
> 线矢量 $\hat{\boldsymbol{\$}}_1 = (\hat{\boldsymbol{s}}_1; \boldsymbol{r}_1 \times \hat{\boldsymbol{s}}_1)$（$h_1=0$
> ），偶量 $\hat{\boldsymbol{\$}}_2 = (\boldsymbol{0}; \hat{\boldsymbol{s}}_2)$（$h_2=\infty$）：
>
>$$
> \hat{\boldsymbol{\$}}_1 \circ \hat{\boldsymbol{\$}}_2 = \hat{\boldsymbol{s}}_1 \cdot \hat{\boldsymbol{s}}_2 + \boldsymbol{0} \cdot (\boldsymbol{r}_1 \times \hat{\boldsymbol{s}}_1) = \hat{\boldsymbol{s}}_1 \cdot \hat{\boldsymbol{s}}_2 = \cos\alpha_{12}
> $$


#### d. 一般旋量（$h_1, h_2 \neq 0$）

互易条件为：$\displaystyle \frac{\sin\alpha_{12}}{\cos\alpha_{12}} = \frac{h_1 + h_2}{a_{12}}$，即节距之和与公垂线距离的比值决定。

> **证明**：
> 由互易积展开式为零：
>
>$$
> (h_1 + h_2)\cos\alpha_{12} - a_{12}\sin\alpha_{12} = 0
> $$
>
>即
> $$\displaystyle \frac{\sin\alpha_{12}}{\cos\alpha_{12}} = \frac{h_1 + h_2}{a_{12}}$$

#### 旋量互易的几何意义
<Image v-bind="reciprocalScrews" />

## 小结<a id=小结></a>

旋量、线矢量与偶量的关系是本章的核心结论：

| 对象  | $h$      | Plücker 坐标                                                                                                        | 物理意义       |
|-----|----------|-------------------------------------------------------------------------------------------------------------------|------------|
| 旋量  | 任意       | $(\boldsymbol{s};\; \boldsymbol{s}^0) = (\boldsymbol{s};\; \boldsymbol{r}\times\boldsymbol{s} + h\boldsymbol{s})$ | 转动与平动的同轴耦合 |
| 线矢量 | $0$      | $(\boldsymbol{s};\; \boldsymbol{r}\times\boldsymbol{s})$                                                          | 纯转动或纯力     |
| 偶量  | $\infty$ | $(\boldsymbol{0};\; \boldsymbol{s})$                                                                              | 纯平动或纯力偶    |

线矢量是旋量在 $h=0$ 时的退化——此时对偶部仅有线矩（$\boldsymbol{r}\times\boldsymbol{s}$）；偶量是 $h=\infty$
时的退化——此时原部消失，仅剩方向矢量。一般旋量可分解为同轴的线矢量与偶量之和：$\boldsymbol{\$} = (\boldsymbol{s}; \boldsymbol{r}\times\boldsymbol{s}) + (\boldsymbol{0}; h\boldsymbol{s})$。
