---
title: 4.1.A - 习题课
date: 2026-05-25T20:00:00
tags: [ 机器人, 机构学, 自由度 ]
pinned: false
collection: 机器人机构学
outline:
  - title: 例 1：Sarrus 机构分析
    slug: Sarrus机构分析
  - title: a. 前置分析
    slug: Sarrus-前置分析
    level: 1
  - title: b. 自由度分析
    slug: Sarrus-自由度分析
    level: 1
  - title: c. 公共约束分析
    slug: Sarrus-公共约束分析
    level: 1
  - title: d. 冗余约束分析
    slug: Sarrus-冗余约束分析
    level: 1

  - title: 例 2：Scott-Russell 机构分析
    slug: Scott-Russell机构分析
  - title: a. 前置分析
    slug: Scott-Russell-前置分析
    level: 1
  - title: b. 自由度分析
    slug: Scott-Russell-自由度分析
    level: 1
  - title: c. 公共约束分析
    slug: Scott-Russell-公共约束分析
    level: 1
  - title: d. 冗余约束分析
    slug: Scott-Russell-冗余约束分析
    level: 1


head:
  - - meta
    - name: description
      content: 机器人机构学系列自由度分析习题课，通过 $Sarrus$ 机构与 $Scott$-$Russell$ 机构两个完整算例，逐步演示基于互易旋量系的自由度分析、公共约束判定与冗余约束计算的全过程。
  - - meta
    - name: keywords
      content: 机器人机构学, 习题课, 自由度分析, $Sarrus$机构, $Scott$-$Russell$机构, 互易旋量系, 运动旋量系, 约束旋量系, 公共约束, 冗余约束, 并联机构, 算例
---

本文是自由度分析的习题课，逐步演示并联机构中自由度分析、公共约束分析与冗余约束分析三套步骤的实际操作。

---

```ts image-setup
import {path as miscellaneousImagePath} from '@public/Image/Miscellaneous/path'

const sarrus = {
  src: miscellaneousImagePath['Sarrus'],
  alt: 'Sarrus机构',
  align: 'right',
  wrap: true,
  maxHeight: '8rem',
  caption: 'Sarrus机构',
} as const

const scottRussell = {
  src: miscellaneousImagePath['Scott-Russell'],
  alt: 'Scott-Russell机构',
  align: 'right',
  wrap: true,
  maxHeight: '15rem',
  caption: 'Scott-Russell机构',
} as const

```

本文将演示 Sarrus 机构与 Scott-Russell 机构的两个完整算例。

## 例 1：Sarrus 机构分析{#Sarrus机构分析}
此机构可以视为一个含2个支链的并联机构

### a. 前置分析{#Sarrus-前置分析}
<Image {...sarrus} />
建系如图，可得运动旋量：

$$\boldsymbol{\$_1}=(1,0,0;0,0,0)$$
$$\boldsymbol{\$_2}=(1,0,0;0,a,b)$$
$$\boldsymbol{\$_3}=(1,0,0;0,c,d)$$
$$\boldsymbol{\$_4}=(0,1,0;e,0,f)$$
$$\boldsymbol{\$_5}=(0,1,0;g,0,h)$$
$$\boldsymbol{\$_6}=(0,1,0;0,0,0)$$

对于支链1，运动旋量系：
$$\mathcal{S}_{b1} =
\operatorname{span}
\left\{
\begin{aligned}
&\boldsymbol{\$_1}^T \\
&\boldsymbol{\$_2}^T\\
&\boldsymbol{\$_3}^T\\
\end{aligned}
\right\}
=
\operatorname{span}
\left\{
\begin{aligned}
&(1,0,0;0,0,0)\\
&(1,0,0;0,a,b)\\
&(1,0,0;0,c,d)
\end{aligned}
\right\}
$$
由$\mathcal{S}_{bi}\boldsymbol{\Delta}\boldsymbol{\$}_i=\boldsymbol{0}$，可得支链1约束旋量系：
$$\mathcal{S}^r_{b1} =
\operatorname{span}
\left\{
\begin{aligned}
&(1,0,0;0,0,0)\\
&(0,0,0;0,1,0)\\
&(0,0,0;0,0,1)
\end{aligned}
\right\}
$$

