import type { ConfigurationSeries, Leaderboard, Model } from './types';

const colors = ['purple', 'orange', 'green', 'blue', 'cyan', 'yellow', 'pink', 'teal', 'lime', 'red'];
const palette = colors.map(color => `var(--chart-${color})`);
const color = (name: string) => `var(--chart-${name})`;
const providers: Record<string, [string, string]> = {
  openai: [color('purple'), 'O'], google: [color('green'), 'G'], 'black forest labs': [color('orange'), 'F'],
  bytedance: [color('blue'), 'B'], kuaishou: [color('yellow'), 'K'], kling: [color('yellow'), 'K'],
  alibaba: [color('pink'), 'Q'], xai: [color('red'), 'X'], spacexai: [color('red'), 'X'],
  runway: [color('teal'), 'R'], recraft: [color('red'), 'r'], tencent: [color('cyan'), 'T'],
  ideogram: [color('yellow'), 'i'], midjourney: [color('cyan'), 'M'], luma: [color('purple'), 'L'],
  minimax: [color('pink'), 'm'], 'z.ai': [color('lime'), 'Z'], fal: [color('purple'), 'f'],
  bfl: [color('orange'), 'F'], meta: [color('blue'), '∞'], microsoft: [color('orange'), 'M'],
  pruna: [color('cyan'), 'P'],
};
export function identity(provider: string): [string, string] {
  const key = provider.toLowerCase();
  const match = Object.keys(providers).find(k => key.includes(k));
  if (match) return providers[match];
  const hash = [...key].reduce((n, c) => n + c.charCodeAt(0), 0);
  return [palette[hash % palette.length], provider.charAt(0).toUpperCase()];
}
export const money = (n: number) => `$${n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n >= 1 ? Number(n.toFixed(2)) : Number(n.toFixed(4))}`;
export const number = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(n);
export const shortName = (s: string) => s.replace(/\b(Google|OpenAI|ByteDance|Black Forest Labs|Kuaishou|Alibaba|Tencent)\s+/gi, '').replace(/\s*\([^)]{15,}\)/g, '');
export function frontier(models: Model[]) {
  let best = -Infinity;
  return models.filter(m => m.price !== null).sort((a, b) => a.price! - b.price! || b.score - a.score).filter(m => {
    if (m.score <= best) return false;
    best = m.score;
    return true;
  });
}
export function defaultSelection(models: Model[], series: ConfigurationSeries[] = []) {
  const selected = new Set([...models.slice(0, 8), ...frontier(models)].map(model => model.id));
  const ranked = new Map(models.map(model => [model.id, model.rank]));
  const curves = series.filter(family => family.points.length >= 2).sort((a, b) => b.points.length - a.points.length || Math.min(...a.points.map(point => ranked.get(point.modelId) ?? Infinity)) - Math.min(...b.points.map(point => ranked.get(point.modelId) ?? Infinity)));
  for (const family of curves.slice(0, 4)) for (const point of family.points) selected.add(point.modelId);
  return selected;
}
export function taskFamily(board: Leaderboard) {
  const task = `${board.task} ${board.shortTask}`.toLowerCase();
  if (/editing|\bedit\b/.test(task)) return `${board.media}-editing`;
  if (board.media === 'image') return 'image-generation';
  if (/image to video|image-to-video|image and motion/.test(task)) return 'image-to-video';
  if (/text to video|text-to-video/.test(task)) return 'text-to-video';
  return board.shortTask;
}
export function audioCondition(board: Leaderboard) {
  const task = `${board.task} ${board.shortTask}`.toLowerCase();
  return /without audio|silent/.test(task) ? 'silent' : /with audio|video audio|editing audio/.test(task) ? 'audio' : 'unspecified';
}
export function download(content: Blob, filename: string) {
  const url = URL.createObjectURL(content);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
