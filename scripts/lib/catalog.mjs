import { randomUUID } from 'node:crypto';
import { mkdir, open, rename, rm } from 'node:fs/promises';
import { dirname } from 'node:path';

export const MODEL_FIELDS = [
  'id', 'name', 'provider', 'rank', 'score', 'confidenceLow', 'confidenceHigh',
  'votes', 'price', 'priceUnit', 'priceNote', 'priceSourceUrl', 'modelUrl',
];
export const BOARD_FIELDS = [
  'id', 'media', 'sourceName', 'sourceUrl', 'methodologyUrl', 'task', 'shortTask',
  'scoreType', 'observedAt', 'sourceUpdatedAt', 'priceUnit', 'notes', 'entries',
];

// Explicit denominators prevent a numeric price from silently changing meaning.
// These labels are the public UI contract. Conversion requires source context.
export const PRICE_UNITS = new Map([
  ['image', 'image'],
  ['second', 'video'],
]);

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const string = (value) => typeof value === 'string' && value.trim().length > 0;
const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const id = (value) => string(value) && /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(value);

export function validUrl(value) {
  if (!string(value) || value !== value.trim()) return false;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname)
      && !url.username && !url.password
      && ![...url.searchParams.keys()].some((key) => /^(?:api[_-]?key|access[_-]?token|token|secret|authorization)$/i.test(key));
  } catch { return false; }
}

export function validDate(value, timestamp = false) {
  if (typeof value !== 'string') return false;
  const format = timestamp
    ? /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/
    : /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2}))?$/;
  if (!format.test(value) || !Number.isFinite(Date.parse(value))) return false;
  if (value.length > 10) {
    const [hour, minute, second] = value.slice(11, 19).split(':').map(Number);
    if (hour > 23 || minute > 59 || second > 59) return false;
  }
  const day = value.slice(0, 10);
  return new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) === day;
}

