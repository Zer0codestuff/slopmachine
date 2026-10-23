# Benchmark data workflow

The app consumes `public/data/catalog.json`. Research inputs are normalized snapshots in `research/images.json` and `research/videos.json`. A rebuild reads saved files only. A refresh contacts public sources and records a new observation. Neither operation establishes a live feed or publishes a site.

The repository includes normalized observations, source links, research findings, and the collection tooling. Raw browser captures, downloaded source documents, and intermediate acquisition snapshots remain in local ignored directories (`research/evidence/`, `scripts/evidence/`, and `scripts/snapshots/`). Research notes reference those local audit files; a fresh clone can rebuild the bundled catalog directly from the included normalized inputs.

## Build and validate saved snapshots

Run from the project root with Node.js 22 or newer:

```sh
node scripts/build-catalog.mjs --check
node scripts/build-catalog.mjs
node scripts/validate-data.mjs
node scripts/validate-data.mjs --json
```

The builder defaults to both research inputs and writes `public/data/catalog.json` using an atomic replacement after every input passes validation. `--check` validates the proposed build without writing; it does not compare the saved public catalog to the proposal. An unchanged build retains its previous `generatedAt` and does not rewrite the file. Missing inputs, invalid JSON, schema errors, duplicate pools, and incompatible overlays leave the last good catalog intact.

For a reviewable candidate without changing the app's data:

```sh
node scripts/build-catalog.mjs --output /tmp/slop-candidate.json
node scripts/validate-data.mjs /tmp/slop-candidate.json
```

Use repeated `--input FILE` arguments to replace the default input list. Each file must contain a nonempty leaderboard array, or an object with `leaderboards` and an optional ISO `generatedAt`. Research wrapper metadata is allowed. Leaderboards and model rows must match `src/types.ts` exactly; unknown public fields are rejected rather than discarded.

## Refresh public sources without an API key

`refresh-data.mjs` reads the research files as pool definitions. It supports Artificial Analysis image/video browser tables and Arena's official public dataset. Other pools, including Design Arena, retain their saved observations and are explicitly reported as not refreshed. There is no automatic fallback to stale data after an acquisition failure.

Arena refresh needs only Node's built-in `fetch`:

```sh
node scripts/refresh-data.mjs --source arena --output scripts/snapshots/arena-refreshed.json
node scripts/validate-data.mjs scripts/snapshots/arena-refreshed.json
node scripts/build-catalog.mjs --overlay scripts/snapshots/arena-refreshed.json --output /tmp/slop-candidate.json
```

