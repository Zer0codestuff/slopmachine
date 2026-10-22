import { createHash } from 'node:crypto';

const IMAGE_BOARDS = {
  '/image/leaderboard/text-to-image': { id: 'aa-image-text-to-image', task: 'Text to image', benchmark: 'AA-Image-T2I v2.1' },
  '/image/leaderboard/editing': { id: 'aa-image-editing', task: 'Image editing', benchmark: 'AA-Image-Editing v2.1' },
};

export function modelId(name) {
  const slug = name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || 'model';
  return `${slug}-${createHash('sha256').update(name).digest('hex').slice(0, 10)}`;
}

export function normalizeAAImageCapture(capture) {
  const url = new URL(capture.sourceUrl);
  const config = IMAGE_BOARDS[url.pathname];
  if (url.hostname !== 'artificialanalysis.ai' || !config) throw new Error('Unsupported public AA image page');
  if (!capture.title.startsWith(config.benchmark)) throw new Error('AA benchmark version changed; inspect the public page before updating');
  if (!Array.isArray(capture.rows) || !capture.rows.length || !capture.priceContext?.some((note) => /1,000 images/.test(note))) throw new Error('Incomplete browser capture or missing pricing context');
  const entries = capture.rows.map((row, index) => {
    const cells = row.cells;
    if (cells?.length !== 7 || !row.provider || !/^\d+$/.test(cells[0])) throw new Error(`Invalid AA image table row ${index}`);
    const score = cells[3].match(/^(-?\d+(?:\.\d+)?)/);
    const interval = cells[3].match(/95% interval (-?\d+(?:\.\d+)?) to (-?\d+(?:\.\d+)?)/);
    const price = cells[6].match(/^\$([\d,.]+) \/1k imgs$/);
    if (!score || !/^[\d,]+$/.test(cells[4])) throw new Error(`Missing AA image score or samples in row ${index}`);
    if (!interval && !/Anchor/.test(cells[3])) throw new Error(`Unknown confidence representation in row ${index}`);
    if (!price && cells[6] !== 'No API available' && cells[6] !== '-' && cells[6] !== '') throw new Error(`Unknown price representation: ${cells[6]}`);
    return {
      id: modelId(cells[2]), name: cells[2], provider: row.provider,
      rank: Number(cells[0]), score: Number(score[1]),
      confidenceLow: interval ? Number(interval[1]) : null,
      confidenceHigh: interval ? Number(interval[2]) : null,
      votes: Number(cells[4].replaceAll(',', '')),
      price: price ? Number(price[1].replaceAll(',', '')) / 1000 : null,
      priceUnit: price ? 'image' : null,
      priceNote: price ? `Source displays ${cells[6]}. Divided by 1,000 to express USD per image. ${capture.priceContext.join(' ')}` : `Source displays ${cells[6] || 'no price'}.`,
      priceSourceUrl: price ? capture.sourceUrl : null,
      modelUrl: row.links?.find((link) => link.startsWith('https://')) ?? null,
    };
  });
  return {
    id: config.id, media: 'image', sourceName: 'Artificial Analysis', sourceUrl: capture.sourceUrl,
    methodologyUrl: 'https://artificialanalysis.ai/methodology/image',
    task: config.task, shortTask: config.task, scoreType: `${config.benchmark} Elo`,
    observedAt: capture.observedAt, sourceUpdatedAt: null, priceUnit: 'image',
    notes: [
      `Public browser table capture of ${config.benchmark}, overall category and available models. All ${entries.length} rendered rows are included.`,
      'Attribution: Artificial Analysis, https://artificialanalysis.ai/. Retrieval time is not a leaderboard publication date.',
      'Source prices are USD per 1,000 images, divided by 1,000 for the UI. The original displayed amount and conditions are retained for each price.',
      'Samples are source-reported appearances, not unique voters. Confidence bounds are copied from the table accessibility text. Anchor rows have no reported interval.',
      'Keep this benchmark version separate from Arena and other AA tasks. No cross-source price or model-variant joins are applied.',
    ], entries,
  };
}
