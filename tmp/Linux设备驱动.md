---
title: Linux设备驱动
date: 2017-04-03 09:15:54
tags:
       底层驱动
---




# 驱动程序

<!-- more -->


## 描述
  - 从上到下，一个软件系统可以分为：应用程序、库、操作系统、驱动程序、开发人员可以专注于自己熟悉的部分，对于相邻层，只需要了解它的接口，无需关注他的实现细节。
  - 应用程序使用库提供的Open函数打开代表LED的设备文件；
  - 库根据Open函数传入的参数执行"swi"指令，这条指令会引起CPU异常，进入内核;
  - 内核的异常处理函数根据这些函数找到对应的驱动程序，返回一个文件句柄给库，进而返回给应用程序；
  - 应用程序得到文件句柄后，使用库提供的write和ioclt函数发出控制命令；
  - 库根据write或ioclt函数传入的参数执行"swi"指令，这条指令会引起CPU异常，进入内核
  - 内核的异常处理函数根据这些参数调用驱动程序的相关函数，点亮LED；

## 应用程序到驱动程序的过程

  - <iframe id="embed_dom" name="embed_dom" frameborder="0" style="border:1px solid #000;display:block;width:430px; height:600px;" src="https://www.processon.com/embed/58e1a89ae4b02c6ef422262e"></iframe>

    - 第一步：编写驱动函数 xxx_drv_open, xxx_drv_read, xxx_drv_write 
    - 第二步：怎么告诉内核 定义一个struct file_operations xxx_drv_fops 结构体,然后填充 
    - 第三步：把这个结构体告诉内核，即注册驱动程序 int register_chrdev();
    - 第四步: 谁（驱动入口函数）来调用register_chrdev ： int xxx_drv_init(void)
    - 第五步：内核如何调用驱动入口函数：module_init(xxx_drv_init) 

## 应用程序如何调用驱动程序 

  - 应用程序`open("/dev/xxx")` 通过类型、主设备号和驱动对应起来
  - 进入内核，会分配一个字符型结构体，通过主设备号找到file_operations结构
  - 入口函数里面，用register_chrdev()把file_operations结构体放入内核中的字符型数组中
 
## 主设备号、节点
  - 分配主设备号
    - 手动添加
    - 自动分配:当主设备号为0时，系统自动分配主设备号
      - rmmod xxx_drv.ko //删除驱动 
  - 创建节点
    - 手动创建：`mknod /dev/xxx c(字符设备) 主设备号 次设备号`
    - 自动创建：根据系统信息创建设备节点
      - 相关函数: `class_create()、class_device_create()`建立设备
      - cd /sys/class 查看各种类  

# 点亮LED
  - 框架搭建
  - 完场硬件操作
    - 看原理图
    - 看芯片手册
    - 编写代码：单片机中操作物理地址，Linux驱动中操作虚拟地址   
    - 源码：参见[Github][1] : git@github.com:wisezhao/wds_study.git
      - ioremap() 物理地址映射至虚拟地址
      - copy_from_user() 用户空间拷贝至内核空间
# 中断框架

## 框架介绍
## 异常向量


# 机制

## poll机制
## 异步通知
## 信号量
## 定时器

# 块设备框架
## 描述
## 框架
## 分析ll_rw_block()

# 块设备驱动程序


  [1]: https://github.com/wisezhao/wds_study
