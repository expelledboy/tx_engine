#!/bin/bash

array[0]="pay"
array[1]="deduct"
array[2]="log"
array[3]="test"

size=${#array[@]}
index=$((RANDOM % size))
trx_type=${array[$index]}

export trx_type
