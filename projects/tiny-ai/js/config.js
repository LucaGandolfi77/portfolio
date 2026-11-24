/* Tiny AI — verified models, backends and bilingual strings */

export const HF_API = 'https://huggingface.co/api/models/';
export const WEBLLM_CONFIG = 'https://raw.githubusercontent.com/mlc-ai/web-llm/main/src/config.ts';
export const OPENROUTER = 'https://openrouter.ai/api/v1';

/* All ids below were verified against HF API on 2026-11-24 (HTTP 200 + ONNX folder). */
export const MODELS = {
  transformersjs: [
    /* ultra-tiny — best for iPhone via WASM */
    { id:'onnx-community/TinyStories-1M-ONNX', label:'TinyStories 1M', size:15, tier:'tiny', verified:true },
    { id:'onnx-community/TinyStories-3M-ONNX', label:'TinyStories 3M', size:22, tier:'tiny', verified:true },
    /* small instruct — verified ONNX q4f16, real chat models */
    { id:'onnx-community/SmolLM2-135M-Instruct-ONNX-GQA', label:'SmolLM2 135M GQA ⭐', size:112, tier:'small', verified:true },
    { id:'onnx-community/SmolLM2-135M-Instruct-ONNX', label:'SmolLM2 135M Instruct', size:112, tier:'small', verified:true },
    { id:'onnx-community/LFM2.5-350M-ONNX', label:'LFM 2.5 350M', size:243, tier:'small', verified:true },
    { id:'onnx-community/gemma-3-270m-it-ONNX', label:'Gemma 3 270M ⭐', size:260, tier:'small', verified:true },
    { id:'onnx-community/SmolLM2-360M-Instruct-ONNX', label:'SmolLM2 360M Instruct', size:260, tier:'small', verified:true },
    { id:'onnx-community/Qwen3.5-0.8B-Text-ONNX', label:'Qwen 3.5 0.8B Text', size:448, tier:'small', verified:true },
    { id:'onnx-community/Qwen3-0.6B-ONNX', label:'Qwen3 0.6B', size:543, tier:'small', verified:true },
    { id:'onnx-community/gemma-3-1b-it-ONNX', label:'Gemma 3 1B', size:728, tier:'medium', verified:true },
    { id:'onnx-community/Qwen3-1.7B-ONNX', label:'Qwen3 1.7B', size:1360, tier:'medium', verified:true },
    { id:'onnx-community/Qwen3.5-2B-ONNX', label:'Qwen 3.5 2B', size:1509, tier:'medium', verified:true },
    { id:'onnx-community/Llama-3.2-1B-Instruct-ONNX', label:'Llama 3.2 1B', size:1039, tier:'medium', verified:true },
    { id:'onnx-community/Qwen3-4B-ONNX', label:'Qwen3 4B', size:2702, tier:'large', verified:true },
    { id:'onnx-community/Phi-4-mini-instruct-ONNX', label:'Phi 4 Mini', size:2433, tier:'large', verified:true }
  ],
  webgpu: [
    /* Verified against @mlc-ai/web-llm 0.2.89 prebuiltAppConfig.
       NOTE: SmolLM2-135M has NO q4f16_1 variant — only q0f16/q0f32. */
    { id:'SmolLM2-135M-Instruct-q0f16-MLC', label:'SmolLM2 135M (Tiny)', size:180, tier:'small', verified:true },
    { id:'SmolLM2-360M-Instruct-q4f16_1-MLC', label:'SmolLM2 360M', size:250, tier:'small', verified:true },
    { id:'Qwen3-0.6B-q4f16_1-MLC', label:'Qwen3 0.6B', size:400, tier:'small', verified:true },
    { id:'gemma3-1b-it-q4f16_1-MLC', label:'Gemma 3 1B', size:900, tier:'medium', verified:true },
    { id:'Llama-3.2-1B-Instruct-q4f16_1-MLC', label:'Llama 3.2 1B', size:1000, tier:'medium', verified:true },
    { id:'SmolLM2-1.7B-Instruct-q4f16_1-MLC', label:'SmolLM2 1.7B', size:1200, tier:'medium', verified:true },
    { id:'Qwen3-1.7B-q4f16_1-MLC', label:'Qwen3 1.7B', size:1200, tier:'medium', verified:true },
    { id:'Qwen3-4B-q4f16_1-MLC', label:'Qwen3 4B', size:2600, tier:'large', verified:true },
    { id:'Phi-4-mini-instruct-q4f16_1-MLC', label:'Phi 4 Mini', size:2600, tier:'large', verified:true }
  ],
  openrouter: [
    { id:'google/gemma-3-1b-it:free', label:'Gemma 3 1B', tier:'cloud' },
    { id:'google/gemma-3-4b-it:free', label:'Gemma 3 4B', tier:'cloud' },
    { id:'meta-llama/llama-3.2-1b-instruct:free', label:'Llama 3.2 1B', tier:'cloud' },
    { id:'qwen/qwen3-8b:free', label:'Qwen3 8B', tier:'cloud' },
    { id:'deepseek/deepseek-v3-0324:free', label:'DeepSeek V3', tier:'cloud' },
    { id:'microsoft/phi-4-mini:free', label:'Phi 4 Mini', tier:'cloud' }
  ]
};

