# GitHub Pages deployment

Target: [https://gabrielemonni.me/slopmachine](https://gabrielemonni.me/slopmachine), published from `Zer0codestuff/slopmachine`.

Published and verified on October 23, 2026. The first deployment of commit `6c8c433` passed both build and deploy jobs: [workflow run](https://github.com/Zer0codestuff/slopmachine/actions/runs/39950817118). The HTTPS target and assets returned successfully. The live 19-pool, 800-observation catalog matches the committed bytes. Image/video configuration curves, setting filters, separate provider quotes, and a 390px mobile viewport were checked in the live browser.

The repository is public, Pages uses GitHub Actions with HTTPS enforced, and the `github-pages` environment permits `main`. The existing user-site repository and DNS were not changed.

## First-time setup

1. Complete the repository rename from `slop-machine` to `slopmachine`.
2. In this repository's **Settings > Pages > Build and deployment**, select **GitHub Actions** as the source. The equivalent initial API command is:

   ```sh
   gh api --method POST repos/Zer0codestuff/slopmachine/pages -f build_type=workflow
   ```

   If Pages is already enabled, use `--method PUT` instead of `POST`.
3. Restrict the `github-pages` environment's deployment branches to `main`. Leave this project's custom domain unset and do not create a `CNAME`. Project Pages [inherits the user site's domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages#using-a-custom-domain-across-multiple-repositories). Keep the existing `Zer0codestuff/Zer0codestuff.github.io` repository, domain, DNS, and HTTPS configuration unchanged.
4. Push the workflow to `main`, or run it manually after it is present there:

   ```sh
   gh workflow run ci.yml --repo Zer0codestuff/slopmachine --ref main
   ```

5. Confirm the `deploy` job succeeds and its environment URL opens the target. Check the directory URL `https://gabrielemonni.me/slopmachine/`, including chart rendering, catalog loading, and bundled assets.

## Workflow and artifact

`.github/workflows/ci.yml` keeps one Node.js 22 build: `npm ci`, `npm run data:validate` for both catalog and provider quotes, then `npm run build`. Pull requests run these checks without uploading or publishing a Pages artifact. Pushes to `main` and manual runs on `main` upload `dist/` and deploy that same artifact. Manual runs on other branches only build.

Only the build job receives `contents: read`. Only the deployment job receives `pages: write` and `id-token: write`. Deployment jobs share a concurrency group with `cancel-in-progress: false`, so active publication is not canceled by another run. The `github-pages` environment displays the deployment action's `page_url` output. Actions are pinned to official release commit SHAs.

Pages serves the contents of `dist/`, not the repository root. No `gh-pages` branch or source-data refresh is involved. The saved benchmark snapshot is validated and bundled as committed. See [GitHub's custom workflow requirements](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Base path

Vite retains `base: './'`. Its [relative base](https://vite.dev/guide/build.html#relative-base) keeps generated asset URLs portable under `/slopmachine/` and other static directories. The workflow does not override the base. The application has no history-based routes, so this deployment needs no routing fallback.
