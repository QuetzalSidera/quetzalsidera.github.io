---
title: 4.3 - 运动学分析
date: 2026-05-27T10:00:00
tags: [ 机器人, 机构学, 运动学 ]
pinned: false
collection: 机器人机构学
outline:
  - title: 1. 运动学问题
    slug: 运动学问题
  - title: 2. D-H参数与坐标变换
    slug: DH参数与坐标变换
  - title: 2.1 D-H参数定义
    slug: DH参数定义
    level: 1
  - title: 2.2 连杆坐标变换
    slug: 连杆坐标变换
    level: 1
  - title: 3. 串联机器人正运动学
    slug: 串联机器人正运动学
  - title: 3.1 D-H参数法
    slug: DH参数法
    level: 1
  - title: 3.2 POE公式
    slug: POE公式
    level: 1
  - title: 4. 串联机器人逆运动学
    slug: 串联机器人逆运动学
  - title: 4.1 逆运动学特点
    slug: 逆运动学特点
    level: 1
  - title: 4.2 代数法
    slug: 代数法
    level: 1

  - title: 5. 并联机构位置逆解
    slug: 并联机构位置逆解
  - title: 6. 基于POE的速度雅可比
    slug: 基于POE的速度雅可比
  - title: 6.1 雅可比矩阵的定义
    slug: 雅可比矩阵的定义
    level: 1
  - title: 6.2 空间速度雅可比
    slug: 空间速度雅可比
    level: 1
  - title: 6.3 物体速度雅可比
    slug: 物体速度雅可比
    level: 1
  - title: 7. 工作空间分析
    slug: 工作空间分析
  - title: 7.1 串联机构的工作空间
    slug: 串联机构的工作空间
    level: 1
  - title: 小结
    slug: 小结
head:
  - - meta
    - name: description
      content: 机器人机构学系列第十一篇，介绍机器人运动学分析基础——D-H参数法与连杆坐标变换、串联机器人正运动学（D-H法与POE公式）、串联机器人逆运动学（Paden-Kahan子问题）、并联机构位置逆解、基于POE的速度雅可比矩阵、工作空间分析（可达/灵巧工作空间）。
  - - meta
    - name: keywords
      content: 机器人机构学, 运动学, D-H参数, 正运动学, 逆运动学, POE公式, 指数积, Paden-Kahan, 速度雅可比, 工作空间, 并联机构, 串联机器人
---

运动学分析的任务：建立关节输入与末端输出的映射关系。正运动学由关节变量求末端位姿，逆运动学由末端位姿求关节变量。

---

本篇承接[构型综合](./robot-kinematics-10-type-synthesis.md)
，在机构构型确定后，需要讨论其运动学建模与求解。重点包括串联机构的正解与逆解、并联机构的逆解、基于POE的速度雅可比，以及工作空间分析。

## 1. 运动学问题 {#运动学问题}

机器人运动学仅考察运动的几何属性（位移、速度、加速度），不考虑运动过程中施加的力。

正运动学与逆运动学的基本对应：

|          | 正运动学                                    | 逆运动学                                    |
|----------|-----------------------------------------|-----------------------------------------|
| **输入**   | 关节变量 $(\theta, d)$                      | 末端位姿 $(\boldsymbol{R}, \boldsymbol{p})$ |
| **输出**   | 末端位姿 $(\boldsymbol{R}, \boldsymbol{p})$ | 关节变量 $(\theta, d)$                      |
| **串联机构** | 唯一解，求解简单                                | 多解，求解复杂                                 |
| **并联机构** | 多解，求解复杂                                 | 通常较简单                                   |

串联机构位置正解易于处理，逆解相对困难；并联机构位置正解处理困难，逆解相对容易，但部分少自由度并联机构的逆解也较复杂。

分析方法分为两类：

| 方法      | 思路                              | 优点         | 缺点               |
|---------|---------------------------------|------------|------------------|
| **解析法** | 建立约束方程组，消去中间参数得到单参数多项式          | 可求得全部解     | 难度大，无通用性         |
| **数值法** | 用数值逼近求解非线性方程组（如Newton-Raphson法） | 求解速度快，适用性广 | 一般不能得到全部解，依赖初值选取 |

## 2. D-H参数与坐标变换 {#DH参数与坐标变换}

### 2.1 D-H参数定义 {#DH参数定义}

D-H参数法由 Denavit 和 Hartenberg 于 1955 年提出，为串联机器人每个关节处建立连杆坐标系。前置坐标系（改进D-H法，Khalil &
Kleinfinger, 1986）将连杆坐标系 $i$ 固连在关节 $i$ 上（靠近基座一侧）。