export const BACKENDS = [
  { id:'transformersjs', en:'In-browser · Transformers.js', it:'Nel browser · Transformers.js', icon:'⚡', recommended:true },
  { id:'webgpu', en:'In-browser · WebLLM (WebGPU)', it:'Nel browser · WebLLM (WebGPU)', icon:'🚀' },
  { id:'openrouter', en:'Cloud · OpenRouter', it:'Cloud · OpenRouter', icon:'☁️' },
  { id:'server', en:'Advanced · Local server', it:'Avanzate · Server locale', icon:'🖥️', advanced:true },
  { id:'webllm', en:'Advanced · WebLLM socket', it:'Avanzate · WebLLM socket', icon:'🔌', advanced:true }
];

export const TIERS = {
  tiny: { en:'Tiny · <50 MB', it:'Micro · <50 MB', color:'#5ef0a8' },
  small: { en:'Small · <500 MB', it:'Piccoli · <500 MB', color:'#4de8ff' },
  medium: { en:'Medium · <2 GB', it:'Medi · <2 GB', color:'#ffd166' },
  large: { en:'Large · >2 GB', it:'Grandi · >2 GB', color:'#ff6b9d' },
  cloud: { en:'Cloud · API key', it:'Cloud · chiave API', color:'#a98bff' }
};

export const PRESETS = [
  { id:'balanced', en:'Balanced', it:'Bilanciato', temperature:0.7, maxTokens:256, system:'' },
  { id:'creative', en:'Creative', it:'Creativo', temperature:1.1, maxTokens:384, system:'You are a creative writing partner.' },
  { id:'precise', en:'Precise', it:'Preciso', temperature:0.2, maxTokens:256, system:'Answer concisely and factually.' },
  { id:'code', en:'Code', it:'Codice', temperature:0.3, maxTokens:512, system:'You are a senior developer. Answer with clean code and brief explanations.' }
];

export const DEFAULT_SETTINGS = Object.freeze({
  backend:'transformersjs', model:'onnx-community/TinyStories-3M-ONNX',
  device:'auto', temperature:0.7, maxTokens:256, theme:'dark', lang:'en', showAdvanced:false
});

export const STR = {
  it: {
    skip:'Vai al contenuto', title:'TINY AI', tagline:'Modelli reali, nel tuo browser. Nessun server, nessuna chiave.',
    backend:'Backend', model:'Modello', device:'Dispositivo', tokens:'Token', temperature:'Temperatura',
    system:'Prompt di sistema', preset:'Preset', conversations:'Conversazioni', newChat:'Nuova chat',
    clearChat:'Pulisci chat', clearCache:'Cancella cache modelli', apiKey:'Chiave API',
    send:'Invia', typeMessage:'Scrivi un messaggio…', thinking:'Pensiero…', loading:'Caricamento modello…',
    verify:'Verifica modelli', verified:'Verificato', unavailable:'Non disponibile', online:'Online',
    offline:'Offline', capabilities:'Capacità dispositivo', ram:'RAM stimata', download:'Download stimato',
    speed:'Velocità', tokensPerSec:'token/s', copy:'Copia', copied:'Copiato', exportMd:'Esporta MD',
    exportJson:'Esporta JSON', delete:'Elimina', search:'Cerca chat…', settings:'Impostazioni',
    advanced:'Avanzate', errors:'Errore', noModels:'Nessun modello compatibile',
    modelReady:'Modello pronto', modelError:'Impossibile caricare il modello', stop:'Ferma',
    welcome:'Scegli un modello verificato e inizia a chattare. I modelli piccoli girano anche su iPhone via WASM.',
    lang:'IT / EN', theme:'Tema', ok:'OK', cancel:'Annulla', confirmClear:'Cancellare tutti i modelli salvati?',
    context:'Contesto', memory:'Memoria', gpu:'WebGPU', wasm:'WASM', webnn:'WebNN', unsupported:'Non supportato'
  },
  en: {
    skip:'Skip to content', title:'TINY AI', tagline:'Real models, in your browser. No server, no key.',
    backend:'Backend', model:'Model', device:'Device', tokens:'Tokens', temperature:'Temperature',
    system:'System prompt', preset:'Preset', conversations:'Conversations', newChat:'New chat',
    clearChat:'Clear chat', clearCache:'Clear model cache', apiKey:'API key',
    send:'Send', typeMessage:'Type a message…', thinking:'Thinking…', loading:'Loading model…',
    verify:'Verify models', verified:'Verified', unavailable:'Unavailable', online:'Online',
    offline:'Offline', capabilities:'Device capabilities', ram:'Estimated RAM', download:'Estimated download',
    speed:'Speed', tokensPerSec:'tok/s', copy:'Copy', copied:'Copied', exportMd:'Export MD',
    exportJson:'Export JSON', delete:'Delete', search:'Search chats…', settings:'Settings',
    advanced:'Advanced', errors:'Error', noModels:'No compatible models',
    modelReady:'Model ready', modelError:'Could not load model', stop:'Stop',
    welcome:'Pick a verified model and start chatting. Small models run on iPhone via WASM too.',
    lang:'IT / EN', theme:'Theme', ok:'OK', cancel:'Cancel', confirmClear:'Delete all cached models?',
    context:'Context', memory:'Memory', gpu:'WebGPU', wasm:'WASM', webnn:'WebNN', unsupported:'Unsupported'
  }
};
