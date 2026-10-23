import type { ConfigurationSeries, Leaderboard, Model } from './types';

export const settingKey = (label: string) => label.toLowerCase().replace(/[_\s]+/g, ' ').trim();
export const unclassifiedSetting = 'unclassified';

export function configurationFor(board: Leaderboard, modelId: string) {
  for (const series of board.series ?? []) {
    const point = series.points.find(candidate => candidate.modelId === modelId);
    if (point) return { series, point };
  }
  return null;
}

export function configurationOptions(board: Leaderboard) {
  const options = new Map<string, string>();
  for (const series of board.series ?? []) {
    for (const point of [...series.points].sort((a, b) => a.order - b.order)) options.set(settingKey(point.label), point.label);
  }
  const ordered = ['very low', 'low', 'medium', 'high', 'xhigh', 'very high', 'max'];
  const result = [...options].map(([key, label]) => ({ key, label })).sort((a, b) => {
    const ai = ordered.indexOf(a.key); const bi = ordered.indexOf(b.key);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.label.localeCompare(b.label);
  });
  if (board.entries.some(model => !configurationFor(board, model.id))) result.push({ key: unclassifiedSetting, label: 'Unspecified' });
  return result;
}

export function settingSymbol(label: string) {
  if (label.startsWith('Standard')) return 'S';
  if (label.startsWith('Pro')) return 'P';
  if (label.startsWith('Balanced')) return 'B';
  const known: Record<string, string> = { 'very low': 'VL', low: 'L', medium: 'M', high: 'H', xhigh: 'XH', 'very high': 'VH', max: 'Mx', default: 'D', standard: 'S', quality: 'Q', fast: 'F', pro: 'P' };
  return known[settingKey(label)] ?? label.match(/\d{3,4}p|[24]K/i)?.[0] ?? label.slice(0, 3);
}

export function modelGroups(models: Model[], series: ConfigurationSeries[] = []) {
  const byId = new Map(models.map(model => [model.id, model]));
  const grouped = new Set<string>();
  const result: { id: string; name: string; models: Model[]; series: ConfigurationSeries | null }[] = [];
  for (const family of series) {
    const points = [...family.points].sort((a, b) => a.order - b.order).flatMap(point => {
      const model = byId.get(point.modelId);
      return model ? [model] : [];
    });
    if (!points.length) continue;
    points.forEach(model => grouped.add(model.id));
    result.push({ id: family.id, name: family.name, models: points, series: family });
  }
  for (const model of models) if (!grouped.has(model.id)) result.push({ id: model.id, name: model.name, models: [model], series: null });
  return result.sort((a, b) => Math.min(...a.models.map(model => model.rank)) - Math.min(...b.models.map(model => model.rank)));
}
