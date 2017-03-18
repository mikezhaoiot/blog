---
title: Uboot分析
date: 2017-03-17 10:47:01
tags:
	底层驱动
---
uboot 简介

<!-- more -->

## 简介
  - 描述uboot各个目录的作用
## Makefile结构分析
**1. 配置**
  - 阅读Makefile 和 README
    - 根据顶层Readme文件，如果要使用开发板`board/<board_name>`,先执行`make <borad_name>_config`命令配置，然后执行`make all`,生成`uboot.bin`文件	
  - JZ2440配置过程 
    - `u-boot-1.16` 通过 `patch -p1 < ../u-boot-1.16_jz2440.patch` 打补丁
    - `make 100ask24x0_config` 配置
    - `mkae all `  
	
**2. 分析配置过程**
   - 在顶层Makefile中可以看到如下代码
``` mel
    $RCTREE	:= $(CURDIR)
    ... ...
    MKCONFIG	:= $(SRCTREE)/mkconfig
    ... ...
    smdk2410_config : unconfig 
    	@$(MKCONFIG) $(@:_config=) arm arm920t 100ask24x0 NULL s3c24x0 	
```
   - 假定在u-boot-1.16的根目录下编译，则其中的MKCONFIG就是根目录下的mkconfig文件。$(@:_config=)的结果就是将`100ask24x0_config`中的`_config`去掉，结果为`100ask24x0`,所以`make 100ask24x0_config`实际上就是执行如下命令:
   - > ./mkconfig  100ask24x0_config  arm arm920t 100ask24x0 NULL s3c24x0 
   - 再来看看mkconfig的作用，在mkconfig文件开头第6行给出了用法：
   - `# Parameters:  Target  Architecture  CPU  Board [VENDOR] [SOC]`

## 源码分析
**1. 第1阶段**
   - 通过分析Makefile文件，uboot第一个文件`cpu/arm920t/start.S`,该文件中主要是硬件设备初始化，
   - 将CPU的工作模式设为管理模式，关闭WATCHDOG, 设置FCLK、HCLK、PCLK的比例、关闭MMU、CACHE 

**2. 第2阶段**
   - 主要从`lib_arm/board.c`中的start_armboot函数开始

## Uboot命令
**1. 命令格式**
   - 内核启动，也是通过Uboot命令来实现的。Uboot中的每个命令都通过`U_BOOT_CMD`宏来定义，格式如下 
   - > U_BOOT_CMD(name,maxargs,rep,cmd,usage,help)

**2. 命令分析**

   - 宏U_BOOT_CMD在`include、command.h`中定义，如下所示


``` dos
#define U_BOOT_CMD(name,maxargs,rep,cmd,usage,help) \
cmd_tbl_t __u_boot_cmd_##name Struct_Section = {#name, maxargs, rep, cmd, usage, help}
```

 - Struct_Section 在`include/command.h`中定义，如下所示 #define Struct_Section  __attribute__ ((unused,section (".u_boot_cmd")))
 - 宏U_BOOT_CMD扩展后如下所示

``` objectivec
 cmd_tbl_t __u_boot_cmd_bootm  __attribute__ ((unused,section (".u_boot_cmd"))) = {bootm,CFG_MAXARGS,1,do_bootm, "string1" "string2 "}
```

## 启动内核

**1. 分区介绍**
   - Linux分区源代码中已固定，参见`include\configs\100ask24x0.h`
``` stylus
#define MTDIDS_DEFAULT "nand0=nandflash0"
#define MTDPARTS_DEFAULT "mtdparts=nandflash0:256k@0(bootloader)," \
                            "128k(params)," \
                            "2m(kernel)," \
                            "-(root)"
```
![enter description here][1]


**2. do_boot() do_bootm_linux()主要做什么**
   - do_boot() 主要读取头部，移动内核至加载地址 
   - > uboot中的环境变量 bootcmd=nand read.jffs2 0x30007FC0 kernel; bootm 0x30007FC0
     - 从nand读出内核，
     - 加载地址`0x30007FC0`  入口地址`0x30008000`      
   - do_bootm_linux() 启动内核

**3. 内核设置启动参数**
   - Uboot通过标记列表向内核传递参数，命令行标记的示例代码就是取自Uboot中的`setup_memory_tags、setup_commandline_tag`它们都是在`lib_arm/armlinux.c`中定义
   - 对于ARM架构的CPU，都是通过`lib_arm/armlinux.c`中的`do_bootm_limux`函数来启动内核。这个函数中，设置标记列表，最后通过`theKernel (0, bd->bi_arch_number, bd->bi_boot_params)`调用内核。
      - theKernel  指向内核存放的地址（ARM架构的CPU，通常是0x30008000）
      - bd-bi_arch_number  前面'board_init'函数设置的机器类型ID
      - bi_boot_paras  标记列表的开始地址 	


  [1]: http://oimqf80rv.bkt.clouddn.com/1489758228741.jpg "uboot-1.jpg"