/** Validate the exact public shape declared in src/types.ts without coercion. */
export function validateCatalog(catalog, { now = Date.now() } = {}) {
  const errors = [];
  const fail = (path, message) => { errors.push(`${path}: ${message}`); };
  const keys = (value, expected, path) => {
    if (!object(value)) { fail(path, 'must be an object'); return false; }
    for (const key of expected) if (!Object.hasOwn(value, key)) fail(`${path}.${key}`, 'required field is missing');
    for (const key of Object.keys(value)) if (!expected.includes(key)) fail(`${path}.${key}`, 'unknown field');
    return true;
  };
  const text = (value, path) => { if (!string(value)) fail(path, 'must be a nonempty string'); };
  const url = (value, path, nullable = false) => {
    if (!(nullable && value === null) && !validUrl(value)) fail(path, 'must be a public HTTP(S) URL without credentials or secrets');
  };
  const date = (value, path, nullable = false, timestamp = false) => {
    if (nullable && value === null) return;
    if (!validDate(value, timestamp)) fail(path, 'must be a valid ISO calendar date or zoned timestamp');
    else if (Date.parse(value) > now + 300_000) fail(path, 'cannot be in the future (five minute clock tolerance)');
  };
  if (!keys(catalog, ['generatedAt', 'leaderboards'], 'catalog')) return errors;
  date(catalog.generatedAt, 'catalog.generatedAt', false, true);
  if (!Array.isArray(catalog.leaderboards) || catalog.leaderboards.length === 0) {
    fail('catalog.leaderboards', 'must be a nonempty array');
    return errors;
  }
  const boardIds = new Set();
  const pools = new Set();
  for (const [index, board] of catalog.leaderboards.entries()) {
    const path = `leaderboards[${index}]`;
    if (!keys(board, BOARD_FIELDS, path)) continue;
    if (!id(board.id)) fail(`${path}.id`, 'must be a lowercase stable identifier');
    if (boardIds.has(board.id)) fail(`${path}.id`, 'duplicate leaderboard identifier');
    boardIds.add(board.id);
    if (!['image', 'video'].includes(board.media)) fail(`${path}.media`, 'must be image or video');
    for (const field of ['sourceName', 'task', 'shortTask', 'scoreType']) text(board[field], `${path}.${field}`);
    url(board.sourceUrl, `${path}.sourceUrl`);
    url(board.methodologyUrl, `${path}.methodologyUrl`);
    const pool = JSON.stringify([board.sourceUrl, board.task, board.scoreType]);
    if (pools.has(pool)) fail(path, 'duplicate source, task, and benchmark scoring pool');
    pools.add(pool);
    date(board.observedAt, `${path}.observedAt`);
    date(board.sourceUpdatedAt, `${path}.sourceUpdatedAt`, true);
    if (validDate(board.observedAt) && validDate(catalog.generatedAt)
      && Date.parse(board.observedAt) > Date.parse(catalog.generatedAt)) {
      fail(`${path}.observedAt`, 'observation cannot follow catalog generation');
    }
    if (validDate(board.sourceUpdatedAt) && validDate(board.observedAt)
      && Date.parse(board.sourceUpdatedAt) > Date.parse(board.observedAt) + (board.observedAt.length === 10 ? 86_400_000 - 1 : 0)) {
      fail(`${path}.sourceUpdatedAt`, 'publication cannot follow observation');
    }
    if (PRICE_UNITS.get(board.priceUnit) !== board.media) fail(`${path}.priceUnit`, 'must be an explicit supported unit for this media');
    if (!Array.isArray(board.notes) || board.notes.length === 0 || !board.notes.every(string)) {
      fail(`${path}.notes`, 'must contain nonempty provenance and comparability notes');
    }
    if (!Array.isArray(board.entries) || board.entries.length === 0) {
      fail(`${path}.entries`, 'must be a nonempty array');
      continue;
    }
    const entryIds = new Set();
    const entryNames = new Set();
    for (const [row, entry] of board.entries.entries()) {
      const entryPath = `${path}.entries[${row}]`;
      if (!keys(entry, MODEL_FIELDS, entryPath)) continue;
      if (!id(entry.id)) fail(`${entryPath}.id`, 'must be a lowercase stable identifier');
      if (entryIds.has(entry.id)) fail(`${entryPath}.id`, 'duplicate model identifier in this leaderboard');
      entryIds.add(entry.id);
      for (const field of ['name', 'provider']) text(entry[field], `${entryPath}.${field}`);
      if (entryNames.has(entry.name)) fail(`${entryPath}.name`, 'duplicate model variant in this leaderboard');
      entryNames.add(entry.name);
      if (!Number.isSafeInteger(entry.rank) || entry.rank < 1) fail(`${entryPath}.rank`, 'must be a positive safe integer; tied ranks are allowed');
      if (!finite(entry.score)) fail(`${entryPath}.score`, 'must be a finite number');
      for (const field of ['confidenceLow', 'confidenceHigh']) {
        if (entry[field] !== null && !finite(entry[field])) fail(`${entryPath}.${field}`, 'must be a finite number or null');
      }
      if ((entry.confidenceLow === null) !== (entry.confidenceHigh === null)) fail(entryPath, 'confidence interval must have both bounds or neither');
      if (finite(entry.confidenceLow) && finite(entry.confidenceHigh)
        && (entry.confidenceLow > entry.score || entry.confidenceHigh < entry.score)) {
        fail(entryPath, 'confidence interval must contain the score and be ordered');
      }
      if (entry.votes !== null && (!Number.isSafeInteger(entry.votes) || entry.votes < 0)) fail(`${entryPath}.votes`, 'must be a nonnegative safe integer or null');
      if (entry.price !== null && (!finite(entry.price) || entry.price < 0)) fail(`${entryPath}.price`, 'must be a finite nonnegative number or null');
      for (const field of ['priceUnit', 'priceNote']) {
        if (entry[field] !== null) text(entry[field], `${entryPath}.${field}`);
      }
      url(entry.priceSourceUrl, `${entryPath}.priceSourceUrl`, true);
      url(entry.modelUrl, `${entryPath}.modelUrl`, true);
      if (entry.price === null) {
        if (entry.priceUnit !== null || entry.priceSourceUrl !== null) fail(entryPath, 'missing price requires null priceUnit and priceSourceUrl');
      } else {
        if (entry.priceUnit !== board.priceUnit) fail(`${entryPath}.priceUnit`, 'must exactly match its leaderboard unit; mixed denominators are forbidden');
        if (!validUrl(entry.priceSourceUrl)) fail(`${entryPath}.priceSourceUrl`, 'a numeric price requires source provenance');
        if (!string(entry.priceNote)) fail(`${entryPath}.priceNote`, 'a numeric price requires source configuration or unit context');
      }
    }
  }
  return errors;
}

export function assertCatalog(catalog, options) {
  const errors = validateCatalog(catalog, options);
  if (errors.length) throw new Error(`Catalog validation failed (${errors.length}):\n${errors.slice(0, 100).join('\n')}`);
  return catalog;
}

export function summarizeCatalog(catalog) {
  return {
    leaderboards: catalog.leaderboards.length,
    observations: catalog.leaderboards.reduce((total, board) => total + board.entries.length, 0),
    pricedObservations: catalog.leaderboards.reduce((total, board) => total + board.entries.filter((row) => row.price !== null).length, 0),
    pools: catalog.leaderboards.map((board) => ({ id: board.id, media: board.media, observations: board.entries.length, priced: board.entries.filter((row) => row.price !== null).length, observedAt: board.observedAt, sourceUpdatedAt: board.sourceUpdatedAt })),
  };
}

export async function atomicWriteJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    const file = await open(temporary, 'wx');
    try {
      await file.writeFile(`${JSON.stringify(value, null, 2)}\n`);
      await file.sync();
    } finally { await file.close(); }
    await rename(temporary, path);
  } finally { await rm(temporary, { force: true }); }
}
