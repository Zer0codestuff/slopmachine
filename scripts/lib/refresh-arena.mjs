import { modelId } from './aa-browser.mjs';
import { assertCatalog, validDate } from './catalog.mjs';

export const ARENA_DATASET = 'lmarena-ai/leaderboard-dataset';
export const ARENA_CARD = `https://huggingface.co/datasets/${ARENA_DATASET}`;
const subsets = new Map([
  ['/leaderboard/text-to-image', 'text_to_image'],
  ['/leaderboard/image-edit', 'image_edit'],
  ['/leaderboard/video/text-to-video', 'text_to_video'],
  ['/leaderboard/video/image-to-video', 'image_to_video'],
  ['/leaderboard/video/video-edit', 'video_edit'],
]);
const fields = ['model_name', 'organization', 'license', 'rating', 'rating_lower', 'rating_upper', 'variance', 'vote_count', 'rank', 'category', 'leaderboard_publish_date'];

export function arenaSubset(board) {
  const url = new URL(board.sourceUrl);
  const subset = url.hostname === 'arena.ai' && !url.search ? subsets.get(url.pathname) : null;
  if (!subset) throw new Error(`${board.id}: unsupported Arena source URL`);
  return subset;
}

export async function fetchArenaRows(subset, { fetchImpl = fetch, timeoutMs = 30_000 } = {}) {
  if (![...subsets.values()].includes(subset)) throw new Error(`Unsupported Arena subset: ${subset}`);
  const rows = [];
  const pages = [];
  let total = null;
  let revision = null;
  for (let offset = 0; total === null || offset < total; offset += 100) {
    const url = new URL('https://datasets-server.huggingface.co/rows');
    url.search = new URLSearchParams({ dataset: ARENA_DATASET, config: subset, split: 'latest', offset: String(offset), length: '100' });
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`${subset}: public dataset feed returned HTTP ${response.status}`);
    const pageRevision = response.headers.get('x-revision');
    if (!/^[a-f0-9]{40}$/.test(pageRevision ?? '')) throw new Error(`${subset}: missing dataset revision header`);
    if (revision !== null && pageRevision !== revision) throw new Error(`${subset}: dataset changed during pagination; retry the refresh`);
    revision = pageRevision;
    const body = await response.json();
    if (body.partial !== false || !Number.isSafeInteger(body.num_rows_total) || body.num_rows_total < 1 || body.num_rows_total > 100_000
      || !Array.isArray(body.features) || !fields.every((field) => body.features.some((feature) => feature.name === field))
      || !Array.isArray(body.rows)) throw new Error(`${subset}: incomplete dataset response or changed schema`);
    if (total !== null && body.num_rows_total !== total) throw new Error(`${subset}: row count changed during pagination; retry the refresh`);
    total = body.num_rows_total;
    if (body.rows.length !== Math.min(100, total - offset)) throw new Error(`${subset}: incomplete page at offset ${offset}`);
    for (const [index, item] of body.rows.entries()) {
      if (item.row_idx !== offset + index || !Array.isArray(item.truncated_cells) || item.truncated_cells.length || !item.row || typeof item.row !== 'object') throw new Error(`${subset}: missing, reordered, or truncated row at ${offset + index}`);
      for (const field of fields) if (!Object.hasOwn(item.row, field)) throw new Error(`${subset}: missing field ${field} at row ${offset + index}`);
      rows.push(item.row);
    }
    pages.push({ url: String(url), revision, response: body });
  }
  return { subset, revision, observedAt: new Date().toISOString(), rows, pages };
}

export function normalizeArenaBoard(capture, template) {
  const subset = arenaSubset(template);
  if (capture.subset !== subset || !/^[a-f0-9]{40}$/.test(capture.revision ?? '') || !Array.isArray(capture.rows)) throw new Error(`${template.id}: invalid Arena dataset capture`);
  if (!capture.rows.every((row) => typeof row.category === 'string' && fields.every((field) => Object.hasOwn(row, field)))) throw new Error(`${template.id}: changed dataset row schema`);
  const overall = capture.rows.filter((row) => row.category === 'overall');
  if (!overall.length) throw new Error(`${template.id}: dataset has no overall category`);
  const dates = [...new Set(overall.map((row) => row.leaderboard_publish_date))];
  if (dates.length !== 1 || !/^\d{4}-\d{2}-\d{2}$/.test(dates[0]) || !validDate(dates[0])) throw new Error(`${template.id}: latest overall rows must have exactly one valid publication date`);
  const knownIds = new Map(template.entries.map((entry) => [entry.name, entry.id]));
  const entries = overall.map((row) => {
    if (typeof row.model_name !== 'string' || !row.model_name.trim() || typeof row.organization !== 'string'
      || typeof row.license !== 'string' || typeof row.variance !== 'number' || !Number.isFinite(row.variance) || row.variance < 0) throw new Error(`${template.id}: invalid source identity or variance`);
    return {
      id: knownIds.get(row.model_name) ?? modelId(row.model_name), name: row.model_name,
      provider: row.organization.trim() ? row.organization : 'Not disclosed',
      rank: row.rank, score: row.rating, confidenceLow: row.rating_lower, confidenceHigh: row.rating_upper, votes: row.vote_count,
      price: null, priceUnit: null, priceNote: 'No prices are published in the Arena leaderboard dataset.', priceSourceUrl: null, modelUrl: null,
    };
  }).sort((left, right) => left.rank - right.rank || left.name.localeCompare(right.name, 'en'));
  const artifact = `${ARENA_CARD}/resolve/${capture.revision}/${subset}/latest-00000-of-00001.parquet`;
  const board = {
    ...template, observedAt: capture.observedAt, sourceUpdatedAt: dates[0], entries,
    notes: [
      `Attribution: Arena, Arena Leaderboard Dataset, ${ARENA_CARD}, CC BY 4.0, https://creativecommons.org/licenses/by/4.0/. Subset ${subset}, latest split, overall category.`,
      `Public dataset revision ${capture.revision}. Source artifact: ${artifact}. Retrieved through the public Hugging Face Dataset Viewer rows feed; no API key or login.`,
      'Changes: source columns are mapped to the catalog schema, overall rows are selected, and source rank order is retained. Scores, confidence bounds, battle counts, model identifiers, and organization strings retain source values. Empty organizations are labeled Not disclosed.',
      'sourceUpdatedAt is the dataset leaderboard_publish_date. observedAt is retrieval time; neither a repository commit date nor a website update label replaces the publication date.',
      'Arena Score uses Bradley-Terry. Keep every source, task, category, and publication snapshot separate from AA Elo pools. Overlapping confidence intervals do not establish a distinct rank.',
      'The dataset does not publish an audio-condition field, generation prices, or model URLs. Audio policy remains unspecified. No cross-source price joins or inferred model variants are applied.',
    ],
  };
  assertCatalog({ generatedAt: new Date().toISOString(), leaderboards: [board] });
  return board;
}
