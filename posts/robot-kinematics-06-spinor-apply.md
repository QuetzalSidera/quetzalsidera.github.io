---
title: 2.2 - 旋量的物理应用
date: 2026-05-23T10:00:00
tags: [ 机器人, 机构学, 旋量理论 ]
pinned: false
collection: 机器人机构学
outline:
  - title: 1. 运动旋量
    slug: 运动旋量
  - title: 1.1 Chasles 定理
    slug: Chasles-定理
    level: 1
  - title: 1.2 不同运动情况
    slug: 不同运动情况
    level: 1
  - title: a. 纯转动
    slug: 纯转动
    level: 2
  - title: b. 纯平动
    slug: 纯平动
    level: 2
  - title: c. 一般运动
    slug: 一般运动
    level: 2
  - title: 1.3 速度旋量的坐标变换
    slug: 速度旋量的坐标变换
    level: 1

  - title: 2. 力旋量
    slug: 力旋量
  - title: 2.1 Poinsot 定理
    slug: Poinsot-定理
    level: 1
  - title: 2.2 不同力系情况
    slug: 不同力系情况
    level: 1
  - title: a. 纯力
    slug: 纯力
    level: 2
  - title: b. 纯力偶
    slug: 纯力偶
    level: 2
  - title: c. 一般力系
    slug: 一般力系
    level: 2

  - title: 2.3 力旋量的坐标变换
    slug: 力旋量的坐标变换
    level: 1

  - title: 3. 运动副旋量
    slug: 运动副旋量

  - title: 4. 做功与约束的旋量表述
    slug: 做功与约束的旋量表述
  - title: 4.1 瞬时功
    slug: 瞬时功
    level: 1
  - title: 4.2 约束力旋量
    slug: 约束力旋量
    level: 1

  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 机器人机构学系列第四篇，介绍旋量在机构学中的三类物理对象——运动旋量（$Chasles$ 定理：纯转动、纯平动与一般螺旋运动）、力旋量（$Poinsot$ 定理：纯力、纯力偶与一般力旋量）、运动副的旋量表示，以及做功与约束的旋量表述（瞬时功、互易旋量、约束力旋量及其几何条件）。
  - - meta
    - name: keywords
      content: 机器人机构学, 旋量理论, 运动旋量, $Twist$, 力旋量, $Wrench$, $Chasles$定理, $Poinsot$定理, 螺旋运动, 运动副旋量, 互易旋量, 约束力旋量, 瞬时功
---

旋量的代数定义给出了 Plücker 坐标与基本运算，但旋量的真正价值在于它统一描述了机构学中的三类核心对象：运动、力和运动副。

---

本文承接[旋量的数学基础](robot-kinematics-01-basic.md)，将旋量从代数对象落实到物理层面，依次介绍运动旋量、力旋量
与运动副旋量，最后通过互易积建立三者之间的核心关系——瞬时功与理想约束。本篇聚焦旋量的物理语义与互易关系。

## 1. 运动旋量{#运动旋量}

### 1.1 Chasles 定理{#Chasles-定理}

Chasles 定理：刚体的任意空间运动均可等效为绕某一轴线的转动与沿该轴线的移动的复合——即**螺旋运动**。

**运动旋量**是螺旋运动的瞬时描述，运动旋量定义为六维矢量：

$$
\boldsymbol{T} = \begin{bmatrix} \boldsymbol{\omega} \\ \boldsymbol{v} \end{bmatrix}
= (\omega_x, \omega_y, \omega_z;\; v_x, v_y, v_z)
$$
$$
\boldsymbol{v}= \boldsymbol{r} \times \boldsymbol{\omega}+ h \boldsymbol{\omega}
$$

$$
h = \frac{\boldsymbol{\omega} \cdot \boldsymbol{v}}{\boldsymbol{\omega} \cdot \boldsymbol{\omega}},\qquad
\boldsymbol{r} = \frac{\boldsymbol{\omega} \times \boldsymbol{v}}{\boldsymbol{\omega} \cdot \boldsymbol{\omega}}
$$

