import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertCatalog, summarizeCatalog } from './lib/catalog.mjs';
import { assertPricing } from './lib/pricing.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Usage: node scripts/validate-data.mjs [catalog.json] [--json]');
} else {
  try {
    if (args.some((arg) => arg.startsWith('--') && arg !== '--json') || args.filter((arg) => arg !== '--json').length > 1) throw new Error('Unknown arguments. Use --help.');
    const file = args.find((arg) => arg !== '--json') ?? resolve(root, 'public/data/catalog.json');
    const catalog = assertCatalog(JSON.parse(await readFile(file, 'utf8')));
    const summary = summarizeCatalog(catalog);
    if (!args.find(arg => arg !== '--json')) {
      const pricing = assertPricing(JSON.parse(await readFile(resolve(root, 'research/configuration-prices.json'), 'utf8')));
      summary.providerPriceGroups = pricing.families.length;
      summary.providerPriceQuotes = pricing.families.reduce((count, family) => count + family.points.length, 0);
    }
    console.log(args.includes('--json') ? JSON.stringify(summary, null, 2) : `Validated ${summary.leaderboards} leaderboards, ${summary.observations} observations, ${summary.pricedObservations} observed prices.${summary.providerPriceQuotes ? ` ${summary.providerPriceQuotes} separate provider quotes in ${summary.providerPriceGroups} groups.` : ''}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
