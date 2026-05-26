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

  - title: 3. 旋量系
    slug: 旋量系
  - title: 3.1 线性相关性
    slug: 旋量系-线性相关性
    level: 1
  - title: 3.2 定义与分类
    slug: 旋量系-定义与分类
    level: 1


  - title: 4. 互易旋量系
    slug: 互易旋量系
  - title: 4.1 定义与维数关系
    slug: 互易旋量系-定义与维数关系
    level: 1
  - title: 4.2 几何关系
    slug: 互易旋量系-几何关系
    level: 1
  - title: 4.3 基底的求法
    slug: 互易旋量系-基底的求法
    level: 1
  - title: 4.4 自互易旋量系
    slug: 旋量系-自互易旋量系
    level: 1

  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 机器人机构学系列第四篇，介绍机构学分析的旋量基础——线几何（$Plücker$ 坐标、格拉斯曼线几何）、旋量系与互易旋量系的定义与分类、以及互易旋量系基底的零空间求法与 $Gram$-$Schmidt$ 正交化法。
  - - meta
    - name: keywords
      content: 机器人机构学, 数学基础, 向量运算, 点积, 叉积, 矩阵, 线性空间, 雅可比, 线几何, $Plücker$坐标, 格拉斯曼线几何, 旋量, 旋量系, 互易旋量系, 自互易旋量系, 零空间法, $Gram$-$Schmidt$正交化
---

介绍机构学分析的旋量基础——线几何（Plücker 坐标、格拉斯曼线几何）、旋量与互易积、旋量系与互易旋量系的定义与分类、以及互易旋量系基底的求法（零空间法与
Gram-Schmidt 互易正交化）。

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



