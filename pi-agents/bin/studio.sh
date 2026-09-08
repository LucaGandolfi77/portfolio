#!/usr/bin/env bash
set -euo pipefail

STUDIO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== FARO STUDIO ==="
echo "Directory: $STUDIO_DIR"
echo "Agents:    $(find "$STUDIO_DIR/.pi/agents" -name '*.md' 2>/dev/null | wc -l) files"
echo "Graphs:    $(ls "$STUDIO_DIR/graphs/"*.json 2>/dev/null | wc -l) playbooks"
echo ""
echo "Enter the pi session below. The cwd is this directory."
echo "Try: agent_team catalog"
echo ""

cd "$STUDIO_DIR"
exec pi session 2>/dev/null || (echo "Note: run this inside a pi session manually with 'pi' from the directory." && bash)
