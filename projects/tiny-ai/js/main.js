/* Tiny AI — orchestration and model lifecycle */
import { MODELS, BACKENDS, TIERS, PRESETS, DEFAULT_SETTINGS } from './config.js';
import { detect, initLang, setLang, getLang, t } from './i18n.js';
import { profile, save, setSettings, setApiKey, newConversation, activeConversation,
  selectConversation, deleteConversation, pushMessage, clearMessages } from './storage.js';
import { detectCapabilities, fitsDevice, recommendModel } from './capabilities.js';
import { verifyAll } from './verify.js';
import { ui } from './ui.js';
import * as transformers from './backends/transformers.js';
import * as webllm from './backends/webllm.js';
import * as openrouter from './backends/openrouter.js';
import * as local from './backends/local.js';
import * as glass from './glass.js';

const $ = id => document.getElementById(id);
const caps = detectCapabilities();
let abort = null;
let busy = false;
let lastTokensPerSec = 0;

function currentModel() {
  return (MODELS[profile.settings.backend] || []).find(m => m.id === profile.settings.model) || null;
}
function renderAll() {
  ui.renderBackends(profile.settings.backend);
  ui.renderModels(profile.settings.backend, profile.settings.model, caps);
  ui.renderConversations(profile.activeId);
  ui.renderMessages(activeConversation().messages);
  ui.renderCapabilities(caps);
  $('temperature').value = profile.settings.temperature;
  $('temperatureVal').textContent = (+profile.settings.temperature).toFixed(2);
  $('maxTokens').value = profile.settings.maxTokens;
  $('device').value = profile.settings.device;
  $('systemPrompt').value = profile.settings.system || '';
  $('apiKey').value = profile.apiKey;
  $('showAdvanced').checked = !!profile.settings.showAdvanced;
  document.body.dataset.theme = profile.settings.theme || 'dark';
}
function uiFits(model) { return fitsDevice(model, caps); }

function setBackend(id) {
  if (!BACKENDS.some(b => b.id === id)) return;
  const list = MODELS[id] || [];
  const best = recommendModel(list, caps) || list[0];
  setSettings({ backend: id, model: best?.id || '' });
  transformers.clear(); webllm.clear();
  renderAll();
}
function setModel(id) {
  setSettings({ model: id });
  transformers.clear(); webllm.clear();
  ui.renderModels(profile.settings.backend, id, caps);
}
function preset(id) {
  const p = PRESETS.find(x => x.id === id); if (!p) return;
  setSettings({ temperature: p.temperature, maxTokens: p.maxTokens, system: p.system });
  renderAll(); ui.toast(p[getLang()]);
}

function stop() { abort?.abort(); abort = null; ui.hideTyping(); ui.removeStreaming(); busy = false; $('sendBtn').textContent = t('send'); }

async function send() {
  if (busy) { stop(); return; }
  const text = $('prompt').value.trim();
  if (!text) return;
  busy = true;
  $('prompt').value = ''; $('prompt').style.height = 'auto';
  $('sendBtn').textContent = t('stop');
  abort = new AbortController();
  const signal = abort.signal;

  pushMessage('user', text);
  ui.renderMessages(activeConversation().messages);
  ui.typing(t('thinking'));

  const model = currentModel();
  const started = performance.now();
  let out = '';
  try {
    const common = {
      messages: activeConversation().messages.filter(m => m.role !== 'system').map(({ role, content }) => ({ role, content })),
      modelId: profile.settings.model,
      maxTokens: profile.settings.maxTokens,
      signal,
      system: profile.settings.system
    };
    switch (profile.settings.backend) {
      case 'transformersjs':
        out = await transformers.generate({ ...common, device: profile.settings.device, onProgress: m => ui.typing(m) });
        break;
      case 'webgpu':
        out = await webllm.generate({ ...common, onProgress: m => ui.typing(m) });
        break;
      case 'openrouter': {
        ui.hideTyping();
        out = await openrouter.generate({
          ...common, apiKey: profile.apiKey, temperature: profile.settings.temperature,
          onToken: (delta, full) => { out = full; ui.appendStreaming(full); }
        });
        break;
      }
      case 'server':
        out = await local.serverGenerate({ prompt: text, maxTokens: common.maxTokens, signal });
        break;
      case 'webllm':
        out = await local.socketGenerate({ prompt: text, maxTokens: common.maxTokens, signal });
        break;
    }
    ui.hideTyping();
    lastTokensPerSec = Math.round(out.length / 4 / Math.max(0.1, (performance.now() - started) / 1000));
    const meta = `${model?.label || ''} · ${lastTokensPerSec} ${t('tokensPerSec')}`;
    ui.finishStreaming(meta);
    pushMessage('assistant', out, meta);
    ui.renderMessages(activeConversation().messages);
  } catch (e) {
    ui.hideTyping(); ui.removeStreaming();
    if (e.name === 'AbortError') ui.toast(t('stop'));
    else { pushMessage('system', t('errors') + ': ' + (e.message || e)); ui.renderMessages(activeConversation().messages); }
  } finally {
    busy = false; abort = null;
    $('sendBtn').textContent = t('send');
    $('prompt').focus();
  }
}