四个D-H参数：

| 参数   | 符号             | 定义                                                                                               | 性质              |
|------|----------------|--------------------------------------------------------------------------------------------------|-----------------|
| 连杆长度 | $a_{i-1}$      | 沿 $\boldsymbol{x}_{i-1}$ 轴，从 $\boldsymbol{z}_{i-1}$ 移动到 $\boldsymbol{z}_i$ 的距离                   | 结构参数（常值）        |
| 连杆扭角 | $\alpha_{i-1}$ | 绕 $\boldsymbol{x}_{i-1}$ 轴，从 $\boldsymbol{z}_{i-1}$ 旋转到 $\boldsymbol{z}_i$ 的角度，取值 $\pm 90^\circ$ | 结构参数（常值）        |
| 关节偏距 | $d_i$          | 沿 $\boldsymbol{z}_i$ 轴，从 $\boldsymbol{x}_{i-1}$ 移动到 $\boldsymbol{x}_i$ 的距离                       | 移动关节为变量，转动关节为常值 |
| 关节转角 | $\theta_i$     | 绕 $\boldsymbol{z}_i$ 轴，从 $\boldsymbol{x}_{i-1}$ 旋转到 $\boldsymbol{x}_i$ 的角度                       | 转动关节为变量，移动关节为常值 |

连杆坐标系建立规则：

| 坐标系              | 规则                                                                                                                                 |
|------------------|------------------------------------------------------------------------------------------------------------------------------------|
| **中间连杆** $\{i\}$ | 原点取在 $a_i$ 与关节轴 $\boldsymbol{z}_i$ 的交点；$\boldsymbol{z}_i$ 沿关节轴线方向；$\boldsymbol{x}_i$ 沿 $a_i$ 指向关节 $i+1$；$\boldsymbol{y}_i$ 由右手定则确定 |
| **基座** $\{0\}$   | 原点与 $\{1\}$ 原点重合；$\boldsymbol{z}_0$ 与 $\boldsymbol{z}_1$ 重合；$q_1 = 0$ 时 $\boldsymbol{x}_0$ 与 $\boldsymbol{x}_1$ 重合                 |
| **末端连杆** $\{n\}$ | 原点在 $a_{n-1}$ 与关节 $n$ 轴线的交点；$\boldsymbol{z}_n$ 与关节 $n$ 轴线重合；$q_n = 0$ 时 $\boldsymbol{x}_n$ 与 $\boldsymbol{x}_{n-1}$ 共线同向           |

前置坐标系与后置坐标系（标准D-H法）的区别：前置坐标系将连杆坐标系建在靠近基座的关节上（参数下标为 $i-1$ 和 $i$
混合），后置坐标系建在远离基座的关节上（参数下标统一为 $i$）。前置坐标系的关节变量表达更直观，使用更广泛。

### 2.2 连杆坐标变换 {#连杆坐标变换}

从坐标系 $\{i-1\}$ 到 $\{i\}$ 的齐次变换经四步完成（均相对动坐标系，矩阵从左到右相乘）：

1. 绕 $\boldsymbol{x}_{i-1}$ 旋转 $\alpha_{i-1}$：$\text{Rot}(x, \alpha_{i-1})$
2. 沿 $\boldsymbol{x}_{i-1}$ 平移 $a_{i-1}$：$\text{Trans}(x, a_{i-1})$
3. 绕 $\boldsymbol{z}_i$ 旋转 $\theta_i$：$\text{Rot}(z, \theta_i)$
4. 沿 $\boldsymbol{z}_i$ 平移 $d_i$：$\text{Trans}(z, d_i)$

D-H矩阵：

$$
{}^{i-1}\boldsymbol{T}_i =
\begin{bmatrix}
\cos\theta_i & -\sin\theta_i & 0 & a_{i-1} \\
\sin\theta_i \cos\alpha_{i-1} & \cos\theta_i \cos\alpha_{i-1} & -\sin\alpha_{i-1} & -d_i \sin\alpha_{i-1} \\
\sin\theta_i \sin\alpha_{i-1} & \cos\theta_i \sin\alpha_{i-1} & \cos\alpha_{i-1} & d_i \cos\alpha_{i-1} \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

## 3. 串联机器人正运动学 {#串联机器人正运动学}

串联机器人位移正解：已知各关节变量，求末端执行器的位姿。由于各关节运动相互独立，将各级D-H矩阵按顺序相乘即可得到末端位姿。

