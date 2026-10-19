#!/usr/bin/env bash
set -euo pipefail
temp_file="$(mktemp)"
trap 'rm -f -- "$temp_file"' EXIT
printf 'temporary data
' > "$temp_file"
cat -- "$temp_file"
