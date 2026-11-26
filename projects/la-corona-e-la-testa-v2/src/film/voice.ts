/*
 * Optional spoken narration with the browser's own voices. Each character
 * gets a pitch; the pace is fitted to the time the line stays on screen.
 */
import { SPEAKERS } from './script';
import type { Cue, Lang } from './timeline';

export class Narrator {
  private lastId = '';
  speaking = false;

  get available(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  private voiceFor(lang: Lang): SpeechSynthesisVoice | null {
    const prefix = lang === 'it' ? 'it' : 'en';
    const all = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(prefix));
    return all.find((v) => /natural|premium|enhanced|google/i.test(v.name)) ?? all.find((v) => v.localService) ?? all[0] ?? null;
  }

  /** Speaks a cue once; asking again for the same cue does nothing. */
  say(cue: Cue, lang: Lang, volume: number): void {
    const id = `${lang}:${cue.id}`;
    if (!this.available || id === this.lastId) return;
    this.lastId = id;
    window.speechSynthesis.cancel();
    const text = cue.text[lang];
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'it' ? 'it-IT' : 'en-GB';
    const voice = this.voiceFor(lang);
    if (voice) u.voice = voice;
    u.pitch = SPEAKERS[cue.who].pitch;
    u.rate = Math.max(0.92, Math.min(1.35, text.length / (14 * Math.max(1, cue.end - cue.start - 0.3))));
    u.volume = Math.max(0, Math.min(1, volume));
    u.onstart = () => (this.speaking = true);
    u.onend = u.onerror = () => (this.speaking = false);
    window.speechSynthesis.speak(u);
  }

  stop(): void {
    this.lastId = '';
    this.speaking = false;
    if (this.available) window.speechSynthesis.cancel();
  }
}

export const narrator = new Narrator();