### 3.1 D-H参数法 {#DH参数法}

对于 $n$ 自由度串联机器人：

$$
{}^{0}\boldsymbol{T}_n = {}^{0}\boldsymbol{T}_1(\theta_1) \; {}^{1}\boldsymbol{T}_2(\theta_2) \; \cdots \; {}^{n-1}\boldsymbol{T}_n(\theta_n)
$$

末端位姿形式：

$$
{}^{0}\boldsymbol{T}_n = \begin{bmatrix}
\boldsymbol{R} & \boldsymbol{p} \\
\boldsymbol{0} & 1
\end{bmatrix}
= \begin{bmatrix}
n_x & o_x & a_x & p_x \\
n_y & o_y & a_y & p_y \\
n_z & o_z & a_z & p_z \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

平面3R机器人（前置坐标系），将 $D_H$ 矩阵连乘得：

$$
{}^{0}\boldsymbol{T}_3 = \begin{bmatrix}
\cos\theta_{123} & -\sin\theta_{123} & 0 & l_1\cos\theta_1 + l_2\cos\theta_{12} \\
\sin\theta_{123} & \cos\theta_{123} & 0 & l_1\sin\theta_1 + l_2\sin\theta_{12} \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

其中 $\theta_{12} = \theta_1 + \theta_2$，$\theta_{123} = \theta_1 + \theta_2 + \theta_3$
。末端位姿描述为 $(x, y, \varphi) = (l_1c_1 + l_2c_{12},\; l_1s_1 + l_2s_{12},\; \theta_{123})$。

SCARA机器人（后置坐标系）：

$$
{}^{0}\boldsymbol{T}_4 = \begin{bmatrix}
\cos\theta_{123} & -\sin\theta_{123} & 0 & -l_1\sin\theta_1 - l_2\sin\theta_{12} \\
\sin\theta_{123} & \cos\theta_{123} & 0 & l_1\cos\theta_1 + l_2\cos\theta_{12} \\
0 & 0 & -1 & d_1 - d_3 - d_4 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

### 3.2 POE公式 {#POE公式}

指数积公式（Product of Exponentials）由 Brockett 于 1983 年提出。与 D-H 参数法相比，POE
公式无需建立各中间连杆坐标系，仅需惯性坐标系 $\{S\}$ 和工具坐标系 $\{T\}$ 两个坐标系。

在给出 POE 公式之前，先回顾旋量理论中两个关键工具：

> **Rodrigues 公式与空间任意轴的转动**（见[坐标变换基础](./robot-kinematics-02-space.md)）
>
> 绕过原点的单位轴 $\hat{\boldsymbol{\omega}}$ 旋转 $\theta$ 的角度，其旋转矩阵由 Rodrigues 公式给出：
>
> $$
> R_{\hat{\boldsymbol{\omega}}}(\theta) = e^{[\hat{\boldsymbol{\omega}}]\theta} = I + [\hat{\boldsymbol{\omega}}]\sin\theta + [\hat{\boldsymbol{\omega}}]^2(1 - \cos\theta)
> $$
>
> 对于空间任意轴（不经过原点），轴的位置用轴线上一点 $\boldsymbol{r}$ 指定。该转动用齐次矩阵表示为：
>
> $$
> e^{[\boldsymbol{\xi}]\theta} = \begin{bmatrix}
> e^{[\hat{\boldsymbol{\omega}}]\theta} & (\boldsymbol{I} - e^{[\hat{\boldsymbol{\omega}}]\theta})\boldsymbol{r} \\
> \boldsymbol{0} & 1
> \end{bmatrix}
> $$
>
> 其中 $\boldsymbol{\xi} = (\boldsymbol{\omega}; \boldsymbol{r} \times \boldsymbol{\omega})$ 为描述该空间轴线的**单位运动旋量坐标**。
> $\boldsymbol{\omega} = \theta\hat{\boldsymbol{\omega}}$
> 综合了转轴方向与转角大小。上式将旋转矩阵的指数映射推广到了机构关节的刚体运动描述。
>
> **旋量坐标变换与伴随变换矩阵**（见[旋量理论基础](./robot-kinematics-03-spinor-basic.md)）
>
> 设坐标系 $\{A\}$ 到 $\{B\}$ 的齐次变换为 $\boldsymbol{T}_{AB} = \begin{bmatrix} \boldsymbol{R} & \boldsymbol{t} \\ \boldsymbol{0} & 1 \end{bmatrix}$，
> 旋量 $\boldsymbol{\$} = (\boldsymbol{s}; \boldsymbol{s}^0)$ 在两坐标系中的坐标满足：
>
> $$
> \boldsymbol{\$}_B = \operatorname{Ad}_{\boldsymbol{T}_{AB}} \boldsymbol{\$}_A,\quad
> \operatorname{Ad}_{\boldsymbol{T}} =
> \begin{bmatrix}
> \boldsymbol{R} & \boldsymbol{0} \\
> [\boldsymbol{t}]\boldsymbol{R} & \boldsymbol{R}
> \end{bmatrix}_{6\times 6}
> $$
>
> $\operatorname{Ad}_{\boldsymbol{T}}$ 称为**伴随变换矩阵**，它将旋量在 $\{A\}$ 中的坐标"传递"到 $\{B\}$
> 中。伴随变换是 POE 公式中处理关节顺序无关性和坐标变换的核心工具。