其中

| 符号                                          | 含义             | 几何解释                                                                                                        |
|---------------------------------------------|----------------|-------------------------------------------------------------------------------------------------------------|
| $\boldsymbol{\omega}$                       | 刚体角速度          | 螺旋运动的旋转分量，方向即螺旋轴方向                                                                                          |
| $\boldsymbol{v}$                            | 与坐标原点重合点的瞬时线速度 | 螺旋运动在原点处产生的总线速度                                                                                             |
| $\boldsymbol{r}$                            | 螺旋轴线上一点的位置矢量   | 确定螺旋轴在空间中的位置                                                                                                |
| $h$                                         | 节距             | 沿轴平动速度与绕轴角速度之比：$h = (\boldsymbol{\omega}\cdot\boldsymbol{v})/(\boldsymbol{\omega}\cdot\boldsymbol{\omega})$ |
| $\boldsymbol{r} \times \boldsymbol{\omega}$ | 转动分量在原点处造成的线速度 | 即$\boldsymbol{\omega} \times (-\boldsymbol{r})$                                                             |
| $h\boldsymbol{\omega}$                      | 平动分量在原点处造成的线速度 | 平动分量贡献到原点的速度，与原点位置无关（自由矢量）                                                                                  |


也就是说：一个速度旋量本质上是用一个**螺旋运动**表示一个**空间速度场**：螺旋运动绕轴旋转的角速度为 $\boldsymbol{\omega}$
，该速度场在原点处的速度为 $\boldsymbol{v}$。空间中任意点 $\boldsymbol{p}$ 的速度均可由该旋量重建：

$$
\boldsymbol{v}_p = \boldsymbol{v} + \boldsymbol{\omega} \times \boldsymbol{p}
$$
> **证明**：
> 空间中任意一点速度：
> $$\boldsymbol{v}_p= \boldsymbol{\omega} \times (\boldsymbol{p}-\boldsymbol{r})+h \times \boldsymbol{w} $$
> 展开得：
> $$\boldsymbol{v}_p= \underbrace{\boldsymbol{r} \times \boldsymbol{\omega} +h \times \boldsymbol{w}}_{=\boldsymbol{v}}+ \boldsymbol{\omega} \times \boldsymbol{p} $$


速度旋量 $\boldsymbol{T} = (\boldsymbol{\omega};\boldsymbol{v})$ 完整刻画了整个刚体的瞬时运动状态——六个标量，对应空间刚体的六个自由度。


按节距 $h$ 的取值，运动旋量分为三种情况：

| 节距               | 退化形式                                                                     | 物理意义 |
|------------------|--------------------------------------------------------------------------|------|
| $h = 0$          | 线矢量 $(\hat{\boldsymbol{s}};\; \boldsymbol{r}\times\hat{\boldsymbol{s}})$ | 纯转动  |
| $h = \infty$     | 偶量 $(\boldsymbol{0};\; \hat{\boldsymbol{s}})$                            | 纯平动  |
| $0 < h < \infty$ | —                                                                        | 螺旋运动 |

### 1.2 不同运动情况{#不同运动情况}
旋量表示中的 $\boldsymbol{w}$ 和 $\boldsymbol{r}$ 共同确定了一条空间直线——**旋量轴线**。
旋量轴线与直观的**运动轴线**不完全相同。
#### a. 纯转动{#纯转动}
刚体绕空间轴以角速度 $\boldsymbol{\omega}$ 转动。节距 $h = 0$，运动旋量退化为**线矢量**：

$$
\boldsymbol{T} = \begin{bmatrix} \boldsymbol{\omega} \\\boldsymbol{r} \times \boldsymbol{\omega}\end{bmatrix}
$$
此时，旋量轴线就是旋转轴，$\boldsymbol{r}$为轴线上任意一点的位矢。

#### b. 纯平动{#纯平动}

