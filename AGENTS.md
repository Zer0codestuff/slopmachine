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
Implemented and locally verified. The initial catalog has 749 observations in 18 pools across Artificial Analysis, Arena, Design Arena, World Model Arena, and Video Arena (MemeBench), with 438 prices or source quotes. Research lives in `research/`; the browser consumes `public/data/catalog.json`. Source observations and leaderboard publication dates must remain distinct. The authorized public repository is `Zer0codestuff/slop-machine`.

## Recent changes
- Added responsive image/video charts, provider filters, confidence intervals, model detail dialogs, linear/log axes, Pareto frontier, sortable tables, and generation-cost estimates.
- Added light/dark themes, keyboard model search, mobile filter focus handling, PNG/CSV/JSON exports, and source metadata in exports.
- Added strict catalog validation, atomic refresh overlays, source research notes, and build CI.
- Final review corrected source switching to retain task families, confidence labels to match available metadata, and PNG exports to retain quantities, source qualifications, metrics, dates, and attribution.
- Visually checked desktop and narrow mobile layouts. A source-reported zero price is retained; zero-price models are excluded from logarithmic axes with a visible notice and included on linear axes.

## Preferences and constraints
- Keep the full-screen chart, narrow model sidebar, black default theme, restrained provider colors, and DM Sans typography.
- Keep different sources, tasks, benchmark versions, and audio conditions in separate scoring pools.
- Attribute every observation. Show missing prices as unavailable and exclude them from cost charts.
- Show Design Arena pricing as source quotes with unspecified resolution/quality. Keep world-model and MemeBench scope qualifications visible.
- Use English throughout. Never use em dash characters.
- Git commits must have Zer0codestuff as their sole author.

## Do not
- Invent scores, prices, latency, environmental estimates, or historical trends.
- Imply a snapshot is a live feed, or that overlapping confidence intervals prove a ranking difference.
- Compare image prices directly with video prices or combine Elo scores from different pools.
- Add decorative imagery, marketing sections, or a second visual identity.
- Publish credentials or authenticated source responses.
- Require an AA API key for this project. The collection workflow uses public browser pages.
- Treat a catalog rebuild as a fresh source collection or automatically publish refreshed data without reviewing its source changes.

## Known limits and next steps
- The bundled data is a dated snapshot. Automated refresh supports AA and Arena; the other source pools require a reviewed manual browser capture.
- Arena's public website can return security verification; use its official public leaderboard dataset as documented.
- Some sources omit confidence intervals, prices, or publication dates. Preserve nulls and source-specific qualifications.
- No hosted website deployment has been requested. `dist/` is ready for static hosting; the local preview uses port 4173.
