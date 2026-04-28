#!/bin/bash

# Build Reversi WASM and optionally serve it locally
# Compatible with Git Bash and Linux

set -e

# Load .env if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

SERVE_DIR=${SERVE_DIR:-serve}
SUDO_TO_SERVE=${SUDO_TO_SERVE:-false}
CHOWN_WWW=${CHOWN_WWW:-false}

echo "=== Building Reversi WASM ==="
if command -v wasm-pack >/dev/null 2>&1; then
    wasm-pack build --target web --release
else
    echo "wasm-pack not found, using cargo and wasm-bindgen directly..."
    cargo build --target wasm32-unknown-unknown --release
    mkdir -p pkg
    wasm-bindgen --target web --out-dir pkg --no-typescript target/wasm32-unknown-unknown/release/reversi_wasm.wasm
fi

echo ""
echo "✓ WASM build complete!"
echo ""
echo "Generated files are in: ./pkg/"
echo "  - reversi_wasm.js (WASM interface)"
echo "  - reversi_wasm_bg.wasm (compiled WASM)"
echo "  - reversi_wasm.d.ts (TypeScript definitions)"
echo ""

# Create a simple serve folder with HTML/CSS/JS and WASM
echo "Setting up serve folder: $SERVE_DIR"

CMD_PREFIX=""
if [ "$SUDO_TO_SERVE" = "true" ]; then
    CMD_PREFIX="sudo"
fi

$CMD_PREFIX mkdir -p "$SERVE_DIR"
$CMD_PREFIX mkdir -p "$SERVE_DIR/js"

$CMD_PREFIX cp pkg/reversi_wasm.js "$SERVE_DIR/"
$CMD_PREFIX cp pkg/reversi_wasm_bg.wasm "$SERVE_DIR/"
$CMD_PREFIX cp index.html "$SERVE_DIR/"
$CMD_PREFIX cp style.css "$SERVE_DIR/"
$CMD_PREFIX cp js/*.js "$SERVE_DIR/js/"
$CMD_PREFIX cp phrases.js "$SERVE_DIR/" 2>/dev/null || true
$CMD_PREFIX cp -r sounds "$SERVE_DIR/" 2>/dev/null || true

if [ "$CHOWN_WWW" = "true" ]; then
    echo "Changing ownership of $SERVE_DIR to www-data:www-data"
    $CMD_PREFIX chown -R www-data:www-data "$SERVE_DIR"
fi

echo "✓ Serve folder ready: $SERVE_DIR"
echo ""

# If SERVE_DIR is provided in .env, don't ask to run http server
if [ -n "$SERVE_DIR_FROM_ENV" ] || [ -f .env ] && grep -q "^SERVE_DIR=" .env; then
    echo "SERVE_DIR specified in .env, skipping HTTP server prompt."
else
    # Ask user if they want to start HTTP server
    read -p "Start HTTP server on port 8000? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Starting server..."
        echo "Visit http://localhost:8000"
        echo ""
        cd "$SERVE_DIR"
        python3 -m http.server 8000
    else
        echo "To start the server manually, run:"
        echo "  cd $SERVE_DIR && python3 -m http.server 8000"
    fi
fi