对于支链2，运动旋量系:

$$\mathcal{S}_{b1} =
\operatorname{span}
\left\{
\begin{aligned}
&\boldsymbol{\$_6}^T \\
&\boldsymbol{\$_5}^T\\
&\boldsymbol{\$_4}^T\\
\end{aligned}
\right\}
=
\operatorname{span}
\left\{
\begin{aligned}
&(0,1,0;0,0,0)\\
&(0,1,0;g,0,h)\\
&(0,1,0;e,0,f)
\end{aligned}
\right\}
$$

支链2约束旋量系：
$$\mathcal{S}^r_{b1} =
\operatorname{span}
\left\{
\begin{aligned}
&(0,1,0;0,0,0)\\
&(0,0,0;1,0,0)\\
&(0,0,0;0,0,1)
\end{aligned}
\right\}
$$

### b. 自由度分析{#Sarrus-自由度分析}
由支链约束旋量系可得动平台约束旋量系：
$$\mathcal{S}^r =
\mathcal{S}^{r}_{b1} \cup \mathcal{S}^{r}_{b2}
=
\operatorname{span}
\left\{
\begin{aligned}
&(1,0,0;0,0,0)\\
&(0,0,0;0,1,0)\\
&(0,0,0;0,0,1)\\
&(0,1,0;0,0,0)\\
&(0,0,0;1,0,0)
\end{aligned}
\right\}
$$

因此，求解 $\mathcal{S}^r \boldsymbol{\Delta} \boldsymbol{\$} = \boldsymbol{0}$，得：
$$\mathcal{S}_f=
\operatorname{span}
\left\{
\begin{aligned}
(0,0,0;0,0,1)
\end{aligned}
\right\}
$$
即，自由度$F = \dim(\mathcal{S}_f)=1$，包含一个沿 $Z$ 轴平动的自由度。

### c. 公共约束分析{#Sarrus-公共约束分析}
总运动旋量系
$$
\mathcal{S}_m=
\mathcal{S}_{b1} \cup \mathcal{S}_{b2}
=
\operatorname{span}
\left\{
\begin{aligned}
&(1,0,0;0,0,0)\\
&(1,0,0;0,a,b)\\
&(1,0,0;0,c,d)\\
&(0,1,0;0,0,0)\\
&(0,1,0;e,0,f)\\
&(0,1,0;g,0,h)
\end{aligned}
\right\}=
\operatorname{span}
\left\{
\begin{aligned}
&(1,0,0;0,0,0)\\
&(0,1,0;0,0,0)\\
&(0,0,0;e,0,f)\\
&(0,0,0;g,0,h)\\
&(0,0,0;0,a,b)\\
&(0,0,0;0,c,d)\\
\end{aligned}
\right\}
$$

求解 $\mathcal{S}_m \boldsymbol{\Delta} \boldsymbol{\$}^c = \boldsymbol{0}$，可得：

$$
\mathcal{S}^c=
\operatorname{span}
\left\{
\begin{aligned}
&(0,0,0;0,0,1)\\
\end{aligned}
\right\}
$$
即，公共约束数为$\dim(\mathcal{S}^c)=1$。

### d. 冗余约束分析{#Sarrus-冗余约束分析}

$$
\langle\mathcal{S}^r\rangle=
\mathcal{S}^{r}_{b1} \oplus \mathcal{S}^{r}_{b2}=
\operatorname{span}
\left\{
\begin{aligned}
&(1,0,0;0,0,0)\\
&(0,0,0;0,1,0)\\
&(0,0,0;0,0,1)\\
&(0,1,0;0,0,0)\\
&(0,0,0;1,0,0)\\
&(0,0,0;0,0,1)
\end{aligned}
\right\}
$$