第 $i$ 个关节的单位运动旋量坐标：

| 关节类型 | $\boldsymbol{\xi}_i$                                                                                   |
|------|--------------------------------------------------------------------------------------------------------|
| 转动副  | $\begin{bmatrix} \boldsymbol{\omega}_i \\ \boldsymbol{r}_i \times \boldsymbol{\omega}_i \end{bmatrix}$ |
| 移动副  | $\begin{bmatrix} \boldsymbol{0} \\ \boldsymbol{v}_i \end{bmatrix}$                                     |

其中 $\boldsymbol{\omega}_i$ 为关节轴线单位方向向量，$\boldsymbol{r}_i$ 为轴线上任一点的位置向量。

记末端位姿矩阵为 $\boldsymbol{g}(\boldsymbol{\theta}) = {}^{S}\boldsymbol{T}_T(\boldsymbol{\theta})$
，正运动学的 POE 公式为：

$$
\boldsymbol{g}(\boldsymbol{\theta}) = e^{[\boldsymbol{\xi}_1]\theta_1} e^{[\boldsymbol{\xi}_2]\theta_2} \cdots e^{[\boldsymbol{\xi}_n]\theta_n} \; \boldsymbol{g}(\boldsymbol{0})
$$

$\boldsymbol{g}(\boldsymbol{0})$ 为机器人在零位（所有关节变量为 $0$
）时工具坐标系相对惯性坐标系的位姿矩阵。若将惯性坐标系取在与零位工具坐标系重合的位置，则 $\boldsymbol{g}(\boldsymbol{0}) = \boldsymbol{I}$
，公式简化为：

$$
\boldsymbol{g}(\boldsymbol{\theta}) = e^{[\boldsymbol{\xi}_1]\theta_1} e^{[\boldsymbol{\xi}_2]\theta_2} \cdots e^{[\boldsymbol{\xi}_n]\theta_n}
$$

转动关节的矩阵指数（由 Rodrigues 公式推广得到）：

$$
e^{[\boldsymbol{\xi}]\theta} = \begin{bmatrix}
e^{[\boldsymbol{\omega}]\theta} & (\boldsymbol{I} - e^{[\boldsymbol{\omega}]\theta})(\boldsymbol{r} \times \boldsymbol{\omega}) + \boldsymbol{\omega}\boldsymbol{\omega}^{\mathrm{T}}\boldsymbol{r}\theta \\
\boldsymbol{0} & 1
\end{bmatrix}
$$

POE 公式与运动副顺序无关——任意交换关节运动顺序，最终结果不变。这一性质由伴随变换保证：

$$
e^{[\boldsymbol{\xi}_2]\theta_2} e^{[\boldsymbol{\xi}_1]\theta_1} = e^{[\boldsymbol{\xi}_1]\theta_1} e^{[\text{Ad}_{e^{[\boldsymbol{\xi}_1]\theta_1}} \boldsymbol{\xi}_2]\theta_2}
$$

D-H参数与运动旋量坐标之间不存在一一映射关系：每个运动副的旋量坐标是相对惯性坐标系描述的（需 6
个参数），不能直接反映相邻杆件之间的相对运动（D-H参数仅需 4 个参数）。两者的转换关系：

$$
\boldsymbol{\xi}_i = \text{Ad}_{{}^{0}\boldsymbol{T}_{i-1}(\boldsymbol{0})} \boldsymbol{\xi}_i'
$$

