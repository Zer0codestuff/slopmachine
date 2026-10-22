import { readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { normalizeSnapshot, replacePools } from './build-catalog.mjs';
import { assertCatalog, atomicWriteJson, summarizeCatalog } from './lib/catalog.mjs';
import { scrapeAA } from './lib/refresh-aa.mjs';
import { arenaSubset, fetchArenaRows, normalizeArenaBoard } from './lib/refresh-arena.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const defaultInputs = ['research/images.json', 'research/videos.json'].map((file) => resolve(root, file));

/** Acquisition is a separate step from building the public catalog. */
export async function refreshData({
  inputs = defaultInputs,
  output = resolve(root, 'scripts/snapshots/refreshed.json'),
  evidenceDir = resolve(root, 'scripts/evidence/refresh'),
  source = 'all', media = 'all', check = false, headed = false, allowRowLoss = false,
  acquireAA = scrapeAA, acquireArena = fetchArenaRows,
} = {}) {
  if (!['all', 'aa', 'arena'].includes(source) || !['all', 'image', 'video'].includes(media)) throw new Error('Source must be all, aa, or arena; media must be all, image, or video');
  if (!inputs.length) throw new Error('At least one normalized input is required');
  if ([...inputs, resolve(root, 'public/data/catalog.json')].some((file) => resolve(file) === resolve(output))) throw new Error('Refresh output must differ from research inputs and the public catalog; use build-catalog.mjs to assemble the public file');
  const templates = (await Promise.all(inputs.map(async (file) => normalizeSnapshot(JSON.parse(await readFile(file, 'utf8')), file)))).flat();
  assertCatalog({ generatedAt: new Date().toISOString(), leaderboards: templates });
  const selected = templates.filter((board) => {
    const host = new URL(board.sourceUrl).hostname;
    return ['artificialanalysis.ai', 'arena.ai'].includes(host)
      && (media === 'all' || board.media === media) && (source === 'all' || host === (source === 'aa' ? 'artificialanalysis.ai' : 'arena.ai'));
  });
  const skippedPools = templates.filter((board) => !selected.includes(board)).map((board) => board.id);
  if (!selected.length) throw new Error('No input pools match the source/media selection');
  const evidence = new Map();
  const aaTemplates = selected.filter((board) => new URL(board.sourceUrl).hostname === 'artificialanalysis.ai');
  const refreshed = aaTemplates.length ? await acquireAA(aaTemplates, { headed, onCapture: (id, capture) => evidence.set(`${id}.browser.json`, capture) }) : [];
  let arenaRevision = null;
  for (const template of selected.filter((board) => new URL(board.sourceUrl).hostname === 'arena.ai')) {
    const capture = await acquireArena(arenaSubset(template));
    if (arenaRevision !== null && arenaRevision !== capture.revision) throw new Error('Arena dataset changed between subsets; retry the refresh');
    arenaRevision = capture.revision;
    evidence.set(`${template.id}.dataset.json`, capture);
    refreshed.push(normalizeArenaBoard(capture, template));
  }
  const catalog = assertCatalog({ generatedAt: new Date().toISOString(), leaderboards: refreshed });
  if (refreshed.length !== selected.length || selected.some((board) => !refreshed.some((next) => next.id === board.id))) throw new Error('Refresh did not return every selected pool exactly once');
  replacePools(selected, refreshed); // Reject changed identity and older observations/publications.
  let lastGood = null;
  try { lastGood = assertCatalog(JSON.parse(await readFile(output, 'utf8'))); }
  catch (error) {
    if (error.code !== 'ENOENT' && !(error instanceof SyntaxError) && !error.message.startsWith('Catalog validation failed')) throw error;
  }
  if (lastGood) replacePools(lastGood.leaderboards.filter((board) => refreshed.some((next) => next.id === board.id)), refreshed);
  for (const board of refreshed) {
    const previous = selected.find((item) => item.id === board.id);
    const previousCount = Math.max(previous.entries.length, lastGood?.leaderboards.find((item) => item.id === board.id)?.entries.length ?? 0);
    if (!allowRowLoss && board.entries.length < previousCount * 0.8) throw new Error(`${board.id}: row count fell from ${previousCount} to ${board.entries.length}; inspect for truncation before using --allow-row-loss`);
  }
  // No evidence or last-good output is changed until ALL requested pools pass.
  let manifestPath = null;
  if (!check) {
    const run = resolve(evidenceDir, `${catalog.generatedAt.replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`);
    for (const [name, capture] of evidence) await atomicWriteJson(resolve(run, name), capture);
    manifestPath = resolve(run, 'manifest.json');
    await atomicWriteJson(manifestPath, {
      observedAt: catalog.generatedAt, source, media, arenaRevision, skippedPools,
      evidenceFiles: [...evidence.keys()], summary: summarizeCatalog(catalog),
      note: 'Acquired public source observations. The public catalog has not been rebuilt or published.',
    });
    await atomicWriteJson(output, catalog);
  }
  return { catalog, written: !check, manifestPath, skippedPools };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node scripts/refresh-data.mjs [--input FILE ...] [--source all|aa|arena] [--media all|image|video] [--output FILE] [--evidence-dir DIR] [--check] [--headed] [--allow-row-loss]');
    console.log('Acquires new observations from public AA browser tables and/or the official Arena public dataset. No API key.');
    console.log('Default inputs: research/images.json + research/videos.json. Default output: scripts/snapshots/refreshed.json.');
    console.log('--check still contacts public sources but writes no files. Review docs/DATA.md for attribution and source restrictions.');
  } else {
    try {
      const options = {};
      const inputs = [];
      for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        if (['--check', '--headed', '--allow-row-loss'].includes(arg)) {
          options[arg === '--check' ? 'check' : arg === '--headed' ? 'headed' : 'allowRowLoss'] = true;
          continue;
        }
        if (!['--input', '--source', '--media', '--output', '--evidence-dir'].includes(arg) || !args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`Unknown or incomplete argument: ${arg}`);
        const value = args[++index];
        if (arg === '--input') inputs.push(resolve(value));
        else if (arg === '--source' || arg === '--media') options[arg.slice(2)] = value;
        else options[arg === '--output' ? 'output' : 'evidenceDir'] = resolve(value);
      }
      if (inputs.length) options.inputs = inputs;
      const result = await refreshData(options);
      const summary = summarizeCatalog(result.catalog);
      console.log(`Acquired and validated ${summary.leaderboards} pools, ${summary.observations} observations, ${summary.pricedObservations} prices.${result.written ? ` Saved ${options.output ?? relative(process.cwd(), resolve(root, 'scripts/snapshots/refreshed.json'))}. Evidence: ${result.manifestPath}` : ' No files written.'}`);
      console.log('The public catalog has not been rebuilt or published.');
      if (result.skippedPools.length) console.log(`Not refreshed: ${result.skippedPools.join(', ')}. Rebuild with --overlay to retain these saved pools.`);
    } catch (error) {
      console.error(`Refresh failed; last good snapshot and public catalog were preserved. ${error.message}`);
      process.exitCode = 1;
    }
  }
}
