export type ContactId = 'sophie' | 'mom' | 'dad' | 'daniel' | 'alex' | 'jessica' | 'mike' | 'unknown';

export type Difficulty = 'easy' | 'normal' | 'hard';
export type Quality = 'low' | 'medium' | 'high' | 'ultra';
export type GameMode = 'story' | 'classic';
export type Language = 'en' | 'it';

export interface Contact {
  id: ContactId;
  name: string;
  role: string;
  number: string;
  initials: string;
  tint: string;
  startNode: string;
  cooldownSec: number;
  benefit: string;
  fromChapter: number;
  untilChapter: number;
}

export interface DialogueEffects {
  threat?: number;
  panic?: number;
  composure?: number;
  shieldSec?: number;
  relationship?: number;
  battery?: number;
  flags?: string[];
  reveal?: string;
  unlock?: ContactId;
  end?: boolean;
  event?: string;
}

export interface DialogueChoice {
  text: string;
  textIt?: string;
  next?: string | null;
  effects?: DialogueEffects;
}

export interface DialogueNode {
  speaker: string;
  line: string;
  lineIt?: string;
  choices: DialogueChoice[];
  timeout?: number;
  timeoutChoice?: number;
}

export interface Chapter {
  id: number;
  title: string;
  titleIt: string;
  hour: number;
  objective: string;
  objectiveIt: string;
  intro: string;
  introIt: string;
  threatRate: number;
}

export interface ErrandDef {
  id: string;
  chapter: number;
  zone: string;
  title: string;
  titleIt: string;
  hint: string;
  hintIt: string;
  composureReward: number;
  panicRelief: number;
  optional?: boolean;
}

export interface RandomEvent {
  id: string;
  title: string;
  titleIt: string;
  text: string;
  textIt: string;
  minChapter: number;
  weight: number;
  threat?: number;
  panic?: number;
  reveal?: string;
  flag?: string;
}

export interface Ending {
  id: string;
  title: string;
  titleIt: string;
  text: string;
  textIt: string;
}
