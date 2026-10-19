import { useCallback, useEffect, useState } from 'react';
import { MATCHES_URL } from '../config';
import type { Match } from '../matches';

export function useMatches() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [round, setRound] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(MATCHES_URL);
      // fetch не бросает ошибку на 404/500 — проверяем сами
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data?.matches)) throw new Error('Неожиданный формат ответа');
      setMatches(data.matches);
      setRound(typeof data.round === 'number' ? data.round : null);
      setUpdatedAt(new Date());
    } catch (e) {
      console.warn('Не удалось загрузить матчи', e);
      setError('Не удалось загрузить матчи. Проверьте соединение и повторите.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { matches, round, updatedAt, loading, error, reload };
}
