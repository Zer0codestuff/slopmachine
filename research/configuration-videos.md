# Video configuration series research

Checked on October 23, 2026. This is a proposal for exact existing observations in `videos.json`, not a catalog refresh. `configuration-videos.json` contains entry IDs, native tier labels, ordering, copied observations, evidence URLs, and separate price-only quotes. No new same-pool quality measurements were found.

## Usable measured families

Every row below is a two-point series inside one source, task, benchmark version, and audio condition. Costs are the saved source quotes in USD per output second. A higher mode has a higher point estimate here, but all paired intervals overlap.

| Pool | Family | Lower setting: Elo, cost/s | Higher setting: Elo, cost/s | Use |
| --- | --- | --- | --- | --- |
| AA I2V-Silent v1.0 | Kling 2.1 | Standard 720p: 1174, $0.056 | Pro 1080p: 1185, $0.098 | Dated measured series |
| AA I2V-Silent v1.0 | Kling 2.6, January | Standard 720p: 1265, $0.042 | Pro 1080p: 1266, $0.070 | Dated measured series |
| AA I2V-Silent v1.0 | Kling 3.0 | Standard 720p: 1270, $0.168 | Pro 1080p: 1277, $0.224 | Review price drift first |
| AA I2V-Silent v1.0 | Kling 3.0 Omni | Standard 720p: 1271, $0.168 | Pro 1080p: 1280, $0.224 | Review price drift first |
| MemeBench, silent | Kling 3.0 | Standard 720p: 1327, $0.0882 | Pro 1080p: 1330, $0.1176 | Dated measured series |

