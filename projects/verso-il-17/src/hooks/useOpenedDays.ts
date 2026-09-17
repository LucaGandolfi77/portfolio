import { useCallback, useState } from 'react';
import { safeReadJson, safeWriteJson } from '../utils/storage';

const STORAGE_KEY = 'verso17.openedDays.v1';

/**
 * Le caselle già aperte, persistite in localStorage come chiavi "YYYY-MM-DD".
 *
 * Le chiavi sono date reali e non indici: se la finestra del calendario scorre
 * (per esempio a cavallo di un anno) le caselle vecchie non vengono "ereditate"
 * da giorni nuovi.
 */
export function useOpenedDays() {
  const [opened, setOpened] = useState<string[]>(() =>
    safeReadJson<string[]>(STORAGE_KEY, []).filter((k): k is string => typeof k === 'string'),
  );

  const markOpened = useCallback((key: string) => {
    setOpened((prev) => {
      if (prev.includes(key)) return prev;
      const next = [...prev, key].sort();
      safeWriteJson(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const isOpened = useCallback((key: string) => opened.includes(key), [opened]);

  const reset = useCallback(() => {
    safeWriteJson(STORAGE_KEY, []);
    setOpened([]);
  }, []);

  return { opened, isOpened, markOpened, reset, count: opened.length };
}