刚体沿方向 $\hat{\boldsymbol{v}}$ 以速度 $\boldsymbol{v}$
平动。角速度 $\boldsymbol{\omega} = \boldsymbol{0}$，节距 $h = \infty$，运动旋量退化为**偶量**：

$$
\boldsymbol{T} = \begin{bmatrix} \boldsymbol{0} \\\ h \boldsymbol{\omega}\end{bmatrix}
$$
此时，旋量轴线与$\boldsymbol{v}$共线，旋量轴线退化为一个**方向**（自由矢量）。

#### c. 一般运动{#一般运动}

一般运动分解为同轴的纯转动与纯平动之和（Chasles 定理）：

$$
\boldsymbol{T} =
\underbrace{\begin{bmatrix} \boldsymbol{w} \\ \boldsymbol{r} \times \boldsymbol{w} \end{bmatrix}}_{\text{转动分量}}+
\underbrace{\begin{bmatrix} \boldsymbol{0} \\ h \boldsymbol{w} \end{bmatrix}}_{\text{平动分量}} =
\begin{bmatrix} \boldsymbol{w} \\ \boldsymbol{r} \times \boldsymbol{w} + h\boldsymbol{w} \end{bmatrix}
$$

该分解的意义：任意螺旋运动可视为一个纯转动（线矢量）与一个同轴纯平动（偶量）的叠加——节距 $h$ 控制二者的比例。

此时，旋量轴线就是旋转轴，$\boldsymbol{r}$为轴线上任意一点的位矢。

### 1.3 速度旋量的坐标变换{#速度旋量的坐标变换}

设坐标系 $\{B\}$ 到 $\{A\}$ 的旋转矩阵为 $\boldsymbol{R}$，平移矢量为 $\boldsymbol{t}$。
$\boldsymbol{T}_B = (\boldsymbol{\omega}_B; \boldsymbol{v}_B)$ 为速度旋量在 $\{B\}$ 中的表示。

分量形式：

$$
\boldsymbol{\omega}_A = \boldsymbol{R}\boldsymbol{\omega}_B
$$

$$
\boldsymbol{v}_A = \boldsymbol{t}\times(\boldsymbol{R}\boldsymbol{\omega}_B)+ \boldsymbol{R}\boldsymbol{v}_B
$$

矩阵形式：

$$
\boldsymbol{T}_A
=
\begin{bmatrix}
\boldsymbol{\omega}_A\\
\boldsymbol{v}_A
\end{bmatrix}
=
\begin{bmatrix}
\boldsymbol{R} & \boldsymbol{0}_{3\times3}\\
[\boldsymbol{t}]\boldsymbol{R} & \boldsymbol{R}
\end{bmatrix}
\begin{bmatrix}
\boldsymbol{\omega}_B\\
\boldsymbol{v}_B
\end{bmatrix}
=
\operatorname{Ad}_{\boldsymbol{T}_{AB}}
\boldsymbol{T}_B
$$

