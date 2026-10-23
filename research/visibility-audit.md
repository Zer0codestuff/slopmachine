# Video model visibility audit

Audited on 2026-10-23, with public-source checks at 12:18-12:20 UTC. This is a read-only audit of the existing snapshot and public pages. No refresh, catalog rebuild, authenticated API, paid operation, source change, UI change, or Git mutation was performed by this audit. This report is its only project-file change. `AGENTS.md` was read and left unchanged as requested.

Source-line references describe the code inspected before concurrent implementation edits appeared in the shared checkout. HEAD at report creation was `a58c93ab33c482d3a5c1c298bad86a69ef0a24a2`; changes to `src/App.tsx`, `src/Charts.tsx`, `src/data.ts`, and `src/styles.css` were observed near completion and belong to other work. They were not changed or reviewed by this audit. Runtime reproductions below concern the published site.

## Finding and recommended default

Seedance 2.5 is already present in nine video pools and selected by the existing default-selection rule in all nine. It is genuinely absent from the selected AA I2V Silent pool, including the current public source table. The generic Video button preferentially opens that pool because it has measured configuration curves (`src/App.tsx:164`). This makes a pool-coverage difference appear to be missing catalog coverage.

Use **`aa-video-t2v-v2-1`**, visibly labeled **Text to Video Audio**, as the explicit first-visit Video default. It is the broad general text-to-video pool, has 30 saved observations and 27 saved prices, and includes Seedance 2.5 at source rank 5. The existing selection yields nine selected observations and seven priced points. Its lack of a measured configuration curve should not override coverage when choosing the generic entry pool. [Current AA T2V Audio table](https://artificialanalysis.ai/video/leaderboard/text-to-video?models=all).

If the product explicitly requires image-to-video as its entry task, the suitable alternative is **`aa-video-i2v-v1-1`**, labeled **Image to Video Audio**: 24 saved observations, 23 saved prices, Seedance 2.5 at rank 3, and eight selected priced points. Keep the current Silent pool available as a separate task. [Current AA I2V Audio table](https://artificialanalysis.ai/video/leaderboard/image-to-video?models=all).

This recommendation concerns navigation and coverage. It does not establish that scores, configurations, or prices are comparable across these pools. All ranks below belong only to their named pool.

## Catalog and publication check

The [published catalog](https://gabrielemonni.me/slopmachine/data/catalog.json) returned HTTP 200 and matched `public/data/catalog.json` byte for byte. SHA-256: `03caeedc8abdf2dcf032b411355c66e94ac39edcdeffdef7b23495993456cdf3`. The catalog contains 19 pools and 800 observations; video accounts for 13 pools, 345 observations, and 183 numeric prices. These are observation counts, not unique-model counts.

| Exact video pool ID | Saved rows | Saved priced | Default selected |
| --- | ---: | ---: | ---: |
| `aa-video-t2v-v2-1` | 30 | 27 | 9 |
| `aa-video-t2v-silent-v2-1` | 32 | 30 | 9 |
| `aa-video-i2v-v1-1` | 24 | 23 | 8 |
| `aa-video-i2v-silent-v1-0` | 82 | 68 | 18 |
| `aa-video-editing-v1-1` | 9 | 9 | 8 |
| `aa-video-editing-silent-v1-1` | 10 | 10 | 9 |
| `arena-text-to-video` | 48 | 0 | 8 |
| `arena-image-to-video` | 48 | 0 | 8 |
| `arena-video-edit` | 10 | 0 | 8 |
| `world-model-arena-visual-quality` | 12 | 0 | 8 |
| `world-model-arena-action-dynamics` | 12 | 0 | 8 |
| `world-model-arena-world-memory` | 12 | 0 | 8 |
| `memebench-i2v-silent` | 16 | 16 | 9 |

Default selected counts precede price and configuration-setting visibility filters. The older `research/videos.md` describes the original 184-price video capture; the public catalog now has 183 following the reviewed I2V Silent pricing changes. Use the actual catalog for current bundled counts.

## Seedance 2.5 locations

| Pool | Source rank | Exact observation ID |
| --- | ---: | --- |
| AA T2V Audio | 5 | `aa-video-t2v-v2-1-dreamina-seedance-2-5` |
| AA T2V Silent | 5 | `aa-video-t2v-silent-v2-1-dreamina-seedance-2-5` |
| AA I2V Audio | 3 | `aa-video-i2v-v1-1-dreamina-seedance-2-5` |
| AA Editing Audio | 2 | `aa-video-editing-v1-1-dreamina-seedance-2-5` |
| AA Editing Silent | 3 | `aa-video-editing-silent-v1-1-dreamina-seedance-2-5` |
| Arena T2V | 7 | `arena-text-to-video-dreamina-seedance-2-5-720p` |
| Arena I2V | 4 | `arena-image-to-video-dreamina-seedance-2-5-720p` |
| Arena Editing | 2 | `arena-video-edit-dreamina-seedance-2-5-720p` |
| MemeBench | 3 | `memebench-i2v-silent-seedance-2-5` |

These are separate observations. The Arena name explicitly includes 720p; no equivalent configuration or price is inferred from the AA or MemeBench records.

## Current public-source evidence

Each AA page was opened in an owned T3 preview tab. The rendered benchmark heading, active All and audio radios, row count, sequential ranks, Seedance rows, leading rows, and pricing footnote were inspected. All six current row counts match their saved pools.

| Exact public page | Rendered benchmark | Rows | Seedance 2.5 rank |
| --- | --- | ---: | ---: |
| [T2V Audio](https://artificialanalysis.ai/video/leaderboard/text-to-video?models=all) | AA-Video-T2V v2.1 | 30 | 5 |
| [T2V Silent](https://artificialanalysis.ai/video/leaderboard/text-to-video?audio-output=false&models=all) | AA-Video-T2V-Silent v2.1 | 32 | 5 |
| [I2V Audio](https://artificialanalysis.ai/video/leaderboard/image-to-video?models=all) | AA-Video-I2V v1.1 | 24 | 3 |
| [I2V Silent](https://artificialanalysis.ai/video/leaderboard/image-to-video?audio-output=false&models=all) | AA-Video-I2V-Silent v1.0 | 82 | Absent |
| [Editing Audio](https://artificialanalysis.ai/video/leaderboard/video-editing?models=all) | AA-Video-Editing v1.1 | 9 | 2 |
| [Editing Silent](https://artificialanalysis.ai/video/leaderboard/video-editing?audio-output=false&models=all) | AA-Video-Editing-Silent v1.1 | 10 | 3 |

The current I2V Silent source contains only Seedance 2.0 720p at rank 6, Seedance 1.5 pro at rank 30, Seedance 1.0 at rank 42, and Seedance 1.0 Mini at rank 63. Both I2V pages explicitly announce a forthcoming AA-Video-I2V v2.1 with a new prompt set, 1080p silent videos, and more comprehensive model coverage. This supports keeping v1.0 Silent separate rather than adding an observation from another board. The document title initially says I2V v1.1 even on the Silent URL; the hydrated heading and checked No Audio radio establish the actual pool.

Current AA source drift identified during the targeted check:

- T2V Audio rank 3 and T2V Silent rank 1 now display **HeyGen Video 1**, priced at **$2.40/min**. The saved rows use **HeyGen Video (ultraquality)** and null prices. The ranks, displayed Elo, and samples of those inspected rows match the saved rows. Treat the name and price as a targeted review item; do not add a duplicate or infer identity from rank alone.
- I2V Audio currently shows **Coming soon** for HappyHorse-1.1 at rank 10 and HappyHorse-1.0 at rank 12, where the snapshot retains numeric quotes. MAGI-2 Preview at rank 11 also shows Coming soon and is already unpriced in the snapshot.
- Seedance 2.5 remains $34.12/min on the inspected T2V/I2V generation boards and $40.82/min on editing boards. These are source quotes under their own task conditions, not interchangeable prices.

No source changes were imported. AA pricing footnotes describe one minute of 1080p output at creator API default settings, with explicit row variants retained. Observation time is not a source publication date.

The official [Arena public dataset](https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset) was checked through its unauthenticated rows feed for the three video latest splits: [T2V](https://datasets-server.huggingface.co/rows?dataset=lmarena-ai%2Fleaderboard-dataset&config=text_to_video&split=latest&offset=0&length=100), [I2V](https://datasets-server.huggingface.co/rows?dataset=lmarena-ai%2Fleaderboard-dataset&config=image_to_video&split=latest&offset=0&length=100), and [editing](https://datasets-server.huggingface.co/rows?dataset=lmarena-ai%2Fleaderboard-dataset&config=video_edit&split=latest&offset=0&length=100). Each complete response had no truncated cells and shared revision `5acd3fc8c7f1693ba2f4d74103aca3159db58657`. The 48/48/10 overall rows, names, ranks, scores, bounds, and votes match the saved catalog. Source publication dates remain 2026-09-22 for T2V/I2V and 2026-08-27 for editing. A newer dataset revision does not imply newer video scores. Arena provides no generation prices or explicit audio policy in these rows.

MemeBench and world-model pool positions above are bundled-catalog evidence; those sources were not recaptured in this audit.

## Additional visibility losses

### Pool choice hides other leading observations

AA I2V Silent also lacks the exact I2V Audio variants MiniMax H3 (768p), FLUX 3 Max (720p), Gemini Omni Flash 1.1, MiniMax H3 Max, and FLUX 3. Their Audio ranks are 1, 2, 4, 6, and 8. Exact IDs share prefix `aa-video-i2v-v1-1-` and respective suffixes `minimax-h3-768p`, `flux-3-max-720p`, `gemini-omni-flash-1-1`, `minimax-h3-max`, and `flux-3`. Silent has differently named H3, Gemini Omni Flash, and Seedance 2.0 720p rows; these do not establish equivalent configurations. Utopai X at T2V Audio rank 2 and the saved HeyGen row at rank 3 are also absent from I2V Silent.

### Default selection omits available models

`src/data.ts:34` selects the first eight catalog entries, priced Pareto-frontier entries, and all points from up to four explicit measured configuration families. There is no recency criterion. AA I2V Silent defaults select ranks `1-8, 16, 17, 21, 23, 25, 27, 29, 55, 58, 67`, comprising 18 points in 14 model groups.

Examples of available but unchecked I2V Silent observations:

| Rank | Model | Observation ID suffix after `aa-video-i2v-silent-v1-0-` |
| ---: | --- | --- |
| 9 | grok-imagine-video | `grok-imagine-video` |
| 10 | HappyHorse-1.1 | `happyhorse-1-1` |
| 11 | Kling 2.5 Turbo 1080p | `kling-2-5-turbo-1080p` |
| 12 | HappyHorse-1.0 | `happyhorse-1-0` |
| 13 | Vidu Q3 Pro | `vidu-q3-pro` |
| 22 | Wan 2.7 | `wan-2-7` |
| 26 | Runway Gen-4.5 (720p) | `runway-gen-4-5-720p` |
| 28 | Veo 3.1 Fast | `veo-3-1-fast` |
| 30 | Seedance 1.5 pro | `seedance-1-5-pro` |
| 32 | Veo 3.1 | `veo-3-1` |
| 40 | Veo 3.1 Lite | `veo-3-1-lite` |

Veo 3.1 Lite has no source price, so selecting it still cannot produce a cost-chart point. Quality and table views can show it.

The recommended T2V Audio default still needs selection clarity: its current rule omits Seedance 2.0 at rank 9 (`aa-video-t2v-v2-1-dreamina-seedance-2-0`), Gemini Omni Flash 1.1 at rank 10 (`aa-video-t2v-v2-1-gemini-omni-flash-1-1`), and Grok Imagine Video 1.5 at rank 12 (`aa-video-t2v-v2-1-grok-imagine-video-1-5`). It adds frontier entry Agnes-Video-2.5 at rank 11. I2V Audio selects only ranks 1-8 and omits Grok Imagine Video 1.5 at rank 9, Veo 3.1 at rank 14, and Kling 3.0 Pro at rank 19.

### Search and navigation obscure availability

Live browser reproductions:

1. Opening the site from its base URL shows AA images. Clicking Video opens `aa-video-i2v-silent-v1-0`. Searching **Seedance 2.5** returns **No matching models**.
2. Search only examines the active pool and filters sidebar rows (`src/App.tsx:156`). It does not select matching models or filter chart data. It never offers matching observations in other pools.
3. In Arena I2V, **Seedance 2.5** also returns no matches even though rank 4 is selected and present. **seedance** finds `dreamina-seedance-2.5-720p`. The literal substring search does not normalize spaces, hyphens, or joined names such as Seedance2.5.
4. AA I2V Silent -> Arena -> Artificial Analysis lands on **AA I2V Audio**. Task family is preserved, but the prior silent condition is lost because Arena is unspecified and Audio is first (`src/App.tsx:165`). The quality view forced by Arena also remains selected on return.
5. Clicking the already-active Video tab from another AA video pool resets to I2V Silent. No per-media last-used pool is retained.
6. **All data** and **Explore all data** retain the selected subset. Arena I2V displayed eight table rows from a 48-row pool. These labels overstate what the view exposes (`src/App.tsx:266`, `src/App.tsx:280`).

### Mobile labels can hide model versions or entire names

At 1280x800, default I2V Silent displayed all 18 points and all 14 group labels. At 320x568, the stable chart viewBox was `0 0 290 241`: all 18 points remained, but only six right-side labels were rendered. Four belonged to Kling configuration families and two to Gemini Omni Flash and Bach 1.0 Pro. Wan 3.0, H3, Seedance 2.0, PixVerse V6, and Grok 1.5 remained plotted without names.

`src/Charts.tsx:58` gives multi-point families label priority before score and caps label count by chart height. This is a label omission, not an observation or selection omission.

On T2V Silent at 320x568, both **Dreamina Seedance 2.5** and **Dreamina Seedance 2.0** rendered as the identical **Dreamina Seedance…**. Their full accessibility names were intact. `src/Charts.tsx:94` truncates compact names before their distinguishing version suffix. Document bounds remained 320x568 with no horizontal overflow.

## Recommended changes for the implementation owner

1. Set `aa-video-t2v-v2-1` as the first-visit Video default. Remember the last chosen board per media and source. Clicking the active media tab should preserve its board. Honor explicit `?board=` URLs.
2. Preserve remembered task/audio choices when returning to a source. For a new source, prefer an exact compatible task/audio pool; when only an unspecified-audio or different-task pool exists, expose that change explicitly. Never relabel an Arena overall pool as Audio or Silent. Do not fall back to the first board silently for unrelated world-model or editing tasks.
3. Add catalog-wide discovery alongside current-pool matches. Show result counts and source/task/audio badges, including **Not in this pool; available in...** with an explicit navigation action. Selecting a result should open its actual pool and select/focus that observation. Normalize separators and provide aliases so Seedance 2.5, seedance-2.5, and Seedance2.5 find the same model-version text. Preserve dots and version distinctions.
4. Keep an explicit count such as **9 selected / 30 available**. A reasonable broader initial selection is the first 12 ranked observations plus frontier entries and complete documented configuration families; this includes Seedance 2.0, Gemini Omni Flash 1.1, and Grok 1.5 in the proposed T2V Audio default. Selection breadth is a product choice, not a freshness guarantee. Retain unavailable-price notices and a full-pool table path. Rename the current filtered table to **Selected data**, or make **All data** actually show the pool independently of chart selection.
5. Preserve version and configuration suffixes in compact labels, for example **Seedance 2.5** and **Seedance 2.0**, with full names in accessible text and details. Rank primary labels by source rank or score before optional curve labels, while retaining setting markers and complete measured curves. Always label a searched or focused result even when the normal label budget is full.
6. Review the specific HeyGen and HappyHorse source changes separately before updating any snapshot. A visibility fix does not require a full refresh, new scores, cross-pool price joins, or changes to benchmark definitions.

Focused acceptance checks: base site -> Video opens T2V Audio; all nine Seedance 2.5 observations are discoverable with their own pool badges; spaced and hyphenated searches work in Arena; Silent -> Arena -> AA restores the previous Silent choice; active-media clicks preserve the task; full-pool table access exposes the stated row count; both Seedance versions remain distinguishable at 320x568; unpriced observations remain excluded from cost plots.

## Implementation follow-up

The visibility and readability fixes were implemented on October 23, 2026. No benchmark observations or prices were changed. New Video visits open AA Text to Video Audio with Seedance 2.5 selected. The initial selection includes the leading 12 observations, frontier entries, and complete measured families. Media and source/task choices are remembered within the session.

Catalog-wide search normalizes separators and labels every result with its own source and task. Opening a result selects that observation in its original pool; an unpriced result opens the quality ranking. All data initially selects the full pool. Chart captions report shown and available observations, and cost views link to quality rankings for unpriced models.

Chart model labels use 15px on desktop and 12px in compact layouts. Measured configuration curves use 3px strokes, larger points, and stronger label connectors. Short chart names preserve Seedance version numbers. The source/task selector remains visible above the chart on mobile.

Browser checks covered 1280x800, 940x800, 390x844, and 320x568. They confirmed nine Seedance 2.5 search results across distinct pools, exact-result selection, full-pool table access, remembered Audio and Silent choices after source changes, active-media preservation, readable compact labels, and viewport bounds. The 940px font rule and remembered-audio precedence were corrected after independent review.
