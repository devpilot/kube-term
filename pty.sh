#!/bin/bash

trap "ctrl_c" SIGINT
function ctrl_c (){
    echo ""
}

while true; do
        read -p "$(tput setaf 214)user@host$(tput sgr0)~$ kubectl " ARGS
        kubectl $ARGS
done
