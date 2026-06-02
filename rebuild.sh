#!/usr/bin/env bash
# rebuild.sh — deploy Reversi WASM frontend to /var/www/html/reversi
#
# What it does:
#   • Copies every static frontend file (HTML, CSS, JS, sounds) and the
#     pre-built WASM artefacts from pkg/ to DEST
#   • Skips .git, src/, tests/, *.sh, *.md, *.toml, package*.json, *.py
#   • Never deletes manually-added server-side files in DEST
#
# Prerequisites:
#   Run build.sh first to produce pkg/reversi_wasm.js and
#   pkg/reversi_wasm_bg.wasm, then run this script to deploy.
#
# Usage:
#   ./rebuild.sh              — deploy to default target
#   ./rebuild.sh /other/path  — deploy to a custom target

set -euo pipefail

SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${1:-/var/www/html/reversi}"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}==> reversi rebuild${NC}"
echo    "    src : $SRC"
echo    "    dest: $DEST"
echo

# ── Preflight ──────────────────────────────────────────────────────────────────
if [[ ! -f "$SRC/index.html" ]]; then
    echo -e "${RED}ERROR: run this script from the repo root (index.html not found)${NC}"
    exit 1
fi

if [[ ! -f "$SRC/pkg/reversi_wasm_bg.wasm" ]]; then
    echo -e "${RED}ERROR: pkg/reversi_wasm_bg.wasm not found.${NC}"
    echo    "       Run ./build.sh first to compile the WASM artefacts."
    exit 1
fi

# Create dest if needed
if [[ ! -d "$DEST" ]]; then
    echo -e "${YELLOW}  creating $DEST${NC}"
    mkdir -p "$DEST"
fi

# ── Copy static files with rsync ───────────────────────────────────────────────
# --checksum        only copy when content differs
# No --delete: never remove manually-added server-side files

rsync -av --checksum \
    --exclude='.git/'             \
    --exclude='src/'              \
    --exclude='tests/'            \
    --exclude='test-results/'     \
    --exclude='*.sh'              \
    --exclude='*.md'              \
    --exclude='*.toml'            \
    --exclude='*.py'              \
    --exclude='*.bak'             \
    --exclude='package.json'      \
    --exclude='package-lock.json' \
    --exclude='task.md'           \
    --exclude='*.txt'             \
    "$SRC/" "$DEST/"

echo
echo -e "${GREEN}==> Done.${NC}"
echo    "    Deployed to $DEST"
echo    "    Served at  https://reversi.denizsincar.ru"