由$\mathcal{S}^r= \mathcal{S}^c \cup \mathcal{S}^r_c$，可得
$$
\mathcal{S}^r_c=
\operatorname{span}
\left\{
\begin{aligned}
&(1,0,0;0,0,0)\\
&(0,0,0;0,1,0)\\
&(0,0,0;0,0,1)\\
&(0,1,0;0,0,0)\\
&(0,0,0;1,0,0)\\
\end{aligned}
\right\}
$$

由$\langle\mathcal{S}^r\rangle = \mathcal{S}^{r}_{b1} \oplus \mathcal{S}^{r}_{b2}$可得：

$$
\langle\mathcal{S}^r\rangle=
\operatorname{span}
\left\{
\begin{aligned}
&(1,0,0;0,0,0)\\
&(0,0,0;0,1,0)\\
&(0,0,0;0,0,1)\\
&(0,1,0;0,0,0)\\
&(0,0,0;1,0,0)\\
&(0,0,0;0,0,1)
\end{aligned}
\right\}
$$

由$\langle\mathcal{S}^r\rangle= \mathcal{S}^c \cup \langle\mathcal{S}^r_c\rangle$，可得：

$$
\langle\mathcal{S}^r_c\rangle=
\operatorname{span}
\left\{
\begin{aligned}
&(1,0,0;0,0,0)\\
&(0,0,0;0,1,0)\\
&(0,0,0;0,0,1)\\
&(0,1,0;0,0,0)\\
&(0,0,0;1,0,0)\\
\end{aligned}
\right\}
$$

因此，$\langle\mathcal{S}^r_c\rangle=\mathcal{S}^r_c$，$\nu = \operatorname{card}(\langle\mathcal{S}^r_c\rangle) - \dim(\mathcal{S}^r_c)=0$
，该机构无冗余约束。

## 例 2：Scott-Russell 机构分析{#Scott-Russell机构分析}
### a. 前置分析{#Scott-Russell-前置分析}
Scott-Russell 机构存在 1 个冗余约束与3 个公共约束，下面用旋量法验证。

<Image {...scottRussell} />

建立$\vec{OC}$为$X$轴，$\vec{OB}$为$Y$轴，垂直纸面向外为$Z$轴。$|\vec{OB}|=2b$，$|\vec{OC}|=2c$。

此机构可以视为一个含3个支链的并联机构。

其中第一条支链为：
$$机架->C（移动副滑块）->C（转动副）->动杆BC$$

第二条支链为：
$$机架->O（转动副）->A（转动副）->动杆BC$$

第三条支链为:
$$机架->B（移动副滑块）->B（转动副）->动杆BC$$

将$B$与$C$两处的移动副与转动副视为单个自由度为2的高副，合并分析，可以得$O$、$A$、$B$、$C$四处的运动副旋量如下

$$\boldsymbol{\$}_O=(0,0,1;0,0,0)^T$$
$$\boldsymbol{\$}_A=(0,0,1;-b,c,0)^T$$
$$\boldsymbol{\$}_{B1}=(0,0,0;0,1,0)^T(平动),\$_{B2}=(0,0,1;-2b,0,0)^T(转动)$$

$$\boldsymbol{\$}_{C1}=(0,0,0;1,0,0)^T(平动),\$_{C2}=(0,0,1;0,2c,0)^T(转动)$$

### b. 自由度分析{#Scott-Russell-自由度分析}

分析可得，此机构无局部自由度。

对于各支链，建立运动旋量系$\mathcal{S}_{bi}$：

$$\mathcal{S}_{b1} =
\operatorname{span}
\left\{
\begin{aligned}
&\boldsymbol{\$}_{B1}^T \\
&\boldsymbol{\$}_{B2}^T
\end{aligned}
\right\}
=
\operatorname{span}
\left\{
\begin{aligned}
&(0 , 0 , 0 ; 0 , 1 , 0)\\
&(0 , 0 , 1 ; -2b , 0 , 0)
\end{aligned}
\right\}
$$


