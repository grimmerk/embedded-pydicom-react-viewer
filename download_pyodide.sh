#!/bin/bash

# Download Pyodide 0.29.3 core files and required packages
# from jsDelivr CDN to public/pyodide/

BASEDIR=$(dirname "$0")
PYODIDE_DIR="$BASEDIR/public/pyodide"
CDN_BASE="https://cdn.jsdelivr.net/pyodide/v0.29.3/full"

mkdir -p "$PYODIDE_DIR"

echo "Downloading Pyodide 0.29.3 core files..."
curl -fL "$CDN_BASE/pyodide.js" -o "$PYODIDE_DIR/pyodide.js"
curl -fL "$CDN_BASE/pyodide.asm.js" -o "$PYODIDE_DIR/pyodide.asm.js"
curl -fL "$CDN_BASE/pyodide.asm.wasm" -o "$PYODIDE_DIR/pyodide.asm.wasm"
curl -fL "$CDN_BASE/python_stdlib.zip" -o "$PYODIDE_DIR/python_stdlib.zip"
curl -fL "$CDN_BASE/pyodide-lock.json" -o "$PYODIDE_DIR/pyodide-lock.json"

echo "Downloading numpy and micropip wheels..."
curl -fL "$CDN_BASE/numpy-2.2.5-cp313-cp313-pyodide_2025_0_wasm32.whl" -o "$PYODIDE_DIR/numpy-2.2.5-cp313-cp313-pyodide_2025_0_wasm32.whl"
curl -fL "$CDN_BASE/micropip-0.11.0-py3-none-any.whl" -o "$PYODIDE_DIR/micropip-0.11.0-py3-none-any.whl"

echo "Downloading pydicom 2.4.4 wheel from PyPI..."
curl -fL "https://files.pythonhosted.org/packages/35/2a/8c0f6fe243e6b6793868c6834203a44cc8f3f25abad780e1c7b21e15594d/pydicom-2.4.4-py3-none-any.whl" -o "$PYODIDE_DIR/pydicom-2.4.4-py3-none-any.whl"

echo "Done. Files in $PYODIDE_DIR:"
ls -lh "$PYODIDE_DIR"
