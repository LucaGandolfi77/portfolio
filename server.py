from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

app = Flask(__name__, static_folder='.', static_url_path='')
# Allow requests only from the local demo page (avoid CSRF abuse of localhost)
CORS(app, origins=['http://127.0.0.1:8000', 'http://localhost:8000'])

logging.basicConfig(level=logging.INFO)

MAX_PROMPT_LENGTH = 2000
MAX_GENERATED_LENGTH = 512

try:
    # Load a small model (distilgpt2) for local text-generation demo
    from transformers import pipeline
    logging.info('Loading model (this may take a while on first run)...')
    generator = pipeline('text-generation', model='distilgpt2')
    logging.info('Model loaded.')
except Exception as e:
    logging.error('Failed to load model: %s', e)
    generator = None

@app.route('/generate', methods=['POST'])
def generate():
    if generator is None:
        return jsonify({'error': 'Model not available. Check server logs.'}), 503

    data = request.get_json() or {}
    prompt = data.get('prompt', '')
    if not isinstance(prompt, str) or not prompt.strip():
        return jsonify({'error': 'Empty prompt'}), 400
    prompt = prompt.strip()[:MAX_PROMPT_LENGTH]

    try:
        max_length = int(data.get('max_length', 60))
    except (TypeError, ValueError):
        max_length = 60
    max_length = max(1, min(max_length, MAX_GENERATED_LENGTH))

    try:
        out = generator(prompt, max_length=max_length, num_return_sequences=1, do_sample=True, temperature=0.95)
        text = out[0]['generated_text']
        # Optionally strip the prompt from the generated text if model echoes it
        if text.startswith(prompt):
            generated = text[len(prompt):].strip()
        else:
            generated = text
        return jsonify({'generated': generated})
    except Exception:
        logging.exception('Generation error')
        return jsonify({'error': 'Generation failed'}), 500


# Serve the demo page and static assets from the project root. Open http://127.0.0.1:8000/ in the browser.
@app.route('/', methods=['GET'])
def index():
    return app.send_static_file('tiny_ai.html')

if __name__ == '__main__':
    print('Starting server on http://127.0.0.1:8000/')
    app.run(host='127.0.0.1', port=8000)
