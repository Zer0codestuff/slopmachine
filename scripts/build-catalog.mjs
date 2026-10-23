import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertCatalog, atomicWriteJson, summarizeCatalog } from './lib/catalog.mjs';
import { mergeConfigurations } from './lib/configurations.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const defaultConfigurations = resolve(root, 'research/configurations.json');

export function normalizeSnapshot(snapshot, filename = 'snapshot') {
  const leaderboards = Array.isArray(snapshot) ? snapshot : snapshot?.leaderboards;
  if (!Array.isArray(leaderboards) || leaderboards.length === 0) throw new Error(`${filename}: expected a nonempty leaderboards array`);
  // Research wrappers may hold additional evidence metadata. Public boards and
  // entries must match src/types.ts exactly; unknown fields are never discarded.
  assertCatalog({ generatedAt: snapshot?.generatedAt ?? new Date().toISOString(), leaderboards });
  return leaderboards;
}

async function readSnapshot(file) {
  try { return normalizeSnapshot(JSON.parse(await readFile(file, 'utf8')), file); }
  catch (error) { throw new Error(`Cannot build from ${file}: ${error.message}`); }
}

const identityFields = ['id', 'sourceName', 'sourceUrl', 'methodologyUrl', 'media', 'task', 'scoreType', 'priceUnit'];

export function replacePools(original, replacements) {
  return original.map((board) => {
    const replacement = replacements.find((item) => item.id === board.id);
    if (!replacement) return board;
    for (const field of identityFields) {
      if (board[field] !== replacement[field]) throw new Error(`${board.id}: overlay changes pool identity field ${field}; update the research input explicitly`);
    }
    if (Date.parse(replacement.observedAt) < Date.parse(board.observedAt)
      || (board.sourceUpdatedAt !== null && (replacement.sourceUpdatedAt === null || Date.parse(replacement.sourceUpdatedAt) < Date.parse(board.sourceUpdatedAt)))) {
      throw new Error(`${board.id}: overlay is older than the saved observation or publication`);
    }
    // An observation overlay without series does not erase explicit metadata.
    // A removed member will fail final candidate validation rather than vanish.
    return !Object.hasOwn(replacement, 'series') && Object.hasOwn(board, 'series')
      ? { ...replacement, series: board.series }
      : replacement;
  });
}

export async function buildCatalog({ inputs, output, overlays = [], arenaSnapshot = null, configurations, check = false }) {
  if (!Array.isArray(inputs) || !inputs.length) throw new Error('At least one input snapshot is required');
  const overlayFiles = [...overlays, ...(arenaSnapshot ? [arenaSnapshot] : [])];
  const configurationFile = configurations === null ? null : resolve(configurations ?? defaultConfigurations);
  if ([...inputs, ...overlayFiles, ...(configurationFile ? [configurationFile] : [])].some((file) => resolve(file) === resolve(output))) throw new Error('Output must differ from every input, overlay, and configuration file');
  // Read and validate every input before touching the last good public snapshot.
  let leaderboards = (await Promise.all(inputs.map(readSnapshot))).flat();
  assertCatalog({ generatedAt: new Date().toISOString(), leaderboards });
  for (const file of overlayFiles) {
    const replacements = await readSnapshot(file);
    if (file === arenaSnapshot && !replacements.every((board) => new URL(board.sourceUrl).hostname === 'arena.ai')) {
      throw new Error('Arena override may contain only arena.ai source pools');
    }
    for (const board of replacements) {
      if (!leaderboards.some((original) => original.id === board.id)) throw new Error(`${file}: unknown overlay pool ${board.id}; use an explicit --input to include a new pool`);
    }
    leaderboards = replacePools(leaderboards, replacements);
  }
  if (configurationFile) {
    let contents;
    try { contents = await readFile(configurationFile, 'utf8'); }
    catch (error) {
      if (configurations !== undefined || error.code !== 'ENOENT') throw new Error(`Cannot read configurations from ${configurationFile}: ${error.message}`);
    }
    if (contents !== undefined) {
      try { leaderboards = mergeConfigurations(leaderboards, JSON.parse(contents), configurationFile); }
      catch (error) { throw new Error(`Cannot build configurations from ${configurationFile}: ${error.message}`); }
    }
  }
  const catalog = assertCatalog({ generatedAt: new Date().toISOString(), leaderboards });
  let previous = null;
  try { previous = assertCatalog(JSON.parse(await readFile(output, 'utf8'))); }
  catch (error) {
    if (error.code !== 'ENOENT' && !(error instanceof SyntaxError) && !error.message.startsWith('Catalog validation failed')) throw error;
  }
  const unchanged = previous && JSON.stringify(previous.leaderboards) === JSON.stringify(leaderboards);
  if (unchanged) catalog.generatedAt = previous.generatedAt;
  if (!check && !unchanged) await atomicWriteJson(output, catalog);
  return { catalog, unchanged: Boolean(unchanged), written: !check && !unchanged };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node scripts/build-catalog.mjs [--input FILE ...] [--output FILE] [--overlay FILE ...] [--arena-snapshot FILE] [--configurations FILE] [--check]');
    console.log('Defaults to research/images.json + research/videos.json, writing public/data/catalog.json. No network requests.');
    console.log('Merges research/configurations.json when present, or --configurations FILE, after observation overlays.');
    console.log('--check validates the proposed build without writing or claiming to refresh any source.');
  } else {
    try {
      const inputs = [];
      const overlays = [];
      let output = resolve(root, 'public/data/catalog.json');
      let arenaSnapshot = null;
      let configurations;
      let check = false;
      for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        if (arg === '--check') { check = true; continue; }
        if (!['--input', '--output', '--overlay', '--arena-snapshot', '--configurations'].includes(arg) || !args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`Unknown or incomplete argument: ${arg}`);
        const file = resolve(args[++index]);
        if (arg === '--input') inputs.push(file);
        else if (arg === '--output') output = file;
        else if (arg === '--overlay') overlays.push(file);
        else if (arg === '--arena-snapshot') arenaSnapshot = file;
        else configurations = file;
      }
      const result = await buildCatalog({ inputs: inputs.length ? inputs : ['research/images.json', 'research/videos.json'].map((file) => resolve(root, file)), output, overlays, arenaSnapshot, configurations, check });
      const summary = summarizeCatalog(result.catalog);
      console.log(`${check ? 'Checked saved inputs' : result.unchanged ? 'Unchanged' : 'Built from saved inputs'}: ${summary.leaderboards} leaderboards, ${summary.observations} observations, ${summary.pricedObservations} observed prices${check ? '' : ` -> ${output}`}`);
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
