// Coverage Galaxy — Game Context (React State Management)

import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { loadProgress, saveProgress, type ProgressData, type TestRecord, type AnomalyRecord, type CoverageSnapshot } from '../db/idb';
import { MISSIONS } from '../data/missions';
import { getRank } from '../engine/scoring';

interface GameState {
  loaded: boolean;
  screen: 'home' | 'planet' | 'workflow' | 'glossary' | 'lab' | 'report' | 'settings';
  currentMissionId: string | null;
  workflowStep: number;
  progress: ProgressData;
  // Derived
  currentMission: typeof MISSIONS[0] | null;
  currentPlanetState: ProgressData['planetStates'][string] | null;
}

type GameAction =
  | { type: 'LOAD'; progress: ProgressData }
  | { type: 'SET_SCREEN'; screen: GameState['screen'] }
  | { type: 'SELECT_MISSION'; missionId: string }
  | { type: 'SET_WORKFLOW_STEP'; step: number }
  | { type: 'SET_TEST_RESULT'; missionId: string; testId: string; result: 'pass' | 'fail' }
  | { type: 'ADD_TEST'; missionId: string; test: TestRecord }
  | { type: 'REMOVE_TEST'; missionId: string; testId: string }
  | { type: 'UPDATE_TEST'; missionId: string; test: TestRecord }
  | { type: 'SET_STUB_CONFIG'; missionId: string; depId: string; config: unknown }
  | { type: 'SET_KEPT_DEPS'; missionId: string; deps: string[] }
  | { type: 'ADD_ANOMALY'; missionId: string; anomaly: AnomalyRecord }
  | { type: 'REMOVE_ANOMALY'; missionId: string; anomalyId: string }
  | { type: 'SET_COVERAGE'; missionId: string; coverage: CoverageSnapshot }
  | { type: 'COMPLETE_MISSION'; missionId: string; score: number }
  | { type: 'ADD_XP'; amount: number }
  | { type: 'ADD_BADGE'; badgeId: string }
  | { type: 'SET_MODE'; mode: 'beginner' | 'advanced' }
  | { type: 'MARK_GLOSSARY_READ'; termId: string }
  | { type: 'UPDATE_DAILY_STREAK' };

