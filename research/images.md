# Image benchmark research

## Ready data

`research/images.json` matches the `Catalog`, `Leaderboard`, and `Model` interfaces in `src/types.ts`. It currently contains five separate scoring pools across three sources, 404 model observations, and 254 source-priced observations. All prices use USD per image. No API key or authenticated source was used.

- Artificial Analysis, text to image: 105 rows, 100 prices. AA-Image-T2I v2.1 Elo. Observed 2026-10-22 at 18:41:02.700 UTC. Leaderboard publication date unavailable, represented as null.
- Artificial Analysis, image editing: 74 rows, 72 prices. AA-Image-Editing v2.1 Elo. Observed 2026-10-22 at 18:42:24.204 UTC. Leaderboard publication date unavailable, represented as null.
- Arena, text to image: 82 overall rows, no published prices. Arena Score, Bradley-Terry. Official leaderboard publication date 2026-10-07. Export observed 2026-10-22 at 23:07:04.881986 UTC.
- Arena, image editing: 60 overall rows, no published prices. Arena Score, Bradley-Terry. Official leaderboard publication date 2026-10-20. Export observed 2026-10-22 at 23:07:05.731189 UTC.

- Design Arena, image generation: 83 rows, 82 source-quoted prices. Design Arena Elo, Bradley-Terry. Observed 2026-10-22 at 23:08:37.093 UTC. The source update label is Oct 23, 2026, 12:06 AM GMT+2, represented as `2026-10-23T00:06:00+02:00`, equivalent to October 22 at 22:06 UTC.

The Arena and Design Arena observations occurred on October 23 in Europe/Rome. UTC timestamps are preserved in JSON. Observation time, leaderboard publication date, model release date, and dataset repository modification date are distinct fields or concepts.

## Artificial Analysis audit

Reused `scripts/snapshots/aa-images.json` and both existing public browser captures in `scripts/evidence/`. No duplicate AA scraping was performed. Re-normalizing all captured rows with the existing parser reproduced every leaderboard and model field exactly. The original AA snapshot was left unchanged.

Sources:

