import type { ConfigurationSeries, Leaderboard, Model } from './types';

const palette = ['#b9c1cb', '#df9676', '#65c78c', '#a89bef', '#71b5e8', '#d6bd70', '#d883b3', '#85c2c0', '#b4a4dc', '#c1b4a6'];
const providers: Record<string, [string, string]> = {
  openai: ['#bdc5cf', 'O'], google: ['#58cd89', 'G'], 'black forest labs': ['#e39978', 'F'],
  bytedance: ['#a99df0', 'B'], kuaishou: ['#dfb465', 'K'], kling: ['#dfb465', 'K'],
  alibaba: ['#c09cdb', 'Q'], 'xai': ['#ddd9d5', 'X'], spacexai: ['#ddd9d5', 'X'],
  runway: ['#9bc4b7', 'R'], 'recraft': ['#e2a48c', 'r'], tencent: ['#7ab7dc', 'T'],
  ideogram: ['#c5bb82', 'i'], midjourney: ['#9dc8dd', 'M'], 'luma': ['#a0b4df', 'L'],
  minimax: ['#dc92af', 'm'], 'z.ai': ['#8ebda8', 'Z'], 'fal': ['#bda8c9', 'f'],
  bfl: ['#e39978', 'F'], meta: ['#71b5e8', '∞'],
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
