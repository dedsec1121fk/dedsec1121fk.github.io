#!/usr/bin/env bash
set -euo pipefail
name="${1:-Programmer}"
printf 'Hello, %s!
' "$name"
