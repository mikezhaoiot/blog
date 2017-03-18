---
title: 内核分析
date: 2017-03-18 11:36:40
tags:
        底层驱动
---
![enter description here][1]

<!-- more -->

## 内核简介

 - 参考嵌入式应用开发手册- 第16章

## <font color=#fea304>内核配置、分析、编译</font>

### 编译内核
  - 阅读Makefile 和 README 
  - 配置内核三种方法
    - 全部编译、配置 : `make menuconfig`
    -  默认配置，修改部分文件
      - `arch/arm/configs` 找到相似配置文件 xxx_defconfig 
      - make xxx_defconfig 保存至.config 中
      - make menuconfig 
     - 使用厂家提供的配置文件
       - config_厂家 复制为.config 
       -  make menuconfig 
     - make uImage : uImage 实际是 首部_内核  
   - JZ2440配置过程 
     - 打补丁 `patch -p1 < ../内核补丁`
     - config_ok 复制为.config 
     - make menuconfig : 裁剪内核
     - make uImage  
      
### 配置过程
  - 配置的结果，生成`.config`文件

### 编译过程
  - 具体编译过程参见 : [课程笔记][2]

### 内核启动
  - 具体内核启动参见 ：[课程笔记][3]

## 移植内核

### 框架介绍
  - **编译内核**
    - 使用版本`Linux-3.4.2`
    - 修改Makefile @L194
      - ARCH = arm
      - CROSS_COMPLE = arm-linux-
    - 使用默认配置生成`.config`
      - `make s3c2410_defconfig`
    - make uImage    
  - **安装交叉编译器**
    - 查看版本 : `arm-linux-gcc -v` 
    - 解压 `sudo tar xjf arm-linux-gcc-4.3.2.tar.bz2 -C`
    - 设置环境变量
      - 查看环境变量`echo $PATH`
      - 方法1 
        - `export PATH=/usr/local/arm/4.3.2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games` 
        - 生效方法 : 立即生效
        - 有效期限 : 临时改变，只能在当前的终端窗口有效，当前窗口关闭后就会恢复原有的path配置  
      - 方法2
        - vim /etc/profile 
        - /expoer PATH //找到设置PATH的行添加
        - 生效方法：系统重启  
        - 有效期限：永久有效
        - 用户局限：对所有用户

### 修改分区及制作根文件系统
  - **修改分区**
    - 相关文件` arch/arm/mach-s3c24xx/common-smdk.c` 
    - 定义`static struct mtd_partition smdk_default_nand_part[]`
  - **制作jffs2文件系统** 
    - 安装交叉编译工具busybox 
    - 安装glibc库
    - 构建目录
    - 制作文件
      - `mkfs.jffs2 -n -s 2048  -e 128KiB -d fs_mini -o fs_mini.jffs2` 

### 内核裁剪
  - **主要裁剪部分**
    - 单板配置裁剪
    - 文件系统裁剪
    - 阅读`.config`裁剪
    	- CONFIG_SND_USB
    	- CONFIG_USB_LIBSUAL
    	- CONFIG_LEDS_TRIGGERS
   - **制作Uboot补丁**
     - diff 命令制作补丁, [详细说明][4]  
   - **ECC与OOB**   
     - [详细说明][5] 


  [1]: http://oimqf80rv.bkt.clouddn.com/1489821379782.jpg "内核分析-0.jpg"
  [2]: http://pan.baidu.com/s/1slPfXKT
  [3]: http://pan.baidu.com/s/1nvjWCYX
  [4]: http://blog.csdn.net/zqixiao_09/article/details/51834791
  [5]: http://blog.csdn.net/zqixiao_09/article/details/51834791
