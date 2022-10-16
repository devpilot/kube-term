#!/bin/bash

trap "ctrl_c" SIGINT
function ctrl_c (){
    echo ""
}

# default args
user=${1:-"username"}
host=${2:-"hostname"}
kubeconfigfile=${3:-"/dev/null"}

export KUBECONFIG=$kubeconfigfile

while true; do
        read -p "$(tput setaf 214)$user@$host$(tput sgr0)~$ kubectl " ARGS
        ./kubectl $ARGS
done
