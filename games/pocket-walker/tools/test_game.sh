#!/usr/bin/env bash
# Run the headless mGBA test for pocket-walker.gba.
# Requires the mGBA python bindings; override MGBA_PYTHON if needed.
# Also requires /tmp/ereader_stubs.so when libmgba was built without
# FFmpeg (mGBA python bindings reference eReader symbols in that case).
set -e
cd "$(dirname "$0")/.."

PRELOAD=""
[ -f /tmp/ereader_stubs.so ] && PRELOAD="LD_PRELOAD=/tmp/ereader_stubs.so"

MGBA_PYTHON="${MGBA_PYTHON:-/tmp/mgba-build/python/lib.linux-x86_64-cpython-312}"
PYTHONPATH="${MGBA_PYTHON}:/tmp/pylibs${PYTHONPATH:+:$PYTHONPATH}"
export PYTHONPATH

env $PRELOAD python3 tools/test_game.py "$@"
