#!/usr/bin/env bash

for script in scripts/*client*; 
  do  
    echo "$script"
    ./"$script" --concurrency 1000 --duration 15
done