> **推导**：原部 $\boldsymbol{\omega}$
是角速度自由矢量，与坐标原点位置无关，仅受旋转作用，因此：
>
> $$
> \boldsymbol{\omega}_A
> =
> \boldsymbol{R}\boldsymbol{\omega}_B
> $$
>
> 对偶部 $\boldsymbol{v}$
表示刚体在坐标原点处的瞬时线速度，其结构为：
>
> $$
> \boldsymbol{v}
> =
> \boldsymbol{r}\times\boldsymbol{\omega}
> +
> h\boldsymbol{\omega}
> $$
>
> 其中：
>
> - $h\boldsymbol{\omega}$ 为沿螺旋轴方向的滑移速度；
> - $\boldsymbol{r}\times\boldsymbol{\omega}$ 为绕轴转动在原点处产生的线速度。
>
> 坐标系变换后，参考原点发生变化，因此：
>
> $$
> \boldsymbol{r}_A
> =
> \boldsymbol{R}\boldsymbol{r}_B
> +
> \boldsymbol{t}
> $$
>
> 在 $\{A\}$ 中，原点处速度为：
>
> $$
> \begin{aligned}
> \boldsymbol{r}_A\times\boldsymbol{\omega}_A
> &=
> (\boldsymbol{R}\boldsymbol{r}_B+\boldsymbol{t})
> \times
> (\boldsymbol{R}\boldsymbol{\omega}_B)
> \\
> &=
> \boldsymbol{R}
> (\boldsymbol{r}_B\times\boldsymbol{\omega}_B)
> +
> \boldsymbol{t}\times
> (\boldsymbol{R}\boldsymbol{\omega}_B)
> \end{aligned}
> $$
>
> 其中利用了：
>
> $$
> (\boldsymbol{R}\boldsymbol{a})
> \times
> (\boldsymbol{R}\boldsymbol{b})
> =
> \boldsymbol{R}
> (\boldsymbol{a}\times\boldsymbol{b})
> $$
>
> 又因为：
>
> $$
> \boldsymbol{R}(h\boldsymbol{\omega}_B)
> =
> h(\boldsymbol{R}\boldsymbol{\omega}_B)
> $$
>
> 因此：
>
> $$
> \begin{aligned}
> \boldsymbol{v}_A
> &=
> \boldsymbol{r}_A\times\boldsymbol{\omega}_A
> +
> h\boldsymbol{\omega}_A
> \\
> &=
> \Big[
> \boldsymbol{R}
> (\boldsymbol{r}_B\times\boldsymbol{\omega}_B)
> +
> \boldsymbol{t}\times
> (\boldsymbol{R}\boldsymbol{\omega}_B)
> \Big]
> +
> \boldsymbol{R}(h\boldsymbol{\omega}_B)
> \\
> &=
> \boldsymbol{R}
> (\boldsymbol{r}_B\times\boldsymbol{\omega}_B+h\boldsymbol{\omega}_B)
> +
> \boldsymbol{t}\times
> (\boldsymbol{R}\boldsymbol{\omega}_B)
> \\
> &=
> \boldsymbol{R}\boldsymbol{v}_B
> +
> \boldsymbol{t}\times
> (\boldsymbol{R}\boldsymbol{\omega}_B)
> \end{aligned}
> $$
>
> 其中：
>
> - $\boldsymbol{R}\boldsymbol{v}_B$ 为原线速度的旋转变换；
> - $\boldsymbol{t}\times(\boldsymbol{R}\boldsymbol{\omega}_B)$ 为坐标原点平移后，由角速度产生的附加线速度。


## 2. 力旋量{#力旋量}

### 2.1 Poinsot 定理{#Poinsot-定理}

Poinsot 定理：作用在刚体上的任意力系均可合成为一个沿某直线的集中力与绕该直线的力偶——力系总可简化为一个**力旋量**。

力旋量由集中力 $\boldsymbol{f}$ 与力矩 $\boldsymbol{m}$ 组成：

$$
\boldsymbol{F} = \begin{bmatrix} \boldsymbol{f} \\ \boldsymbol{m} \end{bmatrix}
= (f_x, f_y, f_z;\; m_x, m_y, m_z)
$$
$$
\boldsymbol{m}= \boldsymbol{r} \times \boldsymbol{f}+ h \boldsymbol{f}
$$

其中

| 符号                                     | 含义           | 几何解释                                                                                  |
|----------------------------------------|--------------|---------------------------------------------------------------------------------------|
| $\boldsymbol{f}$                       | 力系主矢         | 螺旋力的主力分量，方向即螺旋轴方向                                                                     |
| $\boldsymbol{m}$                       | 关于坐标原点的主矩    | 螺旋力在原点处产生的总力矩                                                                         |
| $\boldsymbol{r}$                       | 螺旋轴线上一点的位置矢量 | 确定螺旋力作用轴线在空间中的位置                                                                      |
| $h$                                    | 力旋量节距        | 力偶与主力之比：$h = (\boldsymbol{f}\cdot\boldsymbol{m})/(\boldsymbol{f}\cdot\boldsymbol{f})$ |
| $\boldsymbol{r} \times \boldsymbol{f}$ | 主矢对原点产生的力矩   | 即力作用线对原点的力矩                                                                           |
| $h\boldsymbol{f}$                      | 与主矢共线的自由力偶分量 | 不依赖参考点位置的自由力偶（自由矢量）                                                                   |

