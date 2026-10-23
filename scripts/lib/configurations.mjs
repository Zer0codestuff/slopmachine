import { SERIES_FIELDS } from './catalog.mjs';

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const canonical = (value) => JSON.stringify(value, function (key, item) {
  return object(item) ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item;
});

/** Attach only explicit board-local membership; validate the complete candidate next. */
export function mergeConfigurations(leaderboards, configurations, filename = 'configurations') {
  if (!object(configurations) || !Array.isArray(configurations.series)) throw new Error(`${filename}: expected an object with a series array`);
  for (const key of Object.keys(configurations)) {
    if (key !== 'series') throw new Error(`${filename}.${key}: unknown field`);
  }
  const boards = new Map(leaderboards.map((board) => [board.id, board]));
  const additions = new Map();
  for (const [index, item] of configurations.series.entries()) {
    const path = `${filename}.series[${index}]`;
    if (!object(item)) throw new Error(`${path}: must be an object`);
    for (const key of Object.keys(item)) {
      if (key !== 'boardId' && !SERIES_FIELDS.includes(key)) throw new Error(`${path}.${key}: unknown field`);
    }
    if (!Object.hasOwn(item, 'boardId') || typeof item.boardId !== 'string' || !item.boardId.trim()) throw new Error(`${path}.boardId: must be a nonempty string`);
    if (!boards.has(item.boardId)) throw new Error(`${path}.boardId: unknown leaderboard ${item.boardId}`);
    const { boardId, ...series } = item;
    const boardSeries = additions.get(boardId) ?? [];
    const existing = [...(boards.get(boardId).series ?? []), ...boardSeries].find(candidate => candidate.id === series.id);
    if (existing) {
      if (canonical(existing) !== canonical(series)) throw new Error(`${path}.id: conflicting configuration series ${series.id}`);
      continue;
    }
    boardSeries.push(series);
    additions.set(boardId, boardSeries);
  }
  return leaderboards.map((board) => additions.has(board.id)
    ? { ...board, series: [...(board.series ?? []), ...additions.get(board.id)] }
    : board);
}
