// Coverage Galaxy — IndexedDB Persistence Layer (via idb)

import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'coverage-galaxy-db';
const DB_VERSION = 1;

export interface ProgressData {
  profile: {
    xp: number;
    rank: string;
    planetsCompleted: string[];
    badges: string[];
    dailyStreak: number;
    lastDailyDate: string;
    mode: 'beginner' | 'advanced';
    hintsUsed: number;
    totalTestsCreated: number;
    totalAnomaliesFound: number;
  };
  planetStates: Record<string, {
    status: 'locked' | 'available' | 'in_progress' | 'completed';
    tests: TestRecord[];
    stubConfigs: Record<string, unknown>;
    keptDeps: string[];
    anomalies: AnomalyRecord[];
    coverage: CoverageSnapshot;
    score: number;
    startedAt?: number;
    completedAt?: number;
  }>;
  testSuites: Record<string, TestRecord[]>;
  glossaryRead: string[];
}

export interface TestRecord {
  id: string;
  name: string;
  type: 'nominal' | 'boundary' | 'negative' | 'robustness';
  inputs: Record<string, number | string | boolean>;
  expectedOutputs?: Record<string, unknown>;
  expectedCalls?: string[];
  result?: 'pass' | 'fail' | 'not_run';
  triageClass?: 'test' | 'stub' | 'code';
}

export interface AnomalyRecord {
  id: string;
  severity: 'Critical' | 'Major' | 'Minor' | 'Info';
  description: string;
  requirementId: string;
  stationId: string;
  status: 'open' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface CoverageSnapshot {
  statement: number;
  branch: number;
  mcdc: number;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function loadProgress(): Promise<ProgressData | null> {
  try {
    const db = await getDB();
    const data = await db.get('progress', 'main');
    return (data as any)?.data ?? null;
  } catch {
    return null;
  }
}

export async function saveProgress(data: ProgressData): Promise<void> {
  try {
    const db = await getDB();
    await db.put('progress', { id: 'main', data });
  } catch (e) {
    console.warn('Failed to save progress:', e);
  }
}

export async function resetProgress(): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('progress', 'main');
  } catch (e) {
    console.warn('Failed to reset progress:', e);
  }
}

export function getDefaultProgress(): ProgressData {
  return {
    profile: {
      xp: 0,
      rank: 'Cadet',
      planetsCompleted: [],
      badges: [],
      dailyStreak: 0,
      lastDailyDate: '',
      mode: 'beginner',
      hintsUsed: 0,
      totalTestsCreated: 0,
      totalAnomaliesFound: 0,
    },
    planetStates: {},
    testSuites: {},
    glossaryRead: [],
  };
}