AA refresh uses the optional [Playwright library](https://playwright.dev/docs/library). This local setup does not change `package.json` or the lockfile:

```sh
npm install --no-save --package-lock=false playwright@1.64.1
npx playwright install chromium
```

Read the source-use facts below before using AA observations in a public comparison product. These commands acquire public page observations only:

```sh
node scripts/refresh-data.mjs --source aa --output scripts/snapshots/aa-refreshed.json
node scripts/refresh-data.mjs --source aa --media video --headed --output scripts/snapshots/aa-video-refreshed.json
```

`--headed` shows Chromium for inspection. The browser uses a fresh context without a saved profile, login, cookies, API key, or authenticated headers. An access challenge, missing table, changed benchmark, changed headers, unknown price representation, or missing pricing footnote fails the run. The workflow does not bypass access controls.

To acquire every supported pool, validate the result, then assemble a candidate while preserving unsupported pools:

```sh
node scripts/refresh-data.mjs --output scripts/snapshots/refreshed.json
node scripts/validate-data.mjs scripts/snapshots/refreshed.json
node scripts/build-catalog.mjs --overlay scripts/snapshots/refreshed.json --output /tmp/slop-candidate.json
node scripts/validate-data.mjs /tmp/slop-candidate.json
```

After reviewing the candidate, the corresponding local integration command is:

```sh
node scripts/build-catalog.mjs --overlay scripts/snapshots/refreshed.json
```

`--source all|aa|arena` and `--media all|image|video` select a subset. `--check` still performs network acquisition but writes no files. Repeated `--input FILE` arguments replace the default definitions. `--evidence-dir DIR` changes the default `scripts/evidence/refresh` evidence directory. Use distinct output filenames for independently refreshed subsets.

All selected pools must pass before the refresh output is atomically replaced. Version, task, media, source URL, score type, and denominator must match the saved pool. Older observations and publication dates are rejected. A row-count drop greater than 20% fails for inspection; `--allow-row-loss` accepts a reviewed removal, while all schema and completeness checks still apply. Overlay builds replace matching IDs only and preserve every unselected pool. `--arena-snapshot FILE` is a compatibility alias for an Arena-only overlay.

Each successful refresh writes a new timestamped evidence directory containing normalized public DOM captures or public dataset responses, plus a manifest with counts, selected scope, skipped pools, and Arena revision. Raw HTML, Parquet, and HTTP `*.meta.json` files are local research material, outside the refresh output. A write failure may leave a new evidence directory; it does not corrupt the previous refresh output or the public catalog. Acquisition failures write neither evidence nor output.

### Public browser inspection in T3 Code

For source research, use `preview_status`, then `preview_open` if needed, and inspect the exact public URL from the saved pool. Each parallel agent should create its own tab and use its returned `tabId`.

`scripts/lib/refresh-aa.mjs` exports the self-contained `captureAAPage` DOM extractor. Its function body can be evaluated with `preview_evaluate`; pass the resulting object and the saved pool to `normalizeAABoard`. Preserve the resulting capture as evidence. The local Playwright workflow uses the same extractor. A browser observation must retain the heading, headers, active filters, every rendered row, source URL, retrieval timestamp, provider logo label, and price footnote. Do not replace missing rows with another source's data.

## Data contracts

- A scoring pool keeps its source, task, benchmark version, category, and audio condition separate. AA video with audio and without audio are different pools. Arena's dataset does not expose an audio-condition column.
- `observedAt` records retrieval. `sourceUpdatedAt` records an explicit source publication date or stays null. Model release months, repository commit dates, and undated Updated badges are not substitutes. `generatedAt` records catalog assembly, not source freshness.
- Prices are USD per `image` or per `second`. AA image prices shown per 1,000 images are divided by 1,000. AA video prices shown per minute are divided by 60. The displayed amount, variant, resolution label, and source footnote remain in `priceNote`. No conversion is inferred from an unfamiliar unit.
- Missing prices use null for `price`, `priceUnit`, and `priceSourceUrl`. Numeric prices require a matching denominator, a source URL, and configuration context. Arena dataset rows have no generation price, so no AA prices are joined to them.
- Confidence intervals retain both source bounds, or both stay null for a fixed anchor or unreported interval. Counts preserve source semantics: AA Samples are appearances; Arena `vote_count` is battles. Neither means unique voters.
- The validator checks exact fields, stable IDs, duplicate model variants and pools, finite numbers, confidence bounds, nonnegative counts/prices, compatible units, URL provenance, ISO calendar dates, and chronology. It does not certify source accuracy, freshness, statistical significance, or reuse permission.

Arena acquisition uses the documented [Hugging Face Dataset Viewer rows endpoint](https://huggingface.co/docs/dataset-viewer/rows), paginated at 100 rows. It checks every row index, total count, required column, truncated-cell list, and `x-revision` header. A changed revision across pages or subsets rejects the run. Only `category == "overall"` is selected; those rows must share one publication date. Evidence retains the complete retrieved responses and the dataset revision. The source row's `license` describes the model, not the dataset's reuse license.

## Source-use facts checked 23 October 2026

**Artificial Analysis:** the [free API documentation](https://artificialanalysis.ai/api-reference#attribution) requires credit and links its governing terms. Public-page acquisition does not use that API. The [website terms](https://artificialanalysis.ai/terms-of-use), revised 15 September 2026, limit access to personal noncommercial use and restrict copying, republication, and building a similar or competitive product in sections 2.1 and 2.2. Section 3.3(b) also restricts automated requests and scraping. Obtain the applicable permission for automated acquisition and public reuse; public visibility is not an open-data license.

The [Data Platform Terms v1.1](https://artificialanalysiscdn.com/legal/ProDataPlatformTerms.pdf), revised 19 August 2026, cover the free API. Sections 2.4 and 2.5, page 4, restrict raw-data dashboards, structured redistribution, third-party data combinations, and public model-comparison products without prior written consent. Section 5, page 6, requires a visible chart logo, linked metric credit, and creator/non-endorsement identification for derived work. Metric credit is `Source: Artificial Analysis (artificialanalysis.ai)`; derived credit is `Based on data from Artificial Analysis`. The [official brand kit](https://artificialanalysiscdn.com/brand-kit/aa_brand_kit.zip) supplies the logo. Attribution alone does not resolve those separate restrictions. Slop Machine appears to fall within the comparison-product description; confirm the intended public use and redistribution with AA before publication.

**Arena:** the [official Arena Leaderboard Dataset](https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset) is marked CC BY 4.0. Its latest splits cover `text_to_image`, `image_edit`, `text_to_video`, `image_to_video`, and `video_edit`; full splits contain historical snapshots. The [dataset schema](https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset#schema) identifies scores, bounds, battles, ranks, categories, and publication dates. This workflow uses that public dataset rather than scraping Arena's website.

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) permits sharing and adaptation, including commercial use, with appropriate credit, a license link, and change disclosure, without implying endorsement. Suggested visible credit: "Source: Arena, Arena Leaderboard Dataset, CC BY 4.0. Filtered and reformatted by Slop Machine." Link the dataset and license. Refreshed board notes include those links and describe the transformation. A public UI or export must retain that attribution. Dataset publication dates can differ from website dates; no guaranteed refresh cadence or website parity is assumed.

## npm integration

Existing `data:build` and `data:validate` scripts can keep their current commands. The only additional script needed is:

```json
"data:refresh": "node scripts/refresh-data.mjs"
```

No runtime dependency is added. Arena refresh has no extra dependency. AA refresh optionally uses `playwright@1.64.1` and its Chromium download. If the project chooses to keep it installed, add it to `devDependencies`; otherwise use the no-save setup above. The standard application build does not import Playwright.

## Configuration comparisons

`research/configurations.json` declares board-local configuration membership. The builder loads it after observation overlays, or accepts `--configurations FILE`. Each series has a stable ID, family name, dimension (`quality`, `resolution`, or `mode`), source URLs, a qualification note, and explicit ordered model IDs. Single-point series identify a documented setting; a chart needs at least two visible priced points to draw a curve.

```sh
node scripts/build-catalog.mjs --configurations research/configurations.json --check
node scripts/build-catalog.mjs --configurations research/configurations.json --output /tmp/slop-config-candidate.json
node scripts/validate-data.mjs /tmp/slop-config-candidate.json
```

Validation rejects cross-board references, duplicate membership, duplicate orders, and unknown fields. It never infers family membership from model names. An overlay that removes a referenced model fails validation rather than silently dropping its setting. Curves retain setting order even when a more expensive setting has a lower measured score. Quality filters use the documented source labels; video resolution and Standard/Pro modes are not relabeled low/medium reasoning.

`research/configuration-prices.json` is a separate provider-quote input, bundled with the interface. Each family records its source URL, observation time, denominator, generation configuration, and price qualifications. Default `npm run data:validate` also validates these provider quotes. The separate cost chart has no Elo axis, and its CSV explicitly marks benchmark scores unavailable. Official output-image estimates can exclude input tokens; video quotes can depend on duration, resolution, audio, mode, or credit bundle. They do not replace the benchmark's own matched pricing.

### October 23 integration decisions

- Included all 51 ranked, rendered Design Arena editing rows in their own pool. Registry image quotes are matched by exact source model ID. No confidence intervals are derived from standard errors or percentage margins.
- Retained only the three already ranked Design Arena generation P-Image settings. The two response-only Low/Medium points have no source ranks and remain research evidence. AA supplies all five measured settings independently.
- Recollected all 82 rows of AA I2V Silent v1.0 through the public browser page. Scores, intervals, counts and ranks were unchanged. Both Kling 3.0 Pro quotes changed from $0.224/s to $0.112/s; Veo 3.1 Lite lost its reported API price. The source's Standard quote remains $0.168/s and differs from creator pricing. Both source conditions stay visible.
- Current video pages have no category selector. Acquisition accepts that absence for video only, while rejecting a present non-Overall category, incorrect audio filters, unknown headers, and a changed benchmark.
- Excluded conditional Grok Auto/Medium and Hailuo mode connections, historical Arena Low scores, and unmeasured provider settings from measured curves. Provider-only quotes remain available without scores.
- Imported 91 numeric image configuration quotes and 24 video quotes. Auto or unsupported settings without a fixed price remain in research notes, outside numeric cost charts.
