export type Team = { id: string; name: string; city: string };

export type Match = {
  id: string;
  startsAt: string | null; // у перенесённых матчей даты может не быть
  status: string; // сервер может прислать статус, которого мы не знаем
  minute?: number; // только у live
  home: Team;
  away: Team;
  score: { home: number; away: number } | null; // 0:0 — это счёт, null — счёта нет
};

export type Filter = 'all' | 'upcoming' | 'finished';

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Запланирован',
  live: 'Идёт',
  finished: 'Завершён',
  postponed: 'Перенесён',
};

// Предстоящие: ещё не сыграны (включая идущий и перенесённый).
// Неизвестные статусы попадают только во «Все», чтобы не врать про них.
const UPCOMING = ['scheduled', 'live', 'postponed'];

export function matchesFilter(match: Match, filter: Filter): boolean {
  if (filter === 'all') return true;
  if (filter === 'finished') return match.status === 'finished';
  return UPCOMING.includes(match.status);
}

export function statusLabel(match: Match): string {
  if (match.status === 'live' && match.minute != null) return `Идёт, ${match.minute}′`;
  return STATUS_LABELS[match.status] ?? match.status;
}

// Время в часовом поясе устройства (toLocaleString берёт его по умолчанию).
export function formatStart(iso: string | null): string {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Дата уточняется';
  return date.toLocaleString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Матчи без даты уходят в конец списка.
export function sortByStart(matches: Match[]): Match[] {
  const time = (m: Match) => {
    const t = m.startsAt ? Date.parse(m.startsAt) : NaN;
    return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
  };
  return [...matches].sort((a, b) => time(a) - time(b));
}