| 特性      | D-H参数法       | POE公式            |
|---------|--------------|------------------|
| 所需坐标系   | $n+1$ 个连杆坐标系 | 仅惯性系与工具系 2 个     |
| 参数个数/关节 | 4 个          | 6 个（旋量坐标）        |
| 几何直观性   | 较弱（依赖坐标系定义）  | 强（直接描述关节轴线的空间位置） |
| 奇异性处理   | 需特殊处理        | 无坐标系奇异性问题        |
| 数值稳定性   | 较好           | 较好               |

## 4. 串联机器人逆运动学 {#串联机器人逆运动学}

串联机器人位移反解：给定末端工具坐标系的期望位形 ${}^{S}\boldsymbol{T}_T$
，求解对应的关节变量 $(\theta_1, \theta_2, \ldots, \theta_n)^{\mathrm{T}}$。

$$
\theta_i = f_i^{-1}({}^{S}\boldsymbol{T}_T), \quad i = 1, 2, \ldots, n
$$

### 4.1 逆运动学特点 {#逆运动学特点}

与正运动学相比，逆运动学求解要复杂得多：

| 特点         | 原因                                 |
|------------|------------------------------------|
| **非线性**    | 关节变量相互耦合，方程中含有大量反三角函数，可能产生超越方程     |
| **多解性**    | 同一末端位姿通常对应多组关节构型，解的数量取决于运动学方程的最高次数 |
| **可能无解**   | 给定位姿超出工作空间时无可行解                    |
| **可能无穷多解** | 运动学冗余时（自由度多于任务空间维数）                |

逆解的存在性由机器人的结构特征决定。Pieper 准则：对于 6-DoF 串联机器人，当后三个相邻关节轴交于一点或相互平行时，位移反解具有封闭解。

### 4.2 代数法 {#代数法}
> **平面3R机器人逆解**：已知末端位姿 $(x, y, \varphi)^{\mathrm{T}}$，求解 $(\theta_1, \theta_2, \theta_3)^{\mathrm{T}}$。
>
> 由正解方程：
>
> $$
> \begin{cases}
> x = l_1\cos\theta_1 + l_2\cos\theta_{12} + l_3\cos\theta_{123} \\
> y = l_1\sin\theta_1 + l_2\sin\theta_{12} + l_3\sin\theta_{123} \\
> \varphi = \theta_{123}
> \end{cases}
> $$
>
> 令 $x' = x - l_3\cos\varphi$，$y' = y - l_3\sin\varphi$，消去 $\theta_3$ 后转化为平面 2R 问题：
>
> $$
> x'^2 + y'^2 = l_1^2 + l_2^2 + 2l_1l_2\cos\theta_2
> $$
>
> 解得：
>
> $$
> \begin{aligned}
> \theta_2 &= \text{Atan2}(\sin\theta_2, \cos\theta_2), \quad \cos\theta_2 = \frac{x'^2 + y'^2 - l_1^2 - l_2^2}{2l_1l_2} \\
> \theta_1 &= \text{Atan2}\left(\frac{(l_1 + l_2\cos\theta_2)y' - l_2\sin\theta_2 x'}{x'^2 + y'^2}, \frac{(l_1 + l_2\cos\theta_2)x' + l_2\sin\theta_2 y'}{x'^2 + y'^2}\right) \\
> \theta_3 &= \varphi - \theta_1 - \theta_2
> \end{aligned}
> $$
>
> 由于 $\sin\theta_2 = \pm\sqrt{1-\cos^2\theta_2}$，对应两组解（肘关节向上/向下两种构型）。

## 5. 并联机构位置逆解 {#并联机构位置逆解}

并联机构的位移逆解：已知动平台位姿（位置和姿态），求解各驱动关节的输入量。对大多数并联机构，逆解相对简单——每条支链可独立求解。

以 3-RPS 并联机构为例。机构由定平台、动平台和三条 RPS 支链（转动副-移动副-球面副）组成。每条 RPS 支链在垂直于其转动副轴线的平面内运动。

自由度为 3（两个转动 + 一个移动），产生三个伴随运动（parasitic motion）。

建模步骤：

1. 建立基坐标系 $\{B\}$ 和动平台坐标系 $\{P\}$。
2. 写出定平台铰链点 $\boldsymbol{B}_i$ 在 $\{B\}$ 中的坐标，动平台铰链点 $\boldsymbol{P}_i'$ 在 $\{P\}$ 中的坐标。
3. 通过齐次变换 ${}^{B}\boldsymbol{T}_P$ 将 $\boldsymbol{P}_i'$
   变换到基坐标系：${}^{B}\boldsymbol{P}_i = {}^{B}\boldsymbol{R}_P \boldsymbol{P}_i' + {}^{B}\boldsymbol{p}_P$。