function gameReducer(state: GameState, action: GameAction): GameState {
  const p = { ...state.progress };

  switch (action.type) {
    case 'LOAD':
      return { ...state, loaded: true, progress: action.progress };

    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'SELECT_MISSION':
      if (!p.planetStates[action.missionId]) {
        p.planetStates[action.missionId] = {
          status: 'in_progress',
          tests: [],
          stubConfigs: {},
          keptDeps: [],
          anomalies: [],
          coverage: { statement: 0, branch: 0, mcdc: 0, timestamp: Date.now() },
          score: 0,
          startedAt: Date.now(),
        };
      }
      return {
        ...state,
        currentMissionId: action.missionId,
        screen: 'planet',
        workflowStep: 0,
        progress: p,
      };

    case 'SET_WORKFLOW_STEP':
      return { ...state, workflowStep: action.step };

    case 'ADD_TEST': {
      const ps = p.planetStates[action.missionId];
      if (ps) {
        ps.tests = [...ps.tests, action.test];
        p.profile = { ...p.profile, totalTestsCreated: (p.profile.totalTestsCreated || 0) + 1 };
      }
      return { ...state, progress: p };
    }

    case 'REMOVE_TEST': {
      const ps = p.planetStates[action.missionId];
      if (ps) ps.tests = ps.tests.filter(t => t.id !== action.testId);
      return { ...state, progress: p };
    }

    case 'UPDATE_TEST': {
      const ps = p.planetStates[action.missionId];
      if (ps) ps.tests = ps.tests.map(t => t.id === action.test.id ? action.test : t);
      return { ...state, progress: p };
    }

    case 'SET_STUB_CONFIG': {
      const ps = p.planetStates[action.missionId];
      if (ps) ps.stubConfigs = { ...ps.stubConfigs, [action.depId]: action.config };
      return { ...state, progress: p };
    }

    case 'SET_KEPT_DEPS': {
      const ps = p.planetStates[action.missionId];
      if (ps) ps.keptDeps = action.deps;
      return { ...state, progress: p };
    }

    case 'SET_TEST_RESULT': {
      const ps = p.planetStates[action.missionId];
      if (ps) {
        ps.tests = ps.tests.map(t => t.id === action.testId ? { ...t, result: action.result } : t);
      }
      return { ...state, progress: p };
    }

    case 'ADD_ANOMALY': {
      const ps = p.planetStates[action.missionId];
      if (ps) {
        ps.anomalies = [...ps.anomalies, action.anomaly];
        p.profile = { ...p.profile, totalAnomaliesFound: (p.profile.totalAnomaliesFound || 0) + 1 };
      }
      return { ...state, progress: p };
    }

    case 'REMOVE_ANOMALY': {
      const ps = p.planetStates[action.missionId];
      if (ps) ps.anomalies = ps.anomalies.filter(a => a.id !== action.anomalyId);
      return { ...state, progress: p };
    }

    case 'SET_COVERAGE': {
      const ps = p.planetStates[action.missionId];
      if (ps) ps.coverage = action.coverage;
      return { ...state, progress: p };
    }

    case 'COMPLETE_MISSION': {
      const ps = p.planetStates[action.missionId];
      if (ps) {
        ps.status = 'completed';
        ps.completedAt = Date.now();
        ps.score = action.score;
      }
      if (!p.profile.planetsCompleted.includes(action.missionId)) {
        p.profile = { ...p.profile, planetsCompleted: [...p.profile.planetsCompleted, action.missionId] };
      }
      p.profile = { ...p.profile, xp: p.profile.xp + action.score, rank: getRank(p.profile.xp + action.score) };
      return { ...state, progress: p };
    }

    case 'ADD_XP': {
      p.profile = { ...p.profile, xp: (p.profile.xp || 0) + action.amount, rank: getRank((p.profile.xp || 0) + action.amount) };
      return { ...state, progress: p };
    }

    case 'ADD_BADGE': {
      if (!p.profile.badges.includes(action.badgeId)) {
        p.profile = { ...p.profile, badges: [...p.profile.badges, action.badgeId] };
      }
      return { ...state, progress: p };
    }

    case 'SET_MODE': {
      p.profile = { ...p.profile, mode: action.mode };
      return { ...state, progress: p };
    }

    case 'MARK_GLOSSARY_READ': {
      if (!p.glossaryRead.includes(action.termId)) {
        p.glossaryRead = [...p.glossaryRead, action.termId];
      }
      return { ...state, progress: p };
    }

    case 'UPDATE_DAILY_STREAK': {
      const today = new Date().toISOString().slice(0, 10);
      if (p.profile.lastDailyDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        p.profile = {
          ...p.profile,
          dailyStreak: p.profile.lastDailyDate === yesterday ? (p.profile.dailyStreak || 0) + 1 : 1,
          lastDailyDate: today,
        };
      }
      return { ...state, progress: p };
    }

    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, {
    loaded: false,
    screen: 'home',
    currentMissionId: null,
    workflowStep: 0,
    progress: {
      profile: { xp: 0, rank: 'Cadet', planetsCompleted: [], badges: [], dailyStreak: 0, lastDailyDate: '', mode: 'beginner', hintsUsed: 0, totalTestsCreated: 0, totalAnomaliesFound: 0 },
      planetStates: {},
      testSuites: {},
      glossaryRead: [],
    },
    currentMission: null,
    currentPlanetState: null,
  });

  // Load from IndexedDB on mount
  useEffect(() => {
    loadProgress().then(data => {
      if (data) dispatch({ type: 'LOAD', progress: data });
      else dispatch({ type: 'LOAD', progress: getDefaultProgress() });
    });
  }, []);

  // Auto-save on progress change
  useEffect(() => {
    if (state.loaded) saveProgress(state.progress);
  }, [state.progress, state.loaded]);

  // Derive current mission/state
  const currentMission = state.currentMissionId
    ? MISSIONS.find(m => m.id === state.currentMissionId) ?? null
    : null;
  const currentPlanetState = state.currentMissionId
    ? state.progress.planetStates[state.currentMissionId] ?? null
    : null;

  const fullState = { ...state, currentMission, currentPlanetState };

  return (
    <GameContext.Provider value={{ state: fullState, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

function getDefaultProgress(): ProgressData {
  return {
    profile: { xp: 0, rank: 'Cadet', planetsCompleted: [], badges: [], dailyStreak: 0, lastDailyDate: '', mode: 'beginner', hintsUsed: 0, totalTestsCreated: 0, totalAnomaliesFound: 0 },
    planetStates: {},
    testSuites: {},
    glossaryRead: [],
  };
}