一个力旋量本质上同样是用一个**螺旋力**表示一个**空间力系**：该力系的主矢为$\boldsymbol{f}$，作用轴线是旋量轴线
，在原点处的主矩为 $\boldsymbol{m}$。
该力系在空间中任意点 $\boldsymbol{p}$ 的等效均可由该旋量重建：

$$
\boldsymbol{f}_p = \boldsymbol{f}
$$

$$
\boldsymbol{m}_p =\boldsymbol{m}-\boldsymbol{p} \times \boldsymbol{f}
$$


> **证明**：
> 此力系在空间中任意一点$\boldsymbol{p}$等效如下：
> $$主矢: \boldsymbol{f}_p= \boldsymbol{f} $$
> $$主矩: \boldsymbol{m}_p=(\boldsymbol{r}-\boldsymbol{p}) \times \boldsymbol{f} +h \times \boldsymbol{f}$$
> 展开得：
> $$\boldsymbol{m}_p= \underbrace{\boldsymbol{r} \times \boldsymbol{f} +h \times \boldsymbol{f}}_{=\boldsymbol{m}}-\boldsymbol{p} \times \boldsymbol{f} $$


运动旋量与力旋量的对偶：

| 对象   | 坐标类型 | 主部                         | 副部                    | $h=0$    | $h=\infty$ |
|------|------|----------------------------|-----------------------|----------|------------|
| 运动旋量 | 射线坐标 | $\boldsymbol{\omega}$（角速度） | $\boldsymbol{v}$（线速度） | 纯转动（线矢量） | 纯平动（偶量）    |
| 力旋量  | 轴线坐标 | $\boldsymbol{f}$（力）        | $\boldsymbol{m}$（力矩）  | 纯力（线矢量）  | 纯力偶（偶量）    |
### 2.2 不同力系情况{#不同力系情况}

#### a. 纯力{#纯力}

集中力 $\boldsymbol{f}$ 作用于一轴线上， $\boldsymbol{r}$为轴线上一点位矢。
其对坐标原点的力矩为 $\boldsymbol{m} = \boldsymbol{r} \times \boldsymbol{f}$。节距 $h = 0$，力旋量退化为**线矢量**：

$$
\boldsymbol{F} = \begin{bmatrix} \boldsymbol{f} \\ \boldsymbol{r} \times \boldsymbol{f} \end{bmatrix}
$$

六个 $Plücker$ 坐标中前三个给力的方向，后三个给力作用线的位置。

#### b. 纯力偶{#纯力偶}

力偶（大小相等、方向相反、不共线的两力）合力为零，合力矩为非零自由矢量。节距 $h = \infty$，力旋量退化为**偶量**：

$$
\boldsymbol{F}= \begin{bmatrix} \boldsymbol{0} \\ h\boldsymbol{f} \end{bmatrix}
$$

纯力偶无确定的作用线，可平移到刚体上任意位置而不改变力学效果——这与纯平动运动旋量（偶量）一致。
#### c. 一般力系{#一般力系}

一般力系可分解为纯力（线矢量）与纯力偶（偶量）的同轴叠加（Poinsot 定理）：

$$
\boldsymbol{F} = f \underbrace{\begin{bmatrix} \hat{\boldsymbol{s}} \\ \boldsymbol{r} \times \hat{\boldsymbol{s}}
\end{bmatrix}}_{\text{纯力分量}}
+ fh \underbrace{\begin{bmatrix} \boldsymbol{0} \\ \hat{\boldsymbol{s}} \end{bmatrix}}_{\text{纯力偶分量}}
  = f \begin{bmatrix} \hat{\boldsymbol{s}} \\ \boldsymbol{r} \times \hat{\boldsymbol{s}} + h\hat{\boldsymbol{s}}
  \end{bmatrix}
  $$

