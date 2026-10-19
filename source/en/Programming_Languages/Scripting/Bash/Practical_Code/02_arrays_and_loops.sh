#!/usr/bin/env bash
set -euo pipefail
names=('Ada' 'Grace' 'Linus')
for name in "${names[@]}"; do
  printf 'Name: %s
' "$name"
done
