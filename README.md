# Slop Machine

**The price of pixels.** Image and video model analytics in the compact, chart-first style of [Slopalytics](https://slopalytics.com/).

Compare generation quality, API cost, and the price/quality frontier using attributed observations from [Artificial Analysis](https://artificialanalysis.ai/), [Arena](https://arena.ai/), [Design Arena](https://www.designarena.ai/leaderboard?tab=image), and specialized video arenas. Each source, task, benchmark version, and audio condition has its own leaderboard.

![Slop Machine desktop dashboard](docs/screenshots/desktop.png)

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

Open the URL printed by Vite. The application runs entirely in the browser and needs no API key or backend.

```sh
npm run data:validate
npm run build
npm run preview
```

`dist/` is a static build with relative asset paths, suitable for hosting under a subdirectory.

## What it does

- Switch between image generation, image editing, and video benchmark pools.
- Explore cost versus quality with linear or log pricing axes and a Pareto frontier.
- Inspect quality rankings, confidence intervals, generation-cost estimates, and sortable data.
- Compare measured quality, resolution, or mode settings with connected model curves and configuration filters.
- Compare unscored provider settings in a separate cost chart, retaining their generation conditions.
- Search and toggle model families or complete provider groups.
- Download charts as PNG, selected observations as CSV, or the full catalog as JSON.
- Use dark or light mode, mobile filters, and shareable task/view URLs.

The initial selection includes leading models, the observed price/quality frontier, and complete measured configuration families. Solid lines join settings of the same model within one benchmark pool, in documented setting order. They do not estimate results between points. The dashed Pareto line is a separate comparison. Select all models in the sidebar to explore the complete source pool. Press `/` to search models.

## Data

The bundled catalog is a snapshot, not a live feed. It records source URLs, collection times, leaderboard publication dates when available, price conditions, sample counts, and confidence bounds. Missing values stay missing. Video costs are expressed per second; image costs are expressed per image.

The catalog includes 800 observations in 19 pools across five sources, with 480 reported prices or source quotes. Ten measured configuration families have connected curves. A separate cost chart contains 115 provider quotes in 34 configuration groups. Design Arena quotes have unspecified resolution/quality settings. World Model Arena covers first-person world models; MemeBench covers silent Chinese meme clips. These specialized pools carry visible qualifications and stay separate from general generation benchmarks.

Artificial Analysis states restrictions on scraping and public comparison-product reuse in its [website terms](https://artificialanalysis.ai/terms-of-use). Source visibility and attribution do not grant a separate reuse license. The application code license does not extend to third-party benchmark data. See the linked source-use facts in the data documentation.

Rebuilding the catalog validates and combines the research snapshots:

```sh
npm run data:build
npm run data:validate
```

Configuration membership is explicit in `research/configurations.json`; names alone never create a curve. Provider-only price quotes live in `research/configuration-prices.json` and appear under **Unscored settings & prices**. They have no borrowed or estimated benchmark scores. Detailed inclusion decisions are in `research/configuration-images.md` and `research/configuration-videos.md`.

Collection and refresh procedures, source coverage, and attribution are documented in [docs/DATA.md](docs/DATA.md). Rebuilding a catalog does not refresh source observations.

Elo values are comparable only within their source benchmark pool. A narrow rank difference or overlapping confidence interval does not establish a meaningful quality difference. Cost estimates use the source's published generation conditions, so check each model's pricing details before budgeting.

## Project layout

```text
src/                 React interface and SVG charts
public/data/         Validated catalog consumed by the browser
research/            Normalized observations and research notes
scripts/             Catalog normalization, validation, and refresh tooling
docs/                Source methodology and screenshots
```

## Credits and license

Created by [Zer0codestuff](https://github.com/Zer0codestuff). Visual direction inspired by Slopalytics; this is an independent implementation with no affiliation to the source sites.

Application code is [MIT licensed](LICENSE). Third-party data and dependencies retain their own terms. Arena's official leaderboard dataset is CC BY 4.0. Artificial Analysis data is attributed at each chart and observation. See the data documentation for the exact sources and conditions.
