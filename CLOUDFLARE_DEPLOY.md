# Deploying to Cloudflare Pages

This repository is a Vite + React app. The included GitHub Actions workflow will build using `npm` (to avoid bun lockfile issues) and deploy the `dist` folder to Cloudflare Pages.

## What I added
- `.github/workflows/deploy-cloudflare-pages.yml` — builds with `npm ci` and `npm run build`, then deploys using the official Cloudflare Pages GitHub Action.

## Required repository secrets
Add these secrets in your GitHub repository (Settings → Secrets → Actions):
- `CF_API_TOKEN` — a Cloudflare API Token with `Account.Pages` and `Zone.DNS` (or minimal Pages deployment) permissions.
- `CF_ACCOUNT_ID` — your Cloudflare account id.
- `CF_PROJECT_NAME` — the Pages project name (as shown in Pages settings). If you prefer, you can leave this blank and configure the Pages project in the Cloudflare UI.

## Pages settings (recommended)
- Build command: `npm run build`
- Install command: `npm ci`
- Output directory: `dist`
- Branch: `main`

## Notes
- This workflow intentionally uses `npm` to avoid `bun install --frozen-lockfile` failures that occurred in the runner.
- If you prefer `pnpm`, replace `npm ci` with `pnpm install` and set up `pnpm` in the runner.

## Local test
```powershell
npm ci
npm run build
# serve dist locally to test
npx serve dist
```

If you'd like, I can also add a small step to invalidate Cloudflare cache or create a preview route for PRs. Let me know which additional features you want.
