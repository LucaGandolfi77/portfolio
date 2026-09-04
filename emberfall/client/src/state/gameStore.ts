import { create } from "zustand";

export interface AuthState {
  token: string;
  userId: string;
  username: string;
}

export interface CharacterState {
  id: string;
  name: string;
  faction: string;
  classType: string;
  level: number;
  xp: number;
  pos: { x: number; y: number; z: number };
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
}

export interface GameState {
  auth: AuthState | null;
  character: CharacterState | null;
  setAuth: (a: AuthState) => void;
  setCharacter: (c: CharacterState) => void;
  clearAuth: () => void;
  updatePos: (p: { x: number; y: number; z: number }) => void;
}

export const useGameStore = create<GameState>((set) => ({
  auth: null,
  character: null,
  setAuth: (a) => set({ auth: a }),
  setCharacter: (c) => set({ character: c }),
  clearAuth: () => set({ auth: null, character: null }),
  updatePos: (p) =>
    set((s) =>
      s.character ? { character: { ...s.character, pos: p } } : {}
    ),
}));