$$\mathcal{S}_{b2} =
\operatorname{span}
\left\{
\begin{aligned}
&\boldsymbol{\$}_{O}^T \\
&\boldsymbol{\$}_{A}^T
\end{aligned}
\right\}
=
\operatorname{span}
\left\{
\begin{aligned}
&(0 , 0 , 1 ; 0 , 0 , 0)\\
&(0 , 0 , 1 ; -b , c , 0)
\end{aligned}
\right\}
$$

$$\mathcal{S}_{b3} =
\operatorname{span}
\left\{
\begin{aligned}
&\boldsymbol{\$}_{C1}^T \\
&\boldsymbol{\$}_{C2}^T
\end{aligned}
\right\}
=
\operatorname{span}
\left\{
\begin{aligned}
&(0 , 0 , 0 ; 1 , 0 , 0)\\
&(0 , 0 , 1 ; 0 , 2c , 0)
\end{aligned}
\right\}
$$


求解各支链约束旋量系$\mathcal{S}^{r}_{bi}$：

根据
$$\mathcal{S}_{bi} \boldsymbol{\Delta} \boldsymbol{\$}^r = \boldsymbol{0}$$
可得
$$
\mathcal{S}_{b1}^{r}
=
\operatorname{span}
\left\{
\begin{aligned}
&(1,0,0;\ 0,0,2b)\\
&(0,0,1;\ 0,0,0)\\
&(0,0,0;\ 1,0,0)\\
&(0,0,0;\ 0,1,0)
\end{aligned}
\right\}
$$

$$
\mathcal{S}_{b2}^{r}
=
\operatorname{span}
\left\{
\begin{aligned}
&(c,b,0;\ 0,0,0)\\
&(0,0,1;\ 0,0,0)\\
&(0,0,0;\ 1,0,0)\\
&(0,0,0;\ 0,1,0)
\end{aligned}
\right\}
$$

$$
\mathcal{S}_{b3}^{r}
=
\operatorname{span}
\left\{
\begin{aligned}
&(0,1,0;\ 0,0,-2c)\\
&(0,0,1;\ 0,0,0)\\
&(0,0,0;\ 1,0,0)\\
&(0,0,0;\ 0,1,0)
\end{aligned}
\right\}
$$

求动平台$BC$约束旋量系：

根据
$$\mathcal{S}^r = \mathcal{S}^{r}_{b1} \cup \mathcal{S}^{r}_{b2} \cup \cdots \cup \mathcal{S}^{r}_{bp}$$

可得：
$$\mathcal{S}^r=\operatorname{span}
\left\{
\begin{aligned}
&(0,0,1;\ 0,0,0)\\
&(0,0,0;\ 1,0,0)\\
&(0,0,0;\ 0,1,0)\\
&(1,0,0;\ 0,0,2b)\\
&(c,b,0;\ 0,0,0)\\
&(0,1,0;\ 0,0,-2c)
\end{aligned}
\right\}
$$
由于$(1,0,0;\ 0,0,2b)$、$(c,b,0;\ 0,0,0)$与$(0,1,0;\ 0,0,-2c)$线性相关，因此
$$\mathcal{S}^r=\operatorname{span}
\left\{
\begin{aligned}
&(0,0,1;\ 0,0,0)\\
&(0,0,0;\ 1,0,0)\\
&(0,0,0;\ 0,1,0)\\
&(1,0,0;\ 0,0,2b)\\
&(0,1,0;\ 0,0,-2c)
\end{aligned}
\right\}
$$
化简，消去线性相关元素，可得
$$\mathcal{S}^r=
\operatorname{span}
\left\{
\begin{aligned}
&(1,0,0;\ 0,0,2b)\\
&(0,1,0;\ 0,0,-2c)\\
&(0,0,1;\ 0,0,0)\\
&(0,0,0;\ 1,0,0)\\
&(0,0,0;\ 0,1,0)
\end{aligned}
\right\}
$$


求动平台运动旋量系

根据
$$\mathcal{S}^r \boldsymbol{\Delta} \boldsymbol{\$} = \boldsymbol{0}$$
可得
$$\mathcal{S}_f=\operatorname{span}\left\{ (0,0,1,-2b,2c,0)\right\}$$
即，此机构仅有$F = \dim(\mathcal{S}_f)=1$个自由度，运动形式是绕轴转动。旋转轴过点$(-2c,-2b,0)$，方向向量为$(0,0,1)$。

