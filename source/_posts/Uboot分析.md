---
title: Uboot分析
date: 2017-03-17 10:47:01
tags:
	底层驱动
---

![enter description here][1]

<!-- more -->

## <font color=#fea304>简介</font>
  - 描述uboot各个目录的作用 

## <font color=#fea304>配置、编译、链接</font>
### 编译Uboot
  - 课程 ：**4.1 u-boot分析之编译体验**
  - 阅读Makefile 和 README
    - 根据顶层Readme文件，如果要使用开发板`board/<board_name>`,先执行`make <borad_name>_config`命令配置，然后执行`make all`,生成`uboot.bin`文件	
  - JZ2440配置过程 
    - `u-boot-1.16` 通过 `patch -p1 < ../u-boot-1.16_jz2440.patch` 打补丁
    - `make 100ask24x0_config` 配置
    - `mkae all `  
	
### 配置过程
  - 课程 : **4.2 u-boot分析之Makefile结构分析**
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
   - `./mkconfig  100ask24x0  arm arm920t 100ask24x0 NULL s3c24x0` 
   - 再来看看mkconfig的作用，在mkconfig文件开头第6行给出了用法：
   - `# Parameters:  Target  Architecture  CPU  Board [VENDOR] [SOC]`
   - 详细mkconfig分析过程，参见[课程笔记][2]
     - 分析结果：创建到平台/开发板相关的头文件链接
       - `ln -s asm-arm asm`
       - `ln -s arch-s3c24x0 asm-arm/arch
       - `ln -s proc-armv asm-arm/proc` 
     - 创建顶层Makefile包含的文件`include/config.mk`
       - `ARCH = arm`
       - `CPU = arm920t`
       - `BOARD = 100ASK240`
       - `SOC = s3c24x0`
     - 创建开发板相关的头文件`include/config.h`
       - `Automatically generated - do not edit`   
       - `#include (configs/100ask24x0.h)`

### 编译过程
  - 分析Makefile编译过程，参见[课程笔记][3]
    - 分析结果：首先编译 `cpu/arm920t/start.s`
    - 对于平台/开发板相关的每个目录，每个通用目录都使用它们各自的 Makefile生成相应的库
    - 前面生成的.o、.a文件按照`board/100ask24x0/config.mk` 文件中指定的代码段起始地址,`board/100ask24x0/u-boot.lds`链接脚本进行链接
    - ELF格式的Uboot,后面Makefile还会将它转换为二进制格式

## <font color=#fea304>启动过程分析</font>
### 第1阶段 
  - 课程 : **4.3 u-boot分析之源码第1阶段**
  - 通过分析Makefile文件，uboot第一个文件`cpu/arm920t/start.S`,该文件中主要是硬件设备初始化，
  - 将CPU的工作模式设为管理模式，关闭WATCHDOG, 设置FCLK、HCLK、PCLK的比例、关闭MMU、CACHE 
  - 为加载Bootloader的第二阶段代码准备RAM空间，代码`board/100ask24x0/lowlevel_init.S`
  - 复制Boootloader的第二阶段代码到RAM空间中
  - 设置好栈，跳转到第二阶段代码的C入口点，跳转之前，还要清除BSS段

### 第2阶段
  - 课程 : **4.4 u-boot分析之源码第2阶段**
  - 主要从`lib_arm/board.c`中的start_armboot函数开始, 此处需要添加流程图

## <font color=#fea304>Uboot命令</font>

### 命令格式 
  - 课程 : **4.5 u-boot分析之u-boot命令实现**
  - 内核启动，也是通过Uboot命令来实现的。Uboot中的每个命令都通过`U_BOOT_CMD`宏来定义，格式如下 
  - > U_BOOT_CMD(name,maxargs,rep,cmd,usage,help)

    - name : 命名的名字，注意，它不是一个字符串（不要用双括号括起来）
    - maxargs : 最大参数的个数
    - repeatable : 命令是否可以重复，可重复是指运行一个命令后，下次敲回车即可再次运行
    - command ：对应的函数指针，类型为`(*cmd)(struct cmd_tbl_s*,int,int,char*[])`
    - usage : 简短的使用说明，这是个字符串
    - help : 较详细的使用说明，这是个字符串

### 命令分析

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

  - 对于每个使用U_BOOT_CMD宏来定义个命令，其实都是在`.u_boot_cmd`段中定义一个cmd_tbl_t结构，链接脚本U-BOOT.lds中如下代码：

``` protobuf
	__u_boot_cmd_start = .;
	.u_boot_cmd : { *(.u_boot_cmd) }
	__u_boot_cmd_end = .;
```
  - 程序中就是根据命名的名字在内存段`_u_boot_cmd_start ~ _boot_cmd_end`找到他的cmd_tbl_t结构，然后调用它的函数,(请参考common/command.c中的`find_cmd`函数)

## <font color=#fea304>启动内核</font>

### 分区介绍
  - 课程 ：**4.6 u-boot分析_uboot启动内核**
  - Linux分区源代码中已固定，参见`include\configs\100ask24x0.h`

``` stylus
#define MTDIDS_DEFAULT "nand0=nandflash0"
#define MTDPARTS_DEFAULT "mtdparts=nandflash0:256k@0(bootloader)," \
                            "128k(params)," \
                            "2m(kernel)," \
                            "-(root)"
```

![enter description here][4]


### do_boot() do_bootm_linux()主要做什么
   - do_boot() 主要读取头部，移动内核至加载地址 
   - > uboot中的环境变量 bootcmd=nand read.jffs2 0x30007FC0 kernel; bootm 0x30007FC0

     - 从nand读出内核，
     - 加载地址`0x30007FC0`  入口地址`0x30008000`      
   - do_bootm_linux() 启动内核

### 内核设置启动参数
   - Uboot通过标记列表向内核传递参数，命令行标记的示例代码就是取自Uboot中的`setup_memory_tags、setup_commandline_tag`它们都是在`lib_arm/armlinux.c`中定义
   - 对于ARM架构的CPU，都是通过`lib_arm/armlinux.c`中的`do_bootm_limux`函数来启动内核。这个函数中，设置标记列表，最后通过`theKernel (0, bd->bi_arch_number, bd->bi_boot_params)`调用内核。
      - theKernel  指向内核存放的地址（ARM架构的CPU，通常是0x30008000）
      - bd-bi_arch_number  前面'board_init'函数设置的机器类型ID
      - bi_boot_paras  标记列表的开始地址 	


  [1]: http://oimqf80rv.bkt.clouddn.com/1489806728251.jpg "图1.jpg"
  [2]: http://pan.baidu.com/s/1qXIgDA0
  [3]: http://pan.baidu.com/s/1hs1IkIS
  [4]: http://oimqf80rv.bkt.clouddn.com/1489806728224.jpg "uboot-1.jpg"