4. 各支链杆长约束：$l_i = \|{}^{B}\boldsymbol{P}_i - \boldsymbol{B}_i\|$。

给定动平台位姿后，三条支链长度唯一确定，逆解具有封闭形式。

> **3-RPS 逆解示例**：机构参数为 $R$（定平台外接圆半径）、$r$（动平台外接圆半径）。三条支链均匀分布，间隔 $120^\circ$。
>
> 定平台铰链点 $\boldsymbol{B}_i$（在 $\{B\}$ 中）：
>
> $$
> \boldsymbol{B}_1 = \begin{bmatrix} R \\ 0 \\ 0 \end{bmatrix},\;
> \boldsymbol{B}_2 = \begin{bmatrix} -R/2 \\ \sqrt{3}R/2 \\ 0 \end{bmatrix},\;
> \boldsymbol{B}_3 = \begin{bmatrix} -R/2 \\ -\sqrt{3}R/2 \\ 0 \end{bmatrix}
> $$
>
> 动平台铰链点 $\boldsymbol{P}'_i$（在 $\{P\}$ 中）：
>
> $$
> \boldsymbol{P}'_1 = \begin{bmatrix} r \\ 0 \\ 0 \end{bmatrix},\;
> \boldsymbol{P}'_2 = \begin{bmatrix} -r/2 \\ \sqrt{3}r/2 \\ 0 \end{bmatrix},\;
> \boldsymbol{P}'_3 = \begin{bmatrix} -r/2 \\ -\sqrt{3}r/2 \\ 0 \end{bmatrix}
> $$
>
> 设动平台位姿为 $\boldsymbol{R}_P$、$\boldsymbol{p}_P = (x_c, y_c, z_c)^{\mathrm{T}}$，将 $\boldsymbol{P}'_i$ 变换到基坐标系：
> ${}^{B}\boldsymbol{P}_i = \boldsymbol{R}_P \boldsymbol{P}'_i + \boldsymbol{p}_P$。则杆长约束为：
>
> $$
> l_i = \|{}^{B}\boldsymbol{P}_i - \boldsymbol{B}_i\|, \quad i = 1,2,3
> $$
>
> RPS 支链的几何约束——各支链只能在垂直于其转动副轴线的平面内运动，产生三个耦合方程，可解得伴随运动（$x_c, y_c$ 及自转角与偏转角的关系）。最终杆长表达式为：
>
> $$
> l_i = \sqrt{({}^{B}P_{ix} - B_{ix})^2 + ({}^{B}P_{iy} - B_{iy})^2 + ({}^{B}P_{iz} - B_{iz})^2}
> $$
>
> 给定动平台位姿（三个独立参数），由以上公式直接计算三条支链长度。逆解具有唯一封闭形式。

并联机构位移正解则复杂得多——需要求解多元非线性方程组，通常采用封闭向量多边形法或数值迭代法。

## 6. 基于POE的速度雅可比 {#基于POE的速度雅可比}

### 6.1 雅可比矩阵的定义 {#雅可比矩阵的定义}

雅可比矩阵描述向量函数 $\boldsymbol{Y} = \boldsymbol{f}(\boldsymbol{X})$
的微分映射，其中 $\boldsymbol{Y} \in \mathbb{R}^m$，$\boldsymbol{X} \in \mathbb{R}^n$：

$$
\delta\boldsymbol{Y} = \boldsymbol{J}(\boldsymbol{X}) \, \delta\boldsymbol{X}, \quad \boldsymbol{J} = \frac{\partial \boldsymbol{f}}{\partial \boldsymbol{X}} \in \mathbb{R}^{m \times n}
$$

机器人末端位姿与关节变量的关系是典型的向量-向量函数。其微分映射即速度映射，对应的雅可比矩阵为**速度雅可比矩阵**。

速度雅可比矩阵是串联机器人性能分析的基础：

| 应用方向 | 说明 |
|----------|------|
| 奇异性分析 | 通过雅可比矩阵的秩判定奇异位形 |
| 灵巧度 | 基于雅可比条件数等指标度量运动灵活性 |
| 运动解耦性 | 分析各自由度方向的运动独立性 |
| 各向同性 | 衡量各方向运动能力的均匀程度 |
| 刚度分析 | 关节刚度到末端刚度的映射 |

末端速度有两种等价的描述方式，分别引向空间雅可比与物体雅可比：

