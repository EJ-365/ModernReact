#!/bin/bash
cd "$(dirname "$0")" || exit 1
if command -v python3 >/dev/null 2>&1; then exec python3 serve.py; fi
echo "Penwright needs Python 3 to start. macOS will offer to install it (Command Line Tools),"
echo "or get it from https://www.python.org/downloads/ and double-click this file again."
python3 --version >/dev/null 2>&1
read -r -p "Press Enter to close."
