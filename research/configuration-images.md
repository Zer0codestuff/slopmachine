# Image configuration research

Observed 2026-10-23. Research proposal only. No paid generation, API keys, catalog rebuild, UI/schema changes, or publication. The companion `configuration-images.json` contains exact points, existing observation references, source pool IDs, timestamps, CI endpoints, battles, prices, visibility, and evidence URLs. Unavailable values remain null.

## Findings and recommendation

Five source-level configuration series are supported, with 16 measured points. Two series have five levels. Four observations are new to the saved image catalog: Design Arena P-Image-Ideogram Low/Medium, and Ideogram 4.5 Very Low/High in a separate image-editing pool. No immutable checkpoint is pinned by these leaderboards. These are source-named model/product configuration series, with the identity and cost limits below.

Start with AA's five-level P-Image-Ideogram series and Ideogram 4.0 Default/Quality. Keep Ideogram 4.0 Fast as its own checkpoint and series. Add Design Arena's five-level P-Image series only with explicit treatment of its two public-response-only, unranked points. Its Ideogram 4.5 editing pair is useful separately. Preserve measured non-monotonic scores and connect in setting order; a segment does not establish performance at unmeasured settings.

| Source and task | Exact model/product | Setting order | Measured Elo, in setting order | Source USD/image, same order |
| --- | --- | --- | --- | --- |
| AA T2I v2.1 | P-Image-Ideogram | Very low, Low, Medium, High, Very high | 909, 959, 972, 995, 992 | 0.003, 0.0075, 0.010, 0.015, 0.033 |
| AA T2I v2.1 | Ideogram 4.0 | Default, Quality | 1002, 1026 | 0.06, 0.10 |
| AA T2I v2.1 | Ideogram 4.0 Fast | Balanced default, Quality | 963, 982 | 0.0105, 0.0175 |
| Design Arena generation | P-Image-Ideogram | Very low, Low, Medium, High, Very high | 1140, 1164, 1153, 1178, 1170 | 0.003, 0.0075, 0.010, 0.015, 0.033 |
| Design Arena editing | Ideogram 4.5 | Very low, High | 1187, 1240 | 0.008, 0.22 |

