Tiny Local AI Demo
==================

This small demo shows how to run a very small text-generation model locally and connect to it from the browser (`tiny_ai.html`). The demo uses `distilgpt2` via Hugging Face Transformers and a tiny Flask server.

Prerequisites
-------------
- Python 3.9+ (3.10/3.11 recommended)
- Git (optional)

Setup (macOS / Linux / Windows WSL)
----------------------------------
1. Create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate   # macOS / Linux
venv\Scripts\activate     # Windows (PowerShell)
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

Note: `torch` installation will download a CPU or GPU wheel depending on your platform. If you want a CPU-only wheel, you can follow PyTorch's instructions:

```bash
# Example for CPU-only (may vary by platform)
pip install --index-url https://download.pytorch.org/whl/cpu torch
```

3. Start the local server (this will download the model the first time):

```bash
python server.py
```

4. Open the demo in the browser at:

```
http://127.0.0.1:8000/
```

The page will POST to `/generate` on the same origin so you won't get CORS/file:// issues.

Notes
-----
- `distilgpt2` is relatively small but still requires some RAM and will take time to download the first time.
- For a truly tiny footprint you can explore tiny LLMs or quantized models (e.g., onnx / GGML variants), but setup will be different.
- If you want to expose the server on a network, adjust `app.run()` in `server.py` and be aware of security implications.

WebLLM (alternative)
---------------------
If you prefer to run a WebLLM instance (which serves models via WebSocket and/or in-browser runtimes) instead of the Python Flask server, you can:

1. Install or download a WebLLM distribution or follow the WebLLM repository instructions for your platform.
2. Download a compatible model (GGUF/ggml, or another supported format) and configure WebLLM to serve it.
3. Start WebLLM so it exposes a WebSocket endpoint, commonly at `ws://127.0.0.1:11434/` (check your WebLLM config for the exact address).
4. In the demo UI at `http://127.0.0.1:8000/` choose the **WebLLM** backend from the dropdown and click Generate.

Notes about WebLLM compatibility:
- Different WebLLM versions expose different WebSocket message formats; the demo includes a best-effort WebSocket client that attempts a generic `{"type":"generate","input":...,"parameters":{...}}` request and looks for common response fields (`result`, `text`, `output`).
- If your WebLLM server expects a different protocol, you can adapt the `webllmGenerate` function in `tiny_ai.html` to match it.
- Running models with WebLLM may require model files to be present locally and may have different hardware requirements.

Troubleshooting
---------------
- If the browser shows a CORS error, ensure `flask-cors` is installed and the server logs show startup without errors.
- If model loading fails due to memory or missing wheel, try installing a CPU-only `torch` wheel or use a smaller model.