---
title: Uboot分析
date: 2017-03-17 10:47:01
tags:
	底层驱动
---

<!-- more -->

## 简介
## 如何编译
## Makefile结构分析
## 源码分析
## 启动内核

 1. 分区介绍
   - Linux分区源代码中已固定，参见`include\configs\100ask24x0.h`
``` stylus
#define MTDIDS_DEFAULT "nand0=nandflash0"
#define MTDPARTS_DEFAULT "mtdparts=nandflash0:256k@0(bootloader)," \
                            "128k(params)," \
                            "2m(kernel)," \
                            "-(root)"
```
 2. do_boot()主要做什么
   - 读取头部，移动内核之加载地址
   - 启动内核
 3. do_bootm_linux()主要做什么



