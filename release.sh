#!/bin/bash

echo "git pull"

git pull origin master 

echo "release version $date"

hexo g && hexo d