- [AA text-to-image leaderboard](https://artificialanalysis.ai/image/leaderboard/text-to-image)
- [AA image-editing leaderboard](https://artificialanalysis.ai/image/leaderboard/editing)
- [AA image methodology](https://artificialanalysis.ai/methodology/image)

Ranks, scores, confidence bounds and sample counts are copied from the rendered source rows. The raw browser captures also retain rank spreads and model release months, which have no dedicated field in the current UI contract. Samples mean source-reported model appearances, not unique voters. FLUX.2 [dev] is an anchor with no reported confidence interval in each board; both bounds remain null.

Every numeric AA price retains its original displayed USD per 1,000 images and the source configuration in `priceNote`. Normalization divides that original amount by 1,000. The source states creator API pricing at 1024x1024 and default model settings. Seven unavailable prices remain null, including null price unit and source URL. There is no inferred provider pricing or cross-source model join.

Audit evidence: `research/evidence/images-aa-audit.json`.

## Arena collection and audit

Direct browser visits to both [Arena text-to-image](https://arena.ai/leaderboard/text-to-image) and [Arena image editing](https://arena.ai/leaderboard/image-edit) returned Cloudflare security verification pages. The text-to-image browser diagnostics reported HTTP 403. Evidence is retained in `images-arena-t2i-browser.json` and `images-arena-edit-browser.json`.

Used the explicitly permitted [official lmarena-ai/leaderboard-dataset](https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset) fallback. The public Hugging Face Data Studio pages were scraped with the browser, and all 82 text-to-image and all 60 image-edit overall rows were accessible within their first 100 rendered rows. The downloadable Parquet files provide the same values at full floating-point precision. Every overall model name, organization, rank, battle count and publication date matched the browser. Ratings and confidence bounds matched at the browser's displayed six-decimal precision.

- [Text-to-image public dataset viewer](https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset/viewer/text_to_image/latest)
- [Image-edit public dataset viewer](https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset/viewer/image_edit/latest)
- [Arena ranking method](https://arena.ai/blog/ranking-method)

The downloads are pinned to repository revision `9041150e8a502da9f0e75c89824d34ad7dba7072`, whose existing public manifest reports last modification on 2026-10-21 at 03:07:03 UTC. The manifest and dataset card already collected by the video researcher are reused at `research/evidence/videos-arena-hf-manifest.json` and `research/evidence/videos-arena-hf-readme.md`. Repository modification time is not used as the leaderboard publication date. Attribution is Arena / lmarena-ai under CC BY 4.0.

The complete latest text-to-image export has 680 rows across categories; the image-edit export has 105. Only `category == overall` enters these requested boards. Some other text-to-image categories have older publication dates; they are preserved in raw evidence and excluded from the overall pool. Both included overall pools have one publication date each. Exact source ranks are 1 through 82 and 1 through 60. No rank is recomputed.

`votes` preserves source `vote_count`, defined in the official dataset schema as number of battles for the model. Source `rating`, `rating_lower`, and `rating_upper` map directly to score and confidence bounds. The dataset card describes Bradley-Terry ratings. The official ranking article distinguishes raw score rank from uncertainty-based rank spread; a displayed raw rank does not demonstrate statistical separation.

Model identifiers remain exactly as published. Empty source organizations are shown as `Unknown`: `p-image`, `stable-diffusion-v35-large`, and `P-Image-Edit`. Their original empty values remain in evidence. No provider is guessed. The export contains neither model URLs nor per-image price/configuration information, so those fields remain unavailable. AA prices are not transferred to Arena variants.

For each Arena task, `research/evidence/images-arena-*-hf-browser.json` holds the rendered browser rows, `*-latest.parquet` holds the original download, `*-latest.json` holds all decoded rows, and `*-latest.meta.json` records the pinned URL, observation time, byte length, response metadata and SHA-256. `images-arena-audit.json` records the browser/export comparison.

## Additional public image arenas

Design Arena is included as the usable additional current preference source. [Its public Image leaderboard](https://www.designarena.ai/leaderboard?tab=image) exposes 83 scored and explicitly ranked rows. All were captured after Show More. The separate Image Edit board and named subcategories are excluded. Source `Battles` maps to votes. Displayed win rates, wins/losses, percentage MoE, and generation times are preserved in evidence rather than inserted into unrelated contract fields.

The public price-chart component supplies 82 exact-name per-image price quotes for those displayed models. Reve Create has no price and remains null. Three additional chart-input models have no displayed rank and are excluded. Resolution, quality settings, pricing verification dates, and agreement with evaluation settings are unavailable, so every price note discloses this incomplete configuration. These prices do not establish a common fixed generation configuration or independent provider verification.

Design Arena's [About page](https://www.designarena.ai/about), [detailed methodology](https://notes.designarena.ai/methodology/), and leaderboard footer give differing uncertainty, sampling, and threshold descriptions. The rendered table publishes percentage MoE, with no numeric Elo confidence bounds. Both confidence fields remain null. Percentage MoE must not be treated as score uncertainty. Keep the source's displayed ranks without claiming statistically separated differences. Raw evidence is `images-additional-design-overall-2026-10-23.json`; methodology context is `images-additional-source-context-2026-10-23.json`.

[OpenArt](https://openart.ai/arena/leaderboard#board-image) was fully captured in evidence: seven models, six non-anchor 95% CIs, seven qualified 2K-class prices, source result date 2026-09-15, index v1.0. Its overall score equally weights four criteria, including reference adherence, and its [terms](https://openart.ai/arena/terms) explicitly disclaim independent or third-party certification. It is useful as a disclosed platform-specific benchmark. It is not included in the normalized catalog selected for independent current preference pools. The full raw rows and pricing qualifiers remain available in `images-additional-openart-overall-2026-10-23.json`.

[GenAI Arena](https://huggingface.co/spaces/TIGER-Lab/GenAI-Arena) provides independent historical research results. The public app currently has a build error, but browser-readable repository CSVs contain 17 text-to-image scores published 2025-03-24 and 10 image-edit scores published 2025-03-10. Their row order is by anonymous score, without an explicit rank field. They do not publish confidence bounds or samples in the CSV, and anonymous and full-pool conditions differ. The underlying battle-count aggregates are derived dataset counts, not exact leaderboard vote cells. Separate paper Table 5 evidence contains 19 historical image rows with CIs, data dated 2024-10-24 and paper v4 published 2024-11-11. Those intervals cannot be attached to the 2025 scores. GenAI is retained as historical evidence without being added to the current normalized catalog. No missing rank, score, CI, or price was invented.

The complete optional-source findings, counts, primary URLs, dates, and ten evidence files are indexed in `research/evidence/images-additional-findings-2026-10-23.md`, with detailed historical caveats in `images-additional-genai-findings.md`.

## Integration constraints

Keep all source/task/version pools separate. Do not average or rescale the scores into one leaderboard. Do not turn observation times into publication dates or infer historical trends. Confidence intervals are source estimates; overlap does not prove a ranking difference. Missing prices must remain unavailable and be excluded from cost plots.

The research scope changes no UI, dependencies, package files, git history, or project instructions. Validation: `node scripts/validate-data.mjs research/images.json --json` passes. Arena source mappings and Parquet checksums were also verified. Import this file into the public catalog without merging its source/task pools.
