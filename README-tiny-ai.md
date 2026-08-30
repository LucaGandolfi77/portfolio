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

In-browser models (Transformers.js) — no server, no key
------------------------------------------------------
The **In-Browser (Transformers.js)** backend runs small state-of-the-art models entirely on
your device, with **no API key and no local server**. It loads prebuilt, quantized ONNX
weights from Hugging Face and runs them on **WebGPU** when available, with an automatic
**WASM** fallback (works even on iPhone Safari). The loader tries `q4` → `q4f16` → `fp16`
in cascade, so models that only ship one variant (e.g. `Qwen3-4B-ONNX` with `model_q4f16`)
still load. Current verified model IDs (all public, text-generation only — multimodal
models like Gemma 4 E2B/E4B are intentionally excluded because they need vision/audio
inputs and only expose `q2f16` weights):

| Model | Size | Download (q4f16) | Notes |
|---|---|---|---|
| `onnx-community/TinyStories-1M-ONNX` | 1M | ≈ 15 MB | ⚡ ultra-tiny, storie per bambini |
| `onnx-community/TinyStories-3M-ONNX` | 3M | ≈ 22 MB | ⚡ ultra-tiny, storie per bambini |
| `onnx-community/distilgpt2-ONNX` | 82M | ≈ 156 MB | ⚡ ultra-tiny, GPT-2 distillato |
| `onnx-community/SmolLM2-135M-Instruct-ONNX-GQA` | 135M | ≈ 112 MB | instruct, consigliato |
| `onnx-community/SmolLM-135M-ONNX` | 135M | ≈ 112 MB | base |
| `onnx-community/gemma-3-270m-it-ONNX` | 270M | — | Gemma 3 tiny |
| `onnx-community/SmolLM2-135M-ONNX` | 135M | ≈ 112 MB | alias q4 |
| `onnx-community/Qwen2.5-0.5B-Instruct` | 0.5B | ≈ 460 MB | Qwen 2.5 |
| `onnx-community/SmolLM2-360M-ONNX` | 360M | — | small |
| `onnx-community/gemma-3-1b-it-ONNX-GQA` | 1B | — | Gemma 3 instruct |
| `onnx-community/Qwen3-0.6B-ONNX` | 0.6B | — | modern (Qwen3) |
| `onnx-community/Qwen3.5-0.8B-Text-ONNX` | 0.8B | — | Qwen 3.5 |
| `onnx-community/Qwen3-1.7B-ONNX` | 1.7B | — | Qwen3 |
| `onnx-community/Llama-3.2-1B-Instruct-ONNX` | 1B | — | Llama 3.2 |
| `onnx-community/Llama-3.2-3B-Instruct-ONNX` | 3B | — | Llama 3.2 |
| `onnx-community/Qwen3-4B-ONNX` | 4B | — | loads via q4f16 |
| `onnx-community/Phi-4-mini-instruct-ONNX` | 3.8B | — | Phi 4 Mini |
| `onnx-community/Qwen3.5-2B-ONNX` | 2B | — | Qwen 3.5 |

**Per iPhone/iPad**: parti dai modelli **⚡ Ultra-tiny** (TinyStories 1M ≈ 15 MB, TinyStories 3M ≈ 22 MB,
DistilGPT2 82M): download rapidi e girano ovunque anche in WASM puro.

First run downloads the weights (roughly 100–600 MB depending on model) and caches them in
the browser storage; later runs are instant. Choose the device with the **Device** selector
(Auto → WebGPU → WASM).

In-browser models (WebGPU / Web-LLM)
------------------------------------
The **In-Browser (WebGPU)** backend uses `@mlc-ai/web-llm` (MLC) with prebuilt
`-q4f16_1-MLC` models — a curated, verified list from the current web-llm registry:
SmolLM2 135M/360M/1.7B, Qwen 2.5 0.5B/1.5B/3B (+Coder), Qwen3 0.6B/1.7B/4B,
Qwen 3.5 0.8B/2B/4B, Llama 3.2 1B/3B, TinyLlama 1.1B, Gemma 2 2B, Gemma 3 1B,
Phi 3.5 Mini / Phi 4 Mini, DeepSeek R1 Distill 1.5B, OLMo 2 1B, Ministral 3 3B.
Requires a WebGPU-capable browser (Chrome/Edge on desktop; check caniuse.com/webgpu).

Troubleshooting
---------------
- If the browser shows a CORS error, ensure `flask-cors` is installed and the server logs show startup without errors.
- If model loading fails due to memory or missing wheel, try installing a CPU-only `torch` wheel or use a smaller model.
- For the Transformers.js backend, if a model fails to load, try the **WASM** device or a smaller model (135M/0.5B).