[AA generation](https://artificialanalysis.ai/image/leaderboard/text-to-image), [Design Arena generation](https://www.designarena.ai/leaderboard?tab=image), and [Design Arena editing](https://www.designarena.ai/leaderboard/image-to-image) are independent pools. Their Elo values cannot be joined or compared numerically across rows of this table.

Pruna and Ideogram confirm that P-Image-Ideogram has five settings of one named product. Native Ideogram 4.0 exposes `rendering_speed=turbo|default|quality`. AA's unlabeled Ideogram rows are interpreted using its published default-settings policy, rather than renamed Low. Fast exposes `BALANCED|QUALITY` within its own endpoint. Its model card establishes a distinct CFG-distilled, FP4-targeted checkpoint, so native 4.0, Fast, and Instant must remain separate. [Pruna modes](https://docs.pruna.ai/en/stable/docs_pruna_endpoints/performance_models/p-image-ideogram.html), [native 4.0 settings](https://developer.ideogram.ai/api-reference/images/generate/ideogram-4), [Fast settings](https://fal.ai/models/ideogram/v4/fast/api), [Fast provenance](https://huggingface.co/fal/ideogram-v4-fast), [Instant provenance](https://huggingface.co/fal/ideogram-v4-instant).

## New observations and visibility

The Design Arena public response contains 86 generation rows; the expanded browser table renders 83. Low and Medium below are scored response rows, not published table ranks. They must retain null rank and explicit unranked visibility. The new editing pool has 52 response rows and 51 rendered rows. The two Ideogram points are rendered and ranked.

| Pool and source model ID | Exact source label | Elo | Battles | Source rank | Source standard error |
| --- | --- | --- | --- | --- | --- |
| Generation, `fennel` | p-image-ideogram (low) | 1164 | 3183 | null | null |
| Generation, `juniper` | p-image-ideogram (medium) | 1153 | 3354 | null | null |
| Editing, `ladybug` | Ideogram 4.5 (Very Low) | 1187 | 9395 | 26 | 3.7283 |
| Editing, `dragonfly` | Ideogram 4.5 (High) | 1240 | 12765 | 18 | 3.2937 |

Generation source update: `2026-10-23T06:07:15.307587+00:00`. Editing source update: `2026-10-23T06:16:14.051352+00:00`. Acquisition is recorded separately in JSON. The public read requests use `arenaType=models`, `variationName=public`, and category `image` or `imagetoimage`; their exact bodies and responses are retained in ignored evidence. No authenticated response was collected.

Design Arena supplies no explicit Elo CI endpoints or confidence level. Keep both bounds null. Its percentage margin concerns win rate, and `btStdErr` is a standard error, not a published 95% Elo interval. Adding the two unranked points to the existing catalog requires an explicit representation for unavailable rank; never invent rank by sorting Elo.

## GPT Image: measured settings and unscored prices

No same-pool GPT Image 2 or 2.5 quality series was found. AA has GPT Image 2 High and each 2.5 model at Max. Arena has GPT Image 2 Medium. Design Arena's GPT rows do not specify quality. GPT Image 1 Mini Medium is already measured separately in AA generation and editing, but has no second quality level there. Never join these sources or copy their scores to unmeasured Low/Medium points. Sunburst and Flare are distinct models.

OpenAI supports Low/Medium/High on GPT Image 2 and earlier models; each 2.5 model additionally supports Xhigh and Max. The following Standard prices describe image output only, with no attached benchmark score.

| Model | Low at 1024 square | Medium at 1024 square | High at 1024 square | Xhigh | Max |
| --- | --- | --- | --- | --- | --- |
| GPT Image 2 | 0.00588 estimate | 0.05268 estimate | 0.21072 estimate | unsupported | unsupported |
| GPT Image 2.5 Sunburst | 0.00588 estimate | 0.01317 estimate | 0.05268 estimate | 0.09366 estimate | 0.21072 estimate |
| GPT Image 2.5 Flare | 0.00588 estimate | 0.01317 estimate | 0.05268 estimate | 0.09366 estimate | 0.21072 estimate |
| GPT Image 1 | 0.011 | 0.042 | 0.167 | unsupported | unsupported |
| GPT Image 1.5 | 0.009 | 0.034 | 0.133 | unsupported | unsupported |
| GPT Image 1 Mini | 0.005 | 0.011 | 0.036 | unsupported | unsupported |

GPT Image 2/2.5 estimates were verified in the official interactive calculator, including its displayed output-token counts. It groups the two 2.5 models, while the guide cautions that actual token use can differ. These are not fixed request quotes. Across the documented 1024-square, 1536-by-1024, inverse rectangle, and 2048-square calculator examples, Low ranges from $0.00474 to $0.01191 for both generations. Medium ranges from $0.04116 to $0.10704 for Image 2, and $0.01029 to $0.02676 for each 2.5 model. These are size-dependent estimates, not uncertainty ranges or price guarantees. [Official guide and calculator](https://developers.openai.com/api/docs/guides/image-generation#cost-and-latency).

Legacy Low/Medium output prices across square and either documented rectangle are: Image 1, $0.011-0.016 / $0.042-0.063; Image 1.5, $0.009-0.013 / $0.034-0.050; Mini, $0.005-0.006 / $0.011-0.015. Prompt tokens, reference-image tokens, Responses mainline-model usage and streaming partial images are additional where applicable. Auto has no fixed estimate. [Image 1](https://developers.openai.com/api/docs/models/gpt-image-1), [Image 1.5](https://developers.openai.com/api/docs/models/gpt-image-1.5), [Mini](https://developers.openai.com/api/docs/models/gpt-image-1-mini), [billing](https://developers.openai.com/api/docs/pricing).

## Grok: current controls and historical Low evidence

Image 2.0 supports Low, Medium and Auto, with no documented High setting. Low output costs $0.04/$0.05/$0.06 at the provider's 1K/1.5K/2K tiers; Medium costs $0.06/$0.07/$0.08. Each reference image adds $0.01. Pricing lists 1.5K while the generation guide documents `1k` and `2k` request values, so no 1.5K parameter is inferred. [Model pricing](https://docs.x.ai/developers/models/grok-imagine-image-2.0).

Design Arena generation has Auto 1289, 9077 battles, $0.04 source quote, and Medium 1308, 8303 battles, $0.06 source quote. Keep this pair conditional. Current Auto behavior chooses Low for generation and Medium for editing, but does not prove the benchmark's historical settings. Preserve Auto and do not relabel it Low. The editing Auto/Medium rows are especially unsuitable as proof of different compute budgets. [Settings](https://docs.x.ai/developers/model-capabilities/images/generation).

The complete official Arena history contains nine explicitly labeled `grok-imagine-image-2.0 (low)` observations: four generation dates and five editing dates. Latest generation Low: 1300.7641718910454, bounds [1293.0373559084, 1308.4909878736905], 7257 battles, 2026-09-24. Latest editing Low: 1426.942050556493, bounds [1421.5312714276138, 1432.3528296853724], 36022 battles, 2026-09-30. All nine exact rows are in JSON with date-specific pool IDs, null prices, and no connection. Neither Canvas nor dated model names establish a matching Medium setting. [Official Arena dataset](https://huggingface.co/datasets/lmarena-ai/leaderboard-dataset).

The original `grok-imagine-image`, Quality and Pro alias must not become Low/Medium/High labels. The Quality model and Pro alias redirect to Image 2.0 Low only from 2026-11-02. Preserve their original identities and prices before that date. [Migration notice](https://docs.x.ai/developers/migration/imagine-image-quality-nov-2).

## Ideogram pricing and cost-matching limits

Native 4.0 Turbo/Default/Quality are $0.03/$0.06/$0.10 per image. P-Image-Ideogram's 1K/2K Low prices are $0.0075/$0.015 and Medium $0.01/$0.02; those levels are measured in AA and now recovered in Design Arena. Pruna's page contradicts itself on defaults and enum spelling, so retain explicit level mappings rather than fill evaluation defaults. [Native 4.0 rates](https://ideogram.ai/models/4.0/), [Pruna rates](https://docs.pruna.ai/en/stable/docs_pruna_endpoints/performance_models/p-image-ideogram.html).

Native 4.5 Low and Medium cost $0.03/$0.06 for prompt-only generation or generation with references. High is $0.10 without references and $0.22 with references or Precise Edit; Very Low $0.008 requires a source image. No Low/Medium score was found in the inspected 4.5 editing pool. The product page says price is independent of resolution, while its API reference describes 1K/2K billing tiers without tier rates. Preserve that inconsistency and unpublished evaluation settings. [4.5 prices](https://ideogram.ai/models/4.5/), [4.5 API settings](https://developer.ideogram.ai/api-reference/images/generate/ideogram-4-5).

AA's methodology generates at each model's highest supported resolution and downscales for presentation, while leaderboard prices are representative 1024-square quotes. Therefore matching a source quality label and price does not establish actual evaluation spend. Design Arena omits evaluated resolution, checkpoint and endpoint. Keep source quotes attached to those qualifications and do not replace them with a cheaper current provider rate. [AA methodology](https://artificialanalysis.ai/methodology/image).

## Coverage and rejected joins

AA's live All models views exposed 106 generation and 76 editing rows on v2.1. They exposed no Include unranked or benchmark-version selector. An unranked query probe did not add rows. Search-indexed older pages showed controls and different scores, but live navigation returned v2.1; no v1/v2.0 values were imported.

Arena revision `5acd3fc8c7f1693ba2f4d74103aca3159db58657` was inspected completely: 20387 historical generation rows across 117 overall publication dates, and 2786 editing rows across 74 overall dates. Latest splits have 680/105 total rows and 82/60 overall rows. All four Parquet hashes matched official metadata. Target model names were checked across every category. There is no verified multi-setting series for the requested versions in those Arena splits.

Do not connect FLUX dev/pro/max, Turbo/Flash or 4B/9B by family name. Do not interpret Krea 2 Medium as a quality level or connect Krea Fast/Ultra without exact identity evidence. Gemini resolution and Seedream high-resolution labels remain held until the evaluated default size, checkpoint and other settings are established. Luma Max, Imagen Ultra/Fast, Ideogram versions, and OpenAI generations remain distinct.

Ignored evidence is under `research/evidence/quality-images*`, including the AA captures, rendered OpenAI calculator outputs, complete Arena reports/data, and Design Arena reports/public responses. The proposal contains 101 pricing-only configuration records, all with null scores, plus nine unconnected historical Grok Low rows. No project-root instruction update was made because this delegated scope explicitly excludes it.

## Integrated catalog follow-up

The root integration added the complete 51-row rendered editing leaderboard as a separate pool. Ideogram 4.5 Very Low/High is connected there. Design Arena generation retains its original three ranked P-Image settings; the two newer response-only Low/Medium observations remain excluded because no published ranks exist. AA independently supplies all five ranked settings. Configuration membership is in `research/configurations.json`. The separate provider cost charts include all 91 numeric image quotes from this proposal; unpriced or unsupported settings remain in this research only.
