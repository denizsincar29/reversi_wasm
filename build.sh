#!/bin/bash

# Build Reversi WASM and optionally serve it locally
# Compatible with Git Bash and Linux

set -e

echo "=== Building Reversi WASM ==="
wasm-pack build --target web --release

echo ""
echo "✓ WASM build complete!"
echo ""
echo "Generated files are in: ./pkg/"
echo "  - reversi_wasm.js (WASM interface)"
echo "  - reversi_wasm_bg.wasm (compiled WASM)"
echo "  - reversi_wasm.d.ts (TypeScript definitions)"
echo ""

# Create a simple serve folder with HTML/CSS/JS and WASM
echo "Setting up serve folder..."
mkdir -p serve
cp pkg/reversi_wasm.js serve/
cp pkg/reversi_wasm_bg.wasm serve/
cp index.html serve/
cp style.css serve/
cp script.js serve/
cp -r sounds serve/ 2>/dev/null || true

echo "✓ Serve folder ready: ./serve/"
echo ""

# Ask user if they want to start HTTP server
read -p "Start HTTP server on port 8000? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting server..."
    echo "Visit http://localhost:8000"
    echo ""
    cd serve
    uv run python -m http.server 8000
else
    echo "To start the server manually, run:"
    echo "  cd serve && uv run python -m http.server 8000"
fi
