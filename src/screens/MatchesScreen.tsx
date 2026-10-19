import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { FavoriteButton } from '../components/FavoriteButton';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { useFavorites } from '../hooks/useFavorites';
import { useMatches } from '../hooks/useMatches';
import { formatStart, matchesFilter, sortByStart, statusLabel } from '../matches';
import type { Filter, Match } from '../matches';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'upcoming', label: 'Предстоящие' },
  { key: 'finished', label: 'Завершённые' },
];

// Экран «Матчи тура» — задание в README.md, часть 1.
export function MatchesScreen() {
  const { matches, round, updatedAt, loading, error, reload } = useMatches();
  const { favorites, isFavorite, toggle } = useFavorites();
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(
    () => sortByStart((matches ?? []).filter(m => matchesFilter(m, filter))),
    [matches, filter],
  );

  // Данных ещё нет: показываем загрузку или ошибку с кнопкой «Повторить».
  if (matches === null) {
    return (
      <View style={[styles.container, styles.center]}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <Text style={styles.message}>{error}</Text>
            <Button label="Повторить" onPress={reload} />
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{round ? `Матчи ${round}-го тура` : 'Матчи тура'}</Text>

      <View style={styles.row}>
        {updatedAt && <UpdatedAgo since={updatedAt} />}
        <Button label={loading ? 'Обновляем…' : 'Обновить'} onPress={reload} disabled={loading} />
      </View>
      {error && <Text style={styles.error}>{error} Показаны прошлые данные.</Text>}

      <View style={styles.filters}>
        {FILTERS.map(f => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.chip, filter === f.key && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={visible}
        keyExtractor={m => m.id}
        // FlatList не знает про избранное внутри renderItem — без extraData звёздочки не перерисуются
        extraData={favorites}
        renderItem={({ item }) => (
          <MatchCard match={item} favorite={isFavorite(item.id)} onToggle={() => toggle(item.id)} />
        )}
        ListEmptyComponent={
          <Text style={styles.message}>
            {matches.length === 0 ? 'В этом туре пока нет матчей' : 'Нет матчей по выбранному фильтру'}
          </Text>
        }
      />
    </View>
  );
}

function MatchCard(props: { match: Match; favorite: boolean; onToggle: () => void }) {
  const { match, favorite, onToggle } = props;
  const { home, away, score } = match;
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.status}>{statusLabel(match)}</Text>
        <FavoriteButton active={favorite} onPress={onToggle} />
      </View>
      <View style={styles.teams}>
        <Text style={[styles.team, styles.home]}>{home.name}</Text>
        <Text style={styles.score}>{score ? `${score.home} : ${score.away}` : '–'}</Text>
        <Text style={[styles.team, styles.away]}>{away.name}</Text>
      </View>
      <Text style={styles.date}>{formatStart(match.startsAt)}</Text>
    </View>
  );
}

function Button(props: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      accessibilityRole="button"
      style={[styles.button, props.disabled && styles.buttonDisabled]}
    >
      <Text style={styles.buttonText}>{props.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  message: { textAlign: 'center', color: '#374151', marginVertical: 24 },
  error: { color: '#b91c1c', marginBottom: 8 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#111827' },
  chipText: { color: '#111827' },
  chipTextActive: { color: '#ffffff' },
  card: { padding: 12, marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  status: { fontSize: 13, color: '#6b7280' },
  teams: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  team: { flex: 1, fontSize: 16, fontWeight: '600' },
  home: { textAlign: 'right' },
  away: { textAlign: 'left' },
  score: { width: 64, textAlign: 'center', fontSize: 20, fontWeight: '700' },
  date: { textAlign: 'center', color: '#6b7280', fontSize: 13 },
  button: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#111827' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#ffffff', fontWeight: '600' },
});