| | 空间速度 | 物体速度 |
|---|---|---|
| **定义** | ${}^{S}\boldsymbol{V} = \dot{\boldsymbol{g}} \boldsymbol{g}^{-1}$ | ${}^{T}\boldsymbol{V} = \boldsymbol{g}^{-1}\dot{\boldsymbol{g}}$ |
| **观察者** | 惯性坐标系 $\{S\}$ | 与末端固连的物体坐标系 $\{T\}$ |
| **物理含义** | 末端在空间中的瞬时速度旋量 | 末端"感受"到的自身速度旋量 |
| **对应雅可比** | $\boldsymbol{J}_S(\boldsymbol{\theta})$（空间雅可比） | $\boldsymbol{J}_B(\boldsymbol{\theta})$（物体雅可比） |

两种速度旋量通过伴随变换关联：${}^{S}\boldsymbol{V} = \operatorname{Ad}_{\boldsymbol{g}} {}^{T}\boldsymbol{V}$。

### 6.2 空间速度雅可比 {#空间速度雅可比}

由 POE 公式 $\boldsymbol{g}(\boldsymbol{\theta}) = e^{[\boldsymbol{\xi}_1]\theta_1} \cdots e^{[\boldsymbol{\xi}_n]\theta_n} \; \boldsymbol{g}(\boldsymbol{0})$
，对时间求导得到末端空间速度旋量：

$$
{}^{S}\boldsymbol{V} = \dot{\boldsymbol{g}} \boldsymbol{g}^{-1} = \sum_{i=1}^{n} \frac{\partial \boldsymbol{g}}{\partial \theta_i} \boldsymbol{g}^{-1} \dot{\theta}_i
$$

经推导，第 $i$ 列对应的是**变换到当前位形的第 $i$ 个关节的单位运动旋量**：

$$
{}^{S}\boldsymbol{V}_T = \boldsymbol{J}_S(\boldsymbol{\theta}) \, \dot{\boldsymbol{\theta}}
$$

$$
\boldsymbol{J}_S(\boldsymbol{\theta}) = \begin{bmatrix} \boldsymbol{\xi}_1' & \boldsymbol{\xi}_2' & \cdots & \boldsymbol{\xi}_n' \end{bmatrix}
$$

其中第 $i$ 列为：

$$
\boldsymbol{\xi}_i' = \text{Ad}_{\,e^{[\boldsymbol{\xi}_1]\theta_1} \cdots e^{[\boldsymbol{\xi}_{i-1}]\theta_{i-1}}} \boldsymbol{\xi}_i
$$

即初始位形下的关节旋量 $\boldsymbol{\xi}_i$ 经前 $i-1$ 个关节的刚体运动伴随变换至当前位形。

### 6.3 物体速度雅可比 {#物体速度雅可比}

定义末端物体速度旋量 ${}^{T}\boldsymbol{V}_T = \boldsymbol{g}^{-1}\dot{\boldsymbol{g}}$，对应的物体速度雅可比：

$$
{}^{T}\boldsymbol{V}_T = \boldsymbol{J}_B(\boldsymbol{\theta}) \, \dot{\boldsymbol{\theta}}
$$

空间雅可比与物体雅可比之间通过伴随变换关联：

$$
\boldsymbol{J}_S(\boldsymbol{\theta}) = \text{Ad}_{\boldsymbol{g}} \boldsymbol{J}_B(\boldsymbol{\theta})
$$
> **SCARA机器人雅可比算例**（取惯性系与零位工具系重合）：
>
> 四个关节的单位运动旋量：
>
> $$
> \boldsymbol{\xi}_1 = \begin{bmatrix} 0 \\ 0 \\ 1 \\ 0 \\ 0 \\ 0 \end{bmatrix},\;
> \boldsymbol{\xi}_2 = \begin{bmatrix} 0 \\ 0 \\ 1 \\ 0 \\ -l_1 \\ 0 \end{bmatrix},\;
> \boldsymbol{\xi}_3 = \begin{bmatrix} 0 \\ 0 \\ 0 \\ 0 \\ 0 \\ 1 \end{bmatrix},\;
> \boldsymbol{\xi}_4 = \begin{bmatrix} 0 \\ 0 \\ 1 \\ -l_1-l_2 \\ 0 \\ 0 \end{bmatrix}
> $$
>
> 空间速度雅可比为：
>
> $$
> \boldsymbol{J}_S(\boldsymbol{\theta}) = \begin{bmatrix} \boldsymbol{\xi}_1' & \boldsymbol{\xi}_2' & \boldsymbol{\xi}_3' & \boldsymbol{\xi}_4' \end{bmatrix}
> $$
>
> 其中 $\boldsymbol{\xi}_1' = \boldsymbol{\xi}_1$，
> $\boldsymbol{\xi}_2' = \text{Ad}_{e^{[\boldsymbol{\xi}_1]\theta_1}}\boldsymbol{\xi}_2$，
> $\boldsymbol{\xi}_3' = \text{Ad}_{e^{[\boldsymbol{\xi}_1]\theta_1}e^{[\boldsymbol{\xi}_2]\theta_2}}\boldsymbol{\xi}_3$，
> $\boldsymbol{\xi}_4' = \text{Ad}_{e^{[\boldsymbol{\xi}_1]\theta_1}e^{[\boldsymbol{\xi}_2]\theta_2}e^{[\boldsymbol{\xi}_3]\theta_3}}\boldsymbol{\xi}_4$。