async function verify() {
  ui.dialog(t('verify'), `<p>Verifica gli ID dei modelli contro Hugging Face / WebLLM.</p>`, [
    { label: t('cancel') },
    { label: t('verify'), primary: true, fn: async () => {
      ui.typing('Verifica…');
      const res = await verifyAll(profile.settings.backend, { signal: AbortSignal.timeout?.(30000) });
      ui.hideTyping();
      const rows = res.map(r =>
        `<li><b>${ui.esc(r.id.split('/').pop())}</b>: ${r.ok ? '✅' : '❌'} ${r.modelType || r.error || ''}</li>`).join('');
      ui.dialog(t('verify'), `<ul>${rows}</ul>`, [{ label: t('ok'), primary: true }]);
    } }
  ]);
}

async function clearCache() {
  ui.dialog(t('confirmClear'), `<p>${t('confirmClear')}</p>`, [
    { label: t('cancel') },
    { label: t('ok'), primary: true, fn: async () => {
      let n = 0;
      for (const key of await caches.keys()) {
        if (/webllm|mlc|transformers|onnx|huggingface/i.test(key)) { await caches.delete(key); n++; }
      }
      try {
        for (const db of await indexedDB.databases()) {
          if (/webllm|mlc|transformers/i.test(db.name || '')) { indexedDB.deleteDatabase(db.name); n++; }
        }
      } catch (e) {}
      transformers.clear(); webllm.clear();
      ui.toast(`Cache: ${n}`);
    } }
  ]);
}

initLang(detect());
ui.initUI({
  send, stop,
  newChat: () => { newConversation(); renderAll(); },
  clearChat: () => { clearMessages(); renderAll(); },
  setBackend, setModel, preset,
  lang: () => setLang(getLang() === 'en' ? 'it' : 'en'),
  theme: () => { setSettings({ theme: (profile.settings.theme === 'dark' ? 'light' : 'dark') }); document.body.dataset.theme = profile.settings.theme; },
  advanced: v => { setSettings({ showAdvanced: v }); ui.renderBackends(profile.settings.backend); },
  temperature: v => setSettings({ temperature: v }),
  maxTokens: v => setSettings({ maxTokens: v }),
  system: v => setSettings({ system: v }),
  device: v => setSettings({ device: v }),
  apiKey: v => setApiKey(v),
  verify, clearCache,
  fits: uiFits,
  selectConv: id => { selectConversation(id); renderAll(); },
  deleteConv: id => { deleteConversation(id); renderAll(); },
  renderAll
});

/* first-run defaults: verified ultra-small instruct model */
if (!MODELS[profile.settings.backend]?.some(m => m.id === profile.settings.model)) {
  setSettings({ backend: DEFAULT_SETTINGS.backend, model: DEFAULT_SETTINGS.model });
}
renderAll();
glass.enable(document.querySelector('.topbar'), 22, 16);
glass.enable(document.querySelector('.model-bar'), 20, 14);

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
