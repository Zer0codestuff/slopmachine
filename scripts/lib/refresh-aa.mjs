import { modelId } from './aa-browser.mjs';
import { assertCatalog } from './catalog.mjs';

const headers = ['', 'Range', 'Model', 'Elo', 'Samples', 'Released', 'API Pricing 1'];
const countPattern = /^(?:\d+|\d{1,3}(?:,\d{3})+)$/;
const moneyPattern = '(?:\\d+|\\d{1,3}(?:,\\d{3})+)(?:\\.\\d+)?';

// This function is deliberately self-contained so T3 preview_evaluate can run
// the same DOM extraction as the optional local Playwright workflow.
export function captureAAPage() {
  const clean = (text) => text.replace(/\s+/g, ' ').trim();
  const tables = [...document.querySelectorAll('table')].filter((table) => [...table.querySelectorAll('thead th')].some((cell) => clean(cell.textContent) === 'Elo'));
  if (tables.length !== 1) throw new Error(`Expected one public Elo table, found ${tables.length}`);
  const table = tables[0];
  return {
    sourceUrl: location.href,
    observedAt: new Date().toISOString(),
    title: document.title,
    heading: document.querySelector('h2')?.textContent.trim(),
    headers: [...table.querySelectorAll('thead th')].map((cell) => clean(cell.textContent)),
    priceContext: [...document.querySelectorAll('p')].map((element) => clean(element.textContent)).filter((text) => text.includes('API Pricing reflects')),
    filters: {
      category: [...document.querySelectorAll('button')].map((button) => clean(button.textContent)).find((text) => text.startsWith('Category:')),
      checked: [...document.querySelectorAll('[role="radio"][aria-checked="true"]')].map((element) => clean(element.textContent)),
    },
    rows: [...table.querySelectorAll('tbody tr')].map((row) => {
      const cells = [...row.querySelectorAll('td')];
      return {
        cells: cells.map((cell) => cell.textContent.trim()),
        provider: [...(cells[2]?.querySelectorAll('img[alt]') ?? [])].map((img) => img.alt).find((alt) => alt.endsWith(' logo'))?.replace(/ logo$/, '') ?? null,
        links: [...(cells[2]?.querySelectorAll('a[href]') ?? [])].map((link) => link.href),
      };
    }),
  };
}

