#!/usr/bin/env bash
set -euo pipefail
greet() { printf 'Hello, %s!\n' "$1"; }
greet 'Ada'
