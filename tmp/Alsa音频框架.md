---
title: Alsa音频框架
date: 2017-04-26 21:07:12
tags:
---

## 编译环境

 - Linux-3.4.2 
 - arm-linux-gcc-4.3.2 
 - JZ2440开发板(S3C2440)

## 移植WM8976驱动


## 编译Alsa

 - 编译 alsa-lib-1.0.27.2
   - 修改环境变量`sudo mv /usr /usr_bak`
   - `export PATH=/usr_bak/local/sbin:/usr_bak/local/bin:/usr_bak/sbin:/usr_bak/bin:/sbin:/bin:/usr_bak/games:/usr_bak/local/arm/4.3.2/bin`
   - 配置： ./configure --host=arm-linux
   - 编译： make 
   - `udo mkdir /usr`
   - `sudo chown book:book /usr`
   - 安装: `sudo cp -rf /usr /work/projects/alsa/`
   - 修改环境变量: `sudo rm -rf /usr`
   - `sudo mv /usr_bak /usr`
   - `export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/arm/4.3.2/bin`
   - 把头文件和库复制到交叉工具链里
   - `cd /work/projects/alsa/usr/include`
   - `sudo cp * -rfd /usr/local/arm/4.3.2/arm-none-linux-gnueabi/libc/usr/include`
   - `cd /work/projects/alsa/usr/lib`
   - `sudo cp * -rfd /usr/local/arm/4.3.2/arm-none-linux-gnueabi/libc/armv4t/lib`
   - 把库复制到根文件系统的lib目录下`cd /work/projects/alsa`
   - `sudo -rfd usr /work/nfs_root/fs_mini_mdev_new`
 - 编译 alsa-utils-1.0.27.2
   - 先编译依赖 `tar xjf ncurses-5.9.tar.gz`
   - ./configure --host=arm-linux --prefix=$PWD/tmp --with-shared
   - make && make install
   - 把头文件和库复制进交叉工具链里 `cd /work/projects/alsa/ncurses-5.9/tmp/include/ncurses`
   - `sudo cp * -rfd /usr/local/arm/4.3.2/arm-none-linux-gnueabi/libc/usr/include`
   - `cd /work/projects/alsa/ncurses-5.9/tmp/include/`
   - `sudo cp * -rfd /usr/local/arm/4.3.2/arm-none-linux-gnueabi/libc/usr/include`
   - `cd /work/projects/alsa/ncurses-5.9/tmp/lib`
   - `sudo cp * -rfd /usr/local/arm/4.3.2/arm-none-linux-gnueabi/libc/armv4t/lib`
   - 把库复制到根文件系统的lib目录下`cd /work/projects/alsa/ncurses-5.9/tmp/lib`
   - `sudo cp *so* -rfd /work/nfs_root/fs_mini_mdev_new/lib`
   - 编译util`./configure --host=arm-linux --prefix=$PWD/tmp --with-curses=ncurses --disable-xmlto --disable-nls`
   - make && sudo make install
 - 测试
   - mkdir /dev/snd
   - cd /dev/snd/
   - ln -s /dev/controlC0 
   - ln -s /dev/pcmC0D0p 
   - ln -s /dev/pcmC0D0c
   - 测试播放音频 `aplay Windows.wav`

## 编写应用程序

 - wav_parser 主要对wav音频文件的分析和封装
 - capture 具体实现录音操作

## ffmpeg转换

 - 音频文件采样率转换为48k wav 格式文件
   - 具体实现: `ffmpeg -i input.wav -ar 48k output.wav `
 - 音频文件转换为mp3格式的文件
   - 具体实现: `ffmpeg -i input.wav  output.mps`

## Audacity 

 - 查看录音频谱
![enter description here][1]

## sndpeek分析音频数据



  [1]: http://oimqf80rv.bkt.clouddn.com/alsa_1.jpg "alsa_1.jpg"
