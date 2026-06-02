#!/usr/bin/env bash
# rebuild.sh — build WASM and deploy Reversi frontend to /var/www/html/reversi
#
# What it does:
#   1. Builds the WASM package with wasm-pack (or cargo + wasm-bindgen)
#   2. Copies only the static frontend files and pkg/ artefacts to DEST
#   3. Never deletes manually-added server-side files in DEST
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

# ── Build WASM ────────────────────────────────────────────────────────────────
cd "$SRC"
echo -e "${GREEN}==> Building WASM...${NC}"
if command -v wasm-pack >/dev/null 2>&1; then
    wasm-pack build --target web --release
else
    echo -e "${YELLOW}  wasm-pack not found, falling back to cargo + wasm-bindgen${NC}"
    cargo build --target wasm32-unknown-unknown --release
    mkdir -p pkg
    wasm-bindgen --target web --out-dir pkg --no-typescript \
        target/wasm32-unknown-unknown/release/reversi_wasm.wasm
fi
echo -e "${GREEN}==> WASM build complete${NC}"
echo

# ── Create dest if needed ─────────────────────────────────────────────────────
if [[ ! -d "$DEST" ]]; then
    echo -e "${YELLOW}  creating $DEST${NC}"
    mkdir -p "$DEST"
fi
mkdir -p "$DEST/js" "$DEST/sounds" "$DEST/pkg"

# ── Deploy: explicit file list, no surprises ──────────────────────────────────
echo -e "${GREEN}==> Copying frontend files...${NC}"

# Root static files
cp index.html style.css "$DEST/"

# JS modules
cp js/*.js "$DEST/js/"

# Sounds
cp sounds/*.wav "$DEST/sounds/"

# WASM artefacts (only the two files the browser needs)
cp pkg/reversi_wasm.js "$DEST/pkg/"
cp pkg/reversi_wasm_bg.wasm "$DEST/pkg/"

echo
echo -e "${GREEN}==> Done.${NC}"
echo    "    Deployed to $DEST"
echo    "    Served at  https://reversi.denizsincar.ru"
