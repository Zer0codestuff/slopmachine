# Video benchmark research

`videos.json` matches the exact `Catalog`, `Leaderboard`, and `Model` shapes in `src/types.ts`. It contains 13 independent pools, 345 model observations, and 184 published prices. A model appearing in several pools is several observations, not several unique models.

## Included snapshots

| Source and task | Rows | Priced | Source publication | Observed at, UTC |
| --- | ---: | ---: | --- | --- |
| AA T2V v2.1, audio | 30 | 27 | Not published | 2026-10-22 18:41:34.997 |
| AA T2V-Silent v2.1 | 32 | 30 | Not published | 2026-10-22 18:39:39.851 |
| AA I2V v1.1, audio | 24 | 23 | Not published | 2026-10-22 18:41:13.183 |
| AA I2V-Silent v1.0 | 82 | 69 | Not published | 2026-10-22 18:40:31.947 |
| AA Editing v1.1, audio | 9 | 9 | Not published | 2026-10-22 23:06:34.696 |
| AA Editing-Silent v1.1 | 10 | 10 | Not published | 2026-10-22 23:06:54.625 |
| Arena T2V, overall | 48 | 0 | 2026-09-22 | 2026-10-22 18:40:07.721084 |
| Arena I2V, overall | 48 | 0 | 2026-09-22 | 2026-10-22 18:40:07.623339 |
| Arena editing, overall | 10 | 0 | 2026-08-27 | 2026-10-22 18:40:07.723242 |
| World Model Arena, visual quality | 12 | 0 | Not published | 2026-10-22 23:12:15.915 |
| World Model Arena, action dynamics | 12 | 0 | Not published | 2026-10-22 23:12:28.897 |
| World Model Arena, world memory | 12 | 0 | Not published | 2026-10-22 23:12:41.945 |
| MemeBench, image and prompt, silent | 16 | 16 | Not published | 2026-10-22 23:12:28.549 |

Exact zoned timestamps remain in JSON. `generatedAt` records normalization time. Unknown publication dates are null, never observation dates, model release months, methodology dates, repository modification dates, or price-check dates.

## Artificial Analysis

