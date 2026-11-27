import type { GameState } from '../game/GameState';

export type PhoneTab = 'contacts' | 'tasks' | 'map' | 'clues' | 'messages' | 'history';

export interface Message { from: string; text: string; at: number }

export class PhoneSystem {
  tab: PhoneTab = 'contacts';
  messages: Message[] = [
    { from: 'Sophie', text: 'Text me when you step outside tonight, okay? Keep the phone charged.', at: 0 }
  ];
  selected: string | null = null;
  justOpened = false;

  constructor(private state: GameState) {}

  toggle(): boolean {
    this.state.phoneOpen = !this.state.phoneOpen;
    if (this.state.phoneOpen) this.justOpened = true;
    return this.state.phoneOpen;
  }

  open(tab: PhoneTab = 'contacts') {
    this.state.phoneOpen = true;
    this.tab = tab;
    this.justOpened = true;
  }

  close() { this.state.phoneOpen = false; }

  addMessage(from: string, text: string) {
    this.messages.unshift({ from, text, at: this.state.elapsed });
    if (this.messages.length > 20) this.messages.pop();
  }

  get usable(): boolean { return this.state.battery > 1; }
}
