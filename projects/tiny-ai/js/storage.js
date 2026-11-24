/* Tiny AI — versioned settings and multi-conversation persistence */
import { DEFAULT_SETTINGS } from './config.js';

const KEY = 'pf.tiny-ai.save.v1';
function defaults() {
  return {
    settings: { ...DEFAULT_SETTINGS },
    conversations: [], activeId: null, apiKey: ''
  };
}
function read() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || 'null') || {}, d = defaults();
    const conv = Array.isArray(p.conversations) ? p.conversations.slice(0, 40) : [];
    return {
      settings: { ...d.settings, ...(p.settings || {}) },
      conversations: conv,
      activeId: conv.some(c => c.id === p.activeId) ? p.activeId : (conv[0]?.id || null),
      apiKey: p.apiKey || ''
    };
  } catch (e) { return defaults(); }
}
export let profile = read();
export function save() { try { localStorage.setItem(KEY, JSON.stringify(profile)); return true; } catch (e) { return false; } }
export function setSettings(patch) { profile.settings = { ...profile.settings, ...patch }; save(); return profile.settings; }
export function setApiKey(key) { profile.apiKey = key || ''; save(); }

export function newConversation() {
  const c = { id: 'c' + Date.now().toString(36), title: 'New chat', created: Date.now(), updated: Date.now(), messages: [] };
  profile.conversations.unshift(c);
  profile.conversations = profile.conversations.slice(0, 40);
  profile.activeId = c.id; save(); return c;
}
export function activeConversation() {
  return profile.conversations.find(c => c.id === profile.activeId) || newConversation();
}
export function selectConversation(id) { profile.activeId = id; save(); }
export function deleteConversation(id) {
  profile.conversations = profile.conversations.filter(c => c.id !== id);
  if (profile.activeId === id) profile.activeId = profile.conversations[0]?.id || null;
  save();
}
export function pushMessage(role, content, meta) {
  const c = activeConversation();
  c.messages.push({ role, content, meta, t: Date.now() });
  if (c.messages.length === 1 && role === 'user') c.title = content.slice(0, 40);
  c.updated = Date.now();
  save(); return c;
}
export function clearMessages() {
  const c = activeConversation(); c.messages = []; c.title = 'New chat'; save();
}
export function resetAll() { profile = defaults(); save(); return profile; }
