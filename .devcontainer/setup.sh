#! /bin/bash

pnpm i -g solhint

pip install --break-system-packages slither-analyzer

curl -L https://foundry.paradigm.xyz | bash