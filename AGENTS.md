# Slop Machine

## Purpose and architecture
Slop Machine compares image and video generation models using attributed public benchmark snapshots. It is a static React and TypeScript application built with Vite. The interface follows the compact, chart-first visual direction of Slopalytics.

## Commands
- `npm install`: install dependencies.
- `npm run dev -- --host 0.0.0.0`: start the local application.
- `npm run build`: type-check and create the static production bundle.
- `npm run data:validate`: validate the published benchmark catalog.
- `npm run data:build`: rebuild the catalog from saved research inputs.
- `npm run data:refresh -- --source arena`: acquire official public Arena data into a reviewable overlay.
- `npm run data:refresh -- --source aa`: scrape public AA tables with the optional browser setup in `docs/DATA.md`.

## Current status
Implemented and locally verified. The catalog has 800 observations in 19 pools across Artificial Analysis, Arena, Design Arena, World Model Arena, and Video Arena (MemeBench), with 480 prices or source quotes. A separate provider-pricing input contains 115 quotes in 34 configuration groups. Research lives in `research/`; the browser consumes `public/data/catalog.json`. Source observations and leaderboard publication dates must remain distinct. The authorized public repository is `Zer0codestuff/slopmachine`.

## Recent changes
- Renamed the public repository to `Zer0codestuff/slopmachine` for the requested Pages path. Added artifact-based GitHub Pages publication to the existing CI workflow, with main-only deployment and inherited custom domain. No changes to the existing user-site repository or DNS.
- Replaced the muted provider palette with saturated chart colors, stronger configuration lines, and more opaque cost bars. Light mode uses darker equivalents for readable colored labels. The user rejected washed-out chart colors.
- Added explicit configuration families, low/medium and native-mode filters, connected setting curves, family toggles, sibling details, and configuration metadata in CSV/PNG exports. Defaults include complete measured families, and switching media prefers a pool with measured configuration curves.
- Added the 51-row Design Arena image-editing pool. Refreshed all 82 AA silent I2V rows on October 23, preserving source prices even when they differ from creator lists. The two Kling 3.0 Pro quotes are now $0.112/s; Veo 3.1 Lite has no reported price.
- Added separate provider-setting cost charts and CSV exports for unscored configurations, with source conditions and exact quoted precision.
- The builder merges `research/configurations.json` idempotently after overlays and rejects conflicting definitions or invalid membership. Default data validation also checks `research/configuration-prices.json`.
- Added responsive image/video charts, provider filters, confidence intervals, model detail dialogs, linear/log axes, Pareto frontier, sortable tables, and generation-cost estimates.
- Added light/dark themes, keyboard model search, mobile filter focus handling, PNG/CSV/JSON exports, and source metadata in exports.
- Added strict catalog validation, atomic refresh overlays, source research notes, and build CI.
- Final review corrected source switching to retain task families, confidence labels to match available metadata, and PNG exports to retain quantities, source qualifications, metrics, dates, and attribution.
- Visually checked desktop and narrow mobile layouts. A source-reported zero price is retained; zero-price models are excluded from logarithmic axes with a visible notice and included on linear axes.

## Preferences and constraints
- Keep the full-screen chart, narrow model sidebar, black default theme, vivid, saturated provider colors with theme-aware contrast, and DM Sans typography.
- Keep different sources, tasks, benchmark versions, and audio conditions in separate scoring pools.
- Configuration membership must be explicit and board-local. Connect at least two visible measured points in setting order, including non-monotonic scores. Provider-only prices have no attached Elo score.
- Attribute every observation. Show missing prices as unavailable and exclude them from cost charts.
- Show Design Arena pricing as source quotes with unspecified resolution/quality. Keep world-model and MemeBench scope qualifications visible.
- Use English throughout. Never use em dash characters.
- Git commits must have Zer0codestuff as their sole author.

## Do not
- Invent scores, prices, latency, environmental estimates, or historical trends.
- Infer configuration families from names, relabel Standard/Pro as low/medium reasoning, join cross-source quality levels, or assign ranks to public-response-only rows.
- Imply a snapshot is a live feed, or that overlapping confidence intervals prove a ranking difference.
- Compare image prices directly with video prices or combine Elo scores from different pools.
- Add decorative imagery, marketing sections, or a second visual identity.
- Restore the muted provider palette or weaken series colors with low default opacity.
- Publish credentials or authenticated source responses.
- Require an AA API key for this project. The collection workflow uses public browser pages.
- Treat a catalog rebuild as a fresh source collection or automatically publish refreshed data without reviewing its source changes.

## Known limits and next steps
- The bundled data is a dated snapshot. Automated refresh supports AA and Arena; the other source pools require a reviewed manual browser capture.
- Arena's public website can return security verification; use its official public leaderboard dataset as documented.
- GPT Image 2/2.5 have no verified multi-quality series in a single bundled pool. Their low/medium provider prices appear in the separate unscored chart. Design Arena generation Low/Medium response-only points and historical Arena Grok observations remain research evidence, not ranked catalog entries.
- Some sources omit confidence intervals, prices, or publication dates. Preserve nulls and source-specific qualifications.
- GitHub Pages publication was requested at `https://gabrielemonni.me/slopmachine/`. The public repository is `Zer0codestuff/slopmachine`; Pages inherits the custom domain from the existing user site. The workflow validates and builds once, then publishes the artifact from main. Pages, HTTPS, and the main-only deployment environment are configured; the first live deployment is pending verification. The local preview uses port 4173.