### 2.3 力旋量的坐标变换{#力旋量的坐标变换}

设坐标系 $\{B\}$ 到 $\{A\}$ 的旋转矩阵为 $\boldsymbol{R}$，平移矢量为 $\boldsymbol{t}$。
$\boldsymbol{F}_B = (\boldsymbol{f}_B; \boldsymbol{m}_B)$ 为力旋量在 $\{B\}$ 中的表示。

分量形式：
$$\boldsymbol{f}_A = \boldsymbol{R}\boldsymbol{f}_B$$
$$\boldsymbol{m}_A = \boldsymbol{t} \times (\boldsymbol{R}\boldsymbol{f}_B) + \boldsymbol{R}\boldsymbol{m}_B$$

矩阵形式：
$$
\boldsymbol{F}_B = \begin{bmatrix} \boldsymbol{f}_B \\ \boldsymbol{m}_B \end{bmatrix}
= \begin{bmatrix}
\boldsymbol{R} & \boldsymbol{0}_{3\times3} \\
[\boldsymbol{t}]\boldsymbol{R} & \boldsymbol{R}
\end{bmatrix}
\begin{bmatrix} \boldsymbol{f}_A \\ \boldsymbol{m}_A \end{bmatrix}
= \operatorname{Ad}_{\boldsymbol{T}_{AB}} \boldsymbol{F}_A
$$

> **推导**：主矢 $\boldsymbol{f}$
是自由矢量，与参考点位置无关，仅受旋转作用，因此：
>
> $$
> \boldsymbol{f}_A = \boldsymbol{R}\boldsymbol{f}_B
> $$
>
> 对偶部 $\boldsymbol{m}$
表示空间力系关于坐标原点的主矩，其结构为：
>
> $$
> \boldsymbol{m}
> =
> \boldsymbol{r}\times\boldsymbol{f}
> +
> h\boldsymbol{f}
> $$
>
> 其中：
>
> - $h\boldsymbol{f}$ 是自由力偶，仅受旋转；
> - $\boldsymbol{r}\times\boldsymbol{f}$ 是力作用线对坐标原点的矩。
>
> 坐标系变换后，参考原点发生变化，因此：
>
> $$
> \boldsymbol{r}_A
> =
> \boldsymbol{R}\boldsymbol{r}_B
> +
> \boldsymbol{t}
> $$
>
> 在 $\{A\}$ 中，力矩为：
>
> $$
> \begin{aligned}
> \boldsymbol{r}_A \times \boldsymbol{f}_A
> &=
> (\boldsymbol{R}\boldsymbol{r}_B+\boldsymbol{t})
> \times
> (\boldsymbol{R}\boldsymbol{f}_B)
> \\
> &=
> \boldsymbol{R}(\boldsymbol{r}_B\times\boldsymbol{f}_B)
> +
> \boldsymbol{t}\times(\boldsymbol{R}\boldsymbol{f}_B)
> \end{aligned}
> $$
>
> 其中利用了：
>
> $$
> (\boldsymbol{R}\boldsymbol{a})
> \times
> (\boldsymbol{R}\boldsymbol{b})
> =
> \boldsymbol{R}
> (\boldsymbol{a}\times\boldsymbol{b})
> $$
>
> 又因为：
>
> $$
> \boldsymbol{R}(h\boldsymbol{f}_B)
> =
> h(\boldsymbol{R}\boldsymbol{f}_B)
> $$
>
> 因此：
>
> $$
> \begin{aligned}
> \boldsymbol{m}_A
> &=
> \boldsymbol{r}_A\times\boldsymbol{f}_A
> +
> h\boldsymbol{f}_A
> \\
> &=
> \Big[
> \boldsymbol{R}(\boldsymbol{r}_B\times\boldsymbol{f}_B)
> +
> \boldsymbol{t}\times(\boldsymbol{R}\boldsymbol{f}_B)
> \Big]
> +
> \boldsymbol{R}(h\boldsymbol{f}_B)
> \\
> &=
> \boldsymbol{R}
> (\boldsymbol{r}_B\times\boldsymbol{f}_B+h\boldsymbol{f}_B)
> +
> \boldsymbol{t}\times(\boldsymbol{R}\boldsymbol{f}_B)
> \\
> &=
> \boldsymbol{R}\boldsymbol{m}_B
> +
> \boldsymbol{t}\times(\boldsymbol{R}\boldsymbol{f}_B)
> \end{aligned}
> $$