### c. 公共约束分析{#Scott-Russell-公共约束分析}
根据上文的$\mathcal{S}_{bi}$，可得机构总运动旋量系 $\mathcal{S}_m$：

$$\mathcal{S}_{m} =
\operatorname{span}
\left\{
\begin{aligned}
&\boldsymbol{\$}_{B1}^T\\
&\boldsymbol{\$}_{B1}^T\\
&\boldsymbol{\$}_O^T \\
&\boldsymbol{\$}_A^T\\
&\boldsymbol{\$}_{C1}^T \\
&\boldsymbol{\$}_{C2}^T
\end{aligned}
\right\}
=
\operatorname{span}
\left\{
\begin{aligned}
&(0 , 0 , 0 ; 0 , 1 , 0)\\
&(0 , 0 , 1 ; -2b , 0 , 0)\\
&(0 , 0 , 1 ; 0 , 0 , 0)\\
&(0 , 0 , 1 ; -b , c , 0)\\
&(0 , 0 , 0 ; 1 , 0 , 0)\\
&(0 , 0 , 1 ; 0 , 2c , 0)
\end{aligned}
\right\}
$$
根据：
$$\mathcal{S}_m \boldsymbol{\Delta} \boldsymbol{\$}^c = \boldsymbol{0}$$
可得：
$$
\mathcal{S}^c=
\operatorname{span}
\left\{
\begin{aligned}
&(0,0,1;\ 0,0,0)\\
&(0,0,0;\ 1,0,0)\\
&(0,0,0;\ 0,1,0)
\end{aligned}
\right\}
$$
公共约束数:
$$\lambda = \dim(\mathcal{S}^c)=3$$


### d. 冗余约束分析{#Scott-Russell-冗余约束分析}

由$\mathcal{S}^{r}_{bi}$可得：
$$\langle\mathcal{S}^r\rangle=\mathcal{S}^{r}_{b1} \oplus \mathcal{S}^{r}_{b2} \oplus \cdots \oplus \mathcal{S}^{r}_{bp}=
\operatorname{span}
\left\{
\begin{aligned}
&(0,0,1;\ 0,0,0)\\
&(0,0,0;\ 1,0,0)\\
&(0,0,0;\ 0,1,0)\\
&(1,0,0;\ 0,0,2b)\\
&(c,b,0;\ 0,0,0)\\
&(0,1,0;\ 0,0,-2c)
\end{aligned}
\right\}
$$

$$\mathcal{S}^r=
\operatorname{span}
\left\{
\begin{aligned}
&(0,0,1;\ 0,0,0)\\
&(0,0,0;\ 1,0,0)\\
&(0,0,0;\ 0,1,0)\\
&(1,0,0;\ 0,0,2b)\\
&(0,1,0;\ 0,0,-2c)
\end{aligned}
\right\}
$$

因此，由
$$\mathcal{S}^r = \mathcal{S}^c \cup \mathcal{S}^r_c$$  
与
$$\langle\mathcal{S}^r\rangle = \mathcal{S}^c \oplus \langle\mathcal{S}^r_c\rangle$$
可得

$$
\mathcal{S}^r_c=
\operatorname{span}
\left\{
\begin{aligned}
&(1,0,0;\ 0,0,2b)\\
&(0,1,0;\ 0,0,-2c)
\end{aligned}
\right\}
$$


$$
\langle\mathcal{S}^r_c\rangle=
\operatorname{span}
\left\{
\begin{aligned}
&(1,0,0;\ 0,0,2b)\\
&(c,b,0;\ 0,0,0)\\
&(0,1,0;\ 0,0,-2c)
\end{aligned}
\right\}
$$


即得冗余约束数$\nu$：

$$\nu = \operatorname{card}(\langle\mathcal{S}^r_c\rangle) - \dim(\mathcal{S}^r_c)=1$$