The four existing [text-to-video](https://artificialanalysis.ai/video/leaderboard/text-to-video?models=all) and [image-to-video](https://artificialanalysis.ai/video/leaderboard/image-to-video?models=all) captures were reused, not downloaded again. Their silent variants are distinct benchmarks. The new [editing audio](https://artificialanalysis.ai/video/leaderboard/video-editing?models=all) and [editing silent](https://artificialanalysis.ai/video/leaderboard/video-editing?audio-output=false&models=all) tables were scraped from their public rendered browser DOM without an API key. Evidence: `evidence/videos-aa-*-browser.json`.

The [public methodology](https://artificialanalysis.ai/methodology/video) names six separate Elo pools. Audio boards evaluate synchronized audio and video; silent boards evaluate video without audio. Their benchmark versions are retained in IDs and task names. Elo comes from a Bradley-Terry fit to blind human preferences. Source score intervals are explicitly 95%. The fixed 1000 anchor in each board has no estimated interval, so both bounds remain null. `votes` holds the column labeled `Samples`, not unique raters. Confidence intervals assume independent votes; evaluator or prompt correlation can make them narrow. Editing can have partial prompt coverage when models decline clips or edits. Relevant methodology excerpts were captured in `evidence/videos-aa-methodology-browser.json`.

Numeric row prices are USD per minute divided by exactly 60, with `priceUnit: "second"`. Every `priceNote` retains the original displayed price, exact model/configuration label, and the source footnote: one minute of 1080p video at the creator API's default settings. Some row names explicitly say 720p or 768p; those exceptions are preserved instead of being relabeled. Different task/audio prices for the same named model are retained independently. `Coming soon` and `No API available` become null prices with the original reason. The old 401 API-test evidence is historical only; no authenticated API was used in this continuation.

Provider strings come from source logo labels after removing the word `logo`. Repository badges such as Hugging Face and GitHub are excluded. A Fal badge is preserved as Fal; model creator identity is not inferred. Source-provided repository links become `modelUrl`; otherwise it stays null. The `Released` column is a model release month, and the undated `Updated` badge is not a publication date.

## Arena

The official [Arena leaderboard dataset](https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset) provides complete captured `latest` rows for `text_to_video`, `image_to_video`, and `video_edit`, all category `overall`. Existing Parquet and JSON evidence were reused. All 106 raw identifiers, organization values, point ranks, full-precision scores, confidence bounds, and battle counts are retained. Empty organizations are represented by the explicit missing-data label `Not disclosed`; six observations have this label. Source organization distinctions such as `wan`, `alibaba`, and `aorizon` remain intact.

`sourceUpdatedAt` uses each row's exact `leaderboard_publish_date`. The captured repository revision is `9041150e8a502da9f0e75c89824d34ad7dba7072`; its `lastModified` timestamp of 2026-10-21 is not a video publication date. The [source schema and methodology notes](https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset/blob/main/README.md) call the metric Arena Score and identify Bradley-Terry. Their bound fields do not themselves state a confidence level, so the normalization adds no such claim.

The captured public web extract displays a different date convention in some places. It is supporting context, not a replacement for dated dataset rows. Direct Arena browser navigation still encounters Cloudflare. No authenticated responses were captured. The dataset exposes no audio-condition field, price, or model URL. Its overall pool remains separate and is not divided by audio tokens in model names. All price fields remain null. There is no cross-source price join.

## Additional usable arenas

[World Model Arena](https://www.warena.ai/leaderboard/elo) was scraped through its public rendered table after selecting each of Visual Quality, Action Dynamics, and World Memory. Each capture contains 12 source-ranked models with explicit provider names, integer Elo, and battle counts. [Its methodology](https://www.warena.ai/about) limits the task to offline first-person world-model videos with the same input image, trajectory, and dimension. These are specialized video tasks, not general creative T2V. Each dimension has independent adaptive-K Elo, starting at 1500. Only random-pick battles affect ratings. Hard-to-choose outcomes leave ratings unchanged. `votes` retains the table's decided `Battles`, which match wins plus losses. Medal ranks map to 1, 2, and 3. The source publishes no confidence intervals, audio policy, publication date, prices, or model links in these tables. Those fields remain null. The source's overall aggregate was not imported because its aggregation is not explained on the inspected methodology page. Evidence: `evidence/videos-world-*-browser.json`.

[MemeBench](https://video-arena.com/memebench/leaderboard) provides 16 source-ranked image-and-motion-prompt video models. [Its methodology](https://video-arena.com/blog/memebench) describes silent playback, short Chinese internet meme scenarios, regularized Bradley-Terry with a 1200-Elo prior, and approximate 95% intervals. Ties and Both bad each contribute 0.5. The self-selected anonymous audience, sparse model-by-prompt coverage, repeated sessions, non-clustered intervals, and unadjusted serving weights limit generalization. Source display names and exact model IDs are retained together. No current dataset revision or dated score publication is shown, so none is invented.

MemeBench's own pricing tooltip publishes USD per output second, retained directly without dividing by 60 again. The 2026-09-01 price check is preserved in notes, separately from scores observed on 2026-10-22. Pricing uses first-party 720p tiers with explicit Kling Pro 1080p and MiniMax 768P exceptions; optional audio is off, while inseparable native audio can remain in API costs. Fixed input fees are excluded, including an additional $0.01 Grok input-image fee. Ray 3.2 uses the 5-second benchmark equivalent because the 10-second tier is non-linear. These prices describe a different configuration from AA's prices. Exact tooltip evidence is in `evidence/videos-memebench-pricing-browser.json`; numeric rows are in `evidence/videos-memebench-browser.json`. The methodology's August publication/update dates are not used as score dates.

## Other coverage checked

- [VBench's official public leaderboard](https://huggingface.co/spaces/Vchitect/VBench_Leaderboard) loads and exposes VBench 1.0, 2.0, I2V, long-video, and trustworthiness tabs. These are multidimensional automated benchmark scores with sampling and evaluator certification metadata, not the same human preference pools. The inspected VBench 1.0 view was filtered to evaluations by the VBench team. Its visible rows include identical full metric vectors for LTX-2 and HiDream-O1, and an LTX-2 accessibility link leading to a Wan API. These unresolved source inconsistencies prevent importing it as a robust dataset here. Hidden panels were not treated as complete captures. DOM audit evidence: `evidence/videos-vbench-browser-audit.json`.
- [TIGER-Lab GenAI-Arena](https://huggingface.co/spaces/TIGER-Lab/GenAI-Arena) currently reports `Build error` and `Job failed with exit code: 1`. No current rendered leaderboard was available. Status evidence: `evidence/videos-genai-arena-browser-status.json`.
- [VideoArena.tv](https://www.videoarena.tv/leaderboard) appeared in public source discovery, but two collaborative-browser navigation attempts timed out, first at 15000 ms and then at 30000 ms. Search-index rows were not promoted into a browser-captured dataset. This is a different site from MemeBench's video-arena.com.

No latency, environmental estimates, fabricated prices, combined scores, or historical trends were added. Missing prices are unavailable and must be excluded from cost charts. Close ranks are not proof of statistically different model quality.

## Reproduce and verify

The first command below requires the original local evidence captures, which are retained in the ignored `research/evidence/` directory. A fresh clone can validate the included normalized snapshot directly with the second command. Public-source acquisition is documented in `docs/DATA.md`.

```sh
/usr/bin/python3 research/evidence/videos-normalize.py
node scripts/validate-data.mjs research/videos.json
```

The normalizer reads saved evidence only and makes no network requests. Validation passes for 13 leaderboards, 345 observations, and 184 prices. The initial AA/Arena metadata audit also independently confirmed counts, raw variants, dates, anchors, and missing-price handling. This research task changed only `research/videos.json`, this report, and `research/evidence/videos*`; root `AGENTS.md`, UI, packages, and Git were not edited.