## 3. 运动副旋量{#运动副旋量}

运动副（关节）允许两构件间沿特定方向产生相对运动。运动副允许的相对运动速度旋量，单位化后，构成一速度旋量空间，使用此旋量空间可用于表示运动副，称为
**运动副旋量**。

| 运动副 | 符号表示                                           | 备注                                          | 旋量表示                                                                                               | 含义           |
|-----|------------------------------------------------|---------------------------------------------|----------------------------------------------------------------------------------------------------|--------------|
| 移动副 | $T(\boldsymbol{u})$                            | 沿方向 $\boldsymbol{u}$ 的纯平移副                  | $\left\{(0,\boldsymbol{u})^T\right\}$                                                              | 纯平动          |
| 旋转副 | $R(N,\boldsymbol{u})$                          | 过点 $N$、方向为 $\boldsymbol{u}$ 的转动副            | $\left\{(\boldsymbol{u},N\times\boldsymbol{u})^T\right\}$                                          | 纯转动          |
| 螺旋副 | $H_{\rho}(N,\boldsymbol{u})$                   | 过点 $N$、方向为 $\boldsymbol{u}$、节距为 $\rho$ 的螺旋副 | $\left\{(\boldsymbol{u},N\times\boldsymbol{u}+\rho\boldsymbol{u})^T\right\}$                       | 螺旋运动         |
| 万向副 | $R(N,\boldsymbol{u})\cdot R(N,\boldsymbol{v})$ | 两个相交于点 $N$ 的转动副组成的二自由度运动副                   | $\left\{(\boldsymbol{u},N\times\boldsymbol{u})^T,(\boldsymbol{v},N\times\boldsymbol{v})^T\right\}$ | 两个独立的纯转动     |
| 圆柱副 | $C(N,\boldsymbol{u})$                          | 过点 $N$、方向为 $\boldsymbol{u}$ 的转动与移动复合运动副     | $\left\{(\boldsymbol{u},N\times\boldsymbol{u})^T,(0,\boldsymbol{u})^T\right\}$                     | 相互独立的纯转动与纯平动 |
| 球副  | $S(N)$                                         | 所有转轴交于点 $N$ 的三自由度转动副                        | $\left\{(x,N\times x)^T,(y,N\times y)^T,(z,N\times z)^T\right\}$                                   | 三个独立的纯转动     |

> 注：上表中的运动副旋量均默认在运动副自身的局部坐标系下建立，坐标原点通常取在运动副轴线上一点（或运动中心处），坐标轴方向尽量与运动副的运动轴重合。

## 4. 做功与约束的旋量表述{#做功与约束的旋量表述}

前文分别建立了运动旋量（描述速度）和力旋量（描述力），其互易积的物理意义是瞬时功率，互易积为零对应理想约束。

### 4.1 瞬时功{#瞬时功}

力旋量 $\boldsymbol{F} = (\boldsymbol{f}; \boldsymbol{m})$
作用在以运动旋量 $\boldsymbol{T} = (\boldsymbol{\omega}; \boldsymbol{v})$ 运动的刚体上，其**瞬时功率**为：

$$
\delta W = \boldsymbol{F} \circ \boldsymbol{T} = \boldsymbol{f} \cdot \boldsymbol{v} + \boldsymbol{m} \cdot \boldsymbol{\omega}
$$