AA observations are dated October 22, 2026 at 18:40:31.947 UTC. MemeBench observations are also from October 22; its pricing check is September 1, separately from score observation time. Exact timestamps, intervals, sample counts, and source price notes remain in JSON. Sources: [AA exact pool](https://artificialanalysis.ai/video/leaderboard/image-to-video?audio-output=false&models=all), [MemeBench exact pool](https://video-arena.com/memebench/leaderboard).

Kling documents Standard and Professional through one `mode` parameter, with coupled resolution and inference-quality behavior. Therefore these series use `dimension: "mode"`, rather than claiming a pure resolution-only experiment. [Kling 2.1 release](https://kling.ai/release-note/release-notes/2025052696) and [API update history](https://kling.ai/document-api/apiReference/updateNotice?date=2026-02-11) distinguish `kling-v2-1` Standard/Pro from the separate Master model. The [I2V legacy reference](https://kling.ai/document-api/api/video/3-0-omni/image-to-video/legacy) establishes the 2.6 and 3.0 mode control; [Omni's reference](https://kling.ai/document-api/api/video/3-0-omni/video-omni/legacy) establishes its independent mode control. Base and Omni remain separate series. January and December versions remain separate identities.

Full benchmark generation requests are not public. These are descriptive links between explicitly named settings, not a claim that hidden seeds, clip durations, or every inference setting were experimentally controlled. Native `standard` and `pro` values are the JSON `level` identifiers; no artificial middle, max, or reasoning-effort tier is assigned. Pro is not the highest resolution supported by current Kling APIs.

## Pricing discrepancy that needs review

Today's rendered AA silent I2V table retains the same scores, intervals, and sample counts, but changes both Kling 3.0 Pro quotes from $13.44/min to $6.72/min, equivalent to $0.224/s and $0.112/s. Both Standard rows still show $10.08/min, or $0.168/s. This reverses their apparent current AA cost ordering. The [creator's current silent list](https://kling.ai/document-api/pricing/base/video) is $0.084/s at 720p and $0.112/s at 1080p for both 3.0 and 3.0 Omni without reference-video input.

The cause of this source discrepancy is unknown. The two AA families remain in `series` for the dated snapshot, with `recommendedForDefault: false` and explicit price-review notes. `observationUpdates` records both current Pro rows in full for review. It does not replace the saved catalog or inject creator prices into benchmark observations. Do not refresh only one endpoint and then imply Standard is cheaper. The general AA footnote says 1080p creator API defaults even when a model label explicitly says 720p; retain both the label and footnote.

MemeBench quotes are separate: its tooltip uses 720p with an actual 1080p exception for Kling Pro, optional audio off, and a fixed displayed USD conversion of official CNY point charges. Its $0.0882/$0.1176 pair must not be silently replaced by creator USD prices. It evaluates specialized short Chinese meme clips in silent playback, with wide intervals and a self-selected audience. [MemeBench methodology](https://video-arena.com/blog/memebench).

## Hailuo 02 remains qualified

The AA pair is real: Standard scores 1246 at $2.80/min and Pro scores 1249 at $4.90/min, with overlapping 95% intervals. Both row tooltips specify prompt enhancement. However, the exact AA resolution and clip duration are not disclosed.

[MiniMax's I2V API](https://platform.minimax.io/docs/api-reference/video-generation-i2v) exposes one `MiniMax-Hailuo-02` model ID with `resolution` and `duration`. A fixed 6-second request supports 512P, 768P, and 1080P. [Hosting documentation](https://replicate.com/minimax/hailuo-02/readme) maps Standard to 768p and Pro to 1080p, while [Standard's schema](https://fal.ai/models/fal-ai/minimax/hailuo-02/standard/image-to-video/api) also supports 512P. Thus Standard alone does not prove resolution. Matching creator prices corroborate a 6-second 768P/1080P interpretation, but cannot prove the evaluated configuration. The pair is in `qualifiedCandidates`, with resolution null and connection disabled by default.

## Price-only configuration coverage

These current first-party quotes have no matched same-pool measurement for every setting. They are recorded in `priceOnlyEvidence` with `score: null`, never as extra measured points.

| Creator route and condition | Lower setting | Higher settings |
| --- | --- | --- |
| Kling 3.0, silent | 720p $0.084/s | 1080p $0.112/s; 4K $0.42/s |
| Kling 3.0, native audio | 720p $0.126/s | 1080p $0.168/s; 4K $0.42/s |
| Kling 3.0 Omni, no video reference, silent | 720p $0.084/s | 1080p $0.112/s; 4K $0.42/s |
| Kling 3.0 Omni, no video reference, native audio | 720p $0.112/s | 1080p $0.14/s; 4K $0.42/s |
| Kling 2.6, silent | 720p $0.042/s | 1080p $0.070/s |
| Hailuo 02, fixed 6s | 512P $0.10/clip | 768P $0.28/clip; 1080P $0.49/clip |
| Hailuo 02, fixed 10s | 512P $0.15/clip | 768P $0.56/clip; no 1080P |
| MiniMax H3, output only | 768P $0.08/s | 2K $0.13/s |
| MiniMax H3 Max, direct creator output only | 480P $0.05/s | 768P $0.08/s |

Sources: [Kling Cash price table](https://kling.ai/document-api/pricing/base/video), [MiniMax pricing](https://platform.minimax.io/docs/pricing/overview). Hailuo clip pricing is duration-dependent: the 768P 10-second rate is $0.056/s versus approximately $0.046667/s for 6 seconds. MiniMax H3 and H3 Max input media may add charges, listed in JSON. H3 Max's direct creator route does not establish equivalence to the saved Fal-hosted observation. Do not merge H3 and H3 Max.

## Exclusions and integration limits

- Arena Veo 3.1 and Fast each have audio and audio-1080p identifiers, but neither the [dataset schema](https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset/blob/main/README.md#schema) nor [Arena changelog](https://arena.ai/company/leaderboard-changelog) identifies the unsuffixed resolution. Do not assume 720p from Google's defaults. Arena also has no generation prices.
- Arena Hailuo Standard/Pro lacks exact request configurations and prices. Do not attach AA or creator costs to these observations.
- Master, Fast, Turbo, Lite, Max, base versus Omni, dated releases, and separate engines are not automatic quality levels. No proposed series relies on fuzzy family matching.
- Design Arena evidence has no usable matched video setting pair with disclosed conditions. World Model Arena has specialized first-person tasks and no prices.
- No measured 4K, Hailuo 512P, H3 2K counterpart, or honest three-point video series was found. Do not extrapolate or copy a score to an unmeasured setting.
- Render only consecutive observed points from the explicit series list. Keep confidence bounds, native setting labels, cost quantity, observation date, source, and pricing qualifications attached to tooltips and exports. Lines must not imply continuous interpolation or significance.

## Evidence and verification

Existing capture evidence was reused. Fresh public-page checks used independent T3 browser tabs and no login, API key, or generation. Captures are ignored `research/evidence/quality-videos*.json`. The exact existing observations are copied into the proposal to make integration review straightforward.

Rebuild the proposal from saved evidence with `/usr/bin/python3 research/evidence/quality-videos-build.py`. The script verifies exact board/entry references, copied values, ordering, required evidence files, priced accepted points, and unchanged `videos.json` bytes. It writes only `research/configuration-videos.json`. Scope is limited to this report, that proposal, and ignored `quality-videos*` evidence. `AGENTS.md`, UI, schema, current research inputs, and Git were not edited.

## Integrated catalog follow-up

The root integration subsequently recollected the entire 82-row AA I2V Silent v1.0 pool, rather than replacing individual endpoints. All score, rank, interval and sample values were unchanged. Both Pro quotes are now $0.112/s, Standard remains $0.168/s, and Veo 3.1 Lite has no quoted API price. The five measured video families can now be connected using their own current source quotes, with the creator-price discrepancy attached. Evidence is `research/evidence/quality-root-aa-i2v-full.json`; its reviewed value diff is `quality-root-aa-i2v-changes.json`. Provider prices remain separate.