export function normalizeAABoard(capture, template) {
  if (capture.sourceUrl !== template.sourceUrl || new URL(capture.sourceUrl).hostname !== 'artificialanalysis.ai') throw new Error(`${template.id}: browser redirected away from the expected public page`);
  const benchmark = `${template.scoreType} ${template.task}`.match(/AA-(?:Image|Video)-[A-Za-z0-9-]+ v\d+\.\d+/)?.[0];
  const actualBenchmark = (capture.heading ?? capture.title ?? '').match(/^AA-(?:Image|Video)-[A-Za-z0-9-]+ v\d+\.\d+/)?.[0];
  if (!benchmark || actualBenchmark !== benchmark) throw new Error(`${template.id}: benchmark changed from ${benchmark} to ${actualBenchmark}; inspect the source and update the research definition`);
  if (JSON.stringify(capture.headers) !== JSON.stringify(headers)) throw new Error(`${template.id}: public table columns changed`);
  const image = template.media === 'image';
  const checked = capture.filters?.checked;
  const audio = new URL(template.sourceUrl).searchParams.get('audio-output') === 'false' ? 'No Audio' : 'With Audio';
  if (capture.filters?.category !== 'Category: Overall' || !checked?.includes('All')
    || (image ? !checked.includes('Available models') : !checked.includes(audio))) {
    throw new Error(`${template.id}: category, model availability, or audio filter changed`);
  }
  const contextPattern = image ? /1,000 images.*1024x1024.*default settings/ : /1 minute of 1080p video.*default settings/;
  if (!Array.isArray(capture.priceContext) || !capture.priceContext.some((note) => contextPattern.test(note))) throw new Error(`${template.id}: missing or changed price denominator/configuration footnote`);
  if (!Array.isArray(capture.rows) || !capture.rows.length) throw new Error(`${template.id}: empty public table`);
  const knownIds = new Map(template.entries.map((entry) => [entry.name, entry.id]));
  const entries = capture.rows.map((row, index) => {
    const cells = row.cells;
    if (cells?.length !== 7 || !row.provider || !/^\d+$/.test(cells[0]) || !countPattern.test(cells[4])) throw new Error(`${template.id}: invalid row ${index + 1}`);
    const score = cells[3].match(/^(-?\d+(?:\.\d+)?)(?=\s|±|Anchor|$)/);
    const interval = cells[3].match(/95% interval (-?\d+(?:\.\d+)?) to (-?\d+(?:\.\d+)?)/);
    if (!score || (!interval && !/Anchor/.test(cells[3]))) throw new Error(`${template.id}: missing score or unknown confidence interval in row ${index + 1}`);
    const price = cells[6].match(new RegExp(`^\\$(${moneyPattern}) \\/${image ? '1k imgs' : 'min'}$`));
    if (!price && !['No API available', 'Coming soon', '-', ''].includes(cells[6])) throw new Error(`${template.id}: unknown price representation ${cells[6]}`);
    return {
      id: knownIds.get(cells[2]) ?? modelId(cells[2]), name: cells[2], provider: row.provider,
      rank: Number(cells[0]), score: Number(score[1]),
      confidenceLow: interval ? Number(interval[1]) : null,
      confidenceHigh: interval ? Number(interval[2]) : null,
      votes: Number(cells[4].replaceAll(',', '')),
      price: price ? Number(price[1].replaceAll(',', '')) / (image ? 1000 : 60) : null,
      priceUnit: price ? (image ? 'image' : 'second') : null,
      priceNote: price
        ? `Source displays ${cells[6]}. Divided by ${image ? '1,000' : '60'} to express USD per ${image ? 'image' : 'second'}. Exact source variant: ${cells[2]}. ${capture.priceContext.join(' ')}`
        : `Source displays ${cells[6] || 'no price'}.`,
      priceSourceUrl: price ? capture.sourceUrl : null,
      modelUrl: row.links?.find((link) => typeof link === 'string' && link.startsWith('https://')) ?? null,
    };
  });
  // Current AA public tables render every rank. A partial, paginated, or
  // virtualized table must be inspected before accepting a changed extractor.
  const ranks = entries.map((entry) => entry.rank).sort((a, b) => a - b);
  if (ranks.some((rank, index) => rank !== index + 1)) throw new Error(`${template.id}: table ranks are incomplete or duplicated`);
  const board = {
    ...template, observedAt: capture.observedAt, sourceUpdatedAt: null, entries,
    notes: [
      `Attribution: Artificial Analysis, https://artificialanalysis.ai/. Public browser capture of ${benchmark}; Overall category, ${image ? 'all providers and available models' : `all models and ${audio.toLowerCase()}`}. All ${entries.length} rendered rows are included.`,
      'Retrieval time is observedAt. No leaderboard publication date is stated by this public table; model release dates and Updated badges are not publication timestamps.',
      `Displayed USD per ${image ? '1,000 images is divided by 1,000' : 'minute is divided by 60'}. Each price retains its exact row variant and the public configuration footnote. No cross-source price joins are applied.`,
      'Samples are source-reported preference appearances, not unique voters. Source 95% confidence bounds are preserved; fixed Anchor rows have null bounds. Overlapping intervals do not establish a distinct rank.',
      'Provider strings preserve public logo labels, including an inference provider where shown; they do not assert a model creator identity.',
      'Keep source, task, benchmark version, and audio condition in separate scoring pools.',
    ],
  };
  assertCatalog({ generatedAt: new Date().toISOString(), leaderboards: [board] });
  return board;
}

export async function scrapeAA(templates, { headed = false, timeoutMs = 45_000, onCapture = () => {} } = {}) {
  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch { throw new Error('AA browser refresh needs optional Playwright. Run: npm install --no-save --package-lock=false playwright && npx playwright install chromium'); }
  const browser = await chromium.launch({ headless: !headed });
  try {
    // No saved profile, login, cookies, API key, or authentication headers.
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.setDefaultTimeout(timeoutMs);
    const boards = [];
    for (const template of templates) {
      const response = await page.goto(template.sourceUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
      if (!response?.ok()) throw new Error(`${template.id}: public page returned HTTP ${response?.status() ?? 'unknown'}`);
      const benchmark = `${template.scoreType} ${template.task}`.match(/AA-(?:Image|Video)-[A-Za-z0-9-]+ v\d+\.\d+/)?.[0];
      await page.waitForFunction((expected) => document.querySelector('h2')?.textContent.startsWith(expected)
        && document.querySelector('table tbody tr')
        && [...document.querySelectorAll('p')].some((p) => p.textContent.includes('API Pricing reflects')), benchmark, { timeout: timeoutMs });
      const capture = await page.evaluate(captureAAPage);
      boards.push(normalizeAABoard(capture, template));
      await onCapture(template.id, capture);
    }
    return boards;
  } finally { await browser.close(); }
}