互易积在坐标变换下保持不变（参见[旋量坐标变换](./robot-kinematics-01-basic.md#坐标变换)），因此瞬时功 $\delta W$
不依赖坐标系选取。

### 4.2 约束力旋量{#约束力旋量}

力旋量 $\boldsymbol{F} = (\boldsymbol{f}; \boldsymbol{m})$
与运动旋量 $\boldsymbol{T} = (\boldsymbol{\omega}; \boldsymbol{v})$，若其互易积（瞬时功）为零：

$$
\boldsymbol{F} \circ \boldsymbol{T} = \boldsymbol{f} \cdot \boldsymbol{v} + \boldsymbol{m} \cdot \boldsymbol{\omega} = 0
$$

则称它们互为**互易旋量**。

**物理含义**：若 $\boldsymbol{F} \circ \boldsymbol{T} = 0$，则无论该力旋量中的力或力矩有多大，都**不会对刚体做功**
，也不能改变该约束下刚体的运动状态。此时力旋量 $\boldsymbol{F}$ 称为运动旋量 $\boldsymbol{T}$ 的**约束力旋量**（
`constraint wrench`），对应的是**理想约束**（`ideal constraint`）——约束某个方向的运动，但不在允许的运动方向上产生阻力。

| 力类型 $\backslash$ 运动类型                                                   | 纯转动 $\boldsymbol{T}=(\boldsymbol{\omega};\boldsymbol{r}\times\boldsymbol{\omega})$                      | 纯平动 $\boldsymbol{T}=(0;\boldsymbol{v})$   | 一般螺旋运动 $\boldsymbol{T}=(\boldsymbol{\omega};\boldsymbol{v})$                 |
|-------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|-------------------------------------------|------------------------------------------------------------------------------|
| 纯力 $\boldsymbol{F}=(\boldsymbol{f};\boldsymbol{r}\times\boldsymbol{f})$ | 力作用线过转轴 (转动副)                                                                                           | $\boldsymbol{f}\perp\boldsymbol{v}$ (移动副) | $\boldsymbol{f}\cdot\boldsymbol{v}=0$                                        |
| 纯力偶 $\boldsymbol{F}=(0;\boldsymbol{m})$                                 | $\boldsymbol{m}\perp\boldsymbol{\omega}$                                                                | 恒互易                                       | $\boldsymbol{\omega}\cdot\boldsymbol{m}=0$                                   |
| 一般力旋量 $\boldsymbol{F}=(\boldsymbol{f};\boldsymbol{m})$                  | $\boldsymbol{f}\cdot(\boldsymbol{r}\times\boldsymbol{\omega})+\boldsymbol{\omega}\cdot\boldsymbol{m}=0$ | $\boldsymbol{f}\cdot\boldsymbol{v}=0$     | $\boldsymbol{f}\cdot\boldsymbol{v}+\boldsymbol{\omega}\cdot\boldsymbol{m}=0$ |

## 小结{#小结}

旋量将运动、力和运动副统一在六维代数框架下，三类对象的互易关系（瞬时功 = 0 $\Leftrightarrow$ 约束）是机构分析的核心逻辑：

| 对象    | 主部                                | 副部                                                                                | $h=0$ 退化 | $h=\infty$ 退化 | 坐标类型 |
|-------|-----------------------------------|-----------------------------------------------------------------------------------|----------|---------------|------|
| 运动旋量  | $\boldsymbol{\omega}$（角速度）        | $\boldsymbol{v} = \boldsymbol{r}\times\boldsymbol{\omega} + h\boldsymbol{\omega}$ | 纯转动（线矢量） | 纯平动（偶量）       | 射线坐标 |
| 力旋量   | $\boldsymbol{f}$（力）               | $\boldsymbol{m} = \boldsymbol{r}\times\boldsymbol{f} + h\boldsymbol{f}$           | 纯力（线矢量）  | 纯力偶（偶量）       | 轴线坐标 |
| 运动副旋量 | 单位转动： $\hat{\boldsymbol{\omega}}$ | 单位平动：$\hat{\boldsymbol{v}}$                                                       | R 副      | P 副           | 射线坐标 |
