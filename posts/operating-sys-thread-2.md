---
title: Unix操作系统 - 进程通信
date: 2026-04-15
tags: [ Unix, C语言, 系统调用, 进程,线程 ]
pinned: false
outline:
head:
  - - meta
    - name: description
      content: 一篇围绕 Unix 进程通信展开的学习笔记。
  - - meta
    - name: keywords
      content: Unix, C语言, fork, wait, waitpid, exec, pipe, dup2, 文件描述符, 进程通信
---

一篇围绕 Unix 进程通信展开的学习笔记。

---

在 [概述](./operating-sys-overview.md) 中介绍操作系统时，将操作系统分为这样几个章节

1. 概述 - 操作系统的组成/作用/发展历史等
2. 进程 - 操作系统分配资源的最小单位
3. 内存管理 - 内存如何虚拟化，操作系统如何分配内存资源
4. 文件管理 - 文件系统与第一个I/O设备 —— 磁盘
5. I/O设备 - 磁盘/网络/用户终端等

此篇文章是介绍 ***进程*** 的第二篇文章，在此处将介绍进程通信相关内容

## 待续