const spinorSys = {
  src: miscellaneousImagePath['旋量系'],
  alt: '不同的旋量系',
  align: 'right',
  wrap: true,
  maxHeight: '26rem',
  caption: '不同的旋量系',
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
> 由
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

## 3. 旋量系<a id=旋量系></a>

### 3.1 线性相关性<a id=旋量系-线性相关性></a>

当 $n$ 个旋量 $\boldsymbol{\$}_i$（$i=1,2,\ldots,n$）线性相关时，存在一组不全为零的系数 $\omega_i$ 使得：

$$
\sum_{i=1}^{n} \omega_i \boldsymbol{\$}_i = \boldsymbol{0}
$$

**旋量系的相关性与坐标系选择无关**。

将 $n$ 个旋量的 $Plücker$ 坐标排成 $n \times 6$ 矩阵：

$$
\boldsymbol{A} = \begin{bmatrix}
L_1 & M_1 & N_1 & P_1^* & Q_1^* & R_1^* \\
L_2 & M_2 & N_2 & P_2^* & Q_2^* & R_2^* \\
\vdots & \vdots & \vdots & \vdots & \vdots & \vdots \\
L_n & M_n & N_n & P_n^* & Q_n^* & R_n^*
\end{bmatrix}
$$

旋量集的秩 $r = \operatorname{rank}(\boldsymbol{A})$ 即为其中线性无关旋量的个数。若 $r < n$
，旋量集线性相关。
> 坐标变换可以视为右乘可逆矩阵，不改变秩，因此旋量系的相关性与坐标系选择无关。
### 3.2 定义与分类<a id=旋量系-定义与分类></a>

$n$ 个线性无关的旋量张成一个 **$n$ 阶旋量系**（`screw system`），记作 $\mathcal{S}_n$：

$$
\mathcal{S}_n = \operatorname{span}\{\boldsymbol{\$}_1, \boldsymbol{\$}_2, \ldots, \boldsymbol{\$}_n\}
$$

三维刚体运动的自由度为 6（3 转动 + 3 平动），因此旋量系最高为 **6 阶**。根据阶数从低到高分为旋量一系至旋量六系。

> **6 阶旋量系的标准基**：
>
> $$
> \begin{aligned}
> \boldsymbol{\$}_1 &= (1, 0, 0;\; 0, 0, 0) \\
> \boldsymbol{\$}_2 &= (0, 1, 0;\; 0, 0, 0) \\
> \boldsymbol{\$}_3 &= (0, 0, 1;\; 0, 0, 0) \\
> \boldsymbol{\$}_4 &= (0, 0, 0;\; 1, 0, 0) \\
> \boldsymbol{\$}_5 &= (0, 0, 0;\; 0, 1, 0) \\
> \boldsymbol{\$}_6 &= (0, 0, 0;\; 0, 0, 1)
> \end{aligned}
> $$
>
> 前三个为沿坐标轴的纯转动（线矢量），后三个为沿坐标轴的纯平动（偶量），线性无关且两两互易正交。

按所含旋量的节距特征，旋量系可细分为以下子类：

| 类型         | 条件                     |
|------------|------------------------|
| **自互易旋量系** | 基旋量两两互易积为零             |
| **偶量系**    | 所有元素均为偶量（$h=\infty$）   | 
| **直线旋量系**  | 存在一组由 $n$ 条线性无关线矢量组成的基 | 
| **线系**     | 所有元素均为线矢量（$h=0$）       | |

<Image v-bind="spinorSys"/>

**不变旋量系**（`invariant screw system`
）在位形变化时形式保持不变，所表征的运动具有连续性（不限于瞬时）。不变旋量系与位移子群一一对应（见[机构学的群论基础](./robot-kinematics-06-group.md)
），是连接旋量理论与群论分析的桥梁。

## 4. 互易旋量系<a id=互易旋量系></a>

### 4.1 定义与维数关系<a id=互易旋量系-定义与维数关系></a>

对于 $n$ 阶旋量系 $\mathcal{S}$，所有与 $\mathcal{S}$ 中每个旋量均互易的旋量构成其**互易旋量系**（
`reciprocal screw system`），记作 $\mathcal{S}^r$：

$$
\mathcal{S}^r = \{\boldsymbol{\$}^r \mid \boldsymbol{\$}_i \circ \boldsymbol{\$}^r = 0,\; \forall \boldsymbol{\$}_i \in \mathcal{S}\}
$$

**维数关系**

$$dim(\mathcal{S})+dim(\mathcal{S}^r)=6$$

即两者阶数之和恒为 6。

> **推导**：将 $\mathcal{S}$ 的 $n$ 个基旋量排成 $n \times 6$ 矩阵 $\boldsymbol{A}$
。互易条件 $\boldsymbol{\$}_i \circ \boldsymbol{\$}^r = 0$（$i=1,\ldots,n$）等价于齐次线性方程组：
>
> $$
> \boldsymbol{A} \boldsymbol{\Delta} \boldsymbol{\$}^r = \boldsymbol{0}
> $$
>
> $\boldsymbol{A} \boldsymbol{\Delta}$ 为 $n \times 6$ 矩阵。由 $\mathcal{S}$ 的 $n$
个基线性无关，$\operatorname{rank}(\boldsymbol{A} \boldsymbol{\Delta}) = n$。解空间维数为 $6-n$，即 $\mathcal{S}^r$ 的阶数。

互易关系是对称的：$(\mathcal{S}^r)^r = \mathcal{S}$。

### 4.2 几何关系<a id=互易旋量系-几何关系></a>

由[旋量互易的几何意义](#旋量互易的几何意义)，可导出旋量系与其互易旋量系之间的四条几何对应：

| 关系        | 内容                                                                    |
|-----------|-----------------------------------------------------------------------|
| 线矢量-线矢量   | $\mathcal{S}$ 中的**线矢量**与 $\mathcal{S}^r$ 中的**线矢量**必**共面**（相交或平行）      |
| 线矢量-偶量    | $\mathcal{S}$ 中的**线矢量**与 $\mathcal{S}^r$ 中的**偶量**方向线必**正交**           |
| 偶量-线矢量    | $\mathcal{S}$ 中的**偶量**方向线与 $\mathcal{S}^r$ 中所有旋量的轴线及线矢量均**正交**        |
| 一般旋量-一般旋量 | 两系中一般旋量的轴线满足 $(h_i + h_j)\cos\alpha_{ij} - a_{ij}\sin\alpha_{ij} = 0$ |

机构学意义：自由度空间（运动旋量系）与约束空间（约束力旋量系）正是通过上述互易几何关系建立对偶——运动旋量系的互易旋量系即为其约束力旋量系。

### 4.3 基底的求法<a id=互易旋量系-基底的求法></a>

给定 $n$ 阶旋量系 $\mathcal{S}$ 的 $n$ 个基旋量，求解其互易旋量系 $\mathcal{S}^r$ 的 $6-n$
个基旋量，有零空间法和 $Gram$-$Schmidt$ 互易正交化两种标准方法，以下仅介绍零空间法。

#### a. 零空间法

将 $n$ 个基旋量的 $Plücker$ 坐标排成 $n \times 6$ 矩阵 $\boldsymbol{A}$，构造互易约束矩阵：

$$
\boldsymbol{J} = \boldsymbol{A} \boldsymbol{\Delta} \in \mathbb{R}^{n \times 6}
$$
其中互易矩阵$\boldsymbol{\Delta}$:
$$\boldsymbol{\Delta}=\begin{pmatrix}0 & I\\I & 0 \end{pmatrix}$$
其作用是将矩阵乘法转换为互易积，等价于将$\boldsymbol{A}$的左边三列搬到右边。

互易条件 $\boldsymbol{\$}_i \circ \boldsymbol{\$}^r = 0$（$i=1,\ldots,n$
）等价于齐次线性方程组 $\boldsymbol{J} \boldsymbol{\$}^r = \boldsymbol{0}$。求得一组基础解系即为 $\mathcal{S}^r$ 的 $6-n$
个基旋量。

> **例**：绕 $x$ 轴的转动（线矢量）与沿 $x$ 轴的平动（偶量）构成 2 阶旋量系：
>
> $$
> \begin{aligned}
> \boldsymbol{\$}_1 &= (1, 0, 0;\; 0, 0, 0) \\
> \boldsymbol{\$}_2 &= (0, 0, 0;\; 1, 0, 0)
> \end{aligned}
> $$
>
>构造
> $\boldsymbol{J} = \boldsymbol{A} \boldsymbol{\Delta} = \begin{bmatrix} 0 & 0 & 0 & 1 & 0 & 0 \\ 1 & 0 & 0 & 0 & 0 & 0 \end{bmatrix}$
> ，求解 $\boldsymbol{J} \boldsymbol{\$}^r = \boldsymbol{0}$ 得 $6-2=4$ 个互易基旋量：
>
> $$
> \begin{aligned}
> \boldsymbol{\$}_1^r &= (0, 1, 0;\; 0, 0, 0) \quad \text{——绕 $y$ 轴的约束力} \\
> \boldsymbol{\$}_2^r &= (0, 0, 1;\; 0, 0, 0) \quad \text{——绕 $z$ 轴的约束力} \\
> \boldsymbol{\$}_3^r &= (0, 0, 0;\; 0, 1, 0) \quad \text{——沿 $y$ 轴的约束力偶} \\
> \boldsymbol{\$}_4^r &= (0, 0, 0;\; 0, 0, 1) \quad \text{——沿 $z$ 轴的约束力偶}
> \end{aligned}
> $$
>
> 4 个互易基旋量约束了除绕 $x$ 转动与沿 $x$ 平动以外的全部 4 个自由度，恰好对应 $x$ 轴圆柱副（$C$ 副）的约束力系。

### 4.4 自互易旋量系<a id=旋量系-自互易旋量系></a>

将 $n$ 阶旋量系的基旋量排为 $6 \times n$
列向量矩阵 $\boldsymbol{A} = [\boldsymbol{\$}_1 \; \boldsymbol{\$}_2 \; \cdots \; \boldsymbol{\$}_n]$。其**自互易矩阵**为：

$$
\boldsymbol{M} = \boldsymbol{A}^{\mathrm{T}} \boldsymbol{\Delta} \boldsymbol{A} =
\begin{bmatrix}
\boldsymbol{\$}_1 \circ \boldsymbol{\$}_1 & \boldsymbol{\$}_1 \circ \boldsymbol{\$}_2 & \cdots & \boldsymbol{\$}_1 \circ \boldsymbol{\$}_n \\[2pt]
\boldsymbol{\$}_2 \circ \boldsymbol{\$}_1 & \boldsymbol{\$}_2 \circ \boldsymbol{\$}_2 & \cdots & \boldsymbol{\$}_2 \circ \boldsymbol{\$}_n \\[2pt]
\vdots & \vdots & \ddots & \vdots \\[2pt]
\boldsymbol{\$}_n \circ \boldsymbol{\$}_1 & \boldsymbol{\$}_n \circ \boldsymbol{\$}_2 & \cdots & \boldsymbol{\$}_n \circ \boldsymbol{\$}_n
\end{bmatrix}
$$


若 $\boldsymbol{M} = \boldsymbol{0}$（即基中任意两旋量的互易积均为零），则 $\mathcal{S}_n$ 为**自互易旋量系**。

此时可得：
$$dim(\mathcal{S})+dim(\mathcal{S}^r)=2dim(\mathcal{S})=6$$
即：
$$dim(\mathcal{S})=3$$


## 小结<a id=小结></a>

旋量系与互易旋量系是机构自由度与约束分析的核心工具——运动旋量系（自由度空间）与约束力旋量系（互易旋量系）通过互易关系构成对偶：

| 对象       | 核心内容                                                                                                                              |
|----------|-----------------------------------------------------------------------------------------------------------------------------------|
| 旋量       | 具有节距的直线，$(\boldsymbol{s};\; \boldsymbol{r}\times\boldsymbol{s} + h\boldsymbol{s})$；$h=0$ 退化为线矢量（纯力/纯转动），$h=\infty$ 退化为偶量（纯力偶/纯平动） |
| $n$ 阶旋量系 | $n$ 个线性无关旋量的张成空间；最高 6 阶；相关性由 $Plücker$ 坐标矩阵的秩判定，与坐标系无关                                                                            |
| 自互易旋量系   | 基中任意两旋量互易积均为零；自互易矩阵 $\boldsymbol{M}=\boldsymbol{0}$，所有特征值为零                                                                       |
| 互易旋量系    | 与已知旋量系中所有旋量均互易的旋量集合；阶数满足 $\dim(\mathcal{S}) + \dim(\mathcal{S}^r) = 6$                                                            |
| 基底求法     | 零空间法（求解 $\boldsymbol{A}\boldsymbol{\Delta}\boldsymbol{\$}^r = \boldsymbol{0}$）通用高效；$Gram$-$Schmidt$ 互易正交化几何直观                     |

一般旋量可分解为同轴的线矢量与偶量之和：$\boldsymbol{\$} = (\boldsymbol{s}; \boldsymbol{r}\times\boldsymbol{s}) + (\boldsymbol{0}; h\boldsymbol{s})$
。旋量系与位移子群的对应关系见[机构学的群论基础](./robot-kinematics-06-group.md)。
