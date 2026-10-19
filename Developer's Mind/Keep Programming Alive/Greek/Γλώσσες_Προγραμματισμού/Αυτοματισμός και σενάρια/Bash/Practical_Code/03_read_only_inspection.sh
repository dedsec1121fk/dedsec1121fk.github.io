#!/usr/bin/env bash
set -euo pipefail
folder="${1:-.}"
[[ -d "$folder" ]] || { printf 'Missing folder: %s
' "$folder" >&2; exit 2; }
find "$folder" -maxdepth 1 -type f -print