将此构造方式推广到一般情况：各关节初始旋量依次经前序关节的刚体运动伴随变换至当前位形，即得到空间雅可比矩阵的各列。

## 7. 工作空间分析 {#工作空间分析}

工作空间是机器人末端可到达的区域集合，分为：

| 类型         | 定义                        | 符号表示  |
|------------|---------------------------|-------|
| **可达工作空间** | 末端至少能以**一种**姿态到达的所有位置点的集合 | $W_R$ |
| **灵巧工作空间** | 末端可以**任何**姿态到达的位置点的集合     | $W_D$ |

灵巧工作空间是可达工作空间的子集（$W_D \subseteq W_R$），又称为可达工作空间的一级子空间。当末端位于灵巧工作空间内某点时，末端可绕通过该点的所有直线轴线作整周转动。

### 7.1 串联机构的工作空间 {#串联机构的工作空间}

**平面 2R 机器人**：

| 条件              | 可达工作空间                                | 灵巧工作空间 |
|-----------------|---------------------------------------|--------|
| $l_1 = l_2 = l$ | 半径为 $2l$ 的圆（含内部）                      | 圆心一点   |
| $l_1 \neq l_2$  | 内径 $\|l_1 - l_2\|$、外径 $l_1 + l_2$ 的圆环 | 空集     |

$l_1 \neq l_2$ 时，边界圆周上的点对应唯一关节解，内部各点存在两组解。灵巧工作空间为一点或空集时，运动灵活性较差。

**平面 3R 机器人**（设 $l_1 > l_2 > l_3$，$l_1 \leq l_2 + l_3$）：

| 工作空间类型 | 范围                                            |
|--------|-----------------------------------------------|
| 可达工作空间 | 半径 $l_1 + l_2 + l_3$ 的圆                       |
| 灵巧工作空间 | 内径 $l_1 - l_2 + l_3$、外径 $l_1 + l_2 - l_3$ 的圆环 |

增加一个关节能有效增大灵巧工作空间。

工作空间求解方法：

| 方法             | 思路                      | 适用性               |
|----------------|-------------------------|-------------------|
| **解析法**        | 通过运动学正反解方程获得工作空间边界的数学描述 | 仅适用于简单机构          |
| **几何法**        | 逐关节约束叠加得到末端可达范围         | 可结合计算机绘图，适用性强     |
| **离散法（蒙特卡洛法）** | 在关节空间中离散采样，通过正运动学计算所有位形 | 通用，计算量大，精度取决于离散密度 |

## 小结 {#小结}

| 主题      | 核心内容                                                            |
|---------|-----------------------------------------------------------------|
| 正运动学    | 由关节变量求末端位姿。串联机构正解唯一，通过 D-H 矩阵连乘或 POE 公式求解；并联机构正解困难              |
| 逆运动学    | 由末端位姿求关节变量。串联机构逆解多解且耦合，通过代数法、几何法或 Paden-Kahan 子问题求解；并联机构逆解通常较简单 |
| D-H 参数法 | 四参数（$a, \alpha, d, \theta$）+ 连杆坐标系，系统化建立相邻杆件位姿关系                |
| POE 公式  | 两坐标系 + 关节旋量坐标，几何直观，避免坐标系奇异性问题                                   |
| 速度雅可比   | 末端速度与关节速度的线性映射。基于 POE 的雅可比各列为变换到当前位形的关节运动旋量                     |
| 工作空间    | 分可达与灵巧两类，是衡量机器人性能的核心指标。受关节行程、杆件干涉等约束                            |

本文未涉及加速度分析（二阶运动学）和奇异性分析，后续篇章将单独讨论。